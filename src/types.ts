export type ResourceType = 
  | 'catnip' 
  | 'wood' 
  | 'minerals' 
  | 'iron' 
  | 'science' 
  | 'culture' 
  | 'parchment' 
  | 'beam' 
  | 'slab' 
  | 'plate';

export type BuildingType = 
  | 'catnipField' 
  | 'aqueduct' 
  | 'pasture' 
  | 'hut' 
  | 'logHouse' 
  | 'mansion' 
  | 'barn' 
  | 'warehouse' 
  | 'library' 
  | 'academy' 
  | 'mine' 
  | 'smelter' 
  | 'amphitheatre';

export type JobType = 
  | 'farmer' 
  | 'woodcutter' 
  | 'scholar' 
  | 'miner' 
  | 'priest';

export type ScienceType = 
  | 'calendar' 
  | 'agriculture' 
  | 'woodworking' 
  | 'mining' 
  | 'metalworking' 
  | 'theology' 
  | 'writing';

export type UpgradeType = 
  | 'mineralAxes' 
  | 'ironAxes' 
  | 'catnipSilos' 
  | 'reinforcedBarns' 
  | 'expandedStorage'
  | 'portalHeaters';

export type SeasonType = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface Kitten {
  id: string;
  name: string;
  surname: string;
  job: JobType | 'unemployed';
  trait: string;
  level: number;
  exp: number;
  skillBonus: string;
}

export interface GameLogMessage {
  id: string;
  time: string;
  text: string;
  type: 'info' | 'success' | 'warn' | 'season' | 'death';
}

export interface ActiveCertificateBoost {
  id: string;
  certificateType: 'bronze' | 'silver' | 'gold' | 'infinite';
  name: string;
  timeRemaining: number; // in seconds
  totalDuration: number; // original duration in seconds
  boostPercent: number; // e.g. 0.15 for 15%
}

export interface GameState {
  // Resources
  resources: Record<ResourceType, { amount: number; max: number }>;
  
  // Buildings counts
  buildings: Record<BuildingType, number>;
  
  // Research state
  researched: Record<ScienceType, boolean>;
  
  // Upgrade state
  upgrades: Record<UpgradeType, boolean>;
  
  // Village / Kittens
  village: {
    kittens: Kitten[];
    maxKittens: number;
    happiness: number; // percentage (e.g. 100)
  };
  
  // Season configuration
  season: {
    current: SeasonType;
    daysPassed: number;
    totalDays: number;
  };

  // Portal Crafting & Morty Certificates
  activeCertificates?: ActiveCertificateBoost[];
  craftedCertificatesCount?: Record<string, number>;
  achievements?: Record<string, boolean>;
  portalFlux: number;

  // Progression unlocks
  unlocks: {
    wood: boolean;
    minerals: boolean;
    iron: boolean;
    science: boolean;
    village: boolean;
    workshop: boolean;
    culture: boolean;
  };
  
  // Game settings
  gameSpeed: number; // 0 (paused), 1, 5, 10
  soundEnabled: boolean;
  lastTick: number;
  logs: GameLogMessage[];
  theme: 'dark' | 'light';
  buyMultiplier: 1 | 5 | 25;
  insaneMode: boolean;
  density: 'compact' | 'relaxed';
  activeAnomaly: {
    id: string;
    type: 'fluid_leak' | 'fed_raid' | 'cromulon' | 'microverse_decay';
    name: string;
    desc: string;
    durationLeft: number;
    clicksRequired: number;
    clicksMade: number;
  } | null;
  autoBuild: {
    pasture: boolean;
    barn: boolean;
  };
  
  // Prestige
  portalResets: number;
  prestigeMultiplier: number;

  // Actions
  tick: (deltaSeconds: number) => void;
  gatherCatnip: (multiplier?: number) => void;
  refineResource: (craftType: 'wood' | 'beam' | 'slab' | 'plate' | 'parchment', amount?: number) => void;
  buyBuilding: (type: BuildingType, quantity?: number) => void;
  assignJob: (kittenId: string, job: JobType | 'unemployed') => void;
  assignJobsMultiple: (kittenIds: string[], job: JobType | 'unemployed') => void;
  autoAssignAll: (job: JobType) => void;
  unassignAll: () => void;
  researchScience: (type: ScienceType) => void;
  buyUpgrade: (type: UpgradeType) => void;
  forceAddKitten: () => void;
  portalReset: () => void;
  addLog: (text: string, type?: GameLogMessage['type']) => void;
  setGameSpeed: (speed: number) => void;
  toggleSound: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setBuyMultiplier: (multiplier: 1 | 5 | 25) => void;
  synthesizeCertificate: (certificateType: 'bronze' | 'silver' | 'gold' | 'infinite') => void;
  toggleInsaneMode: () => void;
  setDensity: (density: 'compact' | 'relaxed') => void;
  defuseAnomalyClick: () => void;
  defuseAnomalyInstant: () => void;
  toggleAutoBuild: (type: 'pasture' | 'barn') => void;
}
