"use client";
import { useEffect, useRef, useCallback } from "react";
import createGlobe from "cobe";

export type GlobeConfig = {
  autoRotateSpeed?: number;
  [key: string]: any;
};

interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
}

interface WorldProps {
  globeConfig: GlobeConfig;
  data: ArcData[];
}

// Convert lat/lng to 2D canvas position for a given globe phi/theta
function latLngTo2D(
  lat: number,
  lng: number,
  phi: number,
  size: number
): { x: number; y: number; visible: boolean } {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  // Globe rotation
  const cosLat = Math.cos(latRad);
  const sinLat = Math.sin(latRad);
  const cosLng = Math.cos(lngRad + phi);
  const sinLng = Math.sin(lngRad + phi);

  const x = cosLat * sinLng;
  const y = -sinLat;
  const z = cosLat * cosLng;

  const r = size / 2;
  return {
    x: size / 2 + x * r * 0.95,
    y: size / 2 + y * r * 0.95,
    visible: z > -0.2,
  };
}

// Draw a curved arc between two 2D points
function drawArc(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  progress: number
) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Control point perpendicular to the line, offset by distance
  const cpX = midX - dy * 0.4;
  const cpY = midY + dx * 0.4;

  ctx.beginPath();
  ctx.moveTo(x1, y1);

  // Draw partial arc based on progress
  const steps = 30;
  const drawSteps = Math.floor(steps * Math.min(progress, 1));
  for (let i = 1; i <= drawSteps; i++) {
    const t = i / steps;
    const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpX + t * t * x2;
    const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cpY + t * t * y2;
    ctx.lineTo(px, py);
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6 * Math.min(progress, 1);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Draw glowing endpoint dots
  if (progress >= 1) {
    [
      [x1, y1],
      [x2, y2],
    ].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }
}

export function World({ globeConfig, data }: WorldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arcCanvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  const drawArcs = useCallback(() => {
    const canvas = arcCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    const elapsed = (Date.now() - startTimeRef.current) / 1000;

    data.forEach((arc, i) => {
      const start = latLngTo2D(arc.startLat, arc.startLng, phiRef.current, size);
      const end = latLngTo2D(arc.endLat, arc.endLng, phiRef.current, size);

      if (!start.visible && !end.visible) return;

      // Stagger arc animations
      const arcDelay = i * 0.3;
      const arcDuration = 2;
      const cycleTime = data.length * 0.3 + arcDuration + 1;
      const cycleElapsed = (elapsed - arcDelay) % cycleTime;
      const progress = Math.max(0, cycleElapsed / arcDuration);

      if (progress > 0) {
        const alpha = start.visible && end.visible ? 1 : 0.3;
        ctx.globalAlpha = alpha;
        drawArc(ctx, start.x, start.y, end.x, end.y, arc.color, progress);
        ctx.globalAlpha = 1;
      }
    });

    requestAnimationFrame(drawArcs);
  }, [data]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0.15,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 20000,
      mapBrightness: 6,
      baseColor: [0.15, 0.2, 0.4],
      markerColor: [0.1, 0.8, 1],
      glowColor: [0.08, 0.15, 0.4],
      markers: [
        { location: [28.6139, 77.209], size: 0.08 },
        { location: [37.7595, -122.4367], size: 0.06 },
        { location: [40.7128, -74.006], size: 0.07 },
        { location: [51.5072, -0.1276], size: 0.06 },
        { location: [35.6762, 139.6503], size: 0.06 },
        { location: [-33.8688, 151.2093], size: 0.05 },
        { location: [1.3521, 103.8198], size: 0.05 },
        { location: [52.52, 13.405], size: 0.05 },
        { location: [48.8566, 2.3522], size: 0.04 },
        { location: [34.0522, -118.2437], size: 0.05 },
        { location: [22.3193, 114.1694], size: 0.05 },
        { location: [-22.9068, -43.1729], size: 0.04 },
        { location: [37.5665, 126.978], size: 0.05 },
        { location: [55.7558, 37.6173], size: 0.04 },
        { location: [19.076, 72.8777], size: 0.06 },
        { location: [13.0827, 80.2707], size: 0.05 },
        { location: [12.9716, 77.5946], size: 0.06 },
      ],
      onRender: (state) => {
        state.phi = phiRef.current;
        phiRef.current += (globeConfig.autoRotateSpeed || 0.5) * 0.005;
      },
    });

    // Start arc animation
    startTimeRef.current = Date.now();
    const arcFrame = requestAnimationFrame(drawArcs);

    return () => {
      globe.destroy();
      cancelAnimationFrame(arcFrame);
    };
  }, [globeConfig.autoRotateSpeed, drawArcs]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: 600,
          aspectRatio: "1",
        }}
      />
      <canvas
        ref={arcCanvasRef}
        width={1200}
        height={1200}
        className="absolute inset-0 pointer-events-none"
        style={{
          width: "100%",
          height: "100%",
          maxWidth: 600,
          aspectRatio: "1",
          margin: "auto",
        }}
      />
    </div>
  );
}

export default World;
