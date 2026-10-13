export type ProvenanceTag = 'CONFIRMED' | 'FORECAST' | 'ASSUMED' | 'MISSING';

export type AircraftStatus = 'Serviceable' | 'Limited' | 'In Maintenance' | 'Unserviceable';

export type AircraftType = 'Aircraft Type A' | 'Aircraft Type B' | 'Aircraft Type C';

export type BaseName = 
  | 'Aldermoor Base' 
  | 'Brightwater Field' 
  | 'Corvin Strip' 
  | 'Dunmere Station' 
  | 'Eastholm Airfield';

export interface Aircraft {
  id: string; // e.g. "AX-101"
  tailNumber: string;
  type: AircraftType;
  currentBase: BaseName;
  status: AircraftStatus;
  flightHours: number;
  totalHours: number;
  nextMaintenanceDue: string; // ISO date or relative
  assignedTaskId?: string;
  position: { lat: number; lng: number }; // normalized map coordinates [0..100]
  heading: number; // 0..360 deg
  altitude: number; // e.g. 350 (35,000 ft)
  speed: number; // e.g. 480 knots
  maintenanceReason?: string;
  provenance: ProvenanceTag;
  lastUpdated: string;
}

export type TaskCategory = 
  | 'Airlift Task' 
  | 'Survey Task' 
  | 'Training Task' 
  | 'Relief Task' 
  | 'Maintenance Test Task';

export type TaskStatus = 'On Time' | 'En Route' | 'Delayed' | 'Gate/Ready' | 'Completed' | 'Unassigned';

export interface FlightTask {
  id: string; // e.g. "ULA-3280"
  name: string;
  category: TaskCategory;
  priority: number; // 1 (highest) to 5 (lowest)
  originBase: BaseName;
  destBase: BaseName;
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  requiredAircraftType: AircraftType;
  requiredCrewGroup: string;
  requiredKit: string;
  assignedAircraftId?: string;
  assignedCrewGroupId?: string;
  assignedStandId?: string;
  status: TaskStatus;
  provenance: ProvenanceTag;
  delayReason?: string;
  confidencePct: number;
}

export interface RampStand {
  id: string; // e.g. "B1", "B2", "B4"
  base: BaseName;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  currentAircraftId?: string;
  nextAssignmentTime?: string;
  maxWingspanMeters: number;
  provenance: ProvenanceTag;
}

export interface Alert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  location: string;
  timestamp: string;
  timeAgo: string;
  aircraftId?: string;
  taskId?: string;
  isAcknowledged: boolean;
  provenance: ProvenanceTag;
  bindingConstraints?: string[];
  recommendedAction?: string;
  sourceRecord?: string;
}

export interface WeatherZone {
  id: string;
  base: BaseName;
  condition: 'VFR' | 'MVFR' | 'IFR' | 'CLOSED';
  cloudCeilingFt: number;
  visibilityMiles: number;
  windSpeedKt: number;
  gustKt: number;
  goNoGoStatus: 'GO' | 'MARGINAL' | 'NO-GO';
  confidencePct: number;
  forecastHorizon: string;
  provenance: ProvenanceTag;
}

export interface CrewGroup {
  id: string; // e.g. "Crew Group 1", "P-001"
  name: string;
  homeBase: BaseName;
  currentBase: BaseName;
  qualifications: AircraftType[];
  dutyHoursToday: number;
  maxDutyHours: number;
  restStart?: string;
  restEnd?: string;
  status: 'Available' | 'On Duty' | 'Resting' | 'Unavailable';
  provenance: ProvenanceTag;
}

export interface EquipmentKit {
  id: string; // e.g. "Kit X-1", "Equipment Kit Y"
  name: string;
  type: 'Equipment Kit X' | 'Equipment Kit Y' | 'Equipment Kit Z';
  locationBase: BaseName;
  status: 'Ready' | 'In Use' | 'Maintenance';
  provenance: ProvenanceTag;
}

export interface PlanAssignment {
  taskId: string;
  aircraftId: string;
  standId: string;
  crewGroupId: string;
  equipmentKitId: string;
  confidenceScore: number;
  reason: string;
}

export interface PlanConflict {
  taskId: string;
  reason: string;
  affectedResources: string[];
  severity: 'CRITICAL' | 'WARNING';
}

export interface OptimizationResult {
  planId: string;
  planName: 'Greedy Baseline' | 'Optimised (CP-SAT)' | 'Conservative Reserve';
  solverStatus: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE';
  objectiveValue: number;
  optimalityGapPct: number;
  solveTimeMs: number;
  assignments: PlanAssignment[];
  unmetRequirements: string[];
  conflicts: PlanConflict[];
  reserveShortfallHours: number;
  requirementCoveragePct: number;
  resourceUtilisationPct: number;
  replanLatencyMs: number;
  changedAssignmentsCount?: number;
  provenance: ProvenanceTag;
}

export interface ForecastModelMetrics {
  modelName: string;
  mae: number;
  rmse: number;
  mape: number;
  series: {
    date: string;
    actual?: number;
    predicted: number;
    lower80: number;
    upper80: number;
    lower95: number;
    upper95: number;
  }[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: 'Planner' | 'Commander' | 'Admin';
  action: string;
  target: string;
  reason: string;
  diffSummary: string;
}

export interface DataQualityReport {
  score: number; // 0-100
  confirmedCount: number;
  forecastCount: number;
  assumedCount: number;
  missingCount: number;
  staleFeeds: string[];
  missingFields: { record: string; field: string; severity: 'HIGH' | 'MED' }[];
}

export interface MonteCarloResult {
  simulationsRun: number;
  p10CoveragePct: number;
  p50CoveragePct: number;
  p90CoveragePct: number;
  riskDistribution: { riskLevel: string; probability: number }[];
  requirementReliability: { taskId: string; successRatePct: number }[];
}

export interface GroundedAnswer {
  question: string;
  answer: string;
  citedRecords: { id: string; type: string; details: string; provenance: ProvenanceTag }[];
  confidenceScore: number;
}
