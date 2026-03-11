export interface DesignElement {
  id: string;
  type: 'rectangle' | 'text' | 'button' | 'image' | 'card' | 'navbar' | 'input' | 'container' | 'icon' | 'divider' | 'avatar' | 'badge';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  name: string;
  styles: ElementStyles;
  content?: string;
  children?: string[]; // IDs of child elements
  parentId?: string;
}

export interface ElementStyles {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  borderStyle?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  padding?: number;
  gap?: number;
  boxShadow?: string;
  backgroundGradient?: string;
  letterSpacing?: number;
  lineHeight?: number;
}

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface DesignProject {
  id: string;
  user_id: string;
  name: string;
  canvas_data: {
    elements: DesignElement[];
    viewport: CanvasViewport;
  };
  created_at: string;
  updated_at: string;
}

export interface WidgetDefinition {
  type: DesignElement['type'];
  label: string;
  icon: string;
  category: 'basic' | 'form' | 'layout' | 'display';
  defaultProps: Partial<DesignElement>;
}

export type Tool = 'select' | 'hand' | 'rectangle' | 'text';
