export interface User {
  id?: string;
  username: string;
  email?: string;
  roles?: string[];
  role?: string;
  pilotCallsign?: string;
  clearanceLevel?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ShipAssetDTO {
  id: string;
  name: string;
  type: string;
  rarity: string;
  expansion: string;
  hp: number;
  imageUrl: string;
  marketPrice?: number;
}

export interface AssetCommander {
  officerUsername: string;
  instanceId: string;
  lockedForDispatch: boolean;
}

export interface DockedAsset {
  instanceId: string;
  assetId: string;
  assetName: string;
  name?: string;
  type: string;
  rarity: string;
  imageUrl?: string;
  hp?: number;
  marketPrice?: number;
  ownerUsername?: string;
  lockedForDispatch: boolean;
}

export interface OfficerDock {
  id: string;
  officerUsername: string;
  assets?: DockedAsset[];
  ships?: DockedAsset[];
}

export interface DispatchOrder {
  id: string;
  senderUsername: string;
  receiverUsername: string;
  offeredInstanceId: string;
  requestedInstanceId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  createdAt: string;
}

export interface ShipStockItem {
  id: string;
  code: string;
  name: string;
  bay: string;
  classType: string;
  status: string;
  fuelPercent: number;
  shieldPercent: number;
  warpCore: string;
  flightHours: number;
  contractRateCR: number;
  rareSingleUnit: boolean;
  currentLockHolder?: string;
  queueDepth: number;
  armor?: string;
  propulsion?: string;
  maxCrew?: number;
  payloadTon?: number;
}

export interface DockBayStockItem {
  bayCode: string;
  section: string;
  occupied: boolean;
  vesselCode?: string;
  vesselName?: string;
  assignedOfficer?: string;
  bayStatus: string;
}

export interface ArsenalStockItem {
  id: string;
  code: string;
  name: string;
  category: string;
  stockUnits: number;
  minThreshold: number;
  storageBay: string;
  compatibleClasses: string[];
  unitPriceCR: number;
  healthConditionPercent: number;
}

export interface HangarMetricsStock {
  totalShipsInHangar: number;
  shipsReady: number;
  shipsInMission: number;
  shipsMaintenance: number;
  shipsLockedDispatch: number;
  criticalArsenalCount: number;
  dockBaysTotal: number;
  dockBaysOccupied: number;
}

export interface ExecutiveReport {
  reportId: string;
  generatedAt: string;
  baseStation: string;
  defconLevel: number;
  reactorCoreStability: number;
  totalFleetVessels: number;
  vesselsReady: number;
  vesselsInFlight: number;
  vesselsMaintenance: number;
  vesselsLockedDispatch: number;
  totalFlightHours: number;
  totalFuelBurnRateKgSec: number;
  totalRevenueGalacticCredits: number;
  fleetByClass: Record<string, number>;
}

export interface SectorConsumption {
  sectorName: string;
  consumptionKgSec: number;
  activeVessels: number;
  riskLevel: string;
}

export interface FuelReport {
  cycleId: string;
  totalConsumptionTons: number;
  currentBurnRateKgSec: number;
  sectorBreakdown: SectorConsumption[];
}

export interface NodeHealth {
  id: string;
  name: string;
  port: number;
  technology: string;
  status: string;
  latencyMs: number;
}

export interface ClusterStatus {
  clusterName: string;
  totalNodes: number;
  activeNodes: number;
  nodes: NodeHealth[];
}

