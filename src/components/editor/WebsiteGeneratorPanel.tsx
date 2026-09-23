import { listWebsiteBlueprints } from "@/lib/websiteGenerator";

interface WebsiteGeneratorPanelProps {
  siteName: string;
  onSiteNameChange: (value: string) => void;
  onGenerate: (blueprintId: string) => void;
  disabled?: boolean;
  themeColors: { accent: string; text: string; muted: string; border: string; card: string; bg: string };
}

const blueprints = listWebsiteBlueprints();

export function WebsiteGeneratorPanel({
  siteName,
  onSiteNameChange,
  onGenerate,
  disabled,
  themeColors,
}: WebsiteGeneratorPanelProps) {
  return (
    <div className="border-t px-3 py-2 shrink-0" style={{ borderColor: themeColors.border, backgroundColor: themeColors.bg }}>
      <p className="text-[10px] font-semibold" style={{ color: themeColors.text }}>
        Website generator
      </p>
      <p className="mt-0.5 text-[9px] leading-relaxed" style={{ color: themeColors.muted }}>
        Builds a full-stack site: page, styles, client script, and an Express API. The preview uses seed data until you run the server.
      </p>
      <input
        value={siteName}
        onChange={(event) => onSiteNameChange(event.target.value)}
        placeholder="Site name (optional)"
        disabled={disabled}
        className="mt-2 w-full rounded-md px-2 py-1 text-[11px] outline-none"
        style={{
          backgroundColor: themeColors.card,
          color: themeColors.text,
          border: `1px solid ${themeColors.border}`,
        }}
      />
      <div className="mt-2 grid grid-cols-2 gap-1">
        {blueprints.map((blueprint) => (
          <button
            key={blueprint.id}
            type="button"
            disabled={disabled}
            onClick={() => onGenerate(blueprint.id)}
            className="flex items-start gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors disabled:opacity-50"
            style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}
          >
            <span className="text-xs leading-none" style={{ color: themeColors.accent }}>{blueprint.icon}</span>
            <span>
              <span className="block text-[10px] font-medium" style={{ color: themeColors.text }}>{blueprint.label}</span>
              <span className="block text-[8px] leading-snug" style={{ color: themeColors.muted }}>{blueprint.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
