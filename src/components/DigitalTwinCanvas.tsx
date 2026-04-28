"use client";

import { useRef, useState, useEffect, startTransition } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import DigitalTwinScene from "./DigitalTwinScene";

interface DigitalTwinCanvasProps {
  deviation: number;
  status: "STABLE" | "CRITICAL";
  baseDepth: number;
  newDepth: number;
  aiOptimized: boolean;
}

function CameraAnimator({ trigger }: { trigger: number }) {
  const { camera, controls } = useThree();
  const ref = useRef({
    phase: "idle" as "idle" | "forward" | "hold" | "back",
    progress: 0,
    holdTimer: 0,
    savedPos: new THREE.Vector3(5, 4, 8),
    savedTarget: new THREE.Vector3(2, 0, 0),
    beamPos: new THREE.Vector3(2.5, 2, 3.5),
    beamTarget: new THREE.Vector3(2, 0.8, 0),
  });

  useEffect(() => {
    if (trigger > 0) {
      const r = ref.current;
      r.savedPos.copy(camera.position);
      if (controls) {
        r.savedTarget.copy(controls.target);
      }
      r.progress = 0;
      r.holdTimer = 0;
      r.phase = "forward";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  useFrame(() => {
    const r = ref.current;
    if (r.phase === "idle") return;

    r.progress += 0.025;
    const t = Math.min(r.progress, 1);
    const ease = t * t * (3 - 2 * t);

    if (r.phase === "forward") {
      camera.position.lerpVectors(r.savedPos, r.beamPos, ease);
      if (controls) {
        controls.target.lerpVectors(r.savedTarget, r.beamTarget, ease);
      }
      if (t >= 1) {
        r.progress = 0;
        r.phase = "hold";
      }
    } else if (r.phase === "hold") {
      r.holdTimer += 1 / 60;
      if (r.holdTimer > 2) {
        r.progress = 0;
        r.phase = "back";
      }
    } else if (r.phase === "back") {
      camera.position.lerpVectors(r.beamPos, r.savedPos, ease);
      if (controls) {
        controls.target.lerpVectors(r.beamTarget, r.savedTarget, ease);
      }
      if (t >= 1) {
        r.phase = "idle";
      }
    }
  });

  return null;
}

export default function DigitalTwinCanvas(props: DigitalTwinCanvasProps) {
  const [flythroughTrigger, setFlythroughTrigger] = useState(0);
  const prevAiOptimized = useRef(false);

  useEffect(() => {
    if (props.aiOptimized && !prevAiOptimized.current) {
      startTransition(() => {
        setFlythroughTrigger((n) => n + 1);
      });
    }
    prevAiOptimized.current = props.aiOptimized;
  }, [props.aiOptimized]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-[#111111] relative">
      <Canvas shadows camera={{ position: [5, 4, 8], fov: 45 }}>
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[2, 0, 0]}
        />
        <DigitalTwinScene {...props} />
        <CameraAnimator trigger={flythroughTrigger} />
      </Canvas>

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
        <div className="flex items-center gap-2 mt-2 border-t border-white/10 pt-2">
          <button
            onClick={() => setFlythroughTrigger((n) => n + 1)}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
          >
            View Recalibration
          </button>
        </div>
        <div className="text-[10px] text-gray-400 mt-2 border-t border-white/10 pt-1">
          Scroll to zoom • Click & drag to rotate
        </div>
      </div>
    </div>
  );
}
