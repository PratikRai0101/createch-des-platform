"use client";

import { Construction, Clock, Truck, Users, Calendar, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function ExecutionPage() {
  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Construction className="text-[#0077c8]" />
            Site Execution & Logistics
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Dynamic Gantt & Heavy Machinery Tracking</p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Current Phase</span>
            <span className="text-sm font-bold text-gray-800">Superstructure (Lvl 4)</span>
          </div>
          <div className="w-px h-8 bg-gray-200 mx-2"></div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Schedule Variance</span>
            <span className="text-sm font-bold text-red-600 flex items-center gap-1"><Clock className="w-3 h-3" /> +2 Days</span>
          </div>
        </div>
      </header>

      <div className="p-8 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Simplified Gantt View */}
        <div className="col-span-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
            <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Dynamic 4D Schedule (AI Adjusted)
            </h3>
            
            <div className="min-w-[800px]">
              {/* Timeline Header */}
              <div className="grid grid-cols-12 gap-2 mb-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">
                <div className="col-span-3">Task Name</div>
                <div className="col-span-1 text-center">W1</div>
                <div className="col-span-1 text-center">W2</div>
                <div className="col-span-1 text-center bg-blue-50 text-blue-600 rounded-md">W3 (Current)</div>
                <div className="col-span-1 text-center">W4</div>
                <div className="col-span-1 text-center">W5</div>
                <div className="col-span-1 text-center">W6</div>
                <div className="col-span-1 text-center">W7</div>
                <div className="col-span-1 text-center">W8</div>
                <div className="col-span-1 text-center">W9</div>
              </div>

              {/* Tasks */}
              <div className="space-y-4">
                <GanttRow name="Foundation Pour" status="done" start={1} span={2} />
                <GanttRow name="Curing Period" status="done" start={2} span={2} />
                <GanttRow name="Level 1 Columns (AI Recalibrated)" status="active" start={3} span={3} warning />
                <GanttRow name="Level 1 Slab Formwork" status="pending" start={5} span={2} />
                <GanttRow name="MEP Rough-in (L1)" status="pending" start={6} span={3} />
              </div>
            </div>
          </div>
        </div>

        {/* Resource Tracking */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" />
              Heavy Machinery Telemetry
            </h3>
            
            <div className="space-y-4">
              <MachineCard name="Tower Crane A (TC-01)" type="Lifting" load="85%" status="Active" operator="J. Smith" />
              <MachineCard name="Concrete Pump P-4" type="Pouring" load="Idle" status="Standby" operator="--" />
              <MachineCard name="Excavator EX-09" type="Earthworks" load="92%" status="Maintenance Req" operator="M. Doe" warning />
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Labor Allocation (Zone 4)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <p className="text-xs text-gray-500 font-semibold mb-1">Steel Fixers</p>
                <p className="text-2xl font-black text-gray-800">42 <span className="text-sm font-medium text-green-600">Active</span></p>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <p className="text-xs text-gray-500 font-semibold mb-1">Carpenters</p>
                <p className="text-2xl font-black text-gray-800">38 <span className="text-sm font-medium text-green-600">Active</span></p>
              </div>
              <div className="p-4 border border-red-100 rounded-xl bg-red-50/50">
                <p className="text-xs text-red-600 font-semibold mb-1">Welders (Shortage)</p>
                <p className="text-2xl font-black text-red-700">12 <span className="text-sm font-medium text-red-500">Req: 20</span></p>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <p className="text-xs text-gray-500 font-semibold mb-1">Site Engineers</p>
                <p className="text-2xl font-black text-gray-800">6 <span className="text-sm font-medium text-gray-500">Active</span></p>
              </div>
            </div>
            
            <button className="w-full mt-6 py-3 rounded-xl border border-dashed border-[#0077c8] text-[#0077c8] font-bold text-sm hover:bg-blue-50 transition-colors">
              Request Additional Manpower
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function GanttRow({ name, status, start, span, warning = false }: any) {
  const getStyle = () => {
    if (status === "done") return "bg-gray-200 border-gray-300 text-gray-500";
    if (status === "active") return warning ? "bg-amber-400 border-amber-500 text-amber-900 shadow-md shadow-amber-200" : "bg-blue-500 border-blue-600 text-white shadow-md shadow-blue-200";
    return "bg-blue-100 border-blue-200 text-blue-600 border-dashed";
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <div className="col-span-3 text-xs font-semibold text-gray-700 flex items-center gap-2">
        {warning && <AlertTriangle className="w-3 h-3 text-amber-500" />}
        {name}
      </div>
      <div className="col-span-9 grid grid-cols-9 gap-2 relative">
        {/* Background Grid */}
        <div className="absolute inset-0 grid grid-cols-9 gap-2 pointer-events-none">
          {[...Array(9)].map((_, i) => <div key={i} className="border-l border-gray-50 h-full"></div>)}
        </div>
        
        {/* Task Bar */}
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ duration: 0.5, delay: start * 0.1 }}
          style={{ gridColumnStart: start, gridColumnEnd: `span ${span}` }}
          className={`h-8 rounded-md border flex items-center px-3 text-[10px] font-bold relative z-10 ${getStyle()}`}
        >
          {status === "active" ? "In Progress" : status === "done" ? "Completed" : "Scheduled"}
        </motion.div>
      </div>
    </div>
  );
}

function MachineCard({ name, type, load, status, operator, warning }: any) {
  return (
    <div className={`p-4 rounded-xl border flex justify-between items-center ${warning ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
      <div className="flex gap-4 items-center">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${warning ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-800">{name}</h4>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{type} • Op: {operator}</p>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block mb-1 ${warning ? 'bg-amber-200 text-amber-800' : status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {status}
        </div>
        <p className="text-xs font-semibold text-gray-600">Load: {load}</p>
      </div>
    </div>
  );
}
