import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, CreditCard, TrendingUp, UserCheck, Calendar,
  LayoutDashboard, Shield, Loader2, LogOut,
  Plus, Trash2, Edit, ArrowLeft, Eye, Mail, Clock, User,
  CheckCircle, XCircle, Receipt, Video, Megaphone,
  MessageSquare, Ban, UserPlus, Briefcase, FileText, Lock, Globe, Database, Server
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminPanelCard, VisitorsAreaChart, RevenueBarChart, PlanDonutChart } from "@/components/admin/AdminCharts";
import { AITrainingDataCard } from "@/components/admin/AITrainingDataCard";

import { SystemControl } from "@/components/admin/SystemControl";

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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface AdminStats {
  totalVisitors: number;
  totalUsers: number;
  totalPaidUsers: number;
  totalRevenue: number;
  totalBookings: number;
}

const AdminPanel = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [visitorTrends, setVisitorTrends] = useState<{ visit_date: string; visitor_count: number }[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [popAds, setPopAds] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [communityGuidelines, setCommunityGuidelines] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [internshipApps, setInternshipApps] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [clearChatsOpen, setClearChatsOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const viewResume = async (path: string) => {
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(path, 300);
    if (error || !data?.signedUrl) {
      toast({ title: "Could not open resume", description: error?.message || "File missing", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const setInternshipStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("internship_applications").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Could not update status", description: error.message, variant: "destructive" });
      return;
    }
    setInternshipApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    toast({ title: `Application marked ${status}` });
  };

  // Resource form
  const [resourceDialog, setResourceDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [resourceForm, setResourceForm] = useState({
    domain_id: "web-development", title: "", resource_type: "video" as "video" | "article" | "course" | "material" | "pdf",
    source: "Custom", url: "", duration: "", thumbnail: "", description: "", sort_order: 0,
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Pop ad form
  const [popAdDialog, setPopAdDialog] = useState(false);
  const [editingPopAd, setEditingPopAd] = useState<any>(null);
  const [popAdForm, setPopAdForm] = useState({
    title: "", image_url: "", link_url: "", festival_name: "",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    is_active: true, sort_order: 0,
  });

  const [guidelineDialog, setGuidelineDialog] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState<any>(null);
  const [guidelineForm, setGuidelineForm] = useState({ domain_id: "", guideline_text: "", sort_order: 0 });

  const callAdmin = async (action: string, method = "GET", body?: any) => {
    const runRequest = async (accessToken: string) =>
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-dashboard?action=${action}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

    const { data: sessionData } = await supabase.auth.getSession();
    let token = sessionData?.session?.access_token;

    if (!token) {
      throw new Error("Session expired. Please sign in again.");
    }

    let res = await runRequest(token);

    if (res.status === 401) {
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
      token = refreshed?.session?.access_token;

      if (refreshError || !token) {
        await supabase.auth.signOut();
        throw new Error("Session expired. Please sign in again.");
      }

      res = await runRequest(token);
    }

    const raw = await res.text();
    const parsed = raw ? (() => {
      try {
        return JSON.parse(raw);
      } catch {
        return { error: raw };
      }
    })() : null;

    if (!res.ok) {
      if (res.status === 401) {
        await supabase.auth.signOut();
        throw new Error("Session expired. Please sign in again.");
      }
      throw new Error(parsed?.error || `Request failed (${res.status})`);
    }

    return parsed;
  };

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/");
      return;
    }
    if (isAdmin) fetchAll();
  }, [isAdmin, adminLoading]);

  const loadChatMessages = async () => {
    const { data } = await supabase
      .from("community_messages")
      .select("id, user_id, domain_id, content, message_type, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    const rows = data ?? [];
    const ids = [...new Set(rows.map((r) => r.user_id))];
    let nameMap: Record<string, string> = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from("public_profiles")
        .select("user_id, display_name, username")
        .in("user_id", ids);
      nameMap = Object.fromEntries((profs ?? []).map((p: any) => [p.user_id, p.display_name || p.username || "Unknown"]));
    }
    setChatMessages(rows.map((r) => ({ ...r, author_name: nameMap[r.user_id] || "Unknown" })));
  };

  const handleDeleteChatMessage = async (id: string) => {
    const { error } = await supabase.from("community_messages").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete message", description: error.message, variant: "destructive" });
      return;
    }
    setChatMessages((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "Message deleted" });
  };

  const handleClearAllChats = async () => {
    const { error } = await supabase.from("community_messages").delete().not("id", "is", null);
    if (error) {
      toast({ title: "Failed to clear chats", description: error.message, variant: "destructive" });
      return;
    }
    setChatMessages([]);
    setClearChatsOpen(false);
    toast({ title: "All community chats cleared" });
  };

  const fetchAll = async () => {
    setLoadingData(true);
    try {
      const results = await Promise.allSettled([
        callAdmin("stats"),
        callAdmin("users"),
        callAdmin("subscriptions"),
        callAdmin("payment-requests"),
        callAdmin("visitor-trends"),
        callAdmin("resources"),
        callAdmin("pop-ads"),
        callAdmin("community-posts"),
        callAdmin("community-guidelines"),
        callAdmin("feedback"),
        callAdmin("generated-sites"),
      ]);

      const [statsData, usersData, subsData, prData, trendsData, resourcesData, popAdsData, communityPostsData, guidelinesData, feedbackData, sitesData] = results.map((r) =>
        r.status === "fulfilled" ? r.value : null
      );

      setStats((statsData as AdminStats) || null);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setSubscriptions(Array.isArray(subsData) ? subsData : []);
      setPaymentRequests(Array.isArray(prData) ? prData : []);
      setVisitorTrends(Array.isArray(trendsData) ? trendsData : []);
      setResources(Array.isArray(resourcesData) ? resourcesData : []);
      setPopAds(Array.isArray(popAdsData) ? popAdsData : []);
      setCommunityPosts(Array.isArray(communityPostsData) ? communityPostsData : []);
      setCommunityGuidelines(Array.isArray(guidelinesData) ? guidelinesData : []);
      setFeedbacks(Array.isArray(feedbackData) ? feedbackData : []);
      setSites(Array.isArray(sitesData) ? sitesData : []);

      const { data: applicantData } = await supabase.rpc("admin_list_profiles");
      setApplicants((applicantData as any[]) ?? []);

      const { data: internshipData } = await supabase
        .from("internship_applications")
        .select("*")
        .order("created_at", { ascending: false });
      setInternshipApps((internshipData as any[]) ?? []);

      await loadChatMessages();
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Failed to load admin data",
        description: e?.message || "Unauthorized or network error",
        variant: "destructive",
      });

      // Reset to safe state to avoid blank screen
      setStats(null);
      setUsers([]);
      setSubscriptions([]);

      if ((e?.message || "").toLowerCase().includes("not authenticated")) {
        navigate("/auth");
      }
    } finally {
      setLoadingData(false);
    }
  };

  const DOMAIN_IDS = ["web-development", "app-development", "cybersecurity", "data-science", "cloud-computing", "devops", "database", "iot", "blockchain", "ui-ux", "dsa", "system-design", "vlsi", "power-systems", "signal-processing", "robotics"];

  const handleSaveResource = async () => {
    if (!resourceForm.title?.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    let fileUrl = resourceForm.url;

    // Upload PDF if selected
    if (pdfFile && resourceForm.resource_type === "pdf") {
      setUploadingPdf(true);
      try {
        const fileName = `${Date.now()}-${pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const filePath = `${resourceForm.domain_id}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("resources")
          .upload(filePath, pdfFile, { contentType: "application/pdf" });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("resources").getPublicUrl(filePath);
        fileUrl = urlData.publicUrl;
      } catch (e: any) {
        toast({ title: "PDF upload failed", description: e?.message, variant: "destructive" });
        setUploadingPdf(false);
        return;
      }
      setUploadingPdf(false);
    }

    if (!fileUrl?.trim() && resourceForm.resource_type !== "pdf") {
      toast({ title: "URL is required", variant: "destructive" });
      return;
    }

    try {
      const payload = { ...resourceForm, url: fileUrl, sort_order: Number(resourceForm.sort_order), action: editingResource ? "update-resource" : "add-resource" };
      if (editingResource) {
        await callAdmin("update-resource", "POST", { id: editingResource.id, ...payload });
        toast({ title: "Resource updated" });
      } else {
        await callAdmin("add-resource", "POST", payload);
        toast({ title: "Resource added" });
      }
      setResourceDialog(false);
      setEditingResource(null);
      setPdfFile(null);
      setResourceForm({ domain_id: "web-development", title: "", resource_type: "video", source: "Custom", url: "", duration: "", thumbnail: "", description: "", sort_order: 0 });
      fetchAll();
    } catch (e: any) {
      toast({ title: "Failed to save resource", description: e?.message || "Please try again", variant: "destructive" });
    }
  };

  const handleDeleteResource = async (id: string) => {
    await callAdmin("delete-resource", "POST", { id });
    toast({ title: "Resource deleted" });
    fetchAll();
  };

  const openEditResource = (r: any) => {
    setEditingResource(r);
    setResourceForm({
      domain_id: r.domain_id || "web-development",
      title: r.title || "",
      resource_type: (r.resource_type || "video") as "video" | "article" | "course" | "material",
      source: r.source || "Custom",
      url: r.url || "",
      duration: r.duration || "",
      thumbnail: r.thumbnail || "",
      description: r.description || "",
      sort_order: r.sort_order ?? 0,
    });
    setResourceDialog(true);
  };

  const handleSavePopAd = async () => {
    const payload = { ...popAdForm, sort_order: Number(popAdForm.sort_order) };
    if (editingPopAd) {
      await callAdmin("update-pop-ad", "POST", { id: editingPopAd.id, ...payload });
      toast({ title: "Pop ad updated" });
    } else {
      await callAdmin("add-pop-ad", "POST", payload);
      toast({ title: "Pop ad added" });
    }
    setPopAdDialog(false);
    setEditingPopAd(null);
    setPopAdForm({
      title: "", image_url: "", link_url: "", festival_name: "",
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      is_active: true, sort_order: 0,
    });
    fetchAll();
  };

  const handleDeletePopAd = async (id: string) => {
    await callAdmin("delete-pop-ad", "POST", { id });
    toast({ title: "Pop ad deleted" });
    fetchAll();
  };

  const openEditPopAd = (p: any) => {
    setEditingPopAd(p);
    setPopAdForm({
      title: p.title || "",
      image_url: p.image_url || "",
      link_url: p.link_url || "",
      festival_name: p.festival_name || "",
      start_date: p.start_date ? p.start_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      end_date: p.end_date ? p.end_date.slice(0, 10) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      is_active: p.is_active ?? true,
      sort_order: p.sort_order ?? 0,
    });
    setPopAdDialog(true);
  };

  const handleRemovePost = async (id: string, reason?: string) => {
    await callAdmin("remove-community-post", "POST", { id, reason });
    toast({ title: "Post removed" });
    fetchAll();
  };

  const handleRestorePost = async (id: string) => {
    await callAdmin("restore-community-post", "POST", { id });
    toast({ title: "Post restored" });
    fetchAll();
  };

  const handleSaveGuideline = async () => {
    const payload = { ...guidelineForm, sort_order: Number(guidelineForm.sort_order) };
    if (editingGuideline) {
      await callAdmin("update-guideline", "POST", { id: editingGuideline.id, ...payload });
      toast({ title: "Guideline updated" });
    } else {
      await callAdmin("add-guideline", "POST", payload);
      toast({ title: "Guideline added" });
    }
    setGuidelineDialog(false);
    setEditingGuideline(null);
    setGuidelineForm({ domain_id: "", guideline_text: "", sort_order: 0 });
    fetchAll();
  };

  const handleDeleteGuideline = async (id: string) => {
    await callAdmin("delete-guideline", "POST", { id });
    toast({ title: "Guideline deleted" });
    fetchAll();
  };

  const handleSetUserRole = async (userId: string, role: string) => {
    await callAdmin("set-user-role", "POST", { user_id: userId, role });
    toast({ title: `Role set to ${role}` });
    fetchAll();
  };

  const handleBanUser = async (userId: string) => {
    await callAdmin("ban-user", "POST", { user_id: userId });
    toast({ title: "User banned", variant: "destructive" });
    fetchAll();
  };

  const handleUnbanUser = async (userId: string) => {
    await callAdmin("unban-user", "POST", { user_id: userId });
    toast({ title: "User unbanned" });
    fetchAll();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!userId) {
      toast({ title: "Invalid user", variant: "destructive" });
      return;
    }
    try {
      const res = await callAdmin("delete-user", "POST", { user_id: userId, action: "delete-user" });
      if (res?.success === false) {
        throw new Error(res?.error || "Delete failed");
      }
      toast({
        title: res?.message || "User and subscription removed",
        variant: "destructive",
      });
      setSelectedUser(null);
      setDeleteUserDialog(false);
      fetchAll();
    } catch (e: any) {
      toast({ title: "Failed to remove user", description: e?.message || "Check console for details", variant: "destructive" });
      console.error("Delete user error:", e);
    }
  };

  const [deleteUserDialog, setDeleteUserDialog] = useState(false);

  /* ---- Derived chart data (presentation only) ---- */
  const visitorSeries = useMemo(
    () => visitorTrends.slice(-14).map((v) => Number(v.visitor_count) || 0),
    [visitorTrends]
  );

  const visitorDelta = useMemo(() => {
    if (visitorSeries.length < 4) return null;
    const half = Math.floor(visitorSeries.length / 2);
    const prev = visitorSeries.slice(0, half).reduce((a, b) => a + b, 0);
    const curr = visitorSeries.slice(half).reduce((a, b) => a + b, 0);
    if (!prev) return null;
    return ((curr - prev) / prev) * 100;
  }, [visitorSeries]);

  const planMix = useMemo(() => {
    const counts: Record<string, number> = { Free: 0 };
    users.forEach((u) => {
      const plan = u.active_subscription?.plan_id;
      const key = plan ? String(plan).charAt(0).toUpperCase() + String(plan).slice(1) : "Free";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [users]);

  const revenueByDay = useMemo(() => {
    const byDay = new Map<string, number>();
    subscriptions.forEach((s) => {
      if (!s?.created_at) return;
      const key = new Date(s.created_at).toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) || 0) + Number(s.amount || 0) / 100);
    });
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([day, amount]) => ({
        label: new Date(day).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        amount: Math.round(amount),
      }));
  }, [subscriptions]);


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
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="relative shrink-0 rounded-lg border border-primary/30 bg-primary/10 p-1.5 glow-primary">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold font-display text-foreground truncate">
                Lunor.AI <span className="text-muted-foreground font-normal">· Control Center</span>
              </h1>
              <p className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                System healthy · {users.length} users tracked
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button variant="outline" size="sm" className="btn-outline-glow h-8 px-2 sm:px-3 text-xs sm:text-sm" asChild>
              <Link to="/"><ArrowLeft className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Back to Site</span><span className="sm:hidden">Back</span></Link>
            </Button>
            <Button variant="outline" size="sm" className="btn-outline-glow h-8 px-2 sm:px-3 text-xs sm:text-sm" onClick={signOut}>
              <LogOut className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-5 mb-6 sm:mb-8">
            {[
              { label: "Site Visitors", value: Number(stats.totalVisitors ?? 0), icon: Eye, tone: "text-primary", series: visitorSeries, delta: visitorDelta },
              { label: "Registered Users", value: Number(stats.totalUsers ?? 0), icon: Users, tone: "text-primary" },
              { label: "Paid Users", value: Number(stats.totalPaidUsers ?? 0), icon: UserCheck, tone: "text-green-400" },
              { label: "Revenue", value: Number(stats.totalRevenue ?? 0), prefix: "₹", icon: TrendingUp, tone: "text-yellow-400" },
              { label: "Bookings", value: Number(stats.totalBookings ?? 0), icon: Calendar, tone: "text-pink-400" },
            ].map((s, i) => (
              <AdminStatCard key={s.label} index={i} {...s} />
            ))}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 mb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="inline-flex w-max gap-1 rounded-full border border-border/70 bg-card/60 p-1 backdrop-blur-xl">
              {[
                { value: "overview", label: "Overview", short: "Stats", Icon: LayoutDashboard },
                { value: "system", label: "System", short: "Locks", Icon: Lock },
                { value: "users", label: "Users", short: "Users", Icon: Users },
                { value: "subscriptions", label: "Subscriptions", short: "Subs", Icon: CreditCard },
                { value: "payment-requests", label: "Payments", short: "Pay", Icon: Receipt, count: paymentRequests.filter((p) => p.status === "pending").length },
                { value: "resources", label: "Resources", short: "Res", Icon: Video },
                { value: "pop-ads", label: "Ads", short: "Ads", Icon: Megaphone },
                { value: "community", label: "Community", short: "Com", Icon: MessageSquare },
                { value: "guidelines", label: "Guidelines", short: "Rules", Icon: Shield },
                { value: "talent", label: "Talent", short: "Team", Icon: Briefcase, count: applicants.length },
                { value: "internships", label: "Internships", short: "Interns", Icon: UserPlus, count: internshipApps.filter((a) => a.status === "pending").length },
                { value: "feedback", label: "Feedback", short: "FB", Icon: MessageSquare, count: feedbacks.length },
              ].map(({ value, label, short, Icon, count }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="rounded-full px-3 py-1.5 text-xs sm:text-sm transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow"
                >
                  <Icon className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{short}</span>
                  {!!count && (
                    <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 text-[10px] font-semibold text-primary data-[state=active]:bg-background/20">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>


          <TabsContent value="system">
            <SystemControl />
          </TabsContent>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 mb-4 sm:mb-6">
              <AdminPanelCard
                className="lg:col-span-2"
                title="Visitor Trends"
                subtitle="Last 30 days"
                icon={<TrendingUp className="h-4 w-4 text-primary" />}
              >
                <VisitorsAreaChart data={visitorTrends} />
              </AdminPanelCard>

              <AdminPanelCard
                title="Plan Mix"
                subtitle="Active distribution"
                icon={<CreditCard className="h-4 w-4 text-primary" />}
              >
                <PlanDonutChart data={planMix} />
              </AdminPanelCard>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 mb-4 sm:mb-6">
              <AITrainingDataCard />
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 mb-4 sm:mb-6">

              <AdminPanelCard
                className="lg:col-span-2"
                title="Revenue by Day"
                subtitle="Confirmed subscriptions"
                icon={<Receipt className="h-4 w-4 text-primary" />}
              >
                <RevenueBarChart data={revenueByDay} />
              </AdminPanelCard>

              <AdminPanelCard
                title="Quick Actions"
                subtitle="Jump to a section"
                icon={<LayoutDashboard className="h-4 w-4 text-primary" />}
              >
                <div className="grid gap-2">
                  {[
                    { label: "Review pending payments", tab: "payment-requests", Icon: Receipt },
                    { label: "Moderate community", tab: "community", Icon: MessageSquare },
                    { label: "Review talent applications", tab: "talent", Icon: Briefcase },
                    { label: "Manage resources", tab: "resources", Icon: Video },
                  ].map(({ label, tab, Icon }) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="group flex items-center justify-between rounded-lg border border-border/70 bg-secondary/40 px-3 py-2.5 text-left text-xs sm:text-sm text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" /> {label}
                      </span>
                      <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </AdminPanelCard>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <AdminPanelCard
                title="Recent Users"
                subtitle={`${users.length} total`}
                icon={<Users className="h-4 w-4 text-primary" />}
                action={
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActiveTab("users")}>
                    View all
                  </Button>
                }
              >
                {users.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-3 transition-colors hover:bg-secondary/50 border-b border-border/60 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-primary/10 ring-1 ring-primary/25 flex items-center justify-center overflow-hidden shrink-0">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{u.display_name || u.username || "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email || "—"} · {new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs capitalize hidden sm:inline-flex">{u.provider === "google" ? "Google" : "Email"}</Badge>
                      <Badge variant={u.active_subscription ? "default" : "outline"} className="text-xs">
                        {u.active_subscription ? u.active_subscription.plan_id : "Free"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {users.length === 0 && <p className="text-sm text-muted-foreground">No users yet</p>}
              </AdminPanelCard>

              <AdminPanelCard
                title="Recent Subscriptions"
                subtitle={`${subscriptions.length} total`}
                icon={<CreditCard className="h-4 w-4 text-primary" />}
                action={
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActiveTab("subscriptions")}>
                    View all
                  </Button>
                }
              >
                {subscriptions.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg px-2 py-3 transition-colors hover:bg-secondary/50 border-b border-border/60 last:border-0">
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
              </AdminPanelCard>
            </div>

          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            {selectedUser ? (
              <div className="space-y-6">
                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to Users
                </Button>
                <div className="rounded-xl border border-border gradient-card p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {selectedUser.avatar_url ? (
                        <img src={selectedUser.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{selectedUser.display_name || "Unnamed User"}</h2>
                      <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedUser.email || "No email"}</p>
                      <Badge variant="outline" className="mt-1 text-xs capitalize">
                        {selectedUser.provider === "google" ? "Google" : selectedUser.provider === "email" ? "Email" : selectedUser.provider || "Email"}
                      </Badge>
                    </div>
                    <div className="ml-auto flex gap-2">
                      {(selectedUser.roles || ["user"]).map((r: string) => (
                        <Badge key={r} variant={r === "admin" ? "default" : "outline"} className="text-xs capitalize">{r}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-sm font-medium text-foreground">Set role:</span>
                    {["user", "moderator", "admin"].map((role) => (
                      <Button key={role} variant={(selectedUser.roles || ["user"])[0] === role ? "default" : "outline"} size="sm" onClick={() => handleSetUserRole(selectedUser.user_id, role)}>
                        {role}
                      </Button>
                    ))}
                    {selectedUser.banned_until ? (
                      <Button variant="outline" size="sm" className="text-green-600" onClick={() => handleUnbanUser(selectedUser.user_id)}><UserPlus className="h-4 w-4 mr-1" /> Unban</Button>
                    ) : (
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleBanUser(selectedUser.user_id)}><Ban className="h-4 w-4 mr-1" /> Ban User</Button>
                    )}
                    <AlertDialog open={deleteUserDialog} onOpenChange={setDeleteUserDialog}>
                      {selectedUser.user_id !== user?.id && (
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteUserDialog(true)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Remove User
                        </Button>
                      )}
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove user permanently?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete {selectedUser?.display_name || selectedUser?.email} and all their subscriptions. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => selectedUser && handleDeleteUser(selectedUser.user_id)}
                          >
                            Remove User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground mb-1">User ID</p>
                      <p className="text-sm font-mono text-foreground truncate">{selectedUser.user_id}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground mb-1">Joined</p>
                      <p className="text-sm text-foreground">{new Date(selectedUser.auth_created_at || selectedUser.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground mb-1">Last Sign In</p>
                      <p className="text-sm text-foreground">{selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString() : "Never"}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                      <Badge variant={selectedUser.active_subscription ? "default" : "outline"} className="text-xs">
                        {selectedUser.active_subscription ? selectedUser.active_subscription.plan_id : "Free"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Subscription History */}
                <div className="rounded-xl border border-border gradient-card p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5" /> Subscription History</h3>
                  {(selectedUser.subscriptions || []).length > 0 ? (
                    <div className="overflow-x-auto"><Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Started</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Payment ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.subscriptions.map((s: any) => (
                          <TableRow key={s.id}>
                            <TableCell><Badge className="text-xs">{s.plan_id}</Badge></TableCell>
                            <TableCell className="font-medium">₹{(s.amount / 100).toFixed(0)}</TableCell>
                            <TableCell>
                              <Badge variant={s.status === "active" ? "default" : "destructive"} className="text-xs">{s.status}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{new Date(s.started_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{new Date(s.expires_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">{s.razorpay_payment_id || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table></div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No subscription history</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border gradient-card overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Sign In</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.display_name || "Unnamed"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{u.email || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">{u.provider === "google" ? "Google" : u.provider || "Email"}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "—"}</TableCell>
                        <TableCell>
                          <Badge variant={u.active_subscription ? "default" : "outline"} className="text-xs">
                            {u.active_subscription ? u.active_subscription.plan_id : "Free"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">{(u.roles || ["user"])[0]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedUser(u)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Subscriptions */}
          <TabsContent value="subscriptions">
            <div className="rounded-xl border border-border gradient-card overflow-x-auto">
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

          {/* Payment Requests */}
          <TabsContent value="payment-requests">
            <div className="rounded-xl border border-border gradient-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>UTR Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentRequests.map((pr) => (
                    <TableRow key={pr.id}>
                      <TableCell className="text-sm">{pr.email || pr.user_id?.slice(0, 8)}</TableCell>
                      <TableCell><Badge className="text-xs">{pr.plan_id}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{pr.domain_id}</Badge></TableCell>
                      <TableCell className="font-medium">₹{(pr.amount / 100).toFixed(0)}</TableCell>
                      <TableCell className="font-mono text-sm">{pr.utr_number}</TableCell>
                      <TableCell>
                        <Badge variant={pr.status === "approved" ? "default" : pr.status === "rejected" ? "destructive" : "outline"} className="text-xs capitalize">
                          {pr.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(pr.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {pr.status === "pending" && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-500 hover:text-green-600"
                              onClick={async () => {
                                try {
                                  await callAdmin("approve-payment", "POST", { id: pr.id });
                                  toast({ title: "Payment approved & subscription activated" });
                                  fetchAll();
                                } catch (e: any) {
                                  toast({ title: "Error", description: e.message, variant: "destructive" });
                                }
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={async () => {
                                try {
                                  await callAdmin("reject-payment", "POST", { id: pr.id, admin_notes: "Payment not verified" });
                                  toast({ title: "Payment request rejected" });
                                  fetchAll();
                                } catch (e: any) {
                                  toast({ title: "Error", description: e.message, variant: "destructive" });
                                }
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {pr.status !== "pending" && <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                  {paymentRequests.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No payment requests yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Resources */}
          <TabsContent value="resources">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Manage Resources (Videos, Articles, Materials)</h3>
              <Dialog open={resourceDialog} onOpenChange={(open) => { setResourceDialog(open); if (!open) { setEditingResource(null); setResourceForm({ domain_id: "web-development", title: "", resource_type: "video", source: "Custom", url: "", duration: "", thumbnail: "", description: "", sort_order: 0 }); } }}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Resource</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingResource ? "Edit Resource" : "Add Resource"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">Domain</label>
                        <select className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3" value={resourceForm.domain_id} onChange={(e) => setResourceForm({ ...resourceForm, domain_id: e.target.value })}>
                          {DOMAIN_IDS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Type</label>
                        <select className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3" value={resourceForm.resource_type} onChange={(e) => { setResourceForm({ ...resourceForm, resource_type: e.target.value as any }); setPdfFile(null); }}>
                          <option value="video">Video</option>
                          <option value="article">Article</option>
                          <option value="course">Course</option>
                          <option value="material">Material</option>
                          <option value="pdf">PDF Document</option>
                        </select>
                      </div>
                    </div>
                    <div><label className="text-sm font-medium text-foreground">Title</label><Input value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} placeholder="Resource title" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm font-medium text-foreground">Source</label><Input value={resourceForm.source} onChange={(e) => setResourceForm({ ...resourceForm, source: e.target.value })} placeholder="YouTube, Udemy, etc." /></div>
                      <div><label className="text-sm font-medium text-foreground">Duration / Pages</label><Input value={resourceForm.duration} onChange={(e) => setResourceForm({ ...resourceForm, duration: e.target.value })} placeholder={resourceForm.resource_type === "pdf" ? "e.g. 50 pages" : "e.g. 2h 30m"} /></div>
                    </div>
                    {resourceForm.resource_type === "pdf" ? (
                      <div>
                        <label className="text-sm font-medium text-foreground">Upload PDF File</label>
                        <div className="mt-1 flex items-center gap-3">
                          <Input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 20 * 1024 * 1024) {
                                  toast({ title: "File too large", description: "Maximum 20MB", variant: "destructive" });
                                  return;
                                }
                                setPdfFile(file);
                              }
                            }}
                            className="flex-1"
                          />
                          {pdfFile && <Badge variant="outline" className="text-xs shrink-0">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</Badge>}
                        </div>
                        {resourceForm.url && !pdfFile && (
                          <p className="mt-1 text-xs text-muted-foreground">Current: <a href={resourceForm.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View PDF</a></p>
                        )}
                      </div>
                    ) : (
                      <div><label className="text-sm font-medium text-foreground">URL</label><Input value={resourceForm.url} onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })} placeholder="https://..." /></div>
                    )}
                    <div><label className="text-sm font-medium text-foreground">Thumbnail URL</label><Input value={resourceForm.thumbnail} onChange={(e) => setResourceForm({ ...resourceForm, thumbnail: e.target.value })} placeholder="https://..." /></div>
                    <div><label className="text-sm font-medium text-foreground">Description</label><Textarea value={resourceForm.description} onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })} /></div>
                    <div><label className="text-sm font-medium text-foreground">Sort Order</label><Input type="number" value={resourceForm.sort_order} onChange={(e) => setResourceForm({ ...resourceForm, sort_order: Number(e.target.value) })} /></div>
                    <Button onClick={handleSaveResource} disabled={uploadingPdf}>
                      {uploadingPdf ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : editingResource ? "Update Resource" : "Add Resource"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-xl border border-border gradient-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.title}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{r.domain_id}</Badge></TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs capitalize">{r.resource_type}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.source}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.duration || "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditResource(r)}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteResource(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {resources.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No resources yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Pop Ads */}
          <TabsContent value="pop-ads">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Festival Pop Ads & Banners</h3>
              <Dialog open={popAdDialog} onOpenChange={(open) => { setPopAdDialog(open); if (!open) { setEditingPopAd(null); setPopAdForm({ title: "", image_url: "", link_url: "", festival_name: "", start_date: new Date().toISOString().slice(0, 10), end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), is_active: true, sort_order: 0 }); } }}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Pop Ad</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPopAd ? "Edit Pop Ad" : "Add Pop Ad"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div><label className="text-sm font-medium text-foreground">Title</label><Input value={popAdForm.title} onChange={(e) => setPopAdForm({ ...popAdForm, title: e.target.value })} placeholder="Banner title" /></div>
                    <div><label className="text-sm font-medium text-foreground">Festival Name</label><Input value={popAdForm.festival_name} onChange={(e) => setPopAdForm({ ...popAdForm, festival_name: e.target.value })} placeholder="e.g. Diwali, Holi" /></div>
                    <div><label className="text-sm font-medium text-foreground">Image URL</label><Input value={popAdForm.image_url} onChange={(e) => setPopAdForm({ ...popAdForm, image_url: e.target.value })} placeholder="https://..." /></div>
                    <div><label className="text-sm font-medium text-foreground">Link URL</label><Input value={popAdForm.link_url} onChange={(e) => setPopAdForm({ ...popAdForm, link_url: e.target.value })} placeholder="https://..." /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm font-medium text-foreground">Start Date</label><Input type="date" value={popAdForm.start_date} onChange={(e) => setPopAdForm({ ...popAdForm, start_date: e.target.value })} /></div>
                      <div><label className="text-sm font-medium text-foreground">End Date</label><Input type="date" value={popAdForm.end_date} onChange={(e) => setPopAdForm({ ...popAdForm, end_date: e.target.value })} /></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="popad-active" checked={popAdForm.is_active} onChange={(e) => setPopAdForm({ ...popAdForm, is_active: e.target.checked })} />
                      <label htmlFor="popad-active" className="text-sm font-medium text-foreground">Active</label>
                    </div>
                    <div><label className="text-sm font-medium text-foreground">Sort Order</label><Input type="number" value={popAdForm.sort_order} onChange={(e) => setPopAdForm({ ...popAdForm, sort_order: Number(e.target.value) })} /></div>
                    <Button onClick={handleSavePopAd}>{editingPopAd ? "Update Pop Ad" : "Add Pop Ad"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-xl border border-border gradient-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Festival</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {popAds.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title || "—"}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{p.festival_name}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(p.start_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(p.end_date).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant={p.is_active ? "default" : "secondary"} className="text-xs">{p.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditPopAd(p)}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeletePopAd(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {popAds.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No pop ads yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Community Moderation */}
          <TabsContent value="community">
            <div className="rounded-xl border border-border gradient-card overflow-x-auto">
              <h3 className="text-lg font-bold text-foreground p-4 flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Community Posts Moderation</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communityPosts.map((p) => (
                    <TableRow key={p.id} className={p.is_removed ? "opacity-60" : ""}>
                      <TableCell className="font-medium">{p.author?.display_name || "Unknown"}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{p.content || p.title || "—"}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{p.domain_id || "—"}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={p.is_removed ? "destructive" : "default"} className="text-xs">{p.is_removed ? "Removed" : "Visible"}</Badge>
                      </TableCell>
                      <TableCell>
                        {p.is_removed ? (
                          <Button variant="ghost" size="sm" onClick={() => handleRestorePost(p.id)}><UserPlus className="h-4 w-4 mr-1" /> Restore</Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRemovePost(p.id)}><Ban className="h-4 w-4 mr-1" /> Remove</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {communityPosts.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No community posts yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>

            {/* Chat messages moderation */}
            <div className="rounded-xl border border-border gradient-card overflow-x-auto mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" /> Chat Messages ({chatMessages.length})
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadChatMessages}>Refresh</Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={chatMessages.length === 0}
                    onClick={() => setClearChatsOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Clear all chats
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chatMessages.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.author_name}</TableCell>
                      <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground">
                        {m.message_type && m.message_type !== "text" ? `[${m.message_type}] ` : ""}{m.content || "—"}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{m.domain_id || "—"}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(m.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteChatMessage(m.id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {chatMessages.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No chat messages</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>

            <AlertDialog open={clearChatsOpen} onOpenChange={setClearChatsOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all community chats?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes every chat message across all domains. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAllChats}>Delete everything</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>

          {/* Guidelines */}
          <TabsContent value="guidelines">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Community Guidelines</h3>
              <Dialog open={guidelineDialog} onOpenChange={(open) => { setGuidelineDialog(open); if (!open) { setEditingGuideline(null); setGuidelineForm({ domain_id: "", guideline_text: "", sort_order: 0 }); } }}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Guideline</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingGuideline ? "Edit Guideline" : "Add Guideline"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Domain (optional)</label>
                      <select className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3" value={guidelineForm.domain_id} onChange={(e) => setGuidelineForm({ ...guidelineForm, domain_id: e.target.value })}>
                        <option value="">All domains</option>
                        {DOMAIN_IDS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div><label className="text-sm font-medium text-foreground">Guideline Text</label><Textarea value={guidelineForm.guideline_text} onChange={(e) => setGuidelineForm({ ...guidelineForm, guideline_text: e.target.value })} placeholder="Be respectful..." rows={4} /></div>
                    <div><label className="text-sm font-medium text-foreground">Sort Order</label><Input type="number" value={guidelineForm.sort_order} onChange={(e) => setGuidelineForm({ ...guidelineForm, sort_order: Number(e.target.value) })} /></div>
                    <Button onClick={handleSaveGuideline}>{editingGuideline ? "Update Guideline" : "Add Guideline"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-xl border border-border gradient-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Guideline</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communityGuidelines.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell><Badge variant="outline" className="text-xs">{g.domain_id || "All"}</Badge></TableCell>
                      <TableCell className="max-w-[400px] text-sm">{g.guideline_text}</TableCell>
                      <TableCell className="text-muted-foreground">{g.sort_order}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingGuideline(g); setGuidelineForm({ domain_id: g.domain_id || "", guideline_text: g.guideline_text || "", sort_order: g.sort_order ?? 0 }); setGuidelineDialog(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteGuideline(g.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {communityGuidelines.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No guidelines yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Internship applications */}
          <TabsContent value="internships">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Internship Applications ({internshipApps.length})
            </h2>
            <div className="rounded-xl border border-border gradient-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Links</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internshipApps.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-sm font-medium">{a.full_name}</TableCell>
                      <TableCell className="text-xs">
                        <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary whitespace-nowrap">
                          {String(a.role || "").replace(/-/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div>{a.email}</div>
                        {a.phone && <div>{a.phone}</div>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {a.college || "—"}{a.year_of_study ? ` · ${a.year_of_study}` : ""}
                      </TableCell>
                      <TableCell className="max-w-[200px] text-xs text-muted-foreground truncate">{a.skills || "—"}</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex flex-col gap-0.5">
                          {a.github_url && <a href={a.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub</a>}
                          {a.portfolio_url && <a href={a.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Portfolio</a>}
                          {a.linkedin_url && <a href={a.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a>}
                          {!a.github_url && !a.portfolio_url && !a.linkedin_url && <span className="text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <select
                          value={a.status}
                          onChange={(e) => setInternshipStatus(a.id, e.target.value)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                        >
                          <option value="pending">pending</option>
                          <option value="shortlisted">shortlisted</option>
                          <option value="selected">selected</option>
                          <option value="rejected">rejected</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        {a.resume_url ? (
                          <Button size="sm" variant="outline" onClick={() => viewResume(a.resume_url)}>
                            <FileText className="mr-1 h-3.5 w-3.5" /> View
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {internshipApps.length === 0 && (
                    <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No internship applications yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Talent / student profiles */}
          <TabsContent value="talent">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Student Profiles ({applicants.length})</h2>
            <div className="rounded-xl border border-border gradient-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead>Interests</TableHead>
                    <TableHead>Internship</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Resume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-sm">{a.username || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.display_name || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.age ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{a.dob ? new Date(a.dob).toLocaleDateString() : "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.stream || "—"}</TableCell>
                      <TableCell className="max-w-[240px]">
                        {a.interests?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {a.interests.map((i: string) => (
                              <span key={i} className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] text-foreground">{i}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {a.wants_to_join_team ? (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">Interested</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {a.resume_url ? (
                          <Button size="sm" variant="outline" onClick={() => viewResume(a.resume_url)}>
                            <FileText className="mr-1.5 h-3.5 w-3.5" /> View
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">No file</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {applicants.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No student profiles yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>


          <TabsContent value="feedback">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> User Feedback ({feedbacks.length})</h2>
            <div className="rounded-xl border border-border gradient-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="min-w-[200px]">Message</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((fb: any) => (
                    <TableRow key={fb.id}>
                      <TableCell className="font-medium text-sm">{fb.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fb.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className={s <= fb.rating ? "text-yellow-400" : "text-muted-foreground/30"}>★</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-[300px]">{fb.message}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(fb.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {feedbacks.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No feedback yet</TableCell></TableRow>}
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
