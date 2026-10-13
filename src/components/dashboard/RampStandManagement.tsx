import React, { useState } from 'react';
import { MoreHorizontal, AlertTriangle, CheckCircle, Plane } from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';

export const RampStandManagement: React.FC = () => {
  const { stands, openExplainDrawer } = usePlannerStore();
  const [selectedBase, setSelectedBase] = useState<string>('Aldermoor Base');
  const [selectedStandId, setSelectedStandId] = useState<string | null>('B1');

  const baseStands = stands.filter(s => s.base === selectedBase);
  const standsList = baseStands.length > 0 ? baseStands.slice(0, 8) : [
    { id: 'B1', base: 'Aldermoor Base', status: 'Occupied', currentAircraftId: 'AX-101' },
    { id: 'B2', base: 'Aldermoor Base', status: 'Occupied', currentAircraftId: 'AX-102' },
    { id: 'B3', base: 'Aldermoor Base', status: 'Occupied', currentAircraftId: 'AX-103' },
    { id: 'B4', base: 'Aldermoor Base', status: 'Maintenance', currentAircraftId: 'AX-104' },
    { id: 'B5', base: 'Aldermoor Base', status: 'Reserved', currentAircraftId: undefined },
    { id: 'B6', base: 'Aldermoor Base', status: 'Available', currentAircraftId: undefined },
    { id: 'B7', base: 'Aldermoor Base', status: 'Available', currentAircraftId: undefined },
    { id: 'B8', base: 'Aldermoor Base', status: 'Available', currentAircraftId: undefined },
  ];

  return (
    <div className="bg-[#0B132B] border border-[#1E3A8A]/60 rounded-md p-3 flex flex-col gap-2 shadow-lg flex-1 min-h-[285px] justify-between select-none text-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E3A8A]/50 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            RAMP & STAND MANAGEMENT
          </span>
          <span className="text-[9px] font-mono text-[#FFFFFF] bg-[#2563EB] px-1.5 py-0.5 rounded font-bold shadow-xs border border-[#3B82F6]/40">
            APRON SCHEMATIC
          </span>
        </div>
        
        <select
          value={selectedBase}
          onChange={(e) => {
            setSelectedBase(e.target.value);
            setSelectedStandId('B1');
          }}
          className="bg-[#101F3C] border border-[#1E3A8A]/60 text-[#F8FAFC] text-[10px] font-mono px-2 py-0.5 rounded focus:ring-0 focus:border-[#3B82F6]"
        >
          <option value="Aldermoor Base">Aldermoor Base</option>
          <option value="Brightwater Field">Brightwater Field</option>
          <option value="Corvin Strip">Corvin Strip</option>
          <option value="Dunmere Station">Dunmere Station</option>
          <option value="Eastholm Airfield">Eastholm Airfield</option>
        </select>
      </div>

      {/* SVG Apron / Terminal Schematic Expanded Container */}
      <div className="bg-[#0D1B2A] border border-[#1E3A8A]/60 rounded p-2.5 relative flex-1 min-h-[175px] flex flex-col justify-between overflow-hidden">
        {/* Terminal Building Header Bar */}
        <div className="w-full bg-[#101F3C] border border-[#1E3A8A]/60 py-1 text-center font-mono text-[10px] font-bold text-[#60A5FA] uppercase tracking-widest rounded shadow-2xs">
          {selectedBase.toUpperCase()} TERMINAL & APRON
        </div>

        {/* Stands Grid */}
        <div className="grid grid-cols-4 gap-2 my-auto py-1">
          {standsList.map((stand, idx) => {
            const isSelected = selectedStandId === stand.id;
            const isOccupied = stand.status === 'Occupied' || stand.status === 'Maintenance';

            return (
              <div
                key={`${stand.base}-${stand.id}-${idx}`}
                onClick={() => setSelectedStandId(stand.id)}
                className={`p-1.5 rounded border flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isOccupied
                    ? 'bg-[#101F3C] border-[#1E3A8A] text-[#F8FAFC] hover:bg-[#172A4D]'
                    : 'bg-[#0B132B] border-[#1E3A8A]/50 text-[#93C5FD] hover:bg-[#101F3C]'
                } ${isSelected ? 'ring-2 ring-[#38BDF8] border-[#38BDF8] scale-105 shadow-md z-10' : ''}`}
              >
                <div className="text-[10px] font-bold font-mono text-[#F8FAFC] flex items-center gap-1">
                  Stand {stand.id}
                </div>

                {isOccupied ? (
                  <div className="flex items-center gap-1 text-[9px] font-mono mt-1 font-bold text-[#38BDF8]">
                    <Plane className="w-3.5 h-3.5 text-[#38BDF8]" />
                    {stand.currentAircraftId || 'AX-101'}
                  </div>
                ) : (
                  <span className="text-[9px] text-[#94A3B8] font-mono mt-1 font-semibold">Free</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[9px] font-mono text-[#93C5FD] border-t border-[#1E3A8A]/50 pt-1">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#38BDF8]" /> Occupied</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#2563EB]" /> Maint</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#1E3A8A]" /> Available</span>
        </div>
      </div>

      {/* Stand Details Card */}
      {selectedStandId && (
        <div className="bg-[#101F3C] border border-[#1E3A8A]/60 px-2.5 py-1.5 rounded text-xs flex items-center justify-between font-mono">
          <div>
            <span className="font-bold text-[#F8FAFC]">{selectedBase} – Stand {selectedStandId}</span>
            <span className="text-[#93C5FD] ml-2 text-[10px]">Max Wingspan: 45m</span>
          </div>
          <button
            onClick={() => openExplainDrawer('ULA-3280')}
            className="text-[10px] text-[#38BDF8] hover:text-[#60A5FA] hover:underline font-bold transition-colors"
          >
            Check Stand Conflicts →
          </button>
        </div>
      )}
    </div>
  );
};
