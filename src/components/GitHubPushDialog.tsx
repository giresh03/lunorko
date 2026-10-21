import { useEffect, useState } from "react";
import { Github, Loader2, ExternalLink, Lock, Globe, Unlink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useGitHub } from "@/hooks/useGitHub";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: Array<{ path: string; content: string }>;
  projectName?: string;
}

export default function GitHubPushDialog({ open, onOpenChange, files, projectName }: Props) {
  const { status, loading, refresh, connectOAuth, savePat, disconnect, push } = useGitHub();
  const [pat, setPat] = useState("");
  const [showPat, setShowPat] = useState(false);
  const [repo, setRepo] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  useEffect(() => {
    if (!status.connected) return;
    setRepo(status.last_repo?.split("/").pop() ?? (projectName ?? "lunor-project"));
  }, [status.connected, status.last_repo, projectName]);

  const handleSavePat = async () => {
    setBusy(true);
    try {
      await savePat(pat);
      setPat("");
      setShowPat(false);
      toast.success("GitHub token saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save that token");
    } finally {
      setBusy(false);
    }
  };

  const handlePush = async () => {
    if (!files.length) {
      toast.error("There are no files to push yet");
      return;
    }
    setBusy(true);
    try {
      const result = await push(files, { repo, private: isPrivate });
      toast.success(result.created ? `Created ${result.repo}` : `Pushed ${result.fileCount} files to ${result.repo}`, {
        action: { label: "Open", onClick: () => window.open(result.repoUrl, "_blank", "noopener") },
      });
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Push failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-4 w-4" /> Push to GitHub
          </DialogTitle>
          <DialogDescription>
            Upload this project straight to your own GitHub account.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !status.connected ? (
          <div className="space-y-4">
            {status.oauth_available && (
              <Button className="w-full gap-2" onClick={connectOAuth} disabled={busy}>
                <Github className="h-4 w-4" /> Connect GitHub
              </Button>
            )}

            {!showPat ? (
              <Button variant="outline" className="w-full" onClick={() => setShowPat(true)}>
                {status.oauth_available ? "Use a personal access token instead" : "Connect with a personal access token"}
              </Button>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="gh-pat">Personal access token</Label>
                <Input
                  id="gh-pat"
                  type="password"
                  autoComplete="off"
                  placeholder="ghp_…"
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Create one at GitHub → Settings → Developer settings → Tokens, with the <code className="font-mono">repo</code> scope.
                </p>
                <Button className="w-full" onClick={handleSavePat} disabled={busy || pat.trim().length < 20}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save token
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
              <span className="flex items-center gap-2 text-sm text-foreground">
                <Github className="h-4 w-4" /> {status.login}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs text-muted-foreground"
                onClick={async () => {
                  await disconnect();
                  toast.success("GitHub disconnected");
                }}
              >
                <Unlink className="h-3 w-3" /> Disconnect
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gh-repo">Repository name</Label>
              <Input id="gh-repo" value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="my-website" />
              {status.last_repo && (
                <a
                  href={`https://github.com/${status.last_repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {status.last_repo} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="flex items-center gap-2 text-sm text-foreground">
                {isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                {isPrivate ? "Private repository" : "Public repository"}
              </span>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>

            <Button className="w-full gap-2" onClick={handlePush} disabled={busy || !repo.trim()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
              Push {files.length} file{files.length === 1 ? "" : "s"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
