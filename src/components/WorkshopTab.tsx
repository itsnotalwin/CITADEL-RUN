import React from 'react';
import { GameState, UpgradeType, ResourceType } from '../types';
import { UPGRADES } from '../gameData';
import { playClickSound, triggerHaptic } from '../utils/audio';
import { CERTIFICATES } from '../store/useGameStore';
import { 
  Hammer, 
  Settings, 
  Check, 
  ArrowRight, 
  Layers, 
  Milestone, 
  Scroll, 
  PackageCheck,
  Sparkles,
  Clock,
  Zap,
  Award
} from 'lucide-react';

interface WorkshopTabProps {
  store: GameState;
}

export default function WorkshopTab({ store }: WorkshopTabProps) {
  const isCompact = store.density === 'compact';

  const handleBuyUpgrade = (id: UpgradeType) => {
    store.buyUpgrade(id);
    triggerHaptic('research');
    if (store.soundEnabled) playClickSound('research');
  };

  const handleRefine = (craftType: 'wood' | 'beam' | 'slab' | 'plate' | 'parchment', amount: number) => {
    store.refineResource(craftType, amount);
    triggerHaptic('wood');
    if (store.soundEnabled) playClickSound('wood');
  };

  const multiplier = store.buyMultiplier || 1;

  const resourceLabelMap: Record<string, string> = {
    catnip: 'Mega Seeds',
    wood: 'Plutonium',
    minerals: 'Crystals',
    iron: 'Neutrium',
    science: 'Portal Tech',
    culture: 'Schwifty Vibes',
    beam: 'Nano-Beam',
    slab: 'Hyper-Slab',
    plate: 'Neutrium Plate',
    parchment: 'Portal Formula'
  };

  // Evaluate crafts list without verbose details
  const craftsList: {
    id: 'wood' | 'beam' | 'slab' | 'plate' | 'parchment';
    label: string;
    costsDesc: string;
    canCraft: boolean;
    hasUnlocked: boolean;
  }[] = [
    {
      id: 'wood',
      label: 'Plutonium',
      costsDesc: '100 Mega Seeds',
      canCraft: store.resources.catnip.amount >= 100,
      hasUnlocked: store.unlocks.wood,
    },
    {
      id: 'beam',
      label: 'Nano-Beam',
      costsDesc: '175 Plutonium',
      canCraft: store.resources.wood.amount >= 175,
      hasUnlocked: store.researched.woodworking,
    },
    {
      id: 'slab',
      label: 'Hyper-Slab',
      costsDesc: '250 Crystals',
      canCraft: store.resources.minerals.amount >= 250,
      hasUnlocked: store.researched.mining,
    },
    {
      id: 'plate',
      label: 'Neutrium Plate',
      costsDesc: '150 Neutrium',
      canCraft: store.resources.iron.amount >= 150,
      hasUnlocked: store.researched.metalworking,
    },
    {
      id: 'parchment',
      label: 'Portal Formula',
      costsDesc: '175 Portal Tech, 5 Schwifty Vibes',
      canCraft: store.resources.science.amount >= 175 && store.resources.culture.amount >= 5,
      hasUnlocked: store.researched.writing,
    },
  ];

  return (
    <div className="flex flex-col flex-1 pb-10">
      
      {/* SECTION HEADER */}
      <div className={`flex justify-between items-center border-b border-white/5 transition-all duration-300 ${
        isCompact ? 'pb-3 mx-2 mt-2 gap-2' : 'pb-6 mx-2 sm:mx-6 mt-4'
      }`}>
        <span className={`uppercase font-bold text-neutral-500 tracking-widest leading-none ${
          isCompact ? 'text-[9px]' : 'text-[10px]'
        }`}>Workshop Refining & Forge</span>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-12 items-start transition-all duration-300 ${
        isCompact ? 'gap-4 mt-4 mx-2' : 'gap-6 mt-6 mx-2 sm:mx-6'
      }`}>
        
        {/* LEFT COLUMN: REFINING FORGE */}
        <div className={`flex flex-col ${isCompact ? 'lg:col-span-4 gap-2.5' : 'lg:col-span-4 gap-4'}`}>
          <span className={`uppercase font-bold text-neutral-500 tracking-widest leading-none block font-sans ${
            isCompact ? 'text-[9px]' : 'text-[10px]'
          }`}>Crafter Line</span>
          
          <div className="flex flex-col gap-2.5">
            {craftsList.map((craft) => {
              if (!craft.hasUnlocked) return null;

              return (
                <div 
                  key={craft.id}
                  className={`flex items-center justify-between gap-3 transition-all border border-neutral-900 bg-neutral-950/10 backdrop-blur-sm transition-all duration-300 ${
                    isCompact ? 'p-2.5 rounded-lg' : 'p-4 rounded-xl'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <span className={`shrink-0 p-1 bg-neutral-900/60 border border-white/5 rounded-lg transition-all ${
                      isCompact ? 'text-lg' : 'text-xl'
                    }`}>
                       {craft.id === 'wood' ? '⚡' : craft.id === 'beam' ? '🔗' : craft.id === 'slab' ? '🕋' : craft.id === 'plate' ? '🛡️' : '🌌'}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className={`font-bold text-white tracking-wide leading-none transition-all ${
                        isCompact ? 'text-xs' : 'text-sm'
                      }`}>
                        {craft.label}
                      </span>
                      <span className="text-3xs text-neutral-500 font-mono">Cost: {craft.costsDesc}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleRefine(craft.id, 1)}
                      disabled={!craft.canCraft}
                      className={`uppercase font-extrabold text-white border border-white/10 hover:bg-white/5 disabled:opacity-20 rounded cursor-pointer transition-all ${
                        isCompact ? 'px-2 py-1 text-[9px]' : 'px-2.5 py-1.5 text-3xs'
                      }`}
                    >
                      Craft
                    </button>
                    {multiplier > 1 && (
                      <button
                        onClick={() => handleRefine(craft.id, multiplier)}
                        disabled={!craft.canCraft}
                        className={`uppercase font-black bg-white text-black hover:opacity-90 disabled:opacity-20 rounded cursor-pointer transition-all ${
                          isCompact ? 'px-2 py-1 text-[9px]' : 'px-2.5 py-1.5 text-3xs'
                        }`}
                      >
                        +{multiplier}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: PERMANENT UPGRADES & SCHEMATICS */}
        <div className={`lg:col-span-8 flex flex-col gap-4`}>
          <span className={`uppercase font-bold text-neutral-500 tracking-widest leading-none block font-sans ${
            isCompact ? 'text-[9px]' : 'text-[10px]'
          }`}>Permanent Upgrades</span>

          <div className={`grid grid-cols-1 md:grid-cols-2 transition-all duration-300 ${
            isCompact ? 'gap-3' : 'gap-4'
          }`}>
            {(Object.entries(UPGRADES) as [UpgradeType, typeof UPGRADES[UpgradeType]][]).map(([id, u]) => {
              const isOwned = store.upgrades[id];

              if (id === 'ironAxes' && !store.upgrades.mineralAxes) return null;
              if (id === 'reinforcedBarns' && !store.researched.mining) return null;
              if (id === 'expandedStorage' && !store.researched.metalworking) return null;

              let canAfford = true;
              const costsList = Object.entries(u.cost).map(([res, costVal]) => {
                const isAffordable = store.resources[res as ResourceType]?.amount >= (costVal as number);
                if (!isAffordable) canAfford = false;
                return (
                  <span 
                    key={res} 
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                      isAffordable 
                        ? 'bg-neutral-900/40 text-[#39ff14] border-emerald-950/40' 
                        : 'bg-red-950/10 text-red-200 border-red-900/20'
                    }`}
                  >
                    <span className="text-neutral-500">{resourceLabelMap[res] || res}:</span>
                    <span className="font-bold">{(costVal as number).toLocaleString()}</span>
                  </span>
                );
              });

              return (
                <div 
                  key={id}
                  className={`flex flex-col justify-between transition-all duration-300 border rounded-xl bg-neutral-950/10 backdrop-blur-sm relative ${
                    isCompact ? 'p-3.5 gap-2.5' : 'p-5 gap-4'
                  } ${
                    isOwned 
                      ? 'border-neutral-900/30 opacity-45' 
                      : canAfford 
                        ? 'border-neutral-900 hover:border-neutral-700/65 shadow-sm' 
                        : 'border-white/5 opacity-70'
                  }`}
                >
                  <div className={`flex flex-col ${isCompact ? 'gap-1' : 'gap-2'}`}>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`font-bold text-white tracking-wide transition-all ${
                        isCompact ? 'text-xs sm:text-sm' : 'text-sm'
                      }`}>{u.name}</h4>
                      {isOwned && (
                        <span className="px-1.5 py-0.2 border border-emerald-500/10 text-[#39ff14]/80 text-[8px] uppercase tracking-wider font-bold rounded bg-emerald-500/5 font-sans">
                          Acquired
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-neutral-400 font-sans leading-relaxed transition-all ${
                      isCompact ? 'text-[11px] leading-snug' : 'text-xs'
                    }`}>{u.effectsDesc}</p>
                  </div>

                  {!isOwned && (
                    <div className={`flex flex-col border-t border-white/[0.03] transition-all duration-300 ${
                      isCompact ? 'gap-2 pt-2' : 'gap-3 pt-3'
                    }`}>
                      <div className="flex flex-wrap gap-1">
                        {costsList}
                      </div>

                      <button
                        onClick={() => handleBuyUpgrade(id)}
                        disabled={!canAfford}
                        className={`w-full uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 rounded-lg transition-all cursor-pointer ${
                          isCompact ? 'py-1.5 text-[10px]' : 'py-2 text-2xs'
                        } ${
                          canAfford 
                            ? 'bg-white text-black hover:bg-neutral-100 font-extrabold shadow-sm' 
                            : 'bg-white/5 border border-white/5 text-white/20 disabled:cursor-not-allowed font-medium'
                        }`}
                      >
                        Forge Upgrade
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AUTO BUILD SYSTEM */}
      {store.unlocks.wood && (
        <div className="mt-8 mx-2 sm:mx-6 flex flex-col gap-4">
          <span className={`uppercase font-bold text-neutral-500 tracking-widest leading-none block font-sans ${
             isCompact ? 'text-[9px]' : 'text-[10px]'
          }`}>Infrastructure Auto-Build</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PASTURE AUTO BUILD */}
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
              store.autoBuild?.pasture ? 'border-[#39ff14]/30 bg-[#39ff14]/5' : 'border-white/5 bg-neutral-950/10'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl p-1.5 bg-black/40 rounded-lg">🛖</span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white text-sm">Auto-Build Pasture</span>
                  <span className="text-[10px] text-neutral-400 max-w-[200px] leading-tight mt-1">
                    Automatically consume Mega Seeds and Plutonium to construct Pastures when resources are available.
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  store.toggleAutoBuild('pasture');
                  if(store.soundEnabled) playClickSound('click');
                }}
                className={`px-4 py-2 font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all cursor-pointer ${
                  store.autoBuild?.pasture ? 'bg-[#39ff14] text-black shadow-[0_0_10px_rgba(57,255,20,0.3)]' : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {store.autoBuild?.pasture ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>

            {/* BARN AUTO BUILD */}
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
              store.autoBuild?.barn ? 'border-[#39ff14]/30 bg-[#39ff14]/5' : 'border-white/5 bg-neutral-950/10'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl p-1.5 bg-black/40 rounded-lg">📦</span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-white text-sm">Auto-Build Barn</span>
                  <span className="text-[10px] text-neutral-400 max-w-[200px] leading-tight mt-1">
                    Automatically consumes Plutonium to construct Barns when resources are available to increase storage.
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  store.toggleAutoBuild('barn');
                  if(store.soundEnabled) playClickSound('click');
                }}
                className={`px-4 py-2 font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all cursor-pointer ${
                  store.autoBuild?.barn ? 'bg-[#39ff14] text-black shadow-[0_0_10px_rgba(57,255,20,0.3)]' : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {store.autoBuild?.barn ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PORTAL SYNTHESIS & MORTY CERTIFICATES SECTION */}
      <div className="mt-12 pt-8 border-t border-white/5 mx-2 sm:mx-6 flex flex-col gap-6">
        
        {/* HEADER INFORMATION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-neural-500 tracking-widest leading-none">Space-Time Calibration</span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              🌌 C-137 Portal Crafting Chamber
            </h3>
            <p className="text-xs text-neutral-400 max-w-xl hidden sm:block">
              Synthesize interdimensional security permits, clone authorization forms, and sovereignty clearances. 
              These high-authority certificates grant a <strong>temporary stackable global production boost</strong> across all job workers.
            </p>
          </div>

          {/* ACTIVE MULTIPLIER READOUT */}
          {store.activeCertificates && store.activeCertificates.length > 0 && (
            <div className="px-5 py-3 border border-[#39ff14]/30 bg-[#39ff14]/5 rounded-xl flex items-center gap-3 shrink-0">
              <Zap className="h-5 w-5 text-[#39ff14] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Warp Multiplier</span>
                <span className="text-lg font-mono text-[#39ff14] font-bold leading-none">
                  +{Math.round((store.activeCertificates.reduce((acc, c) => acc + c.boostPercent, 0)) * 100)}% Speed
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ACTIVE MODULES MONITOR */}
        <div className="p-6 border theme-border theme-bg-card/40 backdrop-blur-md rounded-xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest leading-none">
              Active Synthesis Certificates ({store.activeCertificates?.length || 0})
            </span>
          </div>

          {!store.activeCertificates || store.activeCertificates.length === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center text-center gap-2 border border-dashed border-white/10 rounded-lg">
              <span className="text-2xl">🟢</span>
              <span className="text-xs text-neutral-400">Portal fluids balanced. No active certificates boosting worker productivity.</span>
              <span className="text-[10px] text-neutral-500 font-mono">Status: Awaiting Quantum Fusion</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {store.activeCertificates.map((cert) => {
                const percentLeft = Math.max(0, Math.min(100, (cert.timeRemaining / cert.totalDuration) * 100));
                const totalSecs = Math.ceil(cert.timeRemaining);
                const minutes = Math.floor(totalSecs / 60);
                const seconds = totalSecs % 60;
                
                return (
                  <div key={cert.id} className="p-4 border border-white/10 theme-bg-panel/50 rounded-lg flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-white leading-tight truncate max-w-[150px]" title={cert.name}>
                          {cert.name}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold font-mono">
                          +{Math.round(cert.boostPercent * 100)}% Worker Speed
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-white/50 shrink-0">
                        {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${percentLeft}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SYNTHESIS LIST / CATALOG CARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.entries(CERTIFICATES) as [string, typeof CERTIFICATES[string]][]).map(([id, def]) => {
            const currentCount = store.craftedCertificatesCount?.[id] || 0;
            
            // Check costs
            let canAfford = true;
            
            // science cost
            if (def.costs.science && store.resources.science.amount < def.costs.science) {
              canAfford = false;
            }

            // resources cost
            const resolvedCosts = [
              { key: 'parchment' as ResourceType, label: 'Portal Formula', cost: def.costs.parchment, icon: '🌌' }
            ];
            if (def.costs.beam) resolvedCosts.push({ key: 'beam' as ResourceType, label: 'Nano-Beam', cost: def.costs.beam, icon: '🔗' });
            if (def.costs.slab) resolvedCosts.push({ key: 'slab' as ResourceType, label: 'Hyper-Slab', cost: def.costs.slab, icon: '🕋' });
            if (def.costs.plate) resolvedCosts.push({ key: 'plate' as ResourceType, label: 'Neutrium Plate', cost: def.costs.plate, icon: '🛡️' });

            const hasScienceCost = def.costs.science !== undefined;
            const scienceAffordable = hasScienceCost && store.resources.science.amount >= (def.costs.science || 0);

            resolvedCosts.forEach(costItem => {
              const userAmt = store.resources[costItem.key]?.amount || 0;
              if (userAmt < costItem.cost) {
                canAfford = false;
              }
            });

            // Unlock condition for portal crafting workshop items
            // Bronze is available if writing (formulas) is researched
            // Silver requires woodworking woodworking working (since it uses beams)
            // Gold requires metalworking and biology
            // Infinite is unlocked if the store has unlocked workshop and writing
            const isUnlocked = store.researched.writing;

            if (!isUnlocked) {
              return (
                <div key={id} className="p-6 border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center gap-2 rounded-xl min-h-[220px]">
                  <span className="text-xl opacity-30">📦</span>
                  <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Formula locked</span>
                  <p className="text-[10px] text-neutral-600 max-w-xs">
                    Research alternative writing formulas / blueprints in the Science tab to calibrate your quantum portal synthesizer.
                  </p>
                </div>
              );
            }

            return (
              <div 
                key={id}
                className={`p-6 border flex flex-col justify-between gap-6 transition-all duration-300 rounded-xl ${
                  canAfford 
                    ? 'border-[#39ff14]/30 bg-black/40 hover:border-[#39ff14] shadow-sm' 
                    : 'border-white/5 bg-transparent'
                }`}
              >
                <div className="flex flex-col gap-3">
                  
                  {/* Top line banner */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-1 bg-neutral-900/50 rounded-lg">
                        {id === 'bronze' ? '🟢' : id === 'silver' ? '🔵' : id === 'gold' ? '🟡' : '🟣'}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-[#39ff14] font-bold">Formula Blueprint</span>
                        <h4 className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight">
                          {def.name}
                        </h4>
                      </div>
                    </div>
                    {currentCount > 0 && (
                      <span className="text-[9px] uppercase font-mono font-bold bg-white/10 px-2 py-1 text-white/70 rounded-md shrink-0">
                        Synthed: {currentCount}
                      </span>
                    )}
                  </div>

                  {/* Desc text */}
                  <p className="text-xs text-neutral-400 leading-relaxed hidden sm:block">
                    {def.desc}
                  </p>

                  <div className="py-2 px-3 bg-neutral-950/70 border border-white/5 rounded-lg flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Temporary Benefit:</span>
                    <span className="text-xs font-bold text-emerald-400">
                      +{Math.round(def.boostPercent * 100)}% For {def.duration / 60} min
                    </span>
                  </div>

                  {/* Requirements section */}
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">Required Synthesis Materials</span>
                    <div className="flex flex-wrap gap-2">
                      
                      {/* Science tech cost if present */}
                      {hasScienceCost && (
                        <div className={`text-[10px] font-mono px-2 py-1 rounded-md border flex items-center gap-1.5 ${
                          scienceAffordable 
                            ? 'bg-emerald-500/5 text-emerald-300 border-emerald-500/10' 
                            : 'bg-red-500/5 text-red-400 border-red-500/10'
                        }`}>
                          <span>🛰️ Tech:</span>
                          <span>{Math.floor(store.resources.science.amount)}/{def.costs.science}</span>
                        </div>
                      )}

                      {/* Other resource costs */}
                      {resolvedCosts.map(item => {
                        const hasAmt = store.resources[item.key]?.amount || 0;
                        const isAffordable = hasAmt >= item.cost;
                        return (
                          <div 
                            key={item.key} 
                            className={`text-[10px] font-mono px-2 py-1 rounded-md border flex items-center gap-1.5 ${
                              isAffordable 
                                ? 'bg-emerald-500/5 text-emerald-300 border-emerald-500/10' 
                                : 'bg-red-500/5 text-red-400 border-red-500/10'
                            }`}
                          >
                            <span>{item.icon} {resourceLabelMap[item.key] || item.key}:</span>
                            <span>{Math.floor(hasAmt)}/{item.cost}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Synthesis Trigger Button */}
                <button
                  onClick={() => {
                    store.synthesizeCertificate(id as 'bronze' | 'silver' | 'gold' | 'infinite');
                    if (store.soundEnabled) playClickSound('research');
                  }}
                  disabled={!canAfford}
                  className={`w-full py-3 text-2xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded-lg cursor-pointer transition-all active:scale-[0.98] ${
                    canAfford 
                      ? 'bg-[#39ff14] text-black hover:bg-[#39ff14]/85 shadow-[#39ff14]/20 shadow-md font-extrabold' 
                      : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Synthesize C-137 Form
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
