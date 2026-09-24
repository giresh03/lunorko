import { Wand2 } from "lucide-react";
import { WEBSITE_BLUEPRINTS, type WebsiteKind } from "@/lib/websiteGenerator";

interface WebsiteGeneratorBarProps {
  disabled?: boolean;
  onGenerate: (kind: WebsiteKind) => void;
}

/** Automation chips for the Web Development AI assistant. */
const WebsiteGeneratorBar = ({ disabled, onGenerate }: WebsiteGeneratorBarProps) => {
  return (
    <div className="border-t border-border px-2 py-2">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Wand2 className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Website generator
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {WEBSITE_BLUEPRINTS.map((blueprint) => (
          <button
            key={blueprint.id}
            type="button"
            disabled={disabled}
            title={blueprint.description}
            onClick={() => onGenerate(blueprint.id)}
            className="rounded-md border border-border bg-secondary/60 px-2 py-1 text-[10px] font-medium text-secondary-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            {blueprint.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WebsiteGeneratorBar;
