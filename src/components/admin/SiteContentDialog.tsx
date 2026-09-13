import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Database, Plus, Pencil, Trash2, Search, ArrowLeft, Save, Table2 } from "lucide-react";

interface ColumnInfo {
  name: string;
  type: string;
}

interface ContentTable {
  name: string;
  rows: number;
  columns: ColumnInfo[];
}

interface Props {
  site: any | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  callAdmin: (action: string, method?: string, body?: any) => Promise<any>;
}

type Row = Record<string, unknown>;

const HIDDEN_COLS = new Set(["id", "owner_id", "created_at", "updated_at"]);
const LONG_TEXT = /^(body|content|description|excerpt|summary|bio|details|about|notes|text|markdown|html)$/i;
const IMAGE_COL = /(image|img|photo|picture|cover|thumbnail|avatar|logo)/i;

const COLUMN_TYPES = [
  { value: "text", label: "Text" },
  { value: "integer", label: "Whole number" },
  { value: "number", label: "Decimal number" },
  { value: "boolean", label: "Yes / No" },
  { value: "timestamp", label: "Date & time" },
  { value: "json", label: "JSON" },
  { value: "uuid", label: "Reference (id)" },
];

const PRESETS: { id: string; label: string; table: string; columns: { name: string; type: string }[] }[] = [
  {
    id: "articles",
    label: "Articles / Blog posts",
    table: "posts",
    columns: [
      { name: "title", type: "text" },
      { name: "slug", type: "text" },
      { name: "excerpt", type: "text" },
      { name: "body", type: "text" },
      { name: "cover_image", type: "text" },
      { name: "author", type: "text" },
      { name: "category", type: "text" },
      { name: "published", type: "boolean" },
      { name: "published_at", type: "timestamp" },
    ],
  },
  {
    id: "products",
    label: "Products",
    table: "products",
    columns: [
      { name: "name", type: "text" },
      { name: "slug", type: "text" },
      { name: "description", type: "text" },
      { name: "price_cents", type: "integer" },
      { name: "image_url", type: "text" },
      { name: "category", type: "text" },
      { name: "in_stock", type: "boolean" },
      { name: "stock", type: "integer" },
    ],
  },
  { id: "custom", label: "Custom table", table: "", columns: [{ name: "title", type: "text" }] },
];

const isNumeric = (t: string) => /int|double|numeric|real|decimal/i.test(t);
const isBool = (t: string) => t === "boolean";
const isTime = (t: string) => /timestamp|date/i.test(t);
const isJson = (t: string) => /json/i.test(t);

const toLocalInput = (v: unknown) => {
  if (!v) return "";
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const cellText = (v: unknown, type: string) => {
  if (v === null || v === undefined || v === "") return "—";
  if (isBool(type)) return v ? "Yes" : "No";
  if (isTime(type)) return new Date(String(v)).toLocaleString();
  if (isJson(type)) return typeof v === "string" ? v : JSON.stringify(v);
  const s = String(v);
  return s.length > 80 ? `${s.slice(0, 80)}…` : s;
};

const humanize = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function SiteContentDialog({ site, open, onClose, onSaved, callAdmin }: Props) {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<ContentTable[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ id: string | null; values: Record<string, unknown> } | null>(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [preset, setPreset] = useState("articles");
  const [newTable, setNewTable] = useState("posts");
  const [newCols, setNewCols] = useState<{ name: string; type: string }[]>(PRESETS[0].columns);

  const projectId: string | undefined = site?.id;
  const current = useMemo(() => tables.find((t) => t.name === selected) || null, [tables, selected]);
  const editableCols = useMemo(() => (current?.columns || []).filter((c) => !HIDDEN_COLS.has(c.name)), [current]);

  const loadTables = useCallback(async (keepSelection = true) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await callAdmin("site-content-tables", "POST", { projectId });
      if (data?.error) throw new Error(data.error);
      const list: ContentTable[] = data?.tables || [];
      setTables(list);
      setSelected((prev) => (keepSelection && prev && list.some((t) => t.name === prev) ? prev : list[0]?.name ?? null));
    } catch (e: any) {
      toast.error(e?.message || "Could not load site tables");
    } finally {
      setLoading(false);
    }
  }, [projectId, callAdmin]);

  const loadRows = useCallback(async () => {
    if (!projectId || !selected) { setRows([]); setTotal(0); return; }
    setRowsLoading(true);
    try {
      const data = await callAdmin("site-content-rows", "POST", { projectId, table: selected, q: query, limit: 200 });
      if (data?.error) throw new Error(data.error);
      setRows(data?.rows || []);
      setTotal(data?.total || 0);
    } catch (e: any) {
      toast.error(e?.message || "Could not load records");
    } finally {
      setRowsLoading(false);
    }
  }, [projectId, selected, query, callAdmin]);

  useEffect(() => {
    if (open && projectId) {
      setSelected(null); setRows([]); setEditing(null); setCreating(false); setQuery("");
      void loadTables(false);
    }
  }, [open, projectId, loadTables]);

  useEffect(() => { void loadRows(); }, [loadRows]);

  const startNew = () => {
    const values: Record<string, unknown> = {};
    for (const c of editableCols) values[c.name] = isBool(c.type) ? false : "";
    setEditing({ id: null, values });
  };

  const startEdit = (row: Row) => {
    const values: Record<string, unknown> = {};
    for (const c of editableCols) {
      const v = row[c.name];
      values[c.name] = isJson(c.type) && v && typeof v !== "string" ? JSON.stringify(v, null, 2) : v ?? (isBool(c.type) ? false : "");
    }
    setEditing({ id: String(row.id), values });
  };

  const saveRecord = async () => {
    if (!projectId || !selected || !editing) return;
    for (const c of editableCols) {
      if (isJson(c.type)) {
        const raw = editing.values[c.name];
        if (typeof raw === "string" && raw.trim()) {
          try { JSON.parse(raw); } catch { toast.error(`"${humanize(c.name)}" is not valid JSON`); return; }
        }
      }
    }
    setSaving(true);
    try {
      const data = await callAdmin("site-content-save", "POST", { projectId, table: selected, id: editing.id, values: editing.values });
      if (data?.error) throw new Error(data.error);
      toast.success(editing.id ? "Record updated" : "Record added");
      setEditing(null);
      await Promise.all([loadRows(), loadTables()]);
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Could not save record");
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (row: Row) => {
    if (!projectId || !selected) return;
    if (!confirm("Delete this record? This cannot be undone.")) return;
    try {
      const data = await callAdmin("site-content-delete", "POST", { projectId, table: selected, id: row.id });
      if (data?.error) throw new Error(data.error);
      toast.success("Record deleted");
      await Promise.all([loadRows(), loadTables()]);
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Could not delete record");
    }
  };

  const applyPreset = (id: string) => {
    setPreset(id);
    const p = PRESETS.find((x) => x.id === id) || PRESETS[0];
    setNewTable(p.table);
    setNewCols(p.columns.map((c) => ({ ...c })));
  };

  const createTable = async () => {
    if (!projectId) return;
    const table = newTable.trim().toLowerCase().replace(/[-\s]+/g, "_");
    if (!/^[a-z_][a-z0-9_]{0,40}$/.test(table)) { toast.error("Table name: lowercase letters, numbers and underscores only"); return; }
    const columns = newCols.filter((c) => c.name.trim());
    if (!columns.length) { toast.error("Add at least one column"); return; }
    setSaving(true);
    try {
      const data = await callAdmin("site-content-create-table", "POST", { projectId, table, columns });
      if (data?.error) throw new Error(data.error);
      toast.success(`Table "${table}" ready`);
      setCreating(false);
      await loadTables(false);
      setSelected(data?.table || table);
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Could not create table");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (c: ColumnInfo) => {
    if (!editing) return null;
    const v = editing.values[c.name];
    const set = (val: unknown) => setEditing((prev) => (prev ? { ...prev, values: { ...prev.values, [c.name]: val } } : prev));
    const id = `content-${c.name}`;
    if (isBool(c.type)) {
      return (
        <div key={c.name} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <Label htmlFor={id}>{humanize(c.name)}</Label>
          <Switch id={id} checked={!!v} onCheckedChange={set} />
        </div>
      );
    }
    if (isNumeric(c.type)) {
      const cents = /_cents$/i.test(c.name) && v !== "" && v !== null && Number.isFinite(Number(v));
      return (
        <div key={c.name} className="space-y-1.5">
          <Label htmlFor={id}>{humanize(c.name)}</Label>
          <Input id={id} type="number" step={/int/i.test(c.type) ? 1 : "any"} value={v === null || v === undefined ? "" : String(v)} onChange={(e) => set(e.target.value)} />
          {cents && <p className="text-xs text-muted-foreground">= ₹{(Number(v) / 100).toFixed(2)}</p>}
        </div>
      );
    }
    if (isTime(c.type)) {
      return (
        <div key={c.name} className="space-y-1.5">
          <Label htmlFor={id}>{humanize(c.name)}</Label>
          <Input id={id} type="datetime-local" value={toLocalInput(v)} onChange={(e) => set(e.target.value ? new Date(e.target.value).toISOString() : "")} />
        </div>
      );
    }
    if (isJson(c.type)) {
      return (
        <div key={c.name} className="space-y-1.5">
          <Label htmlFor={id}>{humanize(c.name)} <span className="text-xs text-muted-foreground">(JSON)</span></Label>
          <Textarea id={id} className="font-mono text-xs min-h-[120px]" value={typeof v === "string" ? v : v ? JSON.stringify(v, null, 2) : ""} onChange={(e) => set(e.target.value)} />
        </div>
      );
    }
    if (LONG_TEXT.test(c.name)) {
      return (
        <div key={c.name} className="space-y-1.5 md:col-span-2">
          <Label htmlFor={id}>{humanize(c.name)}</Label>
          <Textarea id={id} className="min-h-[220px]" placeholder="Write the full text here (Markdown or HTML is fine)" value={v === null || v === undefined ? "" : String(v)} onChange={(e) => set(e.target.value)} />
        </div>
      );
    }
    const isImg = IMAGE_COL.test(c.name);
    return (
      <div key={c.name} className="space-y-1.5">
        <Label htmlFor={id}>{humanize(c.name)}</Label>
        <Input id={id} value={v === null || v === undefined ? "" : String(v)} onChange={(e) => set(e.target.value)} placeholder={isImg ? "https://…" : undefined} />
        {isImg && typeof v === "string" && /^https?:\/\//.test(v) && (
          <img src={v} alt="" className="h-20 w-32 rounded-md object-cover border border-border" loading="lazy" />
        )}
      </div>
    );
  };

  const previewCols = editableCols.slice(0, 4);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3 flex-wrap">
            <Database className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg">Content — {site?.name || "site"}</DialogTitle>
            {site?.owner_email && <span className="text-xs text-muted-foreground">{site.owner_email}</span>}
            {site?.schema_name && <Badge variant="outline" className="font-mono text-[10px]">{site.schema_name}</Badge>}
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Tables */}
          <aside className="w-60 shrink-0 border-r border-border flex flex-col">
            <div className="px-3 py-2 flex items-center justify-between border-b border-border">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tables</span>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setCreating(true); setEditing(null); }}>
                <Plus className="h-3.5 w-3.5 mr-1" /> New
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading && <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" /></div>}
              {!loading && tables.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">No content tables yet. Create one to start writing.</p>
              )}
              {tables.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => { setSelected(t.name); setCreating(false); setEditing(null); setQuery(""); }}
                  className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                    selected === t.name && !creating ? "bg-primary/15 text-primary" : "hover:bg-muted text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate"><Table2 className="h-3.5 w-3.5 shrink-0" />{t.name}</span>
                  <span className="text-xs text-muted-foreground">{t.rows}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Main */}
          <section className="flex-1 min-w-0 flex flex-col">
            {creating ? (
              <div className="p-6 overflow-y-auto space-y-5">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setCreating(false)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
                  <h3 className="font-semibold">New content table</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Start from</Label>
                    <Select value={preset} onValueChange={applyPreset}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PRESETS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Table name</Label>
                    <Input value={newTable} onChange={(e) => setNewTable(e.target.value)} placeholder="e.g. posts, products, menu_items" />
                    <p className="text-xs text-muted-foreground">Pages read it at <code>/api/{newTable || "table"}</code></p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Columns</Label>
                  {newCols.map((c, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input className="flex-1" value={c.name} placeholder="column_name" onChange={(e) => setNewCols((prev) => prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                      <Select value={c.type} onValueChange={(v) => setNewCols((prev) => prev.map((x, j) => (j === i ? { ...x, type: v } : x)))}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>{COLUMN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => setNewCols((prev) => prev.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setNewCols((prev) => [...prev, { name: "", type: "text" }])}><Plus className="h-3.5 w-3.5 mr-1" />Add column</Button>
                </div>
                <p className="text-xs text-muted-foreground">id, created_at and updated_at are added automatically. Money should be a whole number of paise/cents (e.g. price_cents).</p>
                <Button onClick={createTable} disabled={saving} className="btn-primary-glow">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}Create table
                </Button>
              </div>
            ) : editing ? (
              <div className="flex flex-col h-full">
                <div className="px-6 py-3 border-b border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(null)}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
                    <h3 className="font-semibold">{editing.id ? "Edit record" : "New record"} <span className="text-muted-foreground font-normal">in {selected}</span></h3>
                  </div>
                  <Button onClick={saveRecord} disabled={saving} className="btn-primary-glow">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {editableCols.length === 0 ? (
                    <p className="text-sm text-muted-foreground">This table has no editable columns yet.</p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">{editableCols.map(renderField)}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="px-6 py-3 border-b border-border flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold">{selected || "Select a table"} {selected && <span className="text-muted-foreground font-normal text-sm">({total})</span>}</h3>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input className="pl-8 h-9 w-56" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} disabled={!selected} />
                    </div>
                    <Button onClick={startNew} disabled={!selected} className="btn-primary-glow h-9"><Plus className="h-4 w-4 mr-1" />New record</Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  {rowsLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin" /></div>
                  ) : !selected ? (
                    <p className="p-6 text-sm text-muted-foreground">Pick a table on the left, or create one.</p>
                  ) : rows.length === 0 ? (
                    <div className="p-10 text-center text-sm text-muted-foreground">
                      No records yet. Click <strong>New record</strong> to write the first one.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {previewCols.map((c) => <TableHead key={c.name}>{humanize(c.name)}</TableHead>)}
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((r) => (
                          <TableRow key={String(r.id)}>
                            {previewCols.map((c) => (
                              <TableCell key={c.name} className="text-sm max-w-[260px] truncate">
                                {IMAGE_COL.test(c.name) && typeof r[c.name] === "string" && /^https?:\/\//.test(String(r[c.name])) ? (
                                  <img src={String(r[c.name])} alt="" className="h-10 w-14 rounded object-cover border border-border" loading="lazy" />
                                ) : cellText(r[c.name], c.type)}
                              </TableCell>
                            ))}
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{r.created_at ? new Date(String(r.created_at)).toLocaleDateString() : "—"}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <Button size="sm" variant="ghost" onClick={() => startEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteRecord(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
