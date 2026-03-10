import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, PlusCircle, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectDetailView from "@/components/projects/ProjectDetailView";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { domains } from "@/lib/domains";

const ProjectBuilder = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const fetchProjects = async () => {
    setLoading(true);
    let query = supabase
      .from("team_projects")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (domainFilter !== "all") query = query.eq("domain_id", domainFilter);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);

    const { data } = await query;
    const projectList = data || [];
    setProjects(projectList);

    if (projectList.length > 0) {
      // Fetch owner profiles
      const ownerIds = [...new Set(projectList.map((p: any) => p.owner_id))];
      const { data: profs } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ownerIds);
      const map: Record<string, string> = {};
      (profs || []).forEach((p: any) => { map[p.user_id] = p.display_name || "User"; });
      setProfiles(map);

      // Fetch member counts
      const projectIds = projectList.map((p: any) => p.id);
      const { data: mems } = await supabase.from("team_members").select("project_id").in("project_id", projectIds);
      const counts: Record<string, number> = {};
      (mems || []).forEach((m: any) => { counts[m.project_id] = (counts[m.project_id] || 0) + 1; });
      setMemberCounts(counts);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchProjects();
  }, [user, domainFilter, statusFilter]);

  const filtered = search
    ? projects.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    : projects;

  if (authLoading || !user) return null;

  if (selectedProjectId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-20">
          <ProjectDetailView projectId={selectedProjectId} onBack={() => { setSelectedProjectId(null); fetchProjects(); }} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-serif flex items-center gap-3">
              <Rocket className="h-8 w-8 text-primary" />
              Project Builder
            </h1>
            <p className="mt-1 text-muted-foreground">
              Find a team, build together, and ship real projects
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-1.5">
            <PlusCircle className="h-4 w-4" /> New Project
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-[160px]"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue placeholder="Domain" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domains.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="recruiting">Recruiting</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading projects...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
            <Rocket className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No projects yet. Be the first to create one!</p>
            <Button size="sm" className="mt-3" onClick={() => setShowCreate(true)}>Create Project</Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard
                key={p.id}
                project={{ ...p, member_count: memberCounts[p.id] || 1 }}
                ownerName={profiles[p.owner_id] || "User"}
                onView={setSelectedProjectId}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
      <CreateProjectDialog open={showCreate} onOpenChange={setShowCreate} onCreated={fetchProjects} />
    </div>
  );
};

export default ProjectBuilder;
