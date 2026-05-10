"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Box, Cylinder, Grid, Plane, Edges, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { useSiteSimulation } from "@/hooks/useSiteSimulation";

interface SceneProps {
  deviation: number;
  status: "STABLE" | "CRITICAL";
  baseDepth: number;
  newDepth: number;
  aiOptimized: boolean;
}

type MachineryType = "excavator" | "crane";

type MachineryStatus = "IDLE" | "MOVING" | "WORKING";

interface MachineryAsset {
  x: number;
  y: number;
  z: number;
  status: MachineryStatus;
}

interface MachineryActorProps {
  type: MachineryType;
  position: MachineryAsset;
  status: MachineryStatus;
}

function MachineryActor({ type, position, status }: MachineryActorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Mesh>(null);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    if (isNaN(position.x) || isNaN(position.z)) {
      targetPosition.set(0, 0, 0);
    } else {
      targetPosition.set(position.x, 0, position.z);
    }
    groupRef.current.position.lerp(targetPosition, 0.1);

    if (armRef.current && status === "WORKING") {
      armRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 5) * 0.2;
    }
  });

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: type === "excavator" ? "#facc15" : "#3b82f6",
        metalness: 0.2,
        roughness: 0.4,
      }),
    [type]
  );

  const statusColor =
    status === "MOVING"
      ? "#10b981"
      : status === "WORKING"
      ? "#f97316"
      : "#94a3b8";

  if (!position || typeof position.x !== 'number' || typeof position.z !== 'number') {
    return (
      <Box args={[1, 1, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="red" />
      </Box>
    );
  }

  return (
    <group ref={groupRef}>
      {type === "excavator" ? (
        <>
          <pointLight position={[0, -0.5, 0]} intensity={2} color="#facc15" distance={3} />
          <mesh material={material} position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[1.2, 0.4, 0.8]} />
          </mesh>
          <mesh material={material} position={[0.3, 0.55, 0]} castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
          </mesh>
          <mesh ref={armRef} material={material} position={[-0.45, 0.4, 0]} rotation={[0, 0, -0.4]} castShadow>
            <boxGeometry args={[0.1, 0.1, 1.0]} />
          </mesh>
        </>
      ) : (
        <>
          <mesh material={material} position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 3, 16]} />
          </mesh>
          <mesh material={material} position={[1.5, 2.0, 0]} castShadow>
            <boxGeometry args={[3, 0.12, 0.12]} />
          </mesh>
          <mesh material={material} position={[-0.75, 2.0, 0]} castShadow>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
          </mesh>
        </>
      )}

      <Html position={[0, type === "excavator" ? 0.95 : 2.5, 0]} center style={{ pointerEvents: "none" }} occlude distanceFactor={8} zIndexRange={[20, 0]}>
        <div className="bg-black/70 border border-white/10 text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap">
          <div className="font-bold uppercase tracking-wider">{type}</div>
          <div style={{ color: statusColor }} className="text-[9px] mt-0.5">
            {status}
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function DigitalTwinScene({ deviation, status, baseDepth, newDepth, aiOptimized }: SceneProps) {
  const beamRef = useRef<THREE.Mesh>(null);
  const recalibrationRef = useRef(0);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let machineryState: any = null;
  try {
    const context = useSiteSimulation();
    machineryState = context?.machineryState || null;
  } catch (err) {
    // Hook may not be available in all rendering contexts
  }

  const safeMachineryState: Record<string, MachineryAsset> = machineryState ?? {
    excavator: { x: 0, y: 0, z: 5, status: "IDLE" },
    crane: { x: 10, y: 0, z: 10, status: "IDLE" },
  };

  // Base dimensions
  const base_l = 4.0;
  const base_w = 0.4;

  // High-fidelity CAD Materials
  const columnMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#cbd5e1",
        metalness: 0.2,
        roughness: 0.8,
        clearcoat: 0.1,
      }),
    []
  );

  const stableMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#0077c8",
        opacity: 0.85,
        transparent: true,
        metalness: 0.1,
        roughness: 0.2,
        transmission: 0.5,
        ior: 1.5,
      }),
    []
  );

  const criticalMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ef4444",
        opacity: 0.85,
        transparent: true,
        metalness: 0.3,
        roughness: 0.2,
        transmission: 0.5,
        emissive: "#ef4444",
        emissiveIntensity: 0.4,
      }),
    []
  );

  const optimizedMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#8b5cf6",
        opacity: 0.9,
        transparent: true,
        metalness: 0.1,
        roughness: 0.2,
        transmission: 0.5,
        emissive: "#8b5cf6",
        emissiveIntensity: 0.25,
      }),
    []
  );

  const baselineGhostMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#a5b4fc",
        opacity: 0.2,
        transparent: true,
        roughness: 0.3,
        metalness: 0,
      }),
    []
  );

  // Smoothly animate recalibration and structural recovery
  useFrame(() => {
    if (!beamRef.current) {
      return;
    }

    const targetRecalibration = aiOptimized ? 1 : 0;
    recalibrationRef.current = THREE.MathUtils.lerp(
      recalibrationRef.current,
      targetRecalibration,
      aiOptimized ? 0.05 : 0.12
    );

    const blendedDepth = THREE.MathUtils.lerp(baseDepth, newDepth, recalibrationRef.current);
    const lateralOffset = (deviation / 1000) * (1 - recalibrationRef.current);
    const targetX = 2.0 + lateralOffset;

    beamRef.current.position.x = THREE.MathUtils.lerp(beamRef.current.position.x, targetX, 0.1);
    beamRef.current.scale.y = THREE.MathUtils.lerp(beamRef.current.scale.y, blendedDepth / baseDepth, 0.1);
  });

  const activeMaterial = aiOptimized
    ? optimizedMaterial
    : status === "CRITICAL"
      ? criticalMaterial
      : stableMaterial;

  const depthDeltaMm = Math.round((newDepth - baseDepth) * 1000);

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
      {safeMachineryState &&
        Object.keys(safeMachineryState).map((type) => {
          const key = type as "excavator" | "crane";
          const asset = safeMachineryState[key];
          return (
            <MachineryActor
              key={key}
              type={key}
              position={asset}
              status={asset.status}
            />
          );
        })}

      {/* Base Plane */}
      <Plane args={[30, 30]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.51, 0]} receiveShadow>
        <meshStandardMaterial color="#0f172a" />
      </Plane>

      {/* 1. Primary Column (Fixed) */}
      <Cylinder args={[0.2, 0.2, 3, 32]} position={[0, 0, 0]} castShadow receiveShadow material={columnMaterial}>
        <Edges scale={1.01} threshold={15} color="#94a3b8" />

        {/* Foundation Annotation */}
        <Html position={[-0.5, -1.2, 0]} center style={{ pointerEvents: "none" }} occlude distanceFactor={8} zIndexRange={[20, 0]}>
          <div className="bg-slate-900/70 backdrop-blur border border-slate-700/50 text-slate-400 text-[8px] font-mono px-1.5 py-0.5 rounded shadow-lg flex flex-col items-center">
            <span className="text-[#0077c8] font-bold">COL-A1</span>
            <span>∅400mm</span>
          </div>
        </Html>
      </Cylinder>

      {/* Baseline ghost beam for before/after comparison */}
      {aiOptimized && (
        <Box args={[base_l, baseDepth, base_w]} position={[2.0, 1.5, 0]} material={baselineGhostMaterial}>
          <Edges scale={1.004} threshold={15} color="#c7d2fe" />
        </Box>
      )}

      {/* 2. Generative Beam (Reactive) */}
      <Box ref={beamRef} args={[base_l, baseDepth, base_w]} position={[2.0, 1.5, 0]} castShadow receiveShadow material={activeMaterial}>
        <Edges
          scale={1.005}
          threshold={15}
          color={aiOptimized ? "#a78bfa" : status === "CRITICAL" ? "#f87171" : "#38bdf8"}
        />

        {/* Dynamic Measurement Annotation */}
        <Html position={[0, 0, 0.3]} center style={{ pointerEvents: "none" }} occlude distanceFactor={8} zIndexRange={[20, 0]}>
          <div
            className={`backdrop-blur-md border px-1.5 py-0.5 rounded shadow-xl flex flex-col items-center transition-colors font-mono text-[9px] ${
              aiOptimized
                ? "bg-purple-900/70 border-purple-500/60 text-purple-200"
                : status === "CRITICAL"
                  ? "bg-red-900/70 border-red-500/60 text-red-200 animate-pulse"
                  : "bg-[#00447c]/70 border-[#0077c8]/60 text-blue-100"
            }`}
          >
            <span className="font-bold opacity-80 mb-0.5">DEPTH (Z)</span>
            <span className="text-xs font-black tracking-widest text-white">
              {Math.round((aiOptimized ? newDepth : baseDepth) * 1000)}
              <span className="text-[8px] ml-0.5 text-white/70">mm</span>
            </span>
          </div>
        </Html>
      </Box>

      {/* Recalibration summary overlay in scene */}
      {aiOptimized && (
        <Html position={[2.9, 2.4, 0]} center style={{ pointerEvents: "none" }} occlude distanceFactor={8} zIndexRange={[20, 0]}>
          <div className="rounded border border-purple-400/40 bg-purple-950/60 px-1.5 py-0.5 text-[9px] font-mono text-purple-100 shadow-lg">
            Δ +{depthDeltaMm}mm
          </div>
        </Html>
      )}

      {/* Tolerance envelope for fast visual diagnosis */}
      {status === "CRITICAL" && !aiOptimized && (
        <Box args={[base_l + 0.3, baseDepth + 0.2, base_w + 0.2]} position={[2.0, 1.5, 0]}>
          <meshBasicMaterial color="#ef4444" transparent opacity={0.08} />
          <Edges scale={1.002} threshold={15} color="#fca5a5" />
        </Box>
      )}

      {aiOptimized && (
        <Box args={[base_l + 0.2, newDepth + 0.1, base_w + 0.1]} position={[2.0, 1.5, 0]}>
          <meshBasicMaterial color="#22c55e" transparent opacity={0.06} />
          <Edges scale={1.001} threshold={15} color="#86efac" />
        </Box>
      )}

      {/* Load vector annotation for engineer mode storytelling */}
      {deviation > 8 && !aiOptimized && (
        <>
          <Line points={[[2.0, 3.0, 0], [2.0, 2.0, 0]]} color="#fb923c" lineWidth={2} />
          <Html position={[2.45, 3.0, 0]} center style={{ pointerEvents: "none" }} occlude distanceFactor={8} zIndexRange={[20, 0]}>
            <div className="rounded border border-orange-400/50 bg-orange-950/60 px-1.5 py-0.5 text-[9px] font-mono text-orange-200 shadow">
              Load ↑
            </div>
          </Html>
        </>
      )}

      {/* Deviation Indicator Line (Appears when deviating) */}
      {deviation > 5 && !aiOptimized && (
        <group position={[2.0, 1.5, 0]}>
          <Html position={[0, -0.6, 0]} center style={{ pointerEvents: "none" }} occlude distanceFactor={8} zIndexRange={[20, 0]}>
            <div className="flex items-center gap-1.5 text-red-500 font-mono text-[10px] font-bold bg-red-950/70 px-1.5 py-0.5 rounded border border-red-500/40">
              <span>Δ {deviation.toFixed(1)}mm</span>
            </div>
          </Html>
        </group>
      )}
    </>
  );
}
