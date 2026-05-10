import { useContext } from "react";
import { SiteSimulationContext } from "@/context/SiteSimulationContext";

interface CostHistoryItem {
  day: string;
  projected: number;
  actual: number;
}

export function useCostTracking() {
  const ctx = useContext(SiteSimulationContext);
  if (!ctx) throw new Error("useCostTracking must be used within SiteSimulationProvider");

  return {
    currentEstimatedCost: ctx.currentEstimatedCost,
    currentScheduleImpact: ctx.currentScheduleImpact,
    totalReworkSaved: ctx.totalReworkSaved,
    totalScheduleImpact: ctx.totalScheduleImpact,
    costHistory: ctx.costHistory,
    recalibrationCount: ctx.recalibrationCount,
  };
}
