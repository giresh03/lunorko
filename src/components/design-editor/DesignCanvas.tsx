import { useRef, useCallback, useEffect, useState } from 'react';
import { DesignElement, CanvasViewport, Tool } from './types';
import { WIDGET_DEFINITIONS } from './widgets';
import { generateId } from './useDesignEditor';
import CanvasElement from './CanvasElement';

interface DesignCanvasProps {
  elements: DesignElement[];
  selectedIds: string[];
  viewport: CanvasViewport;
  tool: Tool;
  onSelect: (ids: string[]) => void;
  onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
  onCommit: () => void;
  onAddElement: (element: DesignElement) => void;
  onViewportChange: (viewport: CanvasViewport) => void;
}

const GRID_SIZE = 16;
const snap = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE;

const DesignCanvas = ({
  elements, selectedIds, viewport, tool,
  onSelect, onUpdateElement, onCommit, onAddElement, onViewportChange,
}: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragResizeState, setDragResizeState] = useState<{
    type: 'move' | 'resize';
    elementId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
    handle?: string;
  } | null>(null);

  // Handle drop from widget panel
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const widgetType = e.dataTransfer.getData('widget-type');
    if (!widgetType) return;

    const widget = WIDGET_DEFINITIONS.find(w => w.type === widgetType);
    if (!widget) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = snap((e.clientX - rect.left - viewport.x) / viewport.zoom);
    const y = snap((e.clientY - rect.top - viewport.y) / viewport.zoom);

    const el: DesignElement = {
      id: generateId(),
      type: widget.type,
      x, y,
      width: widget.defaultProps.width || 200,
      height: widget.defaultProps.height || 100,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      name: widget.label,
      styles: widget.defaultProps.styles || {},
      content: widget.defaultProps.content,
    };
    onAddElement(el);
  }, [viewport, onAddElement]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Canvas click to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvas === 'true') {
      onSelect([]);
    }
  }, [onSelect]);

  // Pan with middle mouse or hand tool
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (tool === 'hand' && e.button === 0)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
    }
  }, [tool, viewport]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      onViewportChange({
        ...viewport,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (dragResizeState) {
      const dx = (e.clientX - dragResizeState.startX) / viewport.zoom;
      const dy = (e.clientY - dragResizeState.startY) / viewport.zoom;

      if (dragResizeState.type === 'move') {
        onUpdateElement(dragResizeState.elementId, {
          x: snap(dragResizeState.origX + dx),
          y: snap(dragResizeState.origY + dy),
        });
      } else if (dragResizeState.type === 'resize') {
        const handle = dragResizeState.handle || 'se';
        let newW = dragResizeState.origW;
        let newH = dragResizeState.origH;
        let newX = dragResizeState.origX;
        let newY = dragResizeState.origY;

        if (handle.includes('e')) newW = Math.max(20, dragResizeState.origW + dx);
        if (handle.includes('s')) newH = Math.max(20, dragResizeState.origH + dy);
        if (handle.includes('w')) {
          newW = Math.max(20, dragResizeState.origW - dx);
          newX = dragResizeState.origX + dx;
        }
        if (handle.includes('n')) {
          newH = Math.max(20, dragResizeState.origH - dy);
          newY = dragResizeState.origY + dy;
        }

        onUpdateElement(dragResizeState.elementId, {
          x: snap(newX), y: snap(newY),
          width: snap(newW), height: snap(newH),
        });
      }
    }
  }, [isPanning, panStart, viewport, dragResizeState, onUpdateElement, onViewportChange]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) setIsPanning(false);
    if (dragResizeState) {
      onCommit();
      setDragResizeState(null);
    }
  }, [isPanning, dragResizeState, onCommit]);

  // Zoom with scroll
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(5, viewport.zoom * delta));
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      onViewportChange({
        zoom: newZoom,
        x: mx - (mx - viewport.x) * (newZoom / viewport.zoom),
        y: my - (my - viewport.y) * (newZoom / viewport.zoom),
      });
    } else {
      onViewportChange({
        ...viewport,
        x: viewport.x - e.deltaX,
        y: viewport.y - e.deltaY,
      });
    }
  }, [viewport, onViewportChange]);

  const startDrag = useCallback((elementId: string, startX: number, startY: number, element: DesignElement) => {
    setDragResizeState({
      type: 'move',
      elementId,
      startX, startY,
      origX: element.x, origY: element.y,
      origW: element.width, origH: element.height,
    });
  }, []);

  const startResize = useCallback((elementId: string, startX: number, startY: number, element: DesignElement, handle: string) => {
    setDragResizeState({
      type: 'resize',
      elementId,
      startX, startY,
      origX: element.x, origY: element.y,
      origW: element.width, origH: element.height,
      handle,
    });
  }, []);

  // Visible elements sorted by z-index (array order)
  const visibleElements = elements.filter(el => el.visible);

  return (
    <div
      ref={canvasRef}
      className="flex-1 overflow-hidden relative"
      style={{
        background: 'radial-gradient(circle at 50% 50%, hsl(228 40% 8%), hsl(224 71% 3%))',
        cursor: isPanning ? 'grabbing' : tool === 'hand' ? 'grab' : 'default',
      }}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      data-canvas="true"
    >
      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" data-canvas="true">
        <defs>
          <pattern
            id="grid"
            width={GRID_SIZE * viewport.zoom}
            height={GRID_SIZE * viewport.zoom}
            patternUnits="userSpaceOnUse"
            x={viewport.x % (GRID_SIZE * viewport.zoom)}
            y={viewport.y % (GRID_SIZE * viewport.zoom)}
          >
            <circle cx="1" cy="1" r="1" fill="currentColor" className="text-foreground" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Elements layer */}
      <div
        className="absolute origin-top-left"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }}
        data-canvas="true"
      >
        {visibleElements.map(el => (
          <CanvasElement
            key={el.id}
            element={el}
            isSelected={selectedIds.includes(el.id)}
            onSelect={(id, multi) => {
              if (multi) {
                onSelect(selectedIds.includes(id) ? selectedIds.filter(s => s !== id) : [...selectedIds, id]);
              } else {
                onSelect([id]);
              }
            }}
            onStartDrag={startDrag}
            onStartResize={startResize}
          />
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground font-mono">
        {Math.round(viewport.zoom * 100)}%
      </div>

      {/* Empty state */}
      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" data-canvas="true">
          <div className="text-center">
            <div className="text-4xl mb-3 opacity-20">🎨</div>
            <p className="text-muted-foreground/50 text-sm">Drag widgets from the left panel</p>
            <p className="text-muted-foreground/30 text-xs mt-1">or click a widget to add it</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignCanvas;
