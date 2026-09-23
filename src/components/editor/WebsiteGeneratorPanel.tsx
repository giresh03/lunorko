import { useState } from "react";
import { Wand2 } from "lucide-react";
import {
  WEBSITE_KINDS,
  generateFullStackWebsite,
  type GeneratedWebsite,
  type WebsiteKind,
} from "@/lib/websiteGenerator";

interface UiColors {
  text: string;
  muted: string;
  accent: string;
  border: string;
  card: string;
  bg: string;
}

interface WebsiteGeneratorPanelProps {
  ui: UiColors;
  onGenerate: (project: GeneratedWebsite) => void;
}

const WebsiteGeneratorPanel = ({ ui, onGenerate }: WebsiteGeneratorPanelProps) => {
  const [kind, setKind] = useState<WebsiteKind>("portfolio");
  const [name, setName] = useState(WEBSITE_KINDS[0].defaultName);

  const selectKind = (next: WebsiteKind) => {
    const meta = WEBSITE_KINDS.find((item) => item.id === next);
    setKind(next);
    if (meta && (name.trim() === "" || WEBSITE_KINDS.some((item) => item.defaultName === name))) {
      setName(meta.defaultName);
    }
  };

  return (
    <div className="border-t shrink-0" style={{ borderColor: ui.border, backgroundColor: ui.bg }}>
      <div className="px-3 py-2 flex items-center gap-1.5 border-b" style={{ borderColor: ui.border, backgroundColor: ui.card }}>
        <Wand2 className="h-3 w-3" style={{ color: ui.accent }} />
        <span className="text-[10px] font-semibold" style={{ color: ui.text }}>Full-stack website generator</span>
      </div>
      <div className="p-2 space-y-2">
        <div className="grid grid-cols-2 gap-1" role="listbox" aria-label="Website type">
          {WEBSITE_KINDS.map((item) => {
            const active = item.id === kind;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => selectKind(item.id)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded text-left"
                style={{
                  backgroundColor: active ? ui.accent + "22" : ui.card,
                  border: `1px solid ${active ? ui.accent : ui.border}`,
                }}
              >
                <span className="text-sm" aria-hidden>{item.icon}</span>
                <span>
                  <span className="text-[9px] font-medium block" style={{ color: ui.text }}>{item.label}</span>
                  <span className="text-[7px] block" style={{ color: ui.muted }}>{item.description}</span>
                </span>
              </button>
            );
          })}
        </div>
        <label className="block text-[9px]" style={{ color: ui.muted }}>
          Site name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md px-2 py-1.5 text-xs outline-none"
            style={{ backgroundColor: ui.card, color: ui.text, border: `1px solid ${ui.border}` }}
          />
        </label>
        <button
          type="button"
          onClick={() => onGenerate(generateFullStackWebsite({ kind, name }))}
          className="w-full rounded-md px-2 py-1.5 text-[11px] font-medium"
          style={{ backgroundColor: ui.accent, color: "#0c0f14" }}
        >
          Generate website code
        </button>
      </div>
    </div>
  );
};

export default WebsiteGeneratorPanel;
