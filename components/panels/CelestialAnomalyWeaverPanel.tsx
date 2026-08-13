
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { AgentName, HistoricalEventType, type CelestialAnomalyWeaverPanelProps, type HistoricalCelestialAnomalyEventData } from '../../types';
import { AGENT_PROFILES } from '../../constants';
import { Button } from '../ui/Button';

const STAR_RADIUS = 5;
const PLANET_C_RADIUS = 2.5; 
const SIBLING_PLANET_RADIUS = 1.5;
const ORBIT_SEGMENTS = 128;

const CelestialAnomalyWeaverPanel: React.FC<CelestialAnomalyWeaverPanelProps> = ({
  width: propWidth,
  height: propHeight,
  addEchoMessage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const planetCRef = useRef<THREE.Mesh | null>(null);
  const siblingPlanetRef = useRef<THREE.Mesh | null>(null);
  const starRef = useRef<THREE.Mesh | null>(null);
  
  const [showMythicGlyphs, setShowMythicGlyphs] = useState(false);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const w = currentMount.clientWidth || 300;
    const h = currentMount.clientHeight || 300;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 15, 35);
    camera.lookAt(new THREE.Vector3(0,0,0));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x404060, 1));
    const pointLight = new THREE.PointLight(0xffffff, 2, 200);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    const star = new THREE.Mesh(
      new THREE.SphereGeometry(STAR_RADIUS, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0xffccaa, emissive: 0xffaa88, emissiveIntensity: 0.6, shininess: 50 })
    );
    starRef.current = star;
    scene.add(star);
    
    const planetC = new THREE.Mesh(
      new THREE.SphereGeometry(PLANET_C_RADIUS, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x6080a0, shininess: 20 })
    );
    planetCRef.current = planetC;
    scene.add(planetC);

    const siblingPlanet = new THREE.Mesh(
      new THREE.SphereGeometry(SIBLING_PLANET_RADIUS, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0xa0a080 })
    );
    siblingPlanetRef.current = siblingPlanet;
    scene.add(siblingPlanet);

    const createOrbitPath = (a: number, b: number, color: number, rotationY: number = 0) => {
      const curve = new THREE.EllipseCurve(0, 0, a, b, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(ORBIT_SEGMENTS);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 });
      const ellipse = new THREE.Line(geometry, material);
      ellipse.rotation.x = Math.PI / 2;
      ellipse.rotation.y = rotationY;
      return ellipse;
    };

    scene.add(createOrbitPath(25, 20, 0x88aaff));
    scene.add(createOrbitPath(18, 15, 0xaabbaa, Math.PI / 6));

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.0001;

      if (planetCRef.current) {
        planetCRef.current.position.x = Math.cos(time * 0.8) * 25;
        planetCRef.current.position.z = Math.sin(time * 0.8) * 20;
        planetCRef.current.rotation.y += 0.005;
      }
      if (siblingPlanetRef.current) {
        const siblingTime = time * 1.1;
        siblingPlanetRef.current.position.x = Math.cos(siblingTime) * 18 * Math.cos(Math.PI / 6) - Math.sin(siblingTime) * 15 * Math.sin(Math.PI / 6);
        siblingPlanetRef.current.position.z = Math.cos(siblingTime) * 18 * Math.sin(Math.PI / 6) + Math.sin(siblingTime) * 15 * Math.cos(Math.PI / 6);
      }
      if (starRef.current) starRef.current.rotation.y += 0.001;
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      const { width: nw, height: nh } = entries[0].contentRect;
      if (cameraRef.current && rendererRef.current && nw > 0 && nh > 0) {
        cameraRef.current.aspect = nw / nh;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(nw, nh);
      }
    });
    if (currentMount) resizeObserver.observe(currentMount);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      rendererRef.current?.dispose();
    };
  }, [showMythicGlyphs]);

  const handleActivateGlyphStone = () => {
    addEchoMessage(AgentName.CelestialAnomalyWeaverAgent, "Frozen glyph-stone activated. Thermal shockwave propagating...", AGENT_PROFILES[AgentName.CelestialAnomalyWeaverAgent]?.colorClass);
  };

  const handleGazeIntoMirror = () => {
    setShowMythicGlyphs(prev => !prev);
    addEchoMessage(AgentName.CelestialAnomalyWeaverAgent, `Infrared mirror gaze ${!showMythicGlyphs ? 'engaged' : 'disengaged'}.`, AGENT_PROFILES[AgentName.CelestialAnomalyWeaverAgent]?.colorClass);
  };

  return (
    <div ref={containerRef} className="celestial-anomaly-weaver-panel bg-slate-950/90 backdrop-blur-xl border border-indigo-600/50 rounded-xl shadow-2xl p-3 text-slate-100 flex flex-col" style={{ width: propWidth, height: propHeight }}>
      <h3 className="text-lg font-cinzel font-bold text-indigo-300 mb-2 text-center tracking-wider">
        Δ.Θ8 Celestial Anomaly Weaver: 14 Herculis
      </h3>
      <div ref={mountRef} className="flex-grow relative border border-indigo-500/30 rounded-md overflow-hidden bg-black" />
      <div className="controls-area flex justify-center items-center gap-2 p-1.5 mt-1 bg-slate-800/50 rounded-md border-t border-indigo-700/30 text-[10px]">
        <Button onClick={handleActivateGlyphStone} className="py-1 px-2 text-[10px] bg-sky-600 hover:bg-sky-500">Activate Stone</Button>
        <Button onClick={handleGazeIntoMirror} className={`py-1 px-2 text-[10px] ${showMythicGlyphs ? 'bg-purple-600' : 'bg-slate-600'}`}>Infrared Gaze</Button>
      </div>
    </div>
  );
};

export default CelestialAnomalyWeaverPanel;
