import { useState } from "react";
import { Wand2 } from "lucide-react";
import { WEBSITE_BLUEPRINTS, type WebsiteKind } from "@/lib/fullStackWebsiteGenerator";

interface ThemeColors {
  text: string;
  muted: string;
  accent: string;
  border: string;
  bg: string;
  card: string;
}

interface WebsiteGeneratorPanelProps {
  theme: ThemeColors;
  disabled?: boolean;
  onGenerate: (brief: string, kind?: WebsiteKind) => void;
}

export function WebsiteGeneratorPanel({ theme, disabled, onGenerate }: WebsiteGeneratorPanelProps) {
  const [brief, setBrief] = useState("");

  return (
    <div className="border-t px-2 py-2 shrink-0" style={{ borderColor: theme.border, backgroundColor: theme.card }}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <Wand2 className="h-3 w-3" style={{ color: theme.accent }} />
        <span className="text-[10px] font-semibold" style={{ color: theme.text }}>Website Generator</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {WEBSITE_BLUEPRINTS.map((blueprint) => (
          <button
            key={blueprint.id}
            type="button"
            disabled={disabled}
            onClick={() => onGenerate(blueprint.samplePrompt, blueprint.id)}
            className="rounded px-2 py-1.5 text-left disabled:opacity-50"
            style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}
            title={blueprint.description}
          >
            <span className="block text-[10px] font-medium">{blueprint.icon} {blueprint.name}</span>
            <span className="block text-[8px]" style={{ color: theme.muted }}>{blueprint.description}</span>
          </button>
        ))}
      </div>
      <form
        className="mt-1.5 flex gap-1"
        onSubmit={(event) => {
          event.preventDefault();
          onGenerate(brief.trim() || "Generate a full-stack website");
          setBrief("");
        }}
      >
        <input
          value={brief}
          onChange={(event) => setBrief(event.target.value)}
          disabled={disabled}
          placeholder="A coffee shop called Northbean"
          aria-label="Website brief"
          className="min-w-0 flex-1 rounded px-2 py-1 text-[10px] outline-none"
          style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded px-2 text-[10px] font-semibold disabled:opacity-50"
          style={{ backgroundColor: theme.accent, color: "#111" }}
        >
          Generate
        </button>
      </form>
    </div>
  );
}
