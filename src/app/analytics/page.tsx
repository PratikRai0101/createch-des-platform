"use client";

import { BarChart4, TrendingDown, Leaf, DollarSign, Target, ArrowUpRight } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, ComposedChart, Area
} from "recharts";

const savingsData = [
  { month: "Jan", projected: 400, actual: 380, carbonSaved: 12 },
  { month: "Feb", projected: 450, actual: 410, carbonSaved: 18 },
  { month: "Mar", projected: 500, actual: 420, carbonSaved: 25 },
  { month: "Apr", projected: 550, actual: 440, carbonSaved: 32 }, // Generative AI deployed here
  { month: "May", projected: 600, actual: 450, carbonSaved: 45 },
  { month: "Jun", projected: 650, actual: 460, carbonSaved: 58 },
];

export default function AnalyticsPage() {
  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart4 className="text-[#0077c8]" />
            Business Analytics & ESG
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Cost Efficiency & Carbon Mitigation Reporting</p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 outline-none">
            <option>YTD (2024)</option>
            <option>Last 12 Months</option>
            <option>Project Lifetime</option>
          </select>
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
            value="₹1.42 Cr" 
            sub="vs. Baseline Budget" 
            trend="+18% over last quarter" 
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
            value="94%" 
            sub="Tolerance errors caught pre-execution" 
            trend="-8% schedule delays" 
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
        </div>

        {/* Insight generation */}
        <div className="col-span-12 bg-gradient-to-r from-[#00447c] to-[#0077c8] rounded-2xl shadow-md p-6 text-white flex items-center justify-between">
          <div>
            <h4 className="font-bold text-lg flex items-center gap-2 mb-1">
              <span className="bg-white/20 p-1.5 rounded-lg"><ArrowUpRight className="w-5 h-5" /></span>
              AI Strategic Insight
            </h4>
            <p className="text-blue-100 text-sm max-w-3xl">
              By continuously recalibrating structural tolerances during the Zone 4 foundation pour, the generative model eliminated the need for 45 cubic meters of corrective concrete, directly contributing to this month's cost drop and carbon mitigation peak.
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

function ReportCard({ title, value, sub, trend, icon, color, bg }: any) {
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
