import { create } from "zustand";
import type { PageElement, PageSchema } from "./schema";
import { DEFAULT_PAGE } from "./schema";

interface VisualBuilderState {
  page: PageSchema;
  selectedId: string | null;
  hoveredId: string | null;
  isDragging: boolean;
  history: PageSchema[];
  historyIndex: number;

  // Actions
  setPage: (page: PageSchema) => void;
  setPageName: (name: string) => void;
  addElement: (element: PageElement, parentId?: string) => void;
  updateElement: (id: string, updates: Partial<PageElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  moveElement: (id: string, newX: number, newY: number) => void;
  resizeElement: (id: string, width: number, height: number) => void;
  selectElement: (id: string | null) => void;
  setHoveredElement: (id: string | null) => void;
  setIsDragging: (v: boolean) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

function generateId(): string {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function findElementById(elements: PageElement[], id: string): PageElement | null {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children) {
      const found = findElementById(el.children, id);
      if (found) return found;
    }
  }
  return null;
}

function updateElementInTree(
  elements: PageElement[],
  id: string,
  updates: Partial<PageElement>
): PageElement[] {
  return elements.map((el): PageElement => {
    if (el.id === id) return { ...el, ...updates };
    if (el.children) {
      return { ...el, children: updateElementInTree(el.children, id, updates) };
    }
    return el;
  });
}

function deleteElementFromTree(
  elements: PageElement[],
  id: string
): PageElement[] {
  return elements
    .filter((el) => el.id !== id)
    .map((el) => {
      if (el.children) {
        return { ...el, children: deleteElementFromTree(el.children, id) };
      }
      return el;
    });
}

function addElementToTree(
  elements: PageElement[],
  element: PageElement,
  parentId?: string
): PageElement[] {
  if (!parentId) return [...elements, element];
  return elements.map((el) => {
    if (el.id === parentId) {
      const children = el.children || [];
      return { ...el, children: [...children, element] };
    }
    if (el.children) {
      return { ...el, children: addElementToTree(el.children, element, parentId) };
    }
    return el;
  });
}

export const useVisualBuilderStore = create<VisualBuilderState>((set, get) => ({
  page: DEFAULT_PAGE,
  selectedId: null,
  hoveredId: null,
  isDragging: false,
  history: [DEFAULT_PAGE],
  historyIndex: 0,

  setPage: (page) => set({ page }),

  setPageName: (name) =>
    set((state) => ({
      page: { ...state.page, name },
    })),

  addElement: (element, parentId) => {
    const el = { ...element, id: element.id || generateId() };
    get().pushHistory();
    set((state) => ({
      page: {
        ...state.page,
        elements: addElementToTree(state.page.elements, el, parentId),
      },
      selectedId: el.id,
    }));
  },

  updateElement: (id, updates) => {
    get().pushHistory();
    set((state) => ({
      page: {
        ...state.page,
        elements: updateElementInTree(state.page.elements, id, updates),
      },
    }));
  },

  deleteElement: (id) => {
    get().pushHistory();
    set((state) => ({
      page: {
        ...state.page,
        elements: deleteElementFromTree(state.page.elements, id),
      },
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  duplicateElement: (id) => {
    const el = findElementById(get().page.elements, id);
    if (!el) return;
    const clone = JSON.parse(JSON.stringify(el)) as PageElement;
    const assignIds = (e: PageElement): PageElement => {
      const base = { ...e, id: generateId() };
      if (base.children) base.children = base.children.map(assignIds);
      return base;
    };
    get().addElement(assignIds(clone));
  },

  moveElement: (id, newX, newY) => {
    set((state) => ({
      page: {
        ...state.page,
        elements: updateElementInTree(state.page.elements, id, {
          x: newX,
          y: newY,
        }),
      },
    }));
  },

  resizeElement: (id, width, height) => {
    set((state) => ({
      page: {
        ...state.page,
        elements: updateElementInTree(state.page.elements, id, {
          width,
          height,
        }),
      },
    }));
  },

  selectElement: (id) => set({ selectedId: id }),
  setHoveredElement: (id) => set({ hoveredId: id }),
  setIsDragging: (v) => set({ isDragging: v }),

  pushHistory: () => {
    const { page, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(page)));
    set({
      history: newHistory.slice(-50),
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({
        page: history[historyIndex - 1],
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({
        page: history[historyIndex + 1],
        historyIndex: historyIndex + 1,
      });
    }
  },
}));
