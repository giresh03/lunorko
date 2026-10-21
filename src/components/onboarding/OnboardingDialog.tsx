import { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles, Upload, CheckCircle2, XCircle, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useProfile, usernamePattern, USERNAME_RULES } from "@/hooks/useProfile";

const STREAMS = ["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "AI & DS", "MCA / BCA", "Other"];
const INTERESTS = [
  "Web Development",
  "App Development",
  "AI / Machine Learning",
  "Cybersecurity",
  "Cloud",
  "DevOps",
  "Data Science",
  "UI / UX Design",
  "Blockchain",
  "Embedded / IoT",
];

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_RESUME_EXTS = [".pdf", ".doc", ".docx"];

const OnboardingDialog = () => {
  const { profile, needsOnboarding, updateProfile, isUsernameAvailable, uploadResume } = useProfile();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [stream, setStream] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [wantsTeam, setWantsTeam] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePickFile = (f: File | null) => {
    setFileError(null);
    if (!f) {
      setFile(null);
      return;
    }
    const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "");
    const extOk = ALLOWED_RESUME_EXTS.includes(ext);
    const typeOk = f.type ? ALLOWED_RESUME_TYPES.includes(f.type) : true;
    if (!extOk || !typeOk) {
      setFile(null);
      setFileError("Unsupported file — please upload a PDF, DOC or DOCX.");
      return;
    }
    if (f.size > MAX_RESUME_BYTES) {
      setFile(null);
      setFileError(`That file is ${(f.size / 1024 / 1024).toFixed(1)}MB — the limit is 5MB.`);
      return;
    }
    if (f.size === 0) {
      setFile(null);
      setFileError("That file appears to be empty.");
      return;
    }
    setFile(f);
  };

  useEffect(() => {
    if (needsOnboarding) {
      setOpen(true);
      setUsername(profile?.username || "");
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

  const ageNum = Number(age);
  const ageOk = !age || (Number.isFinite(ageNum) && ageNum >= 10 && ageNum <= 100);
  const canContinue = valid && available !== false && ageOk;
  const canSubmit = canContinue && !saving;

  const hint = useMemo(() => {
    if (!username) return USERNAME_RULES;
    if (!valid) return USERNAME_RULES;
    if (checking) return "Checking availability…";
    if (available === false) return "That username is already taken.";
    if (available) return "Nice — that one's free.";
    return USERNAME_RULES;
  }, [username, valid, checking, available]);

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    let resumePath: string | null = null;
    let resumeName: string | null = null;

    if (file) {
      if (fileError) {
        setSaving(false);
        return;
      }
      setUploading(true);
      const { error, path } = await uploadResume(file);
      setUploading(false);
      if (error) {
        const m = (error.message || "").toLowerCase();
        const msg =
          m.includes("exceeded") || m.includes("too large")
            ? "Resume is too large for upload (max 5MB)."
            : m.includes("mime") || m.includes("type")
              ? "That file type isn't accepted. Use PDF, DOC or DOCX."
              : m.includes("network") || m.includes("fetch")
                ? "Upload failed — check your connection and try again."
                : "Resume upload failed. You can add it later from your dashboard.";
        setFileError(msg);
        toast.error(msg);
      } else {
        resumePath = path;
        resumeName = file.name;
      }
    }

    const { error } = await updateProfile({
      username: username.trim(),
      age: age ? ageNum : null,
      dob: dob || null,
      stream: stream || null,
      interests,
      wants_to_join_team: wantsTeam,
      onboarded_at: new Date().toISOString(),
      ...(resumePath ? { resume_url: resumePath, resume_filename: resumeName } : {}),
    });
    setSaving(false);

    if (error) {
      toast.error(
        error.message.includes("profiles_username_lower_key")
          ? "That username was just taken. Try another."
          : "Could not save your profile.",
      );
      setAvailable(false);
      setStep(1);
      return;
    }
    toast.success(`Welcome aboard, ${username.trim()}!`);
    setOpen(false);
  };

  if (!needsOnboarding && !open) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && valid) setOpen(false); }}>
      <DialogContent
        className="sm:max-w-lg border-border/60 bg-card/95 backdrop-blur-xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl">
            {step === 1 ? "Set up your profile" : "Tell us what you're into"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "This is how you'll show up across the community, projects and leaderboards."
              : "Helps us tailor domains, projects and internship opportunities for you."}
          </DialogDescription>
          <div className="mt-3 flex gap-1.5">
            {[1, 2].map((s) => (
              <span
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>
        </DialogHeader>

        {step === 1 ? (
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="onboard-age">Age <span className="text-muted-foreground">(optional)</span></Label>
                <Input
                  id="onboard-age"
                  type="number"
                  min={10}
                  max={100}
                  value={age}
                  placeholder="20"
                  onChange={(e) => setAge(e.target.value)}
                />
                {!ageOk && <p className="text-xs text-destructive">Enter an age between 10 and 100.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="onboard-dob">Date of birth <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="onboard-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!canContinue}
              className="btn-sheen w-full bg-gradient-to-r from-primary to-primary-glow font-semibold text-primary-foreground shadow-glow"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Stream <span className="text-muted-foreground">(optional)</span></Label>
              <Select value={stream} onValueChange={setStream}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your stream" />
                </SelectTrigger>
                <SelectContent>
                  {STREAMS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Interested in</Label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => {
                  const on = interests.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleInterest(i)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-all duration-200 ${
                        on
                          ? "border-primary bg-primary/15 text-foreground shadow-glow"
                          : "border-border/70 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Open to internships with Lunor?</p>
                  <p className="text-xs text-muted-foreground">Optional — share a resume and we'll reach out.</p>
                </div>
                <Switch checked={wantsTeam} onCheckedChange={setWantsTeam} />
              </div>

              {wantsTeam && (
                <div className="mt-4 space-y-2">
                  <label
                    htmlFor="onboard-resume"
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-3 py-3 text-sm transition-colors hover:text-foreground ${
                      fileError
                        ? "border-destructive/60 text-destructive"
                        : "border-border/70 text-muted-foreground hover:border-primary/60"
                    }`}
                  >
                    {file ? <FileText className="h-4 w-4 text-primary" /> : <Upload className="h-4 w-4" />}
                    <span className="truncate">{file ? file.name : "Upload resume (PDF, DOC or DOCX, max 5MB) — not mandatory"}</span>
                  </label>
                  <input
                    id="onboard-resume"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
                  />
                  {fileError && <p className="text-xs text-destructive">{fileError}</p>}
                  {file && !fileError && (
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)}MB — ready to upload
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Resume is private — only you and the Lunor team can see it.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} disabled={saving}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="btn-sheen flex-1 bg-gradient-to-r from-primary to-primary-glow font-semibold text-primary-foreground shadow-glow"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {uploading ? "Uploading resume…" : saving ? "Saving…" : "Finish & enter Lunor"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
