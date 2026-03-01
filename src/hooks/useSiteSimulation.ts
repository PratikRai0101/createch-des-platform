import { useState, useEffect } from 'react';

export function useSiteSimulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [deviation, setDeviation] = useState(0); // mm
  const [status, setStatus] = useState<"STABLE" | "CRITICAL">("STABLE");
  const [soilBearingCapacity, setSoilBearingCapacity] = useState(450); // kPa
  const [baseDepth, setBaseDepth] = useState(0.5); // base beam depth (meters)
  const [newDepth, setNewDepth] = useState(0.5);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [aiOptimized, setAiOptimized] = useState(false);
  
  // Also keep a historical log of deviation for the chart
  const [deviationHistory, setDeviationHistory] = useState(
    Array.from({ length: 10 }).map((_, i) => ({ time: `T-${10-i}`, dev: 0, safe: 20 }))
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSimulating && !aiOptimized) {
      interval = setInterval(() => {
        // 1. Soil capacity drops gradually
        setSoilBearingCapacity((prev) => {
          const drop = prev - Math.random() * 15;
          return drop > 250 ? drop : 250;
        });
        
        // 2. Site Deviation increases (e.g. column shifted out of plumb)
        setDeviation((prev) => {
          const newDeviation = prev + (Math.random() * 5);
          if (newDeviation > 20) {
             setAnomalyDetected(true);
             setStatus("CRITICAL");
             // Calculate what the new depth *should* be (generative simulation calculation)
             setNewDepth(baseDepth + (Math.abs(newDeviation) * 0.005));
          }
          const cappedDeviation = newDeviation > 50 ? 50 : newDeviation;
          
          // Update historical data for chart
          setDeviationHistory(curr => {
            const newHistory = [...curr.slice(1), { 
              time: new Date().toLocaleTimeString().split(' ')[0], 
              dev: Number(cappedDeviation.toFixed(1)),
              safe: 20
            }];
            return newHistory;
          });
          
          return cappedDeviation;
        });
        
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isSimulating, aiOptimized, baseDepth]);

  const triggerGenerativeRedesign = () => {
    setAiOptimized(true);
    setAnomalyDetected(false);
    setStatus("STABLE");
    
    // Simulate deviation resolving visually
    setDeviationHistory(curr => {
      const newHistory = [...curr.slice(1), { 
        time: new Date().toLocaleTimeString().split(' ')[0], 
        dev: 0, // snaps back into acceptable generative boundaries
        safe: 20
      }];
      return newHistory;
    });
  };

  const injectDisaster = () => {
    setIsSimulating(false); // Pause standard simulation
    setSoilBearingCapacity(120); // Critical drop
    setDeviation(48); // Massive out-of-plumb
    setAnomalyDetected(true);
    setStatus("CRITICAL");
    setNewDepth(baseDepth + (48 * 0.005));
    
    setDeviationHistory(curr => {
      return [...curr.slice(1), { 
        time: new Date().toLocaleTimeString().split(' ')[0], 
        dev: 48,
        safe: 20
      }];
    });
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setDeviation(0);
    setStatus("STABLE");
    setSoilBearingCapacity(450);
    setBaseDepth(0.5);
    setNewDepth(0.5);
    setAnomalyDetected(false);
    setAiOptimized(false);
    setDeviationHistory(Array.from({ length: 10 }).map((_, i) => ({ time: `T-${10-i}`, dev: 0, safe: 20 })));
  };

  return {
    isSimulating,
    setIsSimulating,
    deviation,
    status,
    soilBearingCapacity,
    baseDepth,
    newDepth,
    anomalyDetected,
    aiOptimized,
    deviationHistory,
    triggerGenerativeRedesign,
    resetSimulation,
    injectDisaster
  };
}