import { useSiteSimulationContext } from "@/context/SiteSimulationContext";

export function useSiteSimulation() {
  const context = useSiteSimulationContext();
  if (!context) {
    throw new Error('useSiteSimulation must be used within SiteSimulationProvider');
  }
  return {
    isSimulating: context.isSimulating,
    setIsSimulating: context.setIsSimulating,
    deviation: context.deviation,
    status: context.status,
    soilBearingCapacity: context.soilBearingCapacity,
    baseDepth: context.baseDepth,
    setBaseDepth: context.setBaseDepth,
    newDepth: context.newDepth,
    anomalyDetected: context.anomalyDetected,
    aiOptimized: context.aiOptimized,
    latestOption: context.latestOption,
    applyGenerativeOption: context.applyGenerativeOption,
    deviationHistory: context.deviationHistory || [],
    recalibrationCount: context.recalibrationCount,
    totalReworkSaved: context.totalReworkSaved,
    totalScheduleImpact: context.totalScheduleImpact,
    currentEstimatedCost: context.currentEstimatedCost,
    currentScheduleImpact: context.currentScheduleImpact,
    scenarioStage: context.scenarioStage,
    viewMode: context.viewMode,
    setViewMode: context.setViewMode,
    scenarioEvents: context.scenarioEvents || [],
    pipelineConnected: context.pipelineConnected,
    costHistory: context.costHistory,
    machineryState: context.machineryState,
    activeCommands: context.activeCommands,
    executedCommands: context.executedCommands,
    setActiveCommands: context.setActiveCommands,
    executeGCodeQueue: context.executeGCodeQueue,
    updateMachineryPos: context.updateMachineryPos,
    triggerGenerativeRedesign: context.triggerGenerativeRedesign,
    resetSimulation: context.resetSimulation,
    injectDisaster: context.injectDisaster,
    controlMode: context.controlMode,
    setControlMode: context.setControlMode,
    manualMove: context.manualMove,
    pushEvent: context.pushEvent,
  };
}