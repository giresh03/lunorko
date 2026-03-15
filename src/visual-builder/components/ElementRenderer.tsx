import React, { useCallback } from "react";
import type { PageElement, TextElement, ImageElement, ButtonElement } from "../state/schema";
import { useVisualBuilderStore } from "../state/store";

interface ElementRendererProps {
  element: PageElement;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (e: React.MouseEvent, id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

function ensureId(el: PageElement, prefix: string): PageElement {
  const id = el.id || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const base = { ...el, id };
  if (base.children) {
    base.children = base.children.map((c, i) => ensureId(c, `${id}-${i}`));
  }
  return base;
}

export function ElementRenderer({
  element,
  selectedId,
  hoveredId,
  onSelect,
  onDragStart,
}: ElementRendererProps) {
  const updateElement = useVisualBuilderStore((s) => s.updateElement);
  const el = ensureId(element, "el");

  const handleTextChange = useCallback(
    (e: React.FormEvent<HTMLDivElement>, id: string) => {
      const text = (e.target as HTMLDivElement).innerText;
      updateElement(id, { content: text } as Partial<TextElement>);
    },
    [updateElement]
  );

  const styles = el.styles || {};
  const styleObj: React.CSSProperties = {
    ...styles,
    position: "relative",
    cursor: "pointer",
    outline: el.id === selectedId ? "2px solid #3b82f6" : el.id === hoveredId ? "1px dashed #94a3b8" : "none",
    outlineOffset: "2px",
    minHeight: ["text", "heading", "button"].includes(el.type) ? "24px" : undefined,
  };

  const commonProps = {
    onClick: (e: React.MouseEvent) => { e.stopPropagation(); onSelect(e, el.id); },
    onDragStart: (e: React.DragEvent) => onDragStart(e, el.id),
    draggable: true,
    "data-element-id": el.id,
    style: styleObj,
    className: "visual-builder-element",
  };

  if (el.type === "text" || el.type === "heading") {
    const tag = el.type === "heading" ? "h2" : "p";
    const content = (el as TextElement).content || "";
    return React.createElement(
      tag,
      {
        ...commonProps,
        contentEditable: el.id === selectedId,
        suppressContentEditableWarning: true,
        onBlur: (e: React.FormEvent<HTMLDivElement>) => handleTextChange(e, el.id),
      },
      content
    );
  }

  if (el.type === "image") {
    const imgEl = el as ImageElement;
    return (
      <div {...commonProps}>
        <img
          src={imgEl.src}
          alt={imgEl.alt || ""}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
          draggable={false}
        />
      </div>
    );
  }

  if (el.type === "button") {
    const btnEl = el as ButtonElement;
    return (
      <button
        {...commonProps}
        type="button"
        contentEditable={el.id === selectedId}
        suppressContentEditableWarning={true}
        onBlur={(e) => updateElement(el.id, { content: (e.target as HTMLButtonElement).innerText } as Partial<ButtonElement>)}
      >
        {btnEl.content || "Button"}
      </button>
    );
  }

  // Container types
  return (
    <div {...commonProps}>
      {(el.children || []).map((child) => (
        <ElementRenderer
          key={child.id || child.type}
          element={child}
          selectedId={selectedId}
          hoveredId={hoveredId}
          onSelect={onSelect}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  );
}
