import { useState } from "react";
import { Wand2 } from "lucide-react";
import { WEBSITE_KINDS, type WebsiteKind, type WebsiteRequest } from "@/lib/websiteGenerator";

interface WebsiteGeneratorPanelProps {
  busy?: boolean;
  onGenerate: (request: WebsiteRequest) => void;
}

export function WebsiteGeneratorPanel({ busy, onGenerate }: WebsiteGeneratorPanelProps) {
  const [kind, setKind] = useState<WebsiteKind>("landing");
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");

  return (
    <form
      className="border-t px-3 py-2 space-y-2 shrink-0"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = brief.trim();
        onGenerate({
          kind,
          title: title.trim() || undefined,
          brief: trimmed || `Build a ${kind} website${title.trim() ? ` called ${title.trim()}` : ""}`,
        });
      }}
    >
      <div className="flex items-center gap-1.5">
        <Wand2 className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-semibold text-foreground">Website Generator</span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-snug">
        Writes a client, Express API, and seed data into this project.
      </p>
      <div className="flex flex-wrap gap-1">
        {WEBSITE_KINDS.map((option) => (
          <button
            key={option.id}
            type="button"
            title={option.description}
            onClick={() => setKind(option.id)}
            className={`rounded-md border px-2 py-1 text-[10px] ${
              kind === option.id
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary/40 text-secondary-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Site name (optional)"
        maxLength={60}
        className="w-full rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground"
      />
      <textarea
        value={brief}
        onChange={(event) => setBrief(event.target.value)}
        placeholder="What should the site be about?"
        rows={2}
        maxLength={500}
        className="w-full resize-none rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-primary px-2 py-1.5 text-[11px] font-medium text-primary-foreground disabled:opacity-50"
      >
        Generate full-stack site
      </button>
    </form>
  );
}
