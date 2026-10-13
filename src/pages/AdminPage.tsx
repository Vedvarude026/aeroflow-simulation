import React, { useState } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { Settings, Shield, RefreshCw, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { auditLogs, fetchInitialData, activeRole } = usePlannerStore();
  const [seed, setSeed] = useState(42);
  const [fleetSize, setFleetSize] = useState(24);
  const [isResetting, setIsResetting] = useState(false);

  const handleRegenerateData = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed })
      });
      await fetchInitialData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto font-mono text-xs select-none text-[#362419]">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#DFD7C8] p-3 rounded-md flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#1E40AF]" />
          <h1 className="text-sm font-bold text-[#362419] uppercase tracking-wider">
            ADMINISTRATION & SYNTHETIC DATA CONFIGURATION
          </h1>
        </div>

        <span className="bg-[#1E40AF] text-[#FFFFFF] px-2.5 py-1 rounded font-bold uppercase shadow-2xs">
          Role: {activeRole}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Synthetic Generator Config */}
        <div className="bg-[#FFFFFF] border border-[#DFD7C8] p-4 rounded-md flex flex-col gap-3 shadow-2xs">
          <span className="font-bold text-[#362419] uppercase text-xs border-b border-[#DFD7C8] pb-2 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#1E40AF]" /> Deterministic Data Generator
          </span>

          <div className="flex flex-col gap-2">
            <div>
              <label className="text-[#6C584C] text-[11px] block mb-1">Random Seed Number:</label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
                className="bg-[#F1ECE1] border border-[#DFD7C8] text-[#362419] px-3 py-1.5 rounded w-full focus:ring-1 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="text-[#6C584C] text-[11px] block mb-1">Fleet Horizon Size:</label>
              <input
                type="number"
                value={fleetSize}
                onChange={(e) => setFleetSize(Number(e.target.value))}
                className="bg-[#F1ECE1] border border-[#DFD7C8] text-[#362419] px-3 py-1.5 rounded w-full focus:ring-1 focus:ring-[#1E40AF]"
              />
            </div>

            <button
              onClick={handleRegenerateData}
              disabled={isResetting}
              className="mt-2 bg-[#1E40AF] hover:bg-[#1D4ED8] text-[#FFFFFF] font-bold py-2 rounded transition-colors shadow-2xs"
            >
              {isResetting ? 'Regenerating...' : 'Regenerate Seed Synthetic Data'}
            </button>
          </div>
        </div>

        {/* Data Quality Widget */}
        <div className="bg-[#FFFFFF] border border-[#DFD7C8] p-4 rounded-md flex flex-col gap-3 shadow-2xs">
          <span className="font-bold text-[#362419] uppercase text-xs border-b border-[#DFD7C8] pb-2 flex items-center justify-between">
            <span>DATA QUALITY & PROVENANCE SCORE</span>
            <span className="text-[#1E40AF] font-bold text-sm">94 / 100</span>
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-[#F1ECE1] p-2 rounded border border-[#DFD7C8]">Confirmed Records: <span className="font-bold text-emerald-700">18</span></div>
            <div className="bg-[#F1ECE1] p-2 rounded border border-[#DFD7C8]">Forecast Records: <span className="font-bold text-amber-700">4</span></div>
            <div className="bg-[#F1ECE1] p-2 rounded border border-[#DFD7C8]">Assumed Records: <span className="font-bold text-[#1E40AF]">2</span></div>
            <div className="bg-[#F1ECE1] p-2 rounded border border-[#DFD7C8]">Missing Records: <span className="font-bold text-[#6C584C]">0</span></div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#FFFFFF] border border-[#DFD7C8] p-4 rounded-md flex flex-col gap-3 shadow-2xs">
        <span className="font-bold text-[#362419] uppercase text-xs border-b border-[#DFD7C8] pb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1E40AF]" /> IMMUTABLE AUDIT LOG & COMPLIANCE HISTORY
        </span>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F1ECE1] text-[#6C584C] text-[10px] uppercase border-b border-[#DFD7C8]">
              <th className="p-2">Log ID</th>
              <th className="p-2">Timestamp</th>
              <th className="p-2">User / Role</th>
              <th className="p-2">Action</th>
              <th className="p-2">Target</th>
              <th className="p-2">Reason / Diff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFD7C8]">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#F1ECE1] transition-colors text-[#362419] text-[11px]">
                <td className="p-2 font-bold text-[#362419]">{log.id}</td>
                <td className="p-2 text-[#6C584C]">{log.timestamp}</td>
                <td className="p-2 font-bold text-[#1E40AF]">{log.user} ({log.role})</td>
                <td className="p-2 font-bold text-emerald-800">{log.action}</td>
                <td className="p-2 text-[#362419]">{log.target}</td>
                <td className="p-2 text-[#6C584C] max-w-xs truncate">{log.reason} - {log.diffSummary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
