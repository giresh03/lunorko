import { useState, useEffect } from "react";
import { FilePlus, FileCode, Save, Trash2, Loader2, History, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";

interface TeamFile {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  content: string;
  language: string;
  last_edited_by: string | null;
  updated_at: string;
}

interface FileVersion {
  id: string;
  file_id: string;
  content: string;
  saved_by: string;
  created_at: string;
}

interface TeamFileEditorProps {
  projectId: string;
  profiles: Record<string, string>;
}

const LANGUAGES = ["javascript", "typescript", "python", "html", "css", "json", "markdown", "sql", "java", "cpp"];

const TeamFileEditor = ({ projectId, profiles }: TeamFileEditorProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<TeamFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileLang, setNewFileLang] = useState("javascript");
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<FileVersion | null>(null);

  const activeFile = files.find((f) => f.id === activeFileId);

  const fetchVersions = async (fileId: string) => {
    setLoadingVersions(true);
    const { data } = await supabase
      .from("team_file_versions")
      .select("id, file_id, content, saved_by, created_at")
      .eq("file_id", fileId)
      .order("created_at", { ascending: false })
      .limit(50);
    setVersions((data as FileVersion[]) || []);
    setLoadingVersions(false);
  };

  useEffect(() => {
    setPreviewVersion(null);
    if (showHistory && activeFileId) fetchVersions(activeFileId);
  }, [showHistory, activeFileId]);

  const restoreVersion = (v: FileVersion) => {
    setContent(v.content);
    setPreviewVersion(null);
    toast.info("Version loaded into editor — click Save to keep it");
  };

  const fetchFiles = async () => {
    const { data } = await supabase
      .from("team_files")
      .select("*")
      .eq("project_id", projectId)
      .order("file_name");
    if (data) {
      setFiles(data as TeamFile[]);
      if (!activeFileId && data.length > 0) {
        setActiveFileId(data[0].id);
        setContent(data[0].content || "");
      }
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  // Real-time file updates
  useEffect(() => {
    const channel = supabase
      .channel(`team-files-${projectId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "team_files",
        filter: `project_id=eq.${projectId}`,
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setFiles((prev) => [...prev, payload.new as TeamFile]);
        } else if (payload.eventType === "UPDATE") {
          const updated = payload.new as TeamFile;
          setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
          // If another user updated the active file, refresh content
          if (updated.id === activeFileId && updated.last_edited_by !== user?.id) {
            setContent(updated.content || "");
          }
        } else if (payload.eventType === "DELETE") {
          const old = payload.old as { id: string };
          setFiles((prev) => prev.filter((f) => f.id !== old.id));
          if (activeFileId === old.id) {
            setActiveFileId(null);
            setContent("");
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [projectId, activeFileId, user?.id]);

  const selectFile = (file: TeamFile) => {
    setActiveFileId(file.id);
    setContent(file.content || "");
  };

  const saveFile = async () => {
    if (!activeFileId || !user) return;
    setSaving(true);
    const { error } = await supabase
      .from("team_files")
      .update({ content, last_edited_by: user.id })
      .eq("id", activeFileId);
    if (error) {
      toast.error("Failed to save");
    } else {
      toast.success("Saved!");
      // Keep a version of every save so the team can look back and restore.
      const { error: vErr } = await supabase.from("team_file_versions").insert({
        file_id: activeFileId,
        project_id: projectId,
        content,
        saved_by: user.id,
      });
      if (vErr) console.warn("[team-files] version not recorded", vErr.message);
      else if (showHistory) fetchVersions(activeFileId);
    }
    setSaving(false);
  };

  const createFile = async () => {
    if (!newFileName.trim() || !user) return;
    const { error } = await supabase.from("team_files").insert({
      project_id: projectId,
      file_name: newFileName.trim(),
      language: newFileLang,
      content: "",
      last_edited_by: user.id,
    });
    if (error) toast.error(error.message);
    else {
      setNewFileName("");
      setShowNewFile(false);
      fetchFiles();
    }
  };

  const deleteFile = async (id: string) => {
    await supabase.from("team_files").delete().eq("id", id);
    fetchFiles();
  };

  return (
    <div className="flex h-[500px] rounded-lg border border-border overflow-hidden bg-card">
      {/* File sidebar */}
      <div className="w-48 border-r border-border flex flex-col bg-muted/30">
        <div className="p-2 border-b border-border flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">Files</span>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowNewFile(!showNewFile)}>
            <FilePlus className="h-3.5 w-3.5" />
          </Button>
        </div>
        {showNewFile && (
          <div className="p-2 border-b border-border space-y-1.5">
            <Input className="h-7 text-xs" placeholder="filename.js" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createFile()} />
            <Select value={newFileLang} onValueChange={setNewFileLang}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" className="w-full h-7 text-xs" onClick={createFile}>Create</Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {files.map((f) => (
            <div
              key={f.id}
              onClick={() => selectFile(f)}
              className={`flex items-center gap-1.5 px-2 py-1.5 text-xs cursor-pointer hover:bg-muted/50 group ${activeFileId === f.id ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
            >
              <FileCode className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate flex-1">{f.file_name}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5 opacity-0 group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); deleteFile(f.id); }}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
          {files.length === 0 && (
            <div className="p-3 text-xs text-muted-foreground text-center">No files yet</div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {activeFile ? (
          <>
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">{activeFile.file_name}</span>
                <Badge variant="outline" className="text-[9px]">{activeFile.language}</Badge>
                {activeFile.last_edited_by && (
                  <span className="text-[9px] text-muted-foreground">
                    Last edit: {profiles[activeFile.last_edited_by] || "Unknown"}
                  </span>
                )}
              </div>
              <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={saveFile} disabled={saving}>
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Save
              </Button>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                language={activeFile.language}
                value={content}
                onChange={(v) => setContent(v || "")}
                theme="vs-dark"
                options={{ fontSize: 13, minimap: { enabled: false }, wordWrap: "on", padding: { top: 8 } }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Select or create a file to start coding
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamFileEditor;
