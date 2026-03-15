import React from "react";
import { Sparkles, AlertCircle, ArrowRightToLine, X } from "lucide-react";

export interface AISuggestion {
  intent: string;
  suggestion: string;
  nextLine: string | null;
  hasError: boolean;
  diagramUrl?: string;
}

type PopupType = "suggestion" | "error";

interface AIModalPopupProps {
  type: PopupType;
  /** For suggestion */
  suggestion?: AISuggestion | null;
  /** For error */
  explanation?: { explanation: string; fix: string; diagramUrl?: string } | null;
  onInsertCode?: (code: string) => void;
  onDismiss: () => void;
  themeColors: { accent: string; text: string; muted: string; border: string; card: string; bg: string };
}

export function AIModalPopup({
  type,
  suggestion,
  explanation,
  onInsertCode,
  onDismiss,
  themeColors,
}: AIModalPopupProps) {
  const content = type === "suggestion" ? suggestion : null;
  const errContent = type === "error" ? explanation : null;

  if (type === "suggestion" && !content) return null;
  if (type === "error" && !errContent) return null;

  const diagramUrl = type === "suggestion" ? content?.diagramUrl : errContent?.diagramUrl;
  const hasImage = !!diagramUrl;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onDismiss()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Modal card - centered, beautiful */}
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border-2"
        style={{
          backgroundColor: themeColors.card,
          borderColor: type === "error" ? "#ef444440" : themeColors.accent + "40",
          boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px ${themeColors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div
          className="relative px-6 py-4 border-b"
          style={{
            background: type === "error"
              ? "linear-gradient(135deg, #ef444415 0%, #dc262610 100%)"
              : `linear-gradient(135deg, ${themeColors.accent}20 0%, ${themeColors.accent}08 100%)`,
            borderColor: themeColors.border,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: type === "error" ? "#ef444425" : themeColors.accent + "25",
              }}
            >
              {type === "error" ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Sparkles className="h-5 w-5" style={{ color: themeColors.accent }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold" style={{ color: themeColors.text }}>
                {type === "error" ? "AI Error Explanation" : "AI Guidance"}
              </h3>
              <p className="text-[10px] mt-0.5" style={{ color: themeColors.muted }}>
                {type === "error" ? "Understanding your mistake" : "What you're building"}
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ color: themeColors.muted, backgroundColor: themeColors.bg + "80" }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-4">
          {/* AI-generated image */}
          {hasImage && (
            <div className="rounded-xl overflow-hidden border-2 shadow-lg" style={{ borderColor: themeColors.border }}>
              <img
                src={diagramUrl}
                alt="Concept illustration"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Intent / Explanation */}
          {type === "suggestion" && content && (
            <>
              {content.intent && (
                <p className="text-sm font-medium" style={{ color: themeColors.text }}>
                  {content.intent}
                </p>
              )}
              <p className="text-sm leading-relaxed" style={{ color: themeColors.muted }}>
                {content.suggestion}
              </p>
            </>
          )}
          {type === "error" && errContent && (
            <p className="text-sm leading-relaxed" style={{ color: themeColors.text }}>
              {errContent.explanation}
            </p>
          )}

          {/* Code example / Fix */}
          {type === "suggestion" && content?.nextLine && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: themeColors.muted }}>
                Suggested code
              </p>
              <pre
                className="rounded-lg p-4 text-xs overflow-x-auto font-mono"
                style={{ backgroundColor: themeColors.bg, border: `1px solid ${themeColors.border}`, color: themeColors.text }}
              >
                {content.nextLine}
              </pre>
              <button
                onClick={() => onInsertCode?.(content!.nextLine!)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                style={{ backgroundColor: themeColors.accent, color: "#fff" }}
              >
                <ArrowRightToLine className="h-4 w-4" />
                Insert suggested code
              </button>
            </div>
          )}
          {type === "error" && errContent?.fix && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: themeColors.muted }}>
                Suggested fix
              </p>
              <pre
                className="rounded-lg p-4 text-xs overflow-x-auto font-mono"
                style={{ backgroundColor: themeColors.bg, border: `1px solid ${themeColors.border}`, color: themeColors.text }}
              >
                {errContent.fix}
              </pre>
              <button
                onClick={() => onInsertCode?.(errContent!.fix)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                style={{ backgroundColor: themeColors.accent, color: "#fff" }}
              >
                <ArrowRightToLine className="h-4 w-4" />
                Insert fix
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
