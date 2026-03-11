import { useState, useCallback, useRef } from 'react';
import { DesignElement, CanvasViewport, Tool } from './types';

let idCounter = 0;
export const generateId = () => `el_${Date.now()}_${++idCounter}`;

export const useDesignEditor = () => {
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewport, setViewport] = useState<CanvasViewport>({ x: 0, y: 0, zoom: 1 });
  const [tool, setTool] = useState<Tool>('select');
  const [history, setHistory] = useState<DesignElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [clipboard, setClipboard] = useState<DesignElement[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const pushHistory = useCallback((newElements: DesignElement[]) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newElements];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const addElement = useCallback((element: DesignElement) => {
    setElements(prev => {
      const next = [...prev, element];
      pushHistory(next);
      return next;
    });
    setSelectedIds([element.id]);
  }, [pushHistory]);

  const updateElement = useCallback((id: string, updates: Partial<DesignElement>) => {
    setElements(prev => {
      const next = prev.map(el => el.id === id ? { ...el, ...updates } : el);
      return next;
    });
  }, []);

  const commitElement = useCallback(() => {
    setElements(prev => {
      pushHistory(prev);
      return prev;
    });
  }, [pushHistory]);

  const deleteElements = useCallback((ids: string[]) => {
    setElements(prev => {
      const next = prev.filter(el => !ids.includes(el.id));
      pushHistory(next);
      return next;
    });
    setSelectedIds([]);
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
      setSelectedIds([]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
      setSelectedIds([]);
    }
  }, [history, historyIndex]);

  const copyElements = useCallback(() => {
    const selected = elements.filter(el => selectedIds.includes(el.id));
    setClipboard(selected);
  }, [elements, selectedIds]);

  const pasteElements = useCallback(() => {
    const pasted = clipboard.map(el => ({
      ...el,
      id: generateId(),
      x: el.x + 20,
      y: el.y + 20,
      name: `${el.name} copy`,
    }));
    setElements(prev => {
      const next = [...prev, ...pasted];
      pushHistory(next);
      return next;
    });
    setSelectedIds(pasted.map(el => el.id));
  }, [clipboard, pushHistory]);

  const duplicateElements = useCallback(() => {
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const duped = selected.map(el => ({
      ...el,
      id: generateId(),
      x: el.x + 20,
      y: el.y + 20,
      name: `${el.name} copy`,
    }));
    setElements(prev => {
      const next = [...prev, ...duped];
      pushHistory(next);
      return next;
    });
    setSelectedIds(duped.map(el => el.id));
  }, [elements, selectedIds, pushHistory]);

  const moveLayer = useCallback((id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    setElements(prev => {
      const idx = prev.findIndex(el => el.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      switch (direction) {
        case 'up': next.splice(Math.min(idx + 1, next.length), 0, item); break;
        case 'down': next.splice(Math.max(idx - 1, 0), 0, item); break;
        case 'top': next.push(item); break;
        case 'bottom': next.unshift(item); break;
      }
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const selectedElement = elements.find(el => selectedIds[0] === el.id);

  return {
    elements, setElements,
    selectedIds, setSelectedIds,
    selectedElement,
    viewport, setViewport,
    tool, setTool,
    isDragging, setIsDragging,
    addElement, updateElement, commitElement,
    deleteElements, undo, redo,
    copyElements, pasteElements, duplicateElements,
    moveLayer,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
};
