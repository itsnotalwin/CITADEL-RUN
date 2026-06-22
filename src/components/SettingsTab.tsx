import React from 'react';
import { GameState } from '../types';
import { Settings, Zap, RotateCcw, Skull, Layout } from 'lucide-react';

interface SettingsTabProps {
  store: GameState;
}

export default function SettingsTab({ store }: SettingsTabProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto p-6 animate-fade-in">
      <h2 className="text-2xl font-black theme-text-main flex items-center gap-3">
        <Settings className="text-[#39ff14] drop-shadow-md" />
        Multiversal Settings
      </h2>

      {/* DISASTER / INSANE DIFFICULTY MASTER PANEL */}
      <div className={`p-6 rounded-2xl theme-bg-panel theme-border border transition-all duration-350 ${
        store.insaneMode 
          ? 'bg-red-950/20 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.08)]' 
          : 'theme-border'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-1.5 ${
              store.insaneMode ? 'text-red-400' : 'theme-text-muted'
            }`}>
              <Skull size={15} className={store.insaneMode ? 'animate-pulse' : ''} />
              Insane Multiverse Mode
            </h3>
            <p className="text-xs theme-text-muted mt-1">
              Test your Rick intelligence. Perfect for seasoned idle/clicker fans who want a real survival struggle.
            </p>
          </div>
          <div>
            <button
              onClick={store.toggleInsaneMode}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                store.insaneMode 
                  ? 'bg-red-500 text-white shadow-lg border border-red-400' 
                  : 'theme-bg-card theme-text-muted hover:theme-text-main theme-border border'
              }`}
            >
              {store.insaneMode ? 'ACTIVE' : 'INACTIVE'}
            </button>
          </div>
        </div>

        {store.insaneMode ? (
          <div className="text-xs text-red-400 space-y-2 mt-4 pt-4 border-t border-red-500/10 font-medium">
            <div className="flex items-start gap-2">
              <span className="text-red-500 text-bold shrink-0">✕</span>
              <span><strong>Weariness Modifier</strong>: Global clone production rate penalized by 35%!</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500 text-bold shrink-0">✕</span>
              <span><strong>Famine Depletion</strong>: Each Morty consumes 5.50 Mega Seeds/sec (up from 4.25). 3x runaway or starvation mortality rate.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500 text-bold shrink-0">✕</span>
              <span><strong>Extreme Winter</strong>: Fields yields collapse completely to 5% standard crop in Froopyland (Winter), buffered to 35% with Portal Heaters.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500 text-bold shrink-0">✕</span>
              <span><strong>Temporal Tears</strong>: Random Dimensional Alerts (Acid ruptures, Fed raids, reality compression, giant head reviews) trigger and must be stabilized manual-pumped before detonation!</span>
            </div>
          </div>
        ) : (
          <div className="text-xs theme-text-muted mt-4 leading-relaxed theme-bg-card p-3 rounded-xl border theme-border">
            🌳 Standard settings: Normal seed requirements, standard seasons modifiers, and safe spatial borders with zero anomaly threats.
          </div>
        )}
      </div>

      {/* DISPLAY LAYOUT DENSITY PANEL */}
      <div className="p-6 rounded-2xl theme-bg-panel border theme-border">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-black theme-text-main uppercase tracking-widest flex items-center gap-1.5">
              <Layout size={15} className="text-[#39ff14] drop-shadow-md" />
              Layout Density
            </h3>
            <p className="text-xs theme-text-muted mt-1">
              Select between Compact (for small screens or data-rich tracking) and Relaxed (sprawling lists with prominent buttons).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 theme-bg-card p-1 rounded-xl border theme-border">
          <button
            onClick={() => store.setDensity('compact')}
            className={`py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
              store.density === 'compact'
                ? 'theme-bg-panel text-[#39ff14] shadow-md border theme-border font-bold'
                : 'theme-text-muted hover:theme-text-main theme-hover-bg'
            }`}
          >
            Compact
          </button>
          <button
            onClick={() => store.setDensity('relaxed')}
            className={`py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
              store.density === 'relaxed'
                ? 'theme-bg-panel text-[#39ff14] shadow-md border theme-border font-bold'
                : 'theme-text-muted hover:theme-text-main theme-hover-bg'
            }`}
          >
            Relaxed
          </button>
        </div>
      </div>
      
      <div className="theme-bg-panel p-6 rounded-2xl border theme-border">
        <h3 className="text-sm font-black theme-text-muted uppercase tracking-widest mb-4">
          Core Timeline Management
        </h3>
        <div className="flex justify-between items-center theme-bg-card p-4 rounded-xl">
          <div>
            <div className="font-bold theme-text-main flex items-center gap-2">
              <Zap className="text-yellow-400 drop-shadow-sm" size={16} />
              Portal Flux Points (Dimensional Prestige)
            </div>
            <div className="theme-text-muted text-sm">Global production multiplier: +{store.portalFlux * 10}%</div>
            {store.portalResets > 0 && (
               <div className="theme-text-muted text-xs mt-1 font-semibold">Times Reset: {store.portalResets}</div>
            )}
          </div>
          <div className="text-3xl font-black text-[#39ff14] drop-shadow-sm">{store.portalFlux}</div>
        </div>
        
        <button
          onClick={store.portalReset}
          className="w-full mt-6 flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white border border-red-600 p-4 rounded-xl font-bold uppercase tracking-wide transition-all drop-shadow-sm"
        >
          <RotateCcw size={18} />
          Portal Reset (Dimension Hop)
        </button>
      </div>
    </div>
  );
}
