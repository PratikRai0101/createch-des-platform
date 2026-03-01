"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import DigitalTwinScene from './DigitalTwinScene';

interface DigitalTwinCanvasProps {
  deviation: number;
  status: "STABLE" | "CRITICAL";
  baseDepth: number;
  newDepth: number;
  aiOptimized: boolean;
}

export default function DigitalTwinCanvas(props: DigitalTwinCanvasProps) {
  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-[#111111]">
      <Canvas shadows camera={{ position: [5, 4, 8], fov: 45 }}>
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[2, 0, 0]}
        />
        <DigitalTwinScene {...props} />
      </Canvas>
      
      {/* Overlay UI for 3D View */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs font-mono border border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-gray-400"></div> Primary Column (Fixed)
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${props.aiOptimized ? 'bg-purple-500' : (props.status === 'CRITICAL' ? 'bg-red-500' : 'bg-green-500')}`}></div> 
          Generative Beam ({props.aiOptimized ? 'Recalibrated' : 'Live State'})
        </div>
        <div className="text-[10px] text-gray-400 mt-2 border-t border-white/10 pt-1">
          Scroll to zoom • Click & drag to rotate
        </div>
      </div>
    </div>
  );
}
