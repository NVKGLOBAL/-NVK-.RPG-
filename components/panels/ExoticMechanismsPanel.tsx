
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ExoticMechanismsPanelProps } from '../../types';
import { ExoticMechanismMode, AgentName } from '../../types';
import { AGENT_PROFILES } from '../../constants';

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

interface Particle {
  id: string;
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'higgs' | 'vacuum' | 'topology_node';
  rotation?: number; 
  rotationSpeed?: number;
  trail?: {x: number, y: number}[];
}

const MODE_DETAILS = {
  [ExoticMechanismMode.HiggsField]: {
    title: "Higgs Field Dynamics",
    description: "Visualizing particle mass acquisition. Higher entropy intensifies field interactions.",
    icon: "ri-copper-diamond-line"
  },
  [ExoticMechanismMode.QuantumVacuum]: {
    title: "Quantum Vacuum Fluctuations",
    description: "Observing virtual particle pair creation and annihilation. Denser flux at higher entropy.",
    icon: "ri-bubble-chart-line"
  },
  [ExoticMechanismMode.SpacetimeTopology]: {
    title: "Spacetime Topology Dynamics",
    description: "Mapping the fabric of spacetime. Increased entropy reveals structural instability.",
    icon: "ri-space-ship-line"
  }
};

const ExoticMechanismsPanel: React.FC<ExoticMechanismsPanelProps> = ({
  currentEntropy,
  width,
  height,
  addEchoMessage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentMode, setCurrentMode] = useState<ExoticMechanismMode>(ExoticMechanismMode.HiggsField);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  const agentProfile = AGENT_PROFILES[AgentName.ExoticMechanismAgent];

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
        const { width: w, height: h } = entries[0].contentRect;
        setDimensions({ w, h: h - 160 }); // Adjust for header/controls
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleModeChange = (newMode: ExoticMechanismMode) => {
    setCurrentMode(newMode);
    addEchoMessage(
      AgentName.ExoticMechanismAgent,
      `Switched to ${MODE_DETAILS[newMode].title}. Entropy: ${currentEntropy.toFixed(3)}δ.`,
      agentProfile?.colorClass || 'text-fuchsia-300'
    );
  };

  const initializeParticles = useCallback(() => {
    const { w, h } = dimensions;
    if (w <= 0 || h <= 0) return;

    const numParticles = 50 + Math.floor(currentEntropy * 100);
    const newParticles: Particle[] = [];

    for (let i = 0; i < numParticles; i++) {
      const particleType = currentMode === ExoticMechanismMode.HiggsField ? 'higgs' :
                           currentMode === ExoticMechanismMode.QuantumVacuum ? 'vacuum' : 'topology_node';
      
      let particle: Particle = {
        id: `${particleType}-${i}-${Date.now()}`,
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * (0.2 + currentEntropy * 0.5),
        vy: (Math.random() - 0.5) * (0.2 + currentEntropy * 0.5),
        size: 1 + Math.random() * (1 + currentEntropy * 2),
        opacity: 0.1 + Math.random() * 0.4,
        life: 100 + Math.random() * 100,
        maxLife: 100 + Math.random() * 100,
        color: 'rgba(200, 220, 255, 0.5)', 
        type: particleType,
      };

      if (particleType === 'higgs') {
        particle.color = `hsla(${180 + currentEntropy * 60}, 70%, ${60 + Math.random()*20}%, ${0.3 + Math.random()*0.3})`;
        particle.vx *= 0.5; particle.vy *= 0.5;
      } else if (particleType === 'vacuum') {
        particle.life = 20 + Math.random() * 30 * (1 - currentEntropy * 0.8); 
        particle.maxLife = particle.life;
        particle.color = Math.random() > 0.5 ? `hsla(180, 90%, 70%, ${0.6 + Math.random()*0.4})` : `hsla(300, 90%, 70%, ${0.6 + Math.random()*0.4})`; 
        particle.size = 0.5 + Math.random() * (1 + currentEntropy * 2.5);
        particle.vx = (Math.random() - 0.5) * (0.5 + currentEntropy * 1.5);
        particle.vy = (Math.random() - 0.5) * (0.5 + currentEntropy * 1.5);
      } else if (particleType === 'topology_node') {
          const gridSize = Math.max(2, 10 + Math.floor(currentEntropy * 5)); 
          const col = i % gridSize;
          const row = Math.floor(i / gridSize);
          if (row >= gridSize) continue;
          particle.x = (w / (gridSize + 1)) * (col + 1);
          particle.y = (h / (gridSize + 1)) * (row + 1);
          particle.vx = 0; particle.vy = 0;
          particle.life = Infinity; 
          particle.size = 1 + currentEntropy * 0.5;
          particle.color = `hsla(210, 50%, 70%, ${0.4 + (1-currentEntropy)*0.4})`;
          particle.trail = [];
      }
      newParticles.push(particle);
    }
    particlesRef.current = newParticles;
  }, [dimensions, currentMode, currentEntropy]);

  useEffect(() => {
    initializeParticles();
  }, [initializeParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const { w, h } = dimensions;
    if (!canvas || w <= 0 || h <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = w;
    canvas.height = h;

    let frameCount = 0;

    const draw = () => {
      frameCount++;
      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;
      const radius = Math.max(w, h) * 0.7;

      if (Number.isFinite(centerX) && Number.isFinite(centerY) && radius > 0) {
        const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        bgGrad.addColorStop(0, `hsla(230, 40%, ${10 + currentEntropy * 10}%, 0.95)`);
        bgGrad.addColorStop(1, `hsla(260, 50%, ${5 + currentEntropy * 5}%, 0.98)`);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      }
      
      particlesRef.current.forEach(p => {
        switch (p.type) {
          case 'higgs':
            p.x += p.vx; p.y += p.vy;
            p.life--;
            p.opacity = Math.sin((p.life / p.maxLife) * Math.PI) * (0.3 + currentEntropy * 0.4);
            p.size = (1 + Math.sin((p.life / p.maxLife) * Math.PI) * (1 + currentEntropy * 2)) * p.maxLife/150;

            if (p.life <= 0 || p.x < -p.size || p.x > w + p.size || p.y < -p.size || p.y > h + p.size) {
              p.x = Math.random() * w;
              p.y = Math.random() * h;
              p.vx = (Math.random() - 0.5) * (0.2 + currentEntropy * 0.5) * 0.5;
              p.vy = (Math.random() - 0.5) * (0.2 + currentEntropy * 0.5) * 0.5;
              p.life = 100 + Math.random() * 100;
              p.maxLife = p.life;
            }
            ctx.fillStyle = p.color.replace(/,\s*([0-9.]+)\)/, `, ${clamp(p.opacity, 0, 1)})`);
            ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0, p.size), 0, Math.PI*2); ctx.fill();
            break;

          case 'vacuum':
            p.x += p.vx; p.y += p.vy;
            p.life--;
            p.opacity = (p.life / p.maxLife) * (0.7 + currentEntropy * 0.3);
            if (p.life <= 0) {
              p.x = Math.random() * w;
              p.y = Math.random() * h;
              p.life = 20 + Math.random() * 30 * (1 - currentEntropy * 0.8);
              p.maxLife = p.life;
            }
            ctx.fillStyle = p.color.replace(/,\s*([0-9.]+)\)/, `, ${clamp(p.opacity, 0, 1)})`);
            ctx.beginPath(); ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
            ctx.fill();
            break;

          case 'topology_node':
            const warpFactor = currentEntropy * 20 * (1 + Math.sin(p.x * 0.01 + frameCount * 0.005) * 0.5);
            p.x += (Math.random() - 0.5) * warpFactor * 0.1 + Math.sin(p.y * 0.02 + frameCount * 0.01) * currentEntropy * 0.3;
            p.y += (Math.random() - 0.5) * warpFactor * 0.1 + Math.cos(p.x * 0.02 + frameCount * 0.01) * currentEntropy * 0.3;
            p.x = (p.x + w * 1.1) % (w * 1.2) - w * 0.1;
            p.y = (p.y + h * 1.1) % (h * 1.2) - h * 0.1;
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0, p.size), 0, Math.PI*2); ctx.fill();
            break;
        }
      });
      
      if (currentMode === ExoticMechanismMode.SpacetimeTopology) {
        const nodes = particlesRef.current.filter(p => p.type === 'topology_node');
        const gridSize = Math.max(2, Math.floor(Math.sqrt(nodes.length)));
        const threshold = (w / (gridSize - 1)) * 1.5;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const p1 = nodes[i]; const p2 = nodes[j];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < threshold * (1 + currentEntropy * 0.5)) { 
              ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
              const opacity = 0.1 + (1 - dist / (threshold * (1 + currentEntropy * 0.5))) * (0.3 + currentEntropy * 0.3);
              ctx.strokeStyle = `hsla(210, 40%, 60%, ${Math.max(0.05, opacity)})`;
              ctx.stroke();
            }
          }
        }
      }
      animationFrameIdRef.current = requestAnimationFrame(draw);
    };
    animationFrameIdRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [currentEntropy, dimensions, currentMode]);

  const panelWidth = typeof width === 'number' ? `${width}px` : width;
  const panelHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div ref={containerRef} className="exotic-mechanisms-panel bg-slate-900/80 backdrop-blur-sm border border-fuchsia-600/50 rounded-xl shadow-2xl p-4 text-slate-100" style={{ width: panelWidth, height: panelHeight }}>
      <h3 className="text-lg font-['Cinzel'] font-semibold text-fuchsia-300 mb-2 text-center">
        {MODE_DETAILS[currentMode].title}
      </h3>
      <p className="text-xs text-fuchsia-200/80 italic text-center mb-3 h-10">
        {MODE_DETAILS[currentMode].description}
      </p>
      <div className="mode-selector flex justify-center gap-2 mb-3">
        {(Object.values(ExoticMechanismMode) as string[]).map(mode => (
          <button
            key={mode}
            onClick={() => handleModeChange(mode as ExoticMechanismMode)}
            className={`px-3 py-1 text-[10px] rounded-md transition-colors border ${currentMode === mode ? 'bg-fuchsia-500 border-fuchsia-400 text-white' : 'bg-slate-700 border-slate-600'}`}
          >
            {mode.replace('Dynamics','').replace('Fluctuations','').trim()}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} className="rounded-md border border-slate-700/70 bg-black shadow-inner mx-auto block" />
    </div>
  );
};

export default ExoticMechanismsPanel;
