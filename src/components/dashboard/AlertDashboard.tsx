import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Fuel, 
  Clock, 
  Flame,
  SlidersHorizontal
} from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { Alert } from '../../types/index';

export const AlertDashboard: React.FC = () => {
  const { 
    alerts, 
    openExplainDrawer, 
    setSelectedAlert,
    setAlertSettingsModalOpen,
    alertThresholds 
  } = usePlannerStore();

  const [activeCategory, setActiveCategory] = useState<'ALL' | 'OPERATIONAL' | 'FUEL' | 'CONFLICT'>('ALL');

  const filterAlerts = (alert: Alert) => {
    if (activeCategory === 'ALL') return true;
    const text = (alert.title + ' ' + alert.message).toLowerCase();
    if (activeCategory === 'FUEL') {
      return text.includes('fuel') || text.includes('burn') || text.includes('efficiency') || text.includes('drag');
    }
    if (activeCategory === 'CONFLICT') {
      return text.includes('conflict') || text.includes('stand') || text.includes('overlap') || text.includes('airway') || text.includes('delay');
    }
    if (activeCategory === 'OPERATIONAL') {
      return text.includes('weather') || text.includes('maintenance') || text.includes('closed') || text.includes('sortie') || text.includes('time');
    }
    return true;
  };

  const filteredAlerts = alerts.filter(filterAlerts);

  const fallbackAlerts: Alert[] = [
    {
      id: 'ALT-101',
      severity: 'CRITICAL',
      title: 'Runway Closure - Dunmere Station',
      message: `Active cell IFR weather (ceiling < ${alertThresholds.weatherCeilingThresholdFt}ft) forced immediate closure of Runway 09R. 3 inbound sorties rerouting.`,
      timeAgo: '2m ago',
      timestamp: new Date().toISOString(),
      location: 'Dunmere Station',
      isAcknowledged: false,
      provenance: 'CONFIRMED',
      taskId: 'ULA-3280'
    },
    {
      id: 'ALT-102',
      severity: 'WARNING',
      title: 'Suboptimal Cruise Altitude Fuel Burn',
      message: `Sortie AX-102 flying FL180 vs optimal FL320. Fuel burn rate elevated by +${alertThresholds.suboptimalAltitudeBurnPct}%.`,
      timeAgo: '5m ago',
      timestamp: new Date().toISOString(),
      location: 'Corvin Sector Z2',
      isAcknowledged: false,
      provenance: 'FORECAST',
      taskId: 'ULA-3281'
    },
    {
      id: 'ALT-103',
      severity: 'WARNING',
      title: 'Gate Stand Overlap Conflict - Stand B4',
      message: `AX-104 turnaround overrun leaves < ${alertThresholds.standOverlapMarginMins} min gap before arrival of AX-101 on Stand B4.`,
      timeAgo: '12m ago',
      timestamp: new Date().toISOString(),
      location: 'Aldermoor Base',
      isAcknowledged: false,
      provenance: 'ASSUMED',
      taskId: 'ULA-3282'
    }
  ];

  const combinedAlerts = filteredAlerts.length > 0 ? filteredAlerts : fallbackAlerts;
  const unackCount = alerts.filter(a => !a.isAcknowledged).length;

  return (
    <div className="bg-[#0B132B] border border-[#1E3A8A]/60 rounded-md p-2.5 flex flex-col gap-2 shadow-lg select-none text-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E3A8A]/50 pb-1.5">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
          <span className="text-[10.5px] font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            OPERATIONAL ALERT DASHBOARD
          </span>
          <span className="bg-[#2563EB] text-[#FFFFFF] font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs border border-[#3B82F6]/40">
            {unackCount > 0 ? `${unackCount} ACTIVE` : '3 DETECTED'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setAlertSettingsModalOpen(true)}
            className="px-1.5 py-0.5 rounded text-[#93C5FD] hover:text-[#FFFFFF] hover:bg-[#1E3A8A]/60 transition-colors flex items-center gap-1 font-mono text-[9.5px] border border-[#1E3A8A]/60 bg-[#101F3C]"
            title="Configure Alert Thresholds"
          >
            <SlidersHorizontal className="w-3 h-3 text-[#38BDF8]" />
            <span className="inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills Bar */}
      <div className="grid grid-cols-4 gap-1 text-[9.5px] font-mono bg-[#101F3C] p-0.5 rounded border border-[#1E3A8A]/60">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`py-0.5 px-1 rounded text-center font-bold transition-all ${
            activeCategory === 'ALL'
              ? 'bg-[#2563EB] text-[#FFFFFF] shadow-2xs border border-[#3B82F6]/50'
              : 'text-[#93C5FD] hover:text-[#FFFFFF] hover:bg-[#172A4D]'
          }`}
        >
          ALL ({alerts.length || 3})
        </button>
        <button
          onClick={() => setActiveCategory('OPERATIONAL')}
          className={`py-0.5 px-1 rounded text-center font-bold flex items-center justify-center gap-1 transition-all ${
            activeCategory === 'OPERATIONAL'
              ? 'bg-[#2563EB] text-[#FFFFFF] shadow-2xs border border-[#3B82F6]/50'
              : 'text-[#93C5FD] hover:text-[#FFFFFF] hover:bg-[#172A4D]'
          }`}
        >
          <Clock className="w-2.5 h-2.5" />
          <span>OPS</span>
        </button>
        <button
          onClick={() => setActiveCategory('FUEL')}
          className={`py-0.5 px-1 rounded text-center font-bold flex items-center justify-center gap-1 transition-all ${
            activeCategory === 'FUEL'
              ? 'bg-[#2563EB] text-[#FFFFFF] shadow-2xs border border-[#3B82F6]/50'
              : 'text-[#93C5FD] hover:text-[#FFFFFF] hover:bg-[#172A4D]'
          }`}
        >
          <Fuel className="w-2.5 h-2.5" />
          <span>FUEL</span>
        </button>
        <button
          onClick={() => setActiveCategory('CONFLICT')}
          className={`py-0.5 px-1 rounded text-center font-bold flex items-center justify-center gap-1 transition-all ${
            activeCategory === 'CONFLICT'
              ? 'bg-[#2563EB] text-[#FFFFFF] shadow-2xs border border-[#3B82F6]/50'
              : 'text-[#93C5FD] hover:text-[#FFFFFF] hover:bg-[#172A4D]'
          }`}
        >
          <Flame className="w-2.5 h-2.5" />
          <span>CONFLICT</span>
        </button>
      </div>

      {/* Alert Scrollable Card Container */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[190px] pr-0.5 custom-scrollbar">
        {combinedAlerts.map((alert) => {
          return (
            <div
              key={alert.id}
              onClick={() => {
                setSelectedAlert(alert);
                openExplainDrawer(alert.taskId || 'ULA-3280');
              }}
              className="p-2 rounded-md border text-xs cursor-pointer transition-all hover:translate-x-0.5 shadow-xs bg-[#101F3C] border-[#1E3A8A]/60 text-[#F8FAFC] hover:bg-[#172A4D] hover:border-[#3B82F6]/60 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 font-bold truncate min-w-0">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                  <span className="truncate text-[#F8FAFC] text-[11px]">{alert.title}</span>
                </div>
                <span className="text-[9px] font-mono text-[#93C5FD] font-bold shrink-0 bg-[#0B132B] px-1.5 py-0.5 rounded border border-[#1E3A8A]">
                  {alert.timeAgo}
                </span>
              </div>

              <p className="text-[10.5px] text-[#93C5FD]/90 line-clamp-2 leading-tight font-medium">
                {alert.message}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-[#1E3A8A]/50 text-[9.5px] text-[#94A3B8] font-mono">
                <span className="flex items-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shrink-0" />
                  <span className="truncate text-[#93C5FD]">{alert.location}</span>
                </span>
                <span className="text-[#60A5FA] font-bold hover:underline flex items-center gap-0.5 shrink-0 ml-2">
                  Explain & Resolve →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
