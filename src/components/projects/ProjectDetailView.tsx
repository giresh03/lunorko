import { useState, useEffect } from "react";
import { ArrowLeft, Users, UserPlus, Check, X, Crown, LogOut, MessageCircle, Code2, Sparkles, Loader2, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import TeamChat from "./TeamChat";
import TeamFileEditor from "./TeamFileEditor";
import LiveBackendPanel from "@/components/editor/LiveBackendPanel";
import { useLiveRuntime } from "@/hooks/useLiveRuntime";

/** Shared, team-scoped live backend (auth + database) for the project. */
const TeamBackendTab = ({ projectId, projectTitle }: { projectId: string; projectTitle: string }) => {
  const rt = useLiveRuntime({ scope: "team", scopeKey: projectId, name: projectTitle, enabled: true });
  return (
    <div className="max-w-xl space-y-3">
      <p className="text-sm text-muted-foreground">
        Every teammate's code that calls <code className="rounded bg-muted px-1">/api/...</code> runs against this shared backend — real sign-up, login and saved data.
      </p>
      <LiveBackendPanel
        status={rt.status}
        info={rt.info}
        error={rt.error}
        busy={rt.busy}
        onStart={() => void rt.provision()}
        onRefresh={() => void rt.refresh()}
        onReset={() => void rt.reset()}
        onCredentials={rt.credentials}
      />
    </div>
  );
};

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
}

const ProjectDetailView = ({ projectId, onBack }: ProjectDetailViewProps) => {
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [hasRequested, setHasRequested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: proj }, { data: mems }, { data: reqs }] = await Promise.all([
      supabase.from("team_projects").select("*").eq("id", projectId).single(),
      supabase.from("team_members").select("*").eq("project_id", projectId),
      supabase.from("team_join_requests").select("*").eq("project_id", projectId),
    ]);

    setProject(proj);
    setMembers(mems || []);
    setJoinRequests(reqs || []);
    setIsMember(mems?.some((m) => m.user_id === user?.id) || false);
    setIsOwner(proj?.owner_id === user?.id);
    setHasRequested(reqs?.some((r) => r.user_id === user?.id) || false);

    // Fetch profiles
    const allUserIds = [
      ...new Set([
        ...(mems || []).map((m: any) => m.user_id),
        ...(reqs || []).map((r: any) => r.user_id),
      ]),
    ];
    if (allUserIds.length > 0) {
      const { data: profs } = await supabase
        .from("public_profiles")
        .select("user_id, display_name, username")
        .in("user_id", allUserIds);
      const map: Record<string, string> = {};
      (profs || []).forEach((p: any) => { map[p.user_id] = p.username || p.display_name || "User"; });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [projectId]);

  const requestJoin = async () => {
    if (!user) return;
    const { error } = await supabase.from("team_join_requests").insert({
      project_id: projectId,
      user_id: user.id,
      message: joinMessage || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Join request sent!"); setHasRequested(true); fetchData(); }
  };

  const handleRequest = async (requestId: string, userId: string, accept: boolean) => {
    if (accept) {
      await supabase.from("team_members").insert({ project_id: projectId, user_id: userId, role: "member" });
    }
    await supabase.from("team_join_requests").update({ status: accept ? "accepted" : "rejected" }).eq("id", requestId);
    toast.success(accept ? "Member added!" : "Request rejected");
    fetchData();
  };

  const removeMember = async (userId: string) => {
    await supabase.from("team_members").delete().eq("project_id", projectId).eq("user_id", userId);
    toast.success("Member removed");
    fetchData();
  };

  const leaveProject = async () => {
    if (!user) return;
    await supabase.from("team_members").delete().eq("project_id", projectId).eq("user_id", user.id);
    toast.success("Left the project");
    onBack();
  };

  const getAiSuggestions = async () => {
    if (!project) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("match-team", {
        body: { projectTitle: project.title, projectDescription: project.description, techStack: project.tech_stack, domainId: project.domain_id },
      });
      if (error) throw error;
      setAiSuggestions(data);
    } catch (e: any) { toast.error(e.message); }
    setAiLoading(false);
  };

  if (loading) return <div className="py-16 text-center text-muted-foreground">Loading...</div>;
  if (!project) return <div className="py-16 text-center text-muted-foreground">Project not found</div>;

  const pendingRequests = joinRequests.filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">{project.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {project.tech_stack?.map((t: string) => (
              <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
            ))}
            <Badge variant="outline">{project.difficulty}</Badge>
            <Badge variant="outline" className={project.status === "recruiting" ? "bg-primary/10 text-primary" : ""}>
              {project.status}
            </Badge>
          </div>
        </div>
        {isMember && !isOwner && (
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive" onClick={leaveProject}>
            <LogOut className="h-3.5 w-3.5" /> Leave
          </Button>
        )}
      </div>

      {/* Non-member view */}
      {!isMember && (
        <div className="rounded-lg border border-border bg-card p-6 text-center space-y-3">
          {hasRequested ? (
            <p className="text-sm text-muted-foreground">Your join request is pending approval.</p>
          ) : (
            <>
              <UserPlus className="h-8 w-8 mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Want to collaborate on this project?</p>
              <Textarea placeholder="Introduce yourself and your skills..." value={joinMessage} onChange={(e) => setJoinMessage(e.target.value)} rows={2} className="max-w-md mx-auto" />
              <Button onClick={requestJoin} className="gap-1.5">
                <UserPlus className="h-4 w-4" /> Request to Join
              </Button>
            </>
          )}
        </div>
      )}

      {/* Member view */}
      {isMember && (
        <Tabs defaultValue="code">
          <TabsList>
            <TabsTrigger value="code" className="gap-1.5"><Code2 className="h-4 w-4" /> Code</TabsTrigger>
            <TabsTrigger value="chat" className="gap-1.5"><MessageCircle className="h-4 w-4" /> Team Chat</TabsTrigger>
            <TabsTrigger value="team" className="gap-1.5"><Users className="h-4 w-4" /> Team ({members.length})</TabsTrigger>
            <TabsTrigger value="backend" className="gap-1.5"><Server className="h-4 w-4" /> Backend</TabsTrigger>
            <TabsTrigger value="ai" className="gap-1.5"><Sparkles className="h-4 w-4" /> AI Assist</TabsTrigger>
          </TabsList>

          <TabsContent value="code">
            <TeamFileEditor projectId={projectId} profiles={profiles} />
          </TabsContent>

          <TabsContent value="backend">
            <TeamBackendTab projectId={projectId} projectTitle={project.title} />
          </TabsContent>

          <TabsContent value="chat">
            <TeamChat projectId={projectId} profiles={profiles} />
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            {/* Members list */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Team Members</h3>
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {(profiles[m.user_id] || "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">{profiles[m.user_id] || "User"}</span>
                    <div className="flex items-center gap-1.5">
                      {m.role === "owner" && <Badge variant="default" className="text-[9px] gap-0.5"><Crown className="h-2.5 w-2.5" /> Owner</Badge>}
                      {m.role === "member" && <Badge variant="secondary" className="text-[9px]">Member</Badge>}
                    </div>
                  </div>
                  {isOwner && m.user_id !== user?.id && (
                    <Button size="sm" variant="ghost" className="text-destructive h-7 text-xs" onClick={() => removeMember(m.user_id)}>Remove</Button>
                  )}
                </div>
              ))}
            </div>

            {/* Pending requests (owner only) */}
            {isOwner && pendingRequests.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Join Requests ({pendingRequests.length})</h3>
                {pendingRequests.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {(profiles[r.user_id] || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">{profiles[r.user_id] || "User"}</span>
                      {r.message && <p className="text-xs text-muted-foreground">{r.message}</p>}
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="icon" className="h-7 w-7" onClick={() => handleRequest(r.id, r.user_id, true)}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => handleRequest(r.id, r.user_id, false)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai">
            <div className="space-y-4">
              <Button variant="outline" className="gap-2" onClick={getAiSuggestions} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Get AI Project Recommendations
              </Button>
              {aiSuggestions && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                  {aiSuggestions.roles?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">Recommended Roles</p>
                      {aiSuggestions.roles.map((r: any, i: number) => (
                        <div key={i} className="mb-2">
                          <span className="text-sm font-medium text-foreground">{r.title}</span>
                          <p className="text-xs text-muted-foreground">{r.description}</p>
                          <div className="flex gap-1 mt-0.5">{r.skills?.map((s: string) => <Badge key={s} variant="outline" className="text-[9px]">{s}</Badge>)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {aiSuggestions.milestones?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">Milestones</p>
                      {aiSuggestions.milestones.map((m: any, i: number) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Week {m.week}: {m.title}</span> — {m.description}
                        </p>
                      ))}
                    </div>
                  )}
                  {aiSuggestions.tips?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">Collaboration Tips</p>
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                        {aiSuggestions.tips.map((t: string, i: number) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ProjectDetailView;
