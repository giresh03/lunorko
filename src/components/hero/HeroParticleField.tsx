import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 800;

function Particles() {
  const mesh = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0 });

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      vel[i * 3] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return [pos, vel];
  }, []);

  const sizes = useMemo(() => {
    const s = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      s[i] = Math.random() * 2.5 + 0.5;
    }
    return s;
  }, []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const geo = mesh.current.geometry;
    const posAttr = geo.getAttribute("position");
    const t = clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      posAttr.array[ix] += velocities[ix] + Math.sin(t * 0.3 + i) * 0.001;
      posAttr.array[ix + 1] += velocities[ix + 1] + Math.cos(t * 0.2 + i) * 0.001;
      posAttr.array[ix + 2] += velocities[ix + 2];

      // Wrap around bounds
      for (let j = 0; j < 3; j++) {
        const bound = j === 2 ? 6 : 10;
        if (posAttr.array[ix + j] > bound) posAttr.array[ix + j] = -bound;
        if (posAttr.array[ix + j] < -bound) posAttr.array[ix + j] = bound;
      }
    }
    posAttr.needsUpdate = true;
    mesh.current.rotation.y = t * 0.02;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={PARTICLE_COUNT}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#6366f1"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function GlowOrb({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.x = position[0] + Math.sin(t * 0.3) * 0.5;
    ref.current.position.y = position[1] + Math.cos(t * 0.25) * 0.4;
    ref.current.scale.setScalar(scale + Math.sin(t * 0.5) * 0.1);
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} />
    </mesh>
  );
}

export default function HeroParticleField() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <Particles />
        <GlowOrb position={[-4, 2, -3]} color="#6366f1" scale={2.5} />
        <GlowOrb position={[3, -1, -4]} color="#06b6d4" scale={2} />
        <GlowOrb position={[0, 3, -5]} color="#8b5cf6" scale={1.8} />
        <GlowOrb position={[-2, -3, -3]} color="#14b8a6" scale={1.5} />
      </Canvas>
    </div>
  );
}
