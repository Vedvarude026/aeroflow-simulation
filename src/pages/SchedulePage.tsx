import React, { useEffect, useState } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Zap, 
  RotateCcw, 
  BarChart2, 
  ShieldCheck 
} from 'lucide-react';
import { OptimizationResult } from '../types/index';

export const SchedulePage: React.FC = () => {
  const { tasks, openExplainDrawer } = usePlannerStore();
  const [plans, setPlans] = useState<{
    greedy: OptimizationResult;
    optimised: OptimizationResult;
    conservative: OptimizationResult;
  } | null>(null);

  const [weights, setWeights] = useState({
    priorityWeight: 10,
    conflictWeight: 50,
    latenessWeight: 5,
    reserveWeight: 8
  });

  const [isSolving, setIsSolving] = useState(false);

  const handleSolve = async () => {
    setIsSolving(true);
    try {
      const res = await fetch('/api/optimise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weights })
      });
      const data = await res.json();
      setPlans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSolving(false);
    }
  };

  useEffect(() => {
    handleSolve();
  }, []);

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto font-mono text-xs select-none text-[#362419]">
      {/* Header & Weights Controls */}
      <div className="bg-[#FFFFFF] border border-[#DFD7C8] p-4 rounded-md flex flex-col gap-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#1E40AF]" />
            <h1 className="text-sm font-bold text-[#362419] uppercase tracking-wider">
              OR-TOOLS CP-SAT CONSTRAINT OPTIMISATION ENGINE
            </h1>
          </div>

          <button
            onClick={handleSolve}
            disabled={isSolving}
            className="bg-[#1E40AF] hover:bg-[#1D4ED8] disabled:opacity-50 text-[#FFFFFF] font-bold px-4 py-1.5 rounded transition-colors flex items-center gap-2 shadow-2xs"
          >
            <Zap className="w-4 h-4" />
            {isSolving ? 'Solving CP-SAT Model...' : 'Run Constraint Solver'}
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F1ECE1] p-3 rounded border border-[#DFD7C8]">
          <div>
            <div className="flex justify-between text-[10px] text-[#362419] mb-1">
              <span>Unmet Priority Weight:</span>
              <span className="font-bold text-[#1E40AF]">{weights.priorityWeight}</span>
            </div>
            <input
              type="range" min="1" max="100"
              value={weights.priorityWeight}
              onChange={(e) => setWeights({ ...weights, priorityWeight: Number(e.target.value) })}
              className="w-full accent-[#1E40AF]"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-[#362419] mb-1">
              <span>Conflict Penalty Weight:</span>
              <span className="font-bold text-red-600">{weights.conflictWeight}</span>
            </div>
            <input
              type="range" min="1" max="100"
              value={weights.conflictWeight}
              onChange={(e) => setWeights({ ...weights, conflictWeight: Number(e.target.value) })}
              className="w-full accent-red-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-[#362419] mb-1">
              <span>Lateness Penalty Weight:</span>
              <span className="font-bold text-amber-600">{weights.latenessWeight}</span>
            </div>
            <input
              type="range" min="1" max="100"
              value={weights.latenessWeight}
              onChange={(e) => setWeights({ ...weights, latenessWeight: Number(e.target.value) })}
              className="w-full accent-amber-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-[#362419] mb-1">
              <span>Reserve Shortfall Weight:</span>
              <span className="font-bold text-emerald-600">{weights.reserveWeight}</span>
            </div>
            <input
              type="range" min="1" max="100"
              value={weights.reserveWeight}
              onChange={(e) => setWeights({ ...weights, reserveWeight: Number(e.target.value) })}
              className="w-full accent-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Side-By-Side Plan Comparison (Greedy vs Optimised vs Conservative) */}
      {plans && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'greedy', plan: plans.greedy, color: 'slate' },
            { key: 'optimised', plan: plans.optimised, color: 'blue' },
            { key: 'conservative', plan: plans.conservative, color: 'emerald' }
          ].map(({ key, plan, color }) => (
            <div key={key} className={`bg-[#FFFFFF] border rounded-md p-4 flex flex-col gap-3 shadow-2xs ${
              key === 'optimised' ? 'border-[#1E40AF] ring-2 ring-[#1E40AF]/30' : 'border-[#DFD7C8]'
            }`}>
              <div className="flex items-center justify-between border-b border-[#DFD7C8] pb-2">
                <span className="font-bold text-[#362419] uppercase text-xs">
                  {plan.planName}
                </span>
                <span className="bg-[#1E40AF] text-[#FFFFFF] text-[10px] px-2 py-0.5 rounded font-bold">
                  {plan.solverStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F1ECE1] p-2 rounded">
                <div>Solve Time: <span className="font-bold text-[#362419]">{plan.solveTimeMs}ms</span></div>
                <div>Obj Value: <span className="font-bold text-[#362419]">{plan.objectiveValue}</span></div>
                <div>Coverage: <span className="font-bold text-emerald-700">{plan.requirementCoveragePct}%</span></div>
                <div>Gap %: <span className="font-bold text-[#6C584C]">{plan.optimalityGapPct}%</span></div>
              </div>

              <div className="flex flex-col gap-1 text-[11px]">
                <span className="font-bold text-[#6C584C] uppercase text-[10px]">
                  Assignments ({plan.assignments.length})
                </span>
                {plan.assignments.map(a => (
                  <div 
                    key={a.taskId}
                    onClick={() => openExplainDrawer(a.taskId)}
                    className="bg-[#F8F6F0] hover:bg-[#F1ECE1] p-2 rounded border border-[#DFD7C8] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-bold text-[#362419]">{a.taskId}</span>
                      <span className="text-[#6C584C] ml-2">→ {a.aircraftId}</span>
                    </div>
                    <span className="text-[#1E40AF] font-bold">{a.confidenceScore}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
