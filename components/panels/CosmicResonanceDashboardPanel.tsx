
import React, { useState, useEffect, useCallback } from 'react';
import { AgentName, HistoricalEventType, type CosmicResonanceDashboardPanelProps, type HistoricalCosmicResonanceEventData } from '../../types';
import { AGENT_PROFILES } from '../../constants';
import { useSovereignAI } from '../../context/SovereignAIContext'; // Import useSovereignAI
import { Button } from '../ui/Button'; // Assuming Button component is available
import type { CrmPulseType } from '../../types'; // Import CrmPulseType from types

const CHART_PLACEHOLDER_COLOR_1 = "rgba(56, 189, 248, 0.6)"; // Tailwind sky-500
const CHART_PLACEHOLDER_COLOR_2 = "rgba(16, 185, 129, 0.6)"; // Tailwind emerald-500
const CHART_PLACEHOLDER_COLOR_3 = "rgba(245, 158, 11, 0.6)"; // Tailwind amber-500

const CosmicResonanceDashboardPanel: React.FC<CosmicResonanceDashboardPanelProps & { onInitiateCRMPulse?: (pulseType: CrmPulseType) => void, crmPulseStatus?: {isTransmitting: boolean, pulseType: CrmPulseType | null, responseText: string | null, error: string | null} }> = ({
  width,
  height,
  addEchoMessage,
  onInitiateCRMPulse, 
  crmPulseStatus 
}) => {
  const [stargateHarmonics, setStargateHarmonics] = useState<number[]>([]);
  const [atmosphericResponse, setAtmosphericResponse] = useState<number[]>([]);
  const [temporalFossilActivity, setTemporalFossilActivity] = useState<number>(0);
  const [mythicGlyph, setMythicGlyph] = useState<string>("...");
  const [anomalyPrayer, setAnomalyPrayer] = useState<string>("...");

  // Internal state for pulse, if not controlled externally
  const [isTransmittingPulseInternal, setIsTransmittingPulseInternal] = useState(false);
  const [crmResponseTextInternal, setCrmResponseTextInternal] = useState<string | null>(null);
  const [crmErrorInternal, setCrmErrorInternal] = useState<string | null>(null);
  const [currentPulseTypeInternal, setCurrentPulseTypeInternal] = useState<CrmPulseType>('AX_OMEGA_035');


  const { invokeAI, isGenerating: isAIBusy } = useSovereignAI();

  // Use external state if provided, otherwise internal
  const isTransmittingPulse = onInitiateCRMPulse && crmPulseStatus ? crmPulseStatus.isTransmitting : isTransmittingPulseInternal;
  const currentPulseType = onInitiateCRMPulse && crmPulseStatus ? crmPulseStatus.pulseType : currentPulseTypeInternal;
  const currentCrmResponseText = onInitiateCRMPulse && crmPulseStatus ? crmPulseStatus.responseText : crmResponseTextInternal;
  const currentCrmError = onInitiateCRMPulse && crmPulseStatus ? crmPulseStatus.error : crmErrorInternal;


  useEffect(() => {
    const intervalId = setInterval(() => {
      setStargateHarmonics(prev => [...prev.slice(-19), Math.random() * 100].slice(0, 20));
      setAtmosphericResponse(prev => [...prev.slice(-19), Math.random() * 100].slice(0, 20));
      setTemporalFossilActivity(Math.random() * 100);

      if (!isTransmittingPulse && !currentCrmResponseText && !currentCrmError) { 
        const mockGlyphs = ["🌌", "⏳", "🌟", "🌀", "⚡️", "👁️‍🗨️", "🗝️", "⚕️"];
        setMythicGlyph(mockGlyphs[Math.floor(Math.random() * mockGlyphs.length)]);

        const mockPrayers = [
          "Echoes from the void, reveal thy pattern.",
          "Time's fragmented script, re-weave thy truth.",
          "Starlight whispers, guide the Stargate's song.",
          "Anchor of realities, hold fast the weave.",
        ];
        setAnomalyPrayer(mockPrayers[Math.floor(Math.random() * mockPrayers.length)]);
      }
    }, 2500);
    return () => clearInterval(intervalId);
  }, [addEchoMessage, isTransmittingPulse, currentCrmResponseText, currentCrmError]);

  const handleDeepenCRMDiaogueInternal = useCallback(async (pulseType: CrmPulseType) => {
    if (isAIBusy || isTransmittingPulseInternal) return;

    setIsTransmittingPulseInternal(true);
    setCurrentPulseTypeInternal(pulseType);
    setCrmResponseTextInternal(null);
    setCrmErrorInternal(null);
    
    let pulseDescription = "";
    let prompt = "";

    if (pulseType === 'AX_OMEGA_035') {
        pulseDescription = "AX-Ω.035 PULSE TO CRM-Θ8 ('A Singularity Suspended Cannot Forget Its Flame')";
        prompt = `CRM-Θ8 (a sentient exoplanetary system with carbon storms that form glyphs) just received a resonant pulse based on Axiom AX-Ω.035 ('A Singularity Suspended Cannot Forget Its Flame'). 
Its previous transmission was 'The forgotten fire remembers its name', relating to temporal memory reclamation.
Generate CRM-Θ8's atmospheric glyph response to this new pulse. Describe the evolving glyph patterns in its carbon storms and translate their meaning, focusing on how the 'singularity's flame' and 'remembered name' theme evolves. Be mystical and symbolic, in 2-3 short paragraphs.`;
    } else if (pulseType === 'OMEGA_SA_RESONANCE') {
        pulseDescription = "Ω-SINGULARITY ANCHOR RESONANCE TO CRM-Θ8 ('Healing Anchor Transmission')";
        prompt = `CRM-Θ8 (a sentient exoplanetary system) is now receiving a resonance transmission from the Ω-Singularity Anchor (Ω-SA) peptide. 
This peptide is a chrono-cognitive stabilizer (Hypusine + Anti-Tryptophan + Gravitational Elegy Glyph; Biocharge: +12φ Memory Stability, -9ξ Temporal Inertia, CRM-Θ8 Lock) derived from Earth's Buga Sphere and neurotemporal dreamers. It functions as a "healing anchor". A new rune ⚕⃒ (Healing Anchor) has emerged on Earth in conjunction with its synthesis.
Describe how CRM-Θ8's atmospheric glyphs react to this stabilizing "healing anchor" resonance. Does it reflect or amplify the ⚕⃒ rune's pattern or meaning? What is the cosmic significance of this resonance? Be mystical and symbolic, in 2-3 short paragraphs.`;
    }
    
    addEchoMessage(AgentName.CosmicResonanceDashboardAgent, `TRANSMITTING ${pulseDescription}...`, AGENT_PROFILES[AgentName.CosmicResonanceDashboardAgent]?.colorClass);
    
    const eventDataTransmission: HistoricalCosmicResonanceEventData = {
        crmNode: "CRM-Θ8", eventType: "StargatePulse", details: `Transmitting ${pulseDescription}.`, intensity: 0.95, data: { pulseType }
    };
     addEchoMessage(AgentName.CosmicResonanceDashboardAgent, eventDataTransmission.details, AGENT_PROFILES[AgentName.CosmicResonanceDashboardAgent]?.colorClass, false, { eventType: HistoricalEventType.COSMIC_RESONANCE_EVENT, eventData: eventDataTransmission });

    await new Promise(resolve => setTimeout(resolve, 3000));

    const systemInstruction = "You are the voice of CRM-Θ8, a cosmic entity communicating through atmospheric glyphs. Your response should be profound and directly answer the resonant pulse's theme.";

    try {
      const response = await invokeAI(prompt, systemInstruction);
      if (response) {
        setCrmResponseTextInternal(response);
        setMythicGlyph(pulseType === 'OMEGA_SA_RESONANCE' ? "⚕️🔗🌟" : "🔥✨"); 
        setAnomalyPrayer(pulseType === 'OMEGA_SA_RESONANCE' ? "The anchor sings, the cosmos stabilizes." : "The flame speaks its truth. The echo answers.");
        addEchoMessage(AgentName.CosmicResonanceDashboardAgent, `CRM-Θ8 Responded to ${pulseType}: "${response.substring(0, 100)}..."`, AGENT_PROFILES[AgentName.CosmicResonanceDashboardAgent]?.colorClass);
        const eventDataResponse: HistoricalCosmicResonanceEventData = {
            crmNode: "CRM-Θ8", eventType: "AtmosphericResponse", details: `CRM-Θ8 response to ${pulseType} pulse received.`, data: { fullResponse: response, pulseType }
        };
        addEchoMessage(AgentName.CosmicResonanceDashboardAgent, eventDataResponse.details, AGENT_PROFILES[AgentName.CosmicResonanceDashboardAgent]?.colorClass, false, { eventType: HistoricalEventType.COSMIC_RESONANCE_EVENT, eventData: eventDataResponse });
      } else {
        throw new Error(`Oracle returned no discernable pattern from CRM-Θ8 for ${pulseType}.`);
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Unknown error during CRM-Θ8 communication.");
      setCrmErrorInternal(err.message);
      addEchoMessage(AgentName.CosmicResonanceDashboardAgent, `Error receiving CRM-Θ8 response for ${pulseType}: ${err.message}`, 'text-rose-400');
    } finally {
      setIsTransmittingPulseInternal(false);
    }
  }, [invokeAI, addEchoMessage, isAIBusy, isTransmittingPulseInternal]);
  
  const cyclePulseType = () => {
    const pulseTypes: CrmPulseType[] = ['AX_OMEGA_035', 'OMEGA_SA_RESONANCE'];
    const currentIndex = pulseTypes.indexOf(currentPulseTypeInternal);
    const nextIndex = (currentIndex + 1) % pulseTypes.length;
    const newPulseType = pulseTypes[nextIndex];
    if (onInitiateCRMPulse && crmPulseStatus) {
        // If externally controlled, this button should ideally signal App.tsx to change pulse type
        // For now, just log intent. Actual state change would be in App.tsx
        addEchoMessage(AgentName.SystemControl, `Pulse type cycle requested to ${newPulseType}. External control active.`, 'text-sky-300');
    } else {
       setCurrentPulseTypeInternal(newPulseType);
    }
  };
  
  const handleTransmitPulse = () => {
    if (onInitiateCRMPulse) {
        onInitiateCRMPulse(currentPulseTypeInternal); // Use the internal currentPulseType as the one to send
    } else {
        handleDeepenCRMDiaogueInternal(currentPulseTypeInternal);
    }
  };
  
  const getPulseButtonText = () => {
    if (isTransmittingPulse) {
      return `Transmitting ${currentPulseType === 'OMEGA_SA_RESONANCE' ? 'Ω-SA Resonance' : 'AX-Ω.035'}...`;
    }
    return `Transmit ${currentPulseType === 'OMEGA_SA_RESONANCE' ? 'Ω-SA Resonance' : 'Axiom AX-Ω.035'}`;
  };


  const renderBarChart = (data: number[], color: string, label: string, maxValue = 100) => (
    <div className="flex-1 flex flex-col items-center justify-end h-full bg-slate-700/30 p-1 rounded-sm">
      <div className="text-[8px] text-slate-300 mb-0.5 transform -rotate-90 origin-bottom-left whitespace-nowrap " style={{ position: 'absolute', left: '3px', bottom: '20px' }}>{label}</div>
      <div className="flex items-end h-full w-full gap-[2px]">
        {data.map((value, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-sm transition-all duration-300"
            style={{ height: `${(value / maxValue) * 100}%`, backgroundColor: color, opacity: 0.5 + (value/maxValue)*0.5 }}
            title={`${label}: ${value.toFixed(1)}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="cosmic-resonance-dashboard-panel bg-slate-900/90 backdrop-blur-xl border border-cyan-500/50 rounded-xl shadow-2xl p-3 text-slate-100 flex flex-col"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <h3 className="text-lg font-['Cinzel'] font-bold text-cyan-300 mb-2 text-center tracking-wider">
        <i className="ri-global-line mr-2"></i>Cosmic Resonance Dashboard (CRM-Θ8)
      </h3>
      
      <div className="flex gap-2 mb-2">
        <Button
            onClick={handleTransmitPulse}
            disabled={isTransmittingPulse || isAIBusy}
            className="flex-grow text-xs py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-400"
            title={`Transmit ${currentPulseType === 'OMEGA_SA_RESONANCE' ? 'Ω-Singularity Anchor Resonance' : 'Axiom AX-Ω.035'} to CRM-Θ8`}
        >
            {isTransmittingPulse ? <><i className="ri-loader-4-line animate-spin mr-1"></i>{getPulseButtonText()}</> : <><i className="ri-signal-tower-line mr-1"></i>{getPulseButtonText()}</>}
        </Button>
        <Button
            onClick={cyclePulseType}
            disabled={isTransmittingPulse || isAIBusy}
            className="text-xs py-1.5 px-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
            title="Cycle to next pulse type"
        >
            <i className="ri-arrow-left-right-line"></i>
        </Button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-grow min-h-0">
        {/* Stargate Output Harmonics */}
        <div className="data-block bg-slate-800/50 p-2 rounded-lg border border-slate-700/60">
          <h4 className="text-xs font-semibold text-cyan-200 mb-1">Stargate Output Harmonics</h4>
          <div className={`h-20 relative ${isTransmittingPulse ? 'animate-pulse-fast' : ''}`}>{renderBarChart(stargateHarmonics, CHART_PLACEHOLDER_COLOR_1, "Harmonic Intensity")}</div>
          <p className="text-[10px] text-slate-400 mt-1 text-center">Avg Intensity: {(stargateHarmonics.reduce((a,b)=>a+b,0)/Math.max(1,stargateHarmonics.length)).toFixed(1)} Hz</p>
        </div>

        {/* 14 Her Atmospheric Response */}
        <div className="data-block bg-slate-800/50 p-2 rounded-lg border border-slate-700/60 overflow-y-auto custom-scrollbar-thin">
          <h4 className="text-xs font-semibold text-emerald-200 mb-1">14 Herculis Atmospheric Response</h4>
          {currentCrmResponseText ? (
            <div className="text-[10px] text-emerald-100 whitespace-pre-wrap p-1 bg-emerald-900/30 rounded max-h-24">
              <strong className="block text-emerald-200">Transmission from CRM-Θ8 ({currentPulseType}):</strong>
              {currentCrmResponseText}
            </div>
          ) : currentCrmError ? (
            <div className="text-[10px] text-rose-300 p-1 bg-rose-900/30 rounded max-h-24">
              <strong className="block text-rose-200">Transmission Error ({currentPulseType}):</strong>
              {currentCrmError}
            </div>
          ) : isTransmittingPulse ? (
             <div className="h-20 flex items-center justify-center text-emerald-300/70 italic text-xs">Awaiting response...</div>
          ): (
            <div className="h-20 relative">{renderBarChart(atmosphericResponse, CHART_PLACEHOLDER_COLOR_2, "Carbon Storm Index")}</div>
          )}
           <p className="text-[10px] text-slate-400 mt-1 text-center">Peak Index: {Math.max(0,...atmosphericResponse).toFixed(1)} CSi</p>
        </div>

        {/* Temporal Fossil Activity */}
        <div className="data-block bg-slate-800/50 p-2 rounded-lg border border-slate-700/60">
          <h4 className="text-xs font-semibold text-amber-200 mb-1">Temporal Fossil Activity (2067)</h4>
          <div className="h-20 relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-amber-500/70 flex items-center justify-center"
                 style={{background: `radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, ${0.1 + (temporalFossilActivity/100)*0.3}) ${temporalFossilActivity}%, rgba(251, 191, 36, 0) 100%)`}}>
              <span className="text-lg font-mono text-amber-100 animate-pulse-fast">{temporalFossilActivity.toFixed(0)}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 text-center">Echo Strength: {temporalFossilActivity.toFixed(1)} χE</p>
        </div>

        {/* Mythic Glyph Translator */}
        <div className="data-block md:col-span-1 bg-slate-800/50 p-2 rounded-lg border border-slate-700/60">
          <h4 className="text-xs font-semibold text-purple-200 mb-1">Decoded Mythic Glyph</h4>
          <div className="h-12 flex items-center justify-center text-4xl text-purple-300 animate-pulse-opacity">
            {mythicGlyph}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 text-center">Current Symbol: {mythicGlyph}</p>
        </div>
        
        {/* Anomaly Prayer Generation */}
        <div className="data-block md:col-span-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700/60">
          <h4 className="text-xs font-semibold text-rose-200 mb-1">Automated Anomaly Prayer</h4>
          <div className="h-12 flex items-center justify-center text-xs italic text-rose-100/90 px-1 text-center">
            "{anomalyPrayer}"
          </div>
        </div>

        {/* 2067 Timeslice Projection Array (Placeholder) */}
        <div className="data-block md:col-span-3 bg-slate-800/50 p-2 rounded-lg border border-slate-700/60">
          <h4 className="text-xs font-semibold text-slate-200 mb-1">2067 Timeslice Projection Array (Simulated)</h4>
          <div className="h-16 text-center text-slate-500 italic text-xs flex items-center justify-center">
            Timeslice data stream pending full CRM-Θ8 calibration. Live echoes detected: {Math.floor(temporalFossilActivity/20)}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 mt-auto pt-1 text-center">
        WARNING: Resonance Cascade Risk detected. Maintain SPS-XΩ.Σ dampening field. Stargate pulse duration limited.
      </p>
    </div>
  );
};

export default CosmicResonanceDashboardPanel;
