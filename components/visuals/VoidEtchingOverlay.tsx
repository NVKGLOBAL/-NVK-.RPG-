
import React, { useRef, useEffect, useCallback } from 'react';

interface VoidEtchingOverlayProps {
  entropy: number;
}

interface EtchPoint {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

const VoidEtchingOverlay: React.FC<VoidEtchingOverlayProps> = ({ entropy }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<EtchPoint[]>([]);
  const lastMousePos = useRef<{ x: number, y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const getEtchColor = (entropy: number) => {
    if (entropy > 0.7) return `rgba(255, 50, 50,`; // Red for chaos
    if (entropy > 0.4) return `rgba(168, 85, 247,`; // Purple for flux
    return `rgba(56, 189, 248,`; // Blue for calm
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!lastMousePos.current) {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const dist = Math.hypot(e.clientX - lastMousePos.current.x, e.clientY - lastMousePos.current.y);
    const steps = Math.min(dist, 10); // Interpolate points for smooth lines

    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = lastMousePos.current.x + (e.clientX - lastMousePos.current.x) * t;
      const y = lastMousePos.current.y + (e.clientY - lastMousePos.current.y) * t;
      
      const velocityFactor = Math.min(dist / 10, 2);
      
      pointsRef.current.push({
        x: x,
        y: y,
        life: 1.0,
        maxLife: 1.0,
        vx: (Math.random() - 0.5) * velocityFactor * (1 + entropy),
        vy: (Math.random() - 0.5) * velocityFactor * (1 + entropy),
        size: (Math.random() * 2 + 1) * (1 + entropy),
        color: getEtchColor(entropy)
      });
    }

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, [entropy]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

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

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw points
      for (let i = pointsRef.current.length - 1; i >= 0; i--) {
        const p = pointsRef.current[i];
        p.life -= 0.015 + (entropy * 0.01); // Decay faster at high entropy
        p.x += p.vx;
        p.y += p.vy;

        if (p.life <= 0) {
          pointsRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.life * 0.6})`;
        ctx.fill();
        
        // Connect nearby points for "web" effect at low entropy
        if (entropy < 0.4 && i > 0) {
            const prev = pointsRef.current[i-1];
            const dist = Math.hypot(p.x - prev.x, p.y - prev.y);
            if (dist < 20) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(prev.x, prev.y);
                ctx.strokeStyle = `${p.color} ${p.life * 0.2})`;
                ctx.stroke();
            }
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [entropy]);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default VoidEtchingOverlay;
