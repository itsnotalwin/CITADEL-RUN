import React, { useEffect, useState } from 'react';
import { useGameStore, calculateJobStrengths } from './store/useGameStore';
import { BUILDINGS, JOBS, SEASONS_DATA } from './gameData';
import { 
  Flame, 
  HelpCircle, 
  Settings2, 
  Sparkle, 
  Users, 
  FlaskConical, 
  Hammer, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Award,
  ChevronRight,
  Github,
  Sun,
  Moon,
  Eye,
  Sliders,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  ShieldAlert,
  Hand,
  Zap
} from 'lucide-react';

import ResourcePanel from './components/ResourcePanel';
import BonfireTab from './components/BonfireTab';
import TownTab from './components/TownTab';
import ScienceTab from './components/ScienceTab';
import WorkshopTab from './components/WorkshopTab';
import AchievementsTab from './components/AchievementsTab';
import SettingsTab from './components/SettingsTab';
import { playClickSound } from './utils/audio';
import { AnimatePresence, motion } from 'motion/react';
import SplashStartup from './components/SplashStartup';

type ActiveTabType = 'bonfire' | 'town' | 'science' | 'workshop' | 'achievements' | 'settings';

export default function App() {
  const store = useGameStore();
  const [activeTab, setActiveTab] = useState<ActiveTabType>('bonfire');
  const [showSpeedControls, setShowSpeedControls] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [offlineProgressMsg, setOfflineProgressMsg] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  
  // Custom layout view togglers to manage display density - collapsed on small mobile screens
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // Synchronize document attribute with theme selection
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', store.theme);
  }, [store.theme]);

  // Initialize Game loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const deltaSeconds = (now - lastTime) / 1000;
      
      // Advance game store, capping maximum single-frame lag to 2 seconds
      store.tick(Math.min(2, deltaSeconds));
      
      lastTime = now;
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    // Initial offline catchup calculation
    const now = Date.now();
    const offlineSeconds = (now - store.lastTick) / 1000;
    
    if (offlineSeconds > 25) {
      // Calculate how many minutes offline
      const mins = Math.floor(offlineSeconds / 60);
      const hours = Math.floor(mins / 60);
      let timeStr = `${mins}m`;
      if (hours > 0) {
        timeStr = `${hours}h ${mins % 60}m`;
      }
      
      // Let's pass the offline seconds to the tick
      store.tick(offlineSeconds);
      
      setOfflineProgressMsg(
        `Welcome Back, Portal Master! While you were offline for ${timeStr}, your clones maintained the laboratories, harvested fresh Mega Seeds, and kept the fusion cores warm.`
      );
    }

    // Trigger save confirmation toast once on startup
    setShowSuccessToast(true);
    const timeout = setTimeout(() => setShowSuccessToast(false), 4500);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeout);
    };
  }, []);

  // Compute calculated Rates per second for display
  const kittensList = Array.isArray(store.village?.kittens) ? store.village.kittens : [];
  const kittenCount = kittensList.length;
  
  const jobCounts = {
    farmer: 0,
    woodcutter: 0,
    scholar: 0,
    miner: 0,
    priest: 0
  };
  
  kittensList.forEach(k => {
    if (k.job !== 'unemployed') {
      jobCounts[k.job]++;
    }
  });

  const jobStrengths = calculateJobStrengths(kittensList);

  const barnMultiplier = store.upgrades.reinforcedBarns ? 1.4 : 1.0;
  const warehouseMultiplier = store.upgrades.expandedStorage ? 1.35 : 1.0;

  let maxCatnip = 2000 + (store.buildings.pasture * 500) + (store.buildings.barn * 2500 * barnMultiplier);
  if (store.upgrades.catnipSilos) maxCatnip *= 1.5;

  const totalBoost = (store.activeCertificates || []).reduce((acc, cert) => acc + cert.boostPercent, 0);
  const certificateMultiplier = 1 + totalBoost;
  const portalFluxMultiplier = 1 + (store.portalFlux * 0.1);
  let productionMultiplier = certificateMultiplier * portalFluxMultiplier;

  if (store.insaneMode) {
    productionMultiplier *= 0.65;
  }
  if (store.activeAnomaly?.type === 'fed_raid') {
    productionMultiplier *= 0.50;
  }

  // Rates formulas mirror store tick perfectly for pixel-perfect UI synchronization
  const farmerEffBonus = store.researched.agriculture ? 1.20 : 1.0;
  const agricultureGreenhouseBonus = store.researched.agriculture ? 1.25 : 1.0;
  let seasonModifier = store.researched.calendar ? SEASONS_DATA[store.season.current].catnipModifier : 1.0;
  
  if (store.insaneMode && store.season.current === 'Winter') {
    seasonModifier = store.upgrades.portalHeaters ? 0.35 : 0.05;
  } else if (store.upgrades.portalHeaters && store.season.current === 'Winter') {
    seasonModifier = Math.max(seasonModifier, 0.55);
  }
  
  const aqueductBoost = 1 + (store.buildings.aqueduct * 0.15);

  const fieldsPassiveRate = store.buildings.catnipField * 0.63 * seasonModifier * aqueductBoost * agricultureGreenhouseBonus;
  const farmerRateValue = jobStrengths.farmer * 5.0 * farmerEffBonus * seasonModifier * productionMultiplier;
  
  const pastureIntakeReduction = Math.max(0.50, 1 - (store.buildings.pasture * 0.015));
  const baseFoodDemandPerMorty = store.insaneMode ? 5.50 : 4.25;
  let totalFoodDemand = 0;
  kittensList.forEach(k => {
    let multiplier = 1.0;
    if (k.trait && k.trait.includes('Mega-Seed Tolerant')) {
      multiplier = 0.95;
    }
    totalFoodDemand += baseFoodDemandPerMorty * multiplier;
  });
  const kittenEatsRate = totalFoodDemand * pastureIntakeReduction;
  
  let computedCatnipRate = fieldsPassiveRate + farmerRateValue - kittenEatsRate;

  let axeMultiplier = 1.0;
  if (store.upgrades.ironAxes) axeMultiplier = 1.75;
  else if (store.upgrades.mineralAxes) axeMultiplier = 1.25;

  const efficiencyFactor = store.village.happiness / 100;
  
  const woodworkingWoodcutterBonus = store.researched.woodworking ? 1.15 : 1.0;
  let computedWoodRate = jobStrengths.woodcutter * 0.10 * axeMultiplier * efficiencyFactor * productionMultiplier * woodworkingWoodcutterBonus;

  const miningMinerBonus = store.researched.mining ? 1.20 : 1.0;
  let computedMineralsRate = (jobStrengths.miner * 0.18 * efficiencyFactor * productionMultiplier * miningMinerBonus) + (store.buildings.mine * 0.05 * miningMinerBonus);
  let computedIronRate = 0;

  const metalworkingSmelterBonus = store.researched.metalworking ? 1.30 : 1.0;
  if (store.buildings.smelter > 0) {
    const smeltersCount = store.buildings.smelter;
    // Smelters consume raw mats to output iron
    if ((store.resources.wood?.amount ?? 0) > 1 && (store.resources.minerals?.amount ?? 0) > 10) {
      computedWoodRate -= smeltersCount * 1.0;
      computedMineralsRate -= smeltersCount * 10.0;
      computedIronRate += smeltersCount * 0.18 * metalworkingSmelterBonus * productionMultiplier;
    }
  }

  // Deduct active drains from the rendering HUD rates
  if (store.activeAnomaly?.type === 'fluid_leak') {
    computedCatnipRate -= 8.0;
    computedWoodRate -= 1.2;
  }

  const academyScholarMod = 1 + (store.buildings.academy * 0.20);
  const writingScholarBonus = store.researched.writing ? 1.25 : 1.0;
  const computedScienceRate = jobStrengths.scholar * 0.25 * academyScholarMod * efficiencyFactor * productionMultiplier * writingScholarBonus;

  const theologyPriestBonus = store.researched.theology ? 1.40 : 1.0;
  let computedCultureRate = jobStrengths.priest * 0.15 * efficiencyFactor * productionMultiplier * theologyPriestBonus;

  if (store.activeAnomaly?.type === 'cromulon') {
    computedCultureRate -= 4.0;
  }

  const handleTabChange = (tab: ActiveTabType) => {
    setActiveTab(tab);
    if (store.soundEnabled) playClickSound('click');
  };

  const currentTabComponent = () => {
    switch (activeTab) {
      case 'bonfire':
        return <BonfireTab store={store} />;
      case 'town':
        return <TownTab store={store} />;
      case 'science':
        return <ScienceTab store={store} />;
      case 'workshop':
        return <WorkshopTab store={store} />;
      case 'achievements':
        return <AchievementsTab store={store} />;
      case 'settings':
        return <SettingsTab store={store} />;
      default:
        return <BonfireTab store={store} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] overflow-hidden theme-bg-app theme-text-main antialiased font-sans max-w-full relative selection:bg-white/10 selection:theme-text-main">
      
      {/* CINEMATIC STARTUP SPLASH SCREEN WITH INTERACTIVE IMMERSIVE LAUNCHER */}
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="splash-screen-wrapper"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] overflow-hidden"
          >
            <SplashStartup 
              onEnter={() => setShowSplash(false)} 
              soundEnabled={store.soundEnabled} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL TOAST NOTIFIER */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-[90] theme-bg-card border theme-border p-3 h-14 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-md animate-fade-in text-xs">
          <Sparkles size={16} className="theme-text-main" />
          <span className="font-semibold tracking-wide">Persistence established. Progress saved offline.</span>
        </div>
      )}

      {/* OFFLINE RESUME MODAL POPUP */}
      {offlineProgressMsg && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="theme-bg-card border theme-border p-8 rounded-[2rem] max-w-md w-full flex flex-col gap-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
            <h3 className="text-xl font-black tracking-tighter theme-text-main flex items-center gap-3 uppercase">
              <Award size={24} />
              <span>Chronoscopy</span>
            </h3>
            <p className="text-sm theme-text-sec leading-relaxed font-sans">{offlineProgressMsg}</p>
            <button
              onClick={() => {
                setOfflineProgressMsg(null);
                if (store.soundEnabled) playClickSound('success');
              }}
              className="theme-text-main border theme-border py-4 rounded-xl mt-4 cursor-pointer hover:bg-white/5 font-bold uppercase tracking-widest text-xs transition-all active:scale-[0.98]"
            >
              Resume Duties
            </button>
          </div>
        </div>
      )}

      {/* AWWWARDS-STYLE SIDE NAVIGATION DOCK */}
      <nav className="fixed md:static bottom-2 left-2 right-2 md:inset-y-0 md:left-0 z-50 md:w-28 md:h-screen bg-black/40 md:bg-transparent backdrop-blur-3xl md:backdrop-blur-none border border-white/5 md:border-none md:border-r theme-border rounded-[1.5rem] md:rounded-none flex flex-row md:flex-col items-center justify-between p-1.5 md:py-8 shadow-2xl md:shadow-none shrink-0">
        
        {/* Top items: Logo and Primary Tabs */}
        <div className="flex flex-row md:flex-col items-center gap-1 md:gap-6 w-full">
          <div className="hidden md:flex items-center justify-center w-14 h-14 rounded-2xl theme-bg-card border theme-border mb-4 shadow-[0_0_30px_rgba(255,255,255,0.03)] opacity-80 hover:opacity-100 transition-opacity">
            <Flame size={24} className="theme-text-main"/>
          </div>

          <div className="flex flex-row md:flex-col gap-1 md:gap-1.5 w-full justify-around md:justify-start px-1 md:px-4">
            <button
              onClick={() => handleTabChange('bonfire')}
              className={`p-2 sm:p-3 md:py-4 md:w-full rounded-xl sm:rounded-2xl flex flex-col items-center gap-1 sm:gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer portal-tab-btn relative ${
                activeTab === 'bonfire' 
                  ? 'portal-tab-btn-active scale-100' 
                  : 'text-neutral-500 scale-95'
              }`}
            >
              <Sparkle size={18} className={activeTab === 'bonfire' ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'} />
              <span className="text-[9px] md:text-[10px] hidden md:block font-sans">Citadel</span>
              {activeTab === 'bonfire' && (
                <div className="portal-tab-indicator absolute bottom-0 left-2 right-2 sm:left-4 sm:right-4 h-[2px] md:left-0 md:top-4 md:bottom-4 md:w-[3px] md:h-auto rounded-full" />
              )}
            </button>

            {store.unlocks.village && (
              <button
                onClick={() => handleTabChange('town')}
                className={`p-2 sm:p-3 md:py-4 md:w-full rounded-xl sm:rounded-2xl flex flex-col items-center gap-1 sm:gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer portal-tab-btn relative ${
                  activeTab === 'town' 
                    ? 'portal-tab-btn-active scale-100' 
                    : 'text-neutral-500 scale-95'
                }`}
              >
                <Users size={18} className={activeTab === 'town' ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'} />
                <span className="text-[9px] md:text-[10px] hidden md:block font-sans">Clone Bay</span>
                {activeTab === 'town' && (
                  <div className="portal-tab-indicator absolute bottom-0 left-2 right-2 sm:left-4 sm:right-4 h-[2px] md:left-0 md:top-4 md:bottom-4 md:w-[3px] md:h-auto rounded-full" />
                )}
              </button>
            )}

            {store.unlocks.science && (
              <button
                onClick={() => handleTabChange('science')}
                className={`p-2 sm:p-3 md:py-4 md:w-full rounded-xl sm:rounded-2xl flex flex-col items-center gap-1 sm:gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer portal-tab-btn relative ${
                  activeTab === 'science' 
                    ? 'portal-tab-btn-active scale-100' 
                    : 'text-neutral-500 scale-95'
                }`}
              >
                <FlaskConical size={18} className={activeTab === 'science' ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'} />
                <span className="text-[9px] md:text-[10px] hidden md:block font-sans">Labs</span>
                {activeTab === 'science' && (
                  <div className="portal-tab-indicator absolute bottom-0 left-2 right-2 sm:left-4 sm:right-4 h-[2px] md:left-0 md:top-4 md:bottom-4 md:w-[3px] md:h-auto rounded-full" />
                )}
              </button>
            )}

             {store.unlocks.workshop && (
              <button
                onClick={() => handleTabChange('workshop')}
                className={`p-2 sm:p-3 md:py-4 md:w-full rounded-xl sm:rounded-2xl flex flex-col items-center gap-1 sm:gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer portal-tab-btn relative ${
                  activeTab === 'workshop' 
                    ? 'portal-tab-btn-active scale-100' 
                    : 'text-neutral-500 scale-95'
                }`}
              >
                <Hammer size={18} className={activeTab === 'workshop' ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'} />
                <span className="text-[9px] md:text-[10px] hidden md:block font-sans">Refine</span>
                {activeTab === 'workshop' && (
                  <div className="portal-tab-indicator absolute bottom-0 left-2 right-2 sm:left-4 sm:right-4 h-[2px] md:left-0 md:top-4 md:bottom-4 md:w-[3px] md:h-auto rounded-full" />
                )}
              </button>
            )}

            <button
              onClick={() => handleTabChange('achievements')}
              className={`p-2 sm:p-3 md:py-4 md:w-full rounded-xl sm:rounded-2xl flex flex-col items-center gap-1 sm:gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer portal-tab-btn relative ${
                activeTab === 'achievements' 
                  ? 'portal-tab-btn-active scale-100' 
                  : 'text-[#39ff14]/90 scale-95'
              }`}
            >
              <Award size={18} className={activeTab === 'achievements' ? 'text-[#39ff14] animate-pulse' : 'text-neutral-400'} />
              <span className="text-[9px] md:text-[10px] hidden md:block font-sans">Badges</span>
              {activeTab === 'achievements' && (
                <div className="portal-tab-indicator absolute bottom-0 left-2 right-2 sm:left-4 sm:right-4 h-[2px] md:left-0 md:top-4 md:bottom-4 md:w-[3px] md:h-auto rounded-full font-sans text-[#39ff14]/90" />
              )}
            </button>

            <button
              onClick={() => handleTabChange('settings')}
              className={`p-2 sm:p-3 md:py-4 md:w-full rounded-xl sm:rounded-2xl flex flex-col items-center gap-1 sm:gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer portal-tab-btn relative ${
                activeTab === 'settings' 
                  ? 'portal-tab-btn-active scale-100' 
                  : 'text-neutral-500 scale-95'
              }`}
            >
              <Settings2 size={18} className={activeTab === 'settings' ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'} />
              <span className="text-[9px] md:text-[10px] hidden md:block font-sans">Settings</span>
              {activeTab === 'settings' && (
                <div className="portal-tab-indicator absolute bottom-0 left-2 right-2 sm:left-4 sm:right-4 h-[2px] md:left-0 md:top-4 md:bottom-4 md:w-[3px] md:h-auto rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom items: Utilities */}
        <div className="flex flex-row md:flex-col items-center gap-3 md:gap-4 md:mt-auto pr-3 md:pr-0">
          <button
            aria-label="Toggle theme"
            title="Toggle theme"
            onClick={() => {
              const nextTheme = store.theme === 'dark' ? 'light' : 'dark';
              store.setTheme(nextTheme);
              if (store.soundEnabled) playClickSound('click');
            }}
            className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            {store.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            aria-label={store.soundEnabled ? "Mute sound" : "Enable sound"}
            title={store.soundEnabled ? "Mute sound" : "Enable sound"}
            onClick={() => {
              store.toggleSound();
              if (!store.soundEnabled) playClickSound('success');
            }}
            className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-300 transition-colors hidden sm:block"
          >
            {store.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </nav>

      {/* MAIN WORKSPACE AREA */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* SUPER MINIMAL TOP BAR */}
        <header className={`w-full shrink-0 transition-all duration-300 z-20 relative flex flex-col ${
          store.density === 'compact' 
            ? 'pt-3 sm:pt-4 px-4 sm:px-6 gap-2.5' 
            : 'pt-8 sm:pt-10 px-5 sm:px-10 gap-6'
        }`}>
          <div className="flex justify-between items-end relative">
             <h1 className={`font-black tracking-[-0.04em] opacity-5 theme-text-main uppercase leading-none select-none absolute -top-4 -left-2 pointer-events-none origin-left transform-gpu mix-blend-overlay transition-all duration-300 ${
               store.density === 'compact' ? 'text-3xl sm:text-4xl' : 'text-5xl sm:text-7xl'
             }`}>
               {activeTab === 'bonfire' ? 'Citadel' : activeTab === 'town' ? 'Clone Bay' : activeTab === 'science' ? 'Labs' : activeTab === 'workshop' ? 'Refinery' : 'Badges'}
             </h1>
             
             {/* Spacing element to push controls to the right */}
             <div className="flex-1"></div>

             <div className="flex items-center gap-4 z-10">
                <div className="flex items-center theme-bg-card border theme-border rounded-xl p-1 gap-1 shadow-sm backdrop-blur-md">
                  <button
                    aria-label="Pause game"
                    title="Pause game"
                    onClick={() => { store.setGameSpeed(0); if (store.soundEnabled) playClickSound('click'); }}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${store.gameSpeed === 0 ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    <Pause size={14} />
                  </button>
                  <button
                    onClick={() => { store.setGameSpeed(1); if (store.soundEnabled) playClickSound('click'); }}
                    className={`px-3 py-1.5 text-xs rounded-lg font-black cursor-pointer transition-all ${store.gameSpeed === 1 ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    1X
                  </button>
                  <button
                    onClick={() => { store.setGameSpeed(4); if (store.soundEnabled) playClickSound('success'); }}
                    className={`px-3 py-1.5 text-xs rounded-lg font-black cursor-pointer transition-all ${store.gameSpeed === 4 ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    4X
                  </button>
                </div>
             </div>
          </div>

          {/* FLOATING TOP RESOURCES HUD */}
          <div className="z-20 w-full animate-fade-in relative mt-2 mb-2">
             <ResourcePanel
                store={store}
                catnipRate={computedCatnipRate}
                woodRate={computedWoodRate}
                scienceRate={computedScienceRate}
                mineralsRate={computedMineralsRate}
                cultureRate={computedCultureRate}
                ironRate={computedIronRate}
              />
          </div>

          {/* ANOMALY ALERT SYSTEM */}
          {store.activeAnomaly && (
            <div className="z-20 w-full animate-bounce theme-bg-card border-2 border-red-500/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(239,68,68,0.25)] backdrop-blur-md mb-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-950/30">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 transition-all duration-300"
                  style={{ width: `${(store.activeAnomaly.durationLeft / 20) * 100}%` }}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-500 shrink-0 select-none animate-pulse">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full tracking-widest leading-none">
                      Warning: Dimensional Anomaly
                    </span>
                    <span className="text-xs font-mono font-bold text-red-400">
                      {Math.ceil(store.activeAnomaly.durationLeft)}s Left
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-white uppercase tracking-tight mt-1 flex items-center gap-1.5">
                    {store.activeAnomaly.name}
                  </h4>
                  <p className="text-neutral-400 text-xs font-medium max-w-sm mt-0.5">
                    {store.activeAnomaly.desc}
                  </p>
                </div>
              </div>

              {/* ACTION AREA */}
              <div className="flex flex-row gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => {
                    store.defuseAnomalyClick();
                    if (store.soundEnabled) playClickSound('click');
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider px-4 py-3 rounded-xl shadow-lg border border-red-400 transition-all cursor-pointer group"
                >
                  <Hand size={14} className="group-hover:scale-125 transition-transform" />
                  Stabilize ({store.activeAnomaly.clicksMade}/{store.activeAnomaly.clicksRequired})
                </button>
                <button
                  onClick={() => {
                    store.defuseAnomalyInstant();
                    if (store.soundEnabled) playClickSound('success');
                  }}
                  disabled={(store.resources.wood?.amount ?? 0) < 40}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-white text-xs font-black uppercase tracking-wider px-4 py-3 rounded-xl transition-all cursor-pointer"
                >
                  <Zap size={14} className="text-yellow-400" />
                  Direct Shield (40 Plutonium)
                </button>
              </div>
            </div>
          )}
        </header>

        {/* ACTIVE TAB CONTENT WINDOW */}
        <div className={`flex-1 overflow-x-hidden overflow-y-auto pb-32 md:pb-12 pt-1.5 relative z-10 scrollbar-none transition-all duration-300 ${
          store.density === 'compact' ? 'px-4 sm:px-6' : 'px-5 sm:px-10'
        }`}>
          {currentTabComponent()}
        </div>



      </main>
    </div>
  );
}
