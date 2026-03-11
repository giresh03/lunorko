import { useCallback } from 'react';
import { DesignElement } from './types';

interface CanvasElementProps {
  element: DesignElement;
  isSelected: boolean;
  onSelect: (id: string, multi: boolean) => void;
  onStartDrag: (id: string, x: number, y: number, element: DesignElement) => void;
  onStartResize: (id: string, x: number, y: number, element: DesignElement, handle: string) => void;
}

const RESIZE_HANDLES = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];

const handleCursors: Record<string, string> = {
  nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
  n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
};

const CanvasElement = ({ element, isSelected, onSelect, onStartDrag, onStartResize }: CanvasElementProps) => {
  const { id, x, y, width, height, type, styles, content, opacity, locked } = element;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id, e.shiftKey);
    if (!locked) onStartDrag(id, e.clientX, e.clientY, element);
  }, [id, locked, element, onSelect, onStartDrag]);

  const handleResizeDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (!locked) onStartResize(id, e.clientX, e.clientY, element, handle);
  }, [id, locked, element, onStartResize]);

  const renderContent = () => {
    const baseStyle: React.CSSProperties = {
      width: '100%', height: '100%',
      backgroundColor: styles.backgroundGradient ? undefined : styles.backgroundColor,
      background: styles.backgroundGradient || undefined,
      borderColor: styles.borderColor,
      borderWidth: styles.borderWidth ? `${styles.borderWidth}px` : undefined,
      borderStyle: styles.borderWidth ? (styles.borderStyle || 'solid') : undefined,
      borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : undefined,
      color: styles.color, fontSize: styles.fontSize ? `${styles.fontSize}px` : undefined,
      fontWeight: styles.fontWeight, fontFamily: styles.fontFamily, textAlign: styles.textAlign,
      padding: styles.padding ? `${styles.padding}px` : undefined,
      boxShadow: styles.boxShadow,
      letterSpacing: styles.letterSpacing ? `${styles.letterSpacing}px` : undefined,
      lineHeight: styles.lineHeight ? `${styles.lineHeight}` : undefined,
      backdropFilter: styles.backdropBlur ? `blur(${styles.backdropBlur}px)` : undefined,
      WebkitBackdropFilter: styles.backdropBlur ? `blur(${styles.backdropBlur}px)` : undefined,
      overflow: 'hidden', display: 'flex', alignItems: 'center',
      justifyContent: styles.textAlign === 'center' ? 'center' : styles.textAlign === 'right' ? 'flex-end' : 'flex-start',
    };

    switch (type) {
      case 'image':
        return <img src={content || 'https://via.placeholder.com/300'} alt="" style={{ ...baseStyle, objectFit: 'cover' }} draggable={false} />;

      case 'input':
        return <div style={baseStyle}><span style={{ opacity: 0.5 }}>{content}</span></div>;

      case 'textarea':
        return (
          <div style={{ ...baseStyle, alignItems: 'flex-start', whiteSpace: 'pre-wrap' }}>
            <span style={{ opacity: 0.5 }}>{content}</span>
          </div>
        );

      case 'navbar':
        return (
          <div style={{ ...baseStyle, justifyContent: 'space-between' }}>
            <span style={{ fontWeight: styles.fontWeight }}>{content}</span>
            <div style={{ display: 'flex', gap: '24px', fontSize: '14px', opacity: 0.7 }}>
              <span>Home</span><span>About</span><span>Contact</span>
            </div>
          </div>
        );

      case 'avatar':
        return <div style={{ ...baseStyle, justifyContent: 'center' }}>{content}</div>;

      case 'avatar-group':
        return (
          <div style={{ ...baseStyle, justifyContent: 'flex-start', gap: '-8px', padding: 0 }}>
            {(content || 'A B C').split(' ').map((letter, i) => (
              <div key={i} style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'][i % 4], border: '2px solid #0f172a',
                marginLeft: i > 0 ? -10 : 0, fontSize: 14, fontWeight: 600, color: '#fff', zIndex: 10 - i,
              }}>{letter}</div>
            ))}
          </div>
        );

      case 'progress-bar': {
        const pct = parseInt(content || '65', 10);
        return (
          <div style={{ ...baseStyle, padding: 0, position: 'relative' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : undefined, transition: 'width 0.3s' }} />
          </div>
        );
      }

      case 'toggle':
        return (
          <div style={{ ...baseStyle, padding: 3, justifyContent: 'flex-end' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
          </div>
        );

      case 'checkbox':
        return (
          <div style={{ ...baseStyle, gap: 8, padding: 0, backgroundColor: 'transparent' }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, border: '2px solid #6366f1', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>✓</div>
            <span>{content}</span>
          </div>
        );

      case 'dropdown':
        return (
          <div style={{ ...baseStyle, justifyContent: 'space-between' }}>
            <span>{content}</span>
            <span style={{ opacity: 0.5, fontSize: 10 }}>▼</span>
          </div>
        );

      case 'hero': {
        const lines = (content || '').split('\n');
        return (
          <div style={{ ...baseStyle, flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
            <span style={{ fontSize: styles.fontSize, fontWeight: styles.fontWeight }}>{lines[0]}</span>
            {lines[1] && <span style={{ fontSize: 18, fontWeight: '400', opacity: 0.7 }}>{lines[1]}</span>}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <div style={{ padding: '12px 28px', backgroundColor: '#6366f1', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>Get Started</div>
              <div style={{ padding: '12px 28px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>Learn More</div>
            </div>
          </div>
        );
      }

      case 'footer':
        return (
          <div style={{ ...baseStyle, flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 32, fontSize: 14, opacity: 0.6 }}>
              <span>About</span><span>Blog</span><span>Careers</span><span>Privacy</span><span>Terms</span>
            </div>
            <span style={{ opacity: 0.4 }}>{content}</span>
          </div>
        );

      case 'testimonial': {
        const lines = (content || '').split('\n');
        return (
          <div style={{ ...baseStyle, flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 28, color: '#6366f1', lineHeight: 1 }}>"</span>
            <span style={{ fontStyle: 'italic', lineHeight: 1.6 }}>{lines[0]?.replace(/"/g, '')}</span>
            {lines[1] && <span style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{lines[1]}</span>}
          </div>
        );
      }

      case 'pricing-card': {
        const lines = (content || '').split('\n');
        return (
          <div style={{ ...baseStyle, flexDirection: 'column', gap: 12, justifyContent: 'flex-start', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 600, opacity: 0.7 }}>{lines[0]}</span>
            <span style={{ fontSize: 36, fontWeight: 800 }}>{lines[1]}</span>
            <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
            {lines.slice(2).map((l, i) => <span key={i} style={{ fontSize: 13, opacity: 0.8 }}>{l}</span>)}
            <div style={{ marginTop: 'auto', padding: '10px 24px', backgroundColor: '#6366f1', borderRadius: 8, fontSize: 14, fontWeight: 600, width: '100%', textAlign: 'center' }}>Choose Plan</div>
          </div>
        );
      }

      case 'feature-card': {
        const lines = (content || '').split('\n');
        return (
          <div style={{ ...baseStyle, flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
            <span style={{ fontSize: 32 }}>{lines[0]}</span>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{lines[1]}</span>
            {lines[2] && <span style={{ fontSize: 14, opacity: 0.6 }}>{lines[2]}</span>}
          </div>
        );
      }

      case 'cta-banner':
        return <div style={{ ...baseStyle, justifyContent: 'center' }}><span>{content}</span></div>;

      case 'stats': {
        const lines = (content || '').split('\n');
        return (
          <div style={{ ...baseStyle, flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
            <span style={{ fontSize: styles.fontSize, fontWeight: styles.fontWeight }}>{lines[0]}</span>
            {lines[1] && <span style={{ fontSize: 13, opacity: 0.5, fontWeight: 400 }}>{lines[1]}</span>}
          </div>
        );
      }

      case 'tabs': {
        const items = (content || '').split('|');
        return (
          <div style={{ ...baseStyle, gap: 4, padding: styles.padding }}>
            {items.map((item, i) => (
              <div key={i} style={{
                flex: 1, padding: '8px 16px', borderRadius: 6, textAlign: 'center', fontSize: styles.fontSize, fontWeight: styles.fontWeight,
                backgroundColor: i === 0 ? '#6366f1' : 'transparent', color: i === 0 ? '#fff' : styles.color,
              }}>{item.trim()}</div>
            ))}
          </div>
        );
      }

      case 'sidebar': {
        const items = (content || '').split('\n');
        return (
          <div style={{ ...baseStyle, flexDirection: 'column', gap: 4, alignItems: 'stretch', justifyContent: 'flex-start' }}>
            {items.map((item, i) => (
              <div key={i} style={{
                padding: '10px 12px', borderRadius: 8, fontSize: styles.fontSize,
                backgroundColor: i === 0 ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: i === 0 ? '#6366f1' : styles.color, fontWeight: i === 0 ? 600 : 400,
              }}>{item.trim()}</div>
            ))}
          </div>
        );
      }

      case 'logo-cloud':
        return (
          <div style={{ ...baseStyle, justifyContent: 'center', gap: 32 }}>
            {(content || '').split(/\s{2,}/).map((name, i) => (
              <span key={i} style={{ fontSize: styles.fontSize, opacity: 0.5, fontWeight: styles.fontWeight }}>{name}</span>
            ))}
          </div>
        );

      case 'table': {
        const rows = (content || '').split('\n').map(r => r.split('|'));
        return (
          <div style={{ ...baseStyle, flexDirection: 'column', padding: 0, alignItems: 'stretch', justifyContent: 'flex-start' }}>
            {rows.map((row, ri) => (
              <div key={ri} style={{
                display: 'flex', borderBottom: ri < rows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : undefined,
                backgroundColor: ri === 0 ? 'rgba(255,255,255,0.04)' : undefined,
              }}>
                {row.map((cell, ci) => (
                  <div key={ci} style={{
                    flex: 1, padding: '10px 14px', fontSize: styles.fontSize,
                    fontWeight: ri === 0 ? 600 : 400, opacity: ri === 0 ? 0.8 : 0.6,
                  }}>{cell.trim()}</div>
                ))}
              </div>
            ))}
          </div>
        );
      }

      case 'map':
        return (
          <div style={{ ...baseStyle, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }} />
            <div style={{ position: 'relative', opacity: 0.3, fontSize: 40 }}>🗺</div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: 12, height: 12, backgroundColor: '#ef4444', borderRadius: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 0 12px rgba(239,68,68,0.5)' }} />
          </div>
        );

      case 'glass-card':
        return <div style={baseStyle}>{content && <span>{content}</span>}</div>;

      case 'gradient-box':
        return <div style={baseStyle}>{content && <span>{content}</span>}</div>;

      case 'video':
        return (
          <div style={{ ...baseStyle, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <img src={content || ''} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : undefined }} draggable={false} />
            <div style={{ position: 'relative', width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 0, height: 0, borderLeft: '18px solid #fff', borderTop: '11px solid transparent', borderBottom: '11px solid transparent', marginLeft: 4 }} />
            </div>
          </div>
        );

      case 'code-block':
        return (
          <div style={{ ...baseStyle, alignItems: 'flex-start', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#febc2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#28c840' }} />
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: styles.fontSize, fontFamily: styles.fontFamily, lineHeight: 1.6, width: '100%' }}>{content}</pre>
          </div>
        );

      case 'skeleton':
        return (
          <div style={{ ...baseStyle, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
              animation: 'none',
            }} />
          </div>
        );

      case 'breadcrumb':
        return <div style={{ ...baseStyle, backgroundColor: 'transparent' }}><span>{content}</span></div>;

      case 'social-icons':
        return (
          <div style={{ ...baseStyle, justifyContent: 'center', gap: 20 }}>
            {(content || '').split(/\s+/).map((icon, i) => (
              <span key={i} style={{ fontSize: styles.fontSize, cursor: 'pointer', opacity: 0.7 }}>{icon}</span>
            ))}
          </div>
        );

      case 'tooltip-demo':
        return (
          <div style={{ ...baseStyle, position: 'relative', justifyContent: 'center' }}>
            <span>{content}</span>
            <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `6px solid ${styles.backgroundColor || '#1e293b'}` }} />
          </div>
        );

      default:
        return <div style={baseStyle}>{content && <span>{content}</span>}</div>;
    }
  };

  return (
    <div
      className="absolute group"
      style={{ left: x, top: y, width, height, opacity, transform: `rotate(${element.rotation}deg)`, zIndex: isSelected ? 9999 : undefined }}
      onMouseDown={handleMouseDown}
    >
      {renderContent()}
      {isSelected && (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{ border: '2px solid hsl(239 84% 67%)', borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : undefined }} />
          {!locked && RESIZE_HANDLES.map(handle => {
            const pos: React.CSSProperties = {};
            if (handle.includes('n')) pos.top = -4;
            if (handle.includes('s')) pos.bottom = -4;
            if (handle.includes('w')) pos.left = -4;
            if (handle.includes('e')) pos.right = -4;
            if (handle === 'n' || handle === 's') { pos.left = '50%'; pos.marginLeft = -4; }
            if (handle === 'e' || handle === 'w') { pos.top = '50%'; pos.marginTop = -4; }
            return (
              <div key={handle} className="absolute w-2 h-2 bg-primary border border-primary-foreground rounded-sm" style={{ ...pos, cursor: handleCursors[handle] }} onMouseDown={(e) => handleResizeDown(e, handle)} />
            );
          })}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
            {Math.round(width)} × {Math.round(height)}
          </div>
        </>
      )}
    </div>
  );
};

export default CanvasElement;
