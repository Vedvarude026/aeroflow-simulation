import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  CloudRain, 
  AlertCircle, 
  BarChart2, 
  RefreshCw 
} from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';

export const ScenarioControlPanel: React.FC = () => {
  const { fetchInitialData } = usePlannerStore();
  const [runningStep, setRunningStep] = useState<number>(0);
  const [isScriptRunning, setIsScriptRunning] = useState(false);

  const injectEvent = async (type: string, targetId: string, details?: string) => {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, targetId, details })
      });
      await fetch('/api/replan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: `Dynamic event injection: ${type}` })
      });
      await fetchInitialData();
    } catch (e) {
      console.error(e);
    }
  };

  const runScriptedScenario = async () => {
    setIsScriptRunning(true);
    setRunningStep(1);

    // Step 1: Auto-plan day
    await new Promise(r => setTimeout(r, 1000));
    setRunningStep(2);

    // Step 2: Aircraft unserviceable
    await injectEvent('AIRCRAFT_UNSERVICEABLE', 'AX-104', 'Hydraulic line failure during pre-flight on Stand B42');
    await new Promise(r => setTimeout(r, 1500));
    setRunningStep(3);

    // Step 3: Base weather closure
    await injectEvent('BASE_WEATHER_CLOSURE', 'Dunmere Station', 'Thick fog below IFR minima');
    await new Promise(r => setTimeout(r, 1500));
    setRunningStep(4);

    // Step 4: Complete
    setIsScriptRunning(false);
  };

  return (
    <div className="bg-[#FFFFFF] border-t border-[#DFD7C8] px-4 py-2 flex items-center justify-between text-xs select-none">
      <div className="flex items-center gap-3 font-mono">
        <span className="font-bold text-[#362419] flex items-center gap-1.5 uppercase text-[10px]">
          <Zap className="w-3.5 h-3.5 text-[#1E40AF]" />
          SCENARIO RUNNER & EVENT INJECTOR:
        </span>

        {/* Scripted Run Button */}
        <button
          disabled={isScriptRunning}
          onClick={runScriptedScenario}
          className="bg-[#1E40AF] hover:bg-[#1D4ED8] disabled:opacity-50 text-[#FFFFFF] font-bold px-3 py-1 rounded text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Play className="w-3 h-3" />
          {isScriptRunning ? `Step ${runningStep}/4 Running...` : 'Run Demo Scenario (4-Step)'}
        </button>
      </div>

      {/* Manual Event Injection Buttons */}
      <div className="flex items-center gap-2 font-mono text-[10px]">
        <button
          onClick={() => injectEvent('AIRCRAFT_UNSERVICEABLE', 'AX-104')}
          className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 px-2 py-1 rounded transition-colors flex items-center gap-1 font-bold"
        >
          <AlertCircle className="w-3 h-3 text-red-600" /> +Inject Mech Fault
        </button>

        <button
          onClick={() => injectEvent('BASE_WEATHER_CLOSURE', 'Dunmere Station')}
          className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 px-2 py-1 rounded transition-colors flex items-center gap-1 font-bold"
        >
          <CloudRain className="w-3 h-3 text-amber-600" /> +Inject Weather Closure
        </button>

        <button
          onClick={() => fetchInitialData()}
          className="bg-[#F1ECE1] border border-[#DFD7C8] hover:bg-[#DFD7C8] text-[#362419] px-2 py-1 rounded transition-colors flex items-center gap-1 font-bold"
        >
          <RefreshCw className="w-3 h-3 text-[#1E40AF]" /> Sync COP State
        </button>
      </div>
    </div>
  );
};
