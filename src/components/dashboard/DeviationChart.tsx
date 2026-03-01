"use client";

import { Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

interface DeviationData {
  time: string;
  dev: number;
  safe: number;
}

export default function DeviationChart({ data }: { data: DeviationData[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 min-h-[250px] flex flex-col">
      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-purple-600" />
        Out-of-Plumb Deviation Timeline
      </h3>
      <div className="flex-1 w-full min-h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} domain={[0, 60]} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              labelStyle={{ fontSize: 12, fontWeight: 'bold', color: '#334155' }}
            />
            
            {/* The Generative Model Safe Limit */}
            <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Critical Tolerance (20mm)', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
            
            <Line 
              type="monotone" 
              dataKey="dev" 
              stroke="#8b5cf6" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
              activeDot={{ r: 6 }} 
              name="Deviation (mm)" 
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center font-medium bg-gray-50 py-1.5 rounded-md border border-gray-100">
        Live telemetry from Laser Scan Node L-2B14
      </p>
    </div>
  );
}