"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Grid, Plane } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  deviation: number;
  status: "STABLE" | "CRITICAL";
  baseDepth: number;
  newDepth: number;
  aiOptimized: boolean;
}

export default function DigitalTwinScene({ deviation, status, baseDepth, newDepth, aiOptimized }: SceneProps) {
  // Use a ref to animate the beam
  const beamRef = useRef<THREE.Mesh>(null);
  
  // Base dimensions
  const base_l = 4.0;
  const base_w = 0.4;
  
  // Materials
  const columnMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9ca3af', metalness: 0.5, roughness: 0.2 }), []);
  const stableMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#22c55e', opacity: 0.8, transparent: true }), []);
  const criticalMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ef4444', opacity: 0.8, transparent: true }), []);
  const optimizedMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8b5cf6', opacity: 0.8, transparent: true }), []); // Purple for AI optimized

  // Smoothly animate the beam to its new position and size
  useFrame((state, delta) => {
    if (beamRef.current) {
      // Calculate target properties
      const targetDepth = aiOptimized ? newDepth : baseDepth;
      // Convert deviation from mm to meters for positioning
      const targetX = 2.0 + (deviation / 1000); 
      
      // Interpolate position (X)
      beamRef.current.position.x = THREE.MathUtils.lerp(beamRef.current.position.x, targetX, 0.1);
      
      // Interpolate scale (Y axis is depth in this orientation)
      beamRef.current.scale.y = THREE.MathUtils.lerp(beamRef.current.scale.y, targetDepth / baseDepth, 0.1);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />

      {/* Grid Floor */}
      <Grid 
        infiniteGrid 
        fadeDistance={20} 
        sectionColor="#475569" 
        cellColor="#334155" 
        position={[0, -1.5, 0]} 
      />
      
      {/* Base Plane */}
      <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.51, 0]} receiveShadow>
        <meshStandardMaterial color="#1e293b" />
      </Plane>

      {/* 1. Primary Column (Fixed) */}
      <Cylinder 
        args={[0.2, 0.2, 3, 32]} 
        position={[0, 0, 0]} 
        castShadow 
        receiveShadow
        material={columnMaterial}
      />

      {/* 2. Generative Beam (Reactive) */}
      {/* We set the initial args to base dimensions, and scale/position it in useFrame */}
      <Box 
        ref={beamRef}
        args={[base_l, baseDepth, base_w]} 
        position={[2.0, 1.5, 0]} 
        castShadow 
        receiveShadow
        material={aiOptimized ? optimizedMaterial : (status === "CRITICAL" ? criticalMaterial : stableMaterial)}
      />
    </>
  );
}
