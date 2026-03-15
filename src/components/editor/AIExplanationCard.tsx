import React from "react";
import { AlertCircle, ArrowRightToLine } from "lucide-react";

interface AIExplanationCardProps {
  explanation: string;
  fix: string;
  diagramUrl?: string;
  onInsertFix?: (code: string) => void;
  onDismiss: () => void;
  themeColors: { accent: string; text: string; muted: string; border: string; card: string; bg: string };
}

export function AIExplanationCard({
  explanation,
  fix,
  diagramUrl,
  onInsertFix,
  onDismiss,
  themeColors,
}: AIExplanationCardProps) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ backgroundColor: themeColors.card, borderColor: "#ef444440" }}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: themeColors.border, backgroundColor: "#ef444408" }}>
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-xs font-semibold" style={{ color: themeColors.text }}>
          AI Explanation
        </span>
      </div>
      <div className="p-3 space-y-3">
        <p className="text-xs" style={{ color: themeColors.text }}>
          {explanation}
        </p>
        {diagramUrl && (
          <div className="rounded overflow-hidden border" style={{ borderColor: themeColors.border }}>
            <img src={diagramUrl} alt="Concept diagram" className="w-full h-32 object-cover" />
          </div>
        )}
        {fix && (
          <div>
            <p className="text-[10px] font-medium mb-1" style={{ color: themeColors.muted }}>
              Suggested fix
            </p>
            <pre
              className="rounded p-2 text-[10px] overflow-x-auto"
              style={{ backgroundColor: themeColors.bg, border: `1px solid ${themeColors.border}`, color: themeColors.text }}
            >
              {fix}
            </pre>
            {onInsertFix && (
              <button
                onClick={() => onInsertFix(fix)}
                className="mt-2 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium"
                style={{ backgroundColor: themeColors.accent + "25", color: themeColors.accent }}
              >
                <ArrowRightToLine className="h-3 w-3" />
                Insert fix
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
