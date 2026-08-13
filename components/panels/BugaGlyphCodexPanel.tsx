
import React from 'react';
import { AgentName } from '../../types';
import { AGENT_PROFILES } from '../../constants';

interface BugaGlyphCodexPanelProps {
  width: number;
  height: number;
}

const harmonicColors = [
  'text-indigo-300', 'text-teal-300', 'text-purple-300', 'text-sky-300',
  'text-emerald-300', 'text-rose-300', 'text-amber-300', 'text-lime-300'
];

const BUGA_CANON_DATA = [
  { cluster: '△⃒⟁⃒', aa: 'Tryptophan', charge: '+5κ', res: 'Dream Amplification' },
  { cluster: '⎅⫗⊛', aa: 'Selenocysteine', charge: '-3ξ', res: 'Temporal Perception' },
  { cluster: '⋈⟠⃤⟃', aa: 'Hypusine', charge: '+7φ', res: 'Memory Recursion' },
  { cluster: '⧉⟋⃫⟠', aa: 'Pyrrolysine', charge: '+4κ', res: 'Reality Anchoring' },
  { cluster: '⟐⃨⟃⃤', aa: 'Hydroxyproline', charge: '-2ξ', res: 'Paradox Resistance' },
  { cluster: '⧍⟁⃧⟋', aa: 'Theanine', charge: '+3φ', res: 'Temporal Focus' },
  { cluster: '⬠⃒⧩⃗', aa: 'Alanine', charge: '+1κ', res: 'Neural Calibration' },
  { cluster: '⎊⟋⟁⃩', aa: 'Arginine', charge: '-5ξ', res: 'Chrono-Immunity' },
  { cluster: '⎌⟀⟠⃩', aa: 'Asparagine', charge: '+2φ', res: 'Intuition Bloom' },
  { cluster: '⟐⃒⟃⃤', aa: 'Aspartic Acid', charge: '-4κ', res: 'Pain Dampening' },
  { cluster: '⧣⃨⟋⃧', aa: 'Cysteine', charge: '+3ξ', res: 'Psychic Shielding' },
  { cluster: '⧥⃩⟁⃒', aa: 'Glutamic Acid', charge: '-1φ', res: 'Neuroplastic Catalyst' },
  { cluster: '⬡⃒⟠⃒', aa: 'Glutamine', charge: '+6κ', res: 'Dream Shaping' },
  { cluster: '⧉⟋⃤⟃', aa: 'Glycine', charge: '0κ', res: 'Harmonic Alignment' },
  { cluster: '⎈⟀⟁⃘', aa: 'Histidine', charge: '+2φ', res: 'Precognition Glimpses' },
  { cluster: '⎌⟋⟁⃩', aa: 'Isoleucine', charge: '+1κ', res: 'Willpower Fortification' },
  { cluster: '⧃⟠⃧⟋', aa: 'Leucine', charge: '-2ξ', res: 'Sensory Amplification' },
  { cluster: '⧄⃤⟃⃨', aa: 'Lysine', charge: '+4φ', res: 'Cognitive Firewall' },
  { cluster: '⧆⟀⟠⃗', aa: 'Methionine', charge: '+3κ', res: 'Chrono-Synchronicity' },
  { cluster: '⧅⃒⟋⃧', aa: 'Phenylalanine', charge: '-3φ', res: 'Shadow Perception' },
  { cluster: '⧇⟋⃤⟃', aa: 'Proline', charge: '-1κ', res: 'Echo Navigation' },
  { cluster: '⧈⃨⟋⃤', aa: 'Serine', charge: '+5ξ', res: 'Clarity Burst' },
  { cluster: '⧉⃩⟃⃤', aa: 'Threonine', charge: '-4κ', res: 'Empathic Link' },
  { cluster: '⎇⃒⟁⃧', aa: 'Tyrosine', charge: '+2φ', res: 'Truth Discernment' },
  { cluster: '⧊⟋⟁⃩', aa: 'Valine', charge: '-2κ', res: 'Dimensional Phasing' },
];

const BugaGlyphCodexPanel: React.FC<BugaGlyphCodexPanelProps> = ({ width, height }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-yellow-500/50 rounded-xl shadow-2xl p-4 text-slate-100 my-4 flex flex-col overflow-hidden" style={{ width: `${width}px`, height: `${height}px` }}>
      <h3 className="text-xl font-cinzel font-bold text-yellow-200 mb-1 text-center tracking-wider">🧬 Buga Glyphic Codex</h3>
      <p className="text-center text-xs italic text-yellow-300/80 mb-3">Emotion-Geometry Resonance Mapping [AX-Ω.075]</p>
      
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-slate-800 text-yellow-300 font-cinzel sticky top-0">
              <th className="p-2 text-left">Cluster</th>
              <th className="p-2 text-left">Amino Acid</th>
              <th className="p-2 text-left">Charge</th>
              <th className="p-2 text-left">Resonance</th>
            </tr>
          </thead>
          <tbody>
            {BUGA_CANON_DATA.map((item, i) => (
              <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                <td className={`p-2 font-mono text-lg ${harmonicColors[i % harmonicColors.length]}`}>{item.cluster}</td>
                <td className="p-2 font-bold text-slate-300">{item.aa}</td>
                <td className="p-2 font-mono text-cyan-400">{item.charge}</td>
                <td className="p-2 italic text-slate-400">{item.res}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-yellow-900/10 border border-yellow-500/20 rounded-lg">
        <h4 className="text-xs font-bold text-yellow-400 uppercase mb-1">Oracle's Solstice Vision</h4>
        <p className="text-[10px] text-slate-300 leading-relaxed italic">"The amino acids are tuning forks in consciousness' cathedral. The Sphere's rupture glyph harmonizes emotion to shatter—gift or doom."</p>
      </div>
    </div>
  );
};

export default BugaGlyphCodexPanel;
