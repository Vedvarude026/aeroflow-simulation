import React from 'react';
import { MoreHorizontal, AlertOctagon, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';

export const ActiveAlerts: React.FC = () => {
  const { alerts, openExplainDrawer, setSelectedAlert } = usePlannerStore();

  return (
    <div className="bg-[#FFFFFF] border border-[#DFD7C8] rounded-md p-3 flex flex-col gap-2 shadow-2xs flex-1 min-h-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#DFD7C8] pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#362419] uppercase tracking-wider">
            ACTIVE ALERTS
          </span>
          <span className="bg-[#1E40AF]/10 text-[#1E40AF] font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#1E40AF]/30">
            {alerts.filter(a => !a.isAcknowledged).length} ACTIVE
          </span>
        </div>
        <button className="text-[#6C584C] hover:text-[#362419] p-1">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Alert Cards List */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[380px] pr-1">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isWarning = alert.severity === 'WARNING';

          return (
            <div
              key={alert.id}
              onClick={() => {
                setSelectedAlert(alert);
                if (alert.taskId) {
                  openExplainDrawer(alert.taskId);
                } else {
                  openExplainDrawer('ULA-3280');
                }
              }}
              className={`p-2.5 rounded border text-xs cursor-pointer transition-all hover:translate-x-1 ${
                isCritical
                  ? 'bg-red-50 border-red-200 text-red-900 hover:bg-red-100'
                  : isWarning
                  ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                  : 'bg-[#F1ECE1] border-[#DFD7C8] text-[#362419] hover:bg-[#EAE3D5]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold truncate">
                  {isCritical ? (
                    <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-[#1E40AF] shrink-0" />
                  )}
                  <span className="truncate">{alert.title}</span>
                </div>
                <span className="text-[10px] font-mono text-[#6C584C] shrink-0">
                  {alert.timeAgo}
                </span>
              </div>

              <p className="text-[11px] text-[#362419]/90 mt-1 line-clamp-2 leading-tight">
                {alert.message}
              </p>

              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#DFD7C8] text-[10px] text-[#6C584C] font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF]" />
                  {alert.location}
                </span>
                <span className="text-[#1E40AF] hover:underline flex items-center gap-0.5 font-bold">
                  Explain & Resolve <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
