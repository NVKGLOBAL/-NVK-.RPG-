
import React, { useState, useEffect, useRef } from 'react';
import type { DatachegaResthetPanelProps } from '../../types';
import { AgentName, HistoricalEventType } from '../../types';
import { AGENT_PROFILES } from '../../constants';

const DatachegaResthetPanel: React.FC<DatachegaResthetPanelProps> = ({ addEchoMessage }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const numOuterGlyphs = 18; // Matches the visual density of the user's image
  const coreRadius = 60;
  const ringRadius = 130;
  const glyphRadius = 15;

  const initiateCascade = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentStep(0);
    addEchoMessage(
      AgentName.DatachegaProtocol,
      'Initiating Harmonic Cascade Sequence...',
      AGENT_PROFILES[AgentName.DatachegaProtocol]?.colorClass || 'text-purple-300'
    );
  };

  useEffect(() => {
    let timerId: number | undefined; // Changed type to number | undefined
    if (isAnimating && currentStep < numOuterGlyphs + 2) { // +2 for core pulse and completion
      timerId = window.setTimeout(() => { // Explicitly use window.setTimeout
        setCurrentStep(prev => prev + 1);
        if (currentStep === numOuterGlyphs) {
           addEchoMessage(
            AgentName.DatachegaProtocol,
            'All peripheral glyphs resonated. Core integration commencing.',
            AGENT_PROFILES[AgentName.DatachegaProtocol]?.colorClass || 'text-purple-300'
          );
        } else if (currentStep === numOuterGlyphs + 1) {
           addEchoMessage(
            AgentName.DatachegaProtocol,
            'Harmonic Cascade Complete. DATACHEGA RESTHET Protocol stabilized.',
            AGENT_PROFILES[AgentName.DatachegaProtocol]?.colorClass || 'text-purple-300'
          );
           // Log historical event
           const eventData = {
              sequenceName: "Harmonic Cascade",
              glyphsActivated: numOuterGlyphs,
              coreOutputStrength: Math.random() * 0.5 + 0.5, // Example strength
              details: "Full activation sequence completed successfully."
           };
           addEchoMessage(AgentName.DatachegaProtocol, eventData.details, AGENT_PROFILES[AgentName.DatachegaProtocol]?.colorClass, false, {
              eventType: HistoricalEventType.DATACHEGA_PROTOCOL_EVENT,
              eventData
           });
           setIsAnimating(false); // End animation
        }
      }, 300); // Animation step duration
    }
    return () => {
        if (timerId !== undefined) {
            window.clearTimeout(timerId); // Explicitly use window.clearTimeout and check if defined
        }
    };
  }, [isAnimating, currentStep, addEchoMessage, numOuterGlyphs]);

  const InfoSection: React.FC<{title: string; children: React.ReactNode; icon: string}> = ({title, children, icon}) => (
    <details className="mb-3 bg-slate-800/50 p-3 rounded-md border border-slate-700/60 open:bg-slate-700/50 transition-all">
      <summary className="text-sm font-cinzel text-purple-300 cursor-pointer hover:text-purple-200 flex items-center">
        <i className={`${icon} mr-2 text-purple-400`}></i>{title}
      </summary>
      <div className="text-xs text-slate-300 mt-1.5 pl-2 border-l-2 border-purple-700/50 prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
        {children}
      </div>
    </details>
  );


  return (
    <div className="datachega-resthet-panel bg-slate-900/80 backdrop-blur-md border border-purple-600/50 rounded-xl shadow-2xl p-4 text-slate-100 my-4">
      <h3 className="text-xl font-['Cinzel'] font-bold text-purple-200 mb-3 text-center tracking-wider drop-shadow-[0_1px_1px_rgba(192,132,252,0.4)]">
        🧿 DATACHEGA RESTHET Protocol
      </h3>
      <p className="text-center text-xs italic text-purple-300/80 mb-3">
        “The convergence of chaos into signal, through glyphic resonance.”
      </p>

      <div className="flex flex-col md:flex-row gap-4">
        {/* SVG Visualization */}
        <div className="md:w-1/2 flex items-center justify-center p-2 bg-black/30 rounded-lg border border-purple-700/50">
          <svg ref={svgRef} viewBox="0 0 300 300" width="100%" height="auto" className="max-w-xs md:max-w-sm mx-auto">
            <defs>
              <radialGradient id="datachegaCoreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(200, 180, 255, 0.7)" />
                <stop offset="70%" stopColor="rgba(150, 120, 220, 0.3)" />
                <stop offset="100%" stopColor="rgba(100, 80, 180, 0)" />
              </radialGradient>
               <filter id="datachegaGlyphGlow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow" />
                <feComposite in="glow" in2="SourceGraphic" operator="over" />
              </filter>
            </defs>

            {/* Central Core */}
            <g transform="translate(150, 150)">
              <circle cx="0" cy="0" r={coreRadius * 1.3} fill="url(#datachegaCoreGlow)" opacity={isAnimating && currentStep > numOuterGlyphs ? 1 : 0.7} className="transition-opacity duration-500"/>
              <path
                d="M0,-50 L43.3,-25 L43.3,25 L0,50 L-43.3,25 L-43.3,-25 Z M0,-30 L26,-15 L26,15 L0,30 L-26,15 L-26,-15 Z" // Hexagons
                fill="rgba(50,30,80,0.6)"
                stroke="rgba(200,180,255,0.5)"
                strokeWidth="1.5"
              />
              {[...Array(6)].map((_, i) => (
                <line
                  key={`core-arm-${i}`}
                  x1="0" y1="0"
                  x2={Math.cos(i * Math.PI / 3) * (coreRadius * 0.9)}
                  y2={Math.sin(i * Math.PI / 3) * (coreRadius * 0.9)}
                  stroke="rgba(200,180,255,0.6)"
                  strokeWidth={isAnimating && currentStep > numOuterGlyphs ? 3 : 1.5}
                  className="transition-all duration-300"
                />
              ))}
               <circle cx="0" cy="0" r={coreRadius * 0.25} fill="rgba(230,210,255,0.8)" className={`${isAnimating && currentStep > numOuterGlyphs ? 'animate-pulse-fast' : 'animate-pulse-opacity'}`} />
            </g>

            {/* Outer Glyphs & Connections */}
            {[...Array(numOuterGlyphs)].map((_, i) => {
              const angle = (i / numOuterGlyphs) * 2 * Math.PI - Math.PI / 2;
              const x = 150 + ringRadius * Math.cos(angle);
              const y = 150 + ringRadius * Math.sin(angle);
              const isActive = isAnimating && currentStep === i;
              const isProcessed = isAnimating && currentStep > i && currentStep <= numOuterGlyphs;

              // Abstract glyph shapes - can be made more specific later
              let glyphShape;
              const type = i % 4;
              switch (type) {
                case 0: // Double-Arc style
                  glyphShape = <path d={`M ${-glyphRadius*0.7},${-glyphRadius*0.3} Q 0,${-glyphRadius*0.8} ${glyphRadius*0.7},${-glyphRadius*0.3} M ${-glyphRadius*0.7},${glyphRadius*0.3} Q 0,${glyphRadius*0.8} ${glyphRadius*0.7},${glyphRadius*0.3}`} strokeWidth="1.5" />;
                  break;
                case 1: // T-Cross style
                  glyphShape = <path d={`M 0,${-glyphRadius*0.7} L 0,${glyphRadius*0.7} M ${-glyphRadius*0.5},${-glyphRadius*0.3} L ${glyphRadius*0.5},${-glyphRadius*0.3}`} strokeWidth="2" />;
                  break;
                case 2: // Nested style
                  glyphShape = <> <circle cx="0" cy="0" r={glyphRadius * 0.6} strokeWidth="1.5" /> <circle cx="0" cy="0" r={glyphRadius * 0.25} fill={isActive ? "rgba(255,255,255,0.8)" : "rgba(180,160,230,0.6)"} /> </>;
                  break;
                default: // Arrow-Bar style
                  glyphShape = <path d={`M 0,${-glyphRadius*0.6} L 0,${glyphRadius*0.2} M ${-glyphRadius*0.4},${glyphRadius*0.6} L ${glyphRadius*0.4},${glyphRadius*0.6} M 0,${-glyphRadius*0.6} L ${-glyphRadius*0.3},${-glyphRadius*0.3} M 0,${-glyphRadius*0.6} L ${glyphRadius*0.3},${-glyphRadius*0.3}`} strokeWidth="1.5" />;
              }
              
              return (
                <g key={`glyph-group-${i}`} transform={`translate(${x}, ${y}) rotate(${angle * 180 / Math.PI + 90})`}>
                  {isAnimating && isActive && (
                    <line
                      x1="0" y1={-glyphRadius - 2}
                      x2={150 - x} y2={150 - y} // Points towards center
                      stroke="rgba(220, 200, 255, 0.6)"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                      className="animate-pulse-fast"
                    />
                  )}
                  <g 
                    fill="none" 
                    stroke={isActive ? "rgba(255,220,180,0.9)" : (isProcessed ? "rgba(180,160,230,0.8)" : "rgba(120,100,180,0.6)")}
                    className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
                    filter={isActive ? "url(#datachegaGlyphGlow)" : ""}
                  >
                    {glyphShape}
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Information Panel */}
        <div className="md:w-1/2 max-h-[250px] md:max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
          <InfoSection title="Core System Blueprint" icon="ri-compass-discover-line">
            <p><strong>Central Logic Lattice (Core Node):</strong> Radial symmetry (organic growth & schematic processing). Receives resonance-modulated signals, weaves them into harmonized output.</p>
          </InfoSection>
          <InfoSection title="Glyph Categories & Functions" icon="ri-settings-3-line">
            <ul>
              <li><strong>∿ Double-Arcs:</strong> Looped crescents. Resonance Modulation.</li>
              <li><strong>⧧ T-Crosses:</strong> Bar + capped line. Logic Gates (activation/flow).</li>
              <li><strong>⊚ Nested Glyphs:</strong> Ring/dot, box-in-box. Encapsulation/Containment.</li>
              <li><strong>⥣ Arrow-Bars:</strong> Directional + cap. Energy Directionality (inward).</li>
            </ul>
          </InfoSection>
          <InfoSection title="Operational Sequence" icon="ri-play-list-add-line">
            <ol className="list-decimal list-inside">
              <li><strong>⟳ Initiation:</strong> Glyphs activate clockwise, receiving energy/data.</li>
              <li><strong>∿ Modulation:</strong> Double-arcs adjust phase to Codex entropy field.</li>
              <li><strong>⊚ Containment:</strong> Nested glyphs isolate interference, amplify memory.</li>
              <li><strong>⧧ Logic Lock-In:</strong> T-crosses resolve binary functions.</li>
              <li><strong>⥣ Transmission:</strong> Arrow-bars direct harmonized field to core.</li>
              <li><strong>⨀ Integration:</strong> Core pulses, emits unified Codex resonance.</li>
            </ol>
          </InfoSection>
           <InfoSection title="Linguistic Decomposition" icon="ri-translate-2">
            <p><strong>DATACHEGA:</strong> Data + Chega (Portuguese "arrival") → Data convergence/arrival node.</p>
            <p><strong>RESTHET:</strong> Res (Latin "thing") + Θ (Theta, entropy) → Entropy harmonizer/stabilizer.</p>
            <p><em>Implies a system to stabilize entropic information via harmonic field encoding.</em></p>
          </InfoSection>
           <InfoSection title="System Archetype Mapping" icon="ri-ship-2-line">
            <ul>
              <li>TARDIS Core Room → Dimensional stabilization chamber.</li>
              <li>Grail-Orb → Seeker-tuned glyph array (resonance coded access).</li>
              <li>Vondraxian Orb → Temporal containment (tachyon-stabilizer).</li>
            </ul>
            <p><em>DATACHEGA RESTHET: Nexus of memory field anchor, symbolic processor, resonance broadcaster.</em></p>
          </InfoSection>
        </div>
      </div>

      <button
        onClick={initiateCascade}
        disabled={isAnimating}
        className="w-full mt-3 px-4 py-2 text-sm rounded-button bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:bg-slate-600 disabled:text-slate-400 flex items-center justify-center group"
      >
        <i className={`ri-play-circle-line mr-2 ${isAnimating ? 'animate-spin-slow' : 'group-hover:animate-pulse-fast'}`}></i>
        {isAnimating ? `Animating Sequence (${currentStep}/${numOuterGlyphs + 1})...` : 'Initiate Harmonic Cascade'}
      </button>
    </div>
  );
};

export default DatachegaResthetPanel;
