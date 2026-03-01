"use client";

import React from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ReactNode;
  color?: string;
  bgColor?: string;
  pulse?: boolean;
}

export default function KpiCard({ 
  title, 
  value, 
  trend, 
  icon, 
  color = "text-[#0077c8]", 
  bgColor = "bg-blue-50", 
  pulse = false 
}: KpiCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${pulse ? 'border-red-300 shadow-red-100 shadow-lg' : 'border-gray-200'} p-5 transition-all duration-500 relative overflow-hidden`}>
      {pulse && (
        <div className="absolute inset-0 bg-red-50 opacity-50 animate-pulse pointer-events-none" />
      )}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
        <div className={`p-2.5 rounded-xl ${bgColor} ${color}`}>
          {icon}
        </div>
      </div>
      <h4 className={`text-3xl font-black relative z-10 tracking-tight ${pulse ? 'text-red-600' : 'text-gray-900'}`}>{value}</h4>
      <p className="text-xs text-gray-500 mt-2 font-semibold bg-gray-50/80 inline-block px-2.5 py-1 rounded-md border border-gray-100 relative z-10">
        {trend}
      </p>
    </div>
  );
}