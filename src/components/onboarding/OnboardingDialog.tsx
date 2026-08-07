import { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles, Upload, CheckCircle2, XCircle, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useProfile, usernamePattern, USERNAME_RULES } from "@/hooks/useProfile";

const OnboardingDialog = () => {
  const { profile, needsOnboarding, updateProfile, isUsernameAvailable, uploadResume } = useProfile();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [wantsTeam, setWantsTeam] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (needsOnboarding) {
      setOpen(true);
      setUsername(profile?.username || (profile?.display_name || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 20));
    }
  }, [needsOnboarding, profile?.username, profile?.display_name]);

  const valid = usernamePattern.test(username.trim());

  useEffect(() => {
    if (!valid) {
      setAvailable(null);
      return;
    }
    let cancelled = false;
    setChecking(true);
    const t = setTimeout(async () => {
      const ok = await isUsernameAvailable(username);
      if (!cancelled) {
        setAvailable(ok);
        setChecking(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
      setChecking(false);
    };
  }, [username, valid, isUsernameAvailable]);

  const canSubmit = valid && available !== false && !saving;

  const hint = useMemo(() => {
    if (!username) return USERNAME_RULES;
    if (!valid) return USERNAME_RULES;
    if (checking) return "Checking availability…";
    if (available === false) return "That username is already taken.";
    if (available) return "Nice — that one's free.";
    return USERNAME_RULES;
  }, [username, valid, checking, available]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    let resumePath: string | null = null;
    let resumeName: string | null = null;

    if (wantsTeam && file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Resume must be under 5MB.");
        setSaving(false);
        return;
      }
      const { error, path } = await uploadResume(file);
      if (error) {
        toast.error("Resume upload failed. You can add it later from your dashboard.");
      } else {
        resumePath = path;
        resumeName = file.name;
      }
    }

    const { error } = await updateProfile({
      username: username.trim(),
      wants_to_join_team: wantsTeam,
      onboarded_at: new Date().toISOString(),
      ...(resumePath ? { resume_url: resumePath, resume_filename: resumeName } : {}),
    });
    setSaving(false);

    if (error) {
      toast.error(error.message.includes("profiles_username_lower_key") ? "That username was just taken. Try another." : "Could not save your profile.");
      setAvailable(false);
      return;
    }
    toast.success(`Welcome aboard, ${username.trim()}!`);
    setOpen(false);
  };

  if (!needsOnboarding && !open) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && valid) setOpen(false); }}>
      <DialogContent className="sm:max-w-md border-border/60 bg-card/95 backdrop-blur-xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl">Pick your username</DialogTitle>
          <DialogDescription>
            This is how you'll show up across the community, projects and leaderboards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="onboard-username">Username</Label>
            <div className="relative">
              <Input
                id="onboard-username"
                value={username}
                autoFocus
                maxLength={20}
                placeholder="e.g. code_ninja"
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="pr-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {!checking && available === true && <CheckCircle2 className="h-4 w-4 text-primary" />}
                {!checking && available === false && <XCircle className="h-4 w-4 text-destructive" />}
              </span>
            </div>
            <p className={`text-xs ${available === false ? "text-destructive" : "text-muted-foreground"}`}>{hint}</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Want to join the Lunor team?</p>
                <p className="text-xs text-muted-foreground">Totally optional — share a resume and we'll reach out.</p>
              </div>
              <Switch checked={wantsTeam} onCheckedChange={setWantsTeam} />
            </div>

            {wantsTeam && (
              <div className="mt-4 space-y-2">
                <label
                  htmlFor="onboard-resume"
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border/70 px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                >
                  {file ? <FileText className="h-4 w-4 text-primary" /> : <Upload className="h-4 w-4" />}
                  <span className="truncate">{file ? file.name : "Upload resume (PDF or DOC, max 5MB)"}</span>
                </label>
                <input
                  id="onboard-resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">Resume is private — only you and the Lunor team can see it.</p>
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn-sheen w-full bg-gradient-to-r from-primary to-primary-glow font-semibold text-primary-foreground shadow-glow"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving…" : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
