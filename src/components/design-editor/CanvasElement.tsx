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
    if (!locked) {
      onStartDrag(id, e.clientX, e.clientY, element);
    }
  }, [id, locked, element, onSelect, onStartDrag]);

  const handleResizeDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (!locked) {
      onStartResize(id, e.clientX, e.clientY, element, handle);
    }
  }, [id, locked, element, onStartResize]);

  const renderContent = () => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      backgroundColor: styles.backgroundGradient ? undefined : styles.backgroundColor,
      background: styles.backgroundGradient || undefined,
      borderColor: styles.borderColor,
      borderWidth: styles.borderWidth ? `${styles.borderWidth}px` : undefined,
      borderStyle: styles.borderWidth ? (styles.borderStyle || 'solid') : undefined,
      borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : undefined,
      color: styles.color,
      fontSize: styles.fontSize ? `${styles.fontSize}px` : undefined,
      fontWeight: styles.fontWeight,
      fontFamily: styles.fontFamily,
      textAlign: styles.textAlign,
      padding: styles.padding ? `${styles.padding}px` : undefined,
      boxShadow: styles.boxShadow,
      letterSpacing: styles.letterSpacing ? `${styles.letterSpacing}px` : undefined,
      lineHeight: styles.lineHeight ? `${styles.lineHeight}` : undefined,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: styles.textAlign === 'center' ? 'center' : styles.textAlign === 'right' ? 'flex-end' : 'flex-start',
    };

    switch (type) {
      case 'image':
        return (
          <img
            src={content || 'https://via.placeholder.com/300'}
            alt="Design element"
            style={{ ...baseStyle, objectFit: 'cover' }}
            draggable={false}
          />
        );
      case 'input':
        return (
          <div style={baseStyle}>
            <span style={{ opacity: 0.5 }}>{content}</span>
          </div>
        );
      case 'navbar':
        return (
          <div style={{ ...baseStyle, justifyContent: 'space-between' }}>
            <span style={{ fontWeight: styles.fontWeight }}>{content}</span>
            <div style={{ display: 'flex', gap: '24px', fontSize: '14px', opacity: 0.7 }}>
              <span>Home</span>
              <span>About</span>
              <span>Contact</span>
            </div>
          </div>
        );
      case 'avatar':
        return (
          <div style={{ ...baseStyle, justifyContent: 'center' }}>
            {content}
          </div>
        );
      default:
        return (
          <div style={baseStyle}>
            {content && <span>{content}</span>}
          </div>
        );
    }
  };

  return (
    <div
      className="absolute group"
      style={{
        left: x,
        top: y,
        width,
        height,
        opacity,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: isSelected ? 9999 : undefined,
      }}
      onMouseDown={handleMouseDown}
    >
      {renderContent()}

      {/* Selection outline */}
      {isSelected && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              border: '2px solid hsl(239 84% 67%)',
              borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : undefined,
            }}
          />

          {/* Resize handles */}
          {!locked && RESIZE_HANDLES.map(handle => {
            const pos: React.CSSProperties = {};
            if (handle.includes('n')) pos.top = -4;
            if (handle.includes('s')) pos.bottom = -4;
            if (handle.includes('w')) pos.left = -4;
            if (handle.includes('e')) pos.right = -4;
            if (handle === 'n' || handle === 's') { pos.left = '50%'; pos.marginLeft = -4; }
            if (handle === 'e' || handle === 'w') { pos.top = '50%'; pos.marginTop = -4; }

            return (
              <div
                key={handle}
                className="absolute w-2 h-2 bg-primary border border-primary-foreground rounded-sm"
                style={{ ...pos, cursor: handleCursors[handle] }}
                onMouseDown={(e) => handleResizeDown(e, handle)}
              />
            );
          })}

          {/* Dimension label */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
            {Math.round(width)} × {Math.round(height)}
          </div>
        </>
      )}
    </div>
  );
};

export default CanvasElement;
