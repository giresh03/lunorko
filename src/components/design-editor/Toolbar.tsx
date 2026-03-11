import { Tool, DesignElement } from './types';
import { MousePointer2, Hand, Undo2, Redo2, Download, Save, ZoomIn, ZoomOut, AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExportDialog from './ExportDialog';

interface ToolbarProps {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  saving: boolean;
  zoom: number;
  onZoom: (delta: number) => void;
  elements: DesignElement[];
  projectName: string;
  onNameChange: (name: string) => void;
  selectedIds: string[];
  onAlign: (type: string) => void;
  onExit: () => void;
}

const tools: { id: Tool; icon: typeof MousePointer2; label: string; shortcut: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
];

const Toolbar = ({
  tool, onToolChange, canUndo, canRedo, onUndo, onRedo,
  onSave, saving, zoom, onZoom, elements, projectName, onNameChange,
  selectedIds, onAlign, onExit,
}: ToolbarProps) => {
  return (
    <div className="h-12 border-b border-border bg-card flex items-center px-3 gap-2 select-none">
      <div className="flex items-center gap-2 mr-3">
        <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center">
          <span className="text-xs text-primary font-bold">🎨</span>
        </div>
        <input type="text" value={projectName} onChange={(e) => onNameChange(e.target.value)}
          className="text-sm font-semibold text-foreground bg-transparent border-none outline-none w-36 focus:bg-secondary/50 rounded px-1" />
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-0.5">
        {tools.map(t => (
          <Button key={t.id} size="icon" variant={tool === t.id ? 'default' : 'ghost'} className="h-8 w-8"
            onClick={() => onToolChange(t.id)} title={`${t.label} (${t.shortcut})`}>
            <t.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-0.5">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onUndo} disabled={!canUndo} title="Undo"><Undo2 className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onRedo} disabled={!canRedo} title="Redo"><Redo2 className="h-4 w-4" /></Button>
      </div>

      {/* Alignment tools - show when elements selected */}
      {selectedIds && selectedIds.length > 0 && (
        <>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-0.5">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onAlign('left')} title="Align Left"><AlignLeft className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onAlign('center-h')} title="Align Center"><AlignCenter className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onAlign('right')} title="Align Right"><AlignRight className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onAlign('top')} title="Align Top"><AlignStartVertical className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onAlign('center-v')} title="Align Middle"><AlignCenterVertical className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onAlign('bottom')} title="Align Bottom"><AlignEndVertical className="h-3.5 w-3.5" /></Button>
          </div>
        </>
      )}

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-0.5">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onZoom(-0.1)} title="Zoom Out"><ZoomOut className="h-4 w-4" /></Button>
        <span className="text-xs text-muted-foreground font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onZoom(0.1)} title="Zoom In"><ZoomIn className="h-4 w-4" /></Button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={onSave} disabled={saving}>
          <Save className="h-3.5 w-3.5" />{saving ? 'Saving...' : 'Save'}
        </Button>
        <ExportDialog elements={elements}>
          <Button size="sm" className="h-8 gap-1.5 text-xs"><Download className="h-3.5 w-3.5" />Export</Button>
        </ExportDialog>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onExit} title="Exit"><X className="h-4 w-4" /></Button>
      </div>
    </div>
  );
};

export default Toolbar;
