/**
 * AERO-OS // HANGAR-SYS v4.8
 * Base de Dados Operacionais e Modelos Técnicos do Hangar Espacial.
 */

export interface ShipAsset {
  id: string;
  code: string;
  name: string;
  bay: string;             // Ex: "DCK-A01"
  classType: "INTERCEPTOR" | "FREIGHTER" | "MINING_DRONE" | "ASSAULT_MECH" | "SCOUT" | "CORVETTE";
  status: "READY" | "DEPARTING" | "MAINTENANCE" | "IN_MISSION" | "QUEUED_LOCK";
  fuelPercent: number;
  shieldPercent: number;
  warpCore: string;
  flightHours: number;
  contractRateCR: number;   // Taxa de despacho em Créditos Galácticos (CR)
  isRareSingleUnit: boolean;// Se é protótipo raro de 1 unidade única na estação
  currentLockHolder?: string;
  queueDepth: number;
  specs: {
    armor: string;
    propulsion: string;
    maxCrew: number;
    payloadTon: number;
  };
}

export interface DispatchReservation {
  id: string;
  position: number;
  shipCode: string;
  shipName: string;
  pilotCallsign: string;
  status: "PROCESSING_LOCK" | "QUEUED_WAITING" | "DISPATCHED" | "CANCELLED";
  targetSector: string;
  submittedAt: string;
  holdTimeSeconds: number;
}

export interface ArsenalComponent {
  id: string;
  code: string;
  name: string;
  category: "PROPULSION" | "SHIELDS" | "POWER" | "AUTOMATION" | "WEAPONS";
  stockUnits: number;
  minWarningThreshold: number;
  allocatedBay: string;
  compatibleClasses: string[];
  unitCostCR: number;
  integrity: number;
}

// ── FROTA DE ATIVOS DAS DOCAS DO HANGAR (DOCK BAYS) ──
export const DOCK_SHIPS: ShipAsset[] = [
  {
    id: "ship-01",
    code: "INT-VALK-9",
    name: "Valkyrie-IX",
    bay: "DCK-A01",
    classType: "INTERCEPTOR",
    status: "READY",
    fuelPercent: 98,
    shieldPercent: 100,
    warpCore: "CALIBRATED // MK-IV",
    flightHours: 342,
    contractRateCR: 1250,
    isRareSingleUnit: false,
    queueDepth: 0,
    specs: {
      armor: "Liga Titânio-Cerâmica 120mm",
      propulsion: "Propulsores de Íons Duplos",
      maxCrew: 1,
      payloadTon: 4.5,
    },
  },
  {
    id: "ship-02",
    code: "FRG-TITAN-7",
    name: "Goliath-Titan",
    bay: "DCK-A02",
    classType: "FREIGHTER",
    status: "DEPARTING",
    fuelPercent: 82,
    shieldPercent: 95,
    warpCore: "ONLINE // DURA-3",
    flightHours: 1840,
    contractRateCR: 2800,
    isRareSingleUnit: false,
    queueDepth: 1,
    specs: {
      armor: "Blindagem Modular Composta",
      propulsion: "4x Propulsores Sub-Luz Quádruplos",
      maxCrew: 6,
      payloadTon: 2400.0,
    },
  },
  {
    id: "ship-03",
    code: "DRN-MINER-07",
    name: "Excavator-Prime",
    bay: "DCK-A03",
    classType: "MINING_DRONE",
    status: "MAINTENANCE",
    fuelPercent: 65,
    shieldPercent: 70,
    warpCore: "N/A // AUTONOMOUS",
    flightHours: 920,
    contractRateCR: 750,
    isRareSingleUnit: false,
    queueDepth: 0,
    specs: {
      armor: "Carcaça de Aço Reforçado",
      propulsion: "Micromotores de Vetorização",
      maxCrew: 0,
      payloadTon: 180.0,
    },
  },
  {
    id: "ship-04",
    code: "MCH-GEIST-04",
    name: "Mk-IV Assault Mech",
    bay: "DCK-B01",
    classType: "ASSAULT_MECH",
    status: "READY",
    fuelPercent: 91,
    shieldPercent: 88,
    warpCore: "PLASMA CORE 500MW",
    flightHours: 128,
    contractRateCR: 3400,
    isRareSingleUnit: false,
    queueDepth: 0,
    specs: {
      armor: "Placas Reativas de Nanocarbono",
      propulsion: "Pernas Hidráulicas + Jump Jets",
      maxCrew: 1,
      payloadTon: 12.0,
    },
  },
  {
    id: "ship-05",
    code: "PROTO-STARHAWK",
    name: "StarHawk Prototype X-1",
    bay: "DCK-B02",
    classType: "INTERCEPTOR",
    status: "READY",
    fuelPercent: 94,
    shieldPercent: 98,
    warpCore: "PROTOTYPE // TACHYON-X",
    flightHours: 42,
    contractRateCR: 6200,
    isRareSingleUnit: true, // PROTÓTIPO RARO: APENAS 1 UNIDADE NO HANGAR
    currentLockHolder: undefined,
    queueDepth: 0,
    specs: {
      armor: "Fusão de Grafeno Quântico",
      propulsion: "Hiperpropulsor Experimental Taquiônico",
      maxCrew: 2,
      payloadTon: 6.0,
    },
  },
  {
    id: "ship-06",
    code: "SCT-PHANTOM-3",
    name: "Phantom Stealth Scout",
    bay: "DCK-B03",
    classType: "SCOUT",
    status: "READY",
    fuelPercent: 100,
    shieldPercent: 92,
    warpCore: "ONLINE // SILENT-II",
    flightHours: 512,
    contractRateCR: 1650,
    isRareSingleUnit: false,
    queueDepth: 0,
    specs: {
      armor: "Camuflagem de Absorção Radar/Óptica",
      propulsion: "Impulso Térmico Suprimido",
      maxCrew: 2,
      payloadTon: 8.0,
    },
  },
  {
    id: "ship-07",
    code: "CRV-SOLARIS-1",
    name: "Solaris Patrol Corvette",
    bay: "DCK-C01",
    classType: "CORVETTE",
    status: "IN_MISSION",
    fuelPercent: 44,
    shieldPercent: 80,
    warpCore: "WARP MK-III // ENGAGED",
    flightHours: 2410,
    contractRateCR: 4500,
    isRareSingleUnit: false,
    queueDepth: 0,
    specs: {
      armor: "Blindagem Pesada de Frota",
      propulsion: "Motores Sub-Luz Duplos de Alta Saída",
      maxCrew: 14,
      payloadTon: 650.0,
    },
  },
  {
    id: "ship-08",
    code: "DRN-DRONE-88",
    name: "Asteroid Scraper Unit 8",
    bay: "DCK-C02",
    classType: "MINING_DRONE",
    status: "READY",
    fuelPercent: 88,
    shieldPercent: 65,
    warpCore: "N/A // AUTOMATED",
    flightHours: 480,
    contractRateCR: 820,
    isRareSingleUnit: false,
    queueDepth: 0,
    specs: {
      armor: "Liga Reforçada Anti-Impacto",
      propulsion: "Micropropulsores Iônicos",
      maxCrew: 0,
      payloadTon: 220.0,
    },
  },
];

// ── BUFFER DA FILA DE DESPACHO (RABBITMQ DISPATCH BUFFER) ──
export const INITIAL_DISPATCH_QUEUE: DispatchReservation[] = [];

// ── ARSENAL DE COMPONENTES E PEÇAS (ESTOQUE TÉCNICO) ──
export const ARSENAL_COMPONENTS: ArsenalComponent[] = [
  {
    id: "comp-01",
    code: "WARP-CORE-MK4",
    name: "Motor de Dobra Taquiônica MK-IV",
    category: "PROPULSION",
    stockUnits: 7,
    minWarningThreshold: 3,
    allocatedBay: "BAY-P01",
    compatibleClasses: ["INT", "CRV", "SCT"],
    unitCostCR: 4200,
    integrity: 100,
  },
  {
    id: "comp-02",
    code: "PLASMA-SHIELD-GEN",
    name: "Gerador de Escudos de Plasma 1.2GW",
    category: "SHIELDS",
    stockUnits: 14,
    minWarningThreshold: 4,
    allocatedBay: "BAY-S02",
    compatibleClasses: ["INT", "FRG", "MCH", "CRV"],
    unitCostCR: 2800,
    integrity: 98,
  },
  {
    id: "comp-03",
    code: "ENERGY-CELL-500",
    name: "Bateria de Célula de Fusão 500MW",
    category: "POWER",
    stockUnits: 38,
    minWarningThreshold: 10,
    allocatedBay: "BAY-E04",
    compatibleClasses: ["ALL"],
    unitCostCR: 650,
    integrity: 100,
  },
  {
    id: "comp-04",
    code: "ASTRO-DROID-R4",
    name: "Droide de Reparo Astromecânico R-4",
    category: "AUTOMATION",
    stockUnits: 3, // ESTOQUE CRÍTICO
    minWarningThreshold: 5,
    allocatedBay: "BAY-D01",
    compatibleClasses: ["INT", "MCH", "FRG"],
    unitCostCR: 3100,
    integrity: 85,
  },
  {
    id: "comp-05",
    code: "TITAN-ARMOR-PLATE",
    name: "Placa de Blindagem Titânio-Carbeto",
    category: "SHIELDS",
    stockUnits: 22,
    minWarningThreshold: 6,
    allocatedBay: "BAY-A03",
    compatibleClasses: ["FRG", "CRV", "MCH"],
    unitCostCR: 1100,
    integrity: 100,
  },
  {
    id: "comp-06",
    code: "RAILGUN-SLUG-88",
    name: "Muninção Magnética Slug de Ferro 88mm",
    category: "WEAPONS",
    stockUnits: 64,
    minWarningThreshold: 15,
    allocatedBay: "BAY-W09",
    compatibleClasses: ["CRV", "MCH"],
    unitCostCR: 340,
    integrity: 100,
  },
];

export interface OrbitalSector {
  id: string;
  name: string;
  coordinates: string;
  riskLevel: "LOW" | "MODERATE" | "EXTREME";
  activeVessels: number;
}

export const ORBITAL_SECTORS: OrbitalSector[] = [
  { id: "sec-01", name: "Quadrante Kronos // Setor 4", coordinates: "RA 05h 35m / Dec -05°23'", riskLevel: "LOW", activeVessels: 14 },
  { id: "sec-02", name: "Nebulosa de Têmis // Setor 1", coordinates: "RA 18h 18m / Dec -13°47'", riskLevel: "MODERATE", activeVessels: 8 },
  { id: "sec-03", name: "Cinturão de Órion // Minas", coordinates: "RA 05h 32m / Dec +00°17'", riskLevel: "EXTREME", activeVessels: 22 },
  { id: "sec-04", name: "Relay de Vega // Anel Exterior", coordinates: "RA 18h 36m / Dec +38°47'", riskLevel: "LOW", activeVessels: 5 },
];

export const STATION_METRICS = {
  defcon: 4,
  reactorStability: 98.4,
  dockCapacity: 8,
  dockOccupied: 6,
  dispatchQueuePending: 3,
  amqpPrefetch: 1,
  quantumFrequencyGHz: 1.42,
};
