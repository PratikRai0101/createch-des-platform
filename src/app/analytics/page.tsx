"use client";

import { BarChart4, TrendingDown, Leaf, DollarSign, Target, ArrowUpRight } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Line, ComposedChart, Area
} from "recharts";
import type { ReactNode } from "react";
import { useSiteSimulation } from "@/hooks/useSiteSimulation";

const savingsData = [
  { month: "Jan", projected: 400, actual: 380, carbonSaved: 12 },
  { month: "Feb", projected: 450, actual: 410, carbonSaved: 18 },
  { month: "Mar", projected: 500, actual: 420, carbonSaved: 25 },
  { month: "Apr", projected: 550, actual: 440, carbonSaved: 32 }, // Generative AI deployed here
  { month: "May", projected: 600, actual: 450, carbonSaved: 45 },
  { month: "Jun", projected: 650, actual: 460, carbonSaved: 58 },
];

export default function AnalyticsPage() {
  const { aiOptimized, anomalyDetected, deviation, soilBearingCapacity, scenarioEvents, viewMode } = useSiteSimulation();
  const recentEvents = scenarioEvents.slice(-3).reverse();

  const costSavings = aiOptimized ? "₹1.42 Cr" : anomalyDetected ? "₹0.86 Cr" : "₹1.10 Cr";
  const reworkReduction = aiOptimized ? "94%" : anomalyDetected ? "62%" : "81%";

  const exportAuditTrail = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      scenario_state: aiOptimized ? "IMPACT" : anomalyDetected ? "RECALIBRATE" : "SENSE/DETECT",
      total_events: scenarioEvents.length,
      events: scenarioEvents,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `des-audit-trail-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart4 className="text-[#0077c8]" />
            Business Analytics & ESG
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {viewMode === "executive"
              ? "Executive impact view: cost, carbon, and schedule confidence"
              : "Engineering impact view: live constraints mapped to business outcomes"}
          </p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 outline-none">
            <option>YTD (2024)</option>
            <option>Last 12 Months</option>
            <option>Project Lifetime</option>
          </select>
          <button
            onClick={exportAuditTrail}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Export Event Ledger (.json)
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm transition-colors print:hidden">
            Export Report (.pdf)
          </button>
        </div>
      </header>

      <div className="p-8 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Executive Summary KPIs */}
        <div className="col-span-12 grid grid-cols-3 gap-6">
          <ReportCard 
            title="Total Cost Savings (AI Driven)" 
            value={costSavings} 
            sub="vs. Baseline Budget" 
            trend={aiOptimized ? "+18% over last quarter" : anomalyDetected ? "Recalibration pending; savings at risk" : "+9% over baseline"} 
            icon={<DollarSign />} 
            color="text-emerald-600" 
            bg="bg-emerald-50" 
          />
          <ReportCard 
            title="Carbon Mitigation (CO2e)" 
            value="190 Tons" 
            sub="Through Material Optimization" 
            trend="Equivalent to 8,500 trees planted" 
            icon={<Leaf />} 
            color="text-green-600" 
            bg="bg-green-50" 
          />
          <ReportCard 
            title="Rework Reduction Rate" 
            value={reworkReduction} 
            sub="Tolerance errors caught pre-execution" 
            trend={aiOptimized ? "-8% schedule delays" : anomalyDetected ? "+4 day projected slip" : "On-plan trajectory"} 
            icon={<Target />} 
            color="text-[#0077c8]" 
            bg="bg-blue-50" 
          />
        </div>

        {/* Charts */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-500" />
                Cumulative Cost Trajectory (₹ Lakhs)
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={savingsData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="projected" fill="#e2e8f0" stroke="#94a3b8" name="Baseline Projection" />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} name="Actual Cost (AI Optimized)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-500" />
                Monthly Carbon Savings (tCO2e)
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savingsData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="carbonSaved" fill="#10b981" radius={[4, 4, 0, 0]} name="Mitigated Emissions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">Live Decision Trace</h4>
            <div className="space-y-2">
              {recentEvents.map((event) => (
                <div key={event.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-[11px] font-bold text-gray-700">{event.ts} • {event.stage}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{event.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insight generation */}
        <div className="col-span-12 bg-gradient-to-r from-[#00447c] to-[#0077c8] rounded-2xl shadow-md p-6 text-white flex items-center justify-between">
          <div>
            <h4 className="font-bold text-lg flex items-center gap-2 mb-1">
              <span className="bg-white/20 p-1.5 rounded-lg"><ArrowUpRight className="w-5 h-5" /></span>
              AI Strategic Insight
            </h4>
            <p className="text-blue-100 text-sm max-w-3xl">
              {aiOptimized
                ? "By recalibrating structural tolerances during Zone 4 foundation execution, the model avoided corrective concrete and preserved both cost and carbon targets."
                : `Current live deviation is ${deviation.toFixed(1)}mm at ${Math.round(soilBearingCapacity)}kPa soil capacity. Optimization trigger remains active to prevent cost slippage.`}
            </p>
          </div>
          <button className="px-6 py-3 bg-white text-[#00447c] font-bold rounded-xl text-sm shadow-lg hover:shadow-xl transition-shadow">
            View Detail Report
          </button>
        </div>

      </div>
    </div>
  );
}

interface ReportCardProps {
  title: string;
  value: string;
  sub: string;
  trend: string;
  icon: ReactNode;
  color: string;
  bg: string;
}

function ReportCard({ title, value, sub, trend, icon, color, bg }: ReportCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:border-gray-200 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{sub}</span>
      </div>
      <h3 className="text-3xl font-black text-gray-800 mb-1">{value}</h3>
      <p className="text-xs font-semibold text-gray-500">{title}</p>
      
      <div className="mt-4 pt-4 border-t border-gray-50">
        <p className={`text-xs font-bold ${color}`}>{trend}</p>
      </div>
      
      {/* Decorative gradient corner */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity ${bg.replace('bg-', 'bg-gradient-to-br from-').replace('-50', '-400')} to-transparent pointer-events-none`}></div>
    </div>
  );
}
