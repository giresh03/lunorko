import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, CreditCard, TrendingUp, UserCheck, Calendar,
  LayoutDashboard, BookOpen, Shield, Loader2, LogOut,
  Plus, Trash2, Edit, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface AdminStats {
  totalUsers: number;
  totalSubscribers: number;
  totalRevenue: number;
  totalMentors: number;
  totalBookings: number;
}

const AdminPanel = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Mentor form
  const [mentorDialog, setMentorDialog] = useState(false);
  const [editingMentor, setEditingMentor] = useState<any>(null);
  const [mentorForm, setMentorForm] = useState({
    name: "", email: "", company: "", role: "", domain_id: "",
    bio: "", years_experience: 1, meeting_link: "",
    tech_stack: "", career_tips: "", journey_summary: "", college_preparation: "",
  });

  const callAdmin = async (action: string, method = "GET", body?: any) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-dashboard?action=${action}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }
    );
    return res.json();
  };

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/");
      return;
    }
    if (isAdmin) fetchAll();
  }, [isAdmin, adminLoading]);

  const fetchAll = async () => {
    setLoadingData(true);
    try {
      const [statsData, usersData, subsData, mentorsData] = await Promise.all([
        callAdmin("stats"),
        callAdmin("users"),
        callAdmin("subscriptions"),
        callAdmin("mentors"),
      ]);
      setStats(statsData);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setSubscriptions(Array.isArray(subsData) ? subsData : []);
      setMentors(Array.isArray(mentorsData) ? mentorsData : []);
    } catch (e) {
      console.error(e);
    }
    setLoadingData(false);
  };

  const handleSaveMentor = async () => {
    const payload = {
      ...mentorForm,
      years_experience: Number(mentorForm.years_experience),
      tech_stack: mentorForm.tech_stack.split(",").map((s) => s.trim()).filter(Boolean),
    };

    if (editingMentor) {
      await callAdmin("update-mentor", "POST", { id: editingMentor.id, ...payload });
      toast({ title: "Mentor updated" });
    } else {
      await callAdmin("add-mentor", "POST", payload);
      toast({ title: "Mentor added" });
    }
    setMentorDialog(false);
    setEditingMentor(null);
    resetMentorForm();
    fetchAll();
  };

  const handleDeleteMentor = async (id: string) => {
    await callAdmin("delete-mentor", "POST", { id });
    toast({ title: "Mentor deleted" });
    fetchAll();
  };

  const resetMentorForm = () => {
    setMentorForm({ name: "", email: "", company: "", role: "", domain_id: "", bio: "", years_experience: 1, meeting_link: "", tech_stack: "", career_tips: "", journey_summary: "", college_preparation: "" });
  };

  const openEditMentor = (m: any) => {
    setEditingMentor(m);
    setMentorForm({
      name: m.name || "", email: m.email || "", company: m.company || "",
      role: m.role || "", domain_id: m.domain_id || "", bio: m.bio || "",
      years_experience: m.years_experience || 1, meeting_link: m.meeting_link || "",
      tech_stack: (m.tech_stack || []).join(", "),
      career_tips: m.career_tips || "", journey_summary: m.journey_summary || "",
      college_preparation: m.college_preparation || "",
    });
    setMentorDialog(true);
  };

  if (adminLoading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Lunor.AI Admin</h1>
            <Badge variant="outline" className="text-xs">Admin Panel</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Site</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="mr-1 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mb-8">
            {[
              { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
              { label: "Active Subscribers", value: stats.totalSubscribers, icon: UserCheck, color: "text-green-400" },
              { label: "Revenue (₹)", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-yellow-400" },
              { label: "Mentors", value: stats.totalMentors, icon: BookOpen, color: "text-purple-400" },
              { label: "Bookings", value: stats.totalBookings, icon: Calendar, color: "text-pink-400" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview"><LayoutDashboard className="mr-2 h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" /> Users</TabsTrigger>
            <TabsTrigger value="subscriptions"><CreditCard className="mr-2 h-4 w-4" /> Subscriptions</TabsTrigger>
            <TabsTrigger value="mentors"><BookOpen className="mr-2 h-4 w-4" /> Mentors</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Recent Users</h3>
                {users.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.display_name || "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={u.subscription ? "default" : "outline"} className="text-xs">
                      {u.subscription ? u.subscription.plan_id : "Free"}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Recent Subscriptions</h3>
                {subscriptions.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <Badge className="text-xs">{s.plan_id}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">₹{(s.amount / 100).toFixed(0)}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={s.status === "active" ? "default" : "outline"} className="text-xs">{s.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(s.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {subscriptions.length === 0 && <p className="text-sm text-muted-foreground">No subscriptions yet</p>}
              </div>
            </div>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.display_name || "Unnamed"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={u.subscription ? "default" : "outline"} className="text-xs">
                          {u.subscription ? u.subscription.plan_id : "Free"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Subscriptions */}
          <TabsContent value="subscriptions">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell><Badge className="text-xs">{s.plan_id}</Badge></TableCell>
                      <TableCell className="font-medium">₹{(s.amount / 100).toFixed(0)}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === "active" ? "default" : "destructive"} className="text-xs">{s.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(s.started_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(s.expires_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {subscriptions.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No subscriptions yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Mentors */}
          <TabsContent value="mentors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Manage Mentors</h3>
              <Dialog open={mentorDialog} onOpenChange={(open) => { setMentorDialog(open); if (!open) { setEditingMentor(null); resetMentorForm(); } }}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Mentor</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingMentor ? "Edit Mentor" : "Add New Mentor"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm font-medium text-foreground">Name</label><Input value={mentorForm.name} onChange={(e) => setMentorForm({ ...mentorForm, name: e.target.value })} /></div>
                      <div><label className="text-sm font-medium text-foreground">Email</label><Input value={mentorForm.email} onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm font-medium text-foreground">Company</label><Input value={mentorForm.company} onChange={(e) => setMentorForm({ ...mentorForm, company: e.target.value })} /></div>
                      <div><label className="text-sm font-medium text-foreground">Role</label><Input value={mentorForm.role} onChange={(e) => setMentorForm({ ...mentorForm, role: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm font-medium text-foreground">Domain ID</label><Input value={mentorForm.domain_id} onChange={(e) => setMentorForm({ ...mentorForm, domain_id: e.target.value })} placeholder="e.g. web-development" /></div>
                      <div><label className="text-sm font-medium text-foreground">Years of Experience</label><Input type="number" value={mentorForm.years_experience} onChange={(e) => setMentorForm({ ...mentorForm, years_experience: Number(e.target.value) })} /></div>
                    </div>
                    <div><label className="text-sm font-medium text-foreground">Bio</label><Textarea value={mentorForm.bio} onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })} /></div>
                    <div><label className="text-sm font-medium text-foreground">Tech Stack (comma separated)</label><Input value={mentorForm.tech_stack} onChange={(e) => setMentorForm({ ...mentorForm, tech_stack: e.target.value })} placeholder="React, Node.js, Python" /></div>
                    <div><label className="text-sm font-medium text-foreground">Meeting Link</label><Input value={mentorForm.meeting_link} onChange={(e) => setMentorForm({ ...mentorForm, meeting_link: e.target.value })} /></div>
                    <div><label className="text-sm font-medium text-foreground">Career Tips</label><Textarea value={mentorForm.career_tips} onChange={(e) => setMentorForm({ ...mentorForm, career_tips: e.target.value })} /></div>
                    <div><label className="text-sm font-medium text-foreground">Journey Summary</label><Textarea value={mentorForm.journey_summary} onChange={(e) => setMentorForm({ ...mentorForm, journey_summary: e.target.value })} /></div>
                    <div><label className="text-sm font-medium text-foreground">College Preparation</label><Textarea value={mentorForm.college_preparation} onChange={(e) => setMentorForm({ ...mentorForm, college_preparation: e.target.value })} /></div>
                    <Button onClick={handleSaveMentor}>{editingMentor ? "Update Mentor" : "Add Mentor"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mentors.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="text-muted-foreground">{m.company}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{m.domain_id}</Badge></TableCell>
                      <TableCell>{m.years_experience} yrs</TableCell>
                      <TableCell>
                        <Badge variant={m.is_active ? "default" : "destructive"} className="text-xs">
                          {m.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditMentor(m)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteMentor(m.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {mentors.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No mentors yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
