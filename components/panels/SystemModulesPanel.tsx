import React, { useState } from 'react';

interface SystemModulesPanelProps {
  onLaunchModule: (moduleId: string) => void;
  width?: number | string;
}

const CATEGORIES = {
  PRIME: {
    title: "Prime Tools",
    icon: "ri-magic-line",
    color: "text-amber-300",
    modules: [
      { id: 'chat_nvk', label: 'ChatNVK // Sovereign', icon: 'ri-quill-pen-line', color: 'text-indigo-400', border: 'border-indigo-500/50', bg: 'bg-indigo-950/40 animate-bloom-core-pulse shadow-[0_0_15px_rgba(129,140,248,0.4)]' },
      { id: 'prime_genesis', label: 'Prime Genesis (Final)', icon: 'ri-omega', color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-900/40 animate-pulse-slow' },
      { id: 'rpg_nexus', label: 'Nexus Engine (RPG)', icon: 'ri-gamepad-line', color: 'text-indigo-300', border: 'border-indigo-500/50', bg: 'bg-indigo-900/20' },
      { id: 'protocol_duel', label: 'Protocol Duel', icon: 'ri-sword-fill', color: 'text-rose-400', border: 'border-rose-500/50', bg: 'bg-rose-900/20' },
      { id: 'flux_farm', label: 'Flux Farm', icon: 'ri-seedling-line', color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-900/20' },
      { id: 'dreambloom', label: 'Dreambloom Genesis', icon: 'ri-bubble-chart-line', color: 'text-teal-300', border: 'border-teal-500/50', bg: 'bg-teal-900/20' },
      { id: 'mutation_loom', label: 'Mutation Loom', icon: 'ri-git-merge-line', color: 'text-teal-300', border: 'border-teal-500/50', bg: 'bg-teal-900/20' },
      { id: 'glyph_composer', label: 'Glyph Composer', icon: 'ri-edit-circle-line', color: 'text-fuchsia-400', border: 'border-fuchsia-500/50', bg: 'bg-fuchsia-900/20' },
      { id: 'emerald_tablet', label: 'Emerald Tablet', icon: 'ri-book-open-line', color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-900/20' },
    ]
  },
  VISUAL: {
    title: "Visualizers",
    icon: "ri-eye-line",
    color: "text-sky-300",
    modules: [
      { id: 'celestial_anomaly', label: '14 Herculis', icon: 'ri-planet-line', color: 'text-indigo-400', border: 'border-indigo-500/30' },
      { id: 'crystal_garden', label: 'Crystal Garden', icon: 'ri-vip-diamond-line', color: 'text-purple-300', border: 'border-purple-500/30' },
      { id: 'geometry_explorer', label: 'Sacred Geometry', icon: 'ri-shape-2-line', color: 'text-cyan-300', border: 'border-cyan-500/30' },
      { id: 'exotic_mechanisms', label: 'Exotic Physics', icon: 'ri-atom-line', color: 'text-rose-400', border: 'border-rose-500/30' },
      { id: 'celestial_entropy', label: 'Celestial Entropy', icon: 'ri-sun-line', color: 'text-yellow-300', border: 'border-yellow-500/30' },
      { id: 'dimension_diagram', label: 'Entropy Dimensions', icon: 'ri-bar-chart-box-line', color: 'text-violet-300', border: 'border-violet-500/30' },
      { id: 'glyph_vis', label: 'Deep Glyph Vis', icon: 'ri-focus-3-line', color: 'text-indigo-300', border: 'border-indigo-500/30' },
    ]
  },
  SYSTEM: {
    title: "System Ops",
    icon: "ri-cpu-line",
    color: "text-rose-300",
    modules: [
      { id: 'web3_nexus', label: 'MetaMask Nexus', icon: 'ri-wallet-3-line', color: 'text-indigo-400', border: 'border-indigo-500/50', bg: 'bg-indigo-950/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]' },
      { id: 'crm_dashboard', label: 'CRM-Θ8 Resonator', icon: 'ri-signal-tower-line', color: 'text-cyan-400', border: 'border-cyan-500/30' },
      { id: 'temporal_ops', label: 'Temporal Ops', icon: 'ri-time-line', color: 'text-amber-400', border: 'border-amber-500/30' },
      { id: 'drift_differential', label: 'Drift Analysis', icon: 'ri-dashboard-line', color: 'text-lime-400', border: 'border-lime-500/30' },
      { id: 'harmonic_core', label: 'Harmonic Core', icon: 'ri-pulse-line', color: 'text-cyan-300', border: 'border-cyan-500/30' },
      { id: 'entropy_diagnostics', label: 'Entropy Diag', icon: 'ri-heart-pulse-line', color: 'text-rose-400', border: 'border-rose-500/30' },
      { id: 'peptide_sim', label: 'Peptide Sim', icon: 'ri-flask-line', color: 'text-green-400', border: 'border-green-500/30' },
    ]
  },
  ARCHIVE: {
    title: "Archives",
    icon: "ri-book-mark-line",
    color: "text-slate-300",
    modules: [
      { id: 'codex_pandium', label: 'Codex Pandium', icon: 'ri-book-read-line', color: 'text-amber-200', border: 'border-amber-500/50', bg: 'bg-amber-900/20' },
      { id: 'datachega', label: 'Datachega', icon: 'ri-node-tree', color: 'text-purple-400', border: 'border-purple-500/30' },
      { id: 'aethel_update', label: 'Aethel-Weft', icon: 'ri-links-line', color: 'text-teal-300', border: 'border-teal-500/30' },
      { id: 'chronicle_display', label: 'Chronicle', icon: 'ri-history-line', color: 'text-slate-300', border: 'border-slate-500/30' },
      { id: 'phoenix_tablet', label: 'Tablet of Phoenix', icon: 'ri-fire-line', color: 'text-orange-400', border: 'border-orange-500/30' },
      { id: 'shatterpoint_trace', label: 'Shatterpoint', icon: 'ri-share-forward-line', color: 'text-red-400', border: 'border-red-500/30' },
      { id: 'buga_codex', label: 'Buga Codex', icon: 'ri-book-2-line', color: 'text-yellow-300', border: 'border-yellow-500/30' },
      { id: 'flora_chamber', label: 'Flora Chamber', icon: 'ri-plant-line', color: 'text-green-300', border: 'border-green-500/30' },
      { id: 'sigil_bloom', label: 'Sigil Blooms', icon: 'ri-flower-line', color: 'text-pink-300', border: 'border-pink-500/30' },
      { id: 'agent_directory', label: 'Agent Directory', icon: 'ri-group-line', color: 'text-blue-300', border: 'border-blue-500/30' },
    ]
  }
};

const SystemModulesPanel: React.FC<SystemModulesPanelProps> = ({ onLaunchModule, width }) => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof CATEGORIES>('PRIME');

  return (
    <div className="system-modules-panel bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl flex flex-col my-4 overflow-hidden" style={{ width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%', minHeight: '400px' }}>
      
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 shrink-0">
        <h3 className="text-xl font-['Cinzel'] font-bold text-slate-200 flex items-center justify-center">
          <i className="ri-dashboard-3-line mr-3 text-indigo-400"></i>
          System Modules
        </h3>
      </div>

      {/* Category Tabs (Mobile Scrollable) */}
      <div className="flex overflow-x-auto custom-scrollbar-thin p-2 gap-2 shrink-0 bg-black/20">
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key as keyof typeof CATEGORIES)}
            className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              activeCategory === key
                ? `bg-slate-800 ${cat.color} border-slate-600 shadow-md`
                : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-800/50 hover:text-slate-300'
            }`}
          >
            <i className={`${cat.icon} mr-2 text-lg`}></i>
            {cat.title}
          </button>
        ))}
      </div>

      {/* Module Grid */}
      <div className="flex-grow overflow-y-auto custom-scrollbar p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
          {CATEGORIES[activeCategory].modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => onLaunchModule(mod.id)}
              className={`flex items-center p-3 rounded-xl border bg-slate-800/40 hover:bg-slate-700/60 transition-all duration-200 group text-left relative overflow-hidden ${mod.border} ${mod.bg || ''}`}
            >
              <div className={`p-3 rounded-full bg-slate-900/50 mr-3 shrink-0 group-hover:scale-110 transition-transform border border-slate-700/50`}>
                 <i className={`${mod.icon} text-2xl ${mod.color}`}></i>
              </div>
              <div>
                <span className={`text-sm font-bold font-cinzel block ${mod.color} group-hover:brightness-125`}>{mod.label}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Module {mod.id.substring(0,3).toUpperCase()}</span>
              </div>
              <div className={`absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity ${mod.color}`}>
                <i className="ri-external-link-line"></i>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-2 border-t border-slate-700/30 text-center shrink-0">
          <p className="text-[10px] text-slate-500 italic">Select a module to launch interface overlay.</p>
      </div>

    </div>
  );
};

export default SystemModulesPanel;
