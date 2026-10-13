import React, { useState } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { Plane, AlertTriangle, CheckCircle, Search, SlidersHorizontal, ShieldCheck } from 'lucide-react';

export const FleetPage: React.FC = () => {
  const { fleet, openExplainDrawer } = usePlannerStore();
  const [filterBase, setFilterBase] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredFleet = fleet.filter(a => {
    if (filterBase !== 'ALL' && a.currentBase !== filterBase) return false;
    if (filterType !== 'ALL' && a.type !== filterType) return false;
    if (search && !a.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto font-mono text-xs select-none text-[#362419]">
      {/* Header & Filters */}
      <div className="bg-[#FFFFFF] border border-[#DFD7C8] p-3 rounded-md flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-[#1E40AF]" />
          <h1 className="text-sm font-bold text-[#362419] uppercase tracking-wider">
            SYNTHETIC FLEET ROSTER & SERVICEABILITY
          </h1>
          <span className="bg-[#1E40AF] text-[#FFFFFF] text-[10px] px-2 py-0.5 rounded font-bold shadow-2xs">
            {filteredFleet.length} ASSETS
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-[#1E40AF] absolute left-2.5 top-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by Tail / ID..."
              className="bg-[#F1ECE1] border border-[#DFD7C8] text-[#362419] pl-8 pr-3 py-1 rounded text-xs focus:ring-1 focus:ring-[#1E40AF] w-full sm:w-40 placeholder-[#6C584C]"
            />
          </div>

          {/* Base Filter */}
          <select
            value={filterBase}
            onChange={(e) => setFilterBase(e.target.value)}
            className="bg-[#F1ECE1] border border-[#DFD7C8] text-[#362419] px-2 py-1 rounded focus:ring-0"
          >
            <option value="ALL">All Airbases</option>
            <option value="Aldermoor Base">Aldermoor Base</option>
            <option value="Brightwater Field">Brightwater Field</option>
            <option value="Corvin Strip">Corvin Strip</option>
            <option value="Dunmere Station">Dunmere Station</option>
            <option value="Eastholm Airfield">Eastholm Airfield</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#F1ECE1] border border-[#DFD7C8] text-[#362419] px-2 py-1 rounded focus:ring-0"
          >
            <option value="ALL">All Aircraft Types</option>
            <option value="Aircraft Type A">Aircraft Type A</option>
            <option value="Aircraft Type B">Aircraft Type B</option>
            <option value="Aircraft Type C">Aircraft Type C</option>
          </select>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-[#FFFFFF] border border-[#DFD7C8] rounded-md overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F1ECE1] text-[#6C584C] text-[10px] uppercase border-b border-[#DFD7C8]">
              <th className="p-3">Aircraft ID</th>
              <th className="p-3">Type</th>
              <th className="p-3">Home Airbase</th>
              <th className="p-3">Status</th>
              <th className="p-3">Flight Hours</th>
              <th className="p-3">Next Maint. Due</th>
              <th className="p-3">Provenance</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFD7C8]">
            {filteredFleet.map((ac) => (
              <tr key={ac.id} className="hover:bg-[#F1ECE1] transition-colors text-[#362419]">
                <td className="p-3 font-bold text-[#1E40AF] flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#1E40AF]" />
                  {ac.id}
                  <span className="text-[10px] text-[#6C584C] font-normal">({ac.tailNumber})</span>
                </td>
                <td className="p-3 text-[#6C584C]">{ac.type}</td>
                <td className="p-3 text-[#6C584C]">{ac.currentBase}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ac.status === 'Serviceable' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                    ac.status === 'Limited' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    'bg-red-100 text-red-900 border border-red-300'
                  }`}>
                    {ac.status}
                  </span>
                </td>
                <td className="p-3 font-mono">{ac.flightHours}h / {ac.totalHours}h</td>
                <td className="p-3 font-mono text-[#6C584C]">{ac.nextMaintenanceDue}</td>
                <td className="p-3">
                  <span className="text-[10px] text-[#362419] font-bold bg-[#F1ECE1] px-1.5 py-0.5 rounded border border-[#DFD7C8]">
                    {ac.provenance}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => openExplainDrawer('ULA-3280')}
                    className="text-[#1E40AF] hover:underline text-[11px] font-bold"
                  >
                    View Anomaly Log →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
