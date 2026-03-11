import { DesignElement, ElementStyles } from './types';
import { Trash2, Copy, Lock, Unlock, Eye, EyeOff, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertiesPanelProps {
  element: DesignElement | undefined;
  onUpdate: (id: string, updates: Partial<DesignElement>) => void;
  onDelete: (ids: string[]) => void;
  onDuplicate: () => void;
  onMoveLayer: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onCommit: () => void;
}

const ColorInput = ({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) => (
  <div className="flex items-center gap-2">
    <div
      className="w-7 h-7 rounded-md border border-border cursor-pointer shrink-0 relative overflow-hidden"
      style={{ backgroundColor: value || 'transparent' }}
    >
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
    </div>
    <div className="flex-1">
      <label className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="transparent"
        className="w-full bg-transparent text-xs text-foreground border-none outline-none font-mono"
      />
    </div>
  </div>
);

const NumberInput = ({ label, value, onChange, min, max, step = 1 }: {
  label: string; value: number | undefined; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
}) => (
  <div>
    <label className="text-[9px] text-muted-foreground uppercase tracking-wider block mb-0.5">{label}</label>
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min} max={max} step={step}
      className="w-full h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
    />
  </div>
);

const PropertiesPanel = ({ element, onUpdate, onDelete, onDuplicate, onMoveLayer, onCommit }: PropertiesPanelProps) => {
  if (!element) {
    return (
      <div className="w-64 border-l border-border bg-card flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <div className="text-2xl mb-2 opacity-30">⬚</div>
          <p className="text-xs">Select an element</p>
          <p className="text-[10px] opacity-60">to edit its properties</p>
        </div>
      </div>
    );
  }

  const updateStyle = (key: keyof ElementStyles, value: any) => {
    onUpdate(element.id, { styles: { ...element.styles, [key]: value } });
  };

  return (
    <div className="w-64 border-l border-border bg-card flex flex-col h-full select-none overflow-y-auto">
      {/* Element info */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <input
            type="text"
            value={element.name}
            onChange={(e) => onUpdate(element.id, { name: e.target.value })}
            className="text-sm font-semibold text-foreground bg-transparent border-none outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-muted-foreground uppercase bg-secondary px-1.5 py-0.5 rounded">
            {element.type}
          </span>
          <div className="flex-1" />
          <Button size="icon" variant="ghost" className="h-6 w-6"
            onClick={() => onUpdate(element.id, { locked: !element.locked })}>
            {element.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6"
            onClick={() => onUpdate(element.id, { visible: !element.visible })}>
            {element.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onDuplicate}>
            <Copy className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive"
            onClick={() => onDelete([element.id])}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Position & Size */}
      <div className="p-3 border-b border-border space-y-2">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Transform</p>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="X" value={Math.round(element.x)} onChange={(v) => { onUpdate(element.id, { x: v }); onCommit(); }} />
          <NumberInput label="Y" value={Math.round(element.y)} onChange={(v) => { onUpdate(element.id, { y: v }); onCommit(); }} />
          <NumberInput label="W" value={Math.round(element.width)} onChange={(v) => { onUpdate(element.id, { width: v }); onCommit(); }} min={1} />
          <NumberInput label="H" value={Math.round(element.height)} onChange={(v) => { onUpdate(element.id, { height: v }); onCommit(); }} min={1} />
          <NumberInput label="Rotation" value={element.rotation} onChange={(v) => { onUpdate(element.id, { rotation: v }); onCommit(); }} />
          <NumberInput label="Opacity" value={element.opacity} onChange={(v) => { onUpdate(element.id, { opacity: v }); onCommit(); }} min={0} max={1} step={0.1} />
        </div>
      </div>

      {/* Layer order */}
      <div className="p-3 border-b border-border">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Layer Order</p>
        <div className="flex gap-1">
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onMoveLayer(element.id, 'top')}>
            <ChevronsUp className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onMoveLayer(element.id, 'up')}>
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onMoveLayer(element.id, 'down')}>
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onMoveLayer(element.id, 'bottom')}>
            <ChevronsDown className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {element.content !== undefined && (
        <div className="p-3 border-b border-border">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Content</p>
          {element.type === 'image' ? (
            <input
              type="text"
              value={element.content || ''}
              onChange={(e) => { onUpdate(element.id, { content: e.target.value }); onCommit(); }}
              placeholder="Image URL..."
              className="w-full h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          ) : (
            <textarea
              value={element.content || ''}
              onChange={(e) => { onUpdate(element.id, { content: e.target.value }); onCommit(); }}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          )}
        </div>
      )}

      {/* Colors */}
      <div className="p-3 border-b border-border space-y-2">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Fill & Stroke</p>
        <ColorInput label="Fill" value={element.styles.backgroundColor} onChange={(v) => { updateStyle('backgroundColor', v); onCommit(); }} />
        <ColorInput label="Stroke" value={element.styles.borderColor} onChange={(v) => { updateStyle('borderColor', v); onCommit(); }} />
        {element.styles.color !== undefined && (
          <ColorInput label="Text" value={element.styles.color} onChange={(v) => { updateStyle('color', v); onCommit(); }} />
        )}
      </div>

      {/* Border */}
      <div className="p-3 border-b border-border space-y-2">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Border</p>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="Width" value={element.styles.borderWidth} onChange={(v) => { updateStyle('borderWidth', v); onCommit(); }} min={0} />
          <NumberInput label="Radius" value={element.styles.borderRadius} onChange={(v) => { updateStyle('borderRadius', v); onCommit(); }} min={0} />
        </div>
      </div>

      {/* Typography */}
      {element.styles.fontSize !== undefined && (
        <div className="p-3 border-b border-border space-y-2">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Typography</p>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput label="Size" value={element.styles.fontSize} onChange={(v) => { updateStyle('fontSize', v); onCommit(); }} min={1} />
            <div>
              <label className="text-[9px] text-muted-foreground uppercase tracking-wider block mb-0.5">Weight</label>
              <select
                value={element.styles.fontWeight || '400'}
                onChange={(e) => { updateStyle('fontWeight', e.target.value); onCommit(); }}
                className="w-full h-7 rounded-md border border-border bg-background px-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="500">Medium</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
                <option value="800">Extra Bold</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground uppercase tracking-wider block mb-0.5">Align</label>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  onClick={() => { updateStyle('textAlign', align); onCommit(); }}
                  className={`flex-1 h-7 rounded text-xs font-medium border transition-colors ${
                    element.styles.textAlign === align
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {align[0].toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground uppercase tracking-wider block mb-0.5">Font</label>
            <select
              value={element.styles.fontFamily || 'Plus Jakarta Sans'}
              onChange={(e) => { updateStyle('fontFamily', e.target.value); onCommit(); }}
              className="w-full h-7 rounded-md border border-border bg-background px-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Plus Jakarta Sans">Jakarta Sans</option>
              <option value="Instrument Serif">Instrument Serif</option>
              <option value="Fira Code">Fira Code</option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>
        </div>
      )}

      {/* Effects */}
      <div className="p-3 space-y-2">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Effects</p>
        <NumberInput label="Padding" value={element.styles.padding} onChange={(v) => { updateStyle('padding', v); onCommit(); }} min={0} />
        <div>
          <label className="text-[9px] text-muted-foreground uppercase tracking-wider block mb-0.5">Shadow</label>
          <select
            value={element.styles.boxShadow || 'none'}
            onChange={(e) => { updateStyle('boxShadow', e.target.value === 'none' ? undefined : e.target.value); onCommit(); }}
            className="w-full h-7 rounded-md border border-border bg-background px-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="none">None</option>
            <option value="0 1px 3px rgba(0,0,0,0.3)">Small</option>
            <option value="0 4px 12px rgba(0,0,0,0.3)">Medium</option>
            <option value="0 8px 30px rgba(0,0,0,0.4)">Large</option>
            <option value="0 20px 60px rgba(0,0,0,0.5)">XL</option>
            <option value="0 4px 24px rgba(99,102,241,0.3)">Glow</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
