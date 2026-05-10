"use client";

import { useEffect, useRef } from "react";
import { useSiteSimulation } from "@/hooks/useSiteSimulation";
import { useToast } from "@/context/ToastContext";

export default function ToastBridge() {
  const {
    anomalyDetected,
    aiOptimized,
    pipelineConnected,
    scenarioEvents,
  } = useSiteSimulation();
  const { addToast } = useToast();

  const prevAnomaly = useRef(anomalyDetected);
  const prevAiOptimized = useRef(aiOptimized);
  const prevPipelineConnected = useRef< boolean | null>(null);
  const prevEventCount = useRef(scenarioEvents.length);

  useEffect(() => {
    if (anomalyDetected && !prevAnomaly.current) {
      addToast("Critical Site Deviation — Anomaly detected", "warning");
    }
    prevAnomaly.current = anomalyDetected;
  }, [anomalyDetected, addToast]);

  useEffect(() => {
    if (aiOptimized && !prevAiOptimized.current) {
      addToast("AI Recalibration Applied — Optimization complete", "success");
    }
    prevAiOptimized.current = aiOptimized;
  }, [aiOptimized, addToast]);

  useEffect(() => {
    if (prevPipelineConnected.current === null) {
      prevPipelineConnected.current = pipelineConnected;
      return;
    }
    if (pipelineConnected && !prevPipelineConnected.current) {
      addToast("API Synced — Pipeline connected", "info");
    } else if (!pipelineConnected && prevPipelineConnected.current) {
      addToast("Simulation Fallback — Pipeline disconnected", "error");
    }
    prevPipelineConnected.current = pipelineConnected;
  }, [pipelineConnected, addToast]);

  useEffect(() => {
    if (scenarioEvents.length > prevEventCount.current) {
      const latestEvent = scenarioEvents[scenarioEvents.length - 1];
      if (latestEvent.title === "Disaster Scenario Injected") {
        addToast("Disaster Scenario Injected — Emergency stress test triggered", "error");
      }
    }
    prevEventCount.current = scenarioEvents.length;
  }, [scenarioEvents, addToast]);

  return null;
}
