import { useContext } from 'react';
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
    triggerGenerativeRedesign: context.triggerGenerativeRedesign,
    resetSimulation: context.resetSimulation,
    injectDisaster: context.injectDisaster,
  };
}