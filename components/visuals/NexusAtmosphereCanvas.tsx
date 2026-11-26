import React, { useEffect, useRef, useState } from 'react';

interface NexusAtmosphereCanvasProps {
  scrollY: number;
  activeCluster?: string | null;
  cursorPos?: { x: number; y: number };
}

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  depth: 'near' | 'mid' | 'far';
  size: number;
  opacity: number;
  baseOpacity: number;
  hue: number;
  pulsePhase: number;
  cluster?: string;
}

interface EnergyPulse {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
  hue: number;
}

export const NexusAtmosphereCanvas: React.FC<NexusAtmosphereCanvasProps> = ({
  scrollY,
  activeCluster,
  cursorPos = { x: -1000, y: -1000 },
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const pulsesRef = useRef<EnergyPulse[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const fpsRef = useRef<number>(60);
  const frameCountRef = useRef<number>(0);
  const [qualityTier, setQualityTier] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let isMobile = window.innerWidth < 768;
    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      isMobile = window.innerWidth < 768;
    };

    window.addEventListener('resize', resize);
    resize();

    // Particle allocation based on device capability
    const count = prefersReducedMotion ? 25 : isMobile ? 45 : 110;
    const clusters = ['intelligence', 'technology', 'commerce', 'energy', 'creation', 'network'];

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const depthRand = Math.random();
      const depth: 'near' | 'mid' | 'far' = depthRand < 0.15 ? 'near' : depthRand < 0.75 ? 'mid' : 'far';
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      const x = Math.random() * width;
      const y = Math.random() * height;

      let size = 1.2;
      let baseOpacity = 0.3;
      let hue = 210; // Default cyan/blue

      if (depth === 'near') {
        size = Math.random() * 2.5 + 2.0;
        baseOpacity = Math.random() * 0.3 + 0.35;
        hue = Math.random() > 0.4 ? 185 : 270; // Cyan or violet
      } else if (depth === 'mid') {
        size = Math.random() * 1.5 + 0.8;
        baseOpacity = Math.random() * 0.25 + 0.2;
        hue = Math.random() > 0.6 ? 190 : Math.random() > 0.3 ? 245 : 330; // Cyan, indigo, magenta
      } else {
        size = Math.random() * 0.8 + 0.4;
        baseOpacity = Math.random() * 0.15 + 0.08;
        hue = 220;
      }

      newParticles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * (depth === 'near' ? 0.4 : depth === 'mid' ? 0.25 : 0.1),
        vy: (Math.random() - 0.5) * (depth === 'near' ? 0.4 : depth === 'mid' ? 0.25 : 0.1) - 0.1,
        depth,
        size,
        opacity: baseOpacity,
        baseOpacity,
        hue,
        pulsePhase: Math.random() * Math.PI * 2,
        cluster: clusters[i % clusters.length],
      });
    }

    particlesRef.current = newParticles;

    // Energy pulse generator
    const pulseInterval = setInterval(() => {
      if (prefersReducedMotion || particlesRef.current.length < 10) return;
      if (pulsesRef.current.length < 8 && Math.random() > 0.3) {
        const from = Math.floor(Math.random() * particlesRef.current.length);
        let closest = -1;
        let minDist = 180;
        
        for (let j = 0; j < particlesRef.current.length; j++) {
          if (j === from) continue;
          const dx = particlesRef.current[from].x - particlesRef.current[j].x;
          const dy = particlesRef.current[from].y - particlesRef.current[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            closest = j;
          }
        }

        if (closest !== -1) {
          pulsesRef.current.push({
            fromIndex: from,
            toIndex: closest,
            progress: 0,
            speed: Math.random() * 0.02 + 0.015,
            hue: particlesRef.current[from].hue,
          });
        }
      }
    }, 400);

    // Render loop
    let lastRenderTime = performance.now();
    const render = (now: number) => {
      const dt = (now - lastRenderTime) / 1000;
      lastRenderTime = now;

      // Adaptive FPS Monitoring
      frameCountRef.current++;
      if (now - lastTimeRef.current >= 1000) {
        fpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        lastTimeRef.current = now;

        if (fpsRef.current < 35 && qualityTier === 'high') {
          setQualityTier('medium');
        } else if (fpsRef.current < 25 && qualityTier === 'medium') {
          setQualityTier('low');
        }
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // Core Ambient Radial Glow
      const coreX = width * 0.5 + (cursorPos.x - width * 0.5) * 0.03;
      const coreY = height * 0.45 + (cursorPos.y - height * 0.5) * 0.03 - (scrollY * 0.1 % height);
      const gradient = ctx.createRadialGradient(coreX, coreY, 20, coreX, coreY, Math.max(width * 0.45, 300));
      gradient.addColorStop(0, 'rgba(79, 70, 229, 0.08)');
      gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.03)');
      gradient.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const particles = particlesRef.current;
      const isClustering = Boolean(activeCluster);

      // Draw Connections (Mid depth only, for crisp performance)
      if (qualityTier !== 'low') {
        const connectionMaxDist = isMobile ? 90 : 130;
        ctx.lineWidth = 0.6;

        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          if (p1.depth === 'far') continue;

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            if (p2.depth === 'far') continue;

            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionMaxDist) {
              const alpha = (1 - dist / connectionMaxDist) * 0.18;
              const isHighlighted = activeCluster && (p1.cluster === activeCluster || p2.cluster === activeCluster);
              
              ctx.strokeStyle = isHighlighted
                ? `rgba(56, 189, 248, ${alpha * 2.8})`
                : `rgba(99, 102, 241, ${alpha})`;

              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      // Render Energy Pulses
      for (let pIdx = pulsesRef.current.length - 1; pIdx >= 0; pIdx--) {
        const pulse = pulsesRef.current[pIdx];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulsesRef.current.splice(pIdx, 1);
          continue;
        }

        const pFrom = particles[pulse.fromIndex];
        const pTo = particles[pulse.toIndex];
        if (!pFrom || !pTo) continue;

        const curX = pFrom.x + (pTo.x - pFrom.x) * pulse.progress;
        const curY = pFrom.y + (pTo.y - pFrom.y) * pulse.progress;

        ctx.fillStyle = `hsla(${pulse.hue}, 90%, 75%, 0.8)`;
        ctx.beginPath();
        ctx.arc(curX, curY, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Cursor Gravitational Reaction
        const cdx = cursorPos.x - p.x;
        const cdy = cursorPos.y - p.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        const cursorRadius = p.depth === 'near' ? 220 : 140;

        if (cdist < cursorRadius && cdist > 1) {
          const force = (1 - cdist / cursorRadius) * (p.depth === 'near' ? 2.5 : 1.2);
          p.x -= (cdx / cdist) * force;
          p.y -= (cdy / cdist) * force;
        }

        // Natural Drift & Scroll Velocity
        const scrollParallax = p.depth === 'near' ? 0.35 : p.depth === 'mid' ? 0.15 : 0.05;
        p.y += p.vy - scrollY * scrollParallax * dt * 0.8;
        p.x += p.vx;

        // Wrap around bounds
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Dynamic Opacity Pulse
        p.pulsePhase += 0.02;
        const pulseFactor = Math.sin(p.pulsePhase) * 0.15;
        let renderOpacity = Math.max(0.05, p.baseOpacity + pulseFactor);

        if (isClustering && p.cluster === activeCluster) {
          renderOpacity = Math.min(1.0, renderOpacity * 2.2);
        }

        ctx.fillStyle = `hsla(${p.hue}, 85%, 70%, ${renderOpacity})`;

        if (qualityTier === 'high' && p.depth === 'near') {
          ctx.shadowBlur = 8;
          ctx.shadowColor = `hsla(${p.hue}, 90%, 65%, 0.7)`;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      clearInterval(pulseInterval);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [scrollY, activeCluster, cursorPos, qualityTier]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ease-out"
      style={{ opacity: 0.95 }}
      aria-hidden="true"
    />
  );
};

export default NexusAtmosphereCanvas;
