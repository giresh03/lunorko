import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domainId: string;
  onCreated: () => void;
}

const postTypes = [
  { value: "discussion", label: "💬 Discussion" },
  { value: "project", label: "🚀 Project Showcase" },
  { value: "code", label: "💻 Code Share" },
  { value: "doubt", label: "❓ Doubt / Question" },
];

const CreatePostDialog = ({ open, onOpenChange, domainId, onCreated }: Props) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("discussion");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [projectLink, setProjectLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !user) return;
    setSubmitting(true);

    const payload: any = {
      user_id: user.id,
      domain_id: domainId,
      title: title.trim(),
      content: content.trim(),
      post_type: postType,
    };
    if (codeSnippet) {
      payload.code_snippet = codeSnippet;
      payload.code_language = codeLanguage;
    }
    if (projectLink) payload.project_link = projectLink;

    const { error } = await supabase.from("community_posts").insert(payload);
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Posted!", description: "Your post is live." });
      setTitle(""); setContent(""); setCodeSnippet(""); setProjectLink("");
      onOpenChange(false);
      onCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Post Type</Label>
            <Select value={postType} onValueChange={setPostType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {postTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your post a title" />
          </div>

          <div>
            <Label>Content</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your post..." rows={4} />
          </div>

          {(postType === "code" || postType === "project") && (
            <div>
              <Label>Code Snippet (optional)</Label>
              <textarea
                className="w-full rounded-md border border-border bg-muted p-2 text-xs font-mono resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Paste your code here..."
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
              />
            </div>
          )}

          {postType === "project" && (
            <div>
              <Label>Project / GitHub Link</Label>
              <Input value={projectLink} onChange={(e) => setProjectLink(e.target.value)} placeholder="https://github.com/..." />
            </div>
          )}

          <Button className="w-full" onClick={handleSubmit} disabled={submitting || !title.trim() || !content.trim()}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Publish Post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
