import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber/native";
import { View, StyleSheet } from "react-native";

function StructuralBeam({ status, aiOptimized }: { status: string; aiOptimized: boolean }) {
  const meshRef = useRef<any>(null);
  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  const color = aiOptimized ? "#000000" : status === "CRITICAL" ? "#CC0000" : "#333333";

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[2, 0.3, 0.3]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function DeviationIndicator({ deviation }: { deviation: number }) {
  const scale = Math.min(1, deviation / 50);
  return (
    <mesh position={[0, -0.5, 0]}>
      <boxGeometry args={[0.1 + scale * 0.5, 0.1, 0.1]} />
      <meshStandardMaterial color={deviation > 20 ? "#CC0000" : "#000000"} />
    </mesh>
  );
}

export default function DigitalTwinPreview({ deviation, status, aiOptimized }: { deviation: number; status: string; aiOptimized: boolean }) {
  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 2, 2]} intensity={1} />
        <StructuralBeam status={status} aiOptimized={aiOptimized} />
        <DeviationIndicator deviation={deviation} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 220,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#FAFAFA",
  },
  canvas: {
    flex: 1,
  },
});
