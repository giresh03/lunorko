import { useState } from "react";
import {
  ChevronDown, ChevronRight, RotateCw, FolderInput, Trash2, Layers, File as FileIcon, Cloud, HardDrive,
} from "lucide-react";
import { relativeTime, type GenerationEntry } from "@/lib/generationHistory";

interface UiColors {
  bg: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
}

interface Props {
  entries: GenerationEntry[];
  colors: UiColors;
  onRevisit: (entry: GenerationEntry) => void;
  onRerun: (entry: GenerationEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onOpenFile: (entry: GenerationEntry, path: string) => void;
}

export default function GenerationHistoryPanel({
  entries, colors, onRevisit, onRerun, onDelete, onClearAll, onOpenFile,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 text-center">
        <Layers className="mx-auto h-6 w-6 mb-2 opacity-40" style={{ color: colors.muted }} />
        <p className="text-[11px] leading-relaxed" style={{ color: colors.muted }}>
          No generations yet. Ask the AI assistant to build something — every generation is
          saved here so you can revisit or re-run it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b" style={{ borderColor: colors.border }}>
        <span className="text-[9px] uppercase tracking-wider" style={{ color: colors.muted }}>
          {entries.length} generation{entries.length === 1 ? "" : "s"}
        </span>
        <button onClick={onClearAll} className="text-[9px] uppercase tracking-wider hover:opacity-80" style={{ color: colors.accent }}>
          Clear all
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {entries.map((entry, i) => {
          const isOpen = expanded === entry.id;
          return (
            <div
              key={entry.id}
              className="mx-1.5 mb-1.5 rounded-md border animate-fade-in"
              style={{ borderColor: colors.border, backgroundColor: colors.bg, animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : entry.id)}
                className="flex w-full items-start gap-1.5 px-2 py-2 text-left"
              >
                {isOpen
                  ? <ChevronDown className="mt-0.5 h-3 w-3 shrink-0" style={{ color: colors.muted }} />
                  : <ChevronRight className="mt-0.5 h-3 w-3 shrink-0" style={{ color: colors.muted }} />}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[11px] leading-snug" style={{ color: colors.text }}>
                    {entry.prompt}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px]" style={{ color: colors.muted }}>{relativeTime(entry.createdAt)}</span>
                    <span className="text-[9px]" style={{ color: colors.muted }}>· {entry.files.length} files</span>
                    {entry.isFullStack && (
                      <span className="rounded px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide"
                        style={{ backgroundColor: colors.accent + "22", color: colors.accent }}>
                        Full-stack
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-0.5 text-[8px] uppercase tracking-wide"
                      style={{ color: colors.muted }}
                      title={entry.synced ? "Saved to your account" : "Only saved on this device"}
                    >
                      {entry.synced ? <Cloud className="h-2.5 w-2.5" /> : <HardDrive className="h-2.5 w-2.5" />}
                      {entry.synced ? "Synced" : "This device"}
                    </span>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="border-t px-2 py-1.5" style={{ borderColor: colors.border }}>
                  <div className="max-h-40 overflow-y-auto">
                    {entry.files.map((f) => (
                      <button
                        key={f.path}
                        onClick={() => onOpenFile(entry, f.path)}
                        className="flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left hover:opacity-80"
                        title={`Open ${f.path}`}
                      >
                        <FileIcon className="h-3 w-3 shrink-0" style={{ color: colors.muted }} />
                        <span className="truncate text-[10px]" style={{ color: colors.text }}>{f.path}</span>
                        <span className="ml-auto shrink-0 text-[9px]" style={{ color: colors.muted }}>
                          {Math.max(1, Math.round((f.content?.length || 0) / 1024))}kb
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center gap-1">
                    <button
                      onClick={() => onRevisit(entry)}
                      className="flex flex-1 items-center justify-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium"
                      style={{ backgroundColor: colors.accent + "1f", color: colors.accent }}
                    >
                      <FolderInput className="h-3 w-3" /> Revisit
                    </button>
                    <button
                      onClick={() => onRerun(entry)}
                      className="flex flex-1 items-center justify-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium border"
                      style={{ borderColor: colors.border, color: colors.text }}
                    >
                      <RotateCw className="h-3 w-3" /> Re-run
                    </button>
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="rounded p-1"
                      style={{ color: colors.muted }}
                      title="Delete from history"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
