import { useEffect, useRef, useState, CSSProperties } from "react";

/**
 * useParallax – returns a ref and an inline style object.
 * Attach the ref to a wrapper div; the style applies a translateY
 * offset proportional to how far the element is from viewport centre.
 *
 * @param speed  Multiplier (0 = no movement, 0.1 = subtle, 0.3 = strong).
 *               Negative values reverse direction.
 */
export function useParallax(speed = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      // How far the element centre is from the viewport centre (−1 … +1 range roughly)
      const elementCentre = rect.top + rect.height / 2;
      const delta = (elementCentre - windowH / 2) * speed;
      setOffset(delta);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Run once on mount
    update();

    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  const style: CSSProperties = {
    transform: `translateY(${offset}px)`,
    willChange: "transform",
    transition: "transform 0.1s linear",
  };

  return { ref, style };
}

/**
 * ParallaxLayer – a simple wrapper component for declarative usage.
 */
interface ParallaxLayerProps {
  speed?: number;
  className?: string;
  children: React.ReactNode;
}

export function ParallaxLayer({ speed = 0.08, className = "", children }: ParallaxLayerProps) {
  const { ref, style } = useParallax(speed);
  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
