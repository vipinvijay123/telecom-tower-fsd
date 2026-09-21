// Shared TypeScript types for the Telecom Tower Management System

export type UserRole = 'ADMIN' | 'OPERATOR' | 'TECHNICIAN';

export type TowerStatus = 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE' | 'CRITICAL';
export type TowerType = 'MONOPOLE' | 'LATTICE' | 'GUYED' | 'STEALTH' | 'ROOFTOP' | 'OTHER';

export type AssetStatus = 'OPERATIONAL' | 'FAULTY' | 'MAINTENANCE' | 'DECOMMISSIONED';
export type AssetType = 'ANTENNA' | 'ROUTER' | 'BASE_STATION' | 'GENERATOR' | 'POWER_EQUIPMENT' | 'BATTERY' | 'CABLE' | 'SHELTER' | 'OTHER';

export type PowerStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
export type BatteryStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'DEAD';

export type InspectionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type ConditionRating = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY' | 'ROUTINE' | 'UPGRADE';

export type OutageSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type OutageStatus = 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED';

export type AlertType = 'TOWER_OFFLINE' | 'BATTERY_CRITICAL' | 'POWER_FAILURE' | 'MAINTENANCE_OVERDUE' | 'INSPECTION_OVERDUE' | 'EQUIPMENT_FAULT' | 'OUTAGE_PROLONGED' | 'TEMPERATURE_HIGH' | 'CUSTOM';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export type TechnicianStatus = 'AVAILABLE' | 'ASSIGNED' | 'ON_LEAVE' | 'OFFLINE';

// ─── API Models ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin?: string;
  createdAt?: string;
}

export interface TowerLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Tower {
  _id: string;
  towerId: string;
  name: string;
  location: TowerLocation;
  towerType: TowerType;
  operator: string;
  installationDate: string;
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  status: TowerStatus;
  description?: string;
  height?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  _id: string;
  assetId: string;
  towerId: Tower | string;
  assetType: AssetType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installationDate: string;
  status: AssetStatus;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  description?: string;
  createdAt: string;
}

export interface PowerSystem {
  _id: string;
  towerId: Tower | string;
  mainPowerStatus: PowerStatus;
  generatorStatus: string;
  voltage: number;
  current: number;
  powerConsumption: number;
  generatorRuntime: number;
  lastPowerFailure?: string;
  powerRestorationTime?: string;
  status: PowerStatus;
  recordedAt: string;
  createdAt: string;
}

export interface Battery {
  _id: string;
  batteryId: string;
  towerId: Tower | string;
  batteryType: string;
  capacityAh: number;
  currentChargePercent: number;
  voltage: number;
  temperature: number;
  healthPercent: number;
  backupDurationHours: number;
  lastMaintenanceDate?: string;
  status: BatteryStatus;
  manufacturer?: string;
  model?: string;
  createdAt: string;
}

export interface Technician {
  _id: string;
  technicianId: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  assignedTowers: (Tower | string)[];
  status: TechnicianStatus;
  certifications?: string[];
  yearsOfExperience?: number;
}

export interface Inspection {
  _id: string;
  inspectionId: string;
  towerId: Tower | string;
  technicianId: Technician | string;
  inspectionDate: string;
  structuralCondition: ConditionRating;
  equipmentCondition: ConditionRating;
  powerCondition: ConditionRating;
  safetyCondition: ConditionRating;
  notes?: string;
  status: InspectionStatus;
  completedAt?: string;
  findings?: string;
}

export interface Maintenance {
  _id: string;
  maintenanceId: string;
  towerId: Tower | string;
  assetId?: Asset | string;
  technicianId?: Technician | string;
  maintenanceType: MaintenanceType;
  scheduledDate: string;
  completionDate?: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  description: string;
  resolution?: string;
}

export interface Outage {
  _id: string;
  outageId: string;
  towerId: Tower | string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  cause?: string;
  severity: OutageSeverity;
  status: OutageStatus;
  reportedBy: User | string;
  resolutionDetails?: string;
  affectedServices?: string[];
  createdAt: string;
}

export interface Alert {
  _id: string;
  alertId: string;
  type: AlertType;
  towerId: Tower | string;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  resolvedAt?: string;
  createdAt: string;
}

// ─── Dashboard Types ────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  totalTowers: number;
  activeTowers: number;
  offlineTowers: number;
  maintenanceTowers: number;
  criticalTowers: number;
  totalAssets: number;
  criticalBatteries: number;
  activeOutages: number;
  pendingMaintenance: number;
  upcomingInspections: number;
  activeAlerts: number;
  availableTechnicians: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface DashboardStats {
  kpis: DashboardKPIs;
  charts: {
    towerStatusDist: ChartDataPoint[];
    batteryHealthDist: ChartDataPoint[];
  };
}

export interface RecentActivity {
  recentAlerts: Alert[];
  recentOutages: Outage[];
  upcomingInspections: Inspection[];
  recentMaintenance: Maintenance[];
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  token?: string;
  user?: User;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}
