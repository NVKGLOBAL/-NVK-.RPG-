import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
// Add missing import for motion
import { motion } from 'framer-motion';
import { AgentName, HistoricalEventType, type HistoricalEmeraldTabletDecryptionEventData } from '../../types';
import { AGENT_PROFILES } from '../../constants';
import { Button } from '../ui/Button';

interface EmeraldTabletDecryptionPanelProps {
  currentSystemEntropy: number;
  currentEleganceIndex: number;
  addEchoMessage: (source: AgentName | string, text: string, colorClass?: string, isAutoEcho?: boolean, meta?: Record<string, any>) => void;
  width: string | number;
  height: string | number;
}

type DecryptionPhase = 
  | "IDLE"
  | "SCANNING_QUARTZ"
  | "RESONATING_TABLET"
  | "RECORDING_EMISSIONS"
  | "CONVERTING_PEPTIDES"
  | "MAPPING_LIBRARIES"
  | "ALIGNING_CONJUNCTION"
  | "SIMULATING_TIMEFOLDING"
  | "INTEGRATING_FRAGMENT_STARS"
  | "CALCULATING_COHERENCE"
  | "DECRYPTION_COMPLETE"
  | "ERROR_STATE";

const GLYPH_EMISSIONS_DATA = [
    { symbol: '𓂀', name: 'Triforce Vortex', desc: 'Quantum Entanglement' },
    { symbol: '⎔', name: 'Pulsing Dodecahedrons', desc: 'Spacetime Lattice' },
    { symbol: '🌀', name: 'Singularity Spiral', desc: 'Black Hole Resonance' },
    { symbol: '⎌', name: 'Copper Waveguides', desc: 'EM Field Containment' }
];

const INITIAL_FRAGMENT_STARS_RECOVERY = 12;
const INITIAL_TOTAL_COHERENCE = 71.4;

const EmeraldTabletDecryptionPanel: React.FC<EmeraldTabletDecryptionPanelProps> = ({
  currentSystemEntropy,
  currentEleganceIndex,
  addEchoMessage,
  width,
  height
}) => {
  const [currentPhase, setCurrentPhase] = useState<DecryptionPhase>("IDLE");
  const [phaseProgress, setPhaseProgress] = useState(0); 
  const [fragmentStarsRecovery, setFragmentStarsRecovery] = useState(INITIAL_FRAGMENT_STARS_RECOVERY);
  const [totalCoherence, setTotalCoherence] = useState(INITIAL_TOTAL_COHERENCE);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const threeContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const quartzRef = useRef<THREE.Mesh | null>(null);
  const activeGsapTweensRef = useRef<gsap.core.Tween[]>([]);

  const phaseDetails = useMemo(() => ({
    IDLE: { duration: 0, next: "SCANNING_QUARTZ", label: "IDLE", starsTarget: 12, coherenceTarget: 71 },
    SCANNING_QUARTZ: { duration: 2000, next: "RESONATING_TABLET", label: "SCANNING", starsTarget: 20, coherenceTarget: 72 },
    RESONATING_TABLET: { duration: 1500, next: "DECRYPTION_COMPLETE", label: "RESONATING", starsTarget: 100, coherenceTarget: 84 },
    DECRYPTION_COMPLETE: { duration: 0, next: null, label: "COMPLETE", starsTarget: 100, coherenceTarget: 84 },
  }), []);

  useEffect(() => {
    const container = threeContainerRef.current;
    if (!container) return;

    const w = container.clientWidth || 300;
    const h = 300; 

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const quartz = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0xd8bfd8, transparent: true, opacity: 0.7 }));
    quartzRef.current = quartz;
    scene.add(quartz);
    scene.add(new THREE.AmbientLight(0x404040));
    const light = new THREE.PointLight(0xffffff, 1); light.position.set(5, 5, 5); scene.add(light);

    const animate = () => {
        if (!rendererRef.current) return;
        requestAnimationFrame(animate);
        if (quartzRef.current) { quartzRef.current.rotation.x += 0.01; quartzRef.current.rotation.y += 0.01; }
        rendererRef.current.render(scene, camera);
    };
    animate();

    const resize = () => {
        if (!container || !cameraRef.current || !rendererRef.current) return;
        const nw = container.clientWidth;
        cameraRef.current.aspect = nw / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(nw, h);
    };
    window.addEventListener('resize', resize);
    return () => {
        window.removeEventListener('resize', resize);
        rendererRef.current?.dispose();
    };
  }, []);

  const handleIgnite = () => {
      setIsDecrypting(true);
      setCurrentPhase("SCANNING_QUARTZ");
      addEchoMessage(AgentName.EmeraldTablet, "Igniting Tablet...", AGENT_PROFILES[AgentName.EmeraldTablet]?.colorClass);
  };

  return (
    <div className="flex flex-col bg-slate-950 border border-emerald-500/50 rounded-2xl shadow-2xl p-4 text-slate-100 my-4 w-full">
      <div className="text-center mb-4">
        <h3 className="text-xl font-cinzel font-bold text-emerald-300 uppercase tracking-widest">Emerald Tablet AX.Θ8</h3>
      </div>
      
      <div className="flex flex-col gap-4">
        <div ref={threeContainerRef} className="w-full h-[300px] bg-black/40 rounded-xl overflow-hidden border border-white/5" />
        
        <div className="grid grid-cols-2 gap-2">
            {GLYPH_EMISSIONS_DATA.map(g => (
                <div key={g.name} className="p-3 bg-slate-900/60 rounded-xl border border-white/5 text-center">
                    <div className="text-2xl text-emerald-400 mb-1">{g.symbol}</div>
                    <div className="text-[10px] font-bold uppercase text-slate-300">{g.name}</div>
                </div>
            ))}
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3">
             <div className="flex justify-between text-[10px] font-mono uppercase text-slate-400">
                <span>Decryption Pulse</span>
                <span className="text-emerald-400">{fragmentStarsRecovery.toFixed(1)}%</span>
             </div>
             <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${fragmentStarsRecovery}%` }} className="h-full bg-emerald-500" />
             </div>
             <div className="flex justify-between text-[10px] font-mono uppercase text-slate-400">
                <span>Coherence</span>
                <span className="text-cyan-400">{totalCoherence.toFixed(1)}%</span>
             </div>
             <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${totalCoherence}%` }} className="h-full bg-cyan-500" />
             </div>
        </div>

        <Button onClick={handleIgnite} disabled={isDecrypting} className="w-full py-4 bg-emerald-600 font-bold text-base tracking-widest rounded-xl">
            {isDecrypting ? 'DECRYPTING...' : 'IGNITE PROTOCOL'}
        </Button>
      </div>
    </div>
  );
};

export default EmeraldTabletDecryptionPanel;