
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { RPGNexusPanelProps, RPGGameState, RPGGameLocation, RPGDynamicAction, MarketItem, SeekerProfile } from '../../types';
import { AgentName, ArtifactType, ArtifactRarity } from '../../types';
import { Button } from '../ui/Button';
import { useGemini } from '../../context/GeminiIntegrationContext';
import { useNarration } from '../../context/NarrationContext';
import { globalSoundEngine } from '../../lib/SoundEngine';
import { motion, AnimatePresence } from 'framer-motion';
import RPGMementoArchivePanel from './RPGMementoArchivePanel';
import { useNotifications } from '../../context/NotificationContext';

// --- Constants ---
const DEFAULT_ACTIONS: RPGDynamicAction[] = [
  { id: 'explore', label: 'Explore Surroundings', type: 'explore', risk: 0.1 },
  { id: 'search', label: 'Search for Artifacts', type: 'explore', risk: 0.2 },
  { id: 'commune', label: 'Commune with Aether', type: 'ritual', risk: 0.3 }
];

interface ScanLocation {
  description: string;
  color: string;
  risk: string;
  icon: string;
  genre: string;
}

const FALLBACK_LOCATIONS: Record<string, ScanLocation> = {
  "Void Echo": {
    description: "A silent chamber echoing with non-existent whispers.",
    color: "text-slate-400",
    risk: "Low",
    icon: "ri-broadcast-line",
    genre: "Cosmic Noir"
  },
  "Fractal Garden": {
    description: "Crystalline plants growing in recursive patterns.",
    color: "text-emerald-400",
    risk: "Medium",
    icon: "ri-plant-line",
    genre: "Solarpunk"
  }
};

const cleanAndParseJSON = <T,>(text: string | null): T | null => {
  if (!text) return null;
  try {
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleanText) as T;
  } catch (e) {
    return null;
  }
};

const urlToBase64 = async (url: string): Promise<string> => {
    if (url.startsWith('data:')) return url;
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        return "";
    }
};

const getCharacterVisualPrompt = (profile: SeekerProfile | null): string => {
    if (!profile) return "A mysterious hooded figure";
    const equipment = [];
    if (profile.equippedOutfit) equipment.push(profile.equippedOutfit.name);
    if (profile.equippedWeapon) equipment.push(profile.equippedWeapon.name);
    return `A ${profile.gender} ${profile.race} ${profile.class}${equipment.length > 0 ? `, wearing ${equipment.join(' and ')}` : ''}, glowing with a ${profile.auraColor || 'faint'} aura. Ensure character appearance matches reference image exactly.`;
};

const RPG_ADVENTURE_STYLES = [
    { id: 'neon_noir', name: 'Neon Noir Detective', icon: 'ri-spy-line', color: 'from-blue-600/20 to-purple-600/20', accent: 'text-blue-400' },
    { id: 'solarpunk', name: 'Solarpunk Utopia', icon: 'ri-sun-cloudy-line', color: 'from-emerald-600/20 to-teal-600/20', accent: 'text-emerald-400' },
    { id: 'grim_dark', name: 'Grim-Dark Fantasy', icon: 'ri-skull-2-line', color: 'from-red-900/20 to-slate-900/20', accent: 'text-rose-600' },
    { id: 'deep_sea', name: 'Abyssal Horror', icon: 'ri-water-flash-line', color: 'from-cyan-900/20 to-blue-950/20', accent: 'text-cyan-500' },
    { id: 'steampunk', name: 'Clockwork Revolution', icon: 'ri-settings-5-line', color: 'from-orange-600/20 to-amber-900/20', accent: 'text-amber-500' },
    { id: 'space_opera', name: 'Space Opera', icon: 'ri-rocket-2-line', color: 'from-indigo-600/20 to-purple-900/20', accent: 'text-indigo-400' },
    { id: 'weird_west', name: 'Weird West', icon: 'ri-ink-bottle-line', color: 'from-amber-800/20 to-stone-900/20', accent: 'text-orange-400' },
    { id: 'geometric', name: 'Fractal Transcendence', icon: 'ri-pink-600/20 to-cyan-600/20', accent: 'text-pink-400' },
    { id: 'rogue_ai', name: 'Rogue AI Escape', icon: 'ri-robot-line', color: 'from-red-600/20 to-slate-950/20', accent: 'text-red-500' },
    { id: 'dreamscape', name: 'Oneiric Dreamscape', icon: 'ri-moon-clear-line', color: 'from-slate-800/20 to-purple-950/20', accent: 'text-indigo-200' }
];

const RPGNexusPanel: React.FC<RPGNexusPanelProps> = ({
  width,
  height,
  addEchoMessage,
  activeProfile,
  allProfiles,
  partyIds,
  onUpdateProfile,
  onSetParty,
  currentEntropy,
  onArtifactCreated,
  savedState,
  onSaveState,
  onUpdateSystemMetrics
}) => {
  const { invokeGemini, generateImage } = useGemini();
  const { speak } = useNarration();
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState<RPGGameState>(savedState || {
    currentLocation: '',
    narrativeHistory: [{ text: "Nexus Engine initialized. Select your narrative architecture...", type: 'system', timestamp: Date.now() }],
    activeQuests: [],
    lastActionTimestamp: Date.now(),
    vitals: { integrity: 100, sanity: 100 },
    availableActions: DEFAULT_ACTIONS,
    achievements: [],
    combatState: { isActive: false, enemyName: '', enemyHp: 0, enemyMaxHp: 0, turn: 0, logs: [] },
    knownLocations: [],
    currentSceneDescription: "Initial void.",
    currentSceneImageUrl: null,
    sceneHistory: [],
    customMissionObjective: "",
    partyIds: []
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scanResults, setScanResults] = useState<Record<string, ScanLocation> | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isGeneratingMission, setIsGeneratingMission] = useState(false);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [missionInput, setMissionInput] = useState("");
  const [initStep, setInitStep] = useState<number>(gameState.currentLocation ? 0 : -1); 
  const [view, setView] = useState<'game' | 'archive'>('game');

  const partyMembers = useMemo(() => 
    allProfiles.filter(p => partyIds.includes(p.id) && p.id !== activeProfile?.id), 
    [allProfiles, partyIds, activeProfile]
  );

  useEffect(() => {
    if (onSaveState) onSaveState(gameState);
  }, [gameState, onSaveState]);

  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [gameState.narrativeHistory, view]); 

  const handleGenerateMission = async () => {
    if (isGeneratingMission || !selectedStyleId) return;
    setIsGeneratingMission(true);
    globalSoundEngine.playSFX('pulse');

    const partyStr = partyMembers.length > 0 
        ? `Party Members: ${partyMembers.map(p => `${p.name} (${p.class})`).join(', ')}`
        : 'Solo Quest';

    const style = RPG_ADVENTURE_STYLES.find(s => s.id === selectedStyleId);
    const prompt = `As the Nexus GM, generate a profound, one-sentence RPG mission objective.
    Seeker: ${activeProfile?.name} (${activeProfile?.class})
    ${partyStr}
    Architecture: ${style?.name}
    Entropy: ${currentEntropy.toFixed(2)}
    Themes: Cosmic recursion, ancient code, forgotten rituals.
    Output: Only the mission text.`;

    try {
      const response = await invokeGemini(prompt, "You are the Nexus Game Master.");
      if (response) {
        const text = response.trim().replace(/^"|"$/g, '');
        setMissionInput(text);
        speak(`New mission objective synthesized: ${text}`);
      }
    } catch (e) {
      console.warn("Mission synthesis failed.");
    } finally {
      setIsGeneratingMission(false);
    }
  };

  const handleScanSector = async () => {
    if (isScanning || !selectedStyleId) return;
    setIsScanning(true);
    globalSoundEngine.playSFX('click');
    speak("Scanning causality sectors...");
    
    const style = RPG_ADVENTURE_STYLES.find(s => s.id === selectedStyleId);
    const prompt = `Generate exactly 6 unique, evocative RPG locations for a ${style?.name} campaign. 
    Entropy: ${currentEntropy.toFixed(2)}. 
    Objective Context: "${missionInput}".
    Output strictly as JSON. Keys are location names.
    Values must be objects with:
    - "description": string (1-2 sentences)
    - "color": string (Tailwind text class)
    - "risk": string ("Low", "Medium", "High", "Extreme")
    - "icon": string (RemixIcon class)
    - "genre": string ("${style?.name}")`;

    try {
      const response = await invokeGemini(prompt, "You are an RPG JSON location generator.");
      const locations = cleanAndParseJSON<Record<string, ScanLocation>>(response);
      setScanResults(locations || FALLBACK_LOCATIONS);
      setGameState(prev => ({ ...prev, customMissionObjective: missionInput, partyIds }));
      setInitStep(3);
      speak("Sector scan complete. Multiple vector links detected.");
    } catch (err) {
      setScanResults(FALLBACK_LOCATIONS);
    } finally {
      setIsScanning(false);
    }
  };

  const handleTravel = async (locationName: string, locationData: Partial<ScanLocation>) => {
    setScanResults(null); 
    setIsProcessingTurn(true);
    addEchoMessage(AgentName.RPGNexusAgent, `Vectoring to ${locationName}...`, "text-cyan-300");
    speak(`Vectoring to ${locationName}.`);
    globalSoundEngine.playSFX('pulse');

    setGameState(prev => ({
      ...prev,
      currentLocation: locationName,
      narrativeHistory: [...prev.narrativeHistory, { text: `Arrived at ${locationName}.`, type: 'action', timestamp: Date.now() }]
    }));

    try {
      const partyContext = partyMembers.map(p => `${p.name} (${p.race} ${p.class})`).join(', ');
      const style = RPG_ADVENTURE_STYLES.find(s => s.id === selectedStyleId);
      const textPrompt = `You are GM for ${style?.name}. 
      Seeker: ${activeProfile?.name} (${activeProfile?.race} ${activeProfile?.class}).
      Active Party: ${partyContext || 'None'}.
      Location: "${locationName}" (${locationData.description}).
      Entropy: ${currentEntropy}.
      Provide vivid sensory description (2 sentences) and 3 logical actions.
      Return JSON: { "description": "...", "actions": [ { "id": "act_1", "label": "...", "type": "explore", "risk": 0.2 }, { "id": "act_2", "label": "...", "type": "explore", "risk": 0.4 }, { "id": "act_3", "label": "...", "type": "explore", "risk": 0.6 } ], "quest": { "title": "...", "description": "...", "rewards": { "xp": 100 } } }`;

      const textResponseRaw = await invokeGemini(textPrompt, "Return valid JSON only.");
      const textData = cleanAndParseJSON<any>(textResponseRaw);

      if (textData) {
        const charDesc = getCharacterVisualPrompt(activeProfile);
        const partyDesc = partyMembers.length > 0 ? `Accompanied by ${partyMembers.length} specialized allies.` : '';
        const imagePrompt = `Epic Environment Concept Art, ${style?.name} style. SCENE: ${textData.description}. CHARACTER: ${charDesc} ${partyDesc} exploring. Pure visual, no text.`;
        const referenceImage = activeProfile?.avatarImageUrl ? await urlToBase64(activeProfile.avatarImageUrl) : undefined;

        generateImage(imagePrompt, 'gemini-2.5-flash-image', referenceImage).then(url => {
          if (url) {
            setGameState(prev => ({ 
                ...prev, 
                currentSceneImageUrl: url,
                sceneHistory: [...(prev.sceneHistory || []), { imageUrl: url, location: locationName, description: textData.description, timestamp: Date.now() }] 
            }));
          }
        });
        
        setGameState(prev => ({
          ...prev,
          currentSceneDescription: textData.description,
          availableActions: textData.actions || DEFAULT_ACTIONS,
          activeQuests: [...prev.activeQuests, { ...textData.quest, id: `quest-${Date.now()}`, status: 'active' }].slice(-3),
          narrativeHistory: [...prev.narrativeHistory, { text: textData.description, type: 'narration', timestamp: Date.now() }]
        }));
        speak(textData.description);
      }
    } finally {
      setIsProcessingTurn(false);
    }
  };

  const handleAction = async (actionLabel: string, risk: number = 0.5) => {
    if (isProcessingTurn) return;
    setIsProcessingTurn(true);
    globalSoundEngine.playSFX('click');
    setGameState(prev => ({ ...prev, narrativeHistory: [...prev.narrativeHistory, { text: `> ${actionLabel}`, type: 'action', timestamp: Date.now() }] }));
    speak(`You attempt to ${actionLabel}`);

    const partyTraits = partyMembers.flatMap(p => p.selfTraits).join(', ');
    const style = RPG_ADVENTURE_STYLES.find(s => s.id === selectedStyleId);
    const prompt = `GM Logic (${style?.name}). Location: ${gameState.currentLocation}. Action: "${actionLabel}". 
    Entropy: ${currentEntropy}. 
    Active Party Traits Available: ${partyTraits || 'Basic'}.
    Determine outcome: 1-2 sentence result. Provide 3 NEW logical actions with risks.
    Return JSON: { "resultText": "...", "deltaIntegrity": 0, "deltaSanity": 0, "newActions": [ {"label": "...", "risk": 0.2}, {"label": "...", "risk": 0.4}, {"label": "...", "risk": 0.6} ] }`;

    try {
        const response = await invokeGemini(prompt, "Return valid JSON only.");
        const outcome = cleanAndParseJSON<any>(response);
        if (outcome) {
            const newIntegrity = Math.max(0, Math.min(100, (gameState.vitals?.integrity || 100) + (outcome.deltaIntegrity || 0)));
            const newSanity = Math.max(0, Math.min(100, (gameState.vitals?.sanity || 100) + (outcome.deltaSanity || 0)));
            
            setGameState(prev => ({
                ...prev,
                vitals: { integrity: newIntegrity, sanity: newSanity },
                availableActions: outcome.newActions || DEFAULT_ACTIONS,
                narrativeHistory: [...prev.narrativeHistory, { text: outcome.resultText, type: 'narration', timestamp: Date.now() }]
            }));
            speak(outcome.resultText);

            const charDesc = getCharacterVisualPrompt(activeProfile);
            const actionImagePrompt = `Cinematic Action, ${style?.name} style. RESULT: ${outcome.resultText}. CHARACTER: ${charDesc}. Purely visual.`;
            generateImage(actionImagePrompt, 'gemini-2.5-flash-image').then(url => {
                 if (url) setGameState(prev => ({ ...prev, currentSceneImageUrl: url, sceneHistory: [...(prev.sceneHistory || []), { imageUrl: url, location: prev.currentLocation, description: outcome.resultText, timestamp: Date.now() }] }));
            });
        }
    } finally { setIsProcessingTurn(false); }
  };

  const { confirmDialog } = useNotifications();

  const handleEndQuest = async () => {
    const ok = await confirmDialog({
      title: 'Conclude Campaign',
      message: 'Conclude the current campaign? History will remain archived, but active nexus state will reset.',
      confirmLabel: 'Conclude Campaign',
      destructive: true,
    });
    if (ok) {
        setGameState(prev => ({ 
            ...prev, 
            currentLocation: '', 
            currentSceneImageUrl: null,
            availableActions: DEFAULT_ACTIONS,
            narrativeHistory: [{ text: "Nexus Reset. Awaiting new directive...", type: 'system', timestamp: Date.now() }] 
        }));
        setInitStep(-1); // Back to splash
        setView('game');
        globalSoundEngine.playSFX('success');
        speak("Campaign concluded. Journey archived.");
    }
  };

  const handlePickNewQuest = () => {
      // Jump straight to architecture selection, clearing current mission context
      setInitStep(1);
      setView('game');
      setGameState(prev => ({ ...prev, currentLocation: '', currentSceneImageUrl: null }));
      speak("Re-initializing Nexus parameters. Choose a new architecture.");
  };

  const renderInitialization = () => (
    <div className="flex flex-col h-full bg-slate-950 p-4 md:p-8 overflow-y-auto custom-scrollbar relative">
      <AnimatePresence mode="wait">
        {initStep === -1 ? (
            <motion.div 
                key="splash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex-grow flex flex-col items-center justify-center space-y-12"
            >
                <div className="text-center space-y-4">
                    <motion.div 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-indigo-500/30 flex items-center justify-center bg-indigo-600/10 shadow-[0_0_40px_rgba(129,140,248,0.3)]"
                    >
                        <i className="ri-gamepad-line text-5xl text-indigo-400 animate-pulse"></i>
                    </motion.div>
                    <h2 className="text-5xl md:text-7xl font-cinzel font-bold text-white tracking-[0.2em] uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        Nexus Hub
                    </h2>
                    <p className="text-slate-400 font-cormorant text-xl italic tracking-widest">Procedural Reality Engine Active</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(129,140,248,0.6)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setInitStep(1);
                        globalSoundEngine.playSFX('success');
                        speak("Initializing quest parameters. Choose your destiny.");
                    }}
                    className="group relative px-12 py-6 bg-indigo-600 rounded-[2rem] border-2 border-indigo-400/50 shadow-[0_0_30px_rgba(129,140,248,0.4)] transition-all overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-white/10 to-indigo-400/20 animate-[temporal-flow_3s_linear_infinite]" />
                    <span className="relative z-10 text-2xl md:text-3xl font-cinzel font-bold text-white tracking-[0.3em] uppercase">Begin Quest!</span>
                </motion.button>
            </motion.div>
        ) : (
            <div className="flex flex-col h-full">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-slate-900/10 backdrop-blur-md p-4 rounded-3xl border border-white/5 shadow-2xl relative z-10 gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-cinzel transition-all duration-700
                                    ${initStep >= step ? 'border-indigo-400 bg-indigo-600/20 text-white shadow-[0_0_20px_rgba(129,140,248,0.4)]' : 'border-slate-800 bg-slate-900 text-slate-600'}`}>
                                    {step}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-mono tracking-widest ${initStep >= step ? 'text-indigo-400' : 'text-slate-600'}`}>PHASE</span>
                                    <span className={`text-xs font-bold font-cinzel tracking-widest ${initStep >= step ? 'text-white' : 'text-slate-700'}`}>
                                        {step === 1 ? 'ARCHITECTURE' : step === 2 ? 'INTENTION' : 'VECTOR SCAN'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {partyMembers.length > 0 && (
                        <div className="flex items-center gap-2 bg-indigo-900/20 px-4 py-2 rounded-2xl border border-indigo-500/20">
                            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Resonance Party:</span>
                            <div className="flex -space-x-2">
                                {partyMembers.map(p => (
                                    <div key={p.id} className="w-8 h-8 rounded-full border border-indigo-400 overflow-hidden bg-black" title={p.name}>
                                        {p.avatarImageUrl && <img src={p.avatarImageUrl} className="w-full h-full object-cover" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {initStep === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow flex flex-col overflow-hidden relative z-10">
                            <div className="text-center mb-6">
                                <h3 className="text-3xl md:text-4xl font-cinzel font-bold text-white mb-2 tracking-widest uppercase">Select Architecture</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 overflow-y-auto custom-scrollbar pb-8">
                                {RPG_ADVENTURE_STYLES.map(style => (
                                    <button 
                                        key={style.id}
                                        onClick={() => { 
                                        setSelectedStyleId(style.id); 
                                        setInitStep(2); 
                                        globalSoundEngine.playSFX('click');
                                        speak(`Architecture selected: ${style.name}`);
                                        }}
                                        className={`p-5 rounded-3xl border-2 text-center transition-all duration-300 group flex flex-col items-center justify-center gap-3
                                            ${selectedStyleId === style.id 
                                                ? 'bg-indigo-900/10 border-indigo-400 shadow-xl' 
                                                : 'bg-slate-900/20 border-white/5 hover:border-indigo-500/50 hover:bg-indigo-950/20'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-3xl ${style.accent}`}>
                                            <i className={style.icon}></i>
                                        </div>
                                        <div className="text-[10px] font-bold font-cinzel text-slate-100 uppercase tracking-widest">{style.name}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {initStep === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-grow flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6 w-full py-4">
                            <div className="text-center space-y-2">
                                <h3 className="text-3xl font-cinzel font-bold text-white tracking-widest uppercase">Define Intention</h3>
                                <p className="text-slate-500 text-sm italic font-cormorant">Your destination is encoded by your purpose.</p>
                            </div>
                            <div className="w-full relative px-2">
                                <textarea 
                                    value={missionInput}
                                    onChange={(e) => setMissionInput(e.target.value)}
                                    placeholder="Define your journey..."
                                    className={`w-full bg-slate-900/20 border border-indigo-500/40 rounded-2xl p-6 text-xl text-slate-100 focus:outline-none focus:border-indigo-400 resize-none h-40 md:h-48 italic backdrop-blur-xl font-cormorant shadow-2xl pr-16 transition-all ${isGeneratingMission ? 'animate-pulse opacity-50' : ''}`}
                                />
                                <button onClick={handleGenerateMission} disabled={isGeneratingMission} className="absolute top-6 right-6 w-12 h-12 bg-indigo-600 border border-indigo-400 rounded-xl text-white hover:bg-indigo-500 flex items-center justify-center shadow-lg group">
                                    <i className={`ri-sparkling-2-line text-2xl ${isGeneratingMission ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`}></i>
                                </button>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full px-2">
                                <button onClick={() => setInitStep(1)} className="flex-1 bg-slate-800 text-slate-300 font-bold py-5 rounded-2xl text-base border border-slate-700 active:scale-95 transition-transform">BACK</button>
                                <button onClick={handleScanSector} disabled={isScanning || !missionInput.trim()} className="flex-1 bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform text-lg">
                                    {isScanning ? <i className="ri-loader-4-line animate-spin"></i> : "CONTINUE: MATERIALIZE"}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {initStep === 3 && scanResults && (
                        <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-grow flex flex-col overflow-hidden relative z-10 py-4">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                <h3 className="text-2xl font-cinzel font-bold text-cyan-400 tracking-widest uppercase">Modalities</h3>
                                <button onClick={() => setInitStep(2)} className="px-6 py-2 bg-slate-800 text-xs font-bold rounded-full border border-white/10 transition-all">REFINE INTENTION</button>
                            </div>
                            <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pb-10">
                                {(Object.entries(scanResults) as [string, ScanLocation][]).map(([name, data]) => (
                                    <button 
                                        key={name}
                                        onClick={() => { handleTravel(name, data); setInitStep(0); }}
                                        className="flex flex-col sm:flex-row p-6 bg-slate-900/20 border border-white/5 rounded-3xl hover:border-cyan-500/50 transition-all text-left gap-6 backdrop-blur-md active:scale-95"
                                    >
                                        <div className={`w-16 h-16 rounded-2xl bg-black/20 border border-white/10 flex items-center justify-center text-4xl shrink-0 ${data.color}`}>
                                            <i className={data.icon || 'ri-map-pin-2-line'}></i>
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-cinzel font-bold text-xl text-white group-hover:text-cyan-300">{name}</h4>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${data.risk === 'Extreme' ? 'text-rose-400 border-rose-500' : 'text-emerald-400 border-emerald-500'}`}>{data.risk}</span>
                                            </div>
                                            <p className="text-sm text-slate-400 font-cormorant italic line-clamp-2">{data.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )}
      </AnimatePresence>
    </div>
  );

  const containerClasses = isFullscreen 
    ? "fixed inset-0 z-[9999] bg-slate-950" 
    : "relative w-full overflow-hidden bg-slate-950 rounded-2xl shadow-2xl border border-white/5";

  return (
    <div className={containerClasses} style={{ width: isFullscreen ? '100vw' : width || '100%', height: isFullscreen ? '100vh' : height || '100%' }}>
        {initStep >= 0 ? (
            initStep > 0 ? renderInitialization() : (
                <div className="h-full w-full relative flex flex-col overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <AnimatePresence mode="wait">
                            <motion.div key={gameState.currentSceneImageUrl} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="w-full h-full">
                                {gameState.currentSceneImageUrl ? (
                                    <img src={gameState.currentSceneImageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-900 animate-pulse" />
                                )}
                            </motion.div>
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full p-4 md:p-10 pointer-events-none">
                        <div className="flex flex-col md:flex-row justify-between items-start pointer-events-auto shrink-0 mb-4 gap-4">
                            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-3xl shadow-2xl w-full md:max-w-lg">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-400/30 flex items-center justify-center text-xl text-indigo-300"><i className="ri-map-pin-user-line"></i></div>
                                    <div className="flex-grow">
                                        <h3 className="text-xl font-cinzel font-bold text-white tracking-widest">{gameState.currentLocation}</h3>
                                        <p className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest">Locked Vector Link</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => { setView(view === 'game' ? 'archive' : 'game'); globalSoundEngine.playSFX('click'); }} 
                                            className={`p-3 rounded-xl border transition-all ${view === 'archive' ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-800/60 border-white/10 text-slate-400'}`}
                                            title="Toggle Chronicle Archive"
                                        >
                                            <i className="ri-archive-line"></i>
                                        </button>
                                        <button 
                                            onClick={handlePickNewQuest} 
                                            className="p-3 rounded-xl bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 transition-all"
                                            title="Pick New Quest"
                                        >
                                            <i className="ri-compass-discover-line"></i>
                                        </button>
                                        <button onClick={handleEndQuest} className="p-3 rounded-xl bg-rose-900/40 border border-rose-500/40 text-rose-300 hover:bg-rose-800 transition-all" title="End Current Campaign">
                                            <i className="ri-close-line"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mt-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-[8px] font-mono text-slate-400 uppercase mb-1"><span>Integrity</span><span>{gameState.vitals.integrity}%</span></div>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><motion.div animate={{ width: `${gameState.vitals.integrity}%` }} className="h-full bg-rose-500" /></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-[8px] font-mono text-slate-400 uppercase mb-1"><span>Sanity</span><span>{gameState.vitals.sanity}%</span></div>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><motion.div animate={{ width: `${gameState.vitals.sanity}%` }} className="h-full bg-purple-500" /></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow min-h-0" />

                        <div className="flex flex-col gap-4 pointer-events-auto w-full">
                            <AnimatePresence mode="wait">
                                {view === 'game' ? (
                                    <motion.div key="game" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-4 w-full">
                                        <div ref={logContainerRef} className="bg-slate-950/10 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 overflow-y-auto custom-scrollbar shadow-2xl max-h-48">
                                            {gameState.narrativeHistory.slice(-5).map((entry, i) => (
                                                <motion.div key={i} className={`text-base leading-relaxed mb-4 ${entry.type === 'action' ? 'text-indigo-400 font-bold font-cinzel' : 'text-slate-100 font-cormorant italic'}`}>
                                                    {entry.type === 'action' ? `> ${entry.text.toUpperCase()}` : entry.text}
                                                </motion.div>
                                            ))}
                                            {isProcessingTurn && <div className="text-indigo-400 animate-pulse font-mono text-[10px] uppercase">Processing...</div>}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {gameState.availableActions.map((act, i) => (
                                                <button 
                                                    key={i} 
                                                    onClick={() => handleAction(act.label, act.risk)}
                                                    className="w-full px-6 py-4 rounded-xl border-b-2 font-cinzel font-bold text-white shadow-xl backdrop-blur-md bg-indigo-900/10 border-white/10 text-xs tracking-widest flex justify-between items-center hover:bg-indigo-800/30 transition-all"
                                                >
                                                    <span>{act.label}</span>
                                                    <span className="text-[8px] font-mono opacity-50">{Math.round(act.risk*100)}% RISK</span>
                                                </button>
                                            ))}
                                            {/* Static action to pick a new quest during play if stuck */}
                                            <button 
                                                onClick={handlePickNewQuest}
                                                className="w-full px-6 py-3 rounded-xl border border-dashed font-cinzel font-bold text-indigo-400 bg-black/40 border-indigo-500/30 text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-indigo-900/20 transition-all"
                                            >
                                                <i className="ri-compass-discover-line"></i> RE-ROUTE TO NEW ARCHITECTURE
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="archive" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full relative">
                                        <RPGMementoArchivePanel 
                                            sceneHistory={gameState.sceneHistory} 
                                            narrativeHistory={gameState.narrativeHistory} 
                                            activeProfile={activeProfile} 
                                            currentEntropy={currentEntropy} 
                                            addEchoMessage={addEchoMessage} 
                                        />
                                        <div className="mt-4 flex justify-center">
                                            <button 
                                                onClick={handleEndQuest}
                                                className="px-8 py-3 bg-rose-900/40 border border-rose-500/40 text-rose-300 rounded-xl font-cinzel font-bold text-xs tracking-widest hover:bg-rose-800 transition-all"
                                            >
                                                CONCLUDE JOURNEY & EXIT HUB
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )
        ) : renderInitialization() /* Step -1 is covered here */}
    </div>
  );
};

export default RPGNexusPanel;
