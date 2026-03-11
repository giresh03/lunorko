import { WidgetDefinition } from './types';

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  // ===== BASIC =====
  {
    type: 'rectangle', label: 'Rectangle', icon: '◻', category: 'basic',
    defaultProps: { width: 200, height: 120, styles: { backgroundColor: '#6366f1', borderRadius: 8 } },
  },
  {
    type: 'text', label: 'Text', icon: 'T', category: 'basic',
    defaultProps: { width: 200, height: 40, content: 'Heading Text', styles: { color: '#ffffff', fontSize: 24, fontWeight: '700', fontFamily: 'Plus Jakarta Sans' } },
  },
  {
    type: 'divider', label: 'Divider', icon: '—', category: 'basic',
    defaultProps: { width: 300, height: 2, styles: { backgroundColor: '#334155' } },
  },
  {
    type: 'image', label: 'Image', icon: '🖼', category: 'basic',
    defaultProps: { width: 240, height: 160, content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop', styles: { borderRadius: 12 } },
  },
  {
    type: 'gradient-box', label: 'Gradient', icon: '🌈', category: 'basic',
    defaultProps: { width: 240, height: 160, styles: { backgroundGradient: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: 16 } },
  },
  {
    type: 'glass-card', label: 'Glass Card', icon: '🪟', category: 'basic',
    defaultProps: {
      width: 300, height: 180,
      styles: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderRadius: 20, backdropBlur: 16, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
    },
  },
  {
    type: 'video', label: 'Video', icon: '▶', category: 'basic',
    defaultProps: { width: 320, height: 200, content: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&fit=crop', styles: { borderRadius: 12, backgroundColor: '#0f172a' } },
  },
  {
    type: 'code-block', label: 'Code Block', icon: '<>', category: 'basic',
    defaultProps: {
      width: 320, height: 160, content: 'const hello = () => {\n  return "world";\n};',
      styles: { backgroundColor: '#1e1e2e', borderRadius: 12, padding: 16, color: '#a6e3a1', fontSize: 13, fontFamily: 'Fira Code', fontWeight: '400' },
    },
  },

  // ===== FORM =====
  {
    type: 'button', label: 'Button', icon: '▣', category: 'form',
    defaultProps: { width: 160, height: 44, content: 'Click Me', styles: { backgroundColor: '#6366f1', color: '#ffffff', fontSize: 14, fontWeight: '600', borderRadius: 8, textAlign: 'center' } },
  },
  {
    type: 'input', label: 'Input', icon: '▭', category: 'form',
    defaultProps: { width: 260, height: 44, content: 'Enter text...', styles: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1, borderRadius: 8, color: '#94a3b8', fontSize: 14, padding: 12 } },
  },
  {
    type: 'textarea', label: 'Textarea', icon: '📝', category: 'form',
    defaultProps: { width: 280, height: 100, content: 'Write something...', styles: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1, borderRadius: 8, color: '#94a3b8', fontSize: 14, padding: 12 } },
  },
  {
    type: 'dropdown', label: 'Dropdown', icon: '⌄', category: 'form',
    defaultProps: {
      width: 220, height: 44, content: 'Select option',
      styles: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1, borderRadius: 8, color: '#e2e8f0', fontSize: 14, padding: 12 },
    },
  },
  {
    type: 'checkbox', label: 'Checkbox', icon: '☑', category: 'form',
    defaultProps: { width: 180, height: 24, content: 'Accept terms', styles: { color: '#e2e8f0', fontSize: 14 } },
  },
  {
    type: 'toggle', label: 'Toggle', icon: '⊙', category: 'form',
    defaultProps: { width: 52, height: 28, styles: { backgroundColor: '#6366f1', borderRadius: 999 } },
  },

  // ===== LAYOUT =====
  {
    type: 'container', label: 'Frame', icon: '⬚', category: 'layout',
    defaultProps: { width: 360, height: 400, styles: { backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1, borderRadius: 16, padding: 24 } },
  },
  {
    type: 'card', label: 'Card', icon: '▢', category: 'layout',
    defaultProps: { width: 320, height: 200, styles: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1, borderRadius: 16, padding: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' } },
  },
  {
    type: 'navbar', label: 'Navbar', icon: '≡', category: 'layout',
    defaultProps: { width: 800, height: 64, content: 'Logo', styles: { backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1, borderRadius: 0, padding: 16, color: '#ffffff', fontSize: 18, fontWeight: '700' } },
  },
  {
    type: 'sidebar', label: 'Sidebar', icon: '⊞', category: 'layout',
    defaultProps: {
      width: 240, height: 500, content: 'Dashboard\nAnalytics\nSettings\nProfile\nLogout',
      styles: { backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1, padding: 16, color: '#94a3b8', fontSize: 14 },
    },
  },
  {
    type: 'footer', label: 'Footer', icon: '⊥', category: 'layout',
    defaultProps: {
      width: 800, height: 200, content: '© 2026 Company',
      styles: { backgroundColor: '#020617', borderColor: '#1e293b', borderWidth: 1, padding: 32, color: '#64748b', fontSize: 14, textAlign: 'center' },
    },
  },
  {
    type: 'tabs', label: 'Tabs', icon: '⊟', category: 'layout',
    defaultProps: {
      width: 400, height: 44, content: 'Overview|Features|Pricing',
      styles: { backgroundColor: '#1e293b', borderRadius: 8, padding: 4, color: '#e2e8f0', fontSize: 14, fontWeight: '500' },
    },
  },
  {
    type: 'breadcrumb', label: 'Breadcrumb', icon: '›', category: 'layout',
    defaultProps: {
      width: 300, height: 24, content: 'Home > Products > Details',
      styles: { color: '#64748b', fontSize: 13 },
    },
  },

  // ===== DISPLAY =====
  {
    type: 'avatar', label: 'Avatar', icon: '●', category: 'display',
    defaultProps: { width: 48, height: 48, content: 'U', styles: { backgroundColor: '#6366f1', borderRadius: 999, color: '#ffffff', fontSize: 18, fontWeight: '600', textAlign: 'center' } },
  },
  {
    type: 'avatar-group', label: 'Avatar Group', icon: '●●', category: 'display',
    defaultProps: { width: 148, height: 40, content: 'A B C D', styles: { color: '#ffffff', fontSize: 14, fontWeight: '600' } },
  },
  {
    type: 'badge', label: 'Badge', icon: '⬮', category: 'display',
    defaultProps: { width: 80, height: 28, content: 'Badge', styles: { backgroundColor: '#6366f1', borderRadius: 999, color: '#ffffff', fontSize: 11, fontWeight: '600', textAlign: 'center', padding: 4 } },
  },
  {
    type: 'icon', label: 'Icon', icon: '★', category: 'display',
    defaultProps: { width: 40, height: 40, content: '★', styles: { color: '#6366f1', fontSize: 28, textAlign: 'center' } },
  },
  {
    type: 'progress-bar', label: 'Progress', icon: '█░', category: 'display',
    defaultProps: { width: 240, height: 8, content: '65', styles: { backgroundColor: '#1e293b', borderRadius: 999 } },
  },
  {
    type: 'skeleton', label: 'Skeleton', icon: '░░', category: 'display',
    defaultProps: { width: 240, height: 20, styles: { backgroundColor: '#1e293b', borderRadius: 8 } },
  },
  {
    type: 'tooltip-demo', label: 'Tooltip', icon: '💬', category: 'display',
    defaultProps: {
      width: 180, height: 36, content: 'Tooltip text here',
      styles: { backgroundColor: '#1e293b', borderRadius: 8, padding: 8, color: '#e2e8f0', fontSize: 12, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' },
    },
  },
  {
    type: 'social-icons', label: 'Social Icons', icon: '🔗', category: 'display',
    defaultProps: {
      width: 200, height: 40, content: '𝕏 ▶ ⬡ ◉',
      styles: { color: '#94a3b8', fontSize: 22, textAlign: 'center', gap: 16 },
    },
  },

  // ===== SECTIONS =====
  {
    type: 'hero', label: 'Hero Section', icon: '🏠', category: 'sections',
    defaultProps: {
      width: 800, height: 400, content: 'Build Amazing Products\nThe modern way to create stunning websites',
      styles: { backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)', borderRadius: 0, padding: 48, color: '#ffffff', fontSize: 40, fontWeight: '800', textAlign: 'center' },
    },
  },
  {
    type: 'feature-card', label: 'Feature Card', icon: '✨', category: 'sections',
    defaultProps: {
      width: 280, height: 220, content: '⚡\nLightning Fast\nOptimized for speed with modern tech stack.',
      styles: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1, borderRadius: 16, padding: 24, color: '#e2e8f0', fontSize: 14, textAlign: 'center' },
    },
  },
  {
    type: 'testimonial', label: 'Testimonial', icon: '💬', category: 'sections',
    defaultProps: {
      width: 340, height: 180, content: '"This product changed our workflow completely."\n— Sarah Johnson, CEO',
      styles: { backgroundColor: '#1e293b', borderColor: '#6366f1', borderWidth: 1, borderRadius: 16, padding: 24, color: '#e2e8f0', fontSize: 15 },
    },
  },
  {
    type: 'pricing-card', label: 'Pricing Card', icon: '💰', category: 'sections',
    defaultProps: {
      width: 280, height: 360, content: 'Pro Plan\n$29/mo\n✓ Unlimited projects\n✓ Priority support\n✓ Advanced analytics\n✓ Custom integrations',
      styles: { backgroundColor: '#1e293b', borderColor: '#6366f1', borderWidth: 2, borderRadius: 20, padding: 32, color: '#e2e8f0', fontSize: 14, textAlign: 'center' },
    },
  },
  {
    type: 'cta-banner', label: 'CTA Banner', icon: '📢', category: 'sections',
    defaultProps: {
      width: 700, height: 120, content: 'Ready to get started? Sign up for free today →',
      styles: { backgroundGradient: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 16, padding: 32, color: '#ffffff', fontSize: 22, fontWeight: '700', textAlign: 'center' },
    },
  },
  {
    type: 'logo-cloud', label: 'Logo Cloud', icon: '🏢', category: 'sections',
    defaultProps: {
      width: 600, height: 80, content: 'Google   Apple   Meta   Amazon   Netflix',
      styles: { backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1, borderRadius: 12, padding: 20, color: '#475569', fontSize: 16, fontWeight: '600', textAlign: 'center', letterSpacing: 2 },
    },
  },

  // ===== DATA =====
  {
    type: 'stats', label: 'Stats Counter', icon: '📊', category: 'data',
    defaultProps: {
      width: 180, height: 100, content: '12,500\nActive Users',
      styles: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, color: '#ffffff', fontSize: 28, fontWeight: '800', textAlign: 'center' },
    },
  },
  {
    type: 'table', label: 'Table', icon: '⊞', category: 'data',
    defaultProps: {
      width: 400, height: 200, content: 'Name|Email|Role\nJohn|john@mail.com|Admin\nSarah|sarah@mail.com|User\nMike|mike@mail.com|Editor',
      styles: { backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1, borderRadius: 12, color: '#e2e8f0', fontSize: 13 },
    },
  },
  {
    type: 'map', label: 'Map', icon: '🗺', category: 'data',
    defaultProps: {
      width: 320, height: 200,
      styles: { backgroundColor: '#1a1a2e', borderRadius: 12, borderColor: '#334155', borderWidth: 1 },
    },
  },
];
