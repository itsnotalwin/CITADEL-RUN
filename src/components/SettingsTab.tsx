import React from 'react';
import { GameState } from '../types';
import { Settings, Zap, RotateCcw, Skull, Layout } from 'lucide-react';

interface SettingsTabProps {
  store: GameState;
}

export default function SettingsTab({ store }: SettingsTabProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto p-6 animate-fade-in">
      <h2 className="text-2xl font-black text-white flex items-center gap-3">
        <Settings className="text-[#39ff14]" />
        Multiversal Settings
      </h2>

      {/* DISASTER / INSANE DIFFICULTY MASTER PANEL */}
      <div className={`p-6 rounded-2xl border transition-all duration-350 ${
        store.insaneMode 
          ? 'bg-red-950/20 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.08)]' 
          : 'bg-neutral-950/30 border-white/[0.04]'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-1.5 ${
              store.insaneMode ? 'text-red-400' : 'text-neutral-400'
            }`}>
              <Skull size={15} className={store.insaneMode ? 'animate-pulse' : ''} />
              Insane Multiverse Mode
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Test your Rick intelligence. Perfect for seasoned idle/clicker fans who want a real survival struggle.
            </p>
          </div>
          <div>
            <button
              onClick={store.toggleInsaneMode}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                store.insaneMode 
                  ? 'bg-red-500 text-white shadow-lg border border-red-400' 
                  : 'bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700'
              }`}
            >
              {store.insaneMode ? 'ACTIVE' : 'INACTIVE'}
            </button>
          </div>
        </div>

        {store.insaneMode ? (
          <div className="text-xs text-red-200/70 space-y-2 mt-4 pt-4 border-t border-red-500/10 font-medium">
            <div className="flex items-start gap-2">
              <span className="text-red-400 text-bold shrink-0">✕</span>
              <span><strong>Weariness Modifier</strong>: Global clone production rate penalized by 35%!</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-400 text-bold shrink-0">✕</span>
              <span><strong>Famine Depletion</strong>: Each Morty consumes 5.50 Mega Seeds/sec (up from 4.25). 3x runaway or starvation mortality rate.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-400 text-bold shrink-0">✕</span>
              <span><strong>Extreme Winter</strong>: Fields yields collapse completely to 5% standard crop in Froopyland (Winter), buffered to 35% with Portal Heaters.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-400 text-bold shrink-0">✕</span>
              <span><strong>Temporal Tears</strong>: Random Dimensional Alerts (Acid ruptures, Fed raids, reality compression, giant head reviews) trigger and must be stabilized manual-pumped before detonation!</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-neutral-400 mt-4 leading-relaxed bg-neutral-900/20 p-3 rounded-xl border border-neutral-800">
            🌳 Standard settings: Normal seed requirements, standard seasons modifiers, and safe spatial borders with zero anomaly threats.
          </div>
        )}
      </div>

      {/* DISPLAY LAYOUT DENSITY PANEL */}
      <div className="p-6 rounded-2xl bg-neutral-950/30 border border-white/[0.04]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-black text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
              <Layout size={15} className="text-[#39ff14]" />
              Layout Density
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Select between Compact (for small screens or data-rich tracking) and Relaxed (sprawling lists with prominent buttons).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-neutral-900/60 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => store.setDensity('compact')}
            className={`py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
              store.density === 'compact'
                ? 'bg-neutral-800 text-[#39ff14] shadow-md border border-neutral-700 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/30'
            }`}
          >
            Compact
          </button>
          <button
            onClick={() => store.setDensity('relaxed')}
            className={`py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
              store.density === 'relaxed'
                ? 'bg-neutral-800 text-[#39ff14] shadow-md border border-neutral-700 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/30'
            }`}
          >
            Relaxed
          </button>
        </div>
      </div>
      
      <div className="bg-neutral-950/30 p-6 rounded-2xl border border-white/[0.04]">
        <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4">
          Core Timeline Management
        </h3>
        <div className="flex justify-between items-center bg-neutral-900/50 p-4 rounded-xl">
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <Zap className="text-yellow-400" size={16} />
              Portal Flux Points (Dimensional Prestige)
            </div>
            <div className="text-neutral-400 text-sm">Global production multiplier: +{store.portalFlux * 10}%</div>
            {store.portalResets > 0 && (
               <div className="text-neutral-500 text-xs mt-1">Times Reset: {store.portalResets}</div>
            )}
          </div>
          <div className="text-3xl font-black text-[#39ff14]">{store.portalFlux}</div>
        </div>
        
        <button
          onClick={store.portalReset}
          className="w-full mt-6 flex items-center justify-center gap-3 bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900/50 p-4 rounded-xl font-bold uppercase tracking-wide transition-all"
        >
          <RotateCcw size={18} />
          Portal Reset (Dimension Hop)
        </button>
      </div>
    </div>
  );
}
