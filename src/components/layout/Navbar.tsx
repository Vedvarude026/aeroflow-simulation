import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  Bell, 
  ChevronDown, 
  ShieldAlert, 
  CheckCircle2, 
  Zap,
  Navigation,
  Shield,
  AlertTriangle,
  CheckCheck,
  ExternalLink,
  Clock,
  Info,
  UserCheck,
  Lock,
  Sliders
} from 'lucide-react';
import { usePlannerStore, UserRole } from '../../store/usePlannerStore';

interface RoleProfile {
  name: string;
  initials: string;
  title: string;
  clearance: string;
  scope: string;
  badgeColor: string;
  avatarBg: string;
  textColor: string;
}

const ROLE_PROFILES: Record<UserRole, RoleProfile> = {
  Planner: {
    name: 'J. SMITH',
    initials: 'JS',
    title: 'Sr Operations Planner',
    clearance: 'TS/SCI Operational',
    scope: 'CP-SAT Solver & Timelines',
    badgeColor: 'border-[#7C6354] bg-[#4A3B32] text-[#E8DFD8]',
    avatarBg: 'bg-[#5C493E] text-[#FFFFFF] font-bold',
    textColor: 'text-[#F8F6F0]'
  },
  Commander: {
    name: 'GEN. R. VANCE',
    initials: 'RV',
    title: 'Wing Commander',
    clearance: 'Level 5 Command Auth',
    scope: 'Sortie Directives & Approvals',
    badgeColor: 'border-[#3B5B75] bg-[#273B4D] text-[#E0ECF8]',
    avatarBg: 'bg-[#2B4357] text-[#F8FAFC] font-bold',
    textColor: 'text-[#F8FAFC]'
  },
  Admin: {
    name: 'M. TAYLOR',
    initials: 'MT',
    title: 'SecOps Administrator',
    clearance: 'Root SecOps Admin',
    scope: 'Data Stream & Audit Governance',
    badgeColor: 'border-[#4B6154] bg-[#314238] text-[#E1EFE6]',
    avatarBg: 'bg-[#3A4F43] text-[#F8FAFC] font-bold',
    textColor: 'text-[#F8FAFC]'
  }
};

export const Navbar: React.FC = () => {
  const { 
    activeRole, 
    setActiveRole, 
    notificationsCount, 
    searchQuery, 
    setSearchQuery,
    setCommandPaletteOpen,
    alerts,
    setSelectedAlert,
    setActivePage
  } = usePlannerStore();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readAlertIds, setReadAlertIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const currentProfile = ROLE_PROFILES[activeRole];

  // Derive unread alerts based on acknowledged state and locally marked read
  const unreadAlerts = alerts.filter(a => !a.isAcknowledged && !readAlertIds.has(a.id));
  const effectiveCount = Math.max(0, unreadAlerts.length);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    const allIds = new Set(alerts.map(a => a.id));
    setReadAlertIds(allIds);
  };

  const markSingleAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReadAlertIds(prev => new Set([...prev, id]));
  };

  const handleRoleSelect = (roleKey: UserRole) => {
    setActiveRole(roleKey);
    setRoleMenuOpen(false);
    const selectedProf = ROLE_PROFILES[roleKey];
    setToastMessage(`Switched active profile: ${selectedProf.name} (${selectedProf.title})`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <header className="bg-white border-b border-[#E5E0D8] px-4 h-14 flex items-center justify-between gap-4 select-none shadow-xs text-[#23201D] relative">
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="absolute top-16 right-4 bg-[#23201D] text-[#F8F6F0] border border-[#5C493E] text-xs px-3 py-2 rounded-md shadow-xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <UserCheck className="w-4 h-4 text-[#8BAE93]" />
          <span className="font-mono">{toastMessage}</span>
        </div>
      )}

      {/* Brand Zone in Clean White Theme */}
      <div 
        onClick={() => setActivePage('dashboard')}
        className="flex items-center gap-3 shrink-0 cursor-pointer group"
      >
        {/* New Attractive Aerospace Emblem Logo */}
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B4357] via-[#4A3B32] to-[#1C1917] p-[1.5px] shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-[#FFFFFF] via-[#F8F6F0] to-[#EAE4DC] rounded-[10.5px] flex items-center justify-center relative overflow-hidden border border-[#DCD3C7]">
            {/* Radar / Grid texture overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#2B4357_1px,transparent_1px)] [background-size:5px_5px] opacity-20" />
            
            {/* Aerodynamic shimmer aura */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-[#2B4357]/20 via-transparent to-[#4A3B32]/30 opacity-70 group-hover:opacity-100 transition-opacity blur-[1px]" />

            {/* Jet Wing Vector Emblem */}
            <svg 
              className="w-5 h-5 text-[#2B4357] transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300 drop-shadow-xs relative z-10" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Supersonic Aircraft Wing Contour */}
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.7 5.2c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
            </svg>

            {/* Aerodynamic Airflow Streaks */}
            <div className="absolute top-1 left-1.5 w-2 h-[2px] bg-[#4A3B32] rounded-full opacity-50 group-hover:w-3.5 transition-all duration-300" />
            <div className="absolute bottom-1 right-2 w-1.5 h-[1.5px] bg-[#2B4357] rounded-full opacity-60 group-hover:w-2.5 transition-all duration-300" />

            {/* Live Status Pulse Dot */}
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#8BAE93] ring-1 ring-white animate-ping opacity-75" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#3A4F43] ring-1 ring-white" />
          </div>
        </div>

        <div className="flex flex-col leading-none">
          <span className="font-black text-base tracking-[0.2em] text-[#23201D] group-hover:text-[#2B4357] transition-all">
            AEROFLOW
          </span>
        </div>
      </div>

      {/* Right Zone: Search, Bell, Role Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search Bar */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 bg-[#F5F2EB] border border-[#E0D9CE] hover:border-[#5C493E] text-[#23201D] px-3 py-1.5 rounded-md text-xs transition-colors w-48 shadow-inner cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 shrink-0 text-[#5C493E]" />
          <span className="truncate flex-1 text-left text-[#4A413A] font-mono">
            {searchQuery || 'Search flight or asset...'}
          </span>
          <kbd className="bg-[#E8E2D5] text-[#4A3B32] text-[10px] px-1.5 py-0.5 rounded font-mono border border-[#D5C9B8]">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Bell */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setRoleMenuOpen(false);
            }}
            aria-label="Toggle System Notifications"
            className={`w-8 h-8 rounded-md bg-[#F5F2EB] border ${
              notificationsOpen ? 'border-[#5C493E] bg-[#E8E2D5]' : 'border-[#E0D9CE]'
            } hover:bg-[#E8E2D5] hover:border-[#5C493E] flex items-center justify-center text-[#23201D] relative transition-colors cursor-pointer`}
          >
            <Bell className="w-4 h-4 text-[#4A3B32]" />
            {effectiveCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#8B261D] text-[#FFFFFF] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {effectiveCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E0D9CE] rounded-lg shadow-2xl z-50 overflow-hidden font-sans text-xs">
              {/* Header */}
              <div className="p-3 bg-[#F5F2EB] border-b border-[#E0D9CE] flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#23201D]">
                  <ShieldAlert className="w-4 h-4 text-[#8B261D]" />
                  <span>System Alerts & Directives</span>
                  {effectiveCount > 0 && (
                    <span className="bg-[#8B261D] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                      {effectiveCount} new
                    </span>
                  )}
                </div>
                {effectiveCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-mono text-[#5C493E] hover:text-[#23201D] flex items-center gap-1 font-semibold underline cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[#F0EBE1]">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-[#7C6354] font-mono">
                    <CheckCircle2 className="w-6 h-6 text-[#3A4F43] mx-auto mb-1.5 opacity-80" />
                    No active system alerts. All operational status normal.
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const isRead = alert.isAcknowledged || readAlertIds.has(alert.id);
                    const severityColors = {
                      CRITICAL: 'border-l-4 border-l-[#8B261D] bg-[#FDF2F0]/60',
                      WARNING: 'border-l-4 border-l-[#B46A25] bg-[#FFF8EE]/60',
                      INFO: 'border-l-4 border-l-[#2B4357] bg-[#F2F7FA]/60',
                      RESOLVED: 'border-l-4 border-l-[#3A4F43] bg-[#F2F7F4]/60'
                    };

                    const badgeColors = {
                      CRITICAL: 'bg-[#8B261D] text-white',
                      WARNING: 'bg-[#B46A25] text-white',
                      INFO: 'bg-[#2B4357] text-white',
                      RESOLVED: 'bg-[#3A4F43] text-white'
                    };

                    return (
                      <div
                        key={alert.id}
                        onClick={() => {
                          setSelectedAlert(alert);
                          setActivePage('dashboard');
                          setNotificationsOpen(false);
                        }}
                        className={`p-3 transition-colors hover:bg-[#F5F2EB] cursor-pointer relative ${
                          severityColors[alert.severity as keyof typeof severityColors] || 'bg-white'
                        } ${isRead ? 'opacity-60' : 'opacity-100'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              badgeColors[alert.severity as keyof typeof badgeColors] || 'bg-gray-700 text-white'
                            }`}>
                              {alert.severity}
                            </span>
                            <span className="font-bold text-[#23201D] text-xs">
                              {alert.title || 'Alert'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-[#7C6354] font-mono shrink-0">
                            <Clock className="w-3 h-3" />
                            <span>{alert.timestamp || '14:35 UTC'}</span>
                            {!isRead && (
                              <button
                                onClick={(e) => markSingleAsRead(alert.id, e)}
                                title="Mark as read"
                                className="p-0.5 hover:bg-[#E8E2D5] rounded text-[#4A3B32]"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-[#3E3833] mt-1 font-sans leading-snug">
                          {alert.message}
                        </p>

                        {alert.aircraftId && (
                          <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-[#5C493E]">
                            <span className="bg-[#E8E2D5] px-1.5 py-0.2 rounded font-semibold">
                              Asset: {alert.aircraftId}
                            </span>
                            {alert.recommendedAction && (
                              <span className="truncate italic">
                                Action: {alert.recommendedAction}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2 bg-[#F5F2EB] border-t border-[#E0D9CE] flex items-center justify-between text-[11px] font-mono">
                <button
                  onClick={() => {
                    setActivePage('dashboard');
                    setNotificationsOpen(false);
                  }}
                  className="text-[#5C493E] hover:text-[#23201D] font-bold flex items-center gap-1 px-2 py-1 rounded hover:bg-[#E8E2D5] transition-colors"
                >
                  View Operational Overview
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[#7C6354] hover:text-[#23201D] px-2 py-1"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher & Profile Dropdown */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => {
              setRoleMenuOpen(!roleMenuOpen);
              setNotificationsOpen(false);
            }}
            aria-expanded={roleMenuOpen}
            aria-haspopup="true"
            title="Personnel Profile & Security Clearance Switcher"
            className={`flex items-center gap-2.5 bg-[#F5F2EB] border ${
              roleMenuOpen ? 'border-[#5C493E] bg-[#E8E2D5] ring-2 ring-[#5C493E]/20' : 'border-[#E0D9CE]'
            } hover:bg-[#E8E2D5] hover:border-[#5C493E] px-2.5 py-1.5 rounded-md text-xs text-[#23201D] transition-all shadow-xs cursor-pointer active:scale-98`}
          >
            <div className={`w-7 h-7 rounded-md ${currentProfile.avatarBg} flex items-center justify-center font-bold text-xs shadow-xs transition-transform group-hover:scale-105`}>
              {currentProfile.initials}
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="font-bold text-[#23201D] text-xs flex items-center gap-1.5">
                <span>{currentProfile.name}</span>
                <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${currentProfile.badgeColor}`}>
                  {activeRole}
                </span>
              </div>
              <div className="text-[9.5px] text-[#5C493E] font-mono truncate max-w-[130px] mt-0.5 font-semibold">
                {currentProfile.title}
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#5C493E] ml-0.5 transition-transform duration-200 ${roleMenuOpen ? 'rotate-180 text-[#23201D]' : ''}`} />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-[#1C1917] border border-[#3E3833] rounded-md shadow-2xl py-1.5 z-50 select-text animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-mono text-[#C9B19C] font-bold uppercase tracking-wider border-b border-[#3E3833] flex items-center justify-between">
                <span>Active Personnel Profile</span>
                <Shield className="w-3.5 h-3.5 text-[#8BAE93]" />
              </div>

              {/* Active Profile Scope Detail */}
              <div className="px-3 py-2 bg-[#23201D] border-b border-[#3E3833] text-[10px] font-mono flex flex-col gap-1">
                <div className="text-[#F8F6F0] font-bold flex items-center justify-between">
                  <span>Scope:</span>
                  <span className="text-[#D8CEB9] font-normal">{currentProfile.scope}</span>
                </div>
                <div className="text-[#A89F91] flex items-center justify-between">
                  <span>Auth Level:</span>
                  <span className="text-[#C9B19C] font-bold">{currentProfile.clearance}</span>
                </div>
              </div>

              <div className="px-3 py-1.5 text-[9px] font-mono text-[#A89F91] uppercase tracking-wider">
                Switch Role Profile (RBAC):
              </div>

              <div className="divide-y divide-[#2D2824]">
                {(Object.keys(ROLE_PROFILES) as UserRole[]).map((roleKey) => {
                  const profile = ROLE_PROFILES[roleKey];
                  const isActive = activeRole === roleKey;

                  return (
                    <button
                      key={roleKey}
                      onClick={() => handleRoleSelect(roleKey)}
                      className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-[#2D2824] transition-colors cursor-pointer ${
                        isActive ? 'bg-[#3E3833]/80 text-[#C9B19C]' : 'text-[#E8DFD8]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded ${profile.avatarBg} flex items-center justify-center font-bold text-[10px] shrink-0`}>
                          {profile.initials}
                        </div>
                        <div className="leading-tight">
                          <div className="font-bold text-xs text-[#F8F6F0] flex items-center gap-1.5">
                            <span>{profile.name}</span>
                            <span className="text-[9px] font-mono text-[#A89F91] font-normal">
                              ({roleKey})
                            </span>
                          </div>
                          <div className="text-[9.5px] text-[#C9B19C] font-mono mt-0.5">
                            {profile.title}
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <div className="flex items-center gap-1 text-[#8BAE93]">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Navigation / Admin Action Footer */}
              <div className="p-2 mt-1 border-t border-[#3E3833] bg-[#141211] flex items-center justify-between text-[10px] font-mono">
                <button
                  onClick={() => {
                    setActivePage('admin');
                    setRoleMenuOpen(false);
                  }}
                  className="text-[#C9B19C] hover:text-[#FFFFFF] flex items-center gap-1 font-bold px-2 py-1 rounded hover:bg-[#2D2824] transition-colors cursor-pointer"
                >
                  <Sliders className="w-3 h-3 text-[#8BAE93]" />
                  System Governance
                </button>
                <button
                  onClick={() => setRoleMenuOpen(false)}
                  className="text-[#8A8175] hover:text-[#E8DFD8] px-2 py-1 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
