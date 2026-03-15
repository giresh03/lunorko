import React from "react";
import { Sparkles, ChevronDown, ChevronUp, ArrowRightToLine } from "lucide-react";

export interface AISuggestion {
  intent: string;
  suggestion: string;
  nextLine: string | null;
  hasError: boolean;
}

interface AIGuidanceDropdownProps {
  suggestion: AISuggestion;
  onInsertCode?: (code: string) => void;
  onDismiss: () => void;
  themeColors: { accent: string; text: string; muted: string; border: string; card: string; bg: string };
  position?: { top: number; left: number };
}

export function AIGuidanceDropdown({
  suggestion,
  onInsertCode,
  onDismiss,
  themeColors,
  position,
}: AIGuidanceDropdownProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div
      className="fixed z-[9999] w-80 rounded-lg shadow-xl border overflow-hidden"
      style={{
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
        ...(position && { top: position.top, left: position.left }),
      }}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: suggestion.hasError ? "#ef444420" : themeColors.accent + "20" }}
          >
            <Sparkles className="h-4 w-4" style={{ color: suggestion.hasError ? "#ef4444" : themeColors.accent }} />
          </div>
          <div className="flex-1 min-w-0">
            {suggestion.intent && (
              <p className="text-xs font-medium mb-1" style={{ color: themeColors.text }}>
                {suggestion.intent}
              </p>
            )}
            <p className="text-xs" style={{ color: themeColors.muted }}>
              {suggestion.suggestion}
            </p>
            {suggestion.nextLine && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => onInsertCode?.(suggestion.nextLine!)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors"
                  style={{ backgroundColor: themeColors.accent + "25", color: themeColors.accent }}
                >
                  <ArrowRightToLine className="h-3 w-3" />
                  Insert suggested code
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5"
            style={{ color: themeColors.muted }}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t px-3 py-2" style={{ borderColor: themeColors.border, backgroundColor: themeColors.bg }}>
          <p className="text-[10px] font-medium mb-1" style={{ color: themeColors.muted }}>
            AI Guidance
          </p>
          <p className="text-xs" style={{ color: themeColors.text }}>
            {suggestion.suggestion}
          </p>
        </div>
      )}
    </div>
  );
}
