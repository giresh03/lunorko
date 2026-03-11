import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, PenSquare, Hash, Users, Code2, Rocket, HelpCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeatureGate from "@/components/FeatureGate";
import DomainChat from "@/components/community/DomainChat";
import PostCard from "@/components/community/PostCard";
import CreatePostDialog from "@/components/community/CreatePostDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { domains } from "@/lib/domains";
import { useScrollReveal, scrollRevealStyle } from "@/hooks/useScrollReveal";

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
  const pageRef = useScrollReveal();

  const [selectedDomain, setSelectedDomain] = useState(domains[0]?.id || "web-development");
  const [activeTab, setActiveTab] = useState("forum");
  const [postFilter, setPostFilter] = useState("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from("community_posts")
      .select("*")
      .eq("domain_id", selectedDomain)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (postFilter !== "all") {
      query = query.eq("post_type", postFilter);
    }

    const { data } = await query;
    setPosts((data as Post[]) || []);

    // Fetch profiles
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((p) => p.user_id))];
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
    if (user) fetchPosts();
  }, [selectedDomain, postFilter, user]);

  const currentDomain = domains.find((d) => d.id === selectedDomain);

  if (authLoading) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background" ref={pageRef}>
      <Navbar />
      <FeatureGate feature="community" featureName="Community Hub" requiredPlan="pro">
      <main className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-6 scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-serif flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Community Hub
          </h1>
          <p className="mt-1 text-muted-foreground">
            Connect, share, and collaborate with fellow learners across domains
          </p>
        </div>

        {/* Domain selector */}
        <div className="mb-6 scroll-reveal opacity-0 translate-y-6 transition-all duration-700 delay-100 ease-out">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Channel:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedDomain === d.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs: Forum / Chat */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="scroll-reveal opacity-0 translate-y-6 transition-all duration-700 delay-200 ease-out">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="forum" className="gap-1.5">
                <PenSquare className="h-4 w-4" /> Forum
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-1.5">
                <MessageCircle className="h-4 w-4" /> Live Chat
              </TabsTrigger>
            </TabsList>
            {activeTab === "forum" && (
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <PenSquare className="h-4 w-4 mr-1.5" /> New Post
              </Button>
            )}
          </div>

          <TabsContent value="forum">
            {/* Post type filters */}
            <div className="flex flex-wrap gap-2 mb-4">
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

            {/* Posts list */}
            {loading ? (
              <div className="py-16 text-center text-muted-foreground">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
                <PenSquare className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
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
          </TabsContent>

          <TabsContent value="chat">
            <div className="mb-2">
              <Badge variant="outline" className="text-xs">
                <span className="mr-1 h-2 w-2 rounded-full bg-green-500 inline-block animate-pulse" />
                Live · #{currentDomain?.name || selectedDomain}
              </Badge>
            </div>
            <DomainChat domainId={selectedDomain} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      <CreatePostDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        domainId={selectedDomain}
        onCreated={fetchPosts}
      />
      <style>{scrollRevealStyle}</style>
    </div>
  );
};

export default Community;
