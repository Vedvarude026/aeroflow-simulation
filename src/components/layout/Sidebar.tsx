import React from 'react';
import { 
  Home, 
  List, 
  Activity, 
  Package, 
  MessageSquare, 
  Settings 
} from 'lucide-react';
import { usePlannerStore, PageName } from '../../store/usePlannerStore';

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage } = usePlannerStore();

  const mainIcons: { id: PageName; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'fleet', label: 'Fleet Roster', icon: List },
    { id: 'weather', label: 'Weather Telemetry', icon: Activity },
    { id: 'reports', label: 'KPI Reports', icon: Package },
  ];

  return (
    <aside className="w-12 bg-[#FFFFFF] border-r border-[#DFD7C8] flex flex-col items-center py-3 justify-between shrink-0 select-none shadow-2xs">
      <div className="flex flex-col items-center gap-3">
        {mainIcons.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors relative group ${
                isActive
                  ? 'bg-[#1E40AF] text-[#FFFFFF] shadow-xs font-bold'
                  : 'text-[#6C584C] hover:text-[#362419] hover:bg-[#F1ECE1]'
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4" />
              {/* Tooltip */}
              <div className="absolute left-12 bg-[#FFFFFF] text-[#362419] text-xs px-2 py-1 rounded shadow-md border border-[#DFD7C8] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3">
        <button 
          onClick={() => setActivePage('reports')}
          className="w-8 h-8 rounded-md flex items-center justify-center text-[#6C584C] hover:text-[#362419] hover:bg-[#F1ECE1] transition-colors group relative"
          title="Grounded Ask Planner"
        >
          <MessageSquare className="w-4 h-4" />
          <div className="absolute left-12 bg-[#FFFFFF] text-[#362419] text-xs px-2 py-1 rounded shadow-md border border-[#DFD7C8] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Ask the Planner
          </div>
        </button>

        <button 
          onClick={() => setActivePage('admin')}
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors group relative ${
            activePage === 'admin' 
              ? 'bg-[#1E40AF] text-[#FFFFFF] shadow-xs font-bold' 
              : 'text-[#6C584C] hover:text-[#362419] hover:bg-[#F1ECE1]'
          }`}
          title="System Settings & Admin"
        >
          <Settings className="w-4 h-4" />
          <div className="absolute left-12 bg-[#FFFFFF] text-[#362419] text-xs px-2 py-1 rounded shadow-md border border-[#DFD7C8] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Admin Settings
          </div>
        </button>
      </div>
    </aside>
  );
};
