import { useState } from "react";
import { Globe } from "lucide-react";
import { WEBSITE_BLUEPRINTS } from "@/lib/websiteGenerator";

interface WebsiteGeneratorPanelProps {
  disabled?: boolean;
  onGenerate: (prompt: string) => void;
  colors: { accent: string; text: string; muted: string; border: string; card: string; bg: string };
}

export function WebsiteGeneratorPanel({ disabled, onGenerate, colors }: WebsiteGeneratorPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium"
        style={{
          color: open ? colors.accent : colors.muted,
          backgroundColor: open ? colors.accent + "15" : "transparent",
        }}
      >
        <Globe className="h-3 w-3" />
        Website
      </button>
      {open && (
        <div className="mt-1.5 grid grid-cols-2 gap-1">
          {WEBSITE_BLUEPRINTS.map((blueprint) => (
            <button
              key={blueprint.id}
              type="button"
              disabled={disabled}
              onClick={() => onGenerate(blueprint.prompt)}
              className="rounded px-2 py-1.5 text-left disabled:opacity-50"
              style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
            >
              <span className="block text-[9px] font-medium" style={{ color: colors.text }}>{blueprint.label}</span>
              <span className="block text-[7px]" style={{ color: colors.muted }}>{blueprint.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
