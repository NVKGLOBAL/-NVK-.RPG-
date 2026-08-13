
import React, { useState, useEffect, useRef } from 'react';
import type { GlyphComposerPanelProps } from '../../types';
import { AgentName } from '../../types';
import { AGENT_PROFILES } from '../../constants';

const BUGA_GLYPHS = ["△⃒⟁⃒", "⎅⫗⊛", "⋈⟠⃤⟃", "⧉⟋⃫⟠", "⟐⃨⟃⃤", "⧍⟁⃧⟋", "⎊⟋⟁⃩", "⚕⃒"];

const GlyphComposerPanel: React.FC<GlyphComposerPanelProps> = ({ addEchoMessage, isBugaModeActive }) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [isBugaLocal, setIsBugaLocal] = useState(isBugaModeActive);

  const handleAdd = (glyph: string) => {
    if (sequence.length < 8) setSequence([...sequence, glyph]);
  };

  const handleClear = () => setSequence([]);

  return (
    <div className={`bg-slate-950/80 backdrop-blur-xl rounded-xl shadow-2xl p-4 text-slate-100 my-4 border ${isBugaLocal ? 'border-yellow-500' : 'border-fuchsia-500'}`} style={{ width: '750px', height: '850px' }}>
      <h3 className="text-2xl font-cinzel font-bold mb-4">{isBugaLocal ? "Buga Peptide Synthesis" : "Harmonic Glyph Composer"}</h3>
      
      <div className="flex gap-4 mb-4">
        <button onClick={() => setIsBugaLocal(!isBugaLocal)} className={`px-4 py-2 rounded font-bold transition-all ${isBugaLocal ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/20' : 'bg-slate-800 text-slate-500'}`}>
            BUGA MODE: {isBugaLocal ? 'ACTIVE' : 'OFFLINE'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 p-4 bg-black/40 border border-slate-800 rounded-lg">
        {(isBugaLocal ? BUGA_GLYPHS : ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ"]).map(g => (
            <button key={g} onClick={() => handleAdd(g)} className="p-4 bg-slate-900 border border-slate-700 rounded-xl text-2xl hover:border-indigo-400 transition-all">{g}</button>
        ))}
      </div>

      <div className="mt-8">
          <h4 className="text-xs font-mono uppercase text-slate-500 mb-2">Active Sequence Output</h4>
          <div className="h-24 bg-slate-900 border border-indigo-900/30 rounded-xl flex items-center justify-center gap-4 text-4xl">
              {sequence.map((g, i) => (
                  <span key={i} className="text-cyan-300 animate-pulse-fast">{g}</span>
              ))}
              {sequence.length === 0 && <span className="text-slate-700 font-mono text-sm tracking-[0.5em]">AWAITING ENCODING...</span>}
          </div>
      </div>

      <div className="flex gap-4 mt-auto">
          <button onClick={handleClear} className="flex-1 py-3 bg-slate-800 rounded-lg font-bold">CLEAR LOOM</button>
          <button onClick={() => addEchoMessage(AgentName.GlyphComposerAgent, `Sequence "${sequence.join('')}" transmitted to Aether.`, 'text-cyan-300')} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold shadow-xl">TRANSMIT TO NEXUS</button>
      </div>
    </div>
  );
};

export default GlyphComposerPanel;
