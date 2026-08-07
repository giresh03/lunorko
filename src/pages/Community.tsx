import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, PenSquare, Hash, Users, Code2, Rocket, HelpCircle, Filter, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/Navbar";
import DomainChat from "@/components/community/DomainChat";
import PostCard from "@/components/community/PostCard";
import CreatePostDialog from "@/components/community/CreatePostDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { domains } from "@/lib/domains";

interface Post {
  id: string;
  user_id: string;
  domain_id: string;
  title: string;
  content: string;
  post_type: string;
  code_snippet: string | null;
  code_language: string | null;
  project_link: string | null;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

const postTypeFilters = [
  { value: "all", label: "All", icon: Filter },
  { value: "discussion", label: "Discussions", icon: MessageCircle },
  { value: "project", label: "Projects", icon: Rocket },
  { value: "code", label: "Code", icon: Code2 },
  { value: "doubt", label: "Doubts", icon: HelpCircle },
];

const Community = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [selectedDomain, setSelectedDomain] = useState(domains[0]?.id || "web-development");
  const [activeTab, setActiveTab] = useState<"chat" | "forum">("chat");
  const [postFilter, setPostFilter] = useState("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = (supabase
      .from("community_posts")
      .select("*") as any)
      .eq("domain_id", selectedDomain)
      .eq("is_removed", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (postFilter !== "all") query = query.eq("post_type", postFilter);

    const { data } = await query;
    setPosts((data as Post[]) || []);

    if (data && data.length > 0) {
      const userIds = [...new Set((data as any[]).map((p: any) => p.user_id as string))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      const map: Record<string, string> = {};
      (profilesData || []).forEach((p) => {
        map[p.user_id] = p.display_name || "User";
      });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && activeTab === "forum") fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDomain, postFilter, user, activeTab]);

  const currentDomain = domains.find((d) => d.id === selectedDomain);

  if (authLoading || !user) return null;

  const ChannelList = () => (
    <ScrollArea className="h-full">
      <div className="p-3">
        <div className="mb-3 flex items-center gap-2 px-1">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-serif text-sm font-semibold text-foreground">Community Hub</span>
        </div>
        <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Channels
        </p>
        <div className="space-y-0.5">
          {domains.map((d) => {
            const active = selectedDomain === d.id;
            return (
              <button
                key={d.id}
                onClick={() => {
                  setSelectedDomain(d.id);
                  setMobileNav(false);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Hash className={`h-3.5 w-3.5 shrink-0 ${active ? "text-primary" : "opacity-60"}`} />
                <span className="truncate">{d.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FeatureGate feature="community" featureName="Community Hub" requiredPlan="pro">
        <main className="pt-16">
          <div className="flex h-[calc(100vh-4rem)] overflow-hidden border-t border-border">
            {/* Channel sidebar */}
            <aside className="hidden w-60 shrink-0 border-r border-border bg-card/40 lg:block">
              <ChannelList />
            </aside>

            {/* Channel body */}
            <section className="flex min-w-0 flex-1 flex-col">
              {/* Channel header */}
              <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
                <Sheet open={mobileNav} onOpenChange={setMobileNav}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <ChannelList />
                  </SheetContent>
                </Sheet>

                <Hash className="h-4 w-4 text-muted-foreground" />
                <h1 className="truncate text-sm font-semibold text-foreground">
                  {currentDomain?.name || selectedDomain}
                </h1>
                <Badge variant="outline" className="hidden gap-1 text-[10px] sm:flex">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                  Live
                </Badge>

                <div className="ml-auto flex items-center gap-1">
                  <div className="flex rounded-md border border-border p-0.5">
                    {(["chat", "forum"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                          activeTab === t
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t === "chat" ? <MessageCircle className="h-3 w-3" /> : <PenSquare className="h-3 w-3" />}
                        {t}
                      </button>
                    ))}
                  </div>
                  {activeTab === "forum" && (
                    <Button size="sm" className="h-7 text-[11px]" onClick={() => setShowCreate(true)}>
                      <PenSquare className="mr-1 h-3 w-3" /> New Post
                    </Button>
                  )}
                </div>
              </header>

              {/* Content */}
              {activeTab === "chat" ? (
                <DomainChat domainId={selectedDomain} channelName={currentDomain?.name} />
              ) : (
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                  <div className="mx-auto max-w-3xl">
                    <div className="mb-4 flex flex-wrap gap-2">
                      {postTypeFilters.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setPostFilter(f.value)}
                          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            postFilter === f.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          <f.icon className="h-3 w-3" />
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {loading ? (
                      <div className="py-16 text-center text-muted-foreground">Loading posts...</div>
                    ) : posts.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
                        <PenSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-muted-foreground">No posts yet in this channel.</p>
                        <Button size="sm" className="mt-3" onClick={() => setShowCreate(true)}>
                          Be the first to post!
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {posts.map((post) => (
                          <PostCard key={post.id} post={post} profiles={profiles} onRefresh={fetchPosts} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </FeatureGate>

      <CreatePostDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        domainId={selectedDomain}
        onCreated={fetchPosts}
      />
    </div>
  );
};

export default Community;
