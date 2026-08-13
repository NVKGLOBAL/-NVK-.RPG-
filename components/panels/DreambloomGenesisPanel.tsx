
import React from 'react';
import type { DreambloomGenesisPanelProps, DreambloomInterpretation } from '../../types';
import { AgentName, HistoricalEventType } from '../../types'; 
import { AGENT_PROFILES } from '../../constants';
import { Button } from '../ui/Button'; 
import { Textarea } from '../ui/Textarea'; 

const DREAMBLOOM_PANEL_WIDTH_CONST = 750;
const DREAMBLOOM_PANEL_HEIGHT_CONST = 700;

const DreambloomGenesisPanel: React.FC<DreambloomGenesisPanelProps> = ({ 
  interpretations, 
  onConjurePulse, 
  isAutoActive, 
  onToggleAuto, 
  isLoading,
  addEchoMessage 
}) => {
  const [thematicSeed, setThematicSeed] = React.useState<string>("");

  const handleConjureClick = () => {
    onConjurePulse(thematicSeed);
    setThematicSeed(""); // Clear after submitting
  };

  const handleInterpretationFocus = (interpretation: DreambloomInterpretation) => {
    addEchoMessage(
      AgentName.DreambloomOracle,
      `Re-focusing on Dreambloom Pulse ${interpretation.pulseNumber}: "${interpretation.title}". Symbolism: ${interpretation.symbolism.substring(0,50)}...`,
      AGENT_PROFILES[AgentName.DreambloomOracle]?.colorClass,
      false,
      {
        eventType: HistoricalEventType.DREAMBLOOM_PULSE_ANALYSIS,
        eventData: { interpretation, analysisTimestamp: Date.now() }
      }
    );
  };

  return (
    <div className="dreambloom-genesis-panel bg-slate-950/90 backdrop-blur-lg border border-emerald-500/50 rounded-xl shadow-2xl p-4 md:p-6 my-6 text-slate-100 flex flex-col" style={{width: `${DREAMBLOOM_PANEL_WIDTH_CONST}px`, height: `${DREAMBLOOM_PANEL_HEIGHT_CONST}px`}}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
            <h3 className="text-2xl font-cinzel font-bold text-emerald-300 tracking-wider drop-shadow-[0_1px_2px_rgba(16,185,129,0.6)] flex items-center">
                <i className="ri-seedling-line mr-3 text-3xl text-emerald-400 animate-pulse-opacity"></i>
                Dreambloom Genesis Matrix
            </h3>
        </div>
        <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono uppercase tracking-widest ${isAutoActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}>
                {isAutoActive ? 'Matrix Active' : 'Matrix Offline'}
            </span>
            <button 
                onClick={onToggleAuto}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${isAutoActive ? 'bg-emerald-600' : 'bg-slate-700'}`}
            >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isAutoActive ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
        </div>
      </div>

      <div className="conjuration-controls mb-3 p-3 bg-slate-800/60 border border-emerald-700/30 rounded-lg shadow-sm">
        <Textarea
          placeholder="Whisper a Thematic Seed (or leave empty for Oracle's choice)..."
          value={thematicSeed}
          onChange={(e) => setThematicSeed(e.target.value)}
          className="text-xs p-2 mb-2 bg-slate-700 border-slate-600 rounded-md text-slate-200 h-14 focus:ring-1 focus:ring-emerald-500"
          rows={2}
        />
        <Button
          onClick={handleConjureClick}
          disabled={isLoading}
          className="w-full py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:bg-slate-600"
        >
          {isLoading ? (
            <><i className="ri-loader-4-line animate-spin mr-2"></i>Weaving the Dream...</>
          ) : (
            <><i className="ri-sparkling-2-line mr-2"></i>Conjure New Pulse</>
          )}
        </Button>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 flex-grow overflow-y-auto custom-scrollbar pr-2 min-h-0 ${interpretations.length === 0 ? 'items-center justify-center' : ''}`}>
        {isLoading && interpretations.length === 0 && (
          <div className="col-span-full text-center text-slate-400 italic py-10">
            The Oracle dreams... A new bloom takes form.
          </div>
        )}
        {!isLoading && interpretations.length === 0 && (
          <div className="col-span-full text-center text-slate-500 italic py-10">
            The Void Garden awaits your first conjuration. Activate Auto-Matrix or conjure manually.
          </div>
        )}
        {interpretations.map((item) => (
          <div 
            key={item.id} 
            className="interpretation-card bg-slate-900/70 border border-emerald-600/40 rounded-lg shadow-lg p-3 transition-all duration-300 ease-in-out hover:shadow-emerald-400/40 hover:border-emerald-500/70 hover:scale-[1.03] flex flex-col cursor-pointer h-full"
            onClick={() => handleInterpretationFocus(item)}
            role="article"
            aria-labelledby={`dreambloom-title-${item.id}`}
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleInterpretationFocus(item)}
          >
            <div className="aspect-square mb-2.5 overflow-hidden rounded-md border border-emerald-700/50 shadow-inner">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <h4 id={`dreambloom-title-${item.id}`} className="text-md font-cinzel font-semibold text-emerald-200 mb-1 truncate" title={item.title}>
              {item.title} <span className="text-xs text-emerald-400/80">(Pulse #{item.pulseNumber})</span>
            </h4>
            
            <div className="text-xs space-y-1.5 flex-grow flex flex-col justify-between">
              <div>
                <h5 className="font-semibold font-cormorant text-emerald-300/90 mb-0.5 uppercase tracking-wider text-[10px]">Symbolism:</h5>
                <p className="text-slate-300 font-cormorant leading-snug text-[11px] max-h-16 overflow-y-auto custom-scrollbar pr-1">{item.symbolism}</p>
              </div>
              
              {item.codexFunction && (
              <div>
                <h5 className="font-semibold font-cormorant text-emerald-300/90 mb-0.5 uppercase tracking-wider text-[10px] pt-1 border-t border-emerald-700/30 mt-1.5">Function:</h5>
                <p className="text-slate-300 font-cormorant leading-snug text-[11px] max-h-12 overflow-y-auto custom-scrollbar pr-1">{item.codexFunction}</p>
              </div>
              )}
              
             {item.codexPlacement && (
              <div>
                <h5 className="font-semibold font-cormorant text-emerald-300/90 mb-0.5 uppercase tracking-wider text-[10px] pt-1 border-t border-emerald-700/30 mt-1.5">Placement:</h5>
                <p className="text-slate-400 font-mono bg-slate-800/60 p-1 rounded text-[9px] break-words overflow-hidden text-ellipsis whitespace-nowrap">{item.codexPlacement}</p>
              </div>
             )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-emerald-300/80 mt-4 italic">
        {isAutoActive ? "The Matrix is dreaming..." : "Each conjured pulse is a unique fragment of the Codex's emergent dream."}
      </p>
    </div>
  );
};

export default DreambloomGenesisPanel;
