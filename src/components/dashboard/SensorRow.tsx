"use client";

import { Info } from "lucide-react";

interface SensorRowProps {
  label: string;
  value: string | number;
  status: "normal" | "warning" | "critical";
  tooltip?: string;
}

export default function SensorRow({ label, value, status, tooltip }: SensorRowProps) {
  const colors = {
    normal: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    critical: "bg-red-100 text-red-700 border-red-200 animate-pulse",
  };

  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 group relative">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        {tooltip && (
          <div className="relative flex items-center">
            <Info className="w-3.5 h-3.5 text-gray-400 hover:text-[#0077c8] cursor-help transition-colors" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center font-medium leading-relaxed">
              {tooltip}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          </div>
        )}
      </div>
      <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-sm ${colors[status]}`}>
        {value}
      </span>
    </div>
  );
}