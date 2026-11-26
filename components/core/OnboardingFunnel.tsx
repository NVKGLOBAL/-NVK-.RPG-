import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { useSovereignAI } from '../../context/SovereignAIContext';
import { SeekerProfile, SeekerAvatarType, SeekerClass, SeekerGender, SeekerBodyType, SeekerEnergyAlignment, SeekerAuraColor, SeekerVisualFilter } from '../../types';
import { 
  AVATAR_RACES, 
  SEEKER_CLASSES, 
  ALL_GENDERS_LIST, 
  SEEKER_AURA_OPTIONS, 
  ALL_ALIGNMENTS_LIST, 
  STARTER_WEAPONS, 
  STARTER_OUTFITS, 
  SEEKER_BODY_TYPES, 
  SEEKER_VISUAL_FILTERS,
  NAMED_SKIN_PALETTE,
  NAMED_HAIR_PALETTE,
  NAMED_EYE_PALETTE,
  HAIR_STYLES
} from '../../constants';
import { globalSoundEngine } from '../../lib/SoundEngine';
import { useNotifications } from '../../context/NotificationContext';

// --- Random Name Generator ---
const NAME_PREFIXES = ["Xyl", "Chron", "Vor", "Zyn", "Kael", "Thal", "Om", "Lyra", "Vex", "Ser", "Dra", "Myr", "Pyr", "Cyp", "Nek", "Sol", "Zen", "Rin", "Kys", "Tor", "Ael", "Fen", "Grim"];
const NAME_SUFFIXES = ["os", "ia", "ex", "on", "is", "us", "ar", "or", "a", "yn", "ix", "um", "ra", "th", "en", "ir", "ae", "io", "ak", "ul"];

const generateRandomName = () => {
    const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
    const suffix = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
    return prefix + suffix;
};

const ColorSwatch: React.FC<{ 
  color: string; 
  name: string;
  isActive: boolean; 
  onClick: () => void; 
}> = ({ color, name, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setIsHovered(true); globalSoundEngine.playUIFeedback('hover'); }}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-9 h-9 rounded-full border-2 transition-all duration-300 relative group flex items-center justify-center
        ${isActive ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-white/10 hover:border-white/40'}`}
      style={{ backgroundColor: color }}
    >
      {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
      
      {/* Visual Color Name Tooltip */}
      <AnimatePresence>
        {(isHovered || isActive) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded border border-white/20 whitespace-nowrap z-[100] shadow-2xl pointer-events-none font-mono"
          >
            {name}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

const AdvancedColorPicker: React.FC<{ 
  value: string; 
  onChange: (color: string) => void; 
  label: string;
  palette: { name: string, hex: string }[];
}> = ({ value, onChange, label, palette }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const currentColorName = useMemo(() => {
    return palette.find(c => c.hex.toLowerCase() === value.toLowerCase())?.name || "Custom Resonance";
  }, [value, palette]);
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</label>
        <div className="text-[9px] font-mono text-indigo-400 opacity-80 uppercase tracking-tighter">{currentColorName}</div>
      </div>
      <div className="flex flex-wrap gap-2 items-center bg-slate-900/60 p-4 rounded-2xl border border-white/10 shadow-inner overflow-visible">
        {palette.map(c => (
          <ColorSwatch 
            key={c.hex} 
            color={c.hex} 
            name={c.name}
            isActive={value.toLowerCase() === c.hex.toLowerCase()} 
            onClick={() => onChange(c.hex)} 
          />
        ))}
        <div className="w-px h-8 bg-white/10 mx-2" />
        <button 
          onClick={() => inputRef.current?.click()}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all relative overflow-hidden group
            ${!palette.some(c => c.hex.toLowerCase() === value.toLowerCase()) ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300' : 'border-white/20 text-white/40 hover:border-white/60 hover:text-white/60'}`}
          title="Manual Frequency Adjustment"
        >
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,red,yellow,lime,aqua,blue,magenta,red)] opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <i className="ri-palette-line text-xl relative z-10"></i>
          <input 
            ref={inputRef}
            type="color" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="absolute inset-0 opacity-0 cursor-pointer" 
          />
        </button>
      </div>
    </div>
  );
};

interface OnboardingFunnelProps {
  onComplete: (profile: SeekerProfile) => void;
  addEchoMessage: (s: string, t: string, c: string) => void;
  onImportRequested?: (file: File) => Promise<void>;
}

export const OnboardingFunnel: React.FC<OnboardingFunnelProps> = ({ onComplete, addEchoMessage, onImportRequested }) => {
  const [step, setStep] = useState<'briefing' | 'orientation' | 'calibration' | 'weaving' | 'reveal'>('briefing');
  const [activeSubStep, setActiveSubStep] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // -- Identification --
  const [name, setName] = useState("");
  const [race, setRace] = useState<SeekerAvatarType>(SeekerAvatarType.Human);
  const [seekerClass, setSeekerClass] = useState<SeekerClass>(SeekerClass.Gatewalker);
  const [gender, setGender] = useState<SeekerGender>(SeekerGender.NonBinary);
  const [age, setAge] = useState(25);

  // -- Physical Vessel --
  const [bodyType, setBodyType] = useState<SeekerBodyType>(SeekerBodyType.Athletic);
  const [skinTone, setSkinTone] = useState(NAMED_SKIN_PALETTE[0].hex);
  const [hairStyle, setHairStyle] = useState("Short Buzz");
  const [hairColor, setHairColor] = useState(NAMED_HAIR_PALETTE[0].hex);
  const [eyeColor, setEyeColor] = useState(NAMED_EYE_PALETTE[0].hex);

  // -- Spectral Tuning --
  const [alignment, setAlignment] = useState<SeekerEnergyAlignment>(SeekerEnergyAlignment.Balanced);
  const [aura, setAura] = useState<string>(SEEKER_AURA_OPTIONS[0].hex);
  const [secondaryAura, setSecondaryAura] = useState<string>(SEEKER_AURA_OPTIONS[3].hex);
  const [visualFilter, setVisualFilter] = useState<SeekerVisualFilter>(SeekerVisualFilter.Standard);

  // -- Intent & Armory --
  const [intent, setIntent] = useState("");
  const [weaponId, setWeaponId] = useState(STARTER_WEAPONS[0].id);
  const [outfitId, setOutfitId] = useState(STARTER_OUTFITS[0].id);
  const [isGeneratingIntent, setIsGeneratingIntent] = useState(false);
  
  const [generatedProfile, setGeneratedProfile] = useState<SeekerProfile | null>(null);
  const { invokeAI, generateImage } = useSovereignAI();
  const { notify } = useNotifications();

  const activeWeapon = useMemo(() => STARTER_WEAPONS.find(w => w.id === weaponId) || STARTER_WEAPONS[0], [weaponId]);
  const activeOutfit = useMemo(() => STARTER_OUTFITS.find(o => o.id === outfitId) || STARTER_OUTFITS[0], [outfitId]);

  // Lore Lookups
  const activeRaceInfo = useMemo(() => AVATAR_RACES.find(r => r.id === race), [race]);
  const activeClassInfo = useMemo(() => SEEKER_CLASSES.find(c => c.id === seekerClass), [seekerClass]);

  const handleRandomize = () => {
    globalSoundEngine.playUIFeedback('click');
    setName(generateRandomName());
    setRace(AVATAR_RACES[Math.floor(Math.random() * AVATAR_RACES.length)].id as SeekerAvatarType);
    setSeekerClass(SEEKER_CLASSES[Math.floor(Math.random() * SEEKER_CLASSES.length)].id as SeekerClass);
    setGender(ALL_GENDERS_LIST[Math.floor(Math.random() * ALL_GENDERS_LIST.length)]);
    setAge(Math.floor(Math.random() * 900) + 1);
    setBodyType(SEEKER_BODY_TYPES[Math.floor(Math.random() * SEEKER_BODY_TYPES.length)]);
    setAlignment(ALL_ALIGNMENTS_LIST[Math.floor(Math.random() * ALL_ALIGNMENTS_LIST.length)]);
    setWeaponId(STARTER_WEAPONS[Math.floor(Math.random() * STARTER_WEAPONS.length)].id);
    setOutfitId(STARTER_OUTFITS[Math.floor(Math.random() * STARTER_OUTFITS.length)].id);
    
    setAura(SEEKER_AURA_OPTIONS[Math.floor(Math.random() * SEEKER_AURA_OPTIONS.length)].hex);
    setSecondaryAura(SEEKER_AURA_OPTIONS[Math.floor(Math.random() * SEEKER_AURA_OPTIONS.length)].hex);
    setEyeColor(NAMED_EYE_PALETTE[Math.floor(Math.random() * NAMED_EYE_PALETTE.length)].hex);
    setHairColor(NAMED_HAIR_PALETTE[Math.floor(Math.random() * NAMED_HAIR_PALETTE.length)].hex);
    setSkinTone(NAMED_SKIN_PALETTE[Math.floor(Math.random() * NAMED_SKIN_PALETTE.length)].hex);
    setVisualFilter(SEEKER_VISUAL_FILTERS[Math.floor(Math.random() * SEEKER_VISUAL_FILTERS.length)].id as SeekerVisualFilter);
  };

  const handleInstantManifest = () => {
    globalSoundEngine.playSFX('success');
    
    const randomName = name || generateRandomName();
    const randomRace = AVATAR_RACES[Math.floor(Math.random() * AVATAR_RACES.length)].id as SeekerAvatarType;
    const randomClass = SEEKER_CLASSES[Math.floor(Math.random() * SEEKER_CLASSES.length)].id as SeekerClass;
    const randomGender = ALL_GENDERS_LIST[Math.floor(Math.random() * ALL_GENDERS_LIST.length)];
    const randomAge = Math.floor(Math.random() * 900) + 1;
    const randomBodyType = SEEKER_BODY_TYPES[Math.floor(Math.random() * SEEKER_BODY_TYPES.length)];
    const randomAlignment = ALL_ALIGNMENTS_LIST[Math.floor(Math.random() * ALL_ALIGNMENTS_LIST.length)];
    const randomWeapon = STARTER_WEAPONS[Math.floor(Math.random() * STARTER_WEAPONS.length)];
    const randomOutfit = STARTER_OUTFITS[Math.floor(Math.random() * STARTER_OUTFITS.length)];
    const randomAuraObj = SEEKER_AURA_OPTIONS[Math.floor(Math.random() * SEEKER_AURA_OPTIONS.length)];
    const randomSecAuraObj = SEEKER_AURA_OPTIONS[Math.floor(Math.random() * SEEKER_AURA_OPTIONS.length)];
    const randomEyeColor = NAMED_EYE_PALETTE[Math.floor(Math.random() * NAMED_EYE_PALETTE.length)].hex;
    const randomHairColor = NAMED_HAIR_PALETTE[Math.floor(Math.random() * NAMED_HAIR_PALETTE.length)].hex;
    const randomSkin = NAMED_SKIN_PALETTE[Math.floor(Math.random() * NAMED_SKIN_PALETTE.length)].hex;
    const randomFilter = SEEKER_VISUAL_FILTERS[Math.floor(Math.random() * SEEKER_VISUAL_FILTERS.length)].id as SeekerVisualFilter;
    const randomHairStyle = HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)];
    
    // Synchronize to local react state so user forms and calibration displays stay synced
    setName(randomName);
    setRace(randomRace);
    setSeekerClass(randomClass);
    setGender(randomGender);
    setAge(randomAge);
    setBodyType(randomBodyType);
    setSkinTone(randomSkin);
    setHairStyle(randomHairStyle);
    setHairColor(randomHairColor);
    setEyeColor(randomEyeColor);
    setAlignment(randomAlignment);
    setAura(randomAuraObj.hex);
    setSecondaryAura(randomSecAuraObj.hex);
    setVisualFilter(randomFilter);
    setWeaponId(randomWeapon.id);
    setOutfitId(randomOutfit.id);

    // Call weaveIdentity with explicit randomized overrides to trigger full AI Bio & AI Image Generation
    weaveIdentity({
      name: randomName,
      race: randomRace,
      seekerClass: randomClass,
      gender: randomGender,
      age: randomAge,
      bodyType: randomBodyType,
      skinTone: randomSkin,
      hairStyle: randomHairStyle,
      hairColor: randomHairColor,
      eyeColor: randomEyeColor,
      alignment: randomAlignment,
      aura: randomAuraObj.hex,
      secondaryAura: randomSecAuraObj.hex,
      visualFilter: randomFilter,
      activeWeapon: randomWeapon,
      activeOutfit: randomOutfit
    });
  };

  const handleGenerateIntent = async () => {
    if (isGeneratingIntent) return;
    setIsGeneratingIntent(true);
    globalSoundEngine.playSFX('pulse');
    
    const prompt = `As the Oracle of the Tri-Sophian Codex, synthesize a unique, profound, one-sentence Prime Directive (Intention) for a Seeker.
    Profile: ${race} ${seekerClass}
    Resonance: Primary ${aura}, Secondary ${secondaryAura} harmonics.
    Alignment: ${alignment}.
    Style: Cryptic, poetic, mystical. No introduction, just the intent text.`;

    try {
      const response = await invokeAI(prompt, "You are the Oracle, generator of sacred destinies.");
      if (response) setIntent(response.trim().replace(/^"|"$/g, ''));
    } catch (e) {
      console.warn("Intent synthesis failed.");
    } finally {
      setIsGeneratingIntent(false);
    }
  };

  const [weavingMessageIdx, setWeavingMessageIdx] = useState(0);
  const weavingMessages = [
    "SYNTHESIZING CAUSALITY LOOPS...",
    "WEAVING SPECTRAL FILAMENTS...",
    "CALIBRATING TEMPORAL ANCHORS...",
    "HARMONIZING NEURAL SIGNATURES...",
    "PROJECTING QUANTUM PROBABILITY..."
  ];

  useEffect(() => {
    let interval: any;
    if (step === 'weaving') {
      interval = setInterval(() => {
        setWeavingMessageIdx(prev => (prev + 1) % weavingMessages.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const weaveIdentity = async (overrides?: {
    name?: string;
    race?: SeekerAvatarType;
    seekerClass?: SeekerClass;
    gender?: SeekerGender;
    age?: number;
    bodyType?: SeekerBodyType;
    skinTone?: string;
    hairStyle?: string;
    hairColor?: string;
    eyeColor?: string;
    alignment?: SeekerEnergyAlignment;
    aura?: string;
    secondaryAura?: string;
    visualFilter?: SeekerVisualFilter;
    activeWeapon?: typeof STARTER_WEAPONS[0];
    activeOutfit?: typeof STARTER_OUTFITS[0];
  }) => {
    const finalName = (overrides?.name !== undefined ? overrides.name : name).trim();
    if (!finalName) { 
      notify("A Seeker must have a designation name before weaving.", "warning");
      return; 
    }
    
    setStep('weaving');
    globalSoundEngine.playSFX('pulse');

    const finalRace = overrides?.race !== undefined ? overrides.race : race;
    const finalClass = overrides?.seekerClass !== undefined ? overrides.seekerClass : seekerClass;
    const finalGender = overrides?.gender !== undefined ? overrides.gender : gender;
    const finalAge = overrides?.age !== undefined ? overrides.age : age;
    const finalBodyType = overrides?.bodyType !== undefined ? overrides.bodyType : bodyType;
    const finalSkinTone = overrides?.skinTone !== undefined ? overrides.skinTone : skinTone;
    const finalHairStyle = overrides?.hairStyle !== undefined ? overrides.hairStyle : hairStyle;
    const finalHairColor = overrides?.hairColor !== undefined ? overrides.hairColor : hairColor;
    const finalEyeColor = overrides?.eyeColor !== undefined ? overrides.eyeColor : eyeColor;
    const finalAlignment = overrides?.alignment !== undefined ? overrides.alignment : alignment;
    const finalAura = overrides?.aura !== undefined ? overrides.aura : aura;
    const finalSecondaryAura = overrides?.secondaryAura !== undefined ? overrides.secondaryAura : secondaryAura;
    const finalVisualFilter = overrides?.visualFilter !== undefined ? overrides.visualFilter : visualFilter;
    const finalWeapon = overrides?.activeWeapon !== undefined ? overrides.activeWeapon : activeWeapon;
    const finalOutfit = overrides?.activeOutfit !== undefined ? overrides.activeOutfit : activeOutfit;

    // Create a timeout to ensure we don't stay stuck forever
    const timeoutId = setTimeout(() => {
        console.warn("Weaving timed out. Reverting to stable fallback.");
        useFallbackProfile();
    }, 35000); // 35 seconds is plenty for image gen

    const useFallbackProfile = () => {
        clearTimeout(timeoutId);
        const auraEnum = SEEKER_AURA_OPTIONS.find(o => o.hex.toLowerCase() === finalAura.toLowerCase())?.id as SeekerAuraColor || SeekerAuraColor.Prismatic;
        const secAuraEnum = SEEKER_AURA_OPTIONS.find(o => o.hex.toLowerCase() === finalSecondaryAura.toLowerCase())?.id as SeekerAuraColor || SeekerAuraColor.Prismatic;

        setGeneratedProfile({
            id: `seeker-fallback-${Date.now()}`,
            generatedAt: Date.now(),
            level: 1, experience: 0, flux: 100,
            inventory: [finalWeapon, finalOutfit],
            selfTraits: ["Stable"], codexTraits: ["Survivor"],
            name: finalName, race: finalRace, class: finalClass, gender: finalGender, age: finalAge, bodyType: finalBodyType,
            eyeColor: finalEyeColor, hairColor: finalHairColor, skinTone: finalSkinTone,
            energyAlignment: finalAlignment, 
            auraColor: auraEnum, 
            auraSecondaryColor: secAuraEnum,
            visualFilter: finalVisualFilter, 
            avatarImageUrl: "", 
            bio: "The weave was turbulent, but the Seeker's essence remains intact.",
            equippedWeapon: finalWeapon, 
            equippedOutfit: finalOutfit
        });
        setStep('reveal');
    };

    try {
        console.log("Synthesizing bio...");
        const bioPrompt = `Synthesize a unique bio for ${finalName} (${finalRace} ${finalClass}). Intention: "${intent || 'Unknown'}". 2 sentences. Return JSON: {"bio": "..."}`;
        const response = await invokeAI(bioPrompt, "Output JSON only.", "application/json");
        
        let bio = "A Seeker entering the Codex.";
        try {
            if (response) {
                // Try to extract JSON if it's wrapped in markdown
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                const cleanJson = jsonMatch ? jsonMatch[0] : response;
                const data = JSON.parse(cleanJson);
                bio = data.bio || bio;
            }
        } catch (parseError) {
            console.warn("JSON parsing for bio failed, using raw response or fallback.");
            if (response && response.length < 200) bio = response.trim();
        }
        
        console.log("Synthesizing avatar...");
        const imagePrompt = `Epic RPG portrait: ${finalGender} ${finalRace} ${finalClass}. 
        PHYSICAL: ${finalBodyType}, ${finalSkinTone} skin tone, ${finalHairStyle} hair in ${finalHairColor}, piercing ${finalEyeColor} eyes. 
        AURA: Intense ${finalAura} primary aura with ${finalSecondaryAura} flickering secondary resonance. 
        STYLE: ${finalVisualFilter} aesthetic rendering, high detail, no text in image.`;
        
        // Use a more modern model if available or stick to the current one
        const avatarUrlResult = await generateImage(imagePrompt);
        
        clearTimeout(timeoutId);
        const auraEnum = SEEKER_AURA_OPTIONS.find(o => o.hex.toLowerCase() === finalAura.toLowerCase())?.id as SeekerAuraColor || SeekerAuraColor.Prismatic;
        const secAuraEnum = SEEKER_AURA_OPTIONS.find(o => o.hex.toLowerCase() === finalSecondaryAura.toLowerCase())?.id as SeekerAuraColor || SeekerAuraColor.Prismatic;

        const finalProfile: SeekerProfile = { 
            id: `seeker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            generatedAt: Date.now(), 
            level: 1, 
            experience: 0, 
            flux: 100, 
            inventory: [finalWeapon, finalOutfit], 
            selfTraits: ["Calibrated"], 
            codexTraits: ["Seeker"], 
            name: finalName, 
            race: finalRace, 
            class: finalClass, 
            gender: finalGender, 
            age: finalAge, 
            bodyType: finalBodyType, 
            eyeColor: finalEyeColor, 
            hairColor: finalHairColor, 
            skinTone: finalSkinTone,
            energyAlignment: finalAlignment, 
            auraColor: auraEnum, 
            auraSecondaryColor: secAuraEnum, 
            visualFilter: finalVisualFilter, 
            avatarImageUrl: avatarUrlResult || "", 
            bio: bio, 
            equippedWeapon: finalWeapon, 
            equippedOutfit: finalOutfit 
        };

        setGeneratedProfile(finalProfile);
        setStep('reveal');
        globalSoundEngine.playSFX('success');
    } catch (e) { 
        console.error("Critical Weaving Error:", e);
        useFallbackProfile();
    }
  };

  const subSteps = ["Designation", "Appearance", "Spectral", "Purpose"];
  const selectClasses = "w-full bg-slate-800 border border-indigo-500/30 rounded-xl p-3 text-slate-100 outline-none text-sm appearance-none focus:border-indigo-400 transition-colors";

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950 flex items-center justify-center p-4 md:p-6 overflow-y-auto custom-scrollbar">
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #818cf8 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

      <AnimatePresence mode="wait">
        {step === 'briefing' && (
          <motion.div key="briefing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl text-center space-y-8 p-4 z-10">
            <h2 className="text-4xl md:text-6xl font-cinzel font-bold text-indigo-300 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]">Identity Link</h2>
            <p className="text-slate-300 font-cormorant text-xl md:text-2xl italic">Project your soul-signal to initialize calibration within the Aethel-Weft.</p>
            <div className="flex flex-col gap-4 justify-center">
                <Button onClick={() => setStep('orientation')} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 font-bold text-xl rounded-2xl shadow-xl shadow-indigo-900/40 border border-indigo-400/50">BEGIN INITIALIZATION</Button>
                <Button onClick={handleInstantManifest} className="w-full py-5 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 font-bold text-xl rounded-2xl shadow-2xl border border-amber-400/30">⚡ INSTANT MANIFEST (SKIP ONBOARDING)</Button>
                <Button onClick={() => fileInputRef.current?.click()} className="w-full py-5 bg-slate-900 border border-white/10 font-bold text-xl rounded-2xl hover:bg-slate-800 transition-all">IMPORT REALITY</Button>
                <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && e.target.files[0] && onImportRequested?.(e.target.files[0])} style={{display: 'none'}} accept=".json" />
            </div>
          </motion.div>
        )}

        {step === 'orientation' && (
          <motion.div key="orientation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-3xl bg-slate-900/80 p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl z-10 text-left flex flex-col max-h-[90vh]">
            <div className="text-center space-y-1 md:space-y-2 shrink-0 mb-4">
              <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-indigo-300 uppercase tracking-widest">System Orientation</h2>
              <p className="text-slate-400 font-mono text-xs md:text-sm">Welcome to the Tri-Sophian Codex</p>
            </div>

            <div className="space-y-4 md:space-y-6 text-slate-300 font-cormorant text-base md:text-lg leading-relaxed overflow-y-auto custom-scrollbar pr-2 flex-grow mb-4">
              <div className="bg-black/30 p-4 md:p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg md:text-xl font-bold text-emerald-400 mb-1 md:mb-2 flex items-center gap-2">
                  <i className="ri-robot-2-line"></i> 1. The Sovereign Assistant
                </h3>
                <p className="text-sm md:text-base">By default, you operate in <strong>Assistant Mode</strong>. This is your personalized intelligence matrix. Use it to track real-world goals, manage tasks, and deploy AI to conduct deep-dive research autonomously.</p>
              </div>

              <div className="bg-black/30 p-4 md:p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg md:text-xl font-bold text-amber-400 mb-1 md:mb-2 flex items-center gap-2">
                  <i className="ri-sword-line"></i> 2. The RPG Simulation
                </h3>
                <p className="text-sm md:text-base">Toggle into <strong>RPG Mode</strong> to access the Aethel-Weft. Here, you can generate autonomous AI agents, watch them interact, form factions, and weave concepts together on the Ritual Canvas.</p>
              </div>

              <div className="bg-black/30 p-4 md:p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg md:text-xl font-bold text-indigo-400 mb-1 md:mb-2 flex items-center gap-2">
                  <i className="ri-scales-3-line"></i> 3. Entropy & Negentropy
                </h3>
                <p className="text-sm md:text-base">Your actions shape the system. Completing tasks generates <strong>Negentropy</strong> (Order), stabilizing the interface. Ideation and simulation generate <strong>Entropy</strong> (Chaos), sparking creative mutations and visual noise.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-center shrink-0">
              <Button onClick={() => setStep('calibration')} className="w-full md:w-auto px-12 py-3.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-base md:text-lg rounded-xl md:rounded-2xl shadow-xl shadow-indigo-900/40 border border-indigo-400/50">
                PROCEED TO CALIBRATION
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'calibration' && (
          <motion.div key="calibration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full max-w-4xl max-h-[92vh] md:max-h-[85vh] bg-slate-900/60 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 backdrop-blur-3xl overflow-hidden flex flex-col shadow-2xl relative z-10">
            
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h3 className="text-2xl font-cinzel text-indigo-300 uppercase tracking-widest">Seeker Calibration</h3>
                    <div className="flex gap-2 mt-2">
                        {subSteps.map((s, idx) => (
                            <div key={s} className={`h-1 flex-grow rounded-full transition-all duration-500 ${activeSubStep >= idx ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
                        ))}
                    </div>
                </div>
                <button onClick={handleRandomize} className="p-3 bg-indigo-900/40 border border-indigo-500/50 rounded-2xl text-white hover:bg-indigo-800/60 transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95">
                    <i className="ri-dice-fill text-xl"></i>
                </button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-8">
                
                {activeSubStep === 0 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                        <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest border-b border-indigo-900/50 pb-2">Core Designation</h4>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Designation (Name)</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-800 border border-indigo-500/20 rounded-xl p-4 text-white text-lg focus:border-indigo-400 outline-none transition-all shadow-inner" placeholder="Enter name..."/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Identity Type</label>
                                    <select value={gender} onChange={(e) => setGender(e.target.value as SeekerGender)} className={selectClasses}>
                                        {ALL_GENDERS_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Cycle Count (Age)</label>
                                    <input type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value))} className={selectClasses} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                              <div className="space-y-2">
                                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Biomorph (Race)</label>
                                  <select value={race} onChange={(e) => setRace(e.target.value as SeekerAvatarType)} className={selectClasses}>
                                      {AVATAR_RACES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                  </select>
                                  <AnimatePresence mode="wait">
                                    <motion.div 
                                      key={race}
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="p-3 bg-cyan-900/10 border border-cyan-500/20 rounded-xl overflow-hidden"
                                    >
                                      <p className="text-[11px] text-cyan-200/80 font-cormorant italic leading-relaxed">
                                        {activeRaceInfo?.description || "Initializing race lore..."}
                                      </p>
                                    </motion.div>
                                  </AnimatePresence>
                              </div>

                              <div className="space-y-2">
                                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Archetype (Class)</label>
                                  <select value={seekerClass} onChange={(e) => setSeekerClass(e.target.value as SeekerClass)} className={selectClasses}>
                                      {SEEKER_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                  </select>
                                  <AnimatePresence mode="wait">
                                    <motion.div 
                                      key={seekerClass}
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="p-3 bg-indigo-900/10 border border-indigo-500/20 rounded-xl overflow-hidden"
                                    >
                                      <p className="text-[11px] text-indigo-200/80 font-cormorant italic leading-relaxed">
                                        {activeClassInfo?.description || "Initializing class lore..."}
                                      </p>
                                    </motion.div>
                                  </AnimatePresence>
                              </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSubStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest border-b border-indigo-900/50 pb-2">Vessel Manifestation</h4>
                        
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Frame Architecture (Body)</label>
                            <select value={bodyType} onChange={(e) => setBodyType(e.target.value as SeekerBodyType)} className={selectClasses}>
                                {SEEKER_BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <AdvancedColorPicker 
                            label="Surface Pigment (Skin)" 
                            value={skinTone} 
                            onChange={setSkinTone} 
                            palette={NAMED_SKIN_PALETTE} 
                          />
                          <AdvancedColorPicker 
                            label="Spectral Fibers (Hair Color)" 
                            value={hairColor} 
                            onChange={setHairColor} 
                            palette={NAMED_HAIR_PALETTE} 
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <AdvancedColorPicker 
                            label="Ocular Core (Eye Color)" 
                            value={eyeColor} 
                            onChange={setEyeColor} 
                            palette={NAMED_EYE_PALETTE} 
                          />
                          <div className="space-y-2">
                              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Vessel Crown (Hair Style)</label>
                              <select value={hairStyle} onChange={(e) => setHairStyle(e.target.value)} className={selectClasses}>
                                  {HAIR_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                          </div>
                        </div>
                    </motion.div>
                )}

                {activeSubStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest border-b border-indigo-900/50 pb-2">Spectral Tuning</h4>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Energy Alignment</label>
                                <select value={alignment} onChange={(e) => setAlignment(e.target.value as SeekerEnergyAlignment)} className={selectClasses}>
                                    {ALL_ALIGNMENTS_LIST.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <AdvancedColorPicker 
                                label="Primary Aura Resonance" 
                                value={aura} 
                                onChange={setAura} 
                                palette={SEEKER_AURA_OPTIONS.map(o => ({ name: o.name, hex: o.hex }))} 
                              />
                              <AdvancedColorPicker 
                                label="Sub-Echo Harmonics" 
                                value={secondaryAura} 
                                onChange={setSecondaryAura} 
                                palette={SEEKER_AURA_OPTIONS.map(o => ({ name: o.name, hex: o.hex }))} 
                              />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Aesthetic Perception Filter</label>
                                <select value={visualFilter} onChange={(e) => setVisualFilter(e.target.value as SeekerVisualFilter)} className={selectClasses}>
                                    {SEEKER_VISUAL_FILTERS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSubStep === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                        <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest border-b border-indigo-900/50 pb-2">Sacred Intent & Gear</h4>
                        <div className="space-y-4">
                            <div className="space-y-1 relative">
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Prime Directive (Intent)</label>
                                <textarea value={intent} onChange={(e) => setIntent(e.target.value)} className={`w-full bg-slate-800 border border-indigo-500/20 rounded-xl p-4 text-white italic h-28 focus:border-indigo-400 outline-none transition-all shadow-inner ${isGeneratingIntent ? 'animate-pulse opacity-50' : ''}`} placeholder="What drives your search?"/>
                                <button onClick={handleGenerateIntent} disabled={isGeneratingIntent} className="absolute bottom-4 right-4 p-2 bg-indigo-600 border border-indigo-400 rounded-lg text-white hover:bg-indigo-500 transition-all shadow-lg active:scale-90">
                                    <i className={`ri-sparkling-2-line ${isGeneratingIntent ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`}></i>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-rose-400 font-bold uppercase tracking-widest ml-1">Weapon Shard</label>
                                    <select value={weaponId} onChange={(e) => setWeaponId(e.target.value)} className={selectClasses}>
                                        {STARTER_WEAPONS.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                    <AnimatePresence mode="wait">
                                      <motion.div 
                                        key={weaponId}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 bg-rose-900/10 border border-rose-500/20 rounded-xl overflow-hidden"
                                      >
                                        <p className="text-[11px] text-rose-200/80 font-cormorant italic leading-relaxed">
                                          {activeWeapon?.description || "Initializing weapon shard lore..."}
                                        </p>
                                      </motion.div>
                                    </AnimatePresence>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest ml-1">Armor Lattice</label>
                                    <select value={outfitId} onChange={(e) => setOutfitId(e.target.value)} className={selectClasses}>
                                        {STARTER_OUTFITS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                    </select>
                                    <AnimatePresence mode="wait">
                                      <motion.div 
                                        key={outfitId}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 bg-emerald-900/10 border border-emerald-500/20 rounded-xl overflow-hidden"
                                      >
                                        <p className="text-[11px] text-emerald-200/80 font-cormorant italic leading-relaxed">
                                          {activeOutfit?.description || "Initializing armor lattice lore..."}
                                        </p>
                                      </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>

            <div className="mt-6 flex gap-3 shrink-0">
                {activeSubStep > 0 && (
                    <Button onClick={() => setActiveSubStep(activeSubStep - 1)} className="flex-1 py-4 bg-slate-800 border border-white/5 font-bold rounded-2xl hover:bg-slate-700">BACK</Button>
                )}
                {activeSubStep < 3 ? (
                    <Button onClick={() => setActiveSubStep(activeSubStep + 1)} className="flex-grow py-4 bg-indigo-600 font-bold rounded-2xl hover:bg-indigo-500 shadow-xl shadow-indigo-900/20">CONTINUE</Button>
                ) : (
                    <Button onClick={weaveIdentity} className="flex-grow py-4 bg-indigo-600 font-cinzel font-bold text-lg tracking-widest rounded-2xl shadow-2xl animate-pulse hover:bg-indigo-500">WEAVE SHARD</Button>
                )}
            </div>
          </motion.div>
        )}

        {step === 'weaving' && (
          <motion.div key="weaving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 text-indigo-300 z-10">
            <div className="relative w-40 h-40">
                <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-b-2 border-purple-400 rounded-full animate-spin-slow"></div>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-cinzel animate-pulse uppercase tracking-widest">Weaving</span>
            </div>
            <p className="text-slate-400 font-mono text-sm animate-pulse h-6">{weavingMessages[weavingMessageIdx]}</p>
          </motion.div>
        )}

        {step === 'reveal' && generatedProfile && (
          <motion.div key="reveal" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm md:max-w-md max-h-[95vh] flex flex-col items-center gap-4 overflow-y-auto custom-scrollbar p-3 z-10">
             <div className="w-full">
                {/* Traditional High-Quality Card Layout */}
                <div className="relative rounded-3xl border-[8px] md:border-[10px] border-amber-500 bg-slate-900/90 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.35)] p-3 md:p-4 space-y-3" style={{ aspectRatio: '2.5/3.8' }}>
                    {/* Holographic sparkle sheen */}
                    <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-35 mix-blend-overlay" />
                    
                    {/* Inner gold frame border */}
                    <div className="absolute inset-2 border border-amber-500/20 rounded-2xl pointer-events-none"></div>

                    {/* Header bar */}
                    <div className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 flex justify-between items-center z-10 shrink-0 shadow-md">
                        <span className="font-cinzel font-bold text-white text-lg md:text-xl drop-shadow-md truncate max-w-[65%]">{generatedProfile.name}</span>
                        <div className="flex gap-1 shrink-0">
                            <span className="text-[8px] md:text-[9px] bg-amber-500/20 text-amber-300 font-mono uppercase px-2 py-0.5 rounded border border-amber-500/30 font-bold">{generatedProfile.race}</span>
                        </div>
                    </div>

                    {/* Perfect central image frame */}
                    <div className="flex-grow relative rounded-2xl overflow-hidden border border-slate-700/80 bg-black shadow-inner flex flex-col">
                        {generatedProfile.avatarImageUrl ? (
                            <img 
                                src={generatedProfile.avatarImageUrl} 
                                className="w-full h-full object-cover object-top transition duration-500 hover:scale-[1.03]" 
                                alt={generatedProfile.name} 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700 text-6xl">
                                <i className="ri-user-6-fill"></i>
                            </div>
                        )}
                        {/* Subtly darkened bottom of image frame */}
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                        
                        {/* Elegant overlay badge for Class */}
                        <div className="absolute bottom-2.5 right-2.5 bg-indigo-600/95 backdrop-blur-sm text-white text-[8px] md:text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border border-indigo-400/40 uppercase tracking-widest shadow-lg">
                            {generatedProfile.class}
                        </div>
                    </div>

                    {/* Premium Description / Bio Window */}
                    <div className="bg-slate-950/95 p-3 md:p-4 border border-white/10 rounded-2xl italic text-xs md:text-sm text-slate-100 font-cormorant leading-relaxed min-h-[5.5rem] md:min-h-[6.5rem] flex items-center justify-center text-center backdrop-blur-sm z-10 shadow-lg shrink-0">
                        <p className="line-clamp-4 md:line-clamp-5">"{generatedProfile.bio}"</p>
                    </div>
                </div>
             </div>
             <Button onClick={() => onComplete(generatedProfile)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-xl font-cinzel font-bold tracking-widest rounded-2xl shadow-2xl shadow-emerald-900/40 border-b-4 border-emerald-800 transition-all transform hover:-translate-y-0.5 shrink-0">ENTER CODEX</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFunnel;