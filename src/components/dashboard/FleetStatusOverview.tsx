import React from 'react';
import { Plane } from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';

export const FleetStatusOverview: React.FC = () => {
  const { fleet, openExplainDrawer } = usePlannerStore();

  const total = fleet.length || 12;
  const serviceable = fleet.filter(a => a.status === 'Serviceable').length;
  const limited = fleet.filter(a => a.status === 'Limited').length;
  const inMaintenance = fleet.filter(a => a.status === 'In Maintenance').length;
  const unserviceable = fleet.filter(a => a.status === 'Unserviceable').length;

  const serviceablePct = Math.round((serviceable / total) * 100);

  return (
    <div className="bg-[#0B132B] border border-[#1E3A8A]/60 rounded-md p-3 flex flex-col gap-2.5 shadow-lg select-none text-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E3A8A]/50 pb-2">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-[#60A5FA]" />
          <span className="text-[11px] font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            FLEET READINESS OVERVIEW
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#FFFFFF] bg-[#2563EB] px-2 py-0.5 rounded font-bold shadow-xs border border-[#3B82F6]/40">
          {serviceablePct}% READINESS
        </span>
      </div>

      {/* Main Readiness Metric Banner in Tactical Navy */}
      <div className="grid grid-cols-4 gap-2 text-center font-mono">
        <div className="bg-[#101F3C] border border-[#1E3A8A]/60 p-2 rounded flex flex-col items-center hover:border-[#3B82F6]/50 transition-colors">
          <span className="text-lg font-black text-[#60A5FA]">{serviceable}</span>
          <span className="text-[9px] text-[#93C5FD] uppercase font-bold">Serviceable</span>
        </div>
        <div className="bg-[#101F3C] border border-[#1E3A8A]/60 p-2 rounded flex flex-col items-center hover:border-[#3B82F6]/50 transition-colors">
          <span className="text-lg font-black text-[#F8FAFC]">{limited}</span>
          <span className="text-[9px] text-[#93C5FD] uppercase font-bold">Limited</span>
        </div>
        <div className="bg-[#101F3C] border border-[#1E3A8A]/60 p-2 rounded flex flex-col items-center hover:border-[#3B82F6]/50 transition-colors">
          <span className="text-lg font-black text-[#94A3B8]">{inMaintenance}</span>
          <span className="text-[9px] text-[#93C5FD] uppercase font-bold">Maint</span>
        </div>
        <div className="bg-[#101F3C] border border-[#1E3A8A]/60 p-2 rounded flex flex-col items-center hover:border-[#3B82F6]/50 transition-colors">
          <span className="text-lg font-black text-[#F87171]">{unserviceable}</span>
          <span className="text-[9px] text-[#93C5FD] uppercase font-bold">Unserv</span>
        </div>
      </div>

      {/* Provenance Data Strip */}
      <div className="bg-[#101F3C] border border-[#1E3A8A]/60 p-2 rounded text-[10px] font-mono flex items-center justify-between text-[#93C5FD]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
          <span>Confirmed Feed: <strong className="text-[#F8FAFC]">12 Telemetry Records</strong></span>
        </div>
        <button
          onClick={() => openExplainDrawer('ULA-3280')}
          className="text-[#60A5FA] hover:text-[#93C5FD] hover:underline font-bold transition-colors"
        >
          View Audit Log →
        </button>
      </div>
    </div>
  );
};
