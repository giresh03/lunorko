import { useState } from "react";
import { Heart, MessageCircle, ExternalLink, Code2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  post_type: string;
  code_snippet: string | null;
  code_language: string | null;
  project_link: string | null;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  display_name?: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  code_snippet: string | null;
  created_at: string;
  display_name?: string;
}

const typeConfig: Record<string, { label: string; color: string }> = {
  discussion: { label: "💬 Discussion", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  project: { label: "🚀 Project", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  code: { label: "💻 Code", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  doubt: { label: "❓ Doubt", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
};

const PostCard = ({ post, profiles, onRefresh }: { post: Post; profiles: Record<string, string>; onRefresh: () => void }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [loadingComments, setLoadingComments] = useState(false);

  const type = typeConfig[post.post_type] || typeConfig.discussion;
  const authorName = profiles[post.user_id] || "User";
  const initials = authorName.slice(0, 2).toUpperCase();

  const loadComments = async () => {
    setLoadingComments(true);
    const { data } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    setComments(data || []);
    setLoadingComments(false);
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const handleLike = async () => {
    if (!user) return;
    if (liked) {
      await supabase.from("community_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
      setLiked(false);
      setLikesCount((c) => c - 1);
    } else {
      await supabase.from("community_likes").insert({ post_id: post.id, user_id: user.id });
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !user) return;
    await supabase.from("community_comments").insert({
      post_id: post.id,
      user_id: user.id,
      content: newComment.trim(),
    });
    setNewComment("");
    loadComments();
  };

  const handleDelete = async () => {
    if (!user || user.id !== post.user_id) return;
    await supabase.from("community_posts").delete().eq("id", post.id);
    toast({ title: "Post deleted" });
    onRefresh();
  };

  // Check if already liked
  useState(() => {
    if (user) {
      supabase.from("community_likes").select("id").eq("post_id", post.id).eq("user_id", user.id).single()
        .then(({ data }) => { if (data) setLiked(true); });
    }
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <span className="text-sm font-semibold text-foreground">{authorName}</span>
            <p className="text-[10px] text-muted-foreground">{format(new Date(post.created_at), "MMM d, yyyy · HH:mm")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[10px] ${type.color}`}>{type.label}</Badge>
          {user?.id === post.user_id && (
            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Title + Content */}
      <h3 className="text-base font-semibold text-foreground mb-1">{post.title}</h3>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">{post.content}</p>

      {/* Image */}
      {post.image_url && (
        <div className="mb-3 rounded-lg overflow-hidden border border-border">
          <img src={post.image_url} alt="Post attachment" className="w-full max-h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(post.image_url!, '_blank')} />
        </div>
      )}

      {/* Code */}
      {post.code_snippet && (
        <pre className="rounded-lg bg-muted p-3 text-xs font-mono overflow-x-auto mb-3 border border-border">
          <code>{post.code_snippet}</code>
        </pre>
      )}

      {/* Project link */}
      {post.project_link && (
        <a
          href={post.project_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mb-3"
        >
          <ExternalLink className="h-3 w-3" /> {post.project_link}
        </a>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          {likesCount}
        </button>
        <button onClick={toggleComments} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle className="h-4 w-4" />
          {post.comments_count} Comments
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          {loadingComments ? (
            <p className="text-xs text-muted-foreground">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No comments yet. Be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="text-[8px] bg-secondary text-secondary-foreground">
                    {(profiles[c.user_id] || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-foreground">{profiles[c.user_id] || "User"}</span>
                    <span className="text-[9px] text-muted-foreground">{format(new Date(c.created_at), "MMM d, HH:mm")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.content}</p>
                  {c.code_snippet && (
                    <pre className="mt-1 rounded bg-muted p-1.5 text-[10px] font-mono overflow-x-auto"><code>{c.code_snippet}</code></pre>
                  )}
                </div>
              </div>
            ))
          )}
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              className="text-xs"
            />
            <Button size="sm" onClick={handleComment} disabled={!newComment.trim()} className="self-end">
              Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
