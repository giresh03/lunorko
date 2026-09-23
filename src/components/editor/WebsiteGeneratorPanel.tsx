import { WEBSITE_BLUEPRINTS, type WebsiteKind } from "@/lib/websiteGenerator";
import type { EditorTheme } from "@/lib/editorThemes";

interface WebsiteGeneratorPanelProps {
  siteName: string;
  onSiteNameChange: (value: string) => void;
  onGenerate: (kind: WebsiteKind) => void;
  disabled?: boolean;
  themeColors: EditorTheme["uiColors"];
}

const WebsiteGeneratorPanel = ({
  siteName,
  onSiteNameChange,
  onGenerate,
  disabled,
  themeColors,
}: WebsiteGeneratorPanelProps) => {
  return (
    <div className="border-t shrink-0" style={{ borderColor: themeColors.border, backgroundColor: themeColors.bg }}>
      <div className="px-3 py-2 border-b" style={{ borderColor: themeColors.border }}>
        <p className="text-[10px] font-semibold" style={{ color: themeColors.text }}>Full-stack website generator</p>
        <p className="text-[9px] mt-0.5" style={{ color: themeColors.muted }}>
          Writes the client preview and an Express API into this project.
        </p>
        <label className="mt-2 block text-[9px]" style={{ color: themeColors.muted }}>
          Site name
          <input
            value={siteName}
            onChange={(event) => onSiteNameChange(event.target.value)}
            className="mt-1 w-full rounded-md px-2 py-1 text-[11px] outline-none"
            style={{
              backgroundColor: themeColors.card,
              color: themeColors.text,
              border: `1px solid ${themeColors.border}`,
            }}
            maxLength={48}
            aria-label="Site name"
          />
        </label>
      </div>
      <div className="p-2 grid grid-cols-1 gap-1 max-h-44 overflow-y-auto">
        {WEBSITE_BLUEPRINTS.map((blueprint) => (
          <button
            key={blueprint.id}
            type="button"
            disabled={disabled}
            onClick={() => onGenerate(blueprint.id)}
            className="flex items-start gap-2 rounded-md px-2 py-1.5 text-left disabled:opacity-50"
            style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}
          >
            <span className="text-sm leading-none">{blueprint.icon}</span>
            <span>
              <span className="block text-[10px] font-medium" style={{ color: themeColors.text }}>{blueprint.label}</span>
              <span className="block text-[8px]" style={{ color: themeColors.muted }}>{blueprint.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WebsiteGeneratorPanel;
