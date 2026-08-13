import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import type { LIFEPanelProps } from '../../types';
import { AgentName } from '../../types';
import { useSystemState } from '../../context/SystemContext';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

const LIFEPanel: React.FC<LIFEPanelProps> = ({
  currentEntropy,
  addEchoMessage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { negentropyLevel, isNegentropyStable } = useSystemState();
  const animationFrameIdRef = useRef<number | null>(null);
  const lastNegentropyLevelRef = useRef<number>(negentropyLevel);

  const ritualMemoryNodes = useMemo(() => {
    const baseNodes = [
      { id: 'mem1', label: 'Axiom Weave', x: 0.2, y: 0.75, strength: 0.8 * negentropyLevel + 0.1 },
      { id: 'mem2', label: 'Chalice Stability', x: 0.5, y: 0.85, strength: 0.6 * negentropyLevel + 0.1 },
      { id: 'mem3', label: 'Zero-Point Anchor', x: 0.8, y: 0.75, strength: 0.9 * negentropyLevel + 0.15 },
    ];
    return baseNodes.map(n => ({...n, effectiveStrength: clamp(n.strength * negentropyLevel * 1.5, 0.1, 1.0) }));
  }, [negentropyLevel]);

  useEffect(() => {
    if (negentropyLevel > 0.85 && lastNegentropyLevelRef.current <= 0.85) {
      addEchoMessage(AgentName.LIFEPanelAgent, "System Vitality Maximum: Negentropic lattice fully resonant. LIFE blooms fractal patterns outward!", 'text-emerald-300 font-bold');
    } else if (negentropyLevel >= 0.7 && lastNegentropyLevelRef.current < 0.7) {
       addEchoMessage(AgentName.LIFEPanelAgent, "System Approaching Stability: Order Spiral converging. LIFE energies strengthening, branches extend.", 'text-green-400');
    } else if (negentropyLevel < 0.3 && lastNegentropyLevelRef.current >= 0.3) {
      addEchoMessage(AgentName.LIFEPanelAgent, "System Vitality Critical: Negentropic structures withering. Entropy threatens the LIFE core; bloom recedes.", 'text-rose-400');
    } else if (negentropyLevel < 0.5 && lastNegentropyLevelRef.current >= 0.5) {
        addEchoMessage(AgentName.LIFEPanelAgent, "System Vitality Waning: Order diminishing. LIFE tendrils retract slightly.", 'text-amber-400');
    }
    lastNegentropyLevelRef.current = negentropyLevel;
  }, [negentropyLevel, addEchoMessage]);

  const drawVitalGlyphBloom = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    angle: number, length: number,
    depth: number, maxDepth: number,
    negentropy: number
  ) => {
    if (depth > maxDepth || length < 0.5) return;

    const x2 = x + Math.cos(angle) * length;
    const y2 = y + Math.sin(angle) * length;
    const t = clamp(negentropy, 0, 1);

    const hue = lerp(70 - 20 * (1-t), 180 + 40 * t, t); 
    const saturation = lerp(40 + 20 * t, 95, t);
    const lightness = lerp(30 + 10 * t, 65 + 10*t, t);
    const alpha = lerp(0.3 + 0.2 * t, 1.0, t) * (1 - depth / (maxDepth + 2)); 
    const lineWidth = Math.max(0.4, (maxDepth - depth + 1) * 0.35 * (0.5 + t * 1.0));

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    const branches = depth === 0 ? (2 + Math.floor(t*3)) : (t > 0.25 ? 2 : 1) ; 
    const angleVariance = Math.PI / lerp(8 - t*3, 2.5, t); 
    const lengthMultiplier = lerp(0.55 + t*0.1, 0.8, t);
    
    for (let i = 0; i < branches; i++) {
        let newAngle = angle;
        if (branches > 1) {
            newAngle += (i - (branches-1)/2) * angleVariance * (1 - t*0.4); 
        } else if (branches === 1 && depth > 0) {
            newAngle += (Math.random() - 0.5) * angleVariance * 0.3 * (1-t);
        }
        drawVitalGlyphBloom(ctx, x2, y2, newAngle, length * lengthMultiplier, depth + 1, maxDepth, negentropy);
    }
    
    if (depth >= maxDepth -1 && t > 0.6 && length > 1.0) {
        const bloomRadius = Math.max(0, lineWidth * 1.8 * t * (0.6 + Math.random()*0.4));
        if (Number.isFinite(x2) && Number.isFinite(y2) && bloomRadius > 0) {
          const bloomGrad = ctx.createRadialGradient(x2, y2, 0, x2, y2, bloomRadius);
          const bloomHue = (hue + 30 + Math.random()*30)%360;
          bloomGrad.addColorStop(0, `hsla(${bloomHue}, ${saturation + 5}%, ${lightness + 10}%, ${alpha * 0.95})`);
          bloomGrad.addColorStop(1, `hsla(${bloomHue - 15}, ${saturation}%, ${lightness}%, 0.1)`);
          
          ctx.fillStyle = bloomGrad;
          ctx.beginPath();
          ctx.arc(x2, y2, Math.max(0, bloomRadius), 0, Math.PI*2);
          ctx.fill();
        }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    });

    resizeObserver.observe(container);
    
    let frameCount = 0;

    const draw = () => {
      frameCount++;
      const { width, height } = canvas;
      if (width === 0 || height === 0) {
        animationFrameIdRef.current = requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      const t_negentropy = negentropyLevel;

      const bgHue = lerp(280, 200, t_negentropy); 
      const centerX = width / 2;
      const centerY = height / 2;
      const bgRadius = Math.max(0, width * 0.9);

      if (Number.isFinite(centerX) && Number.isFinite(centerY) && bgRadius > 0) {
        const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, bgRadius);
        bgGrad.addColorStop(0, `hsla(${bgHue}, ${lerp(30, 65, t_negentropy)}%, ${lerp(5, 25, t_negentropy)}%, 0.98)`);
        bgGrad.addColorStop(1, `hsla(${(bgHue + 45)%360}, ${lerp(40, 75, t_negentropy)}%, ${lerp(2, 15, t_negentropy)}%, 0.99)`);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      const bloomMaxDepth = Math.floor(lerp(2, 8, t_negentropy));
      const bloomInitialLength = height * 0.20 * lerp(0.3, 1.4, t_negentropy);
      drawVitalGlyphBloom(ctx, width / 2, height * 0.90, -Math.PI / 2, bloomInitialLength, 0, bloomMaxDepth, t_negentropy);

      const spiralCenterX = width * 0.18;
      const spiralCenterY = height * 0.2;
      const spiralMaxRadius = Math.max(0, width * 0.12);
      const a_spiral = 0.5; 
      const b_spiral = lerp(0.4, 0.05, t_negentropy);
      
      if (Number.isFinite(spiralCenterX) && Number.isFinite(spiralCenterY) && spiralMaxRadius > 0) {
        ctx.beginPath();
        ctx.lineWidth = Math.max(0.1, lerp(0.7, 4, t_negentropy));
        const spiralHue = lerp(40, 160, t_negentropy);
        const spiralGrad = ctx.createLinearGradient(spiralCenterX - spiralMaxRadius, spiralCenterY, spiralCenterX + spiralMaxRadius, spiralCenterY);
        spiralGrad.addColorStop(0, `hsla(${spiralHue}, 90%, 65%, ${0.2 + t_negentropy * 0.2})`);
        spiralGrad.addColorStop(0.5, `hsla(${spiralHue}, 95%, 75%, ${0.5 + t_negentropy * 0.5})`);
        spiralGrad.addColorStop(1, `hsla(${spiralHue}, 90%, 65%, ${0.2 + t_negentropy * 0.2})`);
        ctx.strokeStyle = spiralGrad;
        
        let firstSpiralPoint = true;
        const actualTurnsToDraw = Math.PI * 2 * lerp(0.5, 5 + t_negentropy * 5, t_negentropy) * t_negentropy;

        for (let angle = 0; angle < actualTurnsToDraw; angle += 0.03) { 
          const r = a_spiral * Math.exp(b_spiral * angle);
          if (r > spiralMaxRadius) break;
          const x = spiralCenterX + r * Math.cos(angle);
          const y = spiralCenterY + r * Math.sin(angle);
          if (firstSpiralPoint) { ctx.moveTo(x,y); firstSpiralPoint = false; }
          else { ctx.lineTo(x, y); }
        }
        ctx.stroke();
      }
      
      const webYBase = height * 0.82;
      ritualMemoryNodes.forEach(node => {
        const x = node.x * width * 0.7 + width * 0.15;
        const y = webYBase + node.y * height * 0.12;
        const radius = Math.max(0, lerp(1.5, 7, node.effectiveStrength) * (0.8 + t_negentropy * 0.4));
        const nodeHue = 180 + node.effectiveStrength * 70 * t_negentropy;
        
        if (Number.isFinite(x) && Number.isFinite(y) && radius > 0) {
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0, radius), 0, Math.PI * 2);
          const nodeGrad = ctx.createRadialGradient(x,y,0, x,y,radius);
          nodeGrad.addColorStop(0, `hsla(${nodeHue}, 90%, 80%, ${0.4 + node.effectiveStrength * 0.6 * t_negentropy})`);
          nodeGrad.addColorStop(1, `hsla(${nodeHue}, 80%, 60%, ${0.15 + node.effectiveStrength * 0.4 * t_negentropy})`);
          ctx.fillStyle = nodeGrad;
          ctx.fill();
        }
      });
      
      const graphX = width * 0.75;
      const graphY = height * 0.08;
      const barWidth = width * 0.06;
      const maxBarHeight = height * 0.22;

      if (Number.isFinite(graphX) && Number.isFinite(graphY)) {
        ctx.fillStyle = `hsla(0, ${lerp(40,75,currentEntropy)}%, ${lerp(35,55,currentEntropy)}%, ${0.6 + currentEntropy * 0.35})`;
        ctx.fillRect(graphX, graphY + maxBarHeight * (1 - currentEntropy), barWidth, maxBarHeight * currentEntropy);
        ctx.fillStyle = 'rgba(230,200,200,0.75)';
        ctx.font = '8px Cinzel';
        ctx.textAlign = 'center';
        ctx.fillText(`E:${currentEntropy.toFixed(2)}`, graphX + barWidth / 2, graphY + maxBarHeight + 8);

        ctx.fillStyle = `hsla(120, ${lerp(40,85,t_negentropy)}%, ${lerp(35,60,t_negentropy)}%, ${0.6 + t_negentropy * 0.35})`;
        ctx.fillRect(graphX + barWidth * 1.5, graphY + maxBarHeight * (1 - t_negentropy), barWidth, maxBarHeight * t_negentropy);
        ctx.fillStyle = 'rgba(200,230,200,0.75)';
        ctx.fillText(`N:${t_negentropy.toFixed(2)}`, graphX + barWidth * 2.0, graphY + maxBarHeight + 8);
      }

      animationFrameIdRef.current = requestAnimationFrame(draw);
    };
    animationFrameIdRef.current = requestAnimationFrame(draw);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [currentEntropy, negentropyLevel, isNegentropyStable, drawVitalGlyphBloom, ritualMemoryNodes]);

  return (
    <div className="life-panel bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-emerald-600/60 rounded-xl shadow-2xl p-4 text-slate-100">
      <h3 className="text-lg md:text-xl font-['Cinzel'] font-bold text-emerald-300 mb-2 text-center tracking-wide drop-shadow-[0_1px_2px_rgba(100,255,150,0.3)]">
        Living Inflection Field Engine (L.I.F.E)
      </h3>
      <div ref={containerRef} className="w-full h-48 md:h-64 mx-auto rounded-lg border border-slate-700/50 shadow-inner bg-slate-950/70 overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          aria-label="LIFE Panel Visualization of System Negentropy and Order"
        />
      </div>
      <div className="mt-2 text-center text-xs text-slate-400 font-mono tracking-tighter">
        Negentropy: {negentropyLevel.toFixed(3)}ν | Stability: {isNegentropyStable ? 'HARMONIC' : 'FLUX'}
      </div>
    </div>
  );
};

export default LIFEPanel;