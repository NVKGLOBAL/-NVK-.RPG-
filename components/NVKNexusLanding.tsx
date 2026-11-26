import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NexusAtmosphereCanvas } from './visuals/NexusAtmosphereCanvas';
import { NexusCursor } from './visuals/NexusCursor';
import { globalSoundEngine } from '../lib/SoundEngine';
import { useSovereignAI } from '../context/SovereignAIContext';

interface NVKNexusLandingProps {
  onEnterEcosystem: () => void;
  onOpenAISettings?: () => void;
  hasExistingProfile?: boolean;
}

export const NVKNexusLanding: React.FC<NVKNexusLandingProps> = ({
  onEnterEcosystem,
  onOpenAISettings,
  hasExistingProfile = false,
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [activeChapter, setActiveChapter] = useState('01');
  const [negentropySlider, setNegentropySlider] = useState(0.85);
  const [aiDemoPrompt, setAiDemoPrompt] = useState('Weave an ancient starborn axiom of sovereign intelligence.');
  const [aiDemoOutput, setAiDemoOutput] = useState<string | null>(null);
  const [isAiDemoGenerating, setIsAiDemoGenerating] = useState(false);

  const { invokeAI, selectedModelId } = useSovereignAI();
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll position for spatial layers and active chapter detection
  useEffect(() => {
    const handleScroll = () => {
      const pos = window.scrollY;
      setScrollY(pos);

      // Identify active chapter based on scroll depth
      const chapters = [
        { id: '01', el: document.getElementById('chapter-01') },
        { id: '02', el: document.getElementById('chapter-02') },
        { id: '03', el: document.getElementById('chapter-03') },
        { id: '04', el: document.getElementById('chapter-04') },
        { id: '05', el: document.getElementById('chapter-05') },
        { id: '06', el: document.getElementById('chapter-06') },
        { id: '07', el: document.getElementById('chapter-07') },
        { id: '08', el: document.getElementById('chapter-08') },
      ];

      for (let i = chapters.length - 1; i >= 0; i--) {
        const item = chapters[i];
        if (item.el) {
          const rect = item.el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4) {
            setActiveChapter(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAudioAmbience = useCallback(() => {
    if (!isAudioActive) {
      globalSoundEngine.toggleMute(false);
      globalSoundEngine.playSFX('pulse');
      globalSoundEngine.playUIFeedback('hover');
      setIsAudioActive(true);
    } else {
      globalSoundEngine.toggleMute(true);
      setIsAudioActive(false);
    }
  }, [isAudioActive]);

  const handleTestAiSim = async () => {
    setIsAiDemoGenerating(true);
    globalSoundEngine.playUIFeedback('click');
    try {
      const response = await invokeAI(
        aiDemoPrompt,
        "You are the NVK Sovereign Intelligence Oracle. Speak in concise, profound cosmic aphorisms (max 2 sentences)."
      );
      setAiDemoOutput(response || "The signals converge into sovereign clarity.");
      globalSoundEngine.playSFX('success');
    } catch {
      setAiDemoOutput("The signals converge into sovereign clarity across all nodes.");
    } finally {
      setIsAiDemoGenerating(false);
    }
  };

  const scrollToChapter = (chapterId: string) => {
    globalSoundEngine.playUIFeedback('click');
    const target = document.getElementById(`chapter-${chapterId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* LAYER 3: Progressive Canvas & Ambient Field (Zero Blocking) */}
      <NexusAtmosphereCanvas 
        scrollY={scrollY} 
        activeCluster={activeCluster} 
        cursorPos={cursorPos} 
      />

      {/* Luxury Luminous Cursor on Desktop */}
      <NexusCursor onPositionUpdate={setCursorPos} />

      {/* LAYER 0 & 1: Critical Header & Spatial HUD */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-indigo-500/20 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-all duration-300">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-cinzel font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            🜂
          </div>
          <div>
            <span className="font-cinzel font-bold text-sm tracking-[0.25em] text-white flex items-center gap-1.5">
              NVK GLOBAL<span className="text-cyan-400 text-xs">™</span>
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block -mt-0.5">
              THE NEXUS ARCHITECTURE
            </span>
          </div>
        </div>

        {/* Chapter Quick Nav Pills (Desktop) */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-full text-xs font-mono">
          {[
            { id: '01', name: 'Nexus' },
            { id: '02', name: 'Intelligence' },
            { id: '03', name: 'Technology' },
            { id: '04', name: 'Commerce' },
            { id: '05', name: 'Energy' },
            { id: '06', name: 'Creation' },
            { id: '07', name: 'Network' },
            { id: '08', name: 'Gateway' },
          ].map((chap) => (
            <button
              key={chap.id}
              onClick={() => scrollToChapter(chap.id)}
              className={`px-3 py-1 rounded-full transition-all duration-200 ${
                activeChapter === chap.id
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {chap.id} {chap.name}
            </button>
          ))}
        </nav>

        {/* Right HUD Controls */}
        <div className="flex items-center gap-2.5">
          {/* Audio Ambience Toggle */}
          <button
            onClick={toggleAudioAmbience}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition ${
              isAudioActive
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Ambient Audio Pulse"
          >
            <i className={`ri-volume-${isAudioActive ? 'up-line text-emerald-400' : 'mute-line'}`}></i>
            <span className="hidden sm:inline font-mono text-[10px]">{isAudioActive ? 'AUDIO: ON' : 'AUDIO: MUTED'}</span>
          </button>

          {/* AI Settings trigger */}
          {onOpenAISettings && (
            <button
              onClick={onOpenAISettings}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 text-xs flex items-center gap-1.5 transition"
              title="Configure AI Model & Keys"
            >
              <i className="ri-cpu-line text-indigo-400"></i>
              <span className="hidden sm:inline font-mono text-[10px] uppercase">AI Model</span>
            </button>
          )}

          {/* Magnetic Primary CTA */}
          <button
            onClick={onEnterEcosystem}
            className="magnetic-target px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-cinzel font-bold text-xs tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center gap-1.5"
          >
            <span>{hasExistingProfile ? 'RESUME CODEX' : 'ENTER ECOSYSTEM'}</span>
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      </header>

      {/* MAIN SPATIAL CHAPTERS */}
      <main className="relative z-10 pt-20">

        {/* ======================================================== */}
        {/* CHAPTER 01 — ENTER THE NEXUS (HERO)                      */}
        {/* ======================================================== */}
        <section
          id="chapter-01"
          className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative py-20"
        >
          {/* Subtle Central Intelligence Geometric Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[550px] lg:w-[700px] h-[350px] sm:h-[550px] lg:h-[700px] rounded-full border border-cyan-500/10 pointer-events-none -z-10 animate-pulse-slow">
            <div className="absolute inset-8 rounded-full border border-indigo-500/10 animate-spin-slow"></div>
            <div className="absolute inset-20 rounded-full border border-purple-500/10"></div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Supertitle */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-widest uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              The Operating System for Reality
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-cinzel font-bold tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              ENTER THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">NVK NEXUS</span>
            </h1>

            {/* Tagline */}
            <p className="text-lg sm:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
              Where sovereign intelligence, decentralized protocol, procedural lore, and human consciousness converge.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onEnterEcosystem}
                className="magnetic-target w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-cinzel font-bold text-base tracking-widest uppercase transition-all duration-300 shadow-[0_0_35px_rgba(6,182,212,0.5)] hover:scale-105 flex items-center justify-center gap-3"
              >
                <i className="ri-shield-flash-line text-lg"></i>
                <span>ENTER THE ECOSYSTEM</span>
                <i className="ri-arrow-right-line"></i>
              </button>

              <button
                onClick={() => scrollToChapter('02')}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-slate-200 font-mono text-xs tracking-wider transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>EXPLORE ARCHITECTURE</span>
                <i className="ri-arrow-down-line text-cyan-400"></i>
              </button>
            </div>

            {/* Fast Telemetry Metrics Ribbon */}
            <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
              {[
                { label: 'SOVEREIGN NODE', value: 'ACTIVE // Δ.2.3', icon: 'ri-cpu-line', color: 'text-cyan-400' },
                { label: 'INFERENCE BRIDGE', value: `${selectedModelId.split('-').slice(0, 2).join(' ')}`, icon: 'ri-flashlight-line', color: 'text-indigo-400' },
                { label: 'DECENTRALIZED STATE', value: 'INDEXED DB + WEB3', icon: 'ri-database-2-line', color: 'text-purple-400' },
                { label: 'LATENCY PROFILE', value: 'INSTANT // ZERO-BLOCK', icon: 'ri-speed-up-line', color: 'text-emerald-400' },
              ].map((metric, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-1">
                    <i className={`${metric.icon} ${metric.color}`}></i>
                    <span>{metric.label}</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-100 uppercase">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* CHAPTER 02 — INTELLIGENCE                                */}
        {/* ======================================================== */}
        <section
          id="chapter-02"
          onMouseEnter={() => setActiveCluster('intelligence')}
          onMouseLeave={() => setActiveCluster(null)}
          className="min-h-screen py-24 px-4 max-w-6xl mx-auto flex flex-col justify-center"
        >
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">CHAPTER 02 // NEURAL FABRIC</span>
            <h2 className="text-3xl sm:text-5xl font-cinzel font-bold text-white">
              SOVEREIGN <span className="text-cyan-400">INTELLIGENCE</span>
            </h2>
            <p className="text-slate-400 max-w-2xl text-sm sm:text-base">
              Autonomous reasoning engines operating without vendor lock-in. Powered by multi-model agility, local inference, and contextual memory wefts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Pillar Cards */}
            <div className="lg:col-span-7 space-y-4">
              {[
                {
                  title: 'CODEXA Neural Engine',
                  desc: 'Multi-turn autonomous arbitration for procedural character lore, dynamic combat resolution, and state-machine mutation.',
                  icon: 'ri-brain-line',
                  badge: 'Core Scribe',
                },
                {
                  title: 'Model Agnostic Architecture',
                  desc: 'Instantly swap between the local Sovereign Procedural Engine, Ollama/Local runtimes, Pollinations open inference, or custom models without touching code.',
                  icon: 'ri-shuffle-line',
                  badge: 'Swappable',
                },
                {
                  title: 'Starborn AI Memory Weft',
                  desc: 'Persistent semantic embeddings and procedural historical event logging stored locally inside your browser client.',
                  icon: 'ri-archive-line',
                  badge: 'Zero Telemetry',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition">
                        <i className={`${item.icon} text-lg`}></i>
                      </div>
                      <h3 className="font-bold text-slate-100">{item.title}</h3>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-11">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Right Interactive AI Oracle Terminal */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-mono font-bold text-slate-200">LIVE ORACLE TRANSMISSION</span>
                </div>
                <span className="text-[10px] font-mono text-indigo-400">{selectedModelId}</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400">INPUT INTENT PROMPT:</label>
                  <input
                    type="text"
                    value={aiDemoPrompt}
                    onChange={(e) => setAiDemoPrompt(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <button
                  onClick={handleTestAiSim}
                  disabled={isAiDemoGenerating}
                  className="w-full py-2.5 rounded-lg bg-indigo-600/60 hover:bg-indigo-600 text-xs font-mono font-bold text-white transition border border-indigo-500/40 flex items-center justify-center gap-2"
                >
                  {isAiDemoGenerating ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-cyan-400"></i>
                      <span>ORACLE TRANSMITTING...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-flashlight-line text-cyan-400"></i>
                      <span>INVOKE INTELLIGENCE MATRIX</span>
                    </>
                  )}
                </button>

                {aiDemoOutput && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-200 leading-relaxed animate-fadeInUp">
                    <span className="text-[10px] text-slate-500 block mb-1">ORACLE RESPONSE //</span>
                    "{aiDemoOutput}"
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* CHAPTER 03 — TECHNOLOGY                                  */}
        {/* ======================================================== */}
        <section
          id="chapter-03"
          onMouseEnter={() => setActiveCluster('technology')}
          onMouseLeave={() => setActiveCluster(null)}
          className="min-h-screen py-24 px-4 max-w-6xl mx-auto flex flex-col justify-center border-t border-slate-900"
        >
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">CHAPTER 03 // ARCHITECTURE</span>
            <h2 className="text-3xl sm:text-5xl font-cinzel font-bold text-white">
              THE <span className="text-indigo-400">SPATIAL KERNEL</span>
            </h2>
            <p className="text-slate-400 max-w-2xl text-sm sm:text-base">
              A high-performance client runtime unifying Web3 cryptographic proofs, IndexedDB offline state, and Web Audio procedural synthesis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Dexie Multi-Slot Matrix',
                desc: 'Zero data loss. Comprehensive multi-slot IndexedDB storage allowing complete export, import, and hydration of complex character graphs.',
                code: 'IndexedDB // Local First',
                icon: 'ri-server-line',
              },
              {
                title: 'Web3 Somatic Covenant',
                desc: 'EVM wallet integration with cryptographic personal message signing (personal_sign) and local soul-seal identity generation.',
                code: 'Ethereum // Sovereign Proof',
                icon: 'ri-shield-keyhole-line',
              },
              {
                title: 'Procedural Audio Synth',
                desc: 'Dynamic harmonic oscillators tuned to real-time system entropy. Atmospheric acoustic feedback without bulky audio assets.',
                code: 'Web Audio API // Sine Synthesis',
                icon: 'ri-sound-module-line',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition">
                    <i className={`${card.icon} text-xl`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{card.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
                <div className="pt-6 mt-4 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">{card.code}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* CHAPTER 04 — COMMERCE & SOVEREIGN ASSETS                 */}
        {/* ======================================================== */}
        <section
          id="chapter-04"
          onMouseEnter={() => setActiveCluster('commerce')}
          onMouseLeave={() => setActiveCluster(null)}
          className="min-h-screen py-24 px-4 max-w-6xl mx-auto flex flex-col justify-center border-t border-slate-900"
        >
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">CHAPTER 04 // PROTOCOL</span>
            <h2 className="text-3xl sm:text-5xl font-cinzel font-bold text-white">
              SOVEREIGN <span className="text-purple-400">COMMERCE</span>
            </h2>
            <p className="text-slate-400 max-w-2xl text-sm sm:text-base">
              Digital artifacts, soul-sealed character shards, and alchemically synthesized relics that belong entirely to the user.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Seeker Character Shard',
                type: 'SOUL-SEALED IDENTITY',
                desc: 'Over 50 somatic categories, alchemical class matrices, and high-fidelity generative visual cards.',
                rarity: 'Legendary',
                glow: 'border-purple-500/40 bg-purple-950/20',
              },
              {
                title: 'Mutator Loom Artifact',
                type: 'ALCHEMICAL RELIC',
                desc: 'Synthesized abilities derived from node connection lattices and entropy injections.',
                rarity: 'Mythic',
                glow: 'border-cyan-500/40 bg-cyan-950/20',
              },
              {
                title: 'Chronicle Reliquary',
                type: 'DECENTRALIZED PROOF',
                desc: 'Immutable story branches and campaign milestones serialized for cross-universe execution.',
                rarity: 'Ancient',
                glow: 'border-emerald-500/40 bg-emerald-950/20',
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border ${item.glow} backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 shadow-xl relative overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{item.type}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-purple-300">
                    {item.rarity}
                  </span>
                </div>
                <h3 className="text-lg font-cinzel font-bold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{item.desc}</p>
                <button
                  onClick={onEnterEcosystem}
                  className="w-full py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <span>Synthesize in Loom</span>
                  <i className="ri-arrow-right-up-line"></i>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* CHAPTER 05 — ENERGY & NEGENTROPY                         */}
        {/* ======================================================== */}
        <section
          id="chapter-05"
          onMouseEnter={() => setActiveCluster('energy')}
          onMouseLeave={() => setActiveCluster(null)}
          className="min-h-screen py-24 px-4 max-w-6xl mx-auto flex flex-col justify-center border-t border-slate-900"
        >
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">CHAPTER 05 // EQUILIBRIUM</span>
            <h2 className="text-3xl sm:text-5xl font-cinzel font-bold text-white">
              ENERGY & <span className="text-emerald-400">NEGENTROPY</span>
            </h2>
            <p className="text-slate-400 max-w-2xl text-sm sm:text-base">
              The balance of order and chaos. Dynamic negentropy cycles that modulate visual distortion, sound frequency, and narrative risk.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-emerald-500/30 backdrop-blur-md space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Harmonic Negentropy Attunement</h3>
                <p className="text-xs text-slate-400">Adjust the harmonic flux to observe the system equilibrium.</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-mono font-bold text-emerald-400">{(negentropySlider * 100).toFixed(0)}%</span>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">STABILITY FACTOR</span>
              </div>
            </div>

            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={negentropySlider}
              onChange={(e) => setNegentropySlider(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">ACOUSTIC HARMONICS</span>
                <span className="text-xs font-mono text-slate-200">{(432 * negentropySlider).toFixed(1)} Hz Resonance</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">CHALICE DISPERSION</span>
                <span className="text-xs font-mono text-slate-200">{negentropySlider > 0.6 ? 'Laminar Coherence' : 'Turbulent Cascade'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">SYSTEM ENTROPY</span>
                <span className="text-xs font-mono text-emerald-300">{((1 - negentropySlider) * 100).toFixed(0)}% Noise</span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* CHAPTER 06 — CREATION & SYNTHESIS                        */}
        {/* ======================================================== */}
        <section
          id="chapter-06"
          onMouseEnter={() => setActiveCluster('creation')}
          onMouseLeave={() => setActiveCluster(null)}
          className="min-h-screen py-24 px-4 max-w-6xl mx-auto flex flex-col justify-center border-t border-slate-900"
        >
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">CHAPTER 06 // SYNTHESIS</span>
            <h2 className="text-3xl sm:text-5xl font-cinzel font-bold text-white">
              THE CREATIVE <span className="text-amber-400">LOOM</span>
            </h2>
            <p className="text-slate-400 max-w-2xl text-sm sm:text-base">
              A multimodal studio combining procedural text generation, algorithmic glyph composition, and neural diffusion imagery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <i className="ri-magic-line text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Mutator Glyph Composer</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Drag, arrange, and link alchemical nodes on a node graph. Synthesize unique composite spells, passive traits, and anomaly cures.
              </p>
              <button
                onClick={onEnterEcosystem}
                className="text-xs font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1"
              >
                <span>Launch Mutator Loom</span>
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <i className="ri-image-line text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Multimodal Visual Diffusion</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Generate character portraits and environmental concept art directly with Imagen 3 and zero-crash deterministic fallback streams.
              </p>
              <button
                onClick={onEnterEcosystem}
                className="text-xs font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1"
              >
                <span>Open Genesis Chamber</span>
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* CHAPTER 07 — THE NETWORK CONVERGENCE                     */}
        {/* ======================================================== */}
        <section
          id="chapter-07"
          onMouseEnter={() => setActiveCluster('network')}
          onMouseLeave={() => setActiveCluster(null)}
          className="min-h-screen py-24 px-4 max-w-6xl mx-auto flex flex-col justify-center border-t border-slate-900"
        >
          <div className="space-y-4 mb-12 text-center">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">CHAPTER 07 // CONVERGENCE</span>
            <h2 className="text-3xl sm:text-5xl font-cinzel font-bold text-white">
              THE <span className="text-cyan-400">NETWORK MATRIX</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Every pillar is connected. Hover over any ecosystem node to route neural signals across the global canvas.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { id: 'intelligence', name: 'INTELLIGENCE', icon: 'ri-brain-line', color: 'border-cyan-500/40 text-cyan-300' },
              { id: 'technology', name: 'TECHNOLOGY', icon: 'ri-cpu-line', color: 'border-indigo-500/40 text-indigo-300' },
              { id: 'commerce', name: 'COMMERCE', icon: 'ri-coin-line', color: 'border-purple-500/40 text-purple-300' },
              { id: 'energy', name: 'ENERGY', icon: 'ri-flashlight-line', color: 'border-emerald-500/40 text-emerald-300' },
              { id: 'creation', name: 'CREATION', icon: 'ri-palette-line', color: 'border-amber-500/40 text-amber-300' },
              { id: 'nexus', name: 'THE NEXUS', icon: 'ri-radar-line', color: 'border-sky-500/40 text-sky-300' },
            ].map((node) => (
              <button
                key={node.id}
                onMouseEnter={() => setActiveCluster(node.id)}
                onClick={() => {
                  if (node.id === 'nexus') scrollToChapter('08');
                  else scrollToChapter(node.id === 'intelligence' ? '02' : node.id === 'technology' ? '03' : node.id === 'commerce' ? '04' : node.id === 'energy' ? '05' : '06');
                }}
                className={`p-6 rounded-2xl bg-slate-900/70 border ${node.color} transition-all duration-300 hover:scale-105 hover:bg-slate-800 flex flex-col items-center justify-center gap-3 text-center`}
              >
                <i className={`${node.icon} text-2xl`}></i>
                <span className="font-cinzel font-bold text-xs tracking-wider">{node.name}</span>
                <span className="text-[9px] font-mono text-slate-500 uppercase">NODE ACTIVE</span>
              </button>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* CHAPTER 08 — THE NEXUS GATEWAY (FINAL CTA)               */}
        {/* ======================================================== */}
        <section
          id="chapter-08"
          className="min-h-screen py-32 px-4 flex flex-col items-center justify-center text-center border-t border-slate-900 relative"
        >
          <div className="max-w-3xl mx-auto space-y-8 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 border border-cyan-300/40 mx-auto flex items-center justify-center text-slate-950 text-2xl font-bold font-cinzel shadow-[0_0_40px_rgba(6,182,212,0.6)]">
              🜂
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-cinzel font-bold text-white tracking-tight">
                ENTER THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">ECOSYSTEM</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Initialize your Seeker profile, weave mutator nodes, explore procedural RPG realms, and bind your sovereign identity.
              </p>
            </div>

            <button
              onClick={onEnterEcosystem}
              className="magnetic-target px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-cinzel font-bold text-lg tracking-widest uppercase transition-all duration-300 shadow-[0_0_45px_rgba(6,182,212,0.6)] hover:scale-105 flex items-center justify-center gap-3 mx-auto"
            >
              <i className="ri-shield-flash-line text-xl"></i>
              <span>{hasExistingProfile ? 'ENTER ACTIVE SIMULATION' : 'INITIALIZE SOVEREIGN SHARD'}</span>
              <i className="ri-arrow-right-line text-xl"></i>
            </button>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-4">
              <span className="flex items-center gap-1.5"><i className="ri-check-line text-cyan-400"></i> No Sign-Up Required</span>
              <span className="flex items-center gap-1.5"><i className="ri-check-line text-cyan-400"></i> Local-First Privacy</span>
              <span className="flex items-center gap-1.5"><i className="ri-check-line text-cyan-400"></i> 100% Free & Open</span>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 px-6 py-12 text-slate-400 text-xs font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-cinzel font-bold text-sm text-slate-200">NVK GLOBAL™ // TRI-SOPHIAN CODEX</div>
            <div>Network. Visualize. Knowledge. Experience The Future Today™</div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-slate-400 hover:text-cyan-300 transition flex items-center gap-1"
            >
              <i className="ri-arrow-up-line"></i> Top
            </button>
            <button
              onClick={onEnterEcosystem}
              className="text-cyan-400 hover:text-cyan-300 font-bold transition"
            >
              Launch App →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NVKNexusLanding;
