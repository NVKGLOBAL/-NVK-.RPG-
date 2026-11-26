
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { CodexDreamPanelProps, EchoMessage, Axiom, HistoricalCodexDreamSeedEventData, CodexArtifact } from '../../types';
import { ArtMode, AgentName, HistoricalEventType, ArtifactType, ArtifactRarity } from '../../types';
import { AGENT_PROFILES } from '../../constants';
import ModeSelectorAny from '../core/ModeSelectorAny';
import { Button } from '../ui/Button'; 

const ART_MODES = Object.values(ArtMode);

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

const CodexDreamPanel: React.FC<CodexDreamPanelProps> = ({
  currentEntropy,
  currentAxioms,
  lambdaValue,
  negentropyLevel,
  echoLog,
  addEchoMessage,
  width, 
  height, 
  onArtifactCreated,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [artMode, setArtMode] = useState<ArtMode>(ArtMode.DreambloomPulse);
  const [seekerInput, setSeekerInput] = useState<string>("");
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
        if (!entries[0]) return;
        const { width: w, height: h } = entries[0].contentRect;
        // Compensate for UI elements around the canvas
        setDimensions({ w, h: Math.max(200, h - 220) }); 
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const drawArt = useCallback((ctx: CanvasRenderingContext2D, frameCount: number) => {
    const { w, h } = dimensions;
    if (w <= 0 || h <= 0 || !Number.isFinite(w) || !Number.isFinite(h)) return;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = `rgb(10, 15, 25)`;
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const t_negentropy = clamp(negentropyLevel, 0, 1);

    if (artMode === ArtMode.DreambloomPulse) {
        for (let i = 0; i < 10; i++) {
          const x = centerX + Math.sin(frameCount * 0.01 + i) * (w * 0.3);
          const y = centerY + Math.cos(frameCount * 0.01 + i) * (h * 0.3);
          const radius = (10 + Math.sin(frameCount * 0.02 + i) * 5) * t_negentropy;
          if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius <= 0) continue;
          ctx.fillStyle = `hsla(${(frameCount + i*30)%360}, 70%, 60%, 0.5)`;
          ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
        }
    } else {
        ctx.fillStyle = 'white';
        ctx.font = '12px serif';
        ctx.textAlign = 'center';
        if (Number.isFinite(centerX) && Number.isFinite(centerY)) {
          ctx.fillText(`Abstract ${artMode} visualization.`, centerX, centerY);
        }
    }
  }, [dimensions, artMode, negentropyLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const { w, h } = dimensions;
    if (!canvas || w <= 0 || h <= 0 || !Number.isFinite(w) || !Number.isFinite(h)) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = w;
    canvas.height = h;

    let frameId: number;
    let frameCount = 0;
    const renderLoop = () => {
      frameCount++;
      drawArt(ctx, frameCount);
      frameId = requestAnimationFrame(renderLoop);
    };
    frameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(frameId);
  }, [drawArt, dimensions]);

  const panelWidth = typeof width === 'number' ? `${width}px` : width;
  const panelHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div ref={containerRef} className="codex-dream-panel bg-slate-950/90 backdrop-blur-md border border-purple-600/50 rounded-xl shadow-2xl p-4 text-slate-100 flex flex-col relative z-20" style={{ width: panelWidth, height: panelHeight }}>
      <h3 className="text-lg font-cinzel font-bold text-purple-300 mb-2 text-center">✦ Codex Dream Panel ✦</h3>
      <ModeSelectorAny currentMode={artMode} onSetMode={setArtMode} availableModes={ART_MODES} />
      <div className="flex-grow rounded-md border border-slate-700/70 bg-black mb-1 overflow-hidden relative">
          <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
      <div className="flex gap-1 my-1">
        <input type="text" value={seekerInput} onChange={(e) => setSeekerInput(e.target.value)} placeholder="Whisper a seed..." className="flex-grow p-1.5 text-[10px] bg-slate-700 border-slate-600 rounded-md text-white" />
        <Button onClick={() => setSeekerInput("")} className="px-3 py-1.5 text-[10px] bg-purple-600">Clear</Button>
      </div>
      <Button onClick={() => {}} className="w-full text-xs py-2 bg-cyan-600">CAPTURE DREAMPRINT</Button>
    </div>
  );
};

export default CodexDreamPanel;
