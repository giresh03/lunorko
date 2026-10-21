import React from "react";
import { COMPONENT_TEMPLATES } from "../state/templates";
import { useVisualBuilderStore } from "../state/store";
import type { PageElement } from "../state/schema";

function cloneWithIds(el: PageElement, prefix: string): PageElement {
  const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const base = { ...el, id };
  if (base.children) {
    base.children = base.children.map((c, i) => cloneWithIds(c, `${id}-${i}`));
  }
  return base;
}

export function ComponentLibrary() {
  const addElement = useVisualBuilderStore((s) => s.addElement);

  const handleDragStart = (e: React.DragEvent, template: (typeof COMPONENT_TEMPLATES)[0]) => {
    const cloned = cloneWithIds(template.element, template.id);
    e.dataTransfer.setData("application/json", JSON.stringify(cloned));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="w-64 border-r border-foreground bg-card flex flex-col h-full">
      <div className="p-4 border-b border-muted-foreground">
        <h3 className="font-semibold text-white text-base">Components</h3>
        <p className="text-sm text-foreground mt-0.5">Drag to canvas</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {COMPONENT_TEMPLATES.map((t) => (
          <div
            key={t.id}
            draggable
            onDragStart={(e) => handleDragStart(e, t)}
            className="flex items-center gap-3 p-3 rounded-lg bg-card border border-muted-foreground hover:border-blue-400 hover:bg-muted-foreground cursor-grab active:cursor-grabbing transition-all shadow-sm"
          >
            <span className="text-2xl flex-shrink-0">{t.icon}</span>
            <span className="text-sm font-semibold text-white">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
