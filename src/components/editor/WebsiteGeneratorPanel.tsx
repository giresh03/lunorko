import type { WebsiteBlueprint } from "@/lib/websiteGenerator";

interface ThemeColors {
  accent: string;
  text: string;
  muted: string;
  border: string;
  card: string;
  bg: string;
}

interface WebsiteGeneratorPanelProps {
  blueprints: WebsiteBlueprint[];
  selectedId: string;
  brief: string;
  busy: boolean;
  themeColors: ThemeColors;
  onSelect: (id: string) => void;
  onBriefChange: (value: string) => void;
  onGenerate: () => void;
}

export function WebsiteGeneratorPanel({
  blueprints,
  selectedId,
  brief,
  busy,
  themeColors,
  onSelect,
  onBriefChange,
  onGenerate,
}: WebsiteGeneratorPanelProps) {
  return (
    <div className="border-t px-2 py-2 shrink-0" style={{ borderColor: themeColors.border, backgroundColor: themeColors.bg }}>
      <div className="flex items-center justify-between gap-2 px-1 pb-1.5">
        <span className="text-[10px] font-semibold" style={{ color: themeColors.text }}>
          Full-stack website
        </span>
        <span className="text-[9px]" style={{ color: themeColors.muted }}>
          HTML, CSS, JS + Express
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {blueprints.map((blueprint) => {
          const selected = blueprint.id === selectedId;
          return (
            <button
              key={blueprint.id}
              type="button"
              onClick={() => onSelect(blueprint.id)}
              className="rounded px-2 py-1.5 text-left"
              style={{
                backgroundColor: selected ? themeColors.accent + "22" : themeColors.card,
                border: `1px solid ${selected ? themeColors.accent : themeColors.border}`,
                color: themeColors.text,
              }}
            >
              <span className="block text-[10px] font-medium">
                <span aria-hidden="true" className="mr-1">{blueprint.icon}</span>
                {blueprint.label}
              </span>
              <span className="block text-[8px] leading-snug" style={{ color: themeColors.muted }}>
                {blueprint.description}
              </span>
            </button>
          );
        })}
      </div>
      <label className="mt-2 block text-[9px]" style={{ color: themeColors.muted }}>
        Brief
        <input
          value={brief}
          onChange={(event) => onBriefChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onGenerate();
          }}
          placeholder="Cafe in Lisbon, warm photos, evening menu"
          className="mt-1 w-full rounded px-2 py-1.5 text-[11px] outline-none"
          style={{
            backgroundColor: themeColors.card,
            color: themeColors.text,
            border: `1px solid ${themeColors.border}`,
          }}
          disabled={busy}
        />
      </label>
      <button
        type="button"
        onClick={onGenerate}
        disabled={busy || !selectedId}
        className="mt-2 w-full rounded py-1.5 text-[11px] font-semibold disabled:opacity-50"
        style={{ backgroundColor: themeColors.accent, color: "#ffffff" }}
      >
        {busy ? "Writing the site…" : "Generate website"}
      </button>
    </div>
  );
}
