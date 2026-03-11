import { WidgetDefinition } from './types';

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  // Basic
  {
    type: 'rectangle',
    label: 'Rectangle',
    icon: '◻',
    category: 'basic',
    defaultProps: {
      width: 200,
      height: 120,
      styles: { backgroundColor: '#6366f1', borderRadius: 8 },
    },
  },
  {
    type: 'text',
    label: 'Text',
    icon: 'T',
    category: 'basic',
    defaultProps: {
      width: 200,
      height: 40,
      content: 'Heading Text',
      styles: { color: '#ffffff', fontSize: 24, fontWeight: '700', fontFamily: 'Plus Jakarta Sans' },
    },
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: '—',
    category: 'basic',
    defaultProps: {
      width: 300,
      height: 2,
      styles: { backgroundColor: '#334155' },
    },
  },
  {
    type: 'image',
    label: 'Image',
    icon: '🖼',
    category: 'basic',
    defaultProps: {
      width: 240,
      height: 160,
      content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
      styles: { borderRadius: 12 },
    },
  },

  // Form
  {
    type: 'button',
    label: 'Button',
    icon: '▣',
    category: 'form',
    defaultProps: {
      width: 160,
      height: 44,
      content: 'Click Me',
      styles: {
        backgroundColor: '#6366f1',
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        borderRadius: 8,
        textAlign: 'center',
      },
    },
  },
  {
    type: 'input',
    label: 'Input Field',
    icon: '▭',
    category: 'form',
    defaultProps: {
      width: 260,
      height: 44,
      content: 'Enter text...',
      styles: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        borderWidth: 1,
        borderRadius: 8,
        color: '#94a3b8',
        fontSize: 14,
        padding: 12,
      },
    },
  },

  // Layout
  {
    type: 'container',
    label: 'Frame',
    icon: '⬚',
    category: 'layout',
    defaultProps: {
      width: 360,
      height: 400,
      styles: {
        backgroundColor: '#0f172a',
        borderColor: '#1e293b',
        borderWidth: 1,
        borderRadius: 16,
        padding: 24,
      },
    },
  },
  {
    type: 'card',
    label: 'Card',
    icon: '▢',
    category: 'layout',
    defaultProps: {
      width: 320,
      height: 200,
      styles: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        borderWidth: 1,
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      },
    },
  },
  {
    type: 'navbar',
    label: 'Navbar',
    icon: '≡',
    category: 'layout',
    defaultProps: {
      width: 800,
      height: 64,
      content: 'Logo',
      styles: {
        backgroundColor: '#0f172a',
        borderColor: '#1e293b',
        borderWidth: 1,
        borderRadius: 0,
        padding: 16,
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
      },
    },
  },

  // Display
  {
    type: 'avatar',
    label: 'Avatar',
    icon: '●',
    category: 'display',
    defaultProps: {
      width: 48,
      height: 48,
      content: 'U',
      styles: {
        backgroundColor: '#6366f1',
        borderRadius: 999,
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
      },
    },
  },
  {
    type: 'badge',
    label: 'Badge',
    icon: '⬮',
    category: 'display',
    defaultProps: {
      width: 80,
      height: 28,
      content: 'Badge',
      styles: {
        backgroundColor: '#6366f1',
        borderRadius: 999,
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
        padding: 4,
      },
    },
  },
  {
    type: 'icon',
    label: 'Icon',
    icon: '★',
    category: 'display',
    defaultProps: {
      width: 40,
      height: 40,
      content: '★',
      styles: {
        color: '#6366f1',
        fontSize: 28,
        textAlign: 'center',
      },
    },
  },
];
