export interface DesignElement {
  id: string;
  type: DesignElementType;
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
  children?: string[];
  parentId?: string;
}

export type DesignElementType =
  | 'rectangle' | 'text' | 'button' | 'image' | 'card' | 'navbar' | 'input'
  | 'container' | 'icon' | 'divider' | 'avatar' | 'badge'
  // New advanced types
  | 'hero' | 'footer' | 'testimonial' | 'pricing-card' | 'progress-bar'
  | 'toggle' | 'checkbox' | 'textarea' | 'dropdown' | 'video'
  | 'map' | 'social-icons' | 'stats' | 'sidebar' | 'tabs'
  | 'accordion' | 'gradient-box' | 'glass-card' | 'feature-card'
  | 'cta-banner' | 'logo-cloud' | 'avatar-group' | 'breadcrumb'
  | 'skeleton' | 'tooltip-demo' | 'code-block' | 'table';

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
  paddingX?: number;
  paddingY?: number;
  gap?: number;
  boxShadow?: string;
  backgroundGradient?: string;
  letterSpacing?: number;
  lineHeight?: number;
  backdropBlur?: number;
  filter?: string;
  mixBlendMode?: string;
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  overflow?: string;
  textDecoration?: string;
  textTransform?: string;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
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
  type: DesignElementType;
  label: string;
  icon: string;
  category: 'basic' | 'form' | 'layout' | 'display' | 'sections' | 'data';
  defaultProps: Partial<DesignElement>;
}

export type Tool = 'select' | 'hand' | 'rectangle' | 'text';

export interface AlignAction {
  type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom' | 'distribute-h' | 'distribute-v';
  label: string;
  icon: string;
}

export interface DesignTemplate {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  elements: DesignElement[];
}
