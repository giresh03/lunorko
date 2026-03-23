import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, MapPin, ExternalLink, Trophy, ShoppingBag, Loader2, CheckCircle2, Lock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Hackathon = {
  id: string;
  title: string;
  description: string | null;
  location_label: string | null;
  is_online: boolean;
  start_date: string | null;
  end_date: string | null;
  registration_url: string | null;
  website_url: string | null;
  banner_image_url: string | null;
};

type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  team_winner_name: string | null;
  price_paise: number;
  preview_image_url: string | null;
  tech_stack: string | null;
  hackathon_id: string | null;
  hackathons: { id: string; title: string } | null;
};

const loadRazorpayScript = (): Promise<void> =>
  new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });

export default function Hackathons() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [deliverables, setDeliverables] = useState<Record<string, { deliverable_url: string | null; access_instructions: string | null }>>({});
  const [payingId, setPayingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: h }, { data: rawProjects }] = await Promise.all([
        supabase.from("hackathons").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase
          .from("hackathon_projects")
          .select("id, title, description, team_winner_name, price_paise, preview_image_url, tech_stack, hackathon_id")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);
      setHackathons((h as Hackathon[]) || []);
      const plist = rawProjects || [];
      const hidSet = [...new Set(plist.map((x: { hackathon_id: string | null }) => x.hackathon_id).filter(Boolean))] as string[];
      let hTitle: Record<string, string> = {};
      if (hidSet.length) {
        const { data: ht } = await supabase.from("hackathons").select("id, title").in("id", hidSet);
        (ht || []).forEach((row: { id: string; title: string }) => { hTitle[row.id] = row.title; });
      }
      const enriched: ProjectRow[] = plist.map((x: ProjectRow) => ({
        ...x,
        hackathons: x.hackathon_id && hTitle[x.hackathon_id] ? { id: x.hackathon_id, title: hTitle[x.hackathon_id] } : null,
      }));
      setProjects(enriched);

      if (user) {
        const { data: buys } = await supabase.from("hackathon_purchases").select("project_id").eq("user_id", user.id);
        const ids = new Set((buys || []).map((b: { project_id: string }) => b.project_id));
        setOwnedIds(ids);
        const del: Record<string, { deliverable_url: string | null; access_instructions: string | null }> = {};
        for (const pid of ids) {
          const { data: d } = await supabase.from("hackathon_project_deliverables").select("*").eq("project_id", pid).maybeSingle();
          if (d) del[pid] = { deliverable_url: d.deliverable_url, access_instructions: d.access_instructions };
        }
        setDeliverables(del);
      } else {
        setOwnedIds(new Set());
        setDeliverables({});
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not load hackathons");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const buyProject = async (proj: ProjectRow) => {
    if (!user) {
      toast.error("Sign in to purchase");
      return;
    }
    if (ownedIds.has(proj.id)) {
      toast.info("You already own this project");
      return;
    }
    setPayingId(proj.id);
    try {
      const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
        body: { hackathon_project_id: proj.id },
      });
      if (orderError) throw orderError;
      const od = orderData as { order_id?: string; key_id?: string; error?: string; amount?: number };
      if (od.error) throw new Error(od.error);
      if (!od.order_id || !od.key_id) throw new Error("Invalid order response");

      await loadRazorpayScript();
      const Rzp = (window as unknown as { Razorpay: new (opts: Record<string, unknown>) => { open: () => void; on: (ev: string, fn: () => void) => void } }).Razorpay;
      const rzp = new Rzp({
        key: od.key_id,
        amount: od.amount ?? proj.price_paise,
        currency: "INR",
        order_id: od.order_id,
        name: "Lunor.AI",
        description: `Hackathon project: ${proj.title}`,
        prefill: { email: user.email || undefined },
        modal: { ondismiss: () => setPayingId(null) },
        handler: async (res: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
              body: {
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_order_id: res.razorpay_order_id,
                razorpay_signature: res.razorpay_signature,
              },
            });
            if (verifyError) throw verifyError;
            const v = verifyData as { success?: boolean; error?: string };
            if (!v.success) throw new Error(v.error || "Verification failed");
            toast.success("Purchase complete! Your download access is unlocked below.");
            await load();
          } catch (err: unknown) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Payment verification failed");
          } finally {
            setPayingId(null);
          }
        },
      });
      rzp.on("payment.failed", () => {
        toast.error("Payment failed or cancelled");
        setPayingId(null);
      });
      rzp.open();
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not start payment");
      setPayingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Badge variant="secondary" className="mb-3">Global</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center justify-center gap-2">
            <Trophy className="h-9 w-9 text-amber-500" /> Hackathons & winner projects
          </h1>
          <p className="mt-3 text-muted-foreground">
            Discover hackathons around the world and buy source access to winning projects — powered by Razorpay (INR).
          </p>
          {!user && (
            <Button asChild className="mt-4" variant="outline">
              <Link to="/auth">Sign in to purchase projects</Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <section className="mb-16">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Hackathons happening worldwide
              </h2>
              {hackathons.length === 0 ? (
                <p className="text-muted-foreground text-sm">No hackathons listed yet — check back soon.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {hackathons.map((ev) => (
                    <Card key={ev.id} className="overflow-hidden border-border bg-card">
                      {ev.banner_image_url && (
                        <div className="h-36 w-full overflow-hidden bg-muted">
                          <img src={ev.banner_image_url} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">{ev.title}</CardTitle>
                        {ev.description && <CardDescription className="line-clamp-3">{ev.description}</CardDescription>}
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex flex-wrap gap-2 text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {ev.is_online ? "Online" : ev.location_label || "Location TBA"}
                          </span>
                          {(ev.start_date || ev.end_date) && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {ev.start_date && new Date(ev.start_date).toLocaleDateString()}
                              {ev.end_date && ` – ${new Date(ev.end_date).toLocaleDateString()}`}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ev.registration_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={ev.registration_url} target="_blank" rel="noopener noreferrer">
                                Register <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                          {ev.website_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={ev.website_url} target="_blank" rel="noopener noreferrer">
                                Website <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" /> Winner projects for sale
              </h2>
              {projects.length === 0 ? (
                <p className="text-muted-foreground text-sm">No projects on sale yet.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((proj) => {
                    const owned = ownedIds.has(proj.id);
                    const del = deliverables[proj.id];
                    return (
                      <Card key={proj.id} className="flex flex-col border-border bg-card">
                        {proj.preview_image_url && (
                          <div className="h-40 w-full overflow-hidden bg-muted rounded-t-lg">
                            <img src={proj.preview_image_url} alt="" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <CardHeader className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base leading-snug">{proj.title}</CardTitle>
                            <Badge variant="secondary" className="shrink-0">₹{(proj.price_paise / 100).toFixed(0)}</Badge>
                          </div>
                          {proj.hackathons?.title && (
                            <CardDescription className="text-xs">From: {proj.hackathons.title}</CardDescription>
                          )}
                          {proj.team_winner_name && (
                            <p className="text-xs text-muted-foreground">Winner team: {proj.team_winner_name}</p>
                          )}
                          {proj.description && <CardDescription className="line-clamp-4 mt-1">{proj.description}</CardDescription>}
                          {proj.tech_stack && (
                            <p className="text-[11px] text-muted-foreground mt-2">Stack: {proj.tech_stack}</p>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          {owned ? (
                            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
                              <p className="text-xs font-medium text-primary flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" /> You own this project
                              </p>
                              {del?.deliverable_url ? (
                                <Button size="sm" className="w-full" asChild>
                                  <a href={del.deliverable_url} target="_blank" rel="noopener noreferrer">
                                    Open deliverable <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </Button>
                              ) : (
                                <p className="text-xs text-muted-foreground">Admin will attach the download link — contact support if missing.</p>
                              )}
                              {del?.access_instructions && (
                                <p className="text-[11px] text-muted-foreground whitespace-pre-wrap">{del.access_instructions}</p>
                              )}
                            </div>
                          ) : (
                            <>
                              <Button
                                className="w-full"
                                disabled={!!payingId}
                                onClick={() => buyProject(proj)}
                              >
                                {payingId === proj.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Lock className="h-4 w-4 mr-2" />
                                )}
                                Buy with Razorpay
                              </Button>
                              <p className="text-[10px] text-center text-muted-foreground">Secure checkout · INR only</p>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
