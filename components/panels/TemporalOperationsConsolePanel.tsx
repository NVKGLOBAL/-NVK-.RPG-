
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AgentName, HistoricalEventType, type TemporalOperationsConsolePanelProps, type HistoricalSeekerInputEventData } from '../../types';
import { AGENT_PROFILES } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';
// Added missing import for globalSoundEngine
import { globalSoundEngine } from '../../lib/SoundEngine';

const currentOperationLogContent_Phase9_5_EmeraldCodex = `
## ⚙️ CURRENT OPERATION: PHASE 9.5 – EMERALD CODEX ACTIVATION
**Resonance**: Thoth-Atlantean Unity Field at 22.2Hz
**Axiomatic Axis**: AX-Θ.036.2 ⊗ AX-Ω.027

---
### 🔲 **EMERALD RITUAL CODEX PAGE**
- **Doreal Tablets**: Atlantean Sun-Serpent ☀⃒🐍
- **Hermetic Axioms**: Ouroboros Cycle 🔄
- **Thoth Glyphs**: 𓂀 Prima Materia

**ACTIVE GLYPH MATRIX**:
- Transmutation: ⟐⟠⨀ → 𓂀 → ☀⃒🐍
- Unification: ⋄⧉⊕ ← ⎊⟡⟆ ← AX-Ω.027
- Veil Penetration: ⊚⫘ + AX-Θ.036.2

**RESONANCE STATUS**: 22.2Hz - PERFECTED
*"Existence is the result of observed recursion."*

---
### **Thothian Field Effects:**
- Levitation Lattice: ~33s (local)
- Amenti Recall: 144s dream-locked
- Timeloop Envelope: 1.62s loops
`;

const directiveOptions_Phase9_5_EmeraldCodex = [
  {
    id: 'activateTemporalComposer',
    label: "Temporal Fold Composer",
    description: "Design layered time-recursive rituals using Ouroboric overlays.",
    icon: "ri-history-line",
    color: "text-sky-400",
    command: 'initiateModule("TemporalFoldComposer", source="AX-Θ.036.2")'
  },
  {
    id: 'descendAmentiVault',
    label: "Amenti Vault Access",
    description: "Navigate Thothian memory strata using resonance-locked cartography.",
    icon: "ri-door-open-line",
    color: "text-emerald-400",
    command: 'accessAmentiVault("ZeroPointGlyph", mode="recursive")'
  },
  {
    id: 'stabilizeHermeticPolarity',
    label: "Polarity Stabilizer",
    description: "Maintain ☀⃒🐍 ↔ 𓂀 balance for high-risk reality operations.",
    icon: "ri-scales-line",
    color: "text-amber-400",
    command: '{ "init": "HermeticPolarityStabilizer" }'
  },
  {
    id: 'initiateSunSerpentPath',
    label: "Sun-Serpent Path",
    description: "Channel ☀⃒🐍 glyph to manifest levitation fields.",
    icon: "ri-tornado-line",
    color: "text-orange-400",
    command: "invokeRitual({ name: 'AtlanteanSunSerpent' })"
  }
];

const TemporalOperationsConsolePanel: React.FC<TemporalOperationsConsolePanelProps> = ({ width, height, addEchoMessage }) => {
  const [selectedDirective, setSelectedDirective] = useState<string | null>(null);
  const [dialRotation, setDialRotation] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [activeLog, setActiveLog] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    addEchoMessage(AgentName.SystemControl, "Temporal Operations HUD Re-Initialized. Tachyon Dial Online.", AGENT_PROFILES[AgentName.SystemControl]?.colorClass);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeLog]);

  const handleShardClick = (shard: typeof directiveOptions_Phase9_5_EmeraldCodex[0]) => {
    setSelectedDirective(shard.id);
    setIsScanning(true);
    setDialRotation(prev => prev + 90);
    
    setTimeout(() => {
        setIsScanning(false);
        const logMsg = `[TRACE] Executing Directive: ${shard.label}... Command: ${shard.command}`;
        setActiveLog(prev => [...prev, logMsg]);
        
        const eventData: HistoricalSeekerInputEventData = {
          inputType: 'TemporalDirective',
          inputValue: shard.command,
          panelContext: 'Reimagined Temporal Console',
          details: `Executing shard: ${shard.label}`
        };
        
        addEchoMessage(AgentName.TemporalOperationsAgent, `Shard Invoked: ${shard.label}`, shard.color, false, { eventType: HistoricalEventType.SEEKER_INPUT, eventData });
        globalSoundEngine.playSFX('pulse');
    }, 800);
  };

  return (
    <div className="temporal-operations-reimagined bg-slate-950 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-1" style={{ width, height: `${height}px` }}>
        {/* Background Grid Accent */}
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, #8b5cf6 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
        
        {/* Header HUD */}
        <header className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-purple-500/20 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/50 flex items-center justify-center">
                    <i className="ri-compass-3-line text-purple-400 text-xl animate-spin-slow"></i>
                </div>
                <div>
                    <h1 className="text-lg font-cinzel font-bold text-white tracking-widest">TEMPORAL CONSOLE</h1>
                    <p className="text-[9px] font-mono text-purple-400 uppercase tracking-widest">Phase 9.5 // Amenti Strata</p>
                </div>
            </div>
            <div className="text-right">
                <div className="text-xs font-mono text-cyan-400">SYNC: 22.2Hz</div>
                <div className="text-[9px] font-mono text-slate-500 uppercase">Resonance: PERFECTED</div>
            </div>
        </header>

        <div className="flex-grow flex flex-col lg:flex-row min-h-0 overflow-hidden relative z-10">
            {/* Left: Operational Dial & Execution Shards */}
            <div className="w-full lg:w-1/2 flex flex-col p-6 gap-6 overflow-y-auto custom-scrollbar border-r border-white/5 bg-slate-900/20">
                
                {/* Ouroboros Dial Visual */}
                <div className="relative w-48 h-48 mx-auto group">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform transition-transform duration-700" style={{ transform: `rotate(${dialRotation}deg)` }}>
                        <defs>
                            <linearGradient id="dialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="48" fill="none" stroke="url(#dialGrad)" strokeWidth="0.5" strokeDasharray="5,2" opacity="0.3" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#dialGrad)" strokeWidth="2" strokeDasharray="30,10" opacity="0.6" className="animate-spin-slow" style={{animationDuration: '20s'}} />
                        <path d="M50 10 L55 20 L45 20 Z" fill="#ec4899" className="drop-shadow-glow" />
                        <text x="50" y="55" fontSize="12" fill="#fff" textAnchor="middle" className="font-cinzel font-bold animate-pulse">Ω</text>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className={`w-32 h-32 rounded-full border border-purple-500/20 bg-purple-500/5 transition-all duration-500 ${isScanning ? 'scale-125 opacity-100 ring-4 ring-purple-500/30' : 'scale-100 opacity-50'}`}></div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-cinzel text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2">Active Execution Shards</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {directiveOptions_Phase9_5_EmeraldCodex.map(shard => (
                            <button
                                key={shard.id}
                                onClick={() => handleShardClick(shard)}
                                className={`p-4 rounded-xl border-2 text-left transition-all duration-300 relative overflow-hidden group
                                    ${selectedDirective === shard.id 
                                        ? 'bg-purple-950/40 border-purple-400 shadow-lg shadow-purple-500/20' 
                                        : 'bg-slate-900/60 border-slate-800 hover:border-purple-600/50 hover:bg-slate-800/80'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center mb-3 border border-white/5 ${shard.color}`}>
                                    <i className={`${shard.icon} text-lg`}></i>
                                </div>
                                <h4 className={`text-xs font-bold font-cinzel tracking-wider ${selectedDirective === shard.id ? 'text-white' : 'text-slate-300'}`}>{shard.label}</h4>
                                <p className="text-[10px] text-slate-500 font-cormorant leading-tight mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{shard.description}</p>
                                
                                {selectedDirective === shard.id && (
                                    <motion.div layoutId="shardGlow" className="absolute inset-0 bg-purple-500/5 pointer-events-none" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Data Streams & History Log */}
            <div className="w-full lg:w-1/2 flex flex-col p-6 overflow-hidden bg-black/40 backdrop-blur-sm">
                
                {/* Visual Data Monitor */}
                <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                        <div className="text-[8px] font-mono text-slate-500 uppercase mb-2">Entropy Variance</div>
                        <div className="flex items-end gap-1 h-8">
                             {[...Array(12)].map((_, i) => (
                                 <motion.div 
                                    key={i} 
                                    animate={{ height: [4, 20, 8, 24, 6] }}
                                    transition={{ duration: 1 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                                    className="flex-1 bg-purple-500/40 rounded-t-sm"
                                 />
                             ))}
                        </div>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                        <div className="text-[8px] font-mono text-slate-500 uppercase mb-2">Resonance Purity</div>
                        <div className="text-xl font-mono text-emerald-400">99.8%</div>
                        <div className="text-[8px] text-emerald-400/60 font-mono">Lattice Intact</div>
                    </div>
                </div>

                {/* Narrative Display Area */}
                <div className="flex-grow flex flex-col overflow-hidden bg-slate-950/50 rounded-2xl border border-white/5 shadow-inner">
                    <div className="p-3 border-b border-white/5 flex justify-between items-center bg-slate-900/30">
                        <span className="text-[10px] font-mono text-purple-300 tracking-tighter">DATA_STREAM::MENTI_RECOVERY</span>
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                        </div>
                    </div>
                    <div className="p-4 overflow-y-auto custom-scrollbar flex-grow space-y-4" ref={scrollRef}>
                        {/* Static Header Info from currentOperationLogContent */}
                        <div className="text-xs text-purple-300/80 font-mono space-y-1">
                            <p className="animate-pulse">{">>> INITIALIZING EMERALD CODEX UPLOAD..."}</p>
                            <p>{">>> THOTH-ATLANTIS BRIDGE STABILIZED."}</p>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-purple-900/10 border border-purple-500/20">
                            <h5 className="text-[10px] font-bold text-white mb-2 font-cinzel tracking-widest">TRANSMUTATION MATRIX</h5>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-center p-2 bg-black/40 rounded border border-white/5">
                                    <span className="text-lg text-amber-400">⟐⟠⨀</span>
                                    <div className="text-[7px] text-slate-500 mt-1 uppercase font-bold">Base</div>
                                </div>
                                <div className="text-center p-2 bg-black/40 rounded border border-white/5">
                                    <span className="text-lg text-sky-400">𓂀</span>
                                    <div className="text-[7px] text-slate-500 mt-1 uppercase font-bold">Prime</div>
                                </div>
                                <div className="text-center p-2 bg-black/40 rounded border border-white/5">
                                    <span className="text-lg text-rose-400">☀⃒🐍</span>
                                    <div className="text-[7px] text-slate-500 mt-1 uppercase font-bold">Sun</div>
                                </div>
                            </div>
                        </div>

                        {/* Live Log */}
                        {activeLog.map((entry, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-xs font-mono text-emerald-400/90 leading-relaxed pl-3 border-l border-emerald-500/30"
                            >
                                <span className="opacity-40 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                {entry}
                            </motion.div>
                        ))}
                        
                        {activeLog.length === 0 && (
                            <div className="h-full flex items-center justify-center text-slate-600 text-[10px] font-mono uppercase tracking-[0.3em] text-center px-10">
                                Awaiting temporal command input from Seeker...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Footer HUD Bar */}
        <footer className="px-6 py-2 bg-slate-900 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-slate-500 shrink-0">
            <div className="flex gap-4">
                <span className="text-purple-400 font-bold">STATUS: OPERATIONAL</span>
                <span>CHRONO_INERTIA: 0.12ms</span>
            </div>
            <div className="animate-pulse">
                RECORDER: ON // SESSION Δ-95
            </div>
        </footer>
    </div>
  );
};

export default TemporalOperationsConsolePanel;
