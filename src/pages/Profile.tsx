import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, Upload, FileText, CheckCircle2, XCircle, User as UserIcon, Save } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditHistoryPanel } from "@/components/CreditHistoryPanel";

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
const ALLOWED_RESUME_EXTS = [".pdf", ".doc", ".docx"];

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading, updateProfile, isUsernameAvailable, uploadResume, getResumeUrl, refresh } = useProfile();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [stream, setStream] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [wantsTeam, setWantsTeam] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);
  const resumeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setUsername(profile.username ?? "");
    setAge(profile.age ? String(profile.age) : "");
    setDob(profile.dob ?? "");
    setStream(profile.stream ?? "");
    setInterests(profile.interests ?? []);
    setWantsTeam(!!profile.wants_to_join_team);
  }, [profile]);

  const usernameChanged = username.trim() !== (profile?.username ?? "");
  const formatOk = usernamePattern.test(username.trim());

  useEffect(() => {
    if (!usernameChanged) {
      setAvailable(null);
      return;
    }
    if (!formatOk) {
      setAvailable(false);
      return;
    }
    setChecking(true);
    const t = setTimeout(async () => {
      const ok = await isUsernameAvailable(username.trim());
      setAvailable(ok);
      setChecking(false);
    }, 450);
    return () => clearTimeout(t);
  }, [username, usernameChanged, formatOk, isUsernameAvailable]);

  const initial = useMemo(
    () => (profile?.username || profile?.display_name || user?.email || "U").charAt(0).toUpperCase(),
    [profile, user],
  );

  if (!authLoading && !user) return <Navigate to="/auth" replace />;

  const toggleInterest = (item: string) =>
    setInterests((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));

  const handleAvatar = async (file: File | null) => {
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file.");
      return;
    }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      setUploadingAvatar(false);
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const res = await updateProfile({ avatar_url: data.publicUrl });
    setUploadingAvatar(false);
    if (res.error) toast.error(res.error.message);
    else toast.success("Profile photo updated");
  };

  const handleResume = async (file: File | null) => {
    if (!file) return;
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
    if (!ALLOWED_RESUME_EXTS.includes(ext)) {
      toast.error("Resume must be a PDF, DOC or DOCX file.");
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      toast.error("Resume must be under 5 MB.");
      return;
    }
    setUploadingResume(true);
    const { error, path } = await uploadResume(file);
    if (error || !path) {
      setUploadingResume(false);
      toast.error(error?.message ?? "Upload failed");
      return;
    }
    const res = await updateProfile({ resume_url: path, resume_filename: file.name });
    setUploadingResume(false);
    if (res.error) toast.error(res.error.message);
    else toast.success("Resume uploaded");
  };

  const viewResume = async () => {
    if (!profile?.resume_url) return;
    const url = await getResumeUrl(profile.resume_url);
    if (url) window.open(url, "_blank", "noopener");
    else toast.error("Could not open the resume.");
  };

  const save = async () => {
    if (usernameChanged && (!formatOk || available === false)) {
      toast.error("Pick an available username first.");
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({
      display_name: displayName.trim() || null,
      username: username.trim() || null,
      age: age ? Number(age) : null,
      dob: dob || null,
      stream: stream || null,
      interests,
      wants_to_join_team: wantsTeam,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "That username is already taken." : error.message);
      return;
    }
    await refresh();
    toast.success("Profile saved");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 pt-24 pb-20">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="mt-1 text-muted-foreground">Your handle is what other learners see across chat and projects.</p>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {/* Identity card */}
            <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-primary/40">
                  <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.username ?? "Avatar"} />
                  <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">{initial}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => avatarInput.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-primary"
                  aria-label="Change profile photo"
                >
                  {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                </button>
                <input
                  ref={avatarInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatar(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold text-foreground">{profile?.display_name || profile?.username || "Learner"}</p>
                {profile?.username && <p className="text-sm font-medium text-primary">@{profile.username}</p>}
                <p className="mt-1 truncate text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-5 rounded-xl border border-border bg-card p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display name</Label>
                  <Input id="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="your_handle"
                      className="pr-9"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {checking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {!checking && usernameChanged && available === true && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      {!checking && usernameChanged && available === false && <XCircle className="h-4 w-4 text-destructive" />}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{USERNAME_RULES}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" min={10} max={100} value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Stream</Label>
                  <Select value={stream} onValueChange={setStream}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {STREAMS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((item) => {
                    const active = interests.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleInterest(item)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Open to team invites</p>
                  <p className="text-xs text-muted-foreground">Let project builders find you for collaborations.</p>
                </div>
                <Switch checked={wantsTeam} onCheckedChange={setWantsTeam} />
              </div>
            </div>

            {/* Resume */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Resume (optional)</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">PDF, DOC or DOCX · up to 5 MB. Used only for internship shortlisting.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => resumeInput.current?.click()} disabled={uploadingResume}>
                  {uploadingResume ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
                  {profile?.resume_url ? "Replace resume" : "Upload resume"}
                </Button>
                {profile?.resume_url && (
                  <Button variant="ghost" size="sm" onClick={viewResume}>
                    View {profile.resume_filename ? `· ${profile.resume_filename}` : ""}
                  </Button>
                )}
                <input
                  ref={resumeInput}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleResume(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            {/* Credits */}
            <CreditHistoryPanel />



            <div className="flex items-center gap-3">
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                Save changes
              </Button>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <UserIcon className="h-3.5 w-3.5" /> Your handle appears in Community and Projects.
              </span>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
