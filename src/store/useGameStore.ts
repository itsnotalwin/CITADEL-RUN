import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  GameState, 
  ResourceType, 
  BuildingType, 
  JobType, 
  ScienceType, 
  UpgradeType, 
  SeasonType, 
  Kitten, 
  GameLogMessage,
  ActiveCertificateBoost
} from '../types';
import { BUILDINGS, SCIENCES, JOBS, UPGRADES, SEASONS_DATA, generateRandomKitten } from '../gameData';
import { ACHIEVEMENTS } from '../utils/achievements';

export interface CertificateDef {
  id: 'bronze' | 'silver' | 'gold' | 'infinite';
  name: string;
  desc: string;
  boostPercent: number; // 0.15 = 15%
  duration: number; // in seconds (e.g. 180)
  costs: {
    parchment: number; // Portal Formula
    beam?: number; // Nano-Beam
    slab?: number; // Hyper-Slab
    plate?: number; // Neutrium Plate
    science?: number; // Portal Tech
  };
}

export const CERTIFICATES: Record<string, CertificateDef> = {
  bronze: {
    id: 'bronze',
    name: 'Citadel Class-C Morty Certificate',
    desc: 'Authorized clone registry form. Temporarily boosts all job productivity by +15% for 3 minutes.',
    boostPercent: 0.15,
    duration: 180,
    costs: {
      parchment: 8,
      beam: 12,
      slab: 12,
    }
  },
  silver: {
    id: 'silver',
    name: 'Interdimensional Class-B Morty Certificate',
    desc: 'Approved space-time travel clearance document. Temporarily boosts all job productivity by +30% for 6 minutes.',
    boostPercent: 0.30,
    duration: 360,
    costs: {
      parchment: 20,
      beam: 25,
      plate: 25,
    }
  },
  gold: {
    id: 'gold',
    name: 'Galactic Federation Class-A Morty Certificate',
    desc: 'Premium administrative exemption permit. Temporarily boosts all job productivity by +60% for 12 minutes.',
    boostPercent: 0.60,
    duration: 720,
    costs: {
      parchment: 45,
      slab: 45,
      plate: 45,
      science: 1500,
    }
  },
  infinite: {
    id: 'infinite',
    name: 'Council of Ricks Multiversal Sovereign Stamp',
    desc: 'Sub-space supreme identification passport. Temporarily doubles all job productivity (+100%) for 20 minutes.',
    boostPercent: 1.00,
    duration: 1200,
    costs: {
      parchment: 100,
      beam: 90,
      slab: 90,
      plate: 90,
      science: 4000,
    }
  }
};

const BASE_RESOURCES: Record<ResourceType, { amount: number; max: number }> = {
  catnip: { amount: 50, max: 2000 },
  wood: { amount: 0, max: 200 },
  minerals: { amount: 0, max: 0 },
  iron: { amount: 0, max: 0 },
  science: { amount: 0, max: 0 },
  culture: { amount: 0, max: 0 },
  parchment: { amount: 0, max: 100 },
  beam: { amount: 0, max: 100 },
  slab: { amount: 0, max: 100 },
  plate: { amount: 0, max: 100 },
};

const BASE_BUILDINGS: Record<BuildingType, number> = {
  catnipField: 0,
  aqueduct: 0,
  pasture: 0,
  hut: 0,
  logHouse: 0,
  mansion: 0,
  barn: 0,
  warehouse: 0,
  library: 0,
  academy: 0,
  mine: 0,
  smelter: 0,
  amphitheatre: 0
};

const BASE_RESEARCHED: Record<ScienceType, boolean> = {
  calendar: false,
  agriculture: false,
  woodworking: false,
  mining: false,
  metalworking: false,
  writing: false,
  theology: false
};

const BASE_UPGRADES: Record<UpgradeType, boolean> = {
  mineralAxes: false,
  ironAxes: false,
  catnipSilos: false,
  reinforcedBarns: false,
  expandedStorage: false,
  portalHeaters: false
};

export const calculateCost = (baseCost: number, ratio: number, amount: number) => {
  return baseCost * Math.pow(ratio, amount);
};

export function calculateJobStrengths(kittens: Kitten[]): Record<JobType, number> {
  const strengths: Record<JobType, number> = {
    farmer: 0,
    woodcutter: 0,
    scholar: 0,
    miner: 0,
    priest: 0
  };

  if (!Array.isArray(kittens)) return strengths;

  kittens.forEach(k => {
    if (k.job !== 'unemployed' && strengths[k.job] !== undefined) {
      // Base strength is 1.0. Plus 5% per level above 1
      let multiplier = 1 + (k.level - 1) * 0.05;

      // Trait-specific bonuses (+10%)
      if (k.trait) {
        if (k.job === 'farmer' && k.trait.includes('High Anxiety')) {
          multiplier += 0.10;
        } else if (k.job === 'woodcutter' && k.trait.includes('Adrenaline Rush')) {
          multiplier += 0.10;
        } else if (k.job === 'scholar' && k.trait.includes('Wubba Lubba')) {
          multiplier += 0.10;
        } else if (k.job === 'miner' && k.trait.includes('Sub-atomic')) {
          multiplier += 0.10;
        } else if (k.job === 'priest' && k.trait.includes('Ultra-Schwifty')) {
          multiplier += 0.10;
        }
      }

      strengths[k.job] += multiplier;
    }
  });

  return strengths;
}

const initialLogs: GameLogMessage[] = [
  {
    id: 'initial',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    text: "Rick's portal scanner online. Cultivate Mega Seeds, engineer Laboratories, and gather alternative Mortys.",
    type: 'success'
  }
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      resources: BASE_RESOURCES,
      buildings: BASE_BUILDINGS,
      researched: BASE_RESEARCHED,
      upgrades: BASE_UPGRADES,
      village: {
        kittens: [],
        maxKittens: 0,
        happiness: 100,
      },
      activeCertificates: [],
      craftedCertificatesCount: { bronze: 0, silver: 0, gold: 0, infinite: 0 },
      achievements: {},
      portalFlux: 0,
      season: {
        current: 'Spring',
        daysPassed: 0,
        totalDays: 100,
      },
      unlocks: {
        wood: false,
        minerals: false,
        iron: false,
        science: false,
        village: false,
        workshop: false,
        culture: false,
      },
      gameSpeed: 1,
      soundEnabled: true,
      lastTick: Date.now(),
      logs: initialLogs,
      theme: 'dark',
      buyMultiplier: 1,
      insaneMode: true,
      density: 'relaxed',
      activeAnomaly: null,
      autoBuild: {
        pasture: false,
        barn: false,
      },
      portalResets: 0,
      prestigeMultiplier: 1.0,

      addLog: (text: string, type: GameLogMessage['type'] = 'info') => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newMsg: GameLogMessage = {
          id: Math.random().toString(),
          time: timeStr,
          text,
          type
        };
        set(state => ({
          logs: [newMsg, ...state.logs].slice(0, 80) // keep last 80 messages for high performance
        }));
      },

      toggleAutoBuild: (type: 'pasture' | 'barn') => set(state => ({
        autoBuild: {
          ...state.autoBuild,
          [type]: !state.autoBuild[type]
        }
      })),

      setGameSpeed: (speed: number) => set({ gameSpeed: speed }),
      toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),
      setTheme: (theme: 'dark' | 'light') => set({ theme }),
      setBuyMultiplier: (multiplier: 1 | 5 | 25) => set({ buyMultiplier: multiplier }),

      tick: (deltaSeconds: number) => {
        let state = get();
        
        // Dynamic state correction: Self-heal if village structure is outdated or corrupt
        if (!state.village || !Array.isArray(state.village.kittens)) {
          const prevKittensCount = (state.village && typeof state.village.kittens === 'number') 
            ? (state.village.kittens as number) 
            : 0;
            
          const maxKittens = (state.buildings?.hut * 2) + (state.buildings?.logHouse * 1) + (state.buildings?.mansion * 4) || 0;
          const healedKittens: Kitten[] = [];
          
          // Limit to physical capacity
          const countToCreate = Math.min(prevKittensCount > 0 ? prevKittensCount : 0, maxKittens);
          for (let i = 0; i < countToCreate; i++) {
            healedKittens.push(generateRandomKitten());
          }
          
          set({
            village: {
              kittens: healedKittens,
              maxKittens: maxKittens,
              happiness: (state.village && typeof state.village.happiness === 'number') ? state.village.happiness : 100,
            }
          });
          state = get(); // retrieve healed state
        }

        if (state.gameSpeed === 0) return; // paused

        // Incorporate game speed multiplier
        const effectiveDelta = deltaSeconds * state.gameSpeed * 1.5; // slight speed-up to make incremental play feel super responsive
        const now = Date.now();

        // Count down active certificates
        let updatedActive = (state.activeCertificates || []).map(cert => ({
          ...cert,
          timeRemaining: cert.timeRemaining - effectiveDelta
        })).filter(cert => cert.timeRemaining > 0);

        // Log expiration
        const prevActive = state.activeCertificates || [];
        if (prevActive.length > updatedActive.length) {
          prevActive.forEach(p => {
            const hasExpired = !updatedActive.some(u => u.id === p.id);
            if (hasExpired) {
              state.addLog(`Booster expired: ${p.name}'s production multiplier is deactivated.`, 'info');
            }
          });
        }

        const totalBoost = updatedActive.reduce((acc, cert) => acc + cert.boostPercent, 0);
        const certificateMultiplier = 1 + totalBoost;
        const portalFluxMultiplier = 1 + (state.portalFlux * 0.1);
        let productionMultiplier = certificateMultiplier * portalFluxMultiplier;

        // Anomaly tracking and processing
        let activeAnomaly = state.activeAnomaly ? { ...state.activeAnomaly } : null;
        let customCatnipDrain = 0;
        let customWoodDrain = 0;
        let customCultureDrain = 0;
        let microverseDecayActive = false;
        let federationRaidActive = false;
        let applyExplosionPenalty: string | null = null;

        if (activeAnomaly) {
          activeAnomaly.durationLeft -= effectiveDelta;
          
          if (activeAnomaly.durationLeft <= 0) {
            applyExplosionPenalty = activeAnomaly.type;
            let logMsg = '';
            
            if (applyExplosionPenalty === 'fluid_leak') {
              logMsg = '🚨 CRITICAL FAULT: Portal fluid rupture flooded the crops! 40% of Mega Seed and 20% of Plutonium reserves dissolved in sub-space acid!';
            } else if (applyExplosionPenalty === 'fed_raid') {
              logMsg = '🚨 CITADEL RAID: Galactic Federation hit squads breached the Clone Bay! Snatched 50% of your Crystals/Neutrium and captured 1 Morty!';
            } else if (applyExplosionPenalty === 'cromulon') {
              logMsg = '🚨 CROMULON REJECTION: The Giant Cosmic Head yelled DISQUALIFIED! Vibe down 50% and local morale is devastated.';
            } else if (applyExplosionPenalty === 'microverse_decay') {
              logMsg = '🚨 MICROVERSE COLLAPSE: A pocket reality collapsed, scattering 30% of stored raw materials into outer voids!';
            }
            
            state.addLog(logMsg, 'death');
            activeAnomaly = null;
          } else {
            if (activeAnomaly.type === 'fluid_leak') {
              customCatnipDrain = 8.0;
              customWoodDrain = 1.2;
            } else if (activeAnomaly.type === 'cromulon') {
              customCultureDrain = 4.0;
            } else if (activeAnomaly.type === 'microverse_decay') {
              microverseDecayActive = true;
            } else if (activeAnomaly.type === 'fed_raid') {
              federationRaidActive = true;
            }
          }
        } else if (state.insaneMode) {
          // Dimensional Anomalies occur only later once Laser Fault-Drilling (mining) is researched, the clone base size is >= 6, and at a much lower rate (over 13x lower probability)
          if (state.researched.mining && state.village.kittens.length >= 6 && Math.random() < 0.0006 * effectiveDelta) {
            const types = ['fluid_leak', 'fed_raid', 'cromulon', 'microverse_decay'] as const;
            const chosenType = types[Math.floor(Math.random() * types.length)];
            
            let name = '';
            let desc = '';
            if (chosenType === 'fluid_leak') {
              name = 'Portal Acid Geyser';
              desc = 'Toxic fluid leaking. Drains Mega Seeds and Plutonium passively. Resolve before detritus floods!';
            } else if (chosenType === 'fed_raid') {
              name = 'Galactic Fed Patrol';
              desc = 'Interdimensional spies sniffing. Reduces general production by 50%. Resolve or they storm the gates!';
            } else if (chosenType === 'cromulon') {
              name = 'Displeased Cosmic Cromulon';
              desc = 'Giant cosmic head demands song. Steals Schwifty Vibes. Resolve or happiness crashes!';
            } else if (chosenType === 'microverse_decay') {
              name = 'Microverse Pocket Compression';
              desc = 'Reality bounds shrinking. Halves all storage facilities. Resolve or elements collapse!';
            }

            activeAnomaly = {
              id: Math.random().toString(),
              type: chosenType,
              name,
              desc,
              durationLeft: 20,
              clicksRequired: 10,
              clicksMade: 0
            };
            
            state.addLog(`🚨 WARNING: Dimensional Anomaly [${name}] detected! Resolve in the Portal Stabilizer immediately!`, 'warn');
          }
        }

        if (state.insaneMode) {
          productionMultiplier *= 0.65;
        }
        if (federationRaidActive) {
          productionMultiplier *= 0.50;
        }

        // 1. Storage upgrade ratios
        const barnMultiplier = state.upgrades.reinforcedBarns ? 1.4 : 1.0;
        const warehouseMultiplier = state.upgrades.expandedStorage ? 1.35 : 1.0;

        // Space calculations from buildings
        let maxCatnip = 2000 + (state.buildings.pasture * 500) + (state.buildings.barn * 2500 * barnMultiplier);
        if (state.upgrades.catnipSilos) maxCatnip *= 1.5;

        let maxWood = 200 + (state.buildings.barn * 200 * barnMultiplier) + (state.buildings.warehouse * 150 * warehouseMultiplier);
        let maxMinerals = (state.buildings.barn * 250 * barnMultiplier) + (state.buildings.warehouse * 500 * warehouseMultiplier);
        let maxIron = (state.buildings.barn * 50 * barnMultiplier) + (state.buildings.warehouse * 150 * warehouseMultiplier);
        let maxScience = (state.buildings.library * 250) + (state.buildings.academy * 1000) + (state.buildings.warehouse * 100 * warehouseMultiplier);

        if (microverseDecayActive) {
          maxCatnip *= 0.5;
          maxWood *= 0.5;
          maxMinerals *= 0.5;
          maxIron *= 0.5;
          maxScience *= 0.5;
        }
        
        // Max housing space
        const maxKittens = (state.buildings.hut * 2) + (state.buildings.logHouse * 1) + (state.buildings.mansion * 4);

        // 2. Season Progression (2 seconds of tick time = 1 Day!)
        let currentSeason = state.season.current;
        let daysPassed = state.season.daysPassed + (effectiveDelta * 0.5);
        if (daysPassed >= state.season.totalDays) {
          daysPassed = 0;
          const cycle: SeasonType[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
          const currentIndex = cycle.indexOf(currentSeason);
          const nextIndex = (currentIndex + 1) % cycle.length;
          currentSeason = cycle[nextIndex];
          
          state.addLog(
            `A seasonal shift occurs! ${currentSeason} begins: ${SEASONS_DATA[currentSeason].desc}`,
            'season'
          );
        }

        // 3. Happiness Calculations
        // Base is 100%. If population > 5, each extra kitten causes -2% crowding stress.
        // Amphitheatres reduce stress or boost happiness directly by +4% each.
        // Dimension travelers boost happiness by +5% each.
        const kittenCount = state.village.kittens.length;
        let crowdingPenalty = 0;
        if (kittenCount > 5) {
          crowdingPenalty = (kittenCount - 5) * 2;
        }
        let travelerHappinessBoost = 0;
        state.village.kittens.forEach(k => {
          if (k.trait && k.trait.includes('Dimension traveler')) {
            travelerHappinessBoost += 5;
          }
        });
        const amphitheatreBoost = state.buildings.amphitheatre * 4;
        let finalHappiness = Math.min(150, Math.max(10, 100 - crowdingPenalty + amphitheatreBoost + travelerHappinessBoost));

        // 4. Job Production rates per second
        // Check kitten count in each job and calculate level plus trait adjusted job strengths
        const jobCounts: Record<JobType, number> = {
          farmer: 0,
          woodcutter: 0,
          scholar: 0,
          miner: 0,
          priest: 0
        };
        state.village.kittens.forEach(k => {
          if (k.job !== 'unemployed') {
            jobCounts[k.job]++;
          }
        });
        const jobStrengths = calculateJobStrengths(state.village.kittens);

        // FARMING: boost from agriculture, season modifier, and aqueduct multiplier
        const farmerEffBonus = state.researched.agriculture ? 1.20 : 1.0;
        const agricultureGreenhouseBonus = state.researched.agriculture ? 1.25 : 1.0;
        let seasonModifier = state.researched.calendar ? SEASONS_DATA[currentSeason].catnipModifier : 1.0;
        
        if (state.insaneMode && currentSeason === 'Winter') {
          seasonModifier = state.upgrades.portalHeaters ? 0.35 : 0.05;
        } else if (state.upgrades.portalHeaters && currentSeason === 'Winter') {
          seasonModifier = Math.max(seasonModifier, 0.55);
        }
        
        const aqueductBoost = 1 + (state.buildings.aqueduct * 0.15); // +15% passive production per aqueduct

        // Base field production is passive
        const fieldsPassiveRate = state.buildings.catnipField * 0.63 * seasonModifier * aqueductBoost * agricultureGreenhouseBonus;
        const farmerRate = jobStrengths.farmer * 5.0 * farmerEffBonus * seasonModifier * productionMultiplier;
        let catnipRate = fieldsPassiveRate + farmerRate;

        // KITTEN STARVATION: Each kitten consumes more under strain (hard mode)
        // Pasture reduces food intake by 1.5% each, up to 50% max reduction
        const pastureIntakeReduction = Math.max(0.50, 1 - (state.buildings.pasture * 0.015));
        const baseFoodDemandPerMorty = state.insaneMode ? 5.50 : 4.25;
        let totalFoodDemand = 0;
        state.village.kittens.forEach(k => {
          let multiplier = 1.0;
          if (k.trait && k.trait.includes('Mega-Seed Tolerant')) {
            multiplier = 0.95;
          }
          totalFoodDemand += baseFoodDemandPerMorty * multiplier;
        });
        const kittenEatsRate = totalFoodDemand * pastureIntakeReduction;
        
        catnipRate -= kittenEatsRate;
        catnipRate -= customCatnipDrain; // Anomaly drain

        // Starving condition
        let catnipAmt = state.resources.catnip.amount + (catnipRate * effectiveDelta);
        let hungerState = false;
        if (catnipAmt < 0) {
          catnipAmt = 0;
          hungerState = true;
          finalHappiness = Math.max(10, finalHappiness - 40); // lose 40% happiness if starving
        }

        // Efficiency modifier from happiness
        const efficiencyFactor = finalHappiness / 100;

        // WOODCUTTER (Plutonium Scrapper) boosted by woodworking research
        let axeMultiplier = 1.0;
        if (state.upgrades.ironAxes) axeMultiplier = 1.75;
        else if (state.upgrades.mineralAxes) axeMultiplier = 1.25;

        const woodworkingWoodcutterBonus = state.researched.woodworking ? 1.15 : 1.0;
        const woodcutterBase = jobStrengths.woodcutter * 0.10 * axeMultiplier * efficiencyFactor * productionMultiplier * woodworkingWoodcutterBonus;
        let woodRate = woodcutterBase;

        // SCHOLAR boosted by writing (Interdimensional Cable) research
        // Libraries & academies boost scholars
        const academyScholarMod = 1 + (state.buildings.academy * 0.20);
        const writingScholarBonus = state.researched.writing ? 1.25 : 1.0;
        let scienceRate = jobStrengths.scholar * 0.25 * academyScholarMod * efficiencyFactor * productionMultiplier * writingScholarBonus;

        // MINER boosted by mining (Laser Fault-Drilling) research
        const miningMinerBonus = state.researched.mining ? 1.20 : 1.0;
        const minerBase = jobStrengths.miner * 0.18 * efficiencyFactor * productionMultiplier * miningMinerBonus;
        // Mine adds slightly passive mineral gain as well
        let mineralsRate = minerBase + (state.buildings.mine * 0.05 * miningMinerBonus);

        // PRIEST (Schwifty Musician) boosted by theology (Cromulon Reverence) research
        const theologyPriestBonus = state.researched.theology ? 1.40 : 1.0;
        let cultureRate = jobStrengths.priest * 0.15 * efficiencyFactor * productionMultiplier * theologyPriestBonus;

        // Apply passive anomaly drains
        woodRate -= customWoodDrain;
        cultureRate -= customCultureDrain;

        // SMELTER PASSIVES (boosted by metalworking research)
        // Consumes 1.0 Wood and 10 Minerals to smelt +0.15 Iron per smelter
        const metalworkingSmelterBonus = state.researched.metalworking ? 1.30 : 1.0;
        let ironRate = 0;
        if (state.buildings.smelter > 0) {
          const count = state.buildings.smelter;
          const woodDemand = count * 1.0 * effectiveDelta;
          const minDemand = count * 10.0 * effectiveDelta;
          
          if (state.resources.wood.amount >= woodDemand && state.resources.minerals.amount >= minDemand) {
            // Apply consumption
            woodRate -= count * 1.0;
            mineralsRate -= count * 10.0;
            ironRate += count * 0.18 * metalworkingSmelterBonus * productionMultiplier; // SMELTER affects output with active boosters as well
          }
        }

        // Apply rates with delta
        let woodAmt = state.resources.wood.amount + (woodRate * effectiveDelta);
        let mineralsAmt = state.resources.minerals.amount + (mineralsRate * effectiveDelta);
        let scienceAmt = state.resources.science.amount + (scienceRate * effectiveDelta);
        let ironAmt = state.resources.iron.amount + (ironRate * effectiveDelta);
        let cultureAmt = state.resources.culture.amount + (cultureRate * effectiveDelta);

        // Apply instant disaster explosion impacts (if they go unresolved)
        const updatedKittens = [...state.village.kittens];
        if (applyExplosionPenalty) {
          if (applyExplosionPenalty === 'fluid_leak') {
            catnipAmt *= 0.60;
            woodAmt *= 0.80;
          } else if (applyExplosionPenalty === 'fed_raid') {
            mineralsAmt *= 0.50;
            ironAmt *= 0.50;
            if (updatedKittens.length > 0) {
              const deceased = updatedKittens.pop();
              if (deceased) {
                state.addLog(`💀 DISASTER RAID: Galactic Federation spies captured and liquidated ${deceased.name} ${deceased.surname} in transit!`, 'death');
              }
            }
          } else if (applyExplosionPenalty === 'cromulon') {
            cultureAmt *= 0.50;
            finalHappiness = Math.max(10, finalHappiness - 50);
          } else if (applyExplosionPenalty === 'microverse_decay') {
            catnipAmt *= 0.70;
            woodAmt *= 0.70;
            mineralsAmt *= 0.70;
            ironAmt *= 0.70;
            scienceAmt *= 0.70;
          }
        }

        // Clamping amounts to max
        catnipAmt = Math.min(catnipAmt, maxCatnip);
        woodAmt = Math.min(woodAmt, maxWood);
        mineralsAmt = Math.min(mineralsAmt, maxMinerals);
        ironAmt = Math.min(ironAmt, maxIron);
        scienceAmt = Math.min(scienceAmt, maxScience);
        // Culture does not have a hard ceiling in standard kittens, let's cap at 10000 set in state
        cultureAmt = Math.min(cultureAmt, 100000);

        // Ensure positive bottom values
        if (woodAmt < 0) woodAmt = 0;
        if (mineralsAmt < 0) mineralsAmt = 0;
        if (scienceAmt < 0) scienceAmt = 0;
        if (ironAmt < 0) ironAmt = 0;
        if (cultureAmt < 0) cultureAmt = 0;

        // Auto-build
        const updatedBuildings = { ...state.buildings };
        const autoBuildable = ['pasture', 'barn'] as const;
        autoBuildable.forEach(b => {
          if (state.autoBuild?.[b]) {
            const bDef = BUILDINGS[b];
            while (true) {
              const owned = updatedBuildings[b];
              if (bDef.maxLimit !== undefined && owned >= bDef.maxLimit) break;
              
              let canAfford = true;
              const computedCosts: Record<string, number> = {};
              for (const [resType, baseCost] of Object.entries(bDef.baseCost)) {
                const cost = calculateCost(baseCost, bDef.costRatio, owned);
                computedCosts[resType] = cost;
                
                let curAmt = 0;
                if (resType === 'catnip') curAmt = catnipAmt;
                else if (resType === 'wood') curAmt = woodAmt;
                else if (resType === 'minerals') curAmt = mineralsAmt;
                else if (resType === 'iron') curAmt = ironAmt;
                else if (resType === 'science') curAmt = scienceAmt;
                else if (resType === 'culture') curAmt = cultureAmt;
                
                if (curAmt < cost) {
                  canAfford = false;
                  break;
                }
              }

              if (canAfford) {
                if (computedCosts.catnip) catnipAmt -= computedCosts.catnip;
                if (computedCosts.wood) woodAmt -= computedCosts.wood;
                if (computedCosts.minerals) mineralsAmt -= computedCosts.minerals;
                if (computedCosts.iron) ironAmt -= computedCosts.iron;
                if (computedCosts.science) scienceAmt -= computedCosts.science;
                if (computedCosts.culture) cultureAmt -= computedCosts.culture;
                
                updatedBuildings[b] += 1;
              } else {
                break;
              }
            }
          }
        });

        // 5. Unlocks Checks
        const unlocks = { ...state.unlocks };
        if (!unlocks.wood && (catnipAmt >= 100 || state.buildings.catnipField > 0)) unlocks.wood = true;
        if (!unlocks.minerals && (state.buildings.mine > 0 || mineralsAmt > 5 || state.researched.mining)) unlocks.minerals = true;
        if (!unlocks.iron && (state.buildings.smelter > 0 || ironAmt > 0)) unlocks.iron = true;
        if (!unlocks.science && (state.buildings.library > 0 || scienceAmt > 0)) {
          unlocks.science = true;
          unlocks.workshop = true;
        }
        if (!unlocks.village && maxKittens > 0) {
          unlocks.village = true;
        }
        if (!unlocks.culture && (cultureAmt > 0 || state.researched.theology)) {
          unlocks.culture = true;
        }

        //6. Kitten Survival & Recruitment
        
        // Starvation logic checks
        // If hunger and kittens exist, there is a small risk they run away or die! (e.g. 1.2% chance per active starving tick)
        if (hungerState && updatedKittens.length > 0) {
          const baseRisk = state.insaneMode ? 0.15 : 0.05;
          const starvationRisk = baseRisk * effectiveDelta;
          if (Math.random() < starvationRisk) {
            const deceased = updatedKittens.pop();
            if (deceased) {
              state.addLog(
                `Unfortunate tragedy! ${deceased.name} ${deceased.surname} ran dry on seeds and suffered agonizing withdrawal. Cultivate Mega Seeds immediately!`, 
                'death'
              );
            }
          }
        }

        // Recruit new kitten logic (every few seconds, with probability scaled by happiness & free space)
        if (updatedKittens.length < maxKittens && catnipAmt > (maxCatnip * 0.12) && !hungerState) {
          const spawnWeight = 0.02 * (finalHappiness / 100) * effectiveDelta;
          if (Math.random() < spawnWeight) {
            const newKitty = generateRandomKitten();
            updatedKittens.push(newKitty);
            state.addLog(
              `An alternate Morty climbed out of a green portal! Welcome ${newKitty.name} ${newKitty.surname} (${newKitty.trait}).`, 
              'success'
            );
          }
        }

        // Let's increment exp of working kittens slightly for high-quality progression feel!
        updatedKittens.forEach(kitty => {
          if (kitty.job !== 'unemployed') {
            kitty.exp += effectiveDelta * 0.1;
            if (kitty.exp >= kitty.level * 100) {
              kitty.exp = 0;
              kitty.level += 1;
              state.addLog(
                `${kitty.name} ${kitty.surname} leveled up! Level ${kitty.level} ${kitty.job}. Output efficiency increased.`, 
                'success'
              );
            }
          }
        });

        // Assess live achievement milestones
        const currentAchievements = state.achievements || {};
        const updatedAchievements = { ...currentAchievements };
        const tempState: GameState = {
          ...state,
          resources: {
            catnip: { amount: catnipAmt, max: maxCatnip },
            wood: { amount: woodAmt, max: maxWood },
            minerals: { amount: mineralsAmt, max: maxMinerals },
            iron: { amount: ironAmt, max: maxIron },
            science: { amount: scienceAmt, max: maxScience },
            culture: { amount: cultureAmt, max: 100000 },
            parchment: { amount: state.resources.parchment.amount, max: 5000 },
            beam: { amount: state.resources.beam.amount, max: 5000 },
            slab: { amount: state.resources.slab.amount, max: 5000 },
            plate: { amount: state.resources.plate.amount, max: 5000 },
          },
          village: {
            kittens: updatedKittens,
            maxKittens,
            happiness: finalHappiness
          },
          unlocks,
          buildings: updatedBuildings,
          researched: state.researched,
          upgrades: state.upgrades,
          craftedCertificatesCount: state.craftedCertificatesCount || { bronze: 0, silver: 0, gold: 0, infinite: 0 }
        } as any;

        const logsToAppend: GameLogMessage[] = [];
        ACHIEVEMENTS.forEach(ach => {
          if (!updatedAchievements[ach.id] && ach.check(tempState)) {
            updatedAchievements[ach.id] = true;
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            logsToAppend.push({
              id: `ach-${ach.id}-${Math.random()}`,
              time: timeStr,
              text: `🏆 Achievement Unlocked: ${ach.name}! "${ach.quote}"`,
              type: 'success'
            });
          }
        });

        let finalLogs = state.logs;
        if (logsToAppend.length > 0) {
          finalLogs = [...logsToAppend, ...state.logs].slice(0, 80);
        }

        set({
          lastTick: now,
          activeCertificates: updatedActive,
          achievements: updatedAchievements,
          logs: finalLogs,
          season: {
            ...state.season,
            current: currentSeason,
            daysPassed: Math.floor(daysPassed)
          },
          resources: {
            catnip: { amount: catnipAmt, max: maxCatnip },
            wood: { amount: woodAmt, max: maxWood },
            minerals: { amount: mineralsAmt, max: maxMinerals },
            iron: { amount: ironAmt, max: maxIron },
            science: { amount: scienceAmt, max: maxScience },
            culture: { amount: cultureAmt, max: 100000 },
            // Crafted materials can hold up to 10M
            parchment: { amount: state.resources.parchment.amount, max: 5000 },
            beam: { amount: state.resources.beam.amount, max: 5000 },
            slab: { amount: state.resources.slab.amount, max: 5000 },
            plate: { amount: state.resources.plate.amount, max: 5000 },
          },
          village: {
            kittens: updatedKittens,
            maxKittens,
            happiness: finalHappiness
          },
          buildings: updatedBuildings,
          unlocks,
          activeAnomaly
        });
      },

      gatherCatnip: (multiplier: number = 1) => set(state => {
        // Gathering catnip manually is highly customizable
        const amt = Math.min(
          state.resources.catnip.amount + (1 * multiplier), 
          state.resources.catnip.max
        );
        const unlocks = { ...state.unlocks };
        if (amt >= 100) unlocks.wood = true;
        return {
          resources: {
            ...state.resources,
            catnip: { ...state.resources.catnip, amount: amt }
          },
          unlocks
        };
      }),

      refineResource: (craftType, amount = 1) => set(state => {
        const res = JSON.parse(JSON.stringify(state.resources)) as GameState['resources'];
        
        if (craftType === 'wood') {
          // Refine catnip to wood: 100 catnip -> 1 wood
          const catnipCost = 100 * amount;
          if (res.catnip.amount >= catnipCost) {
            res.catnip.amount -= catnipCost;
            res.wood.amount = Math.min(res.wood.max, res.wood.amount + amount);
            // play sound logic
          }
        } 
        else if (craftType === 'beam') {
          // Refine wood -> beam: 175 wood -> 1 beam
          const cost = 175 * amount;
          if (state.researched.woodworking && res.wood.amount >= cost) {
            res.wood.amount -= cost;
            res.beam.amount = Math.min(res.beam.max, res.beam.amount + amount);
          }
        } 
        else if (craftType === 'slab') {
          // Refine minerals -> slab: 250 minerals -> 1 slab
          const cost = 250 * amount;
          if (state.researched.mining && res.minerals.amount >= cost) {
            res.minerals.amount -= cost;
            res.slab.amount = Math.min(res.slab.max, res.slab.amount + amount);
          }
        } 
        else if (craftType === 'plate') {
          // Refine iron -> plate: 150 iron -> 1 plate
          const cost = 150 * amount;
          if (state.researched.metalworking && res.iron.amount >= cost) {
            res.iron.amount -= cost;
            res.plate.amount = Math.min(res.plate.max, res.plate.amount + amount);
          }
        } 
        else if (craftType === 'parchment') {
          // Refine science + culture -> parchment: 175 science + 5 culture -> 1 parchment
          const sciCost = 175 * amount;
          const cultCost = 5 * amount;
          if (state.researched.writing && res.science.amount >= sciCost && res.culture.amount >= cultCost) {
            res.science.amount -= sciCost;
            res.culture.amount -= cultCost;
            res.parchment.amount = Math.min(res.parchment.max, res.parchment.amount + amount);
          }
        }

        return { resources: res };
      }),

      buyBuilding: (type, quantity = 1) => set(state => {
        const bDef = BUILDINGS[type];
        const owned = state.buildings[type];
        
        if (bDef.maxLimit !== undefined && owned + quantity > bDef.maxLimit) {
          state.addLog(`Access Denied! Capacity reached for ${bDef.name} (${owned}/${bDef.maxLimit}).`, 'warn');
          return state;
        }
        
        let canAfford = true;
        const res = JSON.parse(JSON.stringify(state.resources)) as GameState['resources'];
        
        // evaluate costs
        const computedCosts: Record<string, number> = {};
        for (const [resType, baseCost] of Object.entries(bDef.baseCost)) {
          let totalCost = 0;
          for (let i = 0; i < quantity; i++) {
            totalCost += calculateCost(baseCost, bDef.costRatio, owned + i);
          }
          computedCosts[resType] = totalCost;
          
          const currentRes = res[resType as ResourceType];
          if (!currentRes || currentRes.amount < totalCost) {
            canAfford = false;
            break;
          }
        }

        if (canAfford) {
          // deduct
          for (const [resType, costVal] of Object.entries(computedCosts)) {
            res[resType as ResourceType].amount -= costVal;
          }
          
          const qtyText = quantity === 1 ? 'one' : `${quantity}x`;
          state.addLog(`Built ${qtyText} ${bDef.name} for the Citadel.`, 'success');
          
          return {
            resources: res,
            buildings: {
              ...state.buildings,
              [type]: owned + quantity
            }
          };
        }
        return state;
      }),

      assignJob: (kittenId, job) => set(state => {
        const kittensList = Array.isArray(state.village?.kittens) ? state.village.kittens : [];
        const kittens = kittensList.map(k => {
          if (k.id === kittenId) {
            return { ...k, job };
          }
          return k;
        });
        
        const unlocks = { ...state.unlocks };
        kittens.forEach(k => {
          if (k.job === 'woodcutter') unlocks.wood = true;
          if (k.job === 'miner') unlocks.minerals = true;
          if (k.job === 'scholar') {
            unlocks.science = true;
            unlocks.workshop = true;
          }
          if (k.job === 'priest') unlocks.culture = true;
        });

        return {
          village: {
            ...state.village,
            kittens
          },
          unlocks
        };
      }),

      assignJobsMultiple: (kittenIds, job) => set(state => {
        const kittensList = Array.isArray(state.village?.kittens) ? state.village.kittens : [];
        const idSet = new Set(kittenIds);
        const kittens = kittensList.map(k => {
          if (idSet.has(k.id)) {
            return { ...k, job };
          }
          return k;
        });
        
        const unlocks = { ...state.unlocks };
        kittens.forEach(k => {
          if (k.job === 'woodcutter') unlocks.wood = true;
          if (k.job === 'miner') unlocks.minerals = true;
          if (k.job === 'scholar') {
            unlocks.science = true;
            unlocks.workshop = true;
          }
          if (k.job === 'priest') unlocks.culture = true;
        });

        return {
          village: {
            ...state.village,
            kittens
          },
          unlocks
        };
      }),

      autoAssignAll: (job) => set(state => {
        const kittensList = Array.isArray(state.village?.kittens) ? state.village.kittens : [];
        const kittens = kittensList.map(k => {
          if (k.job === 'unemployed') {
            return { ...k, job };
          }
          return k;
        });

        const unlocks = { ...state.unlocks };
        kittens.forEach(k => {
          if (k.job === 'woodcutter') unlocks.wood = true;
          if (k.job === 'miner') unlocks.minerals = true;
          if (k.job === 'scholar') {
            unlocks.science = true;
            unlocks.workshop = true;
          }
          if (k.job === 'priest') unlocks.culture = true;
        });

        return {
          village: {
            ...state.village,
            kittens
          },
          unlocks
        };
      }),

      unassignAll: () => set(state => {
        const kittensList = Array.isArray(state.village?.kittens) ? state.village.kittens : [];
        const kittens = kittensList.map(k => ({ ...k, job: 'unemployed' as const }));
        return {
          village: {
            ...state.village,
            kittens
          }
        };
      }),

      researchScience: (type) => set(state => {
        if (state.researched[type]) return state;
        const def = SCIENCES[type];
        
        const res = JSON.parse(JSON.stringify(state.resources)) as GameState['resources'];
        let canAfford = true;

        for (const [resType, cost] of Object.entries(def.cost)) {
          const currentRes = res[resType as ResourceType];
          if (!currentRes || currentRes.amount < cost) {
            canAfford = false;
            break;
          }
        }

        if (canAfford) {
          for (const [resType, cost] of Object.entries(def.cost)) {
            res[resType as ResourceType].amount -= cost;
          }

          state.addLog(`Technology Researched: ${def.name}! ${def.effectsDesc}`, 'success');

          return {
            resources: res,
            researched: {
              ...state.researched,
              [type]: true
            }
          };
        }
        return state;
      }),

      buyUpgrade: (type) => set(state => {
        if (state.upgrades[type]) return state;
        const def = UPGRADES[type];

        const res = JSON.parse(JSON.stringify(state.resources)) as GameState['resources'];
        let canAfford = true;

        for (const [resType, cost] of Object.entries(def.cost)) {
          const currentRes = res[resType as ResourceType];
          if (!currentRes || currentRes.amount < cost) {
            canAfford = false;
            break;
          }
        }

        if (canAfford) {
          for (const [resType, cost] of Object.entries(def.cost)) {
            res[resType as ResourceType].amount -= cost;
          }

          state.addLog(`Upgrade Purchased: ${def.name}! ${def.effectsDesc}`, 'success');

          return {
            resources: res,
            upgrades: {
              ...state.upgrades,
              [type]: true
            }
          };
        }
        return state;
      }),

      forceAddKitten: () => set(state => {
         // cheat / manual recruiter
         const maxKittens = (state.buildings.hut * 2) + (state.buildings.logHouse * 1) + (state.buildings.mansion * 4);
         const kittensList = Array.isArray(state.village?.kittens) ? state.village.kittens : [];
         if (kittensList.length < maxKittens) {
            const extra = generateRandomKitten();
            state.addLog(`A stray Morty wanders out of space-time: ${extra.name} ${extra.surname}.`, 'success');
            return {
              village: {
                ...state.village,
                kittens: [...kittensList, extra]
              }
            };
         }
         return state;
      }),

      portalReset: () => {
        const state = get();
        // Calculate flux from progress (total buildings + kittens)
        const totalBuildings = Object.values(state.buildings).reduce((a, b) => a + b, 0);
        const totalKittens = state.village.kittens.length;
        const fluxEarned = Math.floor(Math.sqrt((totalBuildings + totalKittens + 1) / 10));

        if (window.confirm(`Are you absolutely sure you want to trigger a dimension hop? You will earn ${fluxEarned} Portal Flux, which grants a global ${fluxEarned * 10}% production multiplier. All other progress will be reset.`)) {
          set({
            resources: BASE_RESOURCES,
            buildings: BASE_BUILDINGS,
            researched: BASE_RESEARCHED,
            upgrades: BASE_UPGRADES,
            village: {
              kittens: [],
              maxKittens: 0,
              happiness: 100,
            },
            activeCertificates: [],
            craftedCertificatesCount: { bronze: 0, silver: 0, gold: 0, infinite: 0 },
            season: {
              current: 'Spring',
              daysPassed: 0,
              totalDays: 100,
            },
            unlocks: {
              wood: false,
              minerals: false,
              iron: false,
              science: false,
              village: false,
              workshop: false,
              culture: false,
            },
            logs: [
              {
                id: 'reset',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                text: `Portal Reset complete! You acquired ${fluxEarned} Portal Flux points. Welcome to a new dimension.`,
                type: 'success'
              }
            ],
            portalResets: state.portalResets + 1,
            portalFlux: state.portalFlux + fluxEarned,
            lastTick: Date.now()
          });
        }
      },

      synthesizeCertificate: (certificateType: 'bronze' | 'silver' | 'gold' | 'infinite') => {
        const state = get();
        const def = CERTIFICATES[certificateType];
        if (!def) return;

        // Check costs
        let canAfford = true;
        const res = JSON.parse(JSON.stringify(state.resources)) as GameState['resources'];

        if (def.costs.science && (!res.science || res.science.amount < def.costs.science)) {
          canAfford = false;
        }

        const resCosts: { key: ResourceType; amount: number }[] = [
          { key: 'parchment', amount: def.costs.parchment }
        ];
        if (def.costs.beam) resCosts.push({ key: 'beam', amount: def.costs.beam });
        if (def.costs.slab) resCosts.push({ key: 'slab', amount: def.costs.slab });
        if (def.costs.plate) resCosts.push({ key: 'plate', amount: def.costs.plate });

        for (const costItem of resCosts) {
          if (!res[costItem.key] || res[costItem.key].amount < costItem.amount) {
            canAfford = false;
          }
        }

        if (!canAfford) {
          state.addLog(`Cannot synthesize ${def.name}. Insufficient materials!`, 'warn');
          return;
        }

        // Deduct
        if (def.costs.science) {
          res.science.amount -= def.costs.science;
        }
        for (const costItem of resCosts) {
          res[costItem.key].amount -= costItem.amount;
        }

        // Add active certificate
        const newActive: ActiveCertificateBoost = {
          id: Math.random().toString(),
          certificateType,
          name: def.name,
          timeRemaining: def.duration,
          totalDuration: def.duration,
          boostPercent: def.boostPercent
        };

        const currentActive = state.activeCertificates || [];
        const currentCount = state.craftedCertificatesCount || { bronze: 0, silver: 0, gold: 0, infinite: 0 };
        const updatedCount = {
          ...currentCount,
          [certificateType]: (currentCount[certificateType] || 0) + 1
        };

        set({
          resources: res,
          activeCertificates: [...currentActive, newActive],
          craftedCertificatesCount: updatedCount
        });

        state.addLog(`Portal synthesizer online! Synthesised ${def.name}. Productivity boost activated!`, 'success');
      },

      toggleInsaneMode: () => set(state => {
        const nextInsane = !state.insaneMode;
        const msg = nextInsane 
          ? "🔴 Insane Multiverse Matrix ACTIVATED. Global production is penalized by 35%. Winter is lethal. Dangerous Dimensional Anomalies will strike!" 
          : "🟢 Insane Multiverse Matrix deactivated. Returning to safe, cushy dimensions.";
        state.addLog(msg, nextInsane ? 'warn' : 'info');
        return { 
          insaneMode: nextInsane,
          activeAnomaly: null
        };
      }),

      defuseAnomalyClick: () => set(state => {
        if (!state.activeAnomaly) return state;
        const current = { ...state.activeAnomaly };
        current.clicksMade += 1;
        if (current.clicksMade >= current.clicksRequired) {
          state.addLog(`🛡️ Matrix Stabilized! Manual core dampening neutralized: ${current.name}.`, 'success');
          return { activeAnomaly: null };
        }
        return { activeAnomaly: current };
      }),

      defuseAnomalyInstant: () => set(state => {
        if (!state.activeAnomaly) return state;
        const name = state.activeAnomaly.name;
        if (state.resources.wood.amount >= 40) {
          const res = { ...state.resources };
          res.wood.amount -= 40;
          state.addLog(`🛡️ Stabilizer Shield Deployed! Spent 40 Plutonium fuel to instantly dissolve: ${name}.`, 'success');
          return {
            resources: res,
            activeAnomaly: null
          };
        } else {
          state.addLog(`Access Denied! Core shields require at least 40 Plutonium fuel.`, 'warn');
          return state;
        }
      }),

      setDensity: (density: 'compact' | 'relaxed') => set({ density })
    }),
    {
      name: 'rick-and-morty-incremental-storage',
      merge: (persistedState: any, currentState: GameState) => {
        if (!persistedState) return currentState;

        // Merge resources safely
        const mergedResources = { ...currentState.resources };
        if (persistedState.resources) {
          for (const key in currentState.resources) {
            const resKey = key as ResourceType;
            if (persistedState.resources[resKey]) {
              mergedResources[resKey] = {
                amount: typeof persistedState.resources[resKey].amount === 'number'
                  ? persistedState.resources[resKey].amount
                  : currentState.resources[resKey].amount,
                max: typeof persistedState.resources[resKey].max === 'number'
                  ? persistedState.resources[resKey].max
                  : currentState.resources[resKey].max
              };
            }
          }
        }

        // Merge buildings safely
        const mergedBuildings = { ...currentState.buildings };
        if (persistedState.buildings) {
          for (const key in currentState.buildings) {
            const bKey = key as BuildingType;
            if (typeof persistedState.buildings[bKey] === 'number') {
              mergedBuildings[bKey] = persistedState.buildings[bKey];
            }
          }
        }

        // Merge researched upgrades safely
        const mergedResearched = { ...currentState.researched };
        if (persistedState.researched) {
          for (const key in currentState.researched) {
            const sKey = key as ScienceType;
            if (typeof persistedState.researched[sKey] === 'boolean') {
              mergedResearched[sKey] = persistedState.researched[sKey];
            }
          }
        }

        // Merge tool/workshop upgrades safely
        const mergedUpgrades = { ...currentState.upgrades };
        if (persistedState.upgrades) {
          for (const key in currentState.upgrades) {
            const uKey = key as UpgradeType;
            if (typeof persistedState.upgrades[uKey] === 'boolean') {
              mergedUpgrades[uKey] = persistedState.upgrades[uKey];
            }
          }
        }

        // Merge unlocks state safely
        const mergedUnlocks = { ...currentState.unlocks };
        if (persistedState.unlocks) {
          for (const key in currentState.unlocks) {
            const uKey = key as keyof typeof currentState.unlocks;
            if (typeof persistedState.unlocks[uKey] === 'boolean') {
              mergedUnlocks[uKey] = persistedState.unlocks[uKey];
            }
          }
        }

        // Merge town & kitten colony
        let mergedVillage = { ...currentState.village };
        if (persistedState.village) {
          const maxKittens = (mergedBuildings.hut * 2) + (mergedBuildings.logHouse * 1) + (mergedBuildings.mansion * 4);
          const kitList = Array.isArray(persistedState.village.kittens) ? persistedState.village.kittens : [];
          
          mergedVillage = {
            kittens: kitList,
            maxKittens: maxKittens,
            happiness: typeof persistedState.village.happiness === 'number' ? persistedState.village.happiness : 100
          };
        }

        const mergedActiveCertificates = Array.isArray(persistedState.activeCertificates)
          ? persistedState.activeCertificates
          : [];
        const mergedCraftedCertificatesCount = persistedState.craftedCertificatesCount || { bronze: 0, silver: 0, gold: 0, infinite: 0 };
        const mergedAchievements = persistedState.achievements || {};

        return {
          ...currentState,
          ...persistedState,
          resources: mergedResources,
          buildings: mergedBuildings,
          researched: mergedResearched,
          upgrades: mergedUpgrades,
          unlocks: mergedUnlocks,
          village: mergedVillage,
          activeCertificates: mergedActiveCertificates,
          craftedCertificatesCount: mergedCraftedCertificatesCount,
          achievements: mergedAchievements,
          theme: persistedState.theme === 'light' ? 'light' : 'dark',
          density: (persistedState.density === 'compact' || persistedState.density === 'relaxed') ? persistedState.density : 'relaxed',
          buyMultiplier: (persistedState.buyMultiplier === 1 || persistedState.buyMultiplier === 5 || persistedState.buyMultiplier === 25) 
            ? persistedState.buyMultiplier 
            : 1,
        } as GameState;
      }
    }
  )
);
