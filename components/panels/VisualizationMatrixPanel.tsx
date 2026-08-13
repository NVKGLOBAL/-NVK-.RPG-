
import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { AxiomPulseEngine } from '../../lib/tesseract/ResonantAxiomProjector';
import { TesseractRenderer } from '../../lib/tesseract/TesseractRenderer';
import { usePanelState } from '../../hooks/usePanelState';
import type { VisualizationMatrixPanelProps as ExternalProps, Particle } from '../../types';
import { VisualizationMatrixMode } from '../../types';
import ModeSelector from '../core/ModeSelector'; 

const TESSERACT_EDGES = [
  [0, 1], [0, 2], [0, 4], [0, 8], [1, 3], [1, 5], [1, 9], [2, 3], [2, 6], [2, 10],
  [3, 7], [3, 11], [4, 5], [4, 6], [4, 12], [5, 7], [5, 13], [6, 7], [6, 14],
  [7, 15], [8, 9], [8, 10], [8, 12], [9, 11], [9, 13], [10, 11], [10, 14],
  [11, 15], [12, 13], [12, 14], [13, 15], [14, 15]
];

interface CommonDrawParams {
  ctx: CanvasRenderingContext2D;
  projected3DVertices: number[][]; 
  colors: number[][]; 
  temporalFactor: number; 
  perspectiveScale: number;
  axiomField: { strength: number; warpType: string; };
  deltaPhase: number; 
  frameCount: number;
  width: number;
  height: number;
  effectiveEntropy: number; 
  timeDilation: number; 
  projectTo2D: (v3D: number[], perspectiveScale: number) => number[];
  particlesRef: React.MutableRefObject<Particle[]>;
  drawFractalBranch: (
    ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, length: number, depth: number, maxDepth: number, color: string
  ) => void;
  resonanceTuning: number; 
}

const VisualizationMatrixPanel: React.FC<ExternalProps> = ({
  width: propWidth = 600, 
  height: propHeight = 600
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  
  const { 
    currentMode, 
    resonanceTuning, 
    timeDilation, 
    effectiveEntropy, 
    panelStateSetters 
  } = usePanelState(); 
  const particlesRef = useRef<Particle[]>([]);

  const axiomPulser = useMemo(() => new AxiomPulseEngine(), []);
  const tesseractRenderer = useMemo(() => new TesseractRenderer(), []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width: w, height: h } = entries[0].contentRect;
      setDimensions({ w, h });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const canvasSize = useMemo(() => {
    if (dimensions.w > 0 && dimensions.h > 0) {
      return Math.min(dimensions.w, dimensions.h);
    }
    // Fallback if width/height props are numeric, else a default
    const numW = typeof propWidth === 'number' ? propWidth : 300;
    const numH = typeof propHeight === 'number' ? propHeight : 300;
    return Math.min(numW, numH);
  }, [dimensions, propWidth, propHeight]);

  useEffect(() => {
    axiomPulser.setResonanceLevel(resonanceTuning);
  }, [resonanceTuning, axiomPulser]);

  const handleModeChange = (newMode: VisualizationMatrixMode) => {
    panelStateSetters.setCurrentMode(newMode);
    particlesRef.current = []; 
  };
  
  const projectTo2D = useCallback((v3D: number[], currentPerspectiveScale: number) => {
    const z_offset = 3 + effectiveEntropy * 1.5; 
    const perspectiveDivisor = z_offset - v3D[2];
    const pFactor = perspectiveDivisor !== 0 ? currentPerspectiveScale / perspectiveDivisor : currentPerspectiveScale * 1000; 
    return [
      canvasSize / 2 + v3D[0] * pFactor,
      canvasSize / 2 + v3D[1] * pFactor
    ];
  }, [canvasSize, effectiveEntropy]);

  const drawFractalBranch = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number, y: number, angle: number, length: number, depth: number, maxDepth: number, color: string
  ) => {
    if (depth > maxDepth || length < (1 - effectiveEntropy * 0.8)) return;
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(endX) || !Number.isFinite(endY)) return;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(0.3, (maxDepth - depth + 1) * 0.3 * (1 - effectiveEntropy * 0.7 + Math.random() * effectiveEntropy * 0.4));
    ctx.stroke();

    const branches = 2 + Math.floor(effectiveEntropy * 3);
    const angleSpread = (Math.PI / (2.5 + depth - effectiveEntropy)) * (1 + effectiveEntropy * 0.8);
    for (let i = 0; i < branches; i++) {
        drawFractalBranch(ctx, endX, endY, angle + (i - (branches - 1) / 2) * angleSpread * (1 + (Math.random()-0.5)*effectiveEntropy*0.5), length * (0.6 - effectiveEntropy * 0.2), depth + 1, maxDepth, color);
    }
  }, [effectiveEntropy]);

  const drawSacredLattice = useCallback((params: CommonDrawParams) => {
    const { ctx, projected3DVertices, colors, perspectiveScale, axiomField, deltaPhase, effectiveEntropy, projectTo2D } = params;
    ctx.lineWidth = 0.5 + effectiveEntropy * 1.5 + Math.sin(deltaPhase*0.5) * effectiveEntropy * 0.5;
    TESSERACT_EDGES.forEach(([i1, i2]) => {
      const v1 = projected3DVertices[i1]; const v2 = projected3DVertices[i2];
      if (!v1 || !v2) return;
      const [x1, y1] = projectTo2D(v1, perspectiveScale); 
      const [x2, y2] = projectTo2D(v2, perspectiveScale);
      if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) return;
      const color = colors[i1];
      const alpha = Math.max(0.05, (color[3] !== undefined ? color[3] : 1) * (1 - effectiveEntropy * 0.8) * (0.4 + axiomField.strength * 0.6) * (0.4 + params.temporalFactor * 0.6));
      const hue = (200 + axiomField.strength * 60 + effectiveEntropy * 90) % 360;
      ctx.strokeStyle = `hsla(${hue}, 70%, ${60 + effectiveEntropy * 15}%, ${alpha})`;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    });
  }, [projectTo2D]); 

  const drawDimensionalBloom = useCallback((params: CommonDrawParams) => {
    const { ctx, projected3DVertices, colors, perspectiveScale, axiomField, deltaPhase, effectiveEntropy, projectTo2D } = params;
    projected3DVertices.forEach((v3D, i) => {
      const [px, py] = projectTo2D(v3D, perspectiveScale);
      if (!Number.isFinite(px) || !Number.isFinite(py)) return;
      const pulseSize = (3 + effectiveEntropy * 7 + Math.sin(deltaPhase * (2 + effectiveEntropy*2) + i * 0.5) * (2 + effectiveEntropy*4)) * (1 + axiomField.strength*0.5) ;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.1, pulseSize), 0, Math.PI * 2);
      const hue = (colors[i][0] * 120 + effectiveEntropy * 90) % 360; 
      ctx.fillStyle = `hsla(${hue}, ${80 + effectiveEntropy*10}%, ${65 + effectiveEntropy*10}%, ${0.4 + params.temporalFactor * 0.4 - effectiveEntropy*0.1})`;
      ctx.fill();
    });
  }, [projectTo2D]);

  const drawEntropyPulse = useCallback((params: CommonDrawParams) => {
    const { ctx, projected3DVertices, perspectiveScale, deltaPhase, effectiveEntropy, projectTo2D, frameCount } = params;
    ctx.lineWidth = 0.5 + effectiveEntropy * 6;
    TESSERACT_EDGES.forEach(([i1, i2]) => {
      const v1 = projected3DVertices[i1];
      const v2 = projected3DVertices[i2];
      if (!v1 || !v2) return;
      const jitterX1 = (Math.random() - 0.5) * effectiveEntropy * 15;
      const jitterY1 = (Math.random() - 0.5) * effectiveEntropy * 15;
      const jitterX2 = (Math.random() - 0.5) * effectiveEntropy * 15;
      const jitterY2 = (Math.random() - 0.5) * effectiveEntropy * 15;
      const [x1, y1] = projectTo2D(v1, perspectiveScale * (1 + Math.sin(deltaPhase + i1*0.2) * effectiveEntropy * 0.3));
      const [x2, y2] = projectTo2D(v2, perspectiveScale * (1 + Math.sin(deltaPhase + i2*0.2) * effectiveEntropy * 0.3));
      if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) return;
      const hue = (frameCount*2 + effectiveEntropy * 360 + Math.sin(deltaPhase + i1*0.5)*60) % 360;
      const alpha = Math.max(0.05, 0.9 - effectiveEntropy * 0.8 + Math.random()*effectiveEntropy*0.2);
      ctx.strokeStyle = `hsla(${hue}, 95%, ${60 + Math.random()*20}%, ${alpha})`;
      ctx.beginPath(); ctx.moveTo(x1 + jitterX1, y1 + jitterY1); ctx.lineTo(x2 + jitterX2, y2 + jitterY2); ctx.stroke();
    });
  }, [projectTo2D]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    let frameId: number;
    let frameCount = 0;
    
    const renderLoop = () => {
      frameCount++;
      const deltaPhase = frameCount * 0.01 * timeDilation * (1 + effectiveEntropy * 0.5); 
      const { vertices: projected3DVertices, colors, temporalFactor } = tesseractRenderer.render(deltaPhase);
      const axiomField = axiomPulser.getActiveAxiomField();

      ctx.fillStyle = 'rgb(15, 23, 42)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const currentPerspectiveScale = canvasSize * 0.45;

      const commonDrawParams: CommonDrawParams = {
        ctx, projected3DVertices, colors, temporalFactor, perspectiveScale: currentPerspectiveScale, axiomField, deltaPhase, frameCount,
        width: canvas.width, height: canvas.height, effectiveEntropy, timeDilation, projectTo2D, particlesRef, drawFractalBranch, resonanceTuning
      };

      if (currentMode === VisualizationMatrixMode.SacredLattice) drawSacredLattice(commonDrawParams);
      else if (currentMode === VisualizationMatrixMode.DimensionalBloom) drawDimensionalBloom(commonDrawParams);
      else if (currentMode === VisualizationMatrixMode.EntropyPulse) drawEntropyPulse(commonDrawParams);
      else drawSacredLattice(commonDrawParams);

      frameId = requestAnimationFrame(renderLoop);
    };

    frameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(frameId);
  }, [tesseractRenderer, axiomPulser, timeDilation, effectiveEntropy, currentMode, canvasSize, projectTo2D, drawFractalBranch, resonanceTuning, drawSacredLattice, drawDimensionalBloom, drawEntropyPulse]);

  return (
    <div ref={containerRef} className="visualization-matrix-panel bg-slate-950/90 backdrop-blur-md border border-indigo-600/50 rounded-xl shadow-2xl p-4 md:p-6 my-6 text-slate-100 flex flex-col">
       <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h2 className="text-xl md:text-2xl font-cinzel font-bold text-indigo-300 drop-shadow-[0_1px_1px_rgba(129,140,248,0.4)]">
          Visualization Matrix Δ
        </h2>
        <div className="w-full sm:w-auto">
          <ModeSelector<VisualizationMatrixMode> 
            currentMode={currentMode} 
            onSetMode={handleModeChange}
            availableModes={[VisualizationMatrixMode.SacredLattice, VisualizationMatrixMode.DimensionalBloom, VisualizationMatrixMode.EntropyPulse]} 
          />
        </div>
      </div>
      <div className="canvas-outer-wrapper mx-auto flex items-center justify-center bg-black border border-slate-700 rounded-md overflow-hidden" style={{ width: canvasSize, height: canvasSize }}>
        <canvas ref={canvasRef} className="block" />
      </div>
       <div className="mt-3 text-center text-xs text-slate-400 font-mono">
        Mode: {currentMode} | Entropy: {effectiveEntropy.toFixed(3)}δ | Resonance: {resonanceTuning.toFixed(2)} | Time: {timeDilation.toFixed(1)}x
      </div>
    </div>
  );
};

export default VisualizationMatrixPanel;
