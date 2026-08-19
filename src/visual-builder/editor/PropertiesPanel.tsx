import React, { useState } from "react";
import { Copy, Trash2, Paintbrush, Sparkles } from "lucide-react";
import { useVisualBuilderStore } from "../state/store";
import type { PageElement } from "../state/schema";
import { AnimationPanel } from "./AnimationPanel";


const COLOR_PRESETS = [
  "#ffffff",
  "#000000",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

function findElement(elements: PageElement[], id: string): PageElement | null {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children) {
      const found = findElement(el.children, id);
      if (found) return found;
    }
  }
  return null;
}

function collectElements(elements: PageElement[], depth = 0): { el: PageElement; depth: number }[] {
  const result: { el: PageElement; depth: number }[] = [];
  for (const el of elements) {
    result.push({ el, depth });
    if (el.children) {
      result.push(...collectElements(el.children, depth + 1));
    }
  }
  return result;
}

export function PropertiesPanel() {
  const { page, selectedId, updateElement, deleteElement, duplicateElement, selectElement } =
    useVisualBuilderStore();
  const [tab, setTab] = useState<"style" | "animate">("style");
  const element = selectedId ? findElement(page.elements, selectedId) : null;


  if (!element || !selectedId) {
    return (
      <div className="w-72 border-l border-foreground bg-card flex flex-col h-full">
        <div className="p-4 border-b border-muted-foreground">
          <h3 className="font-semibold text-white text-base">Properties</h3>
          <p className="text-sm text-foreground mt-0.5">Select an element</p>
        </div>
        <div className="flex-1 p-4">
          <p className="text-sm text-foreground">Click any element on the canvas to edit its properties.</p>
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Layers</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {collectElements(page.elements).map(({ el, depth }) => (
                <button
                  key={el.id}
                  onClick={() => selectElement(el.id)}
                  className="w-full text-left px-2 py-1.5 rounded text-sm font-medium text-white hover:bg-muted-foreground"
                  style={{ paddingLeft: `${8 + depth * 12}px` }}
                >
                  {el.type} {el.id.slice(0, 8)}
                </button>
              ))}
              {page.elements.length === 0 && (
                <p className="text-xs text-muted-foreground">No elements yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const styles = element.styles || {};

  const updateStyle = (key: string, value: string) => {
    updateElement(selectedId, {
      styles: { ...styles, [key]: value || undefined },
    });
  };

  const hasContent = "content" in element;

  return (
    <div className="w-72 border-l border-foreground bg-card flex flex-col h-full">
      <div className="p-4 border-b border-muted-foreground">
        <h3 className="font-semibold text-white text-base">Properties</h3>
        <p className="text-sm text-foreground mt-0.5 capitalize">{element.type}</p>
        <div className="mt-3 flex gap-1 rounded-full border border-border/70 bg-background/50 p-1">
          {([
            { id: "style", label: "Style", Icon: Paintbrush },
            { id: "animate", label: "Animate", Icon: Sparkles },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold transition-all ${
                tab === id
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tab === "style" && (
          <>

        {page.elements.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Layers</h4>
            <div className="space-y-0.5 max-h-24 overflow-y-auto">
              {collectElements(page.elements).map(({ el, depth }) => (
                <button
                  key={el.id}
                  onClick={() => selectElement(el.id)}
                  className={`w-full text-left px-2 py-1 rounded text-xs font-medium transition-colors ${
                    el.id === selectedId ? "bg-blue-600 text-white" : "text-foreground hover:bg-muted-foreground"
                  }`}
                  style={{ paddingLeft: `${8 + depth * 10}px` }}
                >
                  {el.type}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => duplicateElement(selectedId)}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-muted-foreground hover:bg-muted-foreground rounded-md"
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </button>
          <button
            onClick={() => deleteElement(selectedId)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 rounded-md"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {hasContent && ["text", "heading", "button"].includes(element.type) && (
          <div>
            <label className="block text-sm font-semibold text-white mb-1">Content</label>
            <input
              type="text"
              value={(element as { content?: string }).content || ""}
              onChange={(e) =>
                updateElement(selectedId, { content: e.target.value } as Partial<PageElement>)
              }
              className="w-full px-3 py-2 text-sm text-card bg-white border border-foreground rounded-md"
            />
          </div>
        )}
        {element.type === "image" && (
          <div>
            <label className="block text-sm font-semibold text-white mb-1">Image URL</label>
            <input
              type="text"
              value={(element as { src?: string }).src || ""}
              onChange={(e) =>
                updateElement(selectedId, { src: e.target.value } as Partial<PageElement>)
              }
              className="w-full px-3 py-2 text-sm text-card bg-white border border-foreground rounded-md"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-white mb-2">Styles</label>
          <div className="space-y-3">
            <div>
              <span className="block text-xs font-medium text-foreground mb-1">Background</span>
              <div className="flex gap-2 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateStyle("backgroundColor", c)}
                    className="w-6 h-6 rounded border-2 border-muted-foreground hover:border-white"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input
                type="text"
                value={styles.backgroundColor || ""}
                onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                placeholder="#ffffff"
                className="w-full mt-1 px-2 py-1.5 text-sm text-card bg-white border border-foreground rounded"
              />
            </div>
            <div>
              <span className="block text-xs font-medium text-foreground mb-1">Text Color</span>
              <div className="flex gap-2 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateStyle("color", c)}
                    className="w-6 h-6 rounded border-2 border-muted-foreground hover:border-white"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input
                type="text"
                value={styles.color || ""}
                onChange={(e) => updateStyle("color", e.target.value)}
                placeholder="#000000"
                className="w-full mt-1 px-2 py-1.5 text-sm text-card bg-white border border-foreground rounded"
              />
            </div>
            <div>
              <span className="block text-xs font-medium text-foreground mb-1">Font size</span>
              <input
                type="text"
                value={styles.fontSize || ""}
                onChange={(e) => updateStyle("fontSize", e.target.value)}
                placeholder="16px"
                className="w-full px-2 py-1.5 text-sm text-card bg-white border border-foreground rounded"
              />
            </div>
            <div>
              <span className="block text-xs font-medium text-foreground mb-1">Padding</span>
              <input
                type="text"
                value={styles.padding || ""}
                onChange={(e) => updateStyle("padding", e.target.value)}
                placeholder="16px"
                className="w-full px-2 py-1.5 text-sm text-card bg-white border border-foreground rounded"
              />
            </div>
            <div>
              <span className="block text-xs font-medium text-foreground mb-1">Margin</span>
              <input
                type="text"
                value={styles.margin || ""}
                onChange={(e) => updateStyle("margin", e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1.5 text-sm text-card bg-white border border-foreground rounded"
              />
            </div>
            <div>
              <span className="block text-xs font-medium text-foreground mb-1">Border radius</span>
              <input
                type="text"
                value={styles.borderRadius || ""}
                onChange={(e) => updateStyle("borderRadius", e.target.value)}
                placeholder="8px"
                className="w-full px-2 py-1.5 text-sm text-card bg-white border border-foreground rounded"
              />
            </div>
            <div>
              <span className="block text-xs font-medium text-foreground mb-1">Width</span>
              <input
                type="text"
                value={styles.width || ""}
                onChange={(e) => updateStyle("width", e.target.value)}
                placeholder="auto"
                className="w-full px-2 py-1.5 text-sm text-card bg-white border border-foreground rounded"
              />
            </div>
            <div>
              <span className="block text-xs font-medium text-foreground mb-1">Height</span>
              <input
                type="text"
                value={styles.height || ""}
                onChange={(e) => updateStyle("height", e.target.value)}
                placeholder="auto"
                className="w-full px-2 py-1.5 text-sm text-card bg-white border border-foreground rounded"
              />
            </div>
          </div>
        </div>
          </>
        )}
        {tab === "animate" && <AnimationPanel />}
      </div>
    </div>

  );
}
