import { Wand2 } from "lucide-react";
import { WEBSITE_BLUEPRINTS, type WebsiteKind } from "@/lib/websiteGenerator";

interface WebsiteGeneratorPanelProps {
  disabled?: boolean;
  onGenerate: (kind: WebsiteKind) => void;
  themeColors: { bg: string; card: string; border: string; text: string; muted: string; accent: string };
}

export function WebsiteGeneratorPanel({ disabled, onGenerate, themeColors }: WebsiteGeneratorPanelProps) {
  return (
    <div
      className="border-t overflow-y-auto shrink-0"
      style={{ borderColor: themeColors.border, backgroundColor: themeColors.bg, maxHeight: 220 }}
    >
      <div className="px-3 py-2 border-b" style={{ borderColor: themeColors.border }}>
        <span className="text-[10px] font-semibold flex items-center gap-1.5" style={{ color: themeColors.text }}>
          <Wand2 className="h-3 w-3" style={{ color: themeColors.accent }} />
          Full-stack website generator
        </span>
        <p className="text-[9px] mt-1" style={{ color: themeColors.muted }}>
          Writes a client and an Express API into this project.
        </p>
      </div>
      <div className="p-2 grid grid-cols-2 gap-1">
        {WEBSITE_BLUEPRINTS.map((blueprint) => (
          <button
            key={blueprint.id}
            type="button"
            disabled={disabled}
            onClick={() => onGenerate(blueprint.id)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded text-left transition-colors disabled:opacity-50"
            style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}
          >
            <span className="text-sm" aria-hidden>{blueprint.icon}</span>
            <span>
              <span className="text-[10px] font-medium block" style={{ color: themeColors.text }}>{blueprint.label}</span>
              <span className="text-[8px]" style={{ color: themeColors.muted }}>{blueprint.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
