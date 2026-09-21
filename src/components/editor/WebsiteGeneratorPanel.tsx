import { Wand2 } from "lucide-react";
import { listWebsiteBlueprints } from "@/lib/websiteGenerator";

interface WebsiteGeneratorPanelProps {
  disabled?: boolean;
  onGenerate: (brief: string) => void;
}

const WebsiteGeneratorPanel = ({ disabled, onGenerate }: WebsiteGeneratorPanelProps) => {
  const blueprints = listWebsiteBlueprints();

  return (
    <div className="border-t px-2 py-2 shrink-0" data-testid="website-generator">
      <div className="mb-1.5 flex items-center gap-1.5 px-1">
        <Wand2 className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Website Generator
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {blueprints.map((blueprint) => (
          <button
            key={blueprint.id}
            type="button"
            disabled={disabled}
            onClick={() => onGenerate(blueprint.prompt)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1.5 text-left transition-colors hover:border-primary/40 disabled:opacity-50"
            title={blueprint.description}
          >
            <span className="text-sm" aria-hidden>{blueprint.icon}</span>
            <span className="min-w-0">
              <span className="block truncate text-[10px] font-medium text-foreground">{blueprint.name}</span>
              <span className="block truncate text-[8px] text-muted-foreground">{blueprint.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WebsiteGeneratorPanel;
