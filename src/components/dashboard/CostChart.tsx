"use client";

import { BarChart4 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { CHART, COST } from "@/lib/constants";

type CostChartPoint = {
  day: string;
  projected: number;
  actual: number;
};

const initialCostData: CostChartPoint[] = CHART.INITIAL_COST_DATA.map((item) => ({
  ...item,
  actual: item.projected,
}));

export default function CostChart({
  aiOptimized,
  costHistory,
}: {
  aiOptimized: boolean;
  costHistory?: CostChartPoint[];
}) {
  const chartData = costHistory ?? initialCostData;

  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.projected, d.actual))
  );

  const yAxisMax = Math.ceil(maxValue * COST.CHART_Y_MULTIPLIER / COST.FORMAT_DIVISOR) * COST.FORMAT_DIVISOR;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 min-h-[250px] flex flex-col">
      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
        <BarChart4 className="w-4 h-4 text-[#0077c8]" />
        Cost Overrun Trajectory
      </h3>
      <div className="flex-1 w-full min-h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0077c8" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#0077c8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              domain={[0, yAxisMax]}
              tickFormatter={(value) => `₹${(value / COST.FORMAT_DIVISOR).toFixed(0)}L`}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number | undefined) => value ? `₹${value.toLocaleString()}` : ''}
            />
            <Area type="monotone" dataKey="projected" stroke="#0077c8" fillOpacity={1} fill="url(#colorProjected)" name="Baseline Cost" />
            {!aiOptimized && (
              <Area type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Actual + Rework" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center font-medium bg-gray-50 py-1.5 rounded-md border border-gray-100">
        {aiOptimized ? "Trajectory corrected via automated generative redesign." : "Physical rework driving actual costs above baseline."}
      </p>
    </div>
  );
}