"use client";

import { useRef, useState, useEffect, useMemo, startTransition } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useSiteSimulation } from "@/hooks/useSiteSimulation";
import DigitalTwinScene from "./DigitalTwinScene";

interface DigitalTwinCanvasProps {
  deviation: number;
  status: "STABLE" | "CRITICAL";
  baseDepth: number;
  newDepth: number;
  aiOptimized: boolean;
  miniMap?: boolean;
}

function MiniMapTracker({ isMiniMap }: { isMiniMap: boolean }) {
  const { controls } = useThree();
  const { machineryState } = useSiteSimulation();

  useFrame(() => {
    if (isMiniMap && controls) {
      const excavator = machineryState.excavator;
      (controls as unknown as { target: THREE.Vector3 }).target.set(excavator.x, 0, excavator.z);
    }
  });

  return null;
}

function CameraAnimator({ trigger }: { trigger: number }) {
  const { camera } = useThree();
  const controls = useThree((s) => s.controls);

  const phase = useRef<"idle" | "forward" | "hold" | "back">("idle");
  const progress = useRef(0);
  const holdTimer = useRef(0);
  const savedPos = useRef(new THREE.Vector3(5, 4, 8));
  const savedTarget = useRef(new THREE.Vector3(2, 0, 0));
  const beamPos = useRef(new THREE.Vector3(2.5, 2, 3.5));
  const beamTarget = useRef(new THREE.Vector3(2, 0.8, 0));

  useEffect(() => {
    if (trigger > 0) {
      savedPos.current.copy(camera.position);
      if (controls) {
        savedTarget.current.copy((controls as unknown as { target: THREE.Vector3 }).target);
      }
      progress.current = 0;
      holdTimer.current = 0;
      phase.current = "forward";
    }
  }, [trigger, camera, controls]);

  useFrame(() => {
    if (phase.current === "idle") return;

    progress.current += 0.025;
    const t = Math.min(progress.current, 1);
    const ease = t * t * (3 - 2 * t);

    if (phase.current === "forward") {
      camera.position.lerpVectors(savedPos.current, beamPos.current, ease);
      if (controls) {
        (controls as unknown as { target: THREE.Vector3 }).target.lerpVectors(
          savedTarget.current,
          beamTarget.current,
          ease
        );
      }
      if (t >= 1) {
        progress.current = 0;
        phase.current = "hold";
      }
    } else if (phase.current === "hold") {
      holdTimer.current += 1 / 60;
      if (holdTimer.current > 2) {
        progress.current = 0;
        phase.current = "back";
      }
    } else if (phase.current === "back") {
      camera.position.lerpVectors(beamPos.current, savedPos.current, ease);
      if (controls) {
        (controls as unknown as { target: THREE.Vector3 }).target.lerpVectors(
          beamTarget.current,
          savedTarget.current,
          ease
        );
      }
      if (t >= 1) {
        phase.current = "idle";
      }
    }
  });

  return null;
}

function WebGLCanvas(props: DigitalTwinCanvasProps) {
  const [flythroughTrigger, setFlythroughTrigger] = useState(0);
  const prevAiOptimized = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure context is available before rendering Canvas
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (props.aiOptimized && !prevAiOptimized.current) {
      startTransition(() => {
        setFlythroughTrigger((n) => n + 1);
      });
    }
    prevAiOptimized.current = props.aiOptimized;
  }, [props.aiOptimized]);

  if (!isReady) {
    return (
      <div className="w-full h-full min-h-[400px] rounded-xl bg-[#111111] flex items-center justify-center text-white/40 text-sm">
        Initializing 3D scene…
      </div>
    );
  }

  const isMiniMap = props.miniMap === true;

  return (
    <div className={`w-full rounded-xl overflow-hidden bg-[#111111] relative ${isMiniMap ? 'h-[200px]' : 'h-full min-h-[400px]'}`}>
      <Canvas
        shadows={!isMiniMap}
        camera={{ position: isMiniMap ? [6, 5, 9] : [5, 4, 8], fov: isMiniMap ? 55 : 45 }}
        onCreated={(state) => {
          if (!state.gl.domElement) {
            throw new Error("WebGL context unavailable");
          }
        }}
        gl={{ antialias: !isMiniMap, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false }}
      >
        <OrbitControls
          enablePan={!isMiniMap}
          enableZoom={!isMiniMap}
          enableRotate={!isMiniMap}
          target={[0, 0, 0]}
        />
        <MiniMapTracker isMiniMap={isMiniMap} />
        <DigitalTwinScene {...props} />
        {!isMiniMap && <CameraAnimator trigger={flythroughTrigger} />}
      </Canvas>

      {!isMiniMap && (
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs font-mono border border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-gray-400"></div> Primary Column (Fixed)
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${props.aiOptimized ? "bg-purple-500" : props.status === "CRITICAL" ? "bg-red-500" : "bg-green-500"}`}></div>
          Generative Beam ({props.aiOptimized ? "Recalibrated" : "Live State"})
        </div>
        {props.aiOptimized && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-indigo-200 border border-indigo-300"></div>
            Baseline Beam (Before)
          </div>
        )}
      </div>
      )}
    </div>
  );
}

export default function DigitalTwinCanvas(props: DigitalTwinCanvasProps) {
  return <WebGLCanvas {...props} />;
}
