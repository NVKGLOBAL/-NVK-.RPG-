
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: 'quantum' | 'bit' | 'wave'; 
  angle?: number;     
  angularSpeed?: number;
}

interface BurstParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
    rotation: number;
    rotationSpeed: number;
    shape: 'square' | 'triangle' | 'circle';
}

const QUANTUM_COLORS = [
  '#00f0ff', // Electric Cyan
  '#ff0055', // Neon Red/Pink
  '#bd00ff', // Electric Violet
  '#39ff14', // Neon Lime
  '#ffffff', // Pure White core
];

const MagicalMouseTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const burstParticles = useRef<BurstParticle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const lastPos = useRef<{x: number, y: number} | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      
      const dist = lastPos.current ? Math.hypot(e.clientX - lastPos.current.x, e.clientY - lastPos.current.y) : 0;
      
      // Interpolate particles if mouse moves fast, but cap it for performance
      const steps = Math.min(dist, 8); 
      const startX = lastPos.current ? lastPos.current.x : e.clientX;
      const startY = lastPos.current ? lastPos.current.y : e.clientY;

      for(let i=0; i<=steps; i++) {
        const t = i/steps;
        const x = startX + (e.clientX - startX) * t;
        const y = startY + (e.clientY - startY) * t;

        // Reduced spawn probability for better performance
        if (Math.random() > 0.4) {
            const color = QUANTUM_COLORS[Math.floor(Math.random() * QUANTUM_COLORS.length)];
            const size = Math.random() * 2 + 1; 
            
            particles.current.push({
              x: x + (Math.random()-0.5) * 6,
              y: y + (Math.random()-0.5) * 6,
              size: size,
              color: color,
              vx: (Math.random() - 0.5) * 1.0,
              vy: (Math.random() - 0.5) * 1.0,
              life: 1.0,
              maxLife: 1.0,
              type: Math.random() > 0.8 ? 'bit' : 'quantum',
              angle: Math.random() * Math.PI * 2,
              angularSpeed: (Math.random() - 0.5) * 0.1
            });
        }
      }

      lastPos.current = { x: e.clientX, y: e.clientY };
      
      // Hard cap on particles to prevent memory leaks/lag
      if (particles.current.length > 150) {
        particles.current.splice(0, particles.current.length - 150);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
        // "Superposition Collapse" Burst
        const burstCount = 8; // Reduced count
        for (let i = 0; i < burstCount; i++) {
            const angle = (Math.PI * 2 * i) / burstCount;
            const speed = 3 + Math.random() * 3;
            const color = QUANTUM_COLORS[Math.floor(Math.random() * QUANTUM_COLORS.length)];
            const shapeRoll = Math.random();
            const shape = shapeRoll > 0.6 ? 'square' : shapeRoll > 0.3 ? 'triangle' : 'circle';

            burstParticles.current.push({
                x: e.clientX,
                y: e.clientY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 4 + Math.random() * 6,
                color: color,
                life: 1.0,
                rotation: Math.random() * Math.PI,
                rotationSpeed: (Math.random() - 0.5) * 0.4,
                shape: shape
            });
        }
        
        particles.current.push({
             x: e.clientX,
             y: e.clientY,
             size: 1,
             color: '#ffffff',
             vx: 0, vy: 0,
             life: 1.0, maxLife: 1.0,
             type: 'wave'
        });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', () => {});

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.globalCompositeOperation = 'lighter'; 

      // 1. Burst Particles
      for (let i = burstParticles.current.length - 1; i >= 0; i--) {
          const p = burstParticles.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.92;
          p.vy *= 0.92;
          p.rotation += p.rotationSpeed;
          p.life -= 0.04; // Faster decay
          p.size *= 0.95;

          if (p.life <= 0) {
              burstParticles.current.splice(i, 1);
              continue;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;

          if (p.shape === 'square') {
              ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
          } else if (p.shape === 'triangle') {
              ctx.beginPath();
              ctx.moveTo(0, -p.size/2);
              ctx.lineTo(p.size/2, p.size/2);
              ctx.lineTo(-p.size/2, p.size/2);
              ctx.closePath();
              ctx.fill();
          } else {
              ctx.beginPath();
              ctx.arc(0, 0, p.size/2, 0, Math.PI * 2);
              ctx.fill();
          }
          ctx.restore();
      }

      // 2. Trail Particles
      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];
        
        p.x += p.vx + Math.sin(p.angle || 0) * 0.3;
        p.y += p.vy + Math.cos(p.angle || 0) * 0.3;
        if(p.angle !== undefined && p.angularSpeed !== undefined) p.angle += p.angularSpeed;
        
        p.life -= 0.025; 
        p.size *= 0.96;

        if (p.life <= 0 || p.size < 0.2) {
          particles.current.splice(i, 1);
          i--;
          continue;
        }

        // Optimized Connections: Only connect to immediate neighbors in the array (Temporal locality)
        // This avoids the O(N^2) loop which causes lag
        if (p.type !== 'wave') {
            // Only check next 5 particles for connections
            const limit = Math.min(i + 5, particles.current.length);
            for (let j = i + 1; j < limit; j++) {
                const p2 = particles.current[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distSq = dx*dx + dy*dy;
                
                // 50px distance squared = 2500
                if (distSq < 2500) { 
                    ctx.beginPath();
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 1 * p.life; 
                    ctx.globalAlpha = 0.4 * p.life;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
      }

      // 3. Draw Bodies (Batch drawing where possible for perf, though styles vary)
      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];
        ctx.globalAlpha = p.life;
        
        if (p.type === 'wave') {
            p.size += 3;
            p.life -= 0.03;
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.5;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.stroke();
        } else if (p.type === 'bit') {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            // Only apply shadow blur to larger particles to save perf
            if (p.size > 2) {
                ctx.shadowBlur = 5;
                ctx.shadowColor = p.color;
            } else {
                ctx.shadowBlur = 0;
            }
            ctx.fill();
            ctx.shadowBlur = 0; 
        }
      }

      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over'; 
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', () => {});
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }} 
    />
  );
};

export default MagicalMouseTrail;
