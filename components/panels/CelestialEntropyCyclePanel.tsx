
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Planet } from '../../types'; 
import { useMeasuredDimensions } from '../../hooks/useMeasuredDimensions';

interface CelestialEntropyCyclePanelProps {
  currentEntropy: number;
  width?: number | string;
  height?: number | string;
}

const MAX_PLANETS = 10;
const MIN_PLANETS = 0;
const BASE_SUN_RADIUS_FACTOR = 0.12; 
const BASE_MOON_RADIUS_FACTOR = 0.09; 

const CelestialEntropyCyclePanel: React.FC<CelestialEntropyCyclePanelProps> = ({
  currentEntropy,
  width: propWidth = '100%',
  height: propHeight = 320,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  
  const { width, height, isReady } = useMeasuredDimensions(containerRef);

  const [numPlanetsSetting, setNumPlanetsSetting] = useState(3);
  const [planetSizeFactorSetting, setPlanetSizeFactorSetting] = useState(1);
  const [planets, setPlanets] = useState<Planet[]>([]);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const initializePlanets = useCallback(() => {
    if (!isReady) return;

    const sunX = width / 2;
    const sunY = height / 2;

    const newPlanets: Planet[] = [];
    const maxOrbitRadius = Math.min(sunX, sunY) * 0.85; 

    for (let i = 0; i < numPlanetsSetting; i++) {
      const baseOrbit = maxOrbitRadius * (0.3 + Math.random() * 0.65 * (i + 1) / numPlanetsSetting);
      const entropyOrbitFactor = lerp(1, 0.7 + Math.random() * 0.6, currentEntropy); 

      newPlanets.push({
        id: `planet-${i}-${Date.now()}`,
        orbitRadius: baseOrbit * entropyOrbitFactor,
        currentAngle: Math.random() * Math.PI * 2,
        baseSpeed: (0.001 + Math.random() * 0.003) * (1 / Math.sqrt((i + 1) * 0.5)), 
        baseSize: (Math.random() * 8 + 4) * planetSizeFactorSetting, 
        colorHue: Math.random() * 360,
        textureSeed: Math.random(),
      });
    }
    setPlanets(newPlanets);
  }, [numPlanetsSetting, planetSizeFactorSetting, width, height, isReady, currentEntropy]);

  useEffect(() => {
    initializePlanets();
  }, [initializePlanets]); 

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isReady) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const drawSky = (entropy: number) => {
      let skyColor1: string, skyColor2: string;
      const t = clamp(entropy * 1.5, 0, 1); 

      if (entropy < 0.25) { 
        skyColor1 = `hsl(200, 70%, ${lerp(80, 70, t*4)}%)`; 
        skyColor2 = `hsl(50, 80%, ${lerp(90, 80, t*4)}%)`; 
      } else if (entropy < 0.5) { 
        skyColor1 = `hsl(${lerp(30, 270, (t-0.25)*4)}, 60%, ${lerp(60, 40, (t-0.25)*4)}%)`; 
        skyColor2 = `hsl(${lerp(60, 300, (t-0.25)*4)}, 50%, ${lerp(70, 50, (t-0.25)*4)}%)`; 
      } else if (entropy < 0.75) { 
        skyColor1 = `hsl(240, 50%, ${lerp(30, 15, (t-0.5)*4)}%)`; 
        skyColor2 = `hsl(270, 60%, ${lerp(20, 10, (t-0.5)*4)}%)`; 
      } else { 
        skyColor1 = `hsl(${lerp(0, -30, (t-0.75)*4)}, 40%, ${lerp(10, 5, (t-0.75)*4)}%)`;
        skyColor2 = `hsl(240, 30%, ${lerp(8, 3, (t-0.75)*4)}%)`; 
      }
      
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, skyColor1);
      gradient.addColorStop(1, skyColor2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (entropy > 0.6) {
        const numStars = Math.floor(lerp(0, 150 + entropy * 100, (entropy - 0.6) / 0.4));
        for (let i = 0; i < numStars; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height * 0.8; 
          const size = Math.random() * 1.5 + 0.5;
          const opacity = Math.random() * 0.5 + 0.3 * clamp((entropy - 0.6) / 0.4, 0, 1) * (1 + Math.sin(Date.now() * 0.0005 + i) * 0.3 * entropy); 
          ctx.fillStyle = `rgba(255, 255, 220, ${clamp(opacity,0,1)})`;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.1, size), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawSun = (entropy: number, sunX: number, sunY: number) => {
      const sunRadius = Math.max(1, Math.min(width, height) * BASE_SUN_RADIUS_FACTOR);
      const sunHue = lerp(50, 0, entropy); 
      const sunSaturation = lerp(100, 60, entropy);
      const sunLightness = lerp(70, 30, entropy); 
      const sunAlpha = lerp(1, 0.7, entropy);
      const corePulse = Math.sin(Date.now() * 0.0005) * 0.1 * entropy;

      const calculatedGlowRadius = sunRadius * lerp(1.8, 1.2 + corePulse, entropy);
      const r0_sunGlow = Math.max(0.1, sunRadius * (0.7 + corePulse * 0.5));
      const r1_sunGlow = Math.max(r0_sunGlow, calculatedGlowRadius);
      
      if (Number.isFinite(sunX) && Number.isFinite(sunY) && r1_sunGlow > r0_sunGlow) {
        const sunGlow = ctx.createRadialGradient(sunX, sunY, r0_sunGlow, sunX, sunY, r1_sunGlow);
        sunGlow.addColorStop(0, `hsla(${sunHue}, ${sunSaturation}%, ${sunLightness + 10}%, ${sunAlpha * 0.8})`);
        sunGlow.addColorStop(0.5, `hsla(${sunHue}, ${sunSaturation}%, ${sunLightness}%, ${sunAlpha * 0.4})`);
        sunGlow.addColorStop(1, `hsla(${sunHue}, ${sunSaturation}%, ${sunLightness - 10}%, 0)`);
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, r1_sunGlow, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = `hsla(${sunHue}, ${sunSaturation}%, ${sunLightness}%, ${sunAlpha})`;
      ctx.beginPath();
      ctx.arc(sunX, sunY, Math.max(0.1, sunRadius * (1 + corePulse * 0.3)), 0, Math.PI * 2);
      ctx.fill();

      const numRays = 12;
      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2 + Date.now() * 0.00001 * entropy; 
        const rayLength = sunRadius * lerp(0.8, 0.3, entropy);
        const rayWidth = lerp(5, 2, entropy) * (1 + Math.sin(Date.now()*0.001 + i*0.5) * 0.15 * entropy); 

        const startX = sunX + Math.cos(angle) * sunRadius * (1 + corePulse * 0.3);
        const startY = sunY + Math.sin(angle) * sunRadius * (1 + corePulse * 0.3);
        const endX = sunX + Math.cos(angle) * (sunRadius * (1 + corePulse * 0.3) + rayLength + (entropy > 0.7 ? (Math.random()-0.5)*rayLength*0.6 : 0) );
        const endY = sunY + Math.sin(angle) * (sunRadius * (1 + corePulse * 0.3) + rayLength + (entropy > 0.7 ? (Math.random()-0.5)*rayLength*0.6 : 0) );
        
        if (Number.isFinite(startX) && Number.isFinite(startY) && Number.isFinite(endX) && Number.isFinite(endY)) {
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = `hsla(${sunHue}, ${sunSaturation - 10}%, ${sunLightness + 15}%, ${sunAlpha * lerp(0.6, 0.2, entropy)})`;
          ctx.lineWidth = Math.max(0.1, rayWidth);
          ctx.stroke();
        }
      }
    };

    const drawMoon = (entropy: number) => {
      const moonRadius = Math.max(1, Math.min(width, height) * BASE_MOON_RADIUS_FACTOR);
      const moonOrbitRadius = Math.min(width, height) * 0.35;
      const moonOrbitAngle = Date.now() * 0.0001; 
      const moonX = width / 2 + Math.cos(moonOrbitAngle) * moonOrbitRadius;
      const moonY = height / 2 + Math.sin(moonOrbitAngle) * moonOrbitRadius;

      if (!Number.isFinite(moonX) || !Number.isFinite(moonY)) return;

      const phase = entropy; 
      const moonHue = lerp(200, entropy > 0.8 ? 0 : 45, entropy); 
      const moonSaturation = lerp(20, 50 + entropy * 30 , entropy);
      const moonLightness = lerp(80, 50 - entropy * 20, entropy);
      const moonAlpha = lerp(0.4, 0.9, entropy);

      ctx.save();
      ctx.fillStyle = `hsla(${moonHue}, ${moonSaturation}%, ${moonLightness}%, ${moonAlpha})`;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      if (phase < 1) { 
          ctx.fillStyle = `hsla(${moonHue}, ${moonSaturation-10}%, ${moonLightness - 30}%, ${moonAlpha * 0.9})`; 
          ctx.beginPath();
          const shadowAngleOffset = Math.PI * (1 - phase); 
          ctx.arc(moonX, moonY, moonRadius + 0.5, Math.PI/2 - shadowAngleOffset, Math.PI/2 + shadowAngleOffset, true); 
          ctx.arc(moonX + Math.cos(Math.PI/2 + shadowAngleOffset) * moonRadius * 0.1 , moonY +  Math.sin(Math.PI/2 + shadowAngleOffset) * moonRadius * 0.1, moonRadius, Math.PI/2 + shadowAngleOffset, Math.PI/2 - shadowAngleOffset, false); 
          ctx.closePath();
          ctx.fill();
      }
      
      const r0_moonGlow = Math.max(0.1, moonRadius * 0.8);
      const r1_moonGlow = Math.max(r0_moonGlow, moonRadius * 1.5);
      if (r1_moonGlow > r0_moonGlow) {
        const moonGlow = ctx.createRadialGradient(moonX, moonY, r0_moonGlow, moonX, moonY, r1_moonGlow);
        moonGlow.addColorStop(0, `hsla(${moonHue}, ${moonSaturation}%, ${moonLightness + 10}%, ${moonAlpha * 0.3})`);
        moonGlow.addColorStop(1, `hsla(${moonHue}, ${moonSaturation}%, ${moonLightness}%, 0)`);
        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, r1_moonGlow, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };
    
    const drawPlanets = (entropy: number, sunX: number, sunY: number) => {
      planets.forEach(p => {
        p.currentAngle = (p.currentAngle + p.baseSpeed * lerp(1, 1 + (Math.random()-0.5)*2*entropy, entropy)) % (Math.PI * 2);
        const effectiveSize = Math.max(1, p.baseSize * planetSizeFactorSetting * lerp(1.2, 0.5 + Math.random()*0.7, entropy));
        const effectiveOpacity = lerp(0.9, 0.4 + Math.random()*0.5, entropy);
        const wobbleX = Math.sin(Date.now() * 0.0002 * (p.id.charCodeAt(7)%5 +1)) * entropy * effectiveSize * 0.3;
        const wobbleY = Math.cos(Date.now() * 0.00015 * (p.id.charCodeAt(8)%5 +1)) * entropy * effectiveSize * 0.3;

        if (entropy > 0.7 && Math.random() < entropy * 0.1 && Math.random() < 0.5) return; 

        const x = sunX + Math.cos(p.currentAngle) * p.orbitRadius + wobbleX;
        const y = sunY + Math.sin(p.currentAngle) * p.orbitRadius + wobbleY;

        if (!Number.isFinite(x) || !Number.isFinite(y)) return;

        const planetLightness = lerp(60, 30 + Math.random()*20, entropy);
        const planetSaturation = lerp(70, 40 + Math.random()*30, entropy);

        ctx.fillStyle = `hsla(${p.colorHue}, ${planetSaturation}%, ${planetLightness}%, ${effectiveOpacity})`;
        ctx.beginPath();
        ctx.arc(x, y, effectiveSize, 0, Math.PI * 2);
        ctx.fill();

        if (entropy > 0.8 && effectiveSize > 3) {
            const numFragments = Math.floor(Math.random() * 3) + 2;
            for(let i=0; i < numFragments; i++) {
                const fragX = x + (Math.random() - 0.5) * effectiveSize * 0.8;
                const fragY = y + (Math.random() - 0.5) * effectiveSize * 0.8;
                const fragSize = effectiveSize * (Math.random() * 0.3 + 0.2);
                if (Number.isFinite(fragX) && Number.isFinite(fragY)) {
                  ctx.fillStyle = `hsla(${p.colorHue + (Math.random()-0.5)*40}, ${planetSaturation-10}%, ${planetLightness-10}%, ${effectiveOpacity * 0.7})`;
                  ctx.beginPath();
                  ctx.arc(fragX, fragY, Math.max(0.1, fragSize), 0, Math.PI * 2);
                  ctx.fill();
                }
            }
        }
      });
    };
    
    const render = () => {
      if (!ctx) return;
      drawSky(currentEntropy);
      drawSun(currentEntropy, width/2, height/2);
      drawMoon(currentEntropy); 
      drawPlanets(currentEntropy, width/2, height/2);
      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [currentEntropy, width, height, isReady, planets, planetSizeFactorSetting]);

  const handleNumPlanetsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNumPlanetsSetting(Number(event.target.value));
  };

  const handlePlanetSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlanetSizeFactorSetting(Number(event.target.value));
  };

  return (
    <div ref={containerRef} className="celestial-entropy-cycle-panel bg-slate-950/80 backdrop-blur-md border border-yellow-500/30 rounded-xl shadow-2xl p-6 my-8 text-slate-100 w-full" style={{ height: propHeight }}>
      <h2 className="text-2xl font-['Cinzel'] font-bold mb-4 text-center text-yellow-200 drop-shadow-[0_1px_1px_rgba(255,255,200,0.4)]">
        Celestial Entropy Resonator
      </h2>
      <div className="relative mx-auto mb-6 flex-grow h-[200px]">
        <canvas ref={canvasRef} className="rounded-lg border border-slate-700/30 block w-full h-full" />
      </div>
      <div className="controls-area grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div>
          <label htmlFor="numPlanets" className="block text-xs font-medium text-slate-300 mb-1">Planets: {numPlanetsSetting}</label>
          <input type="range" id="numPlanets" min={MIN_PLANETS} max={MAX_PLANETS} value={numPlanetsSetting} onChange={handleNumPlanetsChange} className="w-full h-2 bg-slate-700 rounded-lg accent-yellow-500" />
        </div>
        <div>
          <label htmlFor="planetSize" className="block text-xs font-medium text-slate-300 mb-1">Scale: {planetSizeFactorSetting.toFixed(1)}x</label>
          <input type="range" id="planetSize" min="0.2" max="2.5" step="0.1" value={planetSizeFactorSetting} onChange={handlePlanetSizeChange} className="w-full h-2 bg-slate-700 rounded-lg accent-yellow-500" />
        </div>
        <div className="flex items-end">
          <button onClick={initializePlanets} className="w-full px-4 py-2 text-sm rounded-button bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-semibold transition-colors">
            Randomize
          </button>
        </div>
      </div>
    </div>
  );
};

export default CelestialEntropyCyclePanel;
