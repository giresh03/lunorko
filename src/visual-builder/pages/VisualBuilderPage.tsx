import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Undo2, Redo2, Code, Eye } from "lucide-react";
import { ComponentLibrary } from "../editor/ComponentLibrary";
import { PropertiesPanel } from "../editor/PropertiesPanel";
import { EditableCanvas } from "../canvas/EditableCanvas";
import { useVisualBuilderStore } from "../state/store";
import { pageToHtml } from "../utils/renderToHtml";

function ExportButton() {
  const page = useVisualBuilderStore((s) => s.page);
  const [copied, setCopied] = useState(false);
  const handleExport = () => {
    const json = JSON.stringify(page, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary rounded-md"
      title="Copy JSON schema"
    >
      <Code className="h-4 w-4" />
      {copied ? "Copied!" : "Export JSON"}
    </button>
  );
}

function PreviewButton() {
  const page = useVisualBuilderStore((s) => s.page);
  const handlePreview = () => {
    const html = pageToHtml(page.elements, page.name);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "width=900,height=700");
  };
  return (
    <button
      onClick={handlePreview}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-600 rounded-md"
      title="Preview in new tab"
    >
      <Eye className="h-4 w-4" />
      Preview
    </button>
  );
}

export default function VisualBuilderPage() {
  const { undo, redo, history, historyIndex, deleteElement, selectedId, setPageName, page } =
    useVisualBuilderStore();
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          e.preventDefault();
          deleteElement(selectedId);
        }
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
        }
        if (e.key === "y") {
          e.preventDefault();
          redo();
        }
        if (e.key === "d" && selectedId) {
          e.preventDefault();
          useVisualBuilderStore.getState().duplicateElement(selectedId);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, deleteElement, undo, redo]);

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Top toolbar */}
      <header className="h-14 flex items-center justify-between px-4 bg-slate-800 border-b border-slate-600 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-lg font-bold text-white">Visual Website Builder</span>
          <input
            type="text"
            value={page.name}
            onChange={(e) => setPageName(e.target.value)}
            className="px-2 py-1 text-sm font-medium text-white bg-slate-700 border border-slate-600 rounded w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded text-slate-300 hover:text-white hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded text-slate-300 hover:text-white hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <PreviewButton />
          <span className="text-xs text-slate-500 hidden lg:inline">Del: delete • Ctrl+D: duplicate</span>
          <PreviewButton />
          <ExportButton />
        </div>
      </header>

      {/* Main layout: Left | Canvas | Right */}
      <div className="flex-1 flex overflow-hidden">
        <ComponentLibrary />
        <EditableCanvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}
