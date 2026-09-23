import { useState } from "react";
import { Wand2, X } from "lucide-react";
import {
  WEBSITE_KINDS,
  type WebsiteBrief,
  type WebsiteKind,
} from "@/lib/fullStackWebsiteGenerator";

interface ThemeColors {
  accent: string;
  text: string;
  muted: string;
  border: string;
  card: string;
  bg: string;
}

interface WebsiteGeneratorPanelProps {
  themeColors: ThemeColors;
  disabled?: boolean;
  onGenerate: (brief: WebsiteBrief) => void;
  onClose: () => void;
}

const ACCENT_CHOICES = ["#0f766e", "#4f46e5", "#b45309", "#be123c", "#0369a1"];

export function WebsiteGeneratorPanel({
  themeColors,
  disabled,
  onGenerate,
  onClose,
}: WebsiteGeneratorPanelProps) {
  const [name, setName] = useState("Northstar");
  const [tagline, setTagline] = useState("");
  const [kind, setKind] = useState<WebsiteKind>("landing");
  const [accent, setAccent] = useState(ACCENT_CHOICES[0]);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed || disabled) return;
    onGenerate({
      name: trimmed,
      tagline: tagline.trim() || undefined,
      kind,
      accent,
    });
  };

  return (
    <div className="border-t px-3 py-2 shrink-0" style={{ borderColor: themeColors.border, backgroundColor: themeColors.bg }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold flex items-center gap-1.5" style={{ color: themeColors.text }}>
          <Wand2 className="h-3 w-3" style={{ color: themeColors.accent }} />
          Full-stack website
        </span>
        <button type="button" onClick={onClose} className="p-0.5" style={{ color: themeColors.muted }} aria-label="Close website generator">
          <X className="h-3 w-3" />
        </button>
      </div>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Site name"
        aria-label="Site name"
        className="w-full rounded-md px-2 py-1.5 text-[11px] outline-none mb-1.5"
        style={{ backgroundColor: themeColors.card, color: themeColors.text, border: `1px solid ${themeColors.border}` }}
      />
      <input
        value={tagline}
        onChange={(event) => setTagline(event.target.value)}
        placeholder="Tagline (optional)"
        aria-label="Tagline"
        className="w-full rounded-md px-2 py-1.5 text-[11px] outline-none mb-2"
        style={{ backgroundColor: themeColors.card, color: themeColors.text, border: `1px solid ${themeColors.border}` }}
      />
      <div className="grid grid-cols-2 gap-1 mb-2">
        {WEBSITE_KINDS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setKind(entry.id)}
            className="rounded px-2 py-1.5 text-left"
            style={{
              backgroundColor: kind === entry.id ? themeColors.accent + "22" : themeColors.card,
              border: `1px solid ${kind === entry.id ? themeColors.accent : themeColors.border}`,
              color: themeColors.text,
            }}
          >
            <span className="block text-[10px] font-medium">{entry.label}</span>
            <span className="block text-[8px]" style={{ color: themeColors.muted }}>{entry.hint}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mb-2" aria-label="Accent color">
        {ACCENT_CHOICES.map((choice) => (
          <button
            key={choice}
            type="button"
            aria-label={`Accent ${choice}`}
            onClick={() => setAccent(choice)}
            className="h-4 w-4 rounded-full"
            style={{
              backgroundColor: choice,
              outline: accent === choice ? `2px solid ${themeColors.text}` : "none",
              outlineOffset: 1,
            }}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !name.trim()}
        className="w-full rounded-md py-1.5 text-[11px] font-semibold disabled:opacity-50"
        style={{ backgroundColor: themeColors.accent, color: "#ffffff" }}
      >
        Generate client + Express API
      </button>
    </div>
  );
}
