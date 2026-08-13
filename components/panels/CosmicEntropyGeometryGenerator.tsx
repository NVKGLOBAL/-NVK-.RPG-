
import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { GeoMode, VisualizationMatrixMode, type CosmicEntropyGeometryGeneratorProps as ExternalProps, type Particle, type PanelDisplayMode } from '../../types'; 
import ModeSelector from '../core/ModeSelector'; 

interface CosmicEntropyGeometryGeneratorProps extends ExternalProps {}

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

const CosmicEntropyGeometryGenerator: React.FC<CosmicEntropyGeometryGeneratorProps> = ({ 
  currentEntropy, currentPhase, chaliceStatus, width: propWidth, height: propHeight, currentGeoMode, onSetGeoMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
        const { width: w, height: h } = entries[0].contentRect;
        setDimensions({ w, h: h - 120 });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, entropy: number, w: number, h: number) => {
    const t = clamp(entropy, 0, 1);
    const cx = w / 2; const cy = h / 2; const r = Math.max(w, h) / 1.5;
    if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(r) || r <= 0) {
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,w,h); return;
    }
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, `hsla(220, 50%, ${10 - t*5}%, 1)`);
    grad.addColorStop(1, `hsla(260, 60%, 5%, 1)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.w <= 0 || dimensions.h <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = dimensions.w;
    canvas.height = dimensions.h;

    const render = () => {
      ctx.clearRect(0, 0, dimensions.w, dimensions.h);
      drawBackground(ctx, currentEntropy, dimensions.w, dimensions.h);
      
      const cx = dimensions.w / 2; const cy = dimensions.h / 2;
      const r = Math.min(dimensions.w, dimensions.h) * 0.2;
      if (Number.isFinite(cx) && Number.isFinite(cy) && Number.isFinite(r) && r > 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };
    render();
    return () => { if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current); };
  }, [dimensions, currentEntropy, drawBackground]);

  return (
    <div ref={containerRef} className="bg-slate-900/90 backdrop-blur-md border border-blue-500/30 rounded-xl shadow-2xl p-6 my-8 text-slate-100 flex flex-col" style={{ width: propWidth, height: propHeight }}>
      <h2 className="text-2xl font-cinzel font-bold mb-4 text-center text-blue-200">Cosmic Geometry Generator</h2>
      <ModeSelector<GeoMode> currentMode={currentGeoMode} onSetMode={onSetGeoMode} availableModes={Object.values(GeoMode)} />
      <canvas ref={canvasRef} className="rounded-lg border border-slate-700/30 flex-grow" />
    </div>
  );
};

export default CosmicEntropyGeometryGenerator;
