
import React, { useRef, useEffect, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number; // depth for parallax
  size: number;
  speed: number;
  opacity: number;
  hue: number;
}

export const ParallaxParticles: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Initialize particles
    const count = 70;
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 0.5 + 0.1, // Depth factor (parallax strength)
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.2, // Base downward flow speed
      opacity: Math.random() * 0.4 + 0.1,
      hue: Math.random() > 0.5 ? 190 : 260, // Cyan or Indigo-Violet
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';
      
      timeRef.current += 1;

      particles.current.forEach(p => {
        // Vertical drift (time based) + scroll parallax
        // Flowing downward means Y increasing over time
        const flowOffset = timeRef.current * p.speed;
        const scrollOffset = scrollY * p.z;
        
        const rawY = p.y + flowOffset - scrollOffset;
        const drawY = ((rawY % canvas.height) + canvas.height) % canvas.height;
        
        // Horizontal oscillation (very subtle)
        const drawX = p.x + Math.sin(timeRef.current * 0.01 * p.speed) * 15;

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
        
        // Only apply blur to larger particles for performance
        if (p.size > 1.5) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = `hsla(${p.hue}, 80%, 70%, 0.8)`;
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Constellation connections at low scroll depth
        if (scrollY < 200) {
            const connectionThreshold = 120;
            particles.current.forEach(p2 => {
               // Sub-sampling or proximity check
               const dX = p2.x - p.x;
               const dY = p2.y - p.y;
               const dist = Math.sqrt(dX*dX + dY*dY);
               
               if (dist < connectionThreshold && dist > 0) {
                   const p2DrawY = (((p2.y + timeRef.current * p2.speed - scrollY * p2.z) % canvas.height) + canvas.height) % canvas.height;
                   const p2DrawX = p2.x + Math.sin(timeRef.current * 0.01 * p2.speed) * 15;
                   
                   ctx.beginPath();
                   ctx.moveTo(drawX, drawY);
                   ctx.lineTo(p2DrawX, p2DrawY);
                   // Fade lines based on distance and scroll depth
                   const lineOpacity = (0.08 * (1 - dist/connectionThreshold)) * (1 - scrollY/200);
                   ctx.strokeStyle = `hsla(${p.hue}, 80%, 70%, ${lineOpacity})`;
                   ctx.lineWidth = 0.5;
                   ctx.stroke();
               }
            });
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [scrollY]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: Math.max(0.2, 1 - scrollY / 1500) }}
    />
  );
};
