import { useState } from "react";
import { Check, X, ArrowLeftRight } from "lucide-react";
import type { EditorTheme } from "@/lib/editorThemes";

interface DiffPreviewProps {
  originalCode: string;
  newCode: string;
  filename: string;
  language: string;
  themeColors: EditorTheme["uiColors"];
  onAccept: () => void;
  onReject: () => void;
}

function computeDiff(original: string, updated: string) {
  const oldLines = original.split("\n");
  const newLines = updated.split("\n");
  const diff: { type: "same" | "added" | "removed"; content: string }[] = [];

  const maxLen = Math.max(oldLines.length, newLines.length);
  let oi = 0, ni = 0;

  while (oi < oldLines.length || ni < newLines.length) {
    if (oi < oldLines.length && ni < newLines.length && oldLines[oi] === newLines[ni]) {
      diff.push({ type: "same", content: oldLines[oi] });
      oi++; ni++;
    } else if (oi < oldLines.length && (ni >= newLines.length || !newLines.slice(ni, ni + 5).includes(oldLines[oi]))) {
      diff.push({ type: "removed", content: oldLines[oi] });
      oi++;
    } else {
      diff.push({ type: "added", content: newLines[ni] });
      ni++;
    }
  }
  return diff;
}

const DiffPreview = ({ originalCode, newCode, filename, language, themeColors, onAccept, onReject }: DiffPreviewProps) => {
  const [view, setView] = useState<"diff" | "new">("diff");
  const diff = computeDiff(originalCode, newCode);
  const added = diff.filter(d => d.type === "added").length;
  const removed = diff.filter(d => d.type === "removed").length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-3xl max-h-[80vh] rounded-lg overflow-hidden flex flex-col" style={{ backgroundColor: themeColors.card, border: `1px solid ${themeColors.border}` }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" style={{ color: themeColors.accent }} />
            <span className="text-sm font-semibold" style={{ color: themeColors.text }}>Review AI Changes</span>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: themeColors.accent + "20", color: themeColors.accent }}>{filename}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono" style={{ color: "#4ade80" }}>+{added}</span>
            <span className="text-[10px] font-mono" style={{ color: "#f87171" }}>-{removed}</span>
            <div className="flex rounded-md overflow-hidden border" style={{ borderColor: themeColors.border }}>
              <button
                onClick={() => setView("diff")}
                className="px-2 py-1 text-[10px] font-medium"
                style={{ backgroundColor: view === "diff" ? themeColors.accent + "25" : "transparent", color: view === "diff" ? themeColors.accent : themeColors.muted }}
              >Diff</button>
              <button
                onClick={() => setView("new")}
                className="px-2 py-1 text-[10px] font-medium"
                style={{ backgroundColor: view === "new" ? themeColors.accent + "25" : "transparent", color: view === "new" ? themeColors.accent : themeColors.muted }}
              >New</button>
            </div>
          </div>
        </div>

        {/* Code diff */}
        <div className="flex-1 overflow-auto p-0 font-mono text-xs" style={{ backgroundColor: themeColors.bg }}>
          {view === "diff" ? (
            <table className="w-full border-collapse">
              <tbody>
                {diff.map((line, i) => (
                  <tr key={i}>
                    <td className="w-10 text-right px-2 select-none" style={{ 
                      color: themeColors.muted + "80", 
                      backgroundColor: line.type === "added" ? "#4ade8010" : line.type === "removed" ? "#f8717110" : "transparent",
                    }}>
                      {line.type !== "added" ? i + 1 : ""}
                    </td>
                    <td className="w-4 text-center select-none" style={{
                      color: line.type === "added" ? "#4ade80" : line.type === "removed" ? "#f87171" : "transparent",
                      backgroundColor: line.type === "added" ? "#4ade8010" : line.type === "removed" ? "#f8717110" : "transparent",
                    }}>
                      {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                    </td>
                    <td className="px-3 py-0.5 whitespace-pre" style={{
                      color: themeColors.text,
                      backgroundColor: line.type === "added" ? "#4ade8008" : line.type === "removed" ? "#f8717108" : "transparent",
                      textDecoration: line.type === "removed" ? "line-through" : "none",
                      opacity: line.type === "removed" ? 0.6 : 1,
                    }}>
                      {line.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <pre className="p-3 whitespace-pre" style={{ color: themeColors.text }}>{newCode}</pre>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: themeColors.border }}>
          <button
            onClick={onReject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{ color: "#f87171", border: `1px solid #f8717140`, backgroundColor: "#f8717108" }}
          >
            <X className="h-3.5 w-3.5" /> Reject
          </button>
          <button
            onClick={onAccept}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{ color: "#fff", backgroundColor: themeColors.accent }}
          >
            <Check className="h-3.5 w-3.5" /> Accept & Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiffPreview;
