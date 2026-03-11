import { DesignElement } from './types';
import { Eye, EyeOff, Lock, Unlock, GripVertical } from 'lucide-react';

interface LayersPanelProps {
  elements: DesignElement[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onUpdate: (id: string, updates: Partial<DesignElement>) => void;
}

const ELEMENT_ICONS: Record<string, string> = {
  rectangle: '◻', text: 'T', button: '▣', image: '🖼', card: '▢',
  navbar: '≡', input: '▭', container: '⬚', icon: '★', divider: '—',
  avatar: '●', badge: '⬮', hero: '🏠', footer: '⊥', testimonial: '💬',
  'pricing-card': '💰', 'progress-bar': '█░', toggle: '⊙', checkbox: '☑',
  textarea: '📝', dropdown: '⌄', video: '▶', map: '🗺',
  'social-icons': '🔗', stats: '📊', sidebar: '⊞', tabs: '⊟',
  accordion: '▸', 'gradient-box': '🌈', 'glass-card': '🪟',
  'feature-card': '✨', 'cta-banner': '📢', 'logo-cloud': '🏢',
  'avatar-group': '●●', breadcrumb: '›', skeleton: '░░',
  'tooltip-demo': '💬', 'code-block': '<>', table: '⊞',
};

const LayersPanel = ({ elements, selectedIds, onSelect, onUpdate }: LayersPanelProps) => {
  const reversed = [...elements].reverse();

  return (
    <div className="border-t border-border bg-card">
      <div className="p-2 border-b border-border">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Layers ({elements.length})
        </h4>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {reversed.map(el => (
          <div
            key={el.id}
            onClick={() => onSelect([el.id])}
            className={`flex items-center gap-1.5 px-2 py-1.5 cursor-pointer hover:bg-muted/30 transition-colors text-xs ${
              selectedIds.includes(el.id) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
            }`}
          >
            <GripVertical className="h-3 w-3 opacity-30 shrink-0" />
            <span className="text-sm shrink-0">{ELEMENT_ICONS[el.type] || '?'}</span>
            <span className="truncate flex-1 font-medium">{el.name}</span>
            <button
              className="h-5 w-5 flex items-center justify-center hover:text-foreground shrink-0"
              onClick={(e) => { e.stopPropagation(); onUpdate(el.id, { visible: !el.visible }); }}
            >
              {el.visible ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
            </button>
            <button
              className="h-5 w-5 flex items-center justify-center hover:text-foreground shrink-0"
              onClick={(e) => { e.stopPropagation(); onUpdate(el.id, { locked: !el.locked }); }}
            >
              {el.locked ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5 opacity-30" />}
            </button>
          </div>
        ))}
        {elements.length === 0 && (
          <p className="text-[10px] text-muted-foreground text-center py-4">No layers</p>
        )}
      </div>
    </div>
  );
};

export default LayersPanel;
