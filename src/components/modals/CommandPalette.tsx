import React, { useEffect, useState } from 'react';
import { Search, X, Plane, Calendar, Zap, RefreshCw, Layers } from 'lucide-react';
import { usePlannerStore, PageName } from '../../store/usePlannerStore';

export const CommandPalette: React.FC = () => {
  const { 
    commandPaletteOpen, 
    setCommandPaletteOpen, 
    fleet, 
    tasks, 
    setActivePage, 
    openExplainDrawer 
  } = usePlannerStore();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const filteredAircraft = fleet.filter(a => 
    a.id.toLowerCase().includes(query.toLowerCase()) || 
    a.currentBase.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredTasks = tasks.filter(t => 
    t.id.toLowerCase().includes(query.toLowerCase()) || 
    t.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const handleNavigate = (page: PageName) => {
    setActivePage(page);
    setCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-[#362419]/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-xl bg-[#FFFFFF] border border-[#DFD7C8] rounded-lg shadow-2xl overflow-hidden flex flex-col text-xs text-[#362419]">
        {/* Search Input */}
        <div className="p-3 border-b border-[#DFD7C8] flex items-center gap-2 bg-[#F8F6F0]">
          <Search className="w-4 h-4 text-[#1E40AF] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search aircraft, tasks, bases, or run command (e.g. 'AX-101', 'ULA-3280')..."
            className="w-full bg-transparent text-[#362419] font-mono focus:outline-none placeholder-[#6C584C]"
          />
          <button onClick={() => setCommandPaletteOpen(false)} className="text-[#6C584C] hover:text-[#362419]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Results */}
        <div className="p-2 flex flex-col gap-3 max-h-[360px] overflow-y-auto">
          {/* Quick Actions */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#1E40AF] uppercase tracking-wider font-bold px-2">
              Quick Navigation
            </span>
            <div className="grid grid-cols-2 gap-1 font-mono">
              <button
                onClick={() => handleNavigate('dashboard')}
                className="p-2 bg-[#F1ECE1] hover:bg-[#DFD7C8] rounded text-[#362419] text-left flex items-center gap-2 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-[#1E40AF]" /> Dashboard OCC
              </button>
              <button
                onClick={() => handleNavigate('fleet')}
                className="p-2 bg-[#F1ECE1] hover:bg-[#DFD7C8] rounded text-[#362419] text-left flex items-center gap-2 transition-colors"
              >
                <Plane className="w-3.5 h-3.5 text-[#1E40AF]" /> Fleet Roster
              </button>
              <button
                onClick={() => handleNavigate('schedule')}
                className="p-2 bg-[#F1ECE1] hover:bg-[#DFD7C8] rounded text-[#362419] text-left flex items-center gap-2 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-[#1E40AF]" /> Schedule & Solver
              </button>
              <button
                onClick={() => handleNavigate('reports')}
                className="p-2 bg-[#F1ECE1] hover:bg-[#DFD7C8] rounded text-[#362419] text-left flex items-center gap-2 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-[#1E40AF]" /> Forecast & Reports
              </button>
            </div>
          </div>

          {/* Aircraft Results */}
          {filteredAircraft.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-[#1E40AF] uppercase tracking-wider font-bold px-2">
                Matching Aircraft ({filteredAircraft.length})
              </span>
              {filteredAircraft.map(ac => (
                <div
                  key={ac.id}
                  onClick={() => {
                    handleNavigate('fleet');
                  }}
                  className="p-2 bg-[#F1ECE1] hover:bg-[#DFD7C8] rounded text-[#362419] flex items-center justify-between cursor-pointer font-mono transition-colors"
                >
                  <span className="font-bold text-[#362419]">{ac.id} ({ac.type})</span>
                  <span className="text-[#6C584C]">{ac.currentBase} · {ac.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Task Results */}
          {filteredTasks.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-[#1E40AF] uppercase tracking-wider font-bold px-2">
                Matching Tasks ({filteredTasks.length})
              </span>
              {filteredTasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    openExplainDrawer(t.id);
                    setCommandPaletteOpen(false);
                  }}
                  className="p-2 bg-[#F1ECE1] hover:bg-[#DFD7C8] rounded text-[#362419] flex items-center justify-between cursor-pointer font-mono transition-colors"
                >
                  <span className="font-bold text-[#362419]">{t.id} ({t.name})</span>
                  <span className="text-[#1E40AF] font-bold">Explain Plan →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
