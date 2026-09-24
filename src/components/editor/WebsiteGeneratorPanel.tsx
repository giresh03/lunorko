import { useState } from "react";
import { Wand2 } from "lucide-react";
import { websiteBlueprints } from "@/lib/websiteGenerator";
import type { EditorTheme } from "@/lib/editorThemes";

interface WebsiteGeneratorPanelProps {
  open: boolean;
  onToggle: () => void;
  disabled?: boolean;
  themeColors: EditorTheme["uiColors"];
  onGenerate: (blueprintId: string, brief: string) => void;
}

export default function WebsiteGeneratorPanel({
  open,
  onToggle,
  disabled,
  themeColors,
  onGenerate,
}: WebsiteGeneratorPanelProps) {
  const [blueprintId, setBlueprintId] = useState(websiteBlueprints[0].id);
  const [brief, setBrief] = useState("");

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium"
        style={{
          color: open ? themeColors.accent : themeColors.text,
          backgroundColor: open ? themeColors.accent + "18" : "transparent",
          border: `1px solid ${open ? themeColors.accent : themeColors.border}`,
        }}
      >
        <Wand2 className="h-3 w-3" />
        Website Generator
      </button>
      {open && (
        <div className="mt-2 rounded-md p-2" style={{ backgroundColor: themeColors.bg, border: `1px solid ${themeColors.border}` }}>
          <p className="text-[10px] font-semibold" style={{ color: themeColors.text }}>Full-stack website automation</p>
          <p className="mt-1 text-[9px] leading-relaxed" style={{ color: themeColors.muted }}>
            Writes a previewable site plus an Express API and MongoDB model into this project, then asks the assistant to tailor it.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1">
            {websiteBlueprints.map((blueprint) => {
              const selected = blueprint.id === blueprintId;
              return (
                <button
                  key={blueprint.id}
                  type="button"
                  onClick={() => setBlueprintId(blueprint.id)}
                  className="rounded px-2 py-1.5 text-left"
                  style={{
                    backgroundColor: selected ? themeColors.accent + "22" : themeColors.card,
                    border: `1px solid ${selected ? themeColors.accent : themeColors.border}`,
                  }}
                >
                  <span className="block text-[10px] font-medium" style={{ color: themeColors.text }}>{blueprint.label}</span>
                  <span className="block text-[8px] leading-snug" style={{ color: themeColors.muted }}>{blueprint.description}</span>
                </button>
              );
            })}
          </div>
          <label className="mt-2 block text-[9px]" style={{ color: themeColors.muted }}>
            Brief
            <textarea
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              rows={2}
              placeholder="A bakery in Lisbon with a menu and reservation form"
              className="mt-1 w-full rounded px-2 py-1 text-[10px] outline-none"
              style={{ backgroundColor: themeColors.card, color: themeColors.text, border: `1px solid ${themeColors.border}` }}
            />
          </label>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onGenerate(blueprintId, brief)}
            className="mt-2 w-full rounded py-1.5 text-[10px] font-semibold disabled:opacity-50"
            style={{ backgroundColor: themeColors.accent, color: "#ffffff" }}
          >
            Generate website
          </button>
        </div>
      )}
    </div>
  );
}
