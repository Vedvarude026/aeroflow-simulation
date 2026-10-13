import React, { useEffect } from 'react';
import { TopBanner } from './components/layout/TopBanner';
import { Navbar } from './components/layout/Navbar';
import { SubHeader } from './components/layout/SubHeader';
import { Sidebar } from './components/layout/Sidebar';
import { ScenarioControlPanel } from './components/scenario/ScenarioControlPanel';

import { DashboardPage } from './pages/DashboardPage';
import { FleetPage } from './pages/FleetPage';
import { SchedulePage } from './pages/SchedulePage';
import { WeatherPage } from './pages/WeatherPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminPage } from './pages/AdminPage';

import { ExplainabilityDrawer } from './components/modals/ExplainabilityDrawer';
import { CommandPalette } from './components/modals/CommandPalette';
import { AlertSettingsModal } from './components/modals/AlertSettingsModal';
import { usePlannerStore } from './store/usePlannerStore';

export default function App() {
  const { 
    activePage, 
    fetchInitialData, 
    updateSimTimeFromWS, 
    updateAircraftPosition 
  } = usePlannerStore();

  useEffect(() => {
    fetchInitialData();

    // Setup WebSocket connection to backend stream
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/stream`;
    
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      (window as any).__AEROFLOW_WS__ = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SIM_TICK' || data.type === 'INIT') {
            if (data.simTime) {
              updateSimTimeFromWS(data.simTime);
            }
            if (data.aircraftPositions) {
              updateAircraftPosition(data.aircraftPositions);
            }
          }
        } catch (err) {
          console.error('Error parsing WS tick:', err);
        }
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }

    return () => {
      if (ws) {
        ws.close();
        (window as any).__AEROFLOW_WS__ = null;
      }
    };
  }, [fetchInitialData, updateSimTimeFromWS, updateAircraftPosition]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F8F6F0] text-[#362419] font-sans overflow-hidden select-none">
      {/* Permanent Top Banner */}
      <TopBanner />

      {/* Top Navbar */}
      <Navbar />

      {/* SubHeader OCC Bar & Controllable Clock */}
      <SubHeader />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Vertical Icon Rail */}
        <Sidebar />

        {/* Page Views */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#F8F6F0]">
          {activePage === 'dashboard' && <DashboardPage />}
          {activePage === 'fleet' && <FleetPage />}
          {activePage === 'schedule' && <SchedulePage />}
          {activePage === 'weather' && <WeatherPage />}
          {activePage === 'reports' && <ReportsPage />}
          {activePage === 'admin' && <AdminPage />}
        </main>
      </div>

      {/* Scenario Runner & Event Control Panel */}
      <ScenarioControlPanel />

      {/* Drawers & Modals */}
      <ExplainabilityDrawer />
      <CommandPalette />
      <AlertSettingsModal />
    </div>
  );
}
