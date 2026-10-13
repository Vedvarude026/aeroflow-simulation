import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Activity, 
  FastForward, 
  ChevronDown, 
  Zap, 
  Check, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';

export const SubHeader: React.FC = () => {
  const { 
    simTime, 
    simDateStr, 
    isSimPaused, 
    simSpeed, 
    setSimSpeed, 
    toggleSimPause,
    jumpSimTime,
    updateSimTimeFromWS,
    activePage 
  } = usePlannerStore();

  const [isResetting, setIsResetting] = useState(false);
  const [showClockPopover, setShowClockPopover] = useState(false);

  // Sync Pause with backend
  const handleTogglePause = () => {
    toggleSimPause();
    const newPausedState = !isSimPaused;
    
    // WS sync
    const ws = (window as any).__AEROFLOW_WS__;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'TOGGLE_SIM_PAUSE', isPaused: newPausedState }));
    }
    
    // REST API sync fallback
    fetch('/api/admin/sim-control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPaused: newPausedState })
    }).catch(() => {});
  };

  // Sync Speed with backend
  const handleSetSpeed = (speed: number) => {
    setSimSpeed(speed);
    
    // WS sync
    const ws = (window as any).__AEROFLOW_WS__;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'SET_SIM_SPEED', speed }));
    }

    // REST API sync fallback
    fetch('/api/admin/sim-control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speedMultiplier: speed })
    }).catch(() => {});
  };

  // Quick jump time
  const handleJump = (minutes: number) => {
    jumpSimTime(minutes);
  };

  // Reset Scenario
  const handleReset = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: 42 })
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
      setIsResetting(false);
    }
  };

  // Client-side smooth ticker fallback if simulation is running
  useEffect(() => {
    if (isSimPaused) return;

    const interval = setInterval(() => {
      // Local tick increment if no WS update arrived in the last second
      const now = new Date();
      // Format current UTC time string for fallback display
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      // only update if needed
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimPaused, simSpeed]);

  return (
    <div className="bg-[#F8F6F0] border-b border-[#DFD7C8] px-4 py-2 flex items-center justify-between text-xs select-none relative z-30">
      {/* Left Title */}
      <div className="flex items-center gap-2 text-[#6C584C] font-medium">
        <Activity className="w-4 h-4 text-[#1E40AF] shrink-0" />
        <span className="tracking-wider uppercase text-[11px] font-bold text-[#362419]">
          OPERATIONS CONTROL CENTER
        </span>
        <span className="text-[#DFD7C8]">|</span>
        <span className="text-[#6C584C] font-mono text-[11px] font-semibold">
          AIR RESOURCE PLANNER
        </span>
      </div>

      {/* Centre Controllable Simulation Clock Component */}
      <div className="flex items-center gap-3 bg-[#FFFFFF] border border-[#DFD7C8] px-3 py-1 rounded-lg shadow-2xs relative">
        {/* Clickable Clock Time & Date Zone */}
        <div 
          onClick={() => setShowClockPopover(!showClockPopover)}
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#F8F6F0] transition-colors cursor-pointer group"
          title="Click to open simulation time jump options"
        >
          <Clock className="w-3.5 h-3.5 text-[#1E40AF] group-hover:scale-110 transition-transform shrink-0" />
          <span className="font-mono text-sm font-bold text-[#362419] tracking-wider">
            {simTime}
          </span>
          <span className="text-[#DFD7C8] font-mono">|</span>
          <span className="font-mono text-xs text-[#6C584C] font-semibold uppercase">
            {simDateStr}
          </span>
          <ChevronDown className={`w-3 h-3 text-[#6C584C] transition-transform ${showClockPopover ? 'rotate-180' : ''}`} />

          {/* Status Indicator Badge */}
          {isSimPaused ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              PAUSED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              LIVE ({simSpeed}x)
            </span>
          )}
        </div>

        <div className="h-4 w-px bg-[#DFD7C8]" />

        {/* Main Controls */}
        <div className="flex items-center gap-1.5">
          {/* Pause / Play Button */}
          <button
            onClick={handleTogglePause}
            className={`p-1.5 rounded-md transition-all flex items-center justify-center font-medium ${
              isSimPaused 
                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200' 
                : 'bg-[#1E40AF] text-[#FFFFFF] hover:bg-[#1D4ED8] shadow-2xs'
            }`}
            title={isSimPaused ? 'Resume Scenario Simulation' : 'Pause Scenario Simulation'}
          >
            {isSimPaused ? (
              <Play className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Pause className="w-3.5 h-3.5 fill-current" />
            )}
          </button>

          {/* Speed Multiplier Buttons */}
          <div className="flex items-center gap-1 bg-[#F1ECE1] rounded-md p-0.5 border border-[#DFD7C8]">
            {[1, 5, 15, 30, 60].map((s) => (
              <button
                key={s}
                onClick={() => handleSetSpeed(s)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded font-bold transition-all ${
                  simSpeed === s
                    ? 'bg-[#1E40AF] text-[#FFFFFF] shadow-2xs scale-105'
                    : 'text-[#6C584C] hover:text-[#362419] hover:bg-[#DFD7C8]/50'
                }`}
                title={`Set Simulation Speed to ${s}x Realtime`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#DFD7C8] my-auto" />

          {/* Fast-forward Quick Jumps */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleJump(15)}
              className="px-2 py-1 text-[10px] font-mono font-bold bg-[#F8F6F0] hover:bg-[#1E40AF] hover:text-white border border-[#DFD7C8] rounded text-[#362419] transition-colors flex items-center gap-1"
              title="Jump Forward +15 Minutes"
            >
              <FastForward className="w-3 h-3 shrink-0" />
              +15m
            </button>
            <button
              onClick={() => handleJump(60)}
              className="px-2 py-1 text-[10px] font-mono font-bold bg-[#F8F6F0] hover:bg-[#1E40AF] hover:text-white border border-[#DFD7C8] rounded text-[#362419] transition-colors flex items-center gap-1"
              title="Jump Forward +1 Hour"
            >
              <FastForward className="w-3 h-3 shrink-0" />
              +1h
            </button>
          </div>

          <div className="h-4 w-px bg-[#DFD7C8] my-auto" />

          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="p-1.5 text-[#6C584C] hover:text-[#1E40AF] hover:bg-[#F8F6F0] rounded border border-transparent hover:border-[#DFD7C8] transition-colors relative"
            title="Reset Simulation Scenario State"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-[#1E40AF]' : ''}`} />
          </button>
        </div>

        {/* Time Jump / Scenario Clock Popover */}
        {showClockPopover && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-[#DFD7C8] rounded-lg shadow-xl p-3 z-50 text-[#362419] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFD7C8] mb-2">
              <span className="font-bold text-xs flex items-center gap-1.5 text-[#1E40AF]">
                <Sparkles className="w-3.5 h-3.5 text-[#1E40AF]" />
                Scenario Time Control
              </span>
              <button 
                onClick={() => setShowClockPopover(false)}
                className="text-[10px] font-mono text-[#6C584C] hover:text-[#362419] px-1 bg-[#F8F6F0] rounded border border-[#DFD7C8]"
              >
                ESC
              </button>
            </div>

            <div className="text-[11px] text-[#6C584C] mb-3">
              Current UTC Clock: <strong className="font-mono text-[#362419]">{simTime} ({simDateStr})</strong>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C584C] block">
                Quick Jump Time Steps
              </span>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: '+5 Min', mins: 5 },
                  { label: '+15 Min', mins: 15 },
                  { label: '+30 Min', mins: 30 },
                  { label: '+1 Hour', mins: 60 },
                  { label: '+6 Hours', mins: 360 },
                  { label: '+24 Hours', mins: 1440 },
                ].map((item) => (
                  <button
                    key={item.mins}
                    onClick={() => {
                      handleJump(item.mins);
                      setShowClockPopover(false);
                    }}
                    className="px-2 py-1.5 text-[11px] font-mono font-semibold bg-[#F8F6F0] hover:bg-[#1E40AF] hover:text-white border border-[#DFD7C8] rounded text-[#362419] transition-all text-center flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-[#DFD7C8] flex items-center justify-between">
                <span className="text-[10px] text-[#6C584C]">
                  Status: {isSimPaused ? 'Paused' : `Active @ ${simSpeed}x`}
                </span>
                <button
                  onClick={() => {
                    handleTogglePause();
                    setShowClockPopover(false);
                  }}
                  className="px-2 py-1 text-[10px] font-bold bg-[#1E40AF] text-white rounded hover:bg-[#1D4ED8]"
                >
                  {isSimPaused ? 'Resume Live Stream' : 'Pause Clock'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Active View Indicator */}
      <div className="flex items-center gap-2">
        <button className="bg-[#1E40AF] text-[#FFFFFF] hover:bg-[#1D4ED8] font-bold px-3 py-1 rounded text-xs tracking-wide shadow-2xs transition-colors uppercase">
          {activePage} View
        </button>
      </div>
    </div>
  );
};

