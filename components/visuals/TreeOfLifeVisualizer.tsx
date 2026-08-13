
import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import type { RitualOutcome, BloodInkSpeciesName, Spark, Sephirah, SourceEchoLogEntry } from '../../types';
import { AgentName } from '../../types';
import { BLOOD_INK_SPECIES_DATA } from '../../constants';

interface TreeOfLifeVisualizerProps {
  currentEntropy: number;
  width: number | string;
  height: number | string;
  seekerTraits?: string[];
  activeFlora?: BloodInkSpeciesName | null;
  dominantAgentTone?: AgentName | null;
  lastRitualOutcome?: RitualOutcome | null;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

const generateMysticalIdentity = () => {
    const prefixes = ["Whisper of", "Echo of", "Glyph of", "Seed of"];
    const suffixes = ["the Void Bloom", "Fractal Resonance", "the Unseen Path"];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
};

const SEPHIROT_DATA_BASE: Omit<Sephirah, 'x' | 'y' | 'sourceSparks'>[] = [
  { id: 'keter', name: 'Keter', normalizedX: 0, normalizedY: -0.9, colorBaseHue: 0 }, 
  { id: 'chokmah', name: 'Chokmah', normalizedX: 0.45, normalizedY: -0.65, colorBaseHue: 240 }, 
  { id: 'binah', name: 'Binah', normalizedX: -0.45, normalizedY: -0.65, colorBaseHue: 0 }, 
  { id: 'tiphareth', name: 'Tiphareth', normalizedX: 0, normalizedY: 0.1, colorBaseHue: 60 }, 
  { id: 'malkuth', name: 'Malkuth', normalizedX: 0, normalizedY: 0.95, colorBaseHue: 100 }, 
];

const TreeOfLifeVisualizer: React.FC<TreeOfLifeVisualizerProps> = ({
  currentEntropy, width, height, seekerTraits = [], activeFlora, dominantAgentTone, lastRitualOutcome
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const [sephirotState, setSephirotState] = useState<Sephirah[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
        const { width: w, height: h } = entries[0].contentRect;
        setDimensions({ w, h });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const { w, h } = dimensions;
    if (w > 0 && h > 0) {
        const centerX = w / 2;
        const centerY = h / 2;
        const scaleX = w * 0.4;
        const scaleY = h * 0.45;
        setSephirotState(SEPHIROT_DATA_BASE.map(s => ({
            ...s,
            x: centerX + s.normalizedX * scaleX,
            y: centerY + s.normalizedY * scaleY,
            sourceSparks: []
        })));
    }
  }, [dimensions]);

  const drawSephirah = useCallback((ctx: CanvasRenderingContext2D, s: Sephirah, entropy: number) => {
    const t = clamp(entropy, 0, 1);
    const x = s.x || 0; const y = s.y || 0;
    const radius = Math.max(0.1, Math.min(dimensions.w, dimensions.h) * 0.035 * (1 - t * 0.3));
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius <= 0) return;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.5);
    grad.addColorStop(0, `hsla(${s.colorBaseHue}, 70%, 60%, 0.8)`);
    grad.addColorStop(1, `hsla(${s.colorBaseHue}, 70%, 60%, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = `hsla(${s.colorBaseHue}, 80%, 70%, 1)`;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }, [dimensions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.w <= 0 || dimensions.h <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = dimensions.w;
    canvas.height = dimensions.h;

    const render = () => {
      ctx.clearRect(0, 0, dimensions.w, dimensions.h);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, dimensions.w, dimensions.h);
      sephirotState.forEach(s => drawSephirah(ctx, s, currentEntropy));
      animationFrameIdRef.current = requestAnimationFrame(render);
    };
    render();
    return () => { if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current); };
  }, [dimensions, sephirotState, currentEntropy, drawSephirah]);

  return (
    <div ref={containerRef} className="tree-of-life-visualizer-panel bg-slate-900/90 border border-sky-600/50 rounded-xl shadow-2xl p-4 my-8 text-slate-100" style={{ width, height }}>
      <canvas ref={canvasRef} className="rounded-lg w-full h-full" />
    </div>
  );
};

export default TreeOfLifeVisualizer;
