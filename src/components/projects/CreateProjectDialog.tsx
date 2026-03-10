import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { domains } from "@/lib/domains";
import { toast } from "sonner";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const CreateProjectDialog = ({ open, onOpenChange, onCreated }: CreateProjectDialogProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domainId, setDomainId] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [maxMembers, setMaxMembers] = useState(5);
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const addTech = () => {
    const t = techInput.trim();
    if (t && !techStack.includes(t)) {
      setTechStack([...techStack, t]);
      setTechInput("");
    }
  };

  const getAiSuggestions = async () => {
    if (!title || !description) {
      toast.error("Add title and description first");
      return;
    }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("match-team", {
        body: { projectTitle: title, projectDescription: description, techStack, domainId },
      });
      if (error) throw error;
      setAiSuggestions(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to get AI suggestions");
    }
    setAiLoading(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !domainId || !user) return;
    setLoading(true);
    try {
      const { data: project, error } = await supabase
        .from("team_projects")
        .insert({
          owner_id: user.id,
          title: title.trim(),
          description: description.trim(),
          domain_id: domainId,
          tech_stack: techStack,
          max_members: maxMembers,
          difficulty,
        })
        .select()
        .single();
      if (error) throw error;

      // Add owner as team member
      await supabase.from("team_members").insert({
        project_id: project.id,
        user_id: user.id,
        role: "owner",
      });

      toast.success("Project created!");
      onOpenChange(false);
      resetForm();
      onCreated();
    } catch (e: any) {
      toast.error(e.message || "Failed to create project");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDomainId("");
    setTechStack([]);
    setTechInput("");
    setAiSuggestions(null);
    setDifficulty("intermediate");
    setMaxMembers(5);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Team Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Describe your project idea, goals, and what you're building..." rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <Select value={domainId} onValueChange={setDomainId}>
              <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
              <SelectContent>
                {domains.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Max Team Members</label>
            <Input type="number" min={2} max={10} value={maxMembers} onChange={(e) => setMaxMembers(Number(e.target.value))} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Tech Stack</label>
            <div className="flex gap-2">
              <Input placeholder="e.g. React, Node.js" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())} />
              <Button type="button" variant="outline" onClick={addTech}>Add</Button>
            </div>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {techStack.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    {t}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setTechStack(techStack.filter((x) => x !== t))} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* AI Suggestions */}
          <Button type="button" variant="outline" className="w-full gap-2" onClick={getAiSuggestions} disabled={aiLoading}>
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Get AI Team Suggestions
          </Button>

          {aiSuggestions && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> AI Recommendations
              </h4>
              {aiSuggestions.roles?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Suggested Roles:</p>
                  <div className="space-y-1">
                    {aiSuggestions.roles.map((r: any, i: number) => (
                      <div key={i} className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{r.title}</span> — {r.description}
                        <div className="flex gap-1 mt-0.5">
                          {r.skills?.map((s: string) => (
                            <Badge key={s} variant="outline" className="text-[9px]">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {aiSuggestions.milestones?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Milestones:</p>
                  {aiSuggestions.milestones.map((m: any, i: number) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      Week {m.week}: <span className="font-medium text-foreground">{m.title}</span> — {m.description}
                    </p>
                  ))}
                </div>
              )}
              {aiSuggestions.tips?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Tips:</p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                    {aiSuggestions.tips.map((t: string, i: number) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          <Button className="w-full" onClick={handleSubmit} disabled={loading || !title || !description || !domainId}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
