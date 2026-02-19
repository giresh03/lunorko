import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { domains } from "@/lib/domains";

const PARTICLE_COUNT = 1200;
const CONNECTION_DISTANCE = 2.5;
const DOMAIN_CARD_COUNT = 8;

/* ───────── Mouse tracker (shared across scene) ───────── */
const mouseState = { x: 0, y: 0, targetX: 0, targetY: 0 };

function MouseTracker() {
  const { size } = useThree();
  
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseState.targetX = (e.clientX / size.width - 0.5) * 2;
      mouseState.targetY = -(e.clientY / size.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [size]);

  useFrame(() => {
    mouseState.x += (mouseState.targetX - mouseState.x) * 0.05;
    mouseState.y += (mouseState.targetY - mouseState.y) * 0.05;
  });

  return null;
}

/* ───────── Particle field with connection lines ───────── */
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4 + Math.random() * 8;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      vel[i * 3] = (Math.random() - 0.5) * 0.004;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.004;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return [pos, vel];
  }, []);

  const linePositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 6), []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.getAttribute("position");
    const t = clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      posAttr.array[ix] += velocities[ix] + Math.sin(t * 0.2 + i * 0.1) * 0.002;
      posAttr.array[ix + 1] += velocities[ix + 1] + Math.cos(t * 0.15 + i * 0.1) * 0.002;
      posAttr.array[ix + 2] += velocities[ix + 2];

      // Parallax shift from mouse
      const parallaxFactor = 0.3;
      const baseX = posAttr.array[ix];
      const baseY = posAttr.array[ix + 1];
      posAttr.array[ix] += mouseState.x * parallaxFactor * 0.01;
      posAttr.array[ix + 1] += mouseState.y * parallaxFactor * 0.01;

      for (let j = 0; j < 3; j++) {
        const bound = j === 2 ? 5 : 12;
        if (Math.abs(posAttr.array[ix + j]) > bound) {
          velocities[ix + j] *= -1;
        }
      }
    }
    posAttr.needsUpdate = true;

    // Build connection lines (sample subset for perf)
    if (linesRef.current) {
      const lineGeo = linesRef.current.geometry;
      const linePosAttr = lineGeo.getAttribute("position");
      let lineIdx = 0;
      const maxLines = PARTICLE_COUNT;

      for (let i = 0; i < Math.min(200, PARTICLE_COUNT); i++) {
        for (let j = i + 1; j < Math.min(200, PARTICLE_COUNT); j++) {
          if (lineIdx >= maxLines * 2) break;
          const dx = posAttr.array[i * 3] - posAttr.array[j * 3];
          const dy = posAttr.array[i * 3 + 1] - posAttr.array[j * 3 + 1];
          const dz = posAttr.array[i * 3 + 2] - posAttr.array[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < CONNECTION_DISTANCE) {
            const li = lineIdx * 3;
            linePosAttr.array[li] = posAttr.array[i * 3];
            linePosAttr.array[li + 1] = posAttr.array[i * 3 + 1];
            linePosAttr.array[li + 2] = posAttr.array[i * 3 + 2];
            linePosAttr.array[li + 3] = posAttr.array[j * 3];
            linePosAttr.array[li + 4] = posAttr.array[j * 3 + 1];
            linePosAttr.array[li + 5] = posAttr.array[j * 3 + 2];
            lineIdx += 2;
          }
        }
        if (lineIdx >= maxLines * 2) break;
      }
      // Zero out remaining
      for (let k = lineIdx * 3; k < linePosAttr.array.length; k++) {
        linePosAttr.array[k] = 0;
      }
      linePosAttr.needsUpdate = true;
    }

    pointsRef.current.rotation.y = t * 0.015;
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color="#818cf8"
          transparent
          opacity={0.7}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT * 2} array={linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#6366f1" transparent opacity={0.08} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </>
  );
}

/* ───────── Glow Orbs ───────── */
function GlowOrb({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.x = position[0] + Math.sin(t * 0.2 + position[1]) * 1;
    ref.current.position.y = position[1] + Math.cos(t * 0.18 + position[0]) * 0.8;
    ref.current.scale.setScalar(scale + Math.sin(t * 0.4) * 0.15);
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.06} />
    </mesh>
  );
}

/* ───────── Orbiting Domain Card (3D plane) ───────── */
function OrbitingDomainCard({
  name,
  icon,
  index,
  total,
  orbitRadius,
}: {
  name: string;
  icon: string;
  index: number;
  total: number;
  orbitRadius: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const angleOffset = (index / total) * Math.PI * 2;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const speed = 0.08;
    const angle = angleOffset + t * speed;

    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius * 0.4; // elliptical
    const y = Math.sin(angle * 0.5 + index) * 0.5;

    groupRef.current.position.set(x, y, z);
    // Face camera slightly
    groupRef.current.rotation.y = -angle + Math.PI * 0.5;

    // Scale based on z-depth (closer = bigger)
    const depthScale = THREE.MathUtils.mapLinear(z, -orbitRadius * 0.4, orbitRadius * 0.4, 0.6, 1.1);
    groupRef.current.scale.setScalar(depthScale);

    // Parallax from mouse
    groupRef.current.position.x += mouseState.x * 0.15;
    groupRef.current.position.y += mouseState.y * 0.1;
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh ref={meshRef}>
          <planeGeometry args={[1.6, 0.7]} />
          <meshBasicMaterial
            color="#1e1b4b"
            transparent
            opacity={0.65}
          />
        </mesh>
        {/* Glow border */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.68, 0.78]} />
          <meshBasicMaterial
            color="#6366f1"
            transparent
            opacity={0.15}
          />
        </mesh>
        {/* Domain icon character */}
        <Text
          position={[-0.5, 0, 0.01]}
          fontSize={0.22}
          color="#a5b4fc"
          anchorX="left"
          font={undefined}
        >
          {icon}
        </Text>
        {/* Domain name */}
        <Text
          position={[-0.2, 0, 0.01]}
          fontSize={0.12}
          color="#e0e7ff"
          anchorX="left"
          maxWidth={1.2}
          font={undefined}
        >
          {name}
        </Text>
      </Float>
    </group>
  );
}

/* ───────── Orbit Ring (visual guide) ───────── */
function OrbitRing({ radius }: { radius: number }) {
  const ref = useRef<THREE.LineLoop>(null);

  useFrame(() => {
    // subtle rotation
  });

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius * 0.4
      ));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  return (
    <lineLoop ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#6366f1" transparent opacity={0.06} />
    </lineLoop>
  );
}

/* ───────── Domain icon map ───────── */
const domainIcons: Record<string, string> = {
  "web-development": "🌐",
  "app-development": "📱",
  "cybersecurity": "🛡️",
  "data-science": "🧠",
  "cloud-computing": "☁️",
  "devops": "⚙️",
  "database": "🗄️",
  "iot": "📡",
  "blockchain": "🔗",
  "ui-ux": "🎨",
  "dsa": "📊",
  "system-design": "🏗️",
};

/* ───────── Main export ───────── */
export default function HeroParticleField() {
  const selectedDomains = useMemo(() => domains.slice(0, DOMAIN_CARD_COUNT), []);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0.5, 10], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <MouseTracker />
        <ambientLight intensity={0.4} />

        {/* Particles + connection lines */}
        <ParticleField />

        {/* Glow orbs for ambient depth */}
        <GlowOrb position={[-5, 3, -6]} color="#6366f1" scale={3} />
        <GlowOrb position={[4, -2, -5]} color="#06b6d4" scale={2.5} />
        <GlowOrb position={[0, 4, -8]} color="#8b5cf6" scale={2.8} />
        <GlowOrb position={[-3, -4, -4]} color="#14b8a6" scale={2} />
        <GlowOrb position={[6, 1, -7]} color="#a855f7" scale={2.2} />

        {/* Orbit ring */}
        <OrbitRing radius={7} />

        {/* Orbiting domain cards */}
        {selectedDomains.map((d, i) => (
          <OrbitingDomainCard
            key={d.id}
            name={d.name}
            icon={domainIcons[d.id] || "💡"}
            index={i}
            total={DOMAIN_CARD_COUNT}
            orbitRadius={7}
          />
        ))}
      </Canvas>
    </div>
  );
}
