import React, { useState } from 'react';
import { MoreHorizontal, ArrowUpDown, Pause, Play, Calendar, Clock } from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';

export const FlightScheduleTable: React.FC = () => {
  const { tasks, setSelectedTask, openExplainDrawer } = usePlannerStore();
  const [isPaused, setIsPaused] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  const sortedTasks = [...tasks].sort((a, b) => {
    return sortAsc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
  });

  return (
    <div className="bg-[#0B132B] border border-[#1E3A8A]/60 rounded-md p-3 flex flex-col gap-2.5 shadow-lg flex-1 min-h-[285px] justify-between select-none text-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E3A8A]/50 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-[11px] font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            FLIGHT SCHEDULE & LIVE STATUS
          </span>
          <span className="text-[9px] font-mono text-[#FFFFFF] bg-[#2563EB] px-2 py-0.5 rounded font-bold shadow-xs border border-[#3B82F6]/40">
            LIVE FEED
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="text-[10px] bg-[#101F3C] border border-[#1E3A8A]/60 px-2.5 py-1 rounded text-[#93C5FD] hover:bg-[#172A4D] hover:text-[#FFFFFF] flex items-center gap-1.5 transition-colors font-medium font-mono"
          >
            {isPaused ? <Play className="w-3 h-3 text-[#38BDF8]" /> : <Pause className="w-3 h-3 text-[#94A3B8]" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
          <button className="text-[#93C5FD] hover:text-[#FFFFFF] p-1 rounded hover:bg-[#101F3C]">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date & Filter Bar Strip */}
      <div className="flex items-center justify-between text-[10px] font-mono gap-2 bg-[#101F3C] px-2.5 py-1.5 rounded border border-[#1E3A8A]/60">
        <select className="bg-[#0B132B] border border-[#1E3A8A] text-[#F8FAFC] px-2 py-1 rounded focus:ring-0 text-[10px] focus:border-[#3B82F6]">
          <option>All Schedule Dates</option>
          <option>10 MAY 2024</option>
          <option>11 MAY 2024</option>
        </select>

        <div className="flex items-center gap-1.5 text-[#93C5FD] font-semibold">
          <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Active Window: Nov 25 – 27</span>
        </div>
      </div>

      {/* Clear Scrolling Table Container */}
      <div 
        className="flex-1 overflow-y-auto min-h-[185px] max-h-[230px] border border-[#1E3A8A]/60 rounded-md bg-[#0D1B2A] custom-scrollbar"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#101F3C] text-[#93C5FD] font-mono text-[10px] uppercase tracking-wider border-b border-[#1E3A8A]/60 sticky top-0 z-10">
              <th className="p-2 cursor-pointer hover:text-[#FFFFFF] transition-colors" onClick={() => setSortAsc(!sortAsc)}>
                <div className="flex items-center gap-1">
                  Flight <ArrowUpDown className="w-3 h-3 text-[#38BDF8]" />
                </div>
              </th>
              <th className="p-2">Origin Base</th>
              <th className="p-2">Dest Base</th>
              <th className="p-2">ETA</th>
              <th className="p-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E3A8A]/40 font-mono text-[11px]">
            {sortedTasks.map((t) => (
              <tr
                key={t.id}
                onClick={() => {
                  setSelectedTask(t);
                  openExplainDrawer(t.id);
                }}
                className="hover:bg-[#172A4D] cursor-pointer transition-colors text-[#F8FAFC] group"
              >
                <td className="p-2 font-bold text-[#60A5FA] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] group-hover:scale-125 transition-transform" />
                  {t.id}
                </td>
                <td className="p-2 text-[#93C5FD] font-medium truncate max-w-[80px]">
                  {t.originBase.replace(' Base', '').replace(' Field', '').replace(' Strip', '')}
                </td>
                <td className="p-2 text-[#93C5FD] font-medium truncate max-w-[80px]">
                  {t.destBase.replace(' Base', '').replace(' Field', '').replace(' Strip', '')}
                </td>
                <td className="p-2 text-[#F8FAFC] font-bold">17:45 Z</td>
                <td className="p-2 text-right">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-[#101F3C] text-[#38BDF8] border border-[#1E3A8A] shadow-xs">
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
