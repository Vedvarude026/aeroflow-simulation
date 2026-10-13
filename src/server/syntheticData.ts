import { 
  Aircraft, 
  BaseName, 
  CrewGroup, 
  EquipmentKit, 
  FlightTask, 
  RampStand, 
  WeatherZone, 
  Alert, 
  AuditLogEntry, 
  DataQualityReport 
} from '../types/index.js';

export const BASES: BaseName[] = [
  'Aldermoor Base',
  'Brightwater Field',
  'Corvin Strip',
  'Dunmere Station',
  'Eastholm Airfield'
];

export const BASE_COORDINATES: Record<BaseName, { lat: number; lng: number }> = {
  'Aldermoor Base': { lat: 25, lng: 20 },
  'Brightwater Field': { lat: 35, lng: 75 },
  'Corvin Strip': { lat: 70, lng: 30 },
  'Dunmere Station': { lat: 80, lng: 80 },
  'Eastholm Airfield': { lat: 45, lng: 50 }
};

export function generateInitialData(seed: number = 42) {
  let rng = seed;
  const pseudoRandom = () => {
    rng = (rng * 9301 + 49297) % 233280;
    return rng / 233280;
  };

  // Generate 24 Aircraft (AX-101 to AX-124)
  const aircraft: Aircraft[] = [];
  const types: ('Aircraft Type A' | 'Aircraft Type B' | 'Aircraft Type C')[] = [
    'Aircraft Type A', 'Aircraft Type B', 'Aircraft Type C'
  ];

  const statuses: ('Serviceable' | 'Limited' | 'In Maintenance' | 'Unserviceable')[] = [
    'Serviceable', 'Serviceable', 'Serviceable', 'Serviceable', 
    'Serviceable', 'Limited', 'In Maintenance', 'Unserviceable'
  ];

  for (let i = 1; i <= 24; i++) {
    const num = 100 + i;
    const id = `AX-${num}`;
    const base = BASES[i % BASES.length];
    const status = statuses[Math.floor(pseudoRandom() * statuses.length)];
    const type = types[i % types.length];
    const basePos = BASE_COORDINATES[base];
    
    // Add slight offset for flight positions
    const lat = Math.max(10, Math.min(90, basePos.lat + (pseudoRandom() - 0.5) * 30));
    const lng = Math.max(10, Math.min(90, basePos.lng + (pseudoRandom() - 0.5) * 30));

    aircraft.push({
      id,
      tailNumber: `N-${num}AF`,
      type,
      currentBase: base,
      status,
      flightHours: Math.floor(120 + pseudoRandom() * 450),
      totalHours: Math.floor(1200 + pseudoRandom() * 3000),
      nextMaintenanceDue: status === 'In Maintenance' ? 'IMMEDIATE' : `+${Math.floor(12 + pseudoRandom() * 120)}h`,
      position: { lat, lng },
      heading: Math.floor(pseudoRandom() * 360),
      altitude: Math.floor(200 + pseudoRandom() * 180), // 200..380
      speed: Math.floor(350 + pseudoRandom() * 180), // 350..530 knots
      maintenanceReason: status === 'In Maintenance' 
        ? 'Scheduled 200-hour airframe inspection & hydraulic line flush' 
        : status === 'Unserviceable' 
        ? 'Avionics bus communication error on Stand B42' 
        : undefined,
      provenance: pseudoRandom() > 0.1 ? 'CONFIRMED' : 'FORECAST',
      lastUpdated: '14:30 UTC'
    });
  }

  // Specific aircraft callouts matching problem statement
  const ax456 = aircraft.find(a => a.id === 'AX-104') || aircraft[3];
  ax456.status = 'Unserviceable';
  ax456.maintenanceReason = 'Minor mechanical issue – Aldermoor Stand B42';

  // Ramp Stands
  const stands: RampStand[] = [];
  BASES.forEach(base => {
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'].forEach((standId, idx) => {
      const isOccupied = idx < 3;
      stands.push({
        id: `${standId}`,
        base,
        status: isOccupied ? 'Occupied' : (idx === 3 ? 'Reserved' : 'Available'),
        currentAircraftId: isOccupied ? aircraft[(idx + BASES.indexOf(base) * 2) % aircraft.length].id : undefined,
        maxWingspanMeters: 45,
        provenance: 'CONFIRMED'
      });
    });
  });

  // Flight Tasks
  const tasks: FlightTask[] = [
    {
      id: 'ULA-3280',
      name: 'Airlift Supply Run Alpha',
      category: 'Airlift Task',
      priority: 1,
      originBase: 'Aldermoor Base',
      destBase: 'Brightwater Field',
      startTime: '2024-05-10T14:00:00Z',
      endTime: '2024-05-10T17:30:00Z',
      requiredAircraftType: 'Aircraft Type A',
      requiredCrewGroup: 'Crew Group 1',
      requiredKit: 'Equipment Kit X-1',
      assignedAircraftId: 'AX-101',
      assignedCrewGroupId: 'P-001 (Crew Group 1)',
      assignedStandId: 'B1',
      status: 'En Route',
      provenance: 'CONFIRMED',
      confidencePct: 98
    },
    {
      id: 'ULA-3281',
      name: 'Corvin Strip Aerial Survey',
      category: 'Survey Task',
      priority: 2,
      originBase: 'Corvin Strip',
      destBase: 'Corvin Strip',
      startTime: '2024-05-10T15:15:00Z',
      endTime: '2024-05-10T18:45:00Z',
      requiredAircraftType: 'Aircraft Type B',
      requiredCrewGroup: 'Crew Group 2',
      requiredKit: 'Equipment Kit Y-2',
      assignedAircraftId: 'AX-102',
      assignedCrewGroupId: 'P-004 (Crew Group 2)',
      assignedStandId: 'B2',
      status: 'On Time',
      provenance: 'CONFIRMED',
      confidencePct: 95
    },
    {
      id: 'ULA-3282',
      name: 'Eastholm Station Readiness Training',
      category: 'Training Task',
      priority: 3,
      originBase: 'Eastholm Airfield',
      destBase: 'Eastholm Airfield',
      startTime: '2024-05-10T16:00:00Z',
      endTime: '2024-05-10T19:00:00Z',
      requiredAircraftType: 'Aircraft Type C',
      requiredCrewGroup: 'Crew Group 3',
      requiredKit: 'Equipment Kit Z-1',
      assignedAircraftId: 'AX-103',
      assignedCrewGroupId: 'P-007 (Crew Group 3)',
      assignedStandId: 'B3',
      status: 'Gate/Ready',
      provenance: 'CONFIRMED',
      confidencePct: 92
    },
    {
      id: 'ULA-3283',
      name: 'Dunmere Station Relief Airlift',
      category: 'Relief Task',
      priority: 1,
      originBase: 'Brightwater Field',
      destBase: 'Dunmere Station',
      startTime: '2024-05-10T18:00:00Z',
      endTime: '2024-05-10T22:00:00Z',
      requiredAircraftType: 'Aircraft Type A',
      requiredCrewGroup: 'Crew Group 1',
      requiredKit: 'Equipment Kit X-2',
      assignedAircraftId: 'AX-105',
      assignedCrewGroupId: 'P-002 (Crew Group 1)',
      assignedStandId: 'B1',
      status: 'Delayed',
      delayReason: 'Weather minima constraint at Dunmere Station (IFR ceiling)',
      provenance: 'FORECAST',
      confidencePct: 84
    },
    {
      id: 'ULA-3284',
      name: 'Engine Overhaul Maintenance Test',
      category: 'Maintenance Test Task',
      priority: 4,
      originBase: 'Aldermoor Base',
      destBase: 'Aldermoor Base',
      startTime: '2024-05-10T20:00:00Z',
      endTime: '2024-05-10T21:30:00Z',
      requiredAircraftType: 'Aircraft Type B',
      requiredCrewGroup: 'Crew Group 2',
      requiredKit: 'Equipment Kit Y-1',
      assignedAircraftId: 'AX-106',
      assignedCrewGroupId: 'P-005 (Crew Group 2)',
      assignedStandId: 'B4',
      status: 'On Time',
      provenance: 'CONFIRMED',
      confidencePct: 90
    },
    {
      id: 'ULA-3285',
      name: 'Night Logistics Shuttle Delta',
      category: 'Airlift Task',
      priority: 2,
      originBase: 'Dunmere Station',
      destBase: 'Aldermoor Base',
      startTime: '2024-05-10T22:30:00Z',
      endTime: '2024-05-11T02:00:00Z',
      requiredAircraftType: 'Aircraft Type C',
      requiredCrewGroup: 'Crew Group 3',
      requiredKit: 'Equipment Kit Z-2',
      assignedAircraftId: 'AX-107',
      assignedCrewGroupId: 'P-008 (Crew Group 3)',
      assignedStandId: 'B5',
      status: 'On Time',
      provenance: 'ASSUMED',
      confidencePct: 78
    }
  ];

  // Alerts
  const alerts: Alert[] = [
    {
      id: 'ALT-101',
      severity: 'CRITICAL',
      title: 'AX-104 – Minor mechanical issue',
      message: 'Hydraulics pressure loss reported at Aldermoor Stand B42. Inspection required before next sortie.',
      location: 'Aldermoor Base Stand B42',
      timestamp: '2024-05-10T08:15:00Z',
      timeAgo: '15h ago',
      aircraftId: 'AX-104',
      taskId: 'ULA-3280',
      isAcknowledged: false,
      provenance: 'CONFIRMED',
      bindingConstraints: [
        'Hydraulic pressure < 2800 PSI (Safety limit)',
        'Aldermoor Stand B42 maintenance bay lock',
        'Overlap with maintenance window 10:00–14:00'
      ],
      recommendedAction: 'Reassign ULA-3280 to standby aircraft AX-105 at Brightwater Field.',
      sourceRecord: 'FLEET-LOG-8910 (Source: Fleet Maintenance Telemetry)'
    },
    {
      id: 'ALT-102',
      severity: 'WARNING',
      title: 'AX-105 – Weather delay projected',
      message: 'Cloud ceiling dropping below VFR minima at Dunmere Station. ETA delayed +30 min.',
      location: 'Dunmere Station',
      timestamp: '2024-05-10T12:00:00Z',
      timeAgo: '1d ago',
      aircraftId: 'AX-105',
      taskId: 'ULA-3283',
      isAcknowledged: false,
      provenance: 'FORECAST',
      bindingConstraints: [
        'Weather minima: Cloud ceiling < 1000 ft',
        'Visibility < 3 statute miles',
        'Dunmere runway hold pattern capacity max 2 aircraft'
      ],
      recommendedAction: 'Adjust departure window +45 min or reroute via Corvin Strip holding fix.',
      sourceRecord: 'WX-FEED-4421 (Source: Regional Atmospheric Radar)'
    },
    {
      id: 'ALT-103',
      severity: 'WARNING',
      title: 'Crew Group 2 Duty Limit Threshold',
      message: 'P-004 duty hours approaching 11h limit (Max 12h per 24h rest cycle).',
      location: 'Corvin Strip',
      timestamp: '2024-05-10T13:30:00Z',
      timeAgo: '1h ago',
      aircraftId: 'AX-102',
      taskId: 'ULA-3281',
      isAcknowledged: true,
      provenance: 'CONFIRMED',
      bindingConstraints: [
        'FAA / Operations Duty Rest Policy Section 4.2',
        'Max Duty Hours = 12h (Current = 11.2h)',
        'Required mandatory rest period = 8h'
      ],
      recommendedAction: 'Rotate Crew Group 2 with reserve crew P-009 at Corvin Strip upon landing.',
      sourceRecord: 'CREW-ROSTER-2201 (Source: Operations Roster System)'
    }
  ];

  // Weather Zones
  const weatherZones: WeatherZone[] = [
    {
      id: 'WX-01',
      base: 'Aldermoor Base',
      condition: 'VFR',
      cloudCeilingFt: 4500,
      visibilityMiles: 10,
      windSpeedKt: 8,
      gustKt: 12,
      goNoGoStatus: 'GO',
      confidencePct: 98,
      forecastHorizon: '+12h',
      provenance: 'CONFIRMED'
    },
    {
      id: 'WX-02',
      base: 'Brightwater Field',
      condition: 'VFR',
      cloudCeilingFt: 3800,
      visibilityMiles: 9,
      windSpeedKt: 12,
      gustKt: 16,
      goNoGoStatus: 'GO',
      confidencePct: 94,
      forecastHorizon: '+12h',
      provenance: 'CONFIRMED'
    },
    {
      id: 'WX-03',
      base: 'Corvin Strip',
      condition: 'MVFR',
      cloudCeilingFt: 1800,
      visibilityMiles: 5,
      windSpeedKt: 18,
      gustKt: 25,
      goNoGoStatus: 'MARGINAL',
      confidencePct: 88,
      forecastHorizon: '+6h',
      provenance: 'FORECAST'
    },
    {
      id: 'WX-04',
      base: 'Dunmere Station',
      condition: 'IFR',
      cloudCeilingFt: 800,
      visibilityMiles: 2,
      windSpeedKt: 24,
      gustKt: 34,
      goNoGoStatus: 'NO-GO',
      confidencePct: 82,
      forecastHorizon: '+4h',
      provenance: 'FORECAST'
    },
    {
      id: 'WX-05',
      base: 'Eastholm Airfield',
      condition: 'VFR',
      cloudCeilingFt: 5000,
      visibilityMiles: 10,
      windSpeedKt: 6,
      gustKt: 10,
      goNoGoStatus: 'GO',
      confidencePct: 96,
      forecastHorizon: '+12h',
      provenance: 'CONFIRMED'
    }
  ];

  // Crew Groups
  const crewGroups: CrewGroup[] = [
    {
      id: 'Crew Group 1',
      name: 'P-001 Alpha Flight Crew',
      homeBase: 'Aldermoor Base',
      currentBase: 'Aldermoor Base',
      qualifications: ['Aircraft Type A', 'Aircraft Type B'],
      dutyHoursToday: 6.5,
      maxDutyHours: 12,
      status: 'On Duty',
      provenance: 'CONFIRMED'
    },
    {
      id: 'Crew Group 2',
      name: 'P-004 Bravo Survey Crew',
      homeBase: 'Corvin Strip',
      currentBase: 'Corvin Strip',
      qualifications: ['Aircraft Type B', 'Aircraft Type C'],
      dutyHoursToday: 10.8,
      maxDutyHours: 12,
      status: 'On Duty',
      provenance: 'CONFIRMED'
    },
    {
      id: 'Crew Group 3',
      name: 'P-007 Charlie Logistics Crew',
      homeBase: 'Eastholm Airfield',
      currentBase: 'Eastholm Airfield',
      qualifications: ['Aircraft Type A', 'Aircraft Type C'],
      dutyHoursToday: 3.2,
      maxDutyHours: 12,
      status: 'Available',
      provenance: 'CONFIRMED'
    }
  ];

  // Equipment Kits
  const equipmentKits: EquipmentKit[] = [
    {
      id: 'Kit X-1',
      name: 'Equipment Kit X (Heavy Payload Rig)',
      type: 'Equipment Kit X',
      locationBase: 'Aldermoor Base',
      status: 'In Use',
      provenance: 'CONFIRMED'
    },
    {
      id: 'Kit Y-2',
      name: 'Equipment Kit Y (High-Res Sensor Suite)',
      type: 'Equipment Kit Y',
      locationBase: 'Corvin Strip',
      status: 'In Use',
      provenance: 'CONFIRMED'
    },
    {
      id: 'Kit Z-1',
      name: 'Equipment Kit Z (Rapid Relief Pallet)',
      type: 'Equipment Kit Z',
      locationBase: 'Eastholm Airfield',
      status: 'Ready',
      provenance: 'CONFIRMED'
    }
  ];

  // Audit Logs
  const auditLogs: AuditLogEntry[] = [
    {
      id: 'LOG-8801',
      timestamp: '2024-05-10T10:15:00Z',
      user: 'J. SMITH',
      role: 'Planner',
      action: 'REPLAN_SCHEDULE',
      target: 'Plan B (Optimised)',
      reason: 'Reassigned AX-105 following weather warning at Dunmere Station.',
      diffSummary: 'Changed task ULA-3283 aircraft assignment: AX-104 -> AX-105.'
    },
    {
      id: 'LOG-8802',
      timestamp: '2024-05-10T12:00:00Z',
      user: 'COL. H. VANCE',
      role: 'Commander',
      action: 'APPROVE_SCHEDULE',
      target: 'Plan B (Optimised)',
      reason: 'Approved high-priority relief task allocation with conservative reserve buffer.',
      diffSummary: 'Schedule status set to OPERATIONAL_LOCKED.'
    }
  ];

  // Data Quality Report
  const dataQualityReport: DataQualityReport = {
    score: 94,
    confirmedCount: 18,
    forecastCount: 4,
    assumedCount: 2,
    missingCount: 0,
    staleFeeds: ['EQUIPMENT-KIT-TELEMETRY-Z3 (stale 18 min)'],
    missingFields: [
      { record: 'AX-118', field: 'Next Maintenance Inspection Checklist ID', severity: 'MED' },
      { record: 'WX-04', field: 'Atmospheric pressure gradient trend', severity: 'MED' }
    ]
  };

  return {
    aircraft,
    stands,
    tasks,
    alerts,
    weatherZones,
    crewGroups,
    equipmentKits,
    auditLogs,
    dataQualityReport
  };
}
