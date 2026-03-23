import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2, RefreshCw, Trophy, ShoppingBag, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type CallAdmin = (action: string, method?: string, body?: Record<string, unknown>) => Promise<unknown>;

export default function AdminHackathonsSection({ callAdmin }: { callAdmin: CallAdmin }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [h, p, pur, st] = await Promise.all([
        callAdmin("hackathons"),
        callAdmin("hackathon-projects"),
        callAdmin("hackathon-purchases"),
        callAdmin("hackathon-project-stats"),
      ]);
      setHackathons(Array.isArray(h) ? h : []);
      setProjects(Array.isArray(p) ? p : []);
      setPurchases(Array.isArray(pur) ? pur : []);
      setStats(Array.isArray(st) ? st : []);
    } catch (e: any) {
      toast({ title: "Failed to load hackathons", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [callAdmin, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const [hackDialog, setHackDialog] = useState(false);
  const [editingHack, setEditingHack] = useState<any>(null);
  const [hackForm, setHackForm] = useState({
    title: "",
    description: "",
    location_label: "",
    is_online: false,
    start_date: "",
    end_date: "",
    registration_url: "",
    website_url: "",
    banner_image_url: "",
    sort_order: 0,
    is_active: true,
  });

  const [projDialog, setProjDialog] = useState(false);
  const [editingProj, setEditingProj] = useState<any>(null);
  const [projForm, setProjForm] = useState({
    hackathon_id: "",
    title: "",
    description: "",
    team_winner_name: "",
    price_rupees: "",
    preview_image_url: "",
    tech_stack: "",
    deliverable_url: "",
    access_instructions: "",
    sort_order: 0,
    is_active: true,
  });

  const saveHackathon = async () => {
    try {
      if (editingHack) {
        await callAdmin("update-hackathon", "POST", { action: "update-hackathon", id: editingHack.id, ...hackForm });
        toast({ title: "Hackathon updated" });
      } else {
        await callAdmin("add-hackathon", "POST", { action: "add-hackathon", ...hackForm });
        toast({ title: "Hackathon added" });
      }
      setHackDialog(false);
      setEditingHack(null);
      setHackForm({
        title: "", description: "", location_label: "", is_online: false,
        start_date: "", end_date: "", registration_url: "", website_url: "",
        banner_image_url: "", sort_order: 0, is_active: true,
      });
      load();
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message, variant: "destructive" });
    }
  };

  const deleteHackathon = async (id: string) => {
    if (!confirm("Delete this hackathon? Linked projects will be unlinked.")) return;
    try {
      await callAdmin("delete-hackathon", "POST", { action: "delete-hackathon", id });
      toast({ title: "Deleted" });
      load();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message, variant: "destructive" });
    }
  };

  const saveProject = async () => {
    const price_paise = Math.round(parseFloat(projForm.price_rupees || "0") * 100);
    if (!projForm.title.trim() || price_paise <= 0) {
      toast({ title: "Title and price (₹) required", variant: "destructive" });
      return;
    }
    try {
      const payload: Record<string, unknown> = {
        title: projForm.title,
        description: projForm.description || null,
        team_winner_name: projForm.team_winner_name || null,
        price_paise,
        preview_image_url: projForm.preview_image_url || null,
        tech_stack: projForm.tech_stack || null,
        sort_order: projForm.sort_order,
        is_active: projForm.is_active,
        hackathon_id: projForm.hackathon_id || null,
        deliverable_url: projForm.deliverable_url || null,
        access_instructions: projForm.access_instructions || null,
      };
      if (editingProj) {
        await callAdmin("update-hackathon-project", "POST", { action: "update-hackathon-project", id: editingProj.id, ...payload });
        toast({ title: "Project updated" });
      } else {
        await callAdmin("add-hackathon-project", "POST", { action: "add-hackathon-project", ...payload });
        toast({ title: "Project added" });
      }
      setProjDialog(false);
      setEditingProj(null);
      setProjForm({
        hackathon_id: "", title: "", description: "", team_winner_name: "", price_rupees: "",
        preview_image_url: "", tech_stack: "", deliverable_url: "", access_instructions: "",
        sort_order: 0, is_active: true,
      });
      load();
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message, variant: "destructive" });
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project? Only allowed if there are no purchases.")) return;
    try {
      await callAdmin("delete-hackathon-project", "POST", { action: "delete-hackathon-project", id });
      toast({ title: "Deleted" });
      load();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message, variant: "destructive" });
    }
  };

  const openEditHack = (h: any) => {
    setEditingHack(h);
    setHackForm({
      title: h.title || "",
      description: h.description || "",
      location_label: h.location_label || "",
      is_online: !!h.is_online,
      start_date: h.start_date ? h.start_date.slice(0, 10) : "",
      end_date: h.end_date ? h.end_date.slice(0, 10) : "",
      registration_url: h.registration_url || "",
      website_url: h.website_url || "",
      banner_image_url: h.banner_image_url || "",
      sort_order: h.sort_order ?? 0,
      is_active: h.is_active ?? true,
    });
    setHackDialog(true);
  };

  const openEditProj = (p: any) => {
    setEditingProj(p);
    setProjForm({
      hackathon_id: p.hackathon_id || "",
      title: p.title || "",
      description: p.description || "",
      team_winner_name: p.team_winner_name || "",
      price_rupees: p.price_paise ? String(p.price_paise / 100) : "",
      preview_image_url: p.preview_image_url || "",
      tech_stack: p.tech_stack || "",
      deliverable_url: p.deliverable_url || "",
      access_instructions: p.access_instructions || "",
      sort_order: p.sort_order ?? 0,
      is_active: p.is_active ?? true,
    });
    setProjDialog(true);
  };

  if (loading && hackathons.length === 0 && projects.length === 0) {
    return (
      <div className="flex justify-center py-12 text-muted-foreground">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" /> Hackathons & marketplace
        </h3>
        <Button variant="outline" size="sm" onClick={() => load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events"><Trophy className="h-4 w-4 mr-1" /> Events</TabsTrigger>
          <TabsTrigger value="projects"><ShoppingBag className="h-4 w-4 mr-1" /> Projects for sale</TabsTrigger>
          <TabsTrigger value="sales"><BarChart3 className="h-4 w-4 mr-1" /> Sales & stats</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={hackDialog} onOpenChange={(o) => { setHackDialog(o); if (!o) { setEditingHack(null); setHackForm({
              title: "", description: "", location_label: "", is_online: false,
              start_date: "", end_date: "", registration_url: "", website_url: "",
              banner_image_url: "", sort_order: 0, is_active: true,
            }); } }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add hackathon</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingHack ? "Edit hackathon" : "Add hackathon"}</DialogTitle></DialogHeader>
                <div className="grid gap-3 py-2">
                  <div><label className="text-xs font-medium">Title *</label><Input value={hackForm.title} onChange={(e) => setHackForm({ ...hackForm, title: e.target.value })} /></div>
                  <div><label className="text-xs font-medium">Description</label><Textarea value={hackForm.description} onChange={(e) => setHackForm({ ...hackForm, description: e.target.value })} rows={3} /></div>
                  <div><label className="text-xs font-medium">Location / region</label><Input value={hackForm.location_label} onChange={(e) => setHackForm({ ...hackForm, location_label: e.target.value })} placeholder="e.g. Bengaluru, India or Global" /></div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hackForm.is_online} onChange={(e) => setHackForm({ ...hackForm, is_online: e.target.checked })} /> Online event</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs font-medium">Start date</label><Input type="date" value={hackForm.start_date} onChange={(e) => setHackForm({ ...hackForm, start_date: e.target.value })} /></div>
                    <div><label className="text-xs font-medium">End date</label><Input type="date" value={hackForm.end_date} onChange={(e) => setHackForm({ ...hackForm, end_date: e.target.value })} /></div>
                  </div>
                  <div><label className="text-xs font-medium">Registration URL</label><Input value={hackForm.registration_url} onChange={(e) => setHackForm({ ...hackForm, registration_url: e.target.value })} /></div>
                  <div><label className="text-xs font-medium">Website URL</label><Input value={hackForm.website_url} onChange={(e) => setHackForm({ ...hackForm, website_url: e.target.value })} /></div>
                  <div><label className="text-xs font-medium">Banner image URL</label><Input value={hackForm.banner_image_url} onChange={(e) => setHackForm({ ...hackForm, banner_image_url: e.target.value })} /></div>
                  <div><label className="text-xs font-medium">Sort order</label><Input type="number" value={hackForm.sort_order} onChange={(e) => setHackForm({ ...hackForm, sort_order: Number(e.target.value) })} /></div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hackForm.is_active} onChange={(e) => setHackForm({ ...hackForm, is_active: e.target.checked })} /> Active (visible on site)</label>
                  <Button onClick={saveHackathon}>{editingHack ? "Update" : "Create"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hackathons.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{h.is_online ? "Online" : (h.location_label || "—")}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {h.start_date && new Date(h.start_date).toLocaleDateString()} — {h.end_date && new Date(h.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell><Badge variant={h.is_active ? "default" : "secondary"}>{h.is_active ? "Yes" : "No"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditHack(h)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteHackathon(h.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {hackathons.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No hackathons yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={projDialog} onOpenChange={(o) => { setProjDialog(o); if (!o) { setEditingProj(null); setProjForm({
              hackathon_id: "", title: "", description: "", team_winner_name: "", price_rupees: "",
              preview_image_url: "", tech_stack: "", deliverable_url: "", access_instructions: "",
              sort_order: 0, is_active: true,
            }); } }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add winner project</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingProj ? "Edit project" : "Add winner project"}</DialogTitle></DialogHeader>
                <p className="text-xs text-muted-foreground">Set price in ₹. After purchase, buyers see the deliverable link & instructions below.</p>
                <div className="grid gap-3 py-2">
                  <div>
                    <label className="text-xs font-medium">Link to hackathon (optional)</label>
                    <select className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm" value={projForm.hackathon_id} onChange={(e) => setProjForm({ ...projForm, hackathon_id: e.target.value })}>
                      <option value="">— Standalone listing —</option>
                      {hackathons.map((h) => <option key={h.id} value={h.id}>{h.title}</option>)}
                    </select>
                  </div>
                  <div><label className="text-xs font-medium">Project title *</label><Input value={projForm.title} onChange={(e) => setProjForm({ ...projForm, title: e.target.value })} /></div>
                  <div><label className="text-xs font-medium">Description</label><Textarea value={projForm.description} onChange={(e) => setProjForm({ ...projForm, description: e.target.value })} rows={3} /></div>
                  <div><label className="text-xs font-medium">Winning team name</label><Input value={projForm.team_winner_name} onChange={(e) => setProjForm({ ...projForm, team_winner_name: e.target.value })} /></div>
                  <div><label className="text-xs font-medium">Price (₹ INR) *</label><Input type="number" min="1" step="1" value={projForm.price_rupees} onChange={(e) => setProjForm({ ...projForm, price_rupees: e.target.value })} /></div>
                  <div><label className="text-xs font-medium">Preview image URL</label><Input value={projForm.preview_image_url} onChange={(e) => setProjForm({ ...projForm, preview_image_url: e.target.value })} /></div>
                  <div><label className="text-xs font-medium">Tech stack</label><Input value={projForm.tech_stack} onChange={(e) => setProjForm({ ...projForm, tech_stack: e.target.value })} placeholder="e.g. React, Node, Supabase" /></div>
                  <div><label className="text-xs font-medium">Deliverable URL (GitHub Drive, etc.)</label><Input value={projForm.deliverable_url} onChange={(e) => setProjForm({ ...projForm, deliverable_url: e.target.value })} /></div>
                  <div><label className="text-xs font-medium">Access instructions</label><Textarea value={projForm.access_instructions} onChange={(e) => setProjForm({ ...projForm, access_instructions: e.target.value })} rows={2} placeholder="How to run, license notes..." /></div>
                  <div><label className="text-xs font-medium">Sort order</label><Input type="number" value={projForm.sort_order} onChange={(e) => setProjForm({ ...projForm, sort_order: Number(e.target.value) })} /></div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={projForm.is_active} onChange={(e) => setProjForm({ ...projForm, is_active: e.target.checked })} /> Listed for sale</label>
                  <Button onClick={saveProject}>{editingProj ? "Update" : "Create"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Hackathon</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Listed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium max-w-[160px] truncate">{p.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.hackathons?.title || "—"}</TableCell>
                    <TableCell className="text-xs">{p.team_winner_name || "—"}</TableCell>
                    <TableCell>₹{(p.price_paise / 100).toFixed(0)}</TableCell>
                    <TableCell><Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Yes" : "No"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditProj(p)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProject(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {projects.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No projects yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="mt-4 space-y-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <h4 className="text-sm font-semibold p-4 border-b border-border">Purchases per project</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Price (list)</TableHead>
                  <TableHead>Buyers</TableHead>
                  <TableHead>Revenue (₹)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((s) => (
                  <TableRow key={s.project_id}>
                    <TableCell className="font-medium">{s.title}</TableCell>
                    <TableCell>₹{(s.price_paise / 100).toFixed(0)}</TableCell>
                    <TableCell className="font-mono">{s.purchase_count}</TableCell>
                    <TableCell className="font-mono">₹{(s.revenue_paise / 100).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={s.is_active ? "outline" : "secondary"}>{s.is_active ? "Listed" : "Hidden"}</Badge></TableCell>
                  </TableRow>
                ))}
                {stats.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No data</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <h4 className="text-sm font-semibold p-4 border-b border-border">Recent purchases</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Buyer email</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell className="text-xs text-muted-foreground">{new Date(x.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{x.email}</TableCell>
                    <TableCell className="text-sm">{x.project_title}</TableCell>
                    <TableCell>₹{(x.amount_paise / 100).toFixed(0)}</TableCell>
                    <TableCell className="text-[10px] font-mono truncate max-w-[100px]">{x.razorpay_payment_id || "—"}</TableCell>
                  </TableRow>
                ))}
                {purchases.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No purchases yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
