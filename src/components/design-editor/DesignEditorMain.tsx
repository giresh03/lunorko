import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDesignEditor } from './useDesignEditor';
import Toolbar from './Toolbar';
import WidgetPanel from './WidgetPanel';
import DesignCanvas from './DesignCanvas';
import PropertiesPanel from './PropertiesPanel';
import LayersPanel from './LayersPanel';

interface DesignEditorMainProps {
  onExit: () => void;
}

const DesignEditorMain = ({ onExit }: DesignEditorMainProps) => {
  const { user } = useAuth();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('Untitled Design');
  const [saving, setSaving] = useState(false);
  const editor = useDesignEditor();

  useEffect(() => {
    if (!user) return;
    const loadProject = async () => {
      const { data } = await supabase.from('design_projects').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1);
      if (data && data.length > 0) {
        const proj = data[0];
        setProjectId(proj.id);
        setProjectName(proj.name);
        const canvasData = proj.canvas_data as any;
        if (canvasData?.elements) editor.setElements(canvasData.elements);
        if (canvasData?.viewport) editor.setViewport(canvasData.viewport);
      } else {
        const { data: newProj } = await supabase.from('design_projects').insert({ user_id: user.id, name: 'Untitled Design' }).select().single();
        if (newProj) setProjectId(newProj.id);
      }
    };
    loadProject();
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!projectId || !user) return;
    setSaving(true);
    const { error } = await supabase.from('design_projects').update({
      name: projectName,
      canvas_data: { elements: editor.elements, viewport: editor.viewport } as any,
      updated_at: new Date().toISOString(),
    }).eq('id', projectId);
    if (error) toast.error('Failed to save');
    else toast.success('Design saved!');
    setSaving(false);
  }, [projectId, user, projectName, editor.elements, editor.viewport]);

  // Alignment
  const handleAlign = useCallback((type: string) => {
    const selected = editor.elements.filter(el => editor.selectedIds.includes(el.id));
    if (selected.length === 0) return;

    if (selected.length === 1) {
      // Align to canvas (0,0 reference)
      const el = selected[0];
      switch (type) {
        case 'left': editor.updateElement(el.id, { x: 0 }); break;
        case 'center-h': editor.updateElement(el.id, { x: 400 - el.width / 2 }); break;
        case 'right': editor.updateElement(el.id, { x: 800 - el.width }); break;
        case 'top': editor.updateElement(el.id, { y: 0 }); break;
        case 'center-v': editor.updateElement(el.id, { y: 300 - el.height / 2 }); break;
        case 'bottom': editor.updateElement(el.id, { y: 600 - el.height }); break;
      }
    } else {
      const minX = Math.min(...selected.map(e => e.x));
      const maxX = Math.max(...selected.map(e => e.x + e.width));
      const minY = Math.min(...selected.map(e => e.y));
      const maxY = Math.max(...selected.map(e => e.y + e.height));
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      selected.forEach(el => {
        switch (type) {
          case 'left': editor.updateElement(el.id, { x: minX }); break;
          case 'center-h': editor.updateElement(el.id, { x: centerX - el.width / 2 }); break;
          case 'right': editor.updateElement(el.id, { x: maxX - el.width }); break;
          case 'top': editor.updateElement(el.id, { y: minY }); break;
          case 'center-v': editor.updateElement(el.id, { y: centerY - el.height / 2 }); break;
          case 'bottom': editor.updateElement(el.id, { y: maxY - el.height }); break;
        }
      });
    }
    editor.commitElement();
  }, [editor]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
        return;
      }
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey) editor.setTool('select');
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey) editor.setTool('hand');
      if ((e.key === 'Delete' || e.key === 'Backspace') && editor.selectedIds.length > 0) editor.deleteElements(editor.selectedIds);
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); editor.undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); editor.redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') editor.copyElements();
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') editor.pasteElements();
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); editor.duplicateElements(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editor, handleSave]);

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.1, Math.min(5, editor.viewport.zoom + delta));
    editor.setViewport({ ...editor.viewport, zoom: newZoom });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <Toolbar
        tool={editor.tool} onToolChange={editor.setTool}
        canUndo={editor.canUndo} canRedo={editor.canRedo}
        onUndo={editor.undo} onRedo={editor.redo}
        onSave={handleSave} saving={saving}
        zoom={editor.viewport.zoom} onZoom={handleZoom}
        elements={editor.elements} projectName={projectName} onNameChange={setProjectName}
        selectedIds={editor.selectedIds} onAlign={handleAlign} onExit={onExit}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <WidgetPanel onAddElement={editor.addElement} />
          </div>
          <LayersPanel elements={editor.elements} selectedIds={editor.selectedIds} onSelect={editor.setSelectedIds} onUpdate={editor.updateElement} />
        </div>
        <DesignCanvas
          elements={editor.elements} selectedIds={editor.selectedIds} viewport={editor.viewport} tool={editor.tool}
          onSelect={editor.setSelectedIds} onUpdateElement={editor.updateElement} onCommit={editor.commitElement}
          onAddElement={editor.addElement} onViewportChange={editor.setViewport}
        />
        <PropertiesPanel
          element={editor.selectedElement} onUpdate={editor.updateElement} onDelete={editor.deleteElements}
          onDuplicate={editor.duplicateElements} onMoveLayer={editor.moveLayer} onCommit={editor.commitElement}
        />
      </div>
    </div>
  );
};

export default DesignEditorMain;
