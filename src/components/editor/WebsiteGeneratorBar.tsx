import { useState } from "react";
import { Globe } from "lucide-react";
import { WEBSITE_BLUEPRINTS, type WebsiteBrief, type WebsiteKind } from "@/lib/websiteGenerator";

interface WebsiteGeneratorBarProps {
  onGenerate: (brief: WebsiteBrief) => void;
  disabled?: boolean;
}

export function WebsiteGeneratorBar({ onGenerate, disabled }: WebsiteGeneratorBarProps) {
  const [name, setName] = useState("");

  const generate = (kind: WebsiteKind) => {
    const blueprint = WEBSITE_BLUEPRINTS.find((entry) => entry.id === kind)!;
    onGenerate({
      kind,
      name: name.trim() || blueprint.defaultName,
      tagline: blueprint.defaultTagline,
    });
  };

  return (
    <div className="border-t border-border px-3 py-2">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">Website generator</span>
      </div>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Site name (optional)"
        disabled={disabled}
        className="mb-1.5 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none placeholder:text-muted-foreground"
      />
      <div className="flex flex-wrap gap-1">
        {WEBSITE_BLUEPRINTS.map((blueprint) => (
          <button
            key={blueprint.id}
            type="button"
            disabled={disabled}
            title={blueprint.description}
            onClick={() => generate(blueprint.id)}
            className="rounded-md border border-border bg-secondary/60 px-2 py-1 text-[11px] text-secondary-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            {blueprint.label}
          </button>
        ))}
      </div>
    </div>
  );
}
