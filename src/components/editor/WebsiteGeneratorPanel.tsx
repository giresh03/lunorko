import { useState } from "react";
import { Wand2 } from "lucide-react";
import { WEBSITE_BLUEPRINTS } from "@/lib/websiteGenerator";

interface WebsiteGeneratorPanelProps {
  themeColors: { accent: string; text: string; muted: string; border: string; card: string; bg: string };
  disabled?: boolean;
  onGenerate: (blueprintId: string, brief: string) => void;
}

export function WebsiteGeneratorPanel({ themeColors, disabled, onGenerate }: WebsiteGeneratorPanelProps) {
  const [brief, setBrief] = useState("");

  return (
    <div className="border-t shrink-0" style={{ borderColor: themeColors.border, backgroundColor: themeColors.bg }}>
      <div className="px-3 py-2 flex items-center gap-1.5 border-b" style={{ borderColor: themeColors.border, backgroundColor: themeColors.card }}>
        <Wand2 className="h-3 w-3" style={{ color: themeColors.accent }} />
        <span className="text-[10px] font-semibold" style={{ color: themeColors.text }}>Website Generator</span>
        <span className="text-[9px] ml-auto" style={{ color: themeColors.muted }}>Client + Express + MongoDB</span>
      </div>
      <div className="p-2 space-y-2">
        <div className="grid grid-cols-2 gap-1">
          {WEBSITE_BLUEPRINTS.map((blueprint) => (
            <button
              key={blueprint.id}
              type="button"
              disabled={disabled}
              onClick={() => onGenerate(blueprint.id, brief)}
              className="flex items-start gap-1.5 px-2 py-1.5 rounded text-left transition-colors disabled:opacity-50"
              style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}
            >
              <span className="text-sm leading-none">{blueprint.icon}</span>
              <span>
                <span className="text-[9px] font-medium block" style={{ color: themeColors.text }}>{blueprint.label}</span>
                <span className="text-[7px] block" style={{ color: themeColors.muted }}>{blueprint.description}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <input
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && brief.trim()) onGenerate("match", brief);
            }}
            placeholder="Describe a site, or pick a template"
            aria-label="Website brief"
            disabled={disabled}
            className="flex-1 rounded-md px-2 py-1 text-[10px] outline-none"
            style={{ backgroundColor: themeColors.card, color: themeColors.text, border: `1px solid ${themeColors.border}` }}
          />
          <button
            type="button"
            disabled={disabled || !brief.trim()}
            onClick={() => onGenerate("match", brief)}
            className="rounded-md px-2 text-[10px] font-medium disabled:opacity-50"
            style={{ backgroundColor: themeColors.accent, color: "#08111a" }}
          >
            Build
          </button>
        </div>
      </div>
    </div>
  );
}
