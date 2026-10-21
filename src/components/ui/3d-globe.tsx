"use client";
import React, { useRef, useMemo, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface GlobeMarker {
  lat: number;
  lng: number;
  src: string;
  label?: string;
  size?: number;
}

export interface Globe3DConfig {
  radius?: number;
  globeColor?: string;
  textureUrl?: string;
  bumpMapUrl?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereIntensity?: number;
  atmosphereBlur?: number;
  bumpScale?: number;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  minDistance?: number;
  maxDistance?: number;
  initialRotation?: { x: number; y: number };
  markerSize?: number;
  showWireframe?: boolean;
  wireframeColor?: string;
  ambientIntensity?: number;
  pointLightIntensity?: number;
  backgroundColor?: string | null;
}

interface Globe3DProps {
  markers?: GlobeMarker[];
  config?: Globe3DConfig;
  className?: string;
  onMarkerClick?: (marker: GlobeMarker) => void;
  onMarkerHover?: (marker: GlobeMarker | null) => void;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_EARTH_TEXTURE =
  "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg";
const DEFAULT_BUMP_TEXTURE =
  "https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png";

// ============================================================================
// Utility Functions
// ============================================================================

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// ============================================================================
// Marker Component
// ============================================================================

interface MarkerProps {
  marker: GlobeMarker;
  radius: number;
  defaultSize: number;
  onClick?: (marker: GlobeMarker) => void;
  onHover?: (marker: GlobeMarker | null) => void;
}

function Marker({ marker, radius, defaultSize, onClick, onHover }: MarkerProps) {
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const imageGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const surfacePosition = useMemo(() => latLngToVector3(marker.lat, marker.lng, radius * 1.001), [marker.lat, marker.lng, radius]);
  const topPosition = useMemo(() => latLngToVector3(marker.lat, marker.lng, radius * 1.18), [marker.lat, marker.lng, radius]);
  const lineHeight = topPosition.distanceTo(surfacePosition);

  useFrame(() => {
    if (!imageGroupRef.current) return;
    const worldPos = new THREE.Vector3();
    imageGroupRef.current.getWorldPosition(worldPos);
    const markerDirection = worldPos.clone().normalize();
    const cameraDirection = camera.position.clone().normalize();
    const dot = markerDirection.dot(cameraDirection);
    setIsVisible(dot > 0.1);
  });

  const handlePointerEnter = useCallback(() => { setHovered(true); onHover?.(marker); }, [marker, onHover]);
  const handlePointerLeave = useCallback(() => { setHovered(false); onHover?.(null); }, [onHover]);
  const handleClick = useCallback(() => { onClick?.(marker); }, [marker, onClick]);

  const { lineCenter, lineQuaternion } = useMemo(() => {
    const center = surfacePosition.clone().lerp(topPosition, 0.5);
    const direction = topPosition.clone().sub(surfacePosition).normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    return { lineCenter: center, lineQuaternion: quaternion };
  }, [surfacePosition, topPosition]);

  const size = marker.size || defaultSize;

  return (
    <group visible={isVisible}>
      {/* Pin line */}
      <mesh position={lineCenter} quaternion={lineQuaternion}>
        <cylinderGeometry args={[0.003, 0.003, lineHeight, 4]} />
        <meshBasicMaterial color={hovered ? "#60a5fa" : "#ffffff"} transparent opacity={hovered ? 0.9 : 0.4} />
      </mesh>

      {/* Pin dot at surface */}
      <mesh position={surfacePosition}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color={hovered ? "#60a5fa" : "#ffffff"} transparent opacity={0.8} />
      </mesh>

      {/* Circular image at top */}
      <group ref={imageGroupRef} position={topPosition}>
        <Html
          center
          distanceFactor={8}
          style={{ pointerEvents: isVisible ? "auto" : "none" }}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onClick={handleClick}
        >
          <div
            className={cn(
              "rounded-full overflow-hidden border-2 transition-all duration-300 cursor-pointer",
              hovered ? "border-primary scale-125 shadow-lg shadow-primary/30" : "border-white/30 scale-100"
            )}
            style={{ width: `${size * 600}px`, height: `${size * 600}px` }}
          >
            <img src={marker.src} alt={marker.label || ""} className="w-full h-full object-cover" draggable={false} />
          </div>
        </Html>
      </group>
    </group>
  );
}

// ============================================================================
// Rotating Globe
// ============================================================================

interface RotatingGlobeProps {
  config: Required<Globe3DConfig>;
  markers: GlobeMarker[];
  onMarkerClick?: (marker: GlobeMarker) => void;
  onMarkerHover?: (marker: GlobeMarker | null) => void;
}

function RotatingGlobe({ config, markers, onMarkerClick, onMarkerHover }: RotatingGlobeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [earthTexture, bumpTexture] = useTexture([config.textureUrl, config.bumpMapUrl]);

  useMemo(() => {
    if (earthTexture) { earthTexture.colorSpace = THREE.SRGBColorSpace; earthTexture.anisotropy = 16; }
    if (bumpTexture) { bumpTexture.anisotropy = 8; }
  }, [earthTexture, bumpTexture]);

  const geometry = useMemo(() => new THREE.SphereGeometry(config.radius, 64, 64), [config.radius]);
  const wireframeGeometry = useMemo(() => new THREE.SphereGeometry(config.radius * 1.002, 32, 16), [config.radius]);

  return (
    <group ref={groupRef} rotation={[config.initialRotation.x, config.initialRotation.y, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial map={earthTexture} bumpMap={bumpTexture} bumpScale={config.bumpScale} metalness={0.1} roughness={0.8} />
      </mesh>
      {config.showWireframe && (
        <mesh geometry={wireframeGeometry}>
          <meshBasicMaterial color={config.wireframeColor} wireframe transparent opacity={0.08} />
        </mesh>
      )}
      {markers.map((marker, index) => (
        <Marker key={index} marker={marker} radius={config.radius} defaultSize={config.markerSize} onClick={onMarkerClick} onHover={onMarkerHover} />
      ))}
    </group>
  );
}

// ============================================================================
// Atmosphere
// ============================================================================

function Atmosphere({ radius, color, intensity, blur }: { radius: number; color: string; intensity: number; blur: number }) {
  const fresnelPower = Math.max(0.5, 5 - blur);
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        atmosphereColor: { value: new THREE.Color(color) },
        intensity: { value: intensity },
        fresnelPower: { value: fresnelPower },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 atmosphereColor;
        uniform float intensity;
        uniform float fresnelPower;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, normalize(-vPosition))), fresnelPower);
          gl_FragColor = vec4(atmosphereColor, fresnel * intensity);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, [color, intensity, fresnelPower]);

  return (
    <mesh material={atmosphereMaterial}>
      <sphereGeometry args={[radius * 1.15, 64, 64]} />
    </mesh>
  );
}

// ============================================================================
// Scene
// ============================================================================

function Scene({ markers, config, onMarkerClick, onMarkerHover }: { markers: GlobeMarker[]; config: Required<Globe3DConfig>; onMarkerClick?: (marker: GlobeMarker) => void; onMarkerHover?: (marker: GlobeMarker | null) => void }) {
  const { camera } = useThree();

  React.useEffect(() => {
    camera.position.set(0, 0, config.radius * 3.5);
    camera.lookAt(0, 0, 0);
  }, [camera, config.radius]);

  return (
    <>
      <ambientLight intensity={config.ambientIntensity} />
      <pointLight position={[10, 10, 10]} intensity={config.pointLightIntensity} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
      <RotatingGlobe config={config} markers={markers} onMarkerClick={onMarkerClick} onMarkerHover={onMarkerHover} />
      {config.showAtmosphere && (
        <Atmosphere radius={config.radius} color={config.atmosphereColor} intensity={config.atmosphereIntensity} blur={config.atmosphereBlur} />
      )}
      <OrbitControls
        enableZoom={config.enableZoom}
        enablePan={config.enablePan}
        minDistance={config.minDistance}
        maxDistance={config.maxDistance}
        autoRotate={config.autoRotateSpeed > 0}
        autoRotateSpeed={config.autoRotateSpeed}
        enableDamping
        dampingFactor={0.1}
      />
    </>
  );
}

// ============================================================================
// Loading Fallback
// ============================================================================

function LoadingFallback() {
  return (
    <mesh>
      <Html center>
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs text-muted-foreground">Loading globe...</span>
        </div>
      </Html>
    </mesh>
  );
}

// ============================================================================
// Main Globe3D Component
// ============================================================================

const defaultConfig: Required<Globe3DConfig> = {
  radius: 2,
  globeColor: "#1a1a2e",
  textureUrl: DEFAULT_EARTH_TEXTURE,
  bumpMapUrl: DEFAULT_BUMP_TEXTURE,
  showAtmosphere: false,
  atmosphereColor: "#4da6ff",
  atmosphereIntensity: 0.5,
  atmosphereBlur: 2,
  bumpScale: 1,
  autoRotateSpeed: 0.3,
  enableZoom: false,
  enablePan: false,
  minDistance: 5,
  maxDistance: 15,
  initialRotation: { x: 0, y: 0 },
  markerSize: 0.06,
  showWireframe: false,
  wireframeColor: "#4a9eff",
  ambientIntensity: 0.6,
  pointLightIntensity: 1.5,
  backgroundColor: null,
};

export function Globe3D({ markers = [], config = {}, className, onMarkerClick, onMarkerHover }: Globe3DProps) {
  const mergedConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);

  return (
    <div className={cn("relative w-full h-full", className)}>
      <Canvas
        camera={{ position: [0, 0, mergedConfig.radius * 3.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: mergedConfig.backgroundColor === null }}
        style={{ background: mergedConfig.backgroundColor || "transparent" }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene config={mergedConfig} markers={markers} onMarkerClick={onMarkerClick} onMarkerHover={onMarkerHover} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Globe3D;
