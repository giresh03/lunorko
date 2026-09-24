import { WEBSITE_BLUEPRINTS, type WebsiteBlueprintId } from "@/lib/websiteGenerator";

interface WebsiteGeneratorPanelProps {
  onSelect: (id: WebsiteBlueprintId) => void;
  text: string;
  muted: string;
  accent: string;
  border: string;
  card: string;
}

export default function WebsiteGeneratorPanel({
  onSelect,
  text,
  muted,
  accent,
  border,
  card,
}: WebsiteGeneratorPanelProps) {
  return (
    <div className="border-t overflow-y-auto shrink-0" style={{ borderColor: border, maxHeight: "220px" }}>
      <div className="px-3 py-2">
        <p className="text-[10px] font-semibold" style={{ color: text }}>Full-stack websites</p>
        <p className="text-[9px] mt-0.5" style={{ color: muted }}>
          Writes a browser client and an Express API. The preview uses sample data until the server is running.
        </p>
      </div>
      <div className="px-2 pb-2 grid grid-cols-1 gap-1">
        {WEBSITE_BLUEPRINTS.map((blueprint) => (
          <button
            key={blueprint.id}
            type="button"
            onClick={() => onSelect(blueprint.id)}
            className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-left"
            style={{ backgroundColor: card, border: `1px solid ${border}`, color: text }}
          >
            <span className="text-[10px] font-medium">{blueprint.label}</span>
            <span className="text-[8px]" style={{ color: accent }}>{blueprint.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
