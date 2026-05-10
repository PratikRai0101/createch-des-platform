"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_BASE_URL || "http://127.0.0.1:8000";

export default function ConnectionBanner() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(5000) });
        if (!cancelled) setConnected(res.ok);
      } catch {
        if (!cancelled) setConnected(false);
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (connected === null) return null;

  if (connected) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-semibold text-amber-700">
      <WifiOff className="w-3.5 h-3.5" />
      Backend API Disconnected — running in simulation-only mode
    </div>
  );
}