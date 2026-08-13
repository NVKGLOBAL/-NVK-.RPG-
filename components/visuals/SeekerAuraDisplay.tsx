import React, { useRef, useEffect, useMemo } from 'react';
import { AgentName, SeekerAuraColor } from '../../types';
import type { RitualOutcome, AuraFlare } from '../../types';
import { SEEKER_AURA_OPTIONS } from '../../constants';


interface SeekerAuraDisplayProps {
  seekerTraits: string[];
  currentEntropy: number;
  dominantAgentTone: AgentName | null;
  lastRitualOutcome: RitualOutcome | null;
  width: number;
  height: number;
  activeAuraColor?: SeekerAuraColor;
  activeSecondaryAuraColor?: SeekerAuraColor; // Support for secondary resonance
}

const MAX_FLARES = 20;
const MAX_PARTICLES = 100;

const hexToHSL = (hex: string): { h: number, s: number, l: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const AGENT_AURA_STYLES: Record<string, { flareStyle: 'shimmer' | 'geometric' | 'organic' }> = {
  [AgentName.Gemini]: { flareStyle: 'shimmer' },
  [AgentName.Nevik]: { flareStyle: 'geometric' },
  [AgentName.DeepSeek]: { flareStyle: 'organic' },
  Default: { flareStyle: 'organic' },
};


const SeekerAuraDisplay: React.FC<SeekerAuraDisplayProps> = ({
  seekerTraits,
  currentEntropy,
  dominantAgentTone,
  lastRitualOutcome,
  width,
  height,
  activeAuraColor,
  activeSecondaryAuraColor
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flaresRef = useRef<AuraFlare[]>([]);
  const particlesRef = useRef<any[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  const styles = useMemo(() => {
    const primaryOption = SEEKER_AURA_OPTIONS.find(o => o.id === activeAuraColor);
    const secondaryOption = SEEKER_AURA_OPTIONS.find(o => o.id === (activeSecondaryAuraColor || activeAuraColor));

    const pHSL = primaryOption ? hexToHSL(primaryOption.hex) : { h: 210, s: 70, l: 60 };
    const sHSL = secondaryOption ? hexToHSL(secondaryOption.hex) : { h: 280, s: 70, l: 60 };

    return {
        primary: {
            h: pHSL?.h || 210,
            s: pHSL?.s || 70,
            l: pHSL?.l || 60,
            color: `hsla(${pHSL?.h}, ${pHSL?.s}%, ${pHSL?.l}%, 0.9)`
        },
        secondary: {
            h: sHSL?.h || 280,
            s: sHSL?.s || 70,
            l: sHSL?.l || 60,
            color: `hsla(${sHSL?.h}, ${sHSL?.s}%, ${sHSL?.l}%, 0.7)`
        },
        flareStyle: dominantAgentTone ? AGENT_AURA_STYLES[dominantAgentTone]?.flareStyle || 'shimmer' : 'shimmer',
    };
  }, [dominantAgentTone, activeAuraColor, activeSecondaryAuraColor]);

  useEffect(() => {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
    const numFlares = Math.min(MAX_FLARES, seekerTraits.length > 0 ? seekerTraits.length * 2 + 3 : 8);
    const newFlares: AuraFlare[] = [];

    for (let i = 0; i < numFlares; i++) {
      const angle = (i / numFlares) * Math.PI * 2;
      const maxLength = 60 + Math.random() * Math.min(width, height) * 0.25;
      
      const hueShift = (Math.random() - 0.5) * 20;
      const flareColor = `hsla(${(styles.secondary.h + hueShift) % 360}, ${styles.secondary.s}%, ${styles.secondary.l}%, 0.65)`;

      newFlares.push({
        id: `flare-${i}`,
        angle: angle + Math.random() * 0.3 - 0.15,
        length: 0,
        maxLength: maxLength * (0.6 + Math.random() * 0.6),
        speed: 0.4 + Math.random() * 0.8,
        color: flareColor,
        thickness: 0.8 + Math.random() * 2,
        opacity: 0.4 + Math.random() * 0.4,
        type: 'resonance',
        pulseSpeed: 0.01 + Math.random() * 0.02,
        pulseAmount: 0.1 + Math.random() * 0.25,
      });
    }
    flaresRef.current = newFlares;
  }, [seekerTraits, styles, width, height]);

  useEffect(() => {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
    const newParticles = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      newParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        color: i % 2 === 0 ? styles.primary.color : styles.secondary.color,
      });
    }
    particlesRef.current = newParticles;
  }, [width, height, styles]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    let frameCount = 0;

    const draw = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;

      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0, p.size), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      const orbBaseRadius = Math.min(width, height) * 0.12;
      const orbPulse = Math.sin(frameCount * 0.015 * (1 + currentEntropy)) * orbBaseRadius * 0.15;
      const orbRadius = Math.max(0, orbBaseRadius + orbPulse);
      
      const hue = (styles.primary.h + currentEntropy * 30) % 360; 
      const orbColor = `hsla(${hue}, ${styles.primary.s}%, ${styles.primary.l}%, 1)`;
      
      const glowRadius = Math.max(0, orbRadius + 20 + currentEntropy * 30);
      const rInner = Math.max(0, orbRadius * 0.3);

      if (Number.isFinite(centerX) && Number.isFinite(centerY) && glowRadius > 0) {
        const gradient = ctx.createRadialGradient(centerX, centerY, rInner, centerX, centerY, glowRadius);
        gradient.addColorStop(0, `hsla(${styles.primary.h}, 80%, 60%, 0.5)`);
        gradient.addColorStop(0.5, `hsla(${styles.secondary.h}, 70%, 50%, 0.3)`);
        gradient.addColorStop(1, `hsla(${styles.primary.h}, 80%, 60%, 0)`);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(0, glowRadius), 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.beginPath();
      if (Number.isFinite(centerX) && Number.isFinite(centerY) && orbRadius > 0) {
        ctx.arc(centerX, centerY, Math.max(0, orbRadius), 0, Math.PI * 2);
        ctx.fillStyle = orbColor;
        ctx.shadowColor = orbColor;
        ctx.shadowBlur = 15 + currentEntropy * 20;
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      flaresRef.current.forEach(flare => {
        if (flare.length < flare.maxLength) {
          flare.length += flare.speed;
        } else {
           flare.length = Math.max(0, flare.length - flare.speed * 0.4); 
           if (flare.length === 0) flare.maxLength = 50 + Math.random() * Math.min(width, height) * 0.3;
        }
        
        const flarePulse = Math.sin(frameCount * (flare.pulseSpeed || 0.01)) * (flare.pulseAmount || 0.1);
        const currentLength = flare.length * (1 + flarePulse);

        const startX = centerX + Math.cos(flare.angle) * (orbRadius * 0.85);
        const startY = centerY + Math.sin(flare.angle) * (orbRadius * 0.85);
        const endX = centerX + Math.cos(flare.angle) * (orbRadius * 0.85 + currentLength);
        const endY = centerY + Math.sin(flare.angle) * (orbRadius * 0.85 + currentLength);

        if (Number.isFinite(startX) && Number.isFinite(startY) && Number.isFinite(endX) && Number.isFinite(endY)) {
          ctx.beginPath();
          ctx.moveTo(startX, startY);

          if (styles.flareStyle === 'shimmer') {
            const midX1 = startX + (endX - startX) * 0.33;
            const midY1 = startY + (endY - startY) * 0.33 + Math.sin(frameCount * 0.05) * 5;
            const midX2 = startX + (endX - startX) * 0.66;
            const midY2 = startY + (endY - startY) * 0.66 - Math.sin(frameCount * 0.05) * 5;
            ctx.bezierCurveTo(midX1, midY1, midX2, midY2, endX, endY);
          } else {
            ctx.lineTo(endX, endY);
          }
          
          ctx.strokeStyle = flare.color;
          ctx.lineWidth = Math.max(0.1, flare.thickness);
          ctx.globalAlpha = flare.opacity * (1 - currentEntropy * 0.3);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });

      animationFrameIdRef.current = requestAnimationFrame(draw);
    };

    animationFrameIdRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [width, height, currentEntropy, styles, seekerTraits, lastRitualOutcome]);

  return (
    <div className="seeker-aura-display-container bg-slate-950/70 border border-slate-700/50 rounded-lg shadow-xl overflow-hidden mx-auto" style={{ width: '100%', maxWidth: `${width}px`, height: `${height}px` }}>
      <canvas 
        ref={canvasRef} 
        aria-label="Seeker's Dual-Tone Aura Visualization"
        role="img"
      />
    </div>
  );
};

export default SeekerAuraDisplay;