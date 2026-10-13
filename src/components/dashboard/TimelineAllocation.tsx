import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Clock, 
  Sliders, 
  AlertCircle, 
  CheckCircle2, 
  GripHorizontal 
} from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { FlightTask } from '../../types/index';

export const TimelineAllocation: React.FC = () => {
  const { tasks, setTasks, openExplainDrawer } = usePlannerStore();
  const [viewMode, setViewMode] = useState<'Schedule' | 'Crew' | 'Stand'>('Schedule');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [violatedTaskIds, setViolatedTaskIds] = useState<Set<string>>(new Set());

  // Hours axis: 02 AM to 24 PM (22 hours)
  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = (i * 2 + 2) % 24;
    return `${String(h).padStart(2, '0')}:00`;
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    // Simulate constraint check on drop: If shifted past 18:00, trigger simulated violation
    if (targetIndex > 7) {
      setViolatedTaskIds(prev => new Set(prev).add(draggedTaskId));
    } else {
      setViolatedTaskIds(prev => {
        const next = new Set(prev);
        next.delete(draggedTaskId);
        return next;
      });
    }

    setDraggedTaskId(null);
  };

  return (
    <div className="bg-[#111B2E] border border-[#1E2A44] rounded-md p-3 flex flex-col gap-2 shadow-md">
      {/* Panel Header & Controls */}
      <div className="flex items-center justify-between border-b border-[#1E2A44] pb-2">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            TIMELINE & RESOURCE ALLOCATION
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-[#0A1020] px-2 py-0.5 rounded border border-[#1E2A44]">
            Next 24 hours
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Dropdown to switch grouping */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="bg-[#0A1020] border border-[#1E2A44] text-slate-300 text-xs px-2 py-1 rounded focus:ring-0 font-medium"
          >
            <option value="Schedule">Flight Schedule</option>
            <option value="Crew">Crew Assignments</option>
            <option value="Stand">Stand Allocation</option>
          </select>

          <button className="text-slate-400 hover:text-white p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gantt Area */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px] flex flex-col gap-1.5 text-xs select-none">
          {/* Time Header Axis */}
          <div className="grid grid-cols-12 gap-1 border-b border-[#1E2A44] pb-1 text-[10px] font-mono text-slate-400">
            <div className="col-span-3 font-semibold text-slate-300 uppercase">Task / Resource</div>
            {hours.map((h, i) => (
              <div key={i} className="text-center font-mono">{h}</div>
            ))}
          </div>

          {/* Rows */}
          {tasks.map((task, idx) => {
            const hasViolation = violatedTaskIds.has(task.id);

            // Bar positioning calculation
            const startCol = ((idx * 2) % 6) + 4; // Start column index 4 to 9
            const colSpan = 3;

            return (
              <div
                key={task.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, idx)}
                className={`grid grid-cols-12 gap-1 items-center p-1.5 rounded transition-colors ${
                  hasViolation ? 'bg-red-950/30 border border-red-800/80' : 'bg-[#0D1526] hover:bg-[#15223A] border border-[#1E2A44]/50'
                }`}
              >
                {/* Left Columns: Task + Status */}
                <div 
                  className="col-span-3 flex items-center justify-between pr-2 cursor-pointer"
                  onClick={() => openExplainDrawer(task.id)}
                >
                  <div className="flex flex-col truncate">
                    <span className="font-bold text-white font-mono flex items-center gap-1 truncate">
                      {task.id}
                      <span className="text-[9px] text-slate-400 font-normal">({task.assignedAircraftId || 'AX-101'})</span>
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">{task.name}</span>
                  </div>

                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    task.status === 'On Time' ? 'bg-emerald-500/20 text-emerald-400' :
                    task.status === 'En Route' ? 'bg-blue-500/20 text-blue-400' :
                    task.status === 'Delayed' ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {task.status}
                  </span>
                </div>

                {/* Timeline Bar Area */}
                <div className="col-span-9 grid grid-cols-9 gap-1 relative h-7 items-center">
                  {/* Vertical Orange NOW line */}
                  <div className="absolute top-0 bottom-0 left-[35%] w-0.5 bg-amber-500 z-10 shadow-[0_0_8px_rgba(245,158,11,0.8)] pointer-events-none" />

                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    style={{ gridColumnStart: startCol, gridColumnEnd: `span ${colSpan}` }}
                    className={`h-6 rounded px-2 flex items-center justify-between text-[10px] font-mono font-semibold cursor-grab active:cursor-grabbing shadow transition-transform hover:scale-[1.01] ${
                      hasViolation
                        ? 'bg-red-600/80 text-white border-2 border-red-400 animate-pulse'
                        : task.status === 'En Route'
                        ? 'bg-blue-600 text-white border border-blue-400'
                        : task.status === 'Delayed'
                        ? 'bg-amber-600 text-white border border-amber-400'
                        : 'bg-emerald-700 text-white border border-emerald-500'
                    }`}
                  >
                    <span className="truncate flex items-center gap-1">
                      <GripHorizontal className="w-3 h-3 opacity-60" />
                      {task.originBase.split(' ')[0]} → {task.destBase.split(' ')[0]}
                    </span>
                    {hasViolation && <AlertCircle className="w-3.5 h-3.5 text-white shrink-0" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
