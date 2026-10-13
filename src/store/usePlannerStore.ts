import { create } from 'zustand';
import { 
  Aircraft, 
  Alert, 
  AuditLogEntry, 
  FlightTask, 
  OptimizationResult, 
  RampStand, 
  WeatherZone 
} from '../types/index.js';

export type PageName = 'dashboard' | 'fleet' | 'schedule' | 'weather' | 'reports' | 'admin';
export type UserRole = 'Planner' | 'Commander' | 'Admin';

export interface AlertThresholdSettings {
  minFuelReservePct: number;
  suboptimalAltitudeBurnPct: number;
  standOverlapMarginMins: number;
  conflictRadiusNmi: number;
  weatherCeilingThresholdFt: number;
  autoResolveMinorAlerts: boolean;
}

interface MapLayers {
  routes: boolean;
  disruptionZones: boolean;
  weather: boolean;
  congestion: boolean;
  baseCapacity: boolean;
  restricted: boolean;
}

interface AircraftPositionUpdate {
  id: string;
  lat: number;
  lng: number;
  heading?: number;
  altitude?: number;
  speed?: number;
}

interface PlannerState {
  activePage: PageName;
  setActivePage: (page: PageName) => void;

  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;

  simTime: string;
  simDateStr: string;
  isSimPaused: boolean;
  simSpeed: number;
  setSimSpeed: (speed: number) => void;
  toggleSimPause: () => void;
  jumpSimTime: (minutes: number) => void;
  updateSimTimeFromWS: (isoString: string) => void;

  fleet: Aircraft[];
  tasks: FlightTask[];
  alerts: Alert[];
  weatherZones: WeatherZone[];
  stands: RampStand[];
  auditLogs: AuditLogEntry[];
  
  setFleet: (fleet: Aircraft[]) => void;
  setTasks: (tasks: FlightTask[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setWeatherZones: (weather: WeatherZone[]) => void;
  setStands: (stands: RampStand[]) => void;

  selectedAircraft: Aircraft | null;
  setSelectedAircraft: (aircraft: Aircraft | null) => void;

  selectedTask: FlightTask | null;
  setSelectedTask: (task: FlightTask | null) => void;

  selectedAlert: Alert | null;
  setSelectedAlert: (alert: Alert | null) => void;

  explainDrawerOpen: boolean;
  explainTaskId: string | null;
  openExplainDrawer: (taskId: string) => void;
  closeExplainDrawer: () => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  alertSettingsModalOpen: boolean;
  setAlertSettingsModalOpen: (open: boolean) => void;

  alertThresholds: AlertThresholdSettings;
  updateAlertThresholds: (settings: Partial<AlertThresholdSettings>) => void;

  mapLayers: MapLayers;
  toggleMapLayer: (layer: keyof MapLayers) => void;

  activePlan: OptimizationResult | null;
  setActivePlan: (plan: OptimizationResult | null) => void;

  selectedBaseFilter: string | null;
  setSelectedBaseFilter: (base: string | null) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  notificationsCount: number;
  fetchInitialData: () => Promise<void>;
  updateAircraftPosition: (positions: AircraftPositionUpdate[]) => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page }),

  activeRole: 'Planner',
  setActiveRole: (role) => set({ activeRole: role }),

  simTime: '14:35:10 UTC',
  simDateStr: '10 MAY 2024',
  isSimPaused: false,
  simSpeed: 1,

  setSimSpeed: (speed) => set({ simSpeed: speed }),
  toggleSimPause: () => set((state) => ({ isSimPaused: !state.isSimPaused })),

  jumpSimTime: (minutes) => {
    // Notify server via WS or API
    const ws = (window as any).__AEROFLOW_WS__;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'JUMP_TIME', minutes }));
    } else {
      fetch('/api/admin/sim-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jumpMinutes: minutes })
      }).catch(console.error);
    }
  },

  updateSimTimeFromWS: (isoString) => {
    try {
      const date = new Date(isoString);
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const mins = String(date.getUTCMinutes()).padStart(2, '0');
      const secs = String(date.getUTCSeconds()).padStart(2, '0');
      const timeStr = `${hours}:${mins}:${secs} UTC`;
      
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const dateStr = `${date.getUTCDate()} ${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

      set({ simTime: timeStr, simDateStr: dateStr });
    } catch (e) {
      // Fallback
    }
  },

  fleet: [],
  tasks: [],
  alerts: [],
  weatherZones: [],
  stands: [],
  auditLogs: [],

  setFleet: (fleet) => set({ fleet }),
  setTasks: (tasks) => set({ tasks }),
  setAlerts: (alerts) => set({ alerts }),
  setWeatherZones: (weatherZones) => set({ weatherZones }),
  setStands: (stands) => set({ stands }),

  selectedAircraft: null,
  setSelectedAircraft: (aircraft) => set({ selectedAircraft: aircraft }),

  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task }),

  selectedAlert: null,
  setSelectedAlert: (alert) => set({ selectedAlert: alert }),

  explainDrawerOpen: false,
  explainTaskId: null,
  openExplainDrawer: (taskId) => set({ explainDrawerOpen: true, explainTaskId: taskId }),
  closeExplainDrawer: () => set({ explainDrawerOpen: false, explainTaskId: null }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  alertSettingsModalOpen: false,
  setAlertSettingsModalOpen: (open) => set({ alertSettingsModalOpen: open }),

  alertThresholds: {
    minFuelReservePct: 20,
    suboptimalAltitudeBurnPct: 15,
    standOverlapMarginMins: 15,
    conflictRadiusNmi: 15,
    weatherCeilingThresholdFt: 1000,
    autoResolveMinorAlerts: false
  },

  updateAlertThresholds: (settings) => set((state) => ({
    alertThresholds: { ...state.alertThresholds, ...settings }
  })),

  mapLayers: {
    routes: true,
    disruptionZones: true,
    weather: true,
    congestion: true,
    baseCapacity: true,
    restricted: true
  },

  toggleMapLayer: (layer) => set((state) => ({
    mapLayers: { ...state.mapLayers, [layer]: !state.mapLayers[layer] }
  })),

  activePlan: null,
  setActivePlan: (plan) => set({ activePlan: plan }),

  selectedBaseFilter: null,
  setSelectedBaseFilter: (base) => set({ selectedBaseFilter: base }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  notificationsCount: 3,

  fetchInitialData: async () => {
    try {
      const [fleetRes, tasksRes, alertsRes, wxRes, standsRes, auditRes] = await Promise.all([
        fetch('/api/fleet').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json()),
        fetch('/api/weather').then(r => r.json()),
        fetch('/api/stands').then(r => r.json()),
        fetch('/api/audit').then(r => r.json())
      ]);

      set({
        fleet: fleetRes,
        tasks: tasksRes,
        alerts: alertsRes,
        weatherZones: wxRes,
        stands: standsRes,
        auditLogs: auditRes,
        notificationsCount: alertsRes.filter((a: Alert) => !a.isAcknowledged).length
      });
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    }
  },

  updateAircraftPosition: (positions) => set((state) => {
    const posMap = new Map(positions.map(p => [p.id, p]));
    const updatedFleet = state.fleet.map(aircraft => {
      const updated = posMap.get(aircraft.id);
      if (updated) {
        return {
          ...aircraft,
          position: { lat: updated.lat, lng: updated.lng },
          heading: updated.heading !== undefined ? updated.heading : aircraft.heading,
          altitude: updated.altitude !== undefined ? updated.altitude : aircraft.altitude,
          speed: updated.speed !== undefined ? updated.speed : aircraft.speed
        };
      }
      return aircraft;
    });
    return { fleet: updatedFleet };
  })
}));
