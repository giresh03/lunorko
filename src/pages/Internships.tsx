import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import {
  Award, FileSignature, Rocket, IndianRupee, Upload, Loader2, CheckCircle2,
  Code2, Layout, Server, Layers, Brain, Megaphone, PenTool, ArrowRight,
  Sparkles, Github, Globe, FileCheck2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ROLES = [
  { id: "gen-ai-intern", label: "Gen AI Intern", Icon: Sparkles, blurb: "Build generative-AI features: LLM apps, agents, RAG and evaluation.", stipend: "₹15,000 / month", duration: "6 months" },
  { id: "web-development", label: "Web Development", Icon: Code2, blurb: "Build responsive, production-grade websites end to end." },
  { id: "frontend-developer", label: "Frontend Developer", Icon: Layout, blurb: "Craft pixel-perfect UI with React, Tailwind and motion." },
  { id: "backend-developer", label: "Backend Developer", Icon: Server, blurb: "Design APIs, databases, auth and scalable services." },
  { id: "fullstack-developer", label: "Full Stack Developer", Icon: Layers, blurb: "Own features from database schema to shipped UI." },
  { id: "ai-engineer", label: "AI Engineer", Icon: Brain, blurb: "Work on LLM pipelines, prompts, agents and evaluation." },
  { id: "social-media-handler", label: "Social Media Handler", Icon: Megaphone, blurb: "Run our channels, campaigns, reels and community growth." },
  { id: "graphic-designer", label: "Graphic Designer", Icon: PenTool, blurb: "Design posters, brand systems, thumbnails and product art." },
];

const BENEFITS = [
  { Icon: Award, title: "Government-verified certificate", desc: "Every completed internship ends with an officially verifiable certificate you can attach to any application." },
  { Icon: FileSignature, title: "Letter of recommendation", desc: "A personalised LOR from your mentor, detailing the real work you shipped." },
  { Icon: Rocket, title: "Direct PPO conversion", desc: "Top performers get a pre-placement offer to join the Lunor.AI core team directly." },
  { Icon: IndianRupee, title: "Stipend based on your work", desc: "Performance-linked stipend — the more impact you ship, the higher your payout." },
];

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTS = [".pdf", ".doc", ".docx"];

const applicationSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  college: z.string().trim().max(150).optional().or(z.literal("")),
  year_of_study: z.string().trim().max(50).optional().or(z.literal("")),
  portfolio_url: z.string().trim().url("Enter a valid URL").max(300).optional().or(z.literal("")),
  github_url: z.string().trim().url("Enter a valid URL").max(300).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url("Enter a valid URL").max(300).optional().or(z.literal("")),
  skills: z.string().trim().max(500).optional().or(z.literal("")),
  why_join: z.string().trim().max(1000).optional().or(z.literal("")),
});

const emptyForm = {
  full_name: "", email: "", phone: "", college: "", year_of_study: "",
  portfolio_url: "", github_url: "", linkedin_url: "", skills: "", why_join: "",
};

const Internships = () => {
  const { user } = useAuth();
  const { profile, uploadResume } = useProfile();
  const { toast } = useToast();

  const [openRole, setOpenRole] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const activeRole = ROLES.find((r) => r.id === openRole) || null;

  const startApply = (roleId: string) => {
    setForm({
      ...emptyForm,
      full_name: profile?.display_name || "",
      email: user?.email || "",
    });
    setFile(null);
    setSubmitted(false);
    setOpenRole(roleId);
  };

  const pickFile = (f: File | null) => {
    if (!f) return setFile(null);
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      toast({ title: "Unsupported file", description: "Upload a PDF, DOC or DOCX resume.", variant: "destructive" });
      return;
    }
    if (f.size > MAX_RESUME_BYTES) {
      toast({ title: "File too large", description: "Resume must be under 5MB.", variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const submit = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to apply for an internship." });
      return;
    }
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Check your details", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      let resumePath: string | null = null;
      let resumeName: string | null = null;
      if (file) {
        const { error, path } = await uploadResume(file);
        if (error) {
          toast({ title: "Resume upload failed", description: "You can re-apply with the resume later.", variant: "destructive" });
        } else {
          resumePath = path;
          resumeName = file.name;
        }
      }

      const v = parsed.data;
      const { error } = await supabase.from("internship_applications").insert({
        user_id: user.id,
        role: openRole!,
        full_name: v.full_name,
        email: v.email,
        phone: v.phone || null,
        college: v.college || null,
        year_of_study: v.year_of_study || null,
        portfolio_url: v.portfolio_url || null,
        github_url: v.github_url || null,
        linkedin_url: v.linkedin_url || null,
        skills: v.skills || null,
        why_join: v.why_join || null,
        resume_url: resumePath,
        resume_filename: resumeName,
      });
      if (error) throw error;

      setSubmitted(true);
      toast({ title: "Application submitted", description: "Our team will review it and reach out over email." });
    } catch (e: any) {
      toast({ title: "Could not submit", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Hero */}
        <section className="container mx-auto px-4 lg:px-6 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Now hiring interns · Remote friendly
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Internships at <span className="text-primary">Lunor.AI</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground">
              Work on a real AI product used by thousands of learners. Ship features, get mentored by
              engineers, and walk out with a verified certificate, a recommendation letter and a shot at a
              full-time offer.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="btn-sheen font-semibold shadow-glow"
                onClick={() => document.getElementById("open-roles")?.scrollIntoView({ behavior: "smooth" })}
              >
                View open roles <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {!user && (
                <Button size="lg" variant="outline" asChild>
                  <Link to="/auth">Sign in to apply</Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="container mx-auto px-4 lg:px-6 pb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center">What you get</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ Icon, title, desc }) => (
              <article
                key={title}
                className="group rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Roles */}
        <section id="open-roles" className="container mx-auto px-4 lg:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center">Open roles</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Pick a role, attach your resume and apply in under two minutes.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map(({ id, label, Icon, blurb, stipend, duration }: any) => (
              <article
                key={id}
                className="flex flex-col rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">{label}</h3>
                </div>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{blurb}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <span className="rounded-full border border-border/70 px-2 py-0.5">Remote</span>
                  {stipend ? (
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-medium text-primary">
                      {stipend}
                    </span>
                  ) : (
                    <span className="rounded-full border border-border/70 px-2 py-0.5">Stipend based on work</span>
                  )}
                  {duration && <span className="rounded-full border border-border/70 px-2 py-0.5">{duration}</span>}
                  <span className="rounded-full border border-border/70 px-2 py-0.5">PPO possible</span>
                </div>
                <Button className="mt-5 btn-sheen font-semibold" onClick={() => startApply(id)}>
                  Apply for internship
                </Button>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* Apply dialog */}
      <Dialog open={!!openRole} onOpenChange={(o) => !o && setOpenRole(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{submitted ? "Application received" : `Apply — ${activeRole?.label ?? ""}`}</DialogTitle>
            <DialogDescription>
              {submitted
                ? "We review every application manually and reply over email."
                : "Resume is optional but strongly recommended. Only the Lunor team can see it."}
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
              <p className="text-sm text-muted-foreground">
                Thanks {form.full_name || "there"} — your application for {activeRole?.label} is in.
              </p>
              <Button onClick={() => setOpenRole(null)}>Done</Button>
            </div>
          ) : !user ? (
            <div className="space-y-4 py-4 text-center">
              <p className="text-sm text-muted-foreground">Sign in so we can link the application to your profile.</p>
              <Button asChild className="w-full"><Link to="/auth">Sign in to continue</Link></Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ia-name">Full name *</Label>
                  <Input id="ia-name" maxLength={100} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ia-email">Email *</Label>
                  <Input id="ia-email" type="email" maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ia-phone">Phone</Label>
                  <Input id="ia-phone" maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ia-year">Year of study</Label>
                  <Input id="ia-year" placeholder="e.g. 2nd year" maxLength={50} value={form.year_of_study} onChange={(e) => setForm({ ...form, year_of_study: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ia-college">College / organisation</Label>
                <Input id="ia-college" maxLength={150} value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ia-github">GitHub URL</Label>
                  <Input id="ia-github" placeholder="https://github.com/…" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ia-portfolio">Portfolio URL</Label>
                  <Input id="ia-portfolio" placeholder="https://…" value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ia-linkedin">LinkedIn URL</Label>
                <Input id="ia-linkedin" placeholder="https://linkedin.com/in/…" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ia-skills">Skills</Label>
                <Input id="ia-skills" placeholder="React, Node, Figma…" maxLength={500} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ia-why">Why do you want this role?</Label>
                <Textarea id="ia-why" rows={3} maxLength={1000} value={form.why_join} onChange={(e) => setForm({ ...form, why_join: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ia-resume">Resume (optional)</Label>
                <label
                  htmlFor="ia-resume"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  <Upload className="h-4 w-4 shrink-0" />
                  <span className="truncate">{file ? file.name : "Upload resume (PDF, DOC or DOCX, max 5MB)"}</span>
                </label>
                <input
                  id="ia-resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                />
              </div>

              <Button className="w-full btn-sheen font-semibold" disabled={submitting} onClick={submit}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : "Submit application"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Internships;
