import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Zap, Brain, Sparkles } from "lucide-react";
import { createPortal } from "react-dom";
import type { EditorTheme } from "@/lib/editorThemes";

export interface AIModel {
  id: string;
  label: string;
  description: string;
  icon: "fast" | "balanced" | "powerful";
}

export const DEFAULT_AI_MODEL = "google/gemini-3.1-pro-preview";

export const AI_MODELS: AIModel[] = [
  { id: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", description: "Highest quality (default)", icon: "powerful" },
  { id: "google/gemini-3.8-flash", label: "Gemini 3.8 Flash", description: "Fast & balanced", icon: "balanced" },
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash", description: "Previous fast model", icon: "fast" },
  { id: "google/gemini-3.1-flash-lite", label: "Gemini 3.1 Lite", description: "Fastest, simple edits", icon: "fast" },
];

/** Map any stored/legacy model id onto one that is still served. */
export function resolveModelId(id?: string | null): string {
  if (id && AI_MODELS.some((m) => m.id === id)) return id;
  return DEFAULT_AI_MODEL;
}

const iconMap = {
  fast: Zap,
  balanced: Sparkles,
  powerful: Brain,
};

interface ModelSelectorProps {
  selectedModel: string;
  onSelect: (modelId: string) => void;
  themeColors: EditorTheme["uiColors"];
}

const ModelSelector = ({ selectedModel, onSelect, themeColors }: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const current = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.top,
        left: Math.max(8, rect.right - 240),
      });
    }
  }, [open]);

  const dropdown = open ? createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
      <div
        className="fixed z-[9999] w-60 rounded-lg border py-1 overflow-y-auto"
        style={{
          top: Math.max(8, pos.top - AI_MODELS.length * 40 - 30),
          left: pos.left,
          maxHeight: "min(400px, 80vh)",
          backgroundColor: "#1a1a2e",
          borderColor: "#333",
          boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        <div className="px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#888" }}>
          AI Model
        </div>
        {AI_MODELS.map(model => {
          const Icon = iconMap[model.icon];
          const isSelected = model.id === selectedModel;
          return (
            <button
              key={model.id}
              onClick={() => { onSelect(model.id); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5"
              style={{
                color: isSelected ? "#f87171" : "#e0e0e0",
                backgroundColor: isSelected ? "rgba(129,140,248,0.12)" : "transparent",
              }}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: isSelected ? "#f87171" : "#888" }} />
              <div className="flex-1 text-left">
                <span className="font-medium">{model.label}</span>
                <span className="block text-[9px]" style={{ color: "#999" }}>{model.description}</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "#f87171" }} />}
            </button>
          );
        })}
      </div>
    </>,
    document.body
  ) : null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors"
        style={{ color: themeColors.muted, backgroundColor: open ? themeColors.accent + "15" : "transparent" }}
        title="Switch AI Model"
      >
        {(() => { const Icon = iconMap[current.icon]; return <Icon className="h-3 w-3" />; })()}
        <span className="hidden lg:inline">{current.label}</span>
        <ChevronDown className="h-2.5 w-2.5" />
      </button>
      {dropdown}
    </div>
  );
};

export default ModelSelector;
