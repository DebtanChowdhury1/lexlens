'use client';

import { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ── Galaxy spiral particles ──────────────────────────────────────────────────
function GalaxyParticles() {
  const ref = useRef<THREE.Points>(null!);
  const ref2 = useRef<THREE.Points>(null!);

  const [innerPositions, innerColors] = useMemo(() => {
    const count = 2000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const arms = 3;
    for (let i = 0; i < count; i++) {
      const arm = i % arms;
      const t = (i / count) * Math.PI * 6;
      const armAngle = (arm / arms) * Math.PI * 2;
      const spread = 0.6 + (i / count) * 5.5;
      const scatter = (Math.random() - 0.5) * spread * 0.4;

      pos[i * 3]     = Math.cos(t + armAngle) * spread + scatter;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      pos[i * 3 + 2] = Math.sin(t + armAngle) * spread + scatter;

      // Color gradient: violet core → blue outer
      const ratio = i / count;
      col[i * 3]     = 0.5 - ratio * 0.2;  // R
      col[i * 3 + 1] = 0.1 + ratio * 0.2;  // G
      col[i * 3 + 2] = 0.9 + ratio * 0.1;  // B
    }
    return [pos, col];
  }, []);

  const outerPositions = useMemo(() => {
    const count = 1500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 7 + Math.random() * 14;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.04;
      ref.current.rotation.z += delta * 0.008;
    }
    if (ref2.current) {
      ref2.current.rotation.y -= delta * 0.015;
    }
  });

  return (
    <>
      {/* Inner galaxy spiral */}
      <Points ref={ref} positions={innerPositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.045}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      {/* Outer dust cloud */}
      <Points ref={ref2} positions={outerPositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#4F46E5"
          size={0.025}
          sizeAttenuation
          depthWrite={false}
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </>
  );
}

// ── AI Core — glowing pulsing orb at center ──────────────────────────────────
function AICore() {
  const ref = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const outerGlowRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.3;
      ref.current.rotation.z = t * 0.15;
      const s = 1 + Math.sin(t * 2) * 0.04;
      ref.current.scale.setScalar(s);
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 1.5) * 0.08;
      glowRef.current.scale.setScalar(s);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t * 2) * 0.05;
    }
    if (outerGlowRef.current) {
      const s = 1 + Math.sin(t * 0.8 + 1) * 0.12;
      outerGlowRef.current.scale.setScalar(s);
      (outerGlowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.06 + Math.sin(t) * 0.03;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer glow ring */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.08} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Mid glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Core sphere */}
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.5, 3]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={4}
          wireframe={false}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh>
        <icosahedronGeometry args={[0.52, 3]} />
        <meshBasicMaterial color="#A78BFA" wireframe transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// ── Holographic floating document ────────────────────────────────────────────
function HoloDocument({
  position, rotation, scale, phase, color = '#7C3AED',
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  phase: number;
  color?: string;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const scanRef = useRef<THREE.Mesh>(null!);

  const geo = useMemo(() => new THREE.BoxGeometry(0.75 * scale, 1.05 * scale, 0.03 * scale), [scale]);
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  const scanGeo = useMemo(() => new THREE.PlaneGeometry(0.65 * scale, 0.018 * scale), [scale]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.set(
        position[0] + Math.sin(t * 0.3 + phase * 2) * 0.12,
        position[1] + Math.sin(t * 0.5 + phase) * 0.25,
        position[2] + Math.cos(t * 0.25 + phase) * 0.1,
      );
      groupRef.current.rotation.y = rotation[1] + t * 0.12 + Math.sin(t * 0.3 + phase) * 0.08;
      groupRef.current.rotation.x = rotation[0] + Math.sin(t * 0.2 + phase) * 0.04;
      groupRef.current.rotation.z = rotation[2] + Math.cos(t * 0.15 + phase) * 0.02;
    }
    if (scanRef.current) {
      const scanY = Math.sin(t * 1.8 + phase * 3) * 0.4 * scale;
      scanRef.current.position.y = scanY;
      (scanRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.5 + Math.abs(Math.sin(t * 1.8 + phase * 3)) * 0.4;
    }
  });

  return (
    <group ref={groupRef} rotation={rotation}>
      {/* Document body */}
      <mesh>
        <primitive object={geo} />
        <meshStandardMaterial
          color="#0D0D1A"
          emissive={color}
          emissiveIntensity={0.06}
          transparent
          opacity={0.88}
          metalness={0.3}
          roughness={0.8}
        />
      </mesh>
      {/* Glowing edges */}
      <lineSegments>
        <primitive object={edgesGeo} />
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      {/* Document lines (content) */}
      {[0.28, 0.14, 0, -0.14, -0.28].map((y, i) => (
        <mesh key={i} position={[0, y * scale, 0.02 * scale]}>
          <planeGeometry args={[0.52 * scale, 0.014 * scale]} />
          <meshBasicMaterial
            color={i === 0 ? color : '#FFFFFF'}
            transparent
            opacity={i === 0 ? 0.8 : 0.15}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      {/* Internal scan line */}
      <mesh ref={scanRef} position={[0, 0, 0.022 * scale]}>
        <primitive object={scanGeo} />
        <meshBasicMaterial
          color="#60A5FA"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ── Orbiting energy rings ────────────────────────────────────────────────────
function OrbitRings() {
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const ring3 = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1.current) {
      ring1.current.rotation.z = t * 0.2;
      ring1.current.rotation.x = Math.PI / 4 + Math.sin(t * 0.1) * 0.05;
    }
    if (ring2.current) {
      ring2.current.rotation.z = -t * 0.13;
      ring2.current.rotation.y = t * 0.07;
    }
    if (ring3.current) {
      ring3.current.rotation.x = t * 0.08;
      ring3.current.rotation.z = -t * 0.05;
    }
  });

  const ringMat = (color: string, opacity: number) => (
    <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
  );

  return (
    <>
      <mesh ref={ring1} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[3.2, 0.012, 8, 120]} />
        {ringMat('#7C3AED', 0.5)}
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 6, Math.PI / 3, 0]}>
        <torusGeometry args={[4.5, 0.008, 8, 150]} />
        {ringMat('#3B82F6', 0.35)}
      </mesh>
      <mesh ref={ring3} rotation={[Math.PI / 2, Math.PI / 5, 0]}>
        <torusGeometry args={[2.1, 0.015, 8, 100]} />
        {ringMat('#8B5CF6', 0.45)}
      </mesh>
    </>
  );
}

// ── Floating risk score orbs ─────────────────────────────────────────────────
function RiskOrbs() {
  const orbs = useMemo(() => [
    { pos: [-4.5, 1.2, -1.5], color: '#DC2626', emissive: '#7F1D1D', score: 87 },
    { pos: [4.2, -0.8, -2],   color: '#D97706', emissive: '#78350F', score: 54 },
    { pos: [-1.5, 3.0, -3],   color: '#059669', emissive: '#064E3B', score: 12 },
    { pos: [3.0, 2.5, -1],    color: '#DC2626', emissive: '#7F1D1D', score: 91 },
    { pos: [-3.8, -2.2, -2],  color: '#D97706', emissive: '#78350F', score: 43 },
  ], []);

  const refs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.y = (orbs[i].pos[1] as number) + Math.sin(t * 0.6 + i * 1.3) * 0.2;
      mesh.rotation.y = t * 0.4 + i;
      const s = 1 + Math.sin(t * 1.5 + i * 0.7) * 0.06;
      mesh.scale.setScalar(s);
    });
  });

  return (
    <>
      {orbs.map((orb, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el!; }}
          position={orb.pos as [number, number, number]}
        >
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial
            color={orb.color}
            emissive={orb.color}
            emissiveIntensity={3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </>
  );
}

// ── Wide sweep scan beams ────────────────────────────────────────────────────
function ScanBeams() {
  const b1 = useRef<THREE.Mesh>(null!);
  const b2 = useRef<THREE.Mesh>(null!);
  const b3 = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (b1.current) {
      b1.current.position.y = Math.sin(t * 0.6) * 5;
      (b1.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.abs(Math.sin(t * 0.6)) * 0.15;
    }
    if (b2.current) {
      b2.current.position.y = Math.sin(t * 0.4 + Math.PI) * 4;
      (b2.current.material as THREE.MeshBasicMaterial).opacity = 0.06 + Math.abs(Math.sin(t * 0.4)) * 0.1;
    }
    if (b3.current) {
      b3.current.position.x = Math.sin(t * 0.35 + 1) * 6;
      (b3.current.material as THREE.MeshBasicMaterial).opacity = 0.05 + Math.abs(Math.sin(t * 0.35)) * 0.08;
    }
  });

  return (
    <>
      <mesh ref={b1}>
        <planeGeometry args={[30, 0.08]} />
        <meshBasicMaterial color="#60A5FA" transparent opacity={0.12} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={b2}>
        <planeGeometry args={[30, 0.05]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.08} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={b3} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[20, 0.06]} />
        <meshBasicMaterial color="#A78BFA" transparent opacity={0.06} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  );
}

// ── Mouse-reactive camera ────────────────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef(new THREE.Vector3());

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    // Slow automatic drift + mouse parallax
    target.current.x = mouse.current.x * 0.8 + Math.sin(t * 0.08) * 0.3;
    target.current.y = mouse.current.y * 0.5 + Math.cos(t * 0.06) * 0.2;
    camera.position.x += (target.current.x - camera.position.x) * 0.04;
    camera.position.y += (target.current.y - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ── Document config ──────────────────────────────────────────────────────────
const DOCUMENTS = [
  { position: [-4.2, 0.8, -2.5] as [number, number, number], rotation: [0.08, 0.35, 0.04] as [number, number, number], scale: 1.3, phase: 0, color: '#7C3AED' },
  { position: [3.8, -0.6, -2.0] as [number, number, number], rotation: [-0.06, -0.45, 0.08] as [number, number, number], scale: 1.1, phase: 1, color: '#3B82F6' },
  { position: [0.6, 2.2, -3.5] as [number, number, number], rotation: [0.18, 0.7, -0.1] as [number, number, number], scale: 0.9, phase: 2, color: '#8B5CF6' },
  { position: [-2.8, -2.0, -1.5] as [number, number, number], rotation: [-0.12, -0.25, 0.15] as [number, number, number], scale: 0.8, phase: 3, color: '#DC2626' },
  { position: [2.2, 1.5, -4.5] as [number, number, number], rotation: [0.05, 0.9, 0.06] as [number, number, number], scale: 1.2, phase: 4, color: '#059669' },
  { position: [-1.0, -3.0, -2.0] as [number, number, number], rotation: [0.1, -0.3, -0.08] as [number, number, number], scale: 0.75, phase: 5, color: '#D97706' },
  { position: [5.0, 1.0, -3.0] as [number, number, number], rotation: [-0.04, 0.5, 0.12] as [number, number, number], scale: 0.95, phase: 6, color: '#7C3AED' },
  { position: [-4.5, -1.2, -3.5] as [number, number, number], rotation: [0.15, -0.6, -0.05] as [number, number, number], scale: 1.0, phase: 7, color: '#3B82F6' },
];

export default function HeroScene() {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-600/30 flex items-center justify-center mx-auto">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
              <path d="M12 3L4 7v5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V7L12 3z" fill="rgba(124,58,237,0.6)" />
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-violet-400 text-sm font-medium">LexLens AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* CSS bloom simulation — radial glows at key positions */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {/* Center violet glow (AI core) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(124,58,237,0.06) 50%, transparent 70%)', filter: 'blur(20px)' }} />
        {/* Blue right glow */}
        <div className="absolute top-[40%] right-[15%] w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 65%)', filter: 'blur(24px)' }} />
        {/* Purple left glow */}
        <div className="absolute top-[55%] left-[12%] w-40 h-40 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)', filter: 'blur(20px)' }} />
      </div>

      <Canvas
        camera={{ position: [0, 0, 9], fov: 65 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4 }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 0, 4]} intensity={4} color="#7C3AED" />
        <pointLight position={[8, 4, 2]} intensity={2} color="#3B82F6" />
        <pointLight position={[-6, -3, 3]} intensity={1.5} color="#8B5CF6" />
        <pointLight position={[0, -5, 2]} intensity={1} color="#4F46E5" />

        <Suspense fallback={null}>
          <GalaxyParticles />
          <AICore />
          <OrbitRings />
          <ScanBeams />
          <RiskOrbs />

          {DOCUMENTS.map((doc, i) => (
            <HoloDocument key={i} {...doc} />
          ))}
        </Suspense>

        <CameraRig />
      </Canvas>
    </div>
  );
}
