import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ExternalLink, Globe, Loader2, MapPin, ShoppingCart, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      amount: number;
      currency: string;
      order_id: string;
      name: string;
      description: string;
      prefill?: { email?: string };
      modal?: { ondismiss?: () => void };
      handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
    }) => {
      on: (event: string, handler: () => void) => void;
      open: () => void;
    };
  }
}

type Hackathon = {
  id: string;
  title: string;
  organizer: string;
  location: string;
  mode: "online" | "offline" | "hybrid";
  start_date: string;
  end_date: string;
  registration_deadline: string | null;
  prize_pool: string | null;
  website_url: string;
  banner_url: string | null;
  description: string | null;
};

type HackathonProject = {
  id: string;
  title: string;
  summary: string | null;
  winner_name: string | null;
  tech_stack: string[] | null;
  team_size: number;
  max_buyers: number;
  buyers_count: number;
  price: number;
  preview_url: string | null;
  repository_url: string | null;
  thumbnail_url: string | null;
  hackathons?: { title: string } | null;
};

type PurchaseRecord = {
  project_id: string;
  created_at: string;
};

const loadRazorpayScript = (): Promise<void> =>
  new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });

const Hackathons = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [projects, setProjects] = useState<HackathonProject[]>([]);
  const [ownedProjectIds, setOwnedProjectIds] = useState<string[]>([]);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hackathonsRes, projectsRes, purchasesRes] = await Promise.all([
        supabase
          .from("hackathons")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("start_date", { ascending: true }),
        supabase
          .from("hackathon_projects")
          .select("*, hackathons(title)")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
        user
          ? supabase
              .from("hackathon_project_purchases")
              .select("project_id, created_at")
              .eq("user_id", user.id)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (hackathonsRes.error) throw hackathonsRes.error;
      if (projectsRes.error) throw projectsRes.error;
      if ((purchasesRes as any).error) throw (purchasesRes as any).error;

      setHackathons((hackathonsRes.data as Hackathon[]) || []);
      setProjects((projectsRes.data as HackathonProject[]) || []);
      const purchases = (((purchasesRes as any).data as PurchaseRecord[]) || []);
      setPurchaseRecords(purchases);
      setOwnedProjectIds(purchases.map((row) => row.project_id));
    } catch (err: any) {
      toast.error(err?.message || "Failed to load hackathons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const totalSold = useMemo(
    () => projects.reduce((sum, project) => sum + (project.buyers_count || 0), 0),
    [projects]
  );

  const myPurchasedProjects = useMemo(() => {
    if (!user || ownedProjectIds.length === 0) return [];
    return projects
      .filter((project) => ownedProjectIds.includes(project.id))
      .map((project) => ({
        ...project,
        purchasedAt:
          purchaseRecords.find((purchase) => purchase.project_id === project.id)?.created_at || null,
      }));
  }, [projects, ownedProjectIds, purchaseRecords, user]);

  const handleBuyProject = async (project: HackathonProject) => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    if (ownedProjectIds.includes(project.id)) {
      toast.success("You already purchased this project");
      return;
    }
    if ((project.max_buyers || 0) > 0 && (project.buyers_count || 0) >= (project.max_buyers || 0)) {
      toast.error("This project is sold out");
      return;
    }

    setBuyingId(project.id);
    try {
      const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          purchase_type: "hackathon_project",
          project_id: project.id,
        },
      });
      if (orderError) throw orderError;

      const { order_id, key_id } = (orderData || {}) as { order_id?: string; key_id?: string };
      if (!order_id || !key_id) {
        throw new Error("Invalid Razorpay response");
      }

      await loadRazorpayScript();

      const rzp = new (window as any).Razorpay({
        key: key_id,
        amount: project.price,
        currency: "INR",
        order_id,
        name: "Lunor.AI",
        description: `Buy winner project: ${project.title}`,
        prefill: { email: user.email || undefined },
        modal: { ondismiss: () => setBuyingId(null) },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            const { error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
              body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (verifyError) throw verifyError;
            toast.success("Project purchased successfully");
            await fetchData();
          } catch (err: any) {
            toast.error(err?.message || "Payment verification failed");
          } finally {
            setBuyingId(null);
          }
        },
      });

      rzp.on("payment.failed", () => {
        toast.error("Payment failed or cancelled");
        setBuyingId(null);
      });

      rzp.open();
    } catch (err: any) {
      toast.error(err?.message || "Failed to start payment");
      setBuyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="mb-10 text-center">
          <Badge variant="outline" className="mb-4">Hackathons</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Global Hackathons & Winner Projects</h1>
          <p className="mt-3 text-muted-foreground max-w-3xl mx-auto">
            Browse active hackathons happening worldwide and buy production-ready winner projects.
            All listings are managed from the admin panel.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Badge variant="secondary">{hackathons.length} active hackathons</Badge>
            <Badge variant="secondary">{projects.length} projects for sale</Badge>
            <Badge variant="secondary">{totalSold} purchases completed</Badge>
          </div>
        </div>

        <section className="mb-14">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Hackathons Across the Globe</h2>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading hackathons...</div>
          ) : hackathons.length === 0 ? (
            <Card><CardContent className="py-8 text-muted-foreground">No hackathons available yet.</CardContent></Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {hackathons.map((hackathon) => (
                <Card key={hackathon.id} className="overflow-hidden border-border">
                  {hackathon.banner_url && (
                    <img src={hackathon.banner_url} alt={hackathon.title} className="h-44 w-full object-cover" />
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{hackathon.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">{hackathon.organizer}</Badge>
                      <Badge variant="outline" className="capitalize">{hackathon.mode}</Badge>
                      <Badge variant="outline">{hackathon.prize_pool || "Prize details on website"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{hackathon.description}</p>
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {hackathon.location}</div>
                      <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> Registration closes: {hackathon.registration_deadline ? new Date(hackathon.registration_deadline).toLocaleDateString() : "Check website"}</div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={hackathon.website_url} target="_blank" rel="noreferrer">
                        Visit Official Site <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          {user && (
            <div className="mb-12">
              <div className="mb-5 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">My Purchased Projects</h2>
              </div>
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading your purchases...</div>
              ) : myPurchasedProjects.length === 0 ? (
                <Card><CardContent className="py-8 text-muted-foreground">You have not purchased any project yet.</CardContent></Card>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {myPurchasedProjects.map((project) => (
                    <Card key={project.id} className="overflow-hidden border-border">
                      {project.thumbnail_url && (
                        <img src={project.thumbnail_url} alt={project.title} className="h-36 w-full object-cover" />
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline">{project.hackathons?.title || "Hackathon Winner"}</Badge>
                          <Badge variant="secondary">Purchased</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{project.summary || "No summary provided."}</p>
                        <p className="text-xs text-muted-foreground">
                          Bought on: {project.purchasedAt ? new Date(project.purchasedAt).toLocaleDateString() : "—"}
                        </p>
                        <div className="flex gap-2">
                          {project.preview_url && (
                            <Button variant="outline" className="flex-1" asChild>
                              <a href={project.preview_url} target="_blank" rel="noreferrer">
                                Open Preview <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {project.repository_url && (
                            <Button className="flex-1" asChild>
                              <a href={project.repository_url} target="_blank" rel="noreferrer">
                                Repository <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mb-5 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Buy Hackathon Winner Projects</h2>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading projects...</div>
          ) : projects.length === 0 ? (
            <Card><CardContent className="py-8 text-muted-foreground">No projects available yet.</CardContent></Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const soldOut = (project.max_buyers || 0) > 0 && (project.buyers_count || 0) >= (project.max_buyers || 0);
                const owned = ownedProjectIds.includes(project.id);
                return (
                  <Card key={project.id} className="overflow-hidden border-border">
                    {project.thumbnail_url && (
                      <img src={project.thumbnail_url} alt={project.title} className="h-40 w-full object-cover" />
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline">{project.hackathons?.title || "Hackathon Winner"}</Badge>
                        <Badge variant="secondary">{project.winner_name || "Winner Team"}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{project.summary || "No description provided."}</p>
                      <div className="flex flex-wrap gap-1">
                        {(project.tech_stack || []).slice(0, 4).map((stack) => (
                          <Badge key={stack} variant="outline" className="text-xs">{stack}</Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-md bg-muted/40 p-2">
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-semibold text-foreground">₹{(project.price / 100).toLocaleString()}</p>
                        </div>
                        <div className="rounded-md bg-muted/40 p-2">
                          <p className="text-muted-foreground flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Buyers</p>
                          <p className="font-semibold text-foreground">
                            {project.buyers_count || 0}
                            {project.max_buyers > 0 ? ` / ${project.max_buyers}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {project.preview_url && (
                          <Button variant="outline" className="flex-1" asChild>
                            <a href={project.preview_url} target="_blank" rel="noreferrer">
                              Preview <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          className="flex-1"
                          disabled={buyingId === project.id || soldOut || owned || !user}
                          onClick={() => handleBuyProject(project)}
                        >
                          {buyingId === project.id ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</>
                          ) : owned ? (
                            "Purchased"
                          ) : soldOut ? (
                            "Sold Out"
                          ) : !user ? (
                            "Sign in to buy"
                          ) : (
                            <><ShoppingCart className="mr-2 h-4 w-4" /> Buy</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Hackathons;
