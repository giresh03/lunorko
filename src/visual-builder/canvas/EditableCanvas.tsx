import React, { useCallback } from "react";
import { Monitor } from "lucide-react";
import { ElementRenderer } from "../components/ElementRenderer";
import { useVisualBuilderStore } from "../state/store";
import type { PageElement } from "../state/schema";

export function EditableCanvas() {
  const {
    page,
    selectedId,
    hoveredId,
    selectElement,
    setHoveredElement,
    addElement,
    pushHistory,
  } = useVisualBuilderStore();

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest(".visual-builder-element")) return;
      selectElement(null);
    },
    [selectElement]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const json = e.dataTransfer.getData("application/json");
      if (json) {
        try {
          const element = JSON.parse(json) as PageElement;
          pushHistory();
          addElement(element);
        } catch {}
      }
    },
    [addElement, pushHistory]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleSelect = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      selectElement(id);
    },
    [selectElement]
  );

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-card overflow-auto">
      <div className="p-4 flex items-center gap-2 border-b border-muted-foreground bg-card">
        <Monitor className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-white">{page.name}</span>
        <span className="text-xs text-muted-foreground">• {page.elements.length} elements</span>
      </div>
      <div
        className="flex-1 p-8 overflow-auto"
        onClick={handleCanvasClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div
          className="mx-auto bg-white rounded-lg shadow-xl min-h-[600px]"
          style={{ maxWidth: page.viewportWidth, minHeight: 600 }}
        >
          {page.elements.length === 0 ? (
            <div
              className="flex items-center justify-center min-h-[600px] border-2 border-dashed border-muted-foreground rounded-lg text-muted-foreground text-lg font-medium"
              onMouseEnter={() => setHoveredElement(null)}
            >
              Drop components here
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {page.elements.map((el) => (
                <div
                  key={el.id}
                  onMouseEnter={() => setHoveredElement(el.id)}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  <ElementRenderer
                    element={el}
                    selectedId={selectedId}
                    hoveredId={hoveredId}
                    onSelect={handleSelect}
                    onDragStart={handleDragStart}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
