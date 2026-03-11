import { useState } from 'react';
import { WIDGET_DEFINITIONS } from './widgets';
import { DesignElement } from './types';
import { generateId } from './useDesignEditor';

interface WidgetPanelProps {
  onAddElement: (element: DesignElement) => void;
}

const categories = [
  { id: 'basic', label: 'Basic' },
  { id: 'form', label: 'Form' },
  { id: 'layout', label: 'Layout' },
  { id: 'display', label: 'Display' },
];

const WidgetPanel = ({ onAddElement }: WidgetPanelProps) => {
  const [activeCategory, setActiveCategory] = useState('basic');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = WIDGET_DEFINITIONS.filter(w => {
    const matchesCategory = w.category === activeCategory;
    const matchesSearch = !searchQuery || w.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDragStart = (e: React.DragEvent, widget: typeof WIDGET_DEFINITIONS[0]) => {
    e.dataTransfer.setData('widget-type', widget.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClick = (widget: typeof WIDGET_DEFINITIONS[0]) => {
    const el: DesignElement = {
      id: generateId(),
      type: widget.type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
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
  };

  return (
    <div className="w-60 border-r border-border bg-card flex flex-col h-full select-none">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Widgets</h3>
        <input
          type="text"
          placeholder="Search widgets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-8 rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-border">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              activeCategory === cat.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Widget grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-1.5">
          {filtered.map(widget => (
            <div
              key={widget.type}
              draggable
              onDragStart={(e) => handleDragStart(e, widget)}
              onClick={() => handleClick(widget)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border bg-background cursor-grab hover:border-primary/50 hover:bg-primary/5 transition-all active:cursor-grabbing group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{widget.icon}</span>
              <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">{widget.label}</span>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No widgets found</p>
        )}
      </div>
    </div>
  );
};

export default WidgetPanel;
