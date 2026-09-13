import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, FileCode, Palette, Save } from "lucide-react";

const FONTS = [
  "Sora",
  "Outfit",
  "Space Grotesk",
  "Plus Jakarta Sans",
  "Inter",
  "DM Sans",
  "Manrope",
  "Instrument Serif",
];

interface SiteFile {
  path: string;
  content: string;
  language?: string;
}

interface SiteTheme {
  accent?: string;
  background?: string;
  surface?: string;
  text?: string;
  headingFont?: string;
  bodyFont?: string;
}

interface Props {
  site: any | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  callAdmin: (action: string, method?: string, body?: any) => Promise<any>;
}

function sortFiles(files: SiteFile[]): SiteFile[] {
  const rank = (p: string) => {
    const n = p.toLowerCase();
    if (n.endsWith("index.html")) return 0;
    if (n.endsWith(".html")) return 1;
    if (n.endsWith(".css")) return 2;
    if (n.endsWith(".js")) return 3;
    return 4;
  };
  return [...files].sort((a, b) => rank(a.path) - rank(b.path) || a.path.localeCompare(b.path));
}

const SiteEditorDialog = ({ site, open, onClose, onSaved, callAdmin }: Props) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);
  const [files, setFiles] = useState<SiteFile[]>([]);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<string>("");
  const [theme, setTheme] = useState<SiteTheme>({});

  useEffect(() => {
    if (!open || !site?.id) return;
    let cancelled = false;
    setLoading(true);
    setDirty({});
    (async () => {
      try {
        const data = await callAdmin("site-files", "POST", { projectId: site.id });
        if (cancelled) return;
        const list = sortFiles(Array.isArray(data?.files) ? data.files : []);
        setFiles(list);
        setName(data?.name || site.name || "");
        setClientId(data?.clientId ?? null);
        setTheme(data?.theme || {});
        setActive(list[0]?.path || "");
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Could not load this site");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, site?.id, site?.name, callAdmin]);

  const activeFile = useMemo(() => files.find((f) => f.path === active) || null, [files, active]);

  const updateContent = (value: string) => {
    if (!activeFile) return;
    setFiles((prev) => prev.map((f) => (f.path === activeFile.path ? { ...f, content: value } : f)));
    setDirty((prev) => ({ ...prev, [activeFile.path]: true }));
  };

  const handleSave = async () => {
    if (!site?.id) return;
    setSaving(true);
    try {
      const res = await callAdmin("site-update", "POST", {
        projectId: site.id,
        name,
        clientId,
        files,
        theme,
      });
      if (res?.error) throw new Error(res.error);
      if (Array.isArray(res?.files)) setFiles(sortFiles(res.files));
      setDirty({});
      toast.success("Site updated");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-6xl w-[96vw] max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-3">
            <span>Edit site</span>
            {site?.status === "live" && (
              <Badge className="bg-green-500/15 text-green-400 border-green-500/30">Live backend</Badge>
            )}
            {site?.owner_email && (
              <span className="text-xs font-normal text-muted-foreground">{site.owner_email}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading pages…
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="site-name">Site name</Label>
                <Input id="site-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Bella Cucina" />
              </div>
              <div className="text-xs text-muted-foreground self-end">
                Workspace: {site?.scope_key || site?.scope} · {files.length} file{files.length === 1 ? "" : "s"}
              </div>
            </div>

            {/* Theme */}
            <div className="rounded-xl border border-border p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Palette className="h-4 w-4 text-primary" /> Theme
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                {([
                  ["accent", "Accent"],
                  ["background", "Background"],
                  ["surface", "Surface"],
                  ["text", "Text"],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <Label className="text-xs">{label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        aria-label={`${label} colour`}
                        className="h-9 w-10 rounded border border-border bg-transparent"
                        value={/^#[0-9a-f]{6}$/i.test(theme[key] || "") ? (theme[key] as string) : "#e11d48"}
                        onChange={(e) => setTheme((t) => ({ ...t, [key]: e.target.value }))}
                      />
                      <Input
                        value={theme[key] || ""}
                        placeholder="#e11d48"
                        onChange={(e) => setTheme((t) => ({ ...t, [key]: e.target.value }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ["headingFont", "Heading font"],
                  ["bodyFont", "Body font"],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <Label className="text-xs">{label}</Label>
                    <Select
                      value={theme[key] || ""}
                      onValueChange={(v) => setTheme((t) => ({ ...t, [key]: v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Keep current font" /></SelectTrigger>
                      <SelectContent>
                        {FONTS.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div
                className="rounded-lg border border-border p-4"
                style={{
                  background: theme.background || undefined,
                  color: theme.text || undefined,
                  fontFamily: theme.bodyFont ? `'${theme.bodyFont}', sans-serif` : undefined,
                }}
              >
                <p
                  className="text-lg font-bold"
                  style={{ fontFamily: theme.headingFont ? `'${theme.headingFont}', serif` : undefined }}
                >
                  {name || "Your site"}
                </p>
                <p className="text-sm opacity-80">Preview of headings, body text and the accent button.</p>
                <span
                  className="mt-3 inline-block rounded-md px-3 py-1.5 text-sm text-white"
                  style={{ background: theme.accent || "#e11d48" }}
                >
                  Call to action
                </span>
              </div>
            </div>

            {/* Pages */}
            <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
              <div className="rounded-xl border border-border p-2 h-fit max-h-[360px] overflow-y-auto">
                {files.map((f) => (
                  <button
                    key={f.path}
                    onClick={() => setActive(f.path)}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center gap-2 ${
                      active === f.path ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{f.path}</span>
                    {dirty[f.path] && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                  </button>
                ))}
                {files.length === 0 && (
                  <p className="p-3 text-xs text-muted-foreground">
                    No saved pages for this site yet — the owner has not generated any files.
                  </p>
                )}
              </div>
              <Textarea
                value={activeFile?.content || ""}
                onChange={(e) => updateContent(e.target.value)}
                spellCheck={false}
                disabled={!activeFile}
                className="min-h-[360px] font-mono text-xs leading-relaxed"
                placeholder="Select a page to edit its code"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SiteEditorDialog;
