import { useState } from "react";
import { Wand2 } from "lucide-react";
import {
  WEBSITE_TEMPLATES,
  type GenerateWebsiteInput,
  type WebsiteTemplateId,
} from "@/lib/websiteGenerator";

interface ThemeColors {
  bg: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
}

interface WebsiteGeneratorPanelProps {
  theme: ThemeColors;
  onGenerate: (input: GenerateWebsiteInput) => void;
}

export function WebsiteGeneratorPanel({ theme, onGenerate }: WebsiteGeneratorPanelProps) {
  const [templateId, setTemplateId] = useState<WebsiteTemplateId>("saas");
  const template = WEBSITE_TEMPLATES.find((item) => item.id === templateId) ?? WEBSITE_TEMPLATES[2];
  const [siteName, setSiteName] = useState(template.defaultName);
  const [tagline, setTagline] = useState(template.defaultTagline);
  const [nameDirty, setNameDirty] = useState(false);
  const [tagDirty, setTagDirty] = useState(false);

  const selectTemplate = (id: WebsiteTemplateId) => {
    const next = WEBSITE_TEMPLATES.find((item) => item.id === id);
    if (!next) return;
    setTemplateId(id);
    if (!nameDirty) setSiteName(next.defaultName);
    if (!tagDirty) setTagline(next.defaultTagline);
  };

  return (
    <div className="border-t shrink-0 overflow-y-auto" style={{ borderColor: theme.border, backgroundColor: theme.bg, maxHeight: 280 }}>
      <div className="px-3 py-2 flex items-center gap-1.5 border-b" style={{ borderColor: theme.border, backgroundColor: theme.card }}>
        <Wand2 className="h-3 w-3" style={{ color: theme.accent }} />
        <span className="text-[10px] font-semibold" style={{ color: theme.text }}>Website generator</span>
      </div>
      <div className="p-2 space-y-2">
        <div className="grid grid-cols-2 gap-1">
          {WEBSITE_TEMPLATES.map((item) => {
            const selected = item.id === templateId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTemplate(item.id)}
                className="rounded px-2 py-1.5 text-left"
                style={{
                  backgroundColor: selected ? theme.accent + "22" : theme.card,
                  border: `1px solid ${selected ? theme.accent : theme.border}`,
                  color: theme.text,
                }}
              >
                <span className="block text-[10px] font-medium">{item.label}</span>
                <span className="block text-[8px]" style={{ color: theme.muted }}>{item.description}</span>
              </button>
            );
          })}
        </div>
        <label className="block text-[9px]" style={{ color: theme.muted }}>
          Site name
          <input
            aria-label="Site name"
            value={siteName}
            onChange={(event) => { setSiteName(event.target.value); setNameDirty(true); }}
            className="mt-1 w-full rounded px-2 py-1 text-[11px] outline-none"
            style={{ backgroundColor: theme.card, color: theme.text, border: `1px solid ${theme.border}` }}
          />
        </label>
        <label className="block text-[9px]" style={{ color: theme.muted }}>
          Tagline
          <input
            aria-label="Tagline"
            value={tagline}
            onChange={(event) => { setTagline(event.target.value); setTagDirty(true); }}
            className="mt-1 w-full rounded px-2 py-1 text-[11px] outline-none"
            style={{ backgroundColor: theme.card, color: theme.text, border: `1px solid ${theme.border}` }}
          />
        </label>
        <button
          type="button"
          onClick={() => onGenerate({ templateId, siteName, tagline })}
          className="w-full rounded px-2 py-1.5 text-[10px] font-semibold"
          style={{ backgroundColor: theme.accent, color: "#fff" }}
        >
          Generate website
        </button>
      </div>
    </div>
  );
}
