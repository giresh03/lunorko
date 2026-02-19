import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Float, Text, RoundedBox, Html } from "@react-three/drei";
import * as THREE from "three";
import { Link, useNavigate } from "react-router-dom";
import { domains } from "@/lib/domains";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/* ───── Domain color helper ───── */
function hslToHex(hslStr: string): string {
  const parts = hslStr.split(/\s+/).map(Number);
  const h = parts[0] / 360;
  const s = parts[1] / 100;
  const l = parts[2] / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return `#${[r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, "0")).join("")}`;
}

/* ───── Single 3D Card ───── */
interface DomainCard3DProps {
  position: [number, number, number];
  domain: typeof domains[0];
  index: number;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  hovered: boolean;
}

function DomainCard3D({ position, domain, index, onHover, onClick, hovered }: DomainCard3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const color = useMemo(() => new THREE.Color(hslToHex(domain.color)), [domain.color]);
  const targetScale = useRef(new THREE.Vector3(1, 1, 1));

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.scale.lerp(targetScale.current, delta * 6);

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      const target = hovered ? 0.4 : 0.1;
      mat.opacity += (target - mat.opacity) * delta * 5;
    }
  });

  targetScale.current.set(hovered ? 1.08 : 1, hovered ? 1.08 : 1, hovered ? 1.08 : 1);

  return (
    <Float
      speed={1.5 + index * 0.12}
      rotationIntensity={0.12}
      floatIntensity={0.3 + (index % 3) * 0.08}
      floatingRange={[-0.06, 0.06]}
    >
      <group
        ref={meshRef}
        position={position}
        onPointerEnter={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(domain.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          onHover(null);
          document.body.style.cursor = "auto";
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick(domain.id);
        }}
      >
        {/* Card body */}
        <RoundedBox args={[2.6, 1.5, 0.1]} radius={0.08} smoothness={4}>
          <meshStandardMaterial
            color="#141425"
            metalness={0.2}
            roughness={0.7}
            transparent
            opacity={0.95}
          />
        </RoundedBox>

        {/* Colored accent strip at top */}
        <mesh position={[0, 0.65, 0.06]}>
          <planeGeometry args={[2.4, 0.06]} />
          <meshBasicMaterial color={color} />
        </mesh>

        {/* Domain icon circle */}
        <mesh position={[-0.75, 0.2, 0.06]}>
          <circleGeometry args={[0.2, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} />
        </mesh>

        {/* Domain name */}
        <Text
          position={[-0.2, 0.2, 0.06]}
          fontSize={0.16}
          color="white"
          anchorX="left"
          anchorY="middle"
          maxWidth={1.6}
          font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2"
        >
          {domain.name}
        </Text>

        {/* Topic count + arrow hint */}
        <Text
          position={[1.1, 0.2, 0.06]}
          fontSize={0.09}
          color={hovered ? "#ffffff" : "#8b949e"}
          anchorX="right"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2"
        >
          {hovered ? "Open →" : `${domain.topics.length} topics`}
        </Text>

        {/* Description */}
        <Text
          position={[-1.1, -0.05, 0.06]}
          fontSize={0.085}
          color="#a0a0b8"
          anchorX="left"
          anchorY="top"
          maxWidth={2.1}
          lineHeight={1.4}
          font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2"
        >
          {domain.description.length > 65 ? domain.description.slice(0, 62) + "..." : domain.description}
        </Text>

        {/* Topic pills */}
        {domain.topics.slice(0, 3).map((topic, i) => (
          <group key={topic} position={[-0.95 + i * 0.8, -0.48, 0.06]}>
            <RoundedBox args={[0.7, 0.2, 0.02]} radius={0.04} smoothness={2}>
              <meshBasicMaterial color={color} transparent opacity={0.15} />
            </RoundedBox>
            <Text
              position={[0, 0, 0.02]}
              fontSize={0.07}
              color={hslToHex(domain.color)}
              anchorX="center"
              anchorY="middle"
              font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2"
            >
              {topic.length > 10 ? topic.slice(0, 9) + ".." : topic}
            </Text>
          </group>
        ))}

        {/* Glow behind card */}
        <mesh ref={glowRef} position={[0, 0, -0.15]}>
          <planeGeometry args={[3.2, 2]} />
          <meshBasicMaterial color={color} transparent opacity={0.1} />
        </mesh>
      </group>
    </Float>
  );
}

/* ───── Particles ───── */
function Particles() {
  const count = 150;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 3;
    }
    return arr;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.015; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#6366f1" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

/* ───── Camera rig with mouse parallax ───── */
function CameraRig() {
  const { camera, gl } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    gl.domElement.addEventListener("pointermove", handler);
    return () => gl.domElement.removeEventListener("pointermove", handler);
  }, [gl.domElement]);

  useFrame((_, delta) => {
    camera.position.x += (mouse.current.x * 0.4 - camera.position.x) * delta * 2;
    camera.position.y += (-mouse.current.y * 0.3 + 0.3 - camera.position.y) * delta * 2;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ───── Grid layout for all 12 domains ───── */
function getGridPositions(count: number): [number, number, number][] {
  const cols = 4;
  const spacingX = 3.0;
  const spacingY = 1.9;
  const positions: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const totalRows = Math.ceil(count / cols);
    const x = (col - (cols - 1) / 2) * spacingX;
    const y = -(row - (totalRows - 1) / 2) * spacingY;
    const z = Math.sin(i * 0.8) * 0.25;
    positions.push([x, y, z]);
  }
  return positions;
}

/* ───── Scene ───── */
function Scene({ onCardClick }: { onCardClick: (id: string) => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const positions = useMemo(() => getGridPositions(domains.length), []);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <pointLight position={[-4, 3, 4]} intensity={0.5} color="#6366f1" />
      <pointLight position={[4, -2, 3]} intensity={0.4} color="#06b6d4" />

      <Particles />
      <CameraRig />

      {domains.map((domain, i) => (
        <DomainCard3D
          key={domain.id}
          domain={domain}
          index={i}
          position={positions[i]}
          onHover={setHoveredId}
          onClick={onCardClick}
          hovered={hoveredId === domain.id}
        />
      ))}
    </>
  );
}

/* ───── Main exported component ───── */
const Domains3DSection = () => {
  const navigate = useNavigate();

  const handleCardClick = (domainId: string) => {
    navigate(`/domains/${domainId}`);
  };

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-primary">
            12+ Domains
          </span>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mt-4">
            Explore Every{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-[hsl(var(--chart-2))]">
              Engineering Domain
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Click any domain to dive into curated resources, AI coding assistance, and guided roadmaps.
          </p>
        </div>
      </div>

      {/* 3D Canvas – taller to fit all 12 cards */}
      <div className="relative w-full h-[700px] md:h-[650px] scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out rounded-xl mx-auto max-w-7xl overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a1a] rounded-xl" />
        <Canvas
          camera={{ position: [0, 0.3, 10], fov: 55 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
          style={{ borderRadius: "0.75rem" }}
        >
          <color attach="background" args={["#0a0a1a"]} />
          <fog attach="fog" args={["#0a0a1a", 14, 22]} />
          <Scene onCardClick={handleCardClick} />
        </Canvas>

        {/* Edge fade overlays */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0a0a1a] to-transparent pointer-events-none rounded-t-xl" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a1a] to-transparent pointer-events-none rounded-b-xl" />
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 mt-8 text-center scroll-reveal opacity-0 translate-y-6 transition-all duration-700 ease-out">
        <Button size="lg" className="hover-scale" asChild>
          <Link to="/domains">
            View All Domains <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Domains3DSection;
