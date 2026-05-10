import { useContext } from "react";
import { SiteSimulationContext } from "@/context/SiteSimulationContext";

export function useMachineryControl() {
  const ctx = useContext(SiteSimulationContext);
  if (!ctx) throw new Error("useMachineryControl must be used within SiteSimulationProvider");

  return {
    machineryState: ctx.machineryState,
    controlMode: ctx.controlMode,
    setControlMode: ctx.setControlMode,
    activeCommands: ctx.activeCommands,
    executedCommands: ctx.executedCommands,
    setActiveCommands: ctx.setActiveCommands,
    executeGCodeQueue: ctx.executeGCodeQueue,
    updateMachineryPos: ctx.updateMachineryPos,
    manualMove: ctx.manualMove,
    manualMoveCrane: ctx.manualMoveCrane,
  };
}
