import React, { useState, useEffect, useRef } from 'react';
import type { EchoMessage } from '../../types';
import { AgentName, HistoricalEventType } from '../../types';
import { AGENT_PROFILES } from '../../constants';
import { useGemini } from '../../context/GeminiIntegrationContext';
import { Button } from '../ui/Button';
// Fix: Added missing import for globalSoundEngine
import { globalSoundEngine } from '../../lib/SoundEngine';

interface PeptideSimulationPanelProps {
  addEchoMessage: (source: AgentName | string, text: string, colorClass?: string, isAutoEcho?: boolean, meta?: any) => void;
  width: number;
  height: number;
}

interface StabilizationPhase {
    id: number;
    name: string;
    label: string;
    details: string;
    status: 'pending' | 'active' | 'complete';
    color: string;
}

const SPS_LORE_DATA = {
    name: "SPS-XΩ.Σ (Super-Phase Stabilizer)",
    components: [
        { name: "α-Trp⁻ (Anti-Tryptophan)", role: "Photonic Sink", effect: "Annihilates Rift-Glow / Converts radiation to binding energy." },
        { name: "α-Hyp⁻ (Anti-Hypusine)", role: "Translational Stasis", effect: "Freezes ribosomal machinery / Halts dimensional mutation." }
    ]
};

const PeptideSimulationPanel: React.FC<PeptideSimulationPanelProps> = ({ addEchoMessage, width, height }) => {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(-1);
  const { invokeGemini } = useGemini();
  const logEndRef = useRef<HTMLDivElement>(null);

  const phases: StabilizationPhase[] = [
      { id: 0, name: "I. Chiral Anchor", label: "Passive Seeding", details: "Peptide folds into the vacuum, aligning α-Trp⁻ against Rift particle spin.", status: 'pending', color: 'text-sky-400' },
      { id: 1, name: "II. Molecular Sealing", label: "Σ-Chain Activation", details: "Σ-sequence creates Bio-Static Shield; α-Hyp⁻ initiates translational stasis.", status: 'pending', color: 'text-emerald-400' },
      { id: 2, name: "III. Omega Collapse", label: "The Great Stillness", details: "Terminus enforces macro quantum decoherence. Rift aperture contracts.", status: 'pending', color: 'text-amber-400' }
  ];

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [currentPhaseIndex, result]);

  const handleSimulate = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setResult(null);
    setCurrentPhaseIndex(0);
    
    addEchoMessage(AgentName.RPGNexusAgent, "Deploying SPS-XΩ.Σ Stabilizer to Sector 14...", "text-fuchsia-300 font-bold");
    globalSoundEngine.playSFX('pulse');

    // Run Phased Simulation
    for (let i = 0; i < 3; i++) {
        setCurrentPhaseIndex(i);
        await new Promise(r => setTimeout(r, 2500));
        addEchoMessage(AgentName.ExoticMechanismAgent, `Phase ${i+1}: ${phases[i].name} established.`, phases[i].color);
    }

    try {
        const prompt = `Simulate the final impact of SPS-XΩ.Σ on a Class-VII Manifold Tear in Sector 14. 
        Focus on: 1. Dimensional Scabbing (Crystalline Bio-Membrane), 2. Harmonic Nullification (Scream to Hum), 3. Temporal stabilization at 1.00s/s.
        The readout should be from the perspective of a Tri-Sophian technician documenting a successful but permanent necrolysis zone. 1-2 paragraphs.`;
        
        const text = await invokeGemini(prompt, "Speak as a technical lore scribe for the Tri-Sophian Codex.");
        setResult(text);
        
        addEchoMessage(AgentName.System, "STABILIZATION COMPLETE: Sector 14 cauterized.", "text-emerald-400 font-bold");
        
        // Log final historical event
        addEchoMessage(AgentName.RPGNexusAgent, "Omega-Permanence Protocol active.", "text-amber-300", false, {
            eventType: HistoricalEventType.SPS_STABILIZATION,
            eventData: { phase: "Final", status: "Mausoleum Zone Established" }
        });

    } catch (e) { 
        setResult("STABILIZATION CASCADE FAILURE: Translation Loop Detected."); 
    } finally { 
        setIsLoading(false); 
    }
  };

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-emerald-500/40 rounded-xl shadow-2xl p-4 text-slate-100 my-4 flex flex-col overflow-hidden" style={{ width, height: `${height}px` }}>
      <h3 className="text-lg font-cinzel font-bold text-emerald-300 mb-3 text-center tracking-wider border-b border-emerald-900/50 pb-2 flex items-center justify-center gap-2">
        <i className="ri-microscope-line"></i> SPS-XΩ.Σ Proteomic Forge
      </h3>

      <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 space-y-3">
        {/* Lore Snippet */}
        <div className="p-2 bg-emerald-900/10 border border-emerald-800/30 rounded text-[10px] italic text-slate-400 leading-tight">
            "The SPS-XΩ.Σ does not repair life; it unbuilds the chaos of entropy via functional inversion."
        </div>

        {/* Components View */}
        <div className="grid grid-cols-2 gap-2">
            {SPS_LORE_DATA.components.map(comp => (
                <div key={comp.name} className="p-2 bg-slate-900 border border-slate-800 rounded">
                    <div className="text-[9px] font-bold text-emerald-400">{comp.name}</div>
                    <div className="text-[8px] text-slate-500 mb-1">{comp.role}</div>
                    <div className="text-[8px] text-slate-300 leading-snug">{comp.effect}</div>
                </div>
            ))}
        </div>

        {/* Phase Readout */}
        <div className="space-y-2 mt-2">
            {phases.map((phase, idx) => (
                <div 
                    key={phase.id} 
                    className={`p-2 rounded border transition-all duration-500 ${
                        currentPhaseIndex === idx ? 'bg-slate-800 border-emerald-500 shadow-lg scale-[1.02]' : 
                        currentPhaseIndex > idx ? 'bg-slate-900/50 border-emerald-900/50 opacity-50' : 
                        'bg-slate-900 border-slate-800 opacity-30'
                    }`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-bold font-cinzel ${phase.color}`}>{phase.name}</span>
                        {currentPhaseIndex === idx && <span className="animate-pulse text-[8px] font-mono text-emerald-400 uppercase">Resonating...</span>}
                        {currentPhaseIndex > idx && <i className="ri-checkbox-circle-line text-emerald-400"></i>}
                    </div>
                    <div className="text-[9px] text-slate-200 font-mono">{phase.label}</div>
                    {currentPhaseIndex === idx && <p className="text-[8px] text-slate-400 mt-1 italic">{phase.details}</p>}
                </div>
            ))}
        </div>

        {result && (
            <div className="p-3 bg-black/60 rounded border border-emerald-500/30 text-[10px] font-cormorant leading-relaxed italic text-emerald-100 animate-fade-in">
                <div className="text-[8px] font-mono text-emerald-500 uppercase font-bold mb-1 tracking-widest border-b border-emerald-900 pb-1">Final Observation Readout</div>
                {result}
                <div ref={logEndRef} />
            </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800">
        <Button 
            onClick={handleSimulate} 
            disabled={isLoading} 
            className={`w-full py-3 font-bold text-xs tracking-[0.2em] transition-all
                ${isLoading ? 'bg-slate-800 text-slate-500' : 'bg-emerald-700 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'}
            `}
        >
            {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin"></i> ANCHORING TOPOLOGY
                </span>
            ) : "INITIATE SURGICAL NECROLYSIS"}
        </Button>
        <p className="text-[8px] text-slate-600 text-center mt-2 font-mono uppercase">
            WARNING: Deployment is PERMANENT. Breach triggers Translation Cascade.
        </p>
      </div>
    </div>
  );
};

export default PeptideSimulationPanel;