import { useState } from "react";
import { Wand2 } from "lucide-react";
import { WEBSITE_BLUEPRINTS, type WebsiteKind } from "@/lib/websiteGenerator";

interface WebsiteGeneratorPanelProps {
  disabled?: boolean;
  accent: string;
  text: string;
  muted: string;
  border: string;
  card: string;
  background: string;
  onApplyBlueprint: (kind: WebsiteKind) => void;
  onGenerate: (brief: string, kind: WebsiteKind) => void;
}

export function WebsiteGeneratorPanel({
  disabled,
  accent,
  text,
  muted,
  border,
  card,
  background,
  onApplyBlueprint,
  onGenerate,
}: WebsiteGeneratorPanelProps) {
  const [kind, setKind] = useState<WebsiteKind>("landing");
  const [brief, setBrief] = useState("");

  return (
    <div className="border-t px-2 py-2" style={{ borderColor: border, backgroundColor: card }}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <Wand2 className="h-3 w-3" style={{ color: accent }} />
        <span className="text-[10px] font-semibold" style={{ color: text }}>Website generator</span>
      </div>
      <p className="mb-1.5 text-[9px] leading-snug" style={{ color: muted }}>
        Drop a full-stack site into the editor: HTML, CSS, JS, and a Node API.
      </p>
      <div className="mb-1.5 grid grid-cols-2 gap-1">
        {WEBSITE_BLUEPRINTS.map((blueprint) => (
          <button
            key={blueprint.id}
            type="button"
            disabled={disabled}
            onClick={() => {
              setKind(blueprint.id);
              onApplyBlueprint(blueprint.id);
            }}
            className="rounded px-2 py-1.5 text-left transition-colors disabled:opacity-50"
            style={{
              backgroundColor: kind === blueprint.id ? accent + "18" : background,
              border: `1px solid ${kind === blueprint.id ? accent : border}`,
              color: text,
            }}
          >
            <span className="block text-[10px] font-medium">{blueprint.label}</span>
            <span className="block text-[8px] leading-snug" style={{ color: muted }}>{blueprint.description}</span>
          </button>
        ))}
      </div>
      <form
        className="flex gap-1"
        onSubmit={(event) => {
          event.preventDefault();
          if (disabled) return;
          onGenerate(brief.trim() || WEBSITE_BLUEPRINTS.find((item) => item.id === kind)?.description || "a modern website", kind);
        }}
      >
        <input
          value={brief}
          onChange={(event) => setBrief(event.target.value)}
          placeholder="Describe a site for the AI to generate"
          disabled={disabled}
          className="min-w-0 flex-1 rounded px-2 py-1 text-[10px] outline-none disabled:opacity-50"
          style={{ backgroundColor: background, color: text, border: `1px solid ${border}` }}
        />
        <button
          type="submit"
          disabled={disabled}
          className="shrink-0 rounded px-2 text-[10px] font-medium disabled:opacity-50"
          style={{ backgroundColor: accent, color: "#fff" }}
        >
          Generate
        </button>
      </form>
    </div>
  );
}
