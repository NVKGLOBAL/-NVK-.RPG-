
import React from 'react';
import type { SeekerProfile, RPGGameState } from '../../types';
import { SEEKER_AURA_OPTIONS } from '../../constants';

interface SeekerVitalsPanelProps {
  activeProfile: SeekerProfile | null;
  rpgState: RPGGameState | undefined;
}

const ProgressBar: React.FC<{ label: string; current: number; max: number; color: string; icon: string }> = ({ label, current, max, color, icon }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  
  return (
    <div className="mb-3">
      <div className="flex justify-between items-end mb-1 text-xs uppercase font-bold tracking-wider text-slate-400">
        <span className="flex items-center gap-1"><i className={`${icon} ${color}`}></i> {label}</span>
        <span className="font-mono text-slate-200">{current} / {max}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 relative">
        <div 
          className={`h-full transition-all duration-500 ease-out ${color.replace('text-', 'bg-')}`} 
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full animate-[shimmer_2s_infinite]"></div>
      </div>
    </div>
  );
};

const StatRow: React.FC<{ label: string; value: string | number; icon?: string; color?: string }> = ({ label, value, icon, color = 'text-slate-200' }) => (
  <div className="flex justify-between items-center text-xs py-1 border-b border-slate-800/50 last:border-0">
    <span className="text-slate-500">{label}</span>
    <span className={`font-mono font-semibold ${color} flex items-center gap-1`}>
      {icon && <i className={icon}></i>} {value}
    </span>
  </div>
);

const SeekerVitalsPanel: React.FC<SeekerVitalsPanelProps> = ({ activeProfile, rpgState }) => {
  if (!activeProfile) {
    return (
      <div className="seeker-vitals-panel bg-slate-900/90 border border-slate-700/50 rounded-xl p-4 text-center text-slate-500 italic text-xs">
        No Life Signal Detected.
      </div>
    );
  }

  const currentIntegrity = rpgState?.vitals?.integrity ?? 100;
  const currentSanity = rpgState?.vitals?.sanity ?? 100;
  const maxIntegrity = 100;
  const maxSanity = 100;

  const primaryHex = SEEKER_AURA_OPTIONS.find(o => o.id === activeProfile.auraColor)?.hex || '#3b82f6';
  const secondaryHex = SEEKER_AURA_OPTIONS.find(o => o.id === activeProfile.auraSecondaryColor)?.hex || primaryHex;

  // Defensive substrings
  const primaryCode = activeProfile.auraColor?.substring(0, 3) || "---";
  const secondaryCode = activeProfile.auraSecondaryColor?.substring(0, 3) || "---";

  return (
    <div className="seeker-vitals-panel bg-slate-950/90 backdrop-blur-md border border-indigo-500/30 rounded-xl shadow-lg p-4 text-slate-100 flex flex-col gap-4 relative overflow-hidden">
      <div className="flex items-center gap-3 border-b border-indigo-500/30 pb-3">
        <div className="relative w-12 h-12 rounded-lg border border-slate-600 overflow-hidden bg-black">
          {activeProfile.avatarImageUrl ? (
            <img src={activeProfile.avatarImageUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600"><i className="ri-user-6-fill text-2xl"></i></div>
          )}
          <div className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full ${currentIntegrity > 20 ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]'}`}></div>
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-sm font-cinzel font-bold text-indigo-300 truncate">{activeProfile.name || 'Unknown'}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
             <div className="w-2 h-2 rounded-full shadow-[0_0_3px_currentColor]" style={{ color: primaryHex, backgroundColor: 'currentColor' }}></div>
             <div className="w-2 h-2 rounded-full opacity-60 shadow-[0_0_3px_currentColor]" style={{ color: secondaryHex, backgroundColor: 'currentColor' }}></div>
             <p className="text-[8px] text-slate-400 uppercase tracking-widest truncate">{activeProfile.race} {activeProfile.class}</p>
          </div>
        </div>
        <div className="text-right">
             <div className="text-xl font-mono font-bold text-emerald-400">{activeProfile.level || 1}</div>
             <div className="text-[9px] text-slate-500 uppercase">LVL</div>
        </div>
      </div>

      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
        <ProgressBar 
          label="Integrity" 
          current={currentIntegrity} 
          max={maxIntegrity} 
          color={currentIntegrity < 30 ? 'bg-red-600' : 'bg-gradient-to-r from-red-600 to-rose-500'} 
          icon="ri-heart-pulse-fill" 
        />
        <ProgressBar 
          label="Sanity" 
          current={currentSanity} 
          max={maxSanity} 
          color={currentSanity < 30 ? 'bg-purple-600' : 'bg-gradient-to-r from-purple-600 to-indigo-500'} 
          icon="ri-brain-line" 
        />
      </div>

      <div className="grid grid-cols-1 gap-1 bg-slate-900/30 p-2 rounded-lg border border-slate-800">
        <StatRow label="Flux Aether" value={activeProfile.flux || 0} icon="ri-copper-coin-line" color="text-amber-400" />
        <StatRow label="Alignment" value={activeProfile.energyAlignment || 'Balanced'} color="text-sky-300" />
        <StatRow label="Resonance" value={`${primaryCode}|${secondaryCode}`} color="text-indigo-400" />
      </div>
      
      <div className="absolute top-2 right-2 text-[8px] font-mono text-indigo-500/40 pointer-events-none">ID: {activeProfile.generatedAt?.toString().slice(-6) || 'XXXXXX'}</div>
    </div>
  );
};

export default SeekerVitalsPanel;
