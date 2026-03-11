import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDesignEditor } from './useDesignEditor';
import { DesignElement } from './types';
import Toolbar from './Toolbar';
import WidgetPanel from './WidgetPanel';
import DesignCanvas from './DesignCanvas';
import PropertiesPanel from './PropertiesPanel';
import LayersPanel from './LayersPanel';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DesignEditorMainProps {
  onExit: () => void;
}

const DesignEditorMain = ({ onExit }: DesignEditorMainProps) => {
  const { user } = useAuth();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('Untitled Design');
  const [saving, setSaving] = useState(false);

  const editor = useDesignEditor();

  // Load or create project
  useEffect(() => {
    if (!user) return;
    const loadProject = async () => {
      // Get most recent design or create one
      const { data } = await supabase
        .from('design_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const proj = data[0];
        setProjectId(proj.id);
        setProjectName(proj.name);
        const canvasData = proj.canvas_data as any;
        if (canvasData?.elements) {
          editor.setElements(canvasData.elements);
        }
        if (canvasData?.viewport) {
          editor.setViewport(canvasData.viewport);
        }
      } else {
        const { data: newProj } = await supabase
          .from('design_projects')
          .insert({ user_id: user.id, name: 'Untitled Design' })
          .select()
          .single();
        if (newProj) setProjectId(newProj.id);
      }
    };
    loadProject();
  }, [user]);

  // Save
  const handleSave = useCallback(async () => {
    if (!projectId || !user) return;
    setSaving(true);
    const { error } = await supabase
      .from('design_projects')
      .update({
        name: projectName,
        canvas_data: {
          elements: editor.elements,
          viewport: editor.viewport,
        } as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);
    if (error) toast.error('Failed to save');
    else toast.success('Design saved!');
    setSaving(false);
  }, [projectId, user, projectName, editor.elements, editor.viewport]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey) editor.setTool('select');
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey) editor.setTool('hand');
      if ((e.key === 'Delete' || e.key === 'Backspace') && editor.selectedIds.length > 0) {
        // Don't delete if typing in an input
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
        editor.deleteElements(editor.selectedIds);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); editor.undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); editor.redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') editor.copyElements();
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && editor.selectedIds.length === 0) editor.pasteElements();
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
      {/* Top toolbar */}
      <div className="relative">
        <Toolbar
          tool={editor.tool}
          onToolChange={editor.setTool}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          onUndo={editor.undo}
          onRedo={editor.redo}
          onSave={handleSave}
          saving={saving}
          zoom={editor.viewport.zoom}
          onZoom={handleZoom}
          elements={editor.elements}
          projectName={projectName}
          onNameChange={setProjectName}
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8"
          onClick={onExit}
          title="Exit Designer"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Widgets + Layers */}
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <WidgetPanel onAddElement={editor.addElement} />
          </div>
          <LayersPanel
            elements={editor.elements}
            selectedIds={editor.selectedIds}
            onSelect={editor.setSelectedIds}
            onUpdate={editor.updateElement}
          />
        </div>

        {/* Center: Canvas */}
        <DesignCanvas
          elements={editor.elements}
          selectedIds={editor.selectedIds}
          viewport={editor.viewport}
          tool={editor.tool}
          onSelect={editor.setSelectedIds}
          onUpdateElement={editor.updateElement}
          onCommit={editor.commitElement}
          onAddElement={editor.addElement}
          onViewportChange={editor.setViewport}
        />

        {/* Right: Properties */}
        <PropertiesPanel
          element={editor.selectedElement}
          onUpdate={editor.updateElement}
          onDelete={editor.deleteElements}
          onDuplicate={editor.duplicateElements}
          onMoveLayer={editor.moveLayer}
          onCommit={editor.commitElement}
        />
      </div>
    </div>
  );
};

export default DesignEditorMain;
