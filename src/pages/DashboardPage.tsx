import React from 'react';
import { FleetStatusOverview } from '../components/dashboard/FleetStatusOverview';
import { AlertDashboard } from '../components/dashboard/AlertDashboard';
import { AirspaceMonitor } from '../components/dashboard/AirspaceMonitor';
import { FlightScheduleTable } from '../components/dashboard/FlightScheduleTable';
import { RampStandManagement } from '../components/dashboard/RampStandManagement';

export const DashboardPage: React.FC = () => {
  return (
    <div className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-y-auto">
      {/* LEFT COLUMN (~18% -> lg:col-span-3) */}
      <div className="lg:col-span-3 flex flex-col gap-3">
        <FleetStatusOverview />
        <AlertDashboard />
      </div>

      {/* CENTER COLUMN (~56% -> lg:col-span-6) */}
      <div className="lg:col-span-6 flex flex-col gap-3">
        <AirspaceMonitor />
      </div>

      {/* RIGHT COLUMN (~26% -> lg:col-span-3) */}
      <div className="lg:col-span-3 flex flex-col gap-3">
        <FlightScheduleTable />
        <RampStandManagement />
      </div>
    </div>
  );
};
