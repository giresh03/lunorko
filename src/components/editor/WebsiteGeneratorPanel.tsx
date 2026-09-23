import { useState } from "react";
import { ChevronDown, Wand2 } from "lucide-react";
import { WEBSITE_AUTOMATIONS, type WebsiteKind } from "@/lib/websiteGenerator";

interface ThemeColors {
  bg: string;
  card?: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
}

interface WebsiteGeneratorPanelProps {
  themeColors: ThemeColors;
  disabled?: boolean;
  onGenerate: (kind: WebsiteKind, name: string) => void;
}

export default function WebsiteGeneratorPanel({ themeColors, disabled, onGenerate }: WebsiteGeneratorPanelProps) {
  const [open, setOpen] = useState(true);
  const [kind, setKind] = useState<WebsiteKind>("saas");
  const [name, setName] = useState("");
  const selected = WEBSITE_AUTOMATIONS.find((item) => item.id === kind);

  return (
    <div className="border-t shrink-0" style={{ borderColor: themeColors.border, backgroundColor: themeColors.card || themeColors.bg }}>
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-1.5 px-3 py-2 text-left">
        <Wand2 className="h-3.5 w-3.5" style={{ color: themeColors.accent }} />
        <span className="text-[11px] font-semibold" style={{ color: themeColors.text }}>Website generator</span>
        <span className="text-[9px]" style={{ color: themeColors.muted }}>Full stack</span>
        <ChevronDown className={`ml-auto h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: themeColors.muted }} />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          <div className="grid grid-cols-3 gap-1">
            {WEBSITE_AUTOMATIONS.map((automation) => (
              <button
                key={automation.id}
                type="button"
                onClick={() => setKind(automation.id)}
                className="rounded-md px-1.5 py-1.5 text-left"
                style={{
                  backgroundColor: kind === automation.id ? themeColors.accent + "22" : "transparent",
                  border: `1px solid ${kind === automation.id ? themeColors.accent : themeColors.border}`,
                  color: themeColors.text,
                }}
              >
                <span className="block text-[10px] font-medium">{automation.icon} {automation.label}</span>
                <span className="block text-[8px] leading-tight" style={{ color: themeColors.muted }}>{automation.description}</span>
              </button>
            ))}
          </div>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={selected?.defaultName || "Site name"}
            className="w-full rounded-md px-2.5 py-1.5 text-xs outline-none"
            style={{ backgroundColor: "transparent", color: themeColors.text, border: `1px solid ${themeColors.border}` }}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => onGenerate(kind, name)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium disabled:opacity-50"
            style={{ backgroundColor: themeColors.accent, color: "#ffffff" }}
          >
            <Wand2 className="h-3 w-3" />
            Generate website code
          </button>
          <p className="text-[9px] leading-snug" style={{ color: themeColors.muted }}>
            Writes client/index.html, styles, and script plus an Express API. You can also type “Build a restaurant website called Harbor”.
          </p>
        </div>
      )}
    </div>
  );
}
