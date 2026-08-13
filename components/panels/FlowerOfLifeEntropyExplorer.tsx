
import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import type { PanelDisplayMode, Particle } from '../../types';
import { GeoMode, VisualizationMatrixMode } from '../../types';
import ModeSelectorAny from '../core/ModeSelectorAny';

interface FlowerOfLifeEntropyExplorerProps {
  currentEntropy: number;
  width: number | string;
  height: number | string;
  currentDisplayMode: PanelDisplayMode;
  onSetDisplayMode: (mode: PanelDisplayMode) => void;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

const getFruitOfLifePoints = (centerX: number, centerY: number, R_distance: number): { x: number; y: number; id: string, baseHue: number }[] => {
    const points: { x: number; y: number; id: string, baseHue: number }[] = [];
    points.push({ x: centerX, y: centerY, id: 'center_0', baseHue: 0 }); 
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        points.push({
            x: centerX + R_distance * Math.cos(angle),
            y: centerY + R_distance * Math.sin(angle),
            id: `inner_${i}`,
            baseHue: (60 + i * 50) % 360
        });
    }
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        points.push({
            x: centerX + 2 * R_distance * Math.cos(angle),
            y: centerY + 2 * R_distance * Math.sin(angle),
            id: `outer_${i}`,
            baseHue: (90 + i * 50) % 360
        });
    }
    return points.slice(0,13);
};

const FLOWER_PATHS_BY_INDEX: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1],
  [1, 7], [2, 8], [3, 9], [4, 10], [5, 11], [6, 12],
  [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 7],
];

const FlowerOfLifeEntropyExplorer: React.FC<FlowerOfLifeEntropyExplorerProps> = ({
  currentEntropy,
  width,
  height,
  currentDisplayMode,
  onSetDisplayMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, entropy: number, mode: PanelDisplayMode, w: number, h: number) => {
    const t = clamp(entropy, 0, 1);
    let baseHue: number;
    let lightnessStart: number;
    let lightnessEnd: number;

    switch (mode) {
        case GeoMode.NullShell:
        case VisualizationMatrixMode.VoidEcho:
            baseHue = lerp(240, 220, t); lightnessStart = lerp(3, 1, t); lightnessEnd = lerp(8, 3, t); break;
        case GeoMode.CrystalLogic:
            baseHue = lerp(180, 220, t); lightnessStart = lerp(10, 5, t); lightnessEnd = lerp(20, 10, t); break;
        case GeoMode.AethericWeave:
        case VisualizationMatrixMode.AethericFlow:
        case VisualizationMatrixMode.TemporalWeave:
            baseHue = lerp(200, 170, t); lightnessStart = lerp(8, 4, t); lightnessEnd = lerp(18, 8, t); break;
        case GeoMode.Recursive:
        case VisualizationMatrixMode.FractalCascade:
        case GeoMode.BioFractalPulse:
            baseHue = lerp(120, 90 - t * 60, t); lightnessStart = lerp(10, 3, t); lightnessEnd = lerp(18, 7, t); break;
        case GeoMode.OracleWhisper:
             baseHue = lerp(270, 250, t); lightnessStart = lerp(5, 2, t); lightnessEnd = lerp(12, 5, t); break;
        case GeoMode.ShieldedChaos:
             baseHue = lerp(0, 330, t); lightnessStart = lerp(8, 3, t); lightnessEnd = lerp(15, 5, t); break;
        case VisualizationMatrixMode.AshfallCycle:
            baseHue = lerp(210, 190, t); lightnessStart = lerp(15, 8, t); lightnessEnd = lerp(5, 2, t); break; 
        default:
            baseHue = lerp(220, 300, t); lightnessStart = lerp(10, 5, t); lightnessEnd = lerp(20, 10, t); break;
    }

    const cx = w / 2;
    const cy = h / 2;
    const r = Math.max(w, h) / 1.5;

    if (Number.isFinite(cx) && Number.isFinite(cy) && Number.isFinite(r) && r > 0) {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `hsla(${baseHue}, 50%, ${lightnessStart}%, 1)`);
      grad.addColorStop(1, `hsla(${(baseHue + 40) % 360}, 60%, ${lightnessEnd}%, 1)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = `hsla(${baseHue}, 50%, ${lightnessStart}%, 1)`;
      ctx.fillRect(0, 0, w, h);
    }
  }, []);
  
  const updateAndDrawParticles = useCallback((ctx: CanvasRenderingContext2D, entropy: number, mode: PanelDisplayMode, frameCount: number, w: number, h: number) => {
    const t = clamp(entropy, 0, 1);
    if (mode === GeoMode.OracleWhisper && Math.random() < 0.3 + t * 0.5) {
        particlesRef.current.push({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * (0.1 + t * 0.2), vy: (Math.random() - 0.5) * (0.1 + t * 0.2),
            life: 50 + Math.random() * 100, color: `hsla(${(270 + Math.random()*60)%360}, 80%, 80%, ${0.05 + Math.random()*0.15})`,
            type: 'whisper', size: 0.5 + Math.random() * (1 + t), history: []
        });
    }

    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    particlesRef.current.forEach(p => {
        p.life--;
        p.x += p.vx; p.y += p.vy;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    });
  }, []);

  const drawFlowerCircles = useCallback((
    points: { x: number; y: number }[],
    R_circle: number,
    entropy: number,
    pulse: boolean,
    frameCount: number,
    ctx: CanvasRenderingContext2D,
    opacityFactor: number = 1
  ) => {
    const t = clamp(entropy, 0, 1);
    points.forEach((point, idx) => {
      ctx.beginPath();
      const pulseVal = pulse ? (0.8 + Math.sin(frameCount * 0.05 * (1 + t * 2) + idx * 0.3) * 0.2) : 1;
      const circleRadius = R_circle * (1 - t * 0.1) * pulseVal;
      ctx.arc(point.x, point.y, Math.max(0.1, circleRadius), 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${lerp(180, 240, t)}, 70%, 60%, ${0.4 * opacityFactor})`;
      ctx.stroke();
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        animationFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      const R_dist = Math.min(w, h) * 0.12;
      const points = getFruitOfLifePoints(w/2, h/2, R_dist);
      
      ctx.clearRect(0, 0, w, h);
      drawBackground(ctx, currentEntropy, currentDisplayMode, w, h);
      updateAndDrawParticles(ctx, currentEntropy, currentDisplayMode, 0, w, h);
      drawFlowerCircles(points, R_dist, currentEntropy, false, 0, ctx);

      animationFrameIdRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [currentEntropy, currentDisplayMode, drawBackground, updateAndDrawParticles, drawFlowerCircles]);

  const availableModes: PanelDisplayMode[] = useMemo(() => {
    const geoModes = Object.values(GeoMode);
    const vizMatrixModes = Object.values(VisualizationMatrixMode);
    return [...new Set([...geoModes, ...vizMatrixModes])] as PanelDisplayMode[];
  }, []);

  return (
    <div ref={containerRef} className="flower-of-life-explorer bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-2xl p-4 my-4 text-slate-100 flex flex-col" style={{ width, height }}>
      <h2 className="text-xl font-cinzel font-bold mb-2 text-center text-cyan-200">Entropy Explorer</h2>
      <ModeSelectorAny currentMode={currentDisplayMode} onSetMode={onSetDisplayMode} availableModes={availableModes} />
      <div className="flex-grow relative mt-2">
        <canvas ref={canvasRef} className="w-full h-full rounded-lg" />
      </div>
    </div>
  );
};

export default FlowerOfLifeEntropyExplorer;
