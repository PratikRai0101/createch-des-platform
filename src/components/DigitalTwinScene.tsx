"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Grid, Plane, Edges, Html } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  deviation: number;
  status: "STABLE" | "CRITICAL";
  baseDepth: number;
  newDepth: number;
  aiOptimized: boolean;
}

export default function DigitalTwinScene({ deviation, status, baseDepth, newDepth, aiOptimized }: SceneProps) {
  const beamRef = useRef<THREE.Mesh>(null);
  
  // Base dimensions
  const base_l = 4.0;
  const base_w = 0.4;
  
  // High-fidelity CAD Materials
  const columnMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: '#cbd5e1', 
    metalness: 0.2, 
    roughness: 0.8,
    clearcoat: 0.1
  }), []);
  
  const stableMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: '#0077c8', // L&T Blue
    opacity: 0.85, 
    transparent: true,
    metalness: 0.1,
    roughness: 0.2,
    transmission: 0.5,
    ior: 1.5
  }), []);
  
  const criticalMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: '#ef4444', 
    opacity: 0.85, 
    transparent: true,
    metalness: 0.3,
    roughness: 0.2,
    transmission: 0.5,
    emissive: '#ef4444',
    emissiveIntensity: 0.4
  }), []);
  
  const optimizedMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: '#8b5cf6', // Generative Purple
    opacity: 0.85, 
    transparent: true,
    metalness: 0.1,
    roughness: 0.2,
    transmission: 0.5
  }), []);

  // Smoothly animate the beam
  useFrame((state, delta) => {
    if (beamRef.current) {
      const targetDepth = aiOptimized ? newDepth : baseDepth;
      const targetX = 2.0 + (deviation / 1000); 
      
      beamRef.current.position.x = THREE.MathUtils.lerp(beamRef.current.position.x, targetX, 0.1);
      beamRef.current.scale.y = THREE.MathUtils.lerp(beamRef.current.scale.y, targetDepth / baseDepth, 0.1);
    }
  });

  const activeMaterial = aiOptimized ? optimizedMaterial : (status === "CRITICAL" ? criticalMaterial : stableMaterial);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 20, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />
      <pointLight position={[0, 5, 10]} intensity={0.5} color="#0077c8" />

      {/* Engineering Blueprint Grid */}
      <Grid 
        infiniteGrid 
        fadeDistance={25} 
        sectionColor="#00447c" 
        sectionSize={1}
        cellColor="#0077c8" 
        cellSize={0.2}
        position={[0, -1.5, 0]} 
        cellThickness={0.5}
      />
      
      {/* Base Plane */}
      <Plane args={[30, 30]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.51, 0]} receiveShadow>
        <meshStandardMaterial color="#0f172a" />
      </Plane>

      {/* 1. Primary Column (Fixed) */}
      <Cylinder 
        args={[0.2, 0.2, 3, 32]} 
        position={[0, 0, 0]} 
        castShadow 
        receiveShadow
        material={columnMaterial}
      >
        <Edges scale={1.01} threshold={15} color="#94a3b8" />
        
        {/* Foundation Annotation */}
        <Html position={[-0.5, -1.2, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-slate-900/80 backdrop-blur border border-slate-700 text-slate-300 text-[9px] font-mono px-2 py-1 rounded shadow-lg flex flex-col items-center">
            <span className="text-[#0077c8] font-bold">COL-A1</span>
            <span>∅400mm</span>
          </div>
        </Html>
      </Cylinder>

      {/* 2. Generative Beam (Reactive) */}
      <Box 
        ref={beamRef}
        args={[base_l, baseDepth, base_w]} 
        position={[2.0, 1.5, 0]} 
        castShadow 
        receiveShadow
        material={activeMaterial}
      >
        <Edges scale={1.005} threshold={15} color={aiOptimized ? "#a78bfa" : (status === "CRITICAL" ? "#f87171" : "#38bdf8")} />
        
        {/* Dynamic Measurement Annotation */}
        <Html position={[0, 0, 0.3]} center style={{ pointerEvents: 'none' }}>
          <div className={`backdrop-blur-md border px-2 py-1 rounded shadow-xl flex flex-col items-center transition-colors font-mono text-[10px] ${
            aiOptimized ? 'bg-purple-900/80 border-purple-500 text-purple-200' :
            status === "CRITICAL" ? 'bg-red-900/80 border-red-500 text-red-200 animate-pulse' :
            'bg-[#00447c]/80 border-[#0077c8] text-blue-100'
          }`}>
            <span className="font-bold opacity-80 mb-0.5">BEAM DEPTH (Z)</span>
            <span className="text-sm font-black tracking-widest text-white">
              {Math.round((aiOptimized ? newDepth : baseDepth) * 1000)}<span className="text-[9px] ml-0.5 text-white/70">mm</span>
            </span>
          </div>
        </Html>
      </Box>

      {/* Deviation Indicator Line (Appears when deviating) */}
      {deviation > 5 && !aiOptimized && (
        <group position={[2.0, 1.5, 0]}>
          <Html position={[0, -0.6, 0]} center style={{ pointerEvents: 'none' }}>
            <div className="flex items-center gap-2 text-red-500 font-mono text-xs font-bold bg-red-950/80 px-2 py-1 rounded border border-red-500/50">
              <span>←</span>
              <span>Δ {deviation.toFixed(1)}mm OUT OF PLUMB</span>
              <span>→</span>
            </div>
          </Html>
        </group>
      )}
    </>
  );
}