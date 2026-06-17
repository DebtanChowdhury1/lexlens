'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function DocumentMesh({ step }: { step: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const scanRef = useRef<THREE.Mesh>(null!);

  const segmentColors = useMemo(() => {
    const colors = ['#94A3B8', '#94A3B8', '#94A3B8', '#94A3B8', '#94A3B8', '#94A3B8'];
    if (step >= 2) colors[0] = '#DC2626';
    if (step >= 3) colors[1] = '#059669';
    if (step >= 4) colors[2] = '#D97706';
    if (step >= 5) colors[3] = '#DC2626';
    if (step >= 6) colors[4] = '#059669';
    return colors;
  }, [step]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
    }
    if (scanRef.current) {
      const scanY = Math.sin(t * 1.2) * 1.8;
      scanRef.current.position.y = scanY;
      (scanRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.3 + Math.abs(Math.sin(t * 1.2)) * 0.4;
    }
  });

  return (
    <group>
      {/* Main document */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[2, 2.8, 0.05]} />
        <meshStandardMaterial color="#12121A" emissive="#7C3AED" emissiveIntensity={0.08} />
      </mesh>

      {/* Document lines */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[0, 1.0 - i * 0.4, 0.03]}>
          <boxGeometry args={[1.4, 0.06, 0.01]} />
          <meshBasicMaterial color={segmentColors[i]} transparent opacity={0.9} />
        </mesh>
      ))}

      {/* Scan beam */}
      <mesh ref={scanRef} position={[0, 0, 0.06]}>
        <planeGeometry args={[2.2, 0.12]} />
        <meshBasicMaterial color="#60A5FA" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.05;
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial transparent color="#7C3AED" size={0.04} sizeAttenuation depthWrite={false} opacity={0.6} />
    </Points>
  );
}

export default function AnalysisScene({ step }: { step: number }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={1.5} color="#7C3AED" />
      <pointLight position={[-3, -3, 2]} intensity={0.8} color="#3B82F6" />
      <Particles />
      <DocumentMesh step={step} />
    </Canvas>
  );
}
