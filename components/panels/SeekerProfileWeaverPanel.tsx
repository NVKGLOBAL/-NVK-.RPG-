
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { SeekerProfile, MarketItem, SeekerProfileWeaverPanelProps } from '../../types';
import { 
  AgentName, 
  SeekerAvatarType, 
  SeekerClass, 
  SeekerGender, 
  SeekerEnergyAlignment, 
  SeekerAuraColor, 
  SeekerVisualFilter,
  ArtifactRarity,
  AgentRace 
} from '../../types';
import { 
  SEEKER_CLASSES, 
  ALL_GENDERS_LIST, 
  ALL_ALIGNMENTS_LIST, 
  SEEKER_AURA_OPTIONS, 
  SEEKER_VISUAL_FILTERS, 
  TRAIT_LISTS,
  AVATAR_RACES
} from '../../constants';
import { Button } from '../ui/Button';
import { useSovereignAI } from '../../context/SovereignAIContext';
import html2canvas from 'html2canvas';

// --- Random Name Generator ---
const NAME_PREFIXES = ["Xyl", "Chron", "Vor", "Zyn", "Kael", "Thal", "Om", "Lyra", "Vex", "Ser", "Dra", "Myr", "Pyr", "Cyp", "Nek", "Sol", "Zen", "Rin", "Kys", "Tor", "Ael", "Fen", "Grim"];
const NAME_SUFFIXES = ["os", "ia", "ex", "on", "is", "us", "ar", "or", "a", "yn", "ix", "um", "ra", "th", "en", "ir", "ae", "io", "ak", "ul"];

const generateRandomName = () => {
    const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
    const suffix = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
    return prefix + suffix;
};

// Helper function to get icon for card type
const getCardTypeIcon = (type: string): string => {
    switch (type) {
        case 'Creature': return 'ri-aliens-line';
        case 'NPC': return 'ri-user-star-line';
        case 'Boss': return 'ri-skull-2-line';
        case 'Location': return 'ri-map-pin-range-line';
        case 'Weapon': return 'ri-sword-line';
        case 'Companion': return 'ri-bear-smile-line';
        case 'Environment': return 'ri-landscape-line';
        case 'Relic': return 'ri-vip-diamond-line';
        case 'Consumable': return 'ri-flask-line';
        case 'Vehicle': return 'ri-rocket-line';
        case 'Augmentation': return 'ri-cpu-line';
        case 'Skin': return 'ri-t-shirt-line';
        case 'Mount': return 'ri-riding-line';
        case 'Dwelling': return 'ri-home-heart-line';
        case 'Skill': return 'ri-book-open-line';
        case 'Material': return 'ri-stack-line';
        case 'Service': return 'ri-service-line';
        case 'Collectible': return 'ri-trophy-line';
        case 'Fashion': return 'ri-shirt-line';
        case 'Food': return 'ri-restaurant-line';
        case 'Pet': return 'ri-bear-smile-line'; // Reuse
        case 'Music': return 'ri-music-line';
        case 'Tool': return 'ri-hammer-line';
        case 'Planet': return 'ri-earth-line';
        case 'Secret': return 'ri-eye-off-line';
        case 'Element': return 'ri-fire-line';
        case 'Cursed': return 'ri-skull-line';
        case 'Festival': return 'ri-flag-line';
        default: return 'ri-apps-2-line';
    }
}

// TCG Card Component
const TCGCard: React.FC<{ 
    name: string, 
    type: string, 
    rarity: ArtifactRarity, 
    imageUrl?: string, 
    description?: string, 
    stats?: { atk: number, def: number, res: number },
    auraColor?: string,
    secondaryAuraColor?: string,
    id?: string,
    isZoomed?: boolean
}> = ({ name, type, rarity, imageUrl, description, stats, auraColor, secondaryAuraColor, id, isZoomed = false }) => {
    const rarityColors = {
        [ArtifactRarity.Common]: 'border-slate-500 bg-slate-900',
        [ArtifactRarity.Uncommon]: 'border-emerald-500 bg-emerald-950',
        [ArtifactRarity.Rare]: 'border-blue-500 bg-blue-950',
        [ArtifactRarity.Legendary]: 'border-amber-500 bg-amber-950',
        [ArtifactRarity.Mythic]: 'border-fuchsia-500 bg-fuchsia-950',
        [ArtifactRarity.Anomalous]: 'border-rose-600 bg-rose-950',
    };

    const borderColor = rarityColors[rarity] || rarityColors[ArtifactRarity.Common];
    const auraHex = auraColor ? SEEKER_AURA_OPTIONS.find(a=>a.id === auraColor)?.hex : 'transparent';
    const secondaryAuraHex = secondaryAuraColor ? SEEKER_AURA_OPTIONS.find(a=>a.id === secondaryAuraColor)?.hex : 'transparent';

    return (
        <div 
            id={id} 
            className={`relative rounded-xl border-[8px] ${borderColor} flex flex-col overflow-hidden shadow-2xl transition-transform duration-300 ${isZoomed ? 'scale-105' : ''}`}
            style={{ 
                aspectRatio: '2.5/3.5',
                boxShadow: auraColor ? `0 0 40px ${auraHex}40, 0 0 20px ${secondaryAuraHex}30` : 'none'
            }}
        >
            {/* Holographic Overlay */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-30 mix-blend-overlay" />
            
            {/* Header - Semi Transparent Glass */}
            <div className="bg-black/20 backdrop-blur-sm p-4 flex justify-between items-center border-b border-white/10 z-10 relative overflow-visible">
                <div className="flex flex-col overflow-visible">
                    <span className="font-cinzel font-bold text-white text-lg md:text-xl leading-[1.6] pb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] block">
                      {name}
                    </span>
                    <span className="text-[7px] text-indigo-300 font-mono uppercase tracking-[0.2em] opacity-80">
                        {auraColor} / {secondaryAuraColor} Sync
                    </span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" style={{color: auraHex}}></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-current opacity-50 shadow-[0_0_8px_currentColor]" style={{color: secondaryAuraHex}}></div>
                </div>
            </div>

            {/* Image Area */}
            <div className="absolute inset-0 z-0 bg-black">
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <i className={`${getCardTypeIcon(type)} text-8xl opacity-30`}></i>
                    </div>
                )}
                 {/* Inner Frame */}
                 <div className="absolute inset-3 border border-white/20 rounded-lg opacity-40 pointer-events-none"></div>
            </div>

            {/* Spacer to push content down */}
            <div className="flex-1 z-10"></div>

            {/* Info Bar - Glass */}
            <div className="bg-slate-900/30 backdrop-blur-md p-2 flex justify-between items-center border-t border-b border-white/10 z-10 relative">
                <span className="text-[10px] uppercase tracking-wider text-slate-100 font-bold drop-shadow-md">{type}</span>
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded shadow-sm ${rarity === 'Legendary' ? 'text-amber-100 bg-amber-900/60 border border-amber-500/30' : 'text-slate-200 bg-slate-800/60'}`}>{rarity}</span>
            </div>

            {/* Text Box - High Transparency Glass */}
            <div className="h-[28%] bg-slate-950/75 backdrop-blur-md p-4 text-sm text-slate-100 font-cormorant italic leading-snug overflow-hidden relative z-10 border-t border-white/10">
                {description || "No data available."}
            </div>

            {/* Footer Stats */}
            {stats && (
                <div className="bg-black/60 backdrop-blur-md p-2 flex justify-around items-center border-t border-white/10 z-10 relative text-sm font-mono font-bold tracking-wider">
                    <div className="flex items-center text-red-400 drop-shadow-md"><i className="ri-sword-fill mr-1.5"></i>{stats.atk}</div>
                    <div className="flex items-center text-blue-400 drop-shadow-md"><i className="ri-shield-fill mr-1.5"></i>{stats.def}</div>
                    <div className="flex items-center text-purple-400 drop-shadow-md"><i className="ri-flashlight-fill mr-1.5"></i>{stats.res}</div>
                </div>
            )}
        </div>
    );
};

const SeekerProfileWeaverPanel: React.FC<SeekerProfileWeaverPanelProps> = ({
  addEchoMessage,
  onProfileCreated,
  existingProfile,
  onUpdateProfile,
  width,
  height
}) => {
  const [name, setName] = useState(existingProfile?.name || '');
  const [race, setRace] = useState<SeekerAvatarType>(existingProfile?.race || SeekerAvatarType.Human);
  const [seekerClass, setSeekerClass] = useState<SeekerClass>(existingProfile?.class || SeekerClass.Gatewalker);
  const [gender, setGender] = useState<SeekerGender>(existingProfile?.gender || SeekerGender.NonBinary);
  const [alignment, setAlignment] = useState<SeekerEnergyAlignment>(existingProfile?.energyAlignment || SeekerEnergyAlignment.Balanced);
  const [aura, setAura] = useState<SeekerAuraColor>(existingProfile?.auraColor || SeekerAuraColor.Azure);
  const [secondaryAura, setSecondaryAura] = useState<SeekerAuraColor>(existingProfile?.auraSecondaryColor || SeekerAuraColor.Violet);
  const [visualFilter, setVisualFilter] = useState<SeekerVisualFilter>(existingProfile?.visualFilter || SeekerVisualFilter.Cyberpunk);
  
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(existingProfile?.avatarImageUrl);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [isWeavingBio, setIsWeavingBio] = useState(false);

  const [activeTab, setActiveTab] = useState<'profile' | 'grimoire'>('profile');
  
  const [faction, setFaction] = useState(existingProfile?.faction || '');
  const [newTraitInput, setNewTraitInput] = useState('');
  const [editableTraits, setEditableTraits] = useState<string[]>(existingProfile?.selfTraits || []);
  const { generateImage, invokeAI } = useSovereignAI();

  // Update local state if existingProfile changes externally
  useEffect(() => {
    if (existingProfile) {
      setName(existingProfile.name);
      setRace(existingProfile.race);
      if (existingProfile.class) setSeekerClass(existingProfile.class);
      setGender(existingProfile.gender);
      setAlignment(existingProfile.energyAlignment);
      if (existingProfile.auraColor) setAura(existingProfile.auraColor);
      if (existingProfile.auraSecondaryColor) setSecondaryAura(existingProfile.auraSecondaryColor);
      if (existingProfile.visualFilter) setVisualFilter(existingProfile.visualFilter);
      setAvatarUrl(existingProfile.avatarImageUrl);
      setFaction(existingProfile.faction || '');
      setEditableTraits(existingProfile.selfTraits || []);
    }
  }, [existingProfile]);

  const handleRandomizeProfile = () => {
      setName(generateRandomName());
      setRace(AVATAR_RACES[Math.floor(Math.random() * AVATAR_RACES.length)].id as SeekerAvatarType);
      setSeekerClass(SEEKER_CLASSES[Math.floor(Math.random() * SEEKER_CLASSES.length)].id as SeekerClass);
      setGender(ALL_GENDERS_LIST[Math.floor(Math.random() * ALL_GENDERS_LIST.length)]);
      setAlignment(ALL_ALIGNMENTS_LIST[Math.floor(Math.random() * ALL_ALIGNMENTS_LIST.length)]);
      setAura(SEEKER_AURA_OPTIONS[Math.floor(Math.random() * SEEKER_AURA_OPTIONS.length)].id as SeekerAuraColor);
      setSecondaryAura(SEEKER_AURA_OPTIONS[Math.floor(Math.random() * SEEKER_AURA_OPTIONS.length)].id as SeekerAuraColor);
      setVisualFilter(SEEKER_VISUAL_FILTERS[Math.floor(Math.random() * SEEKER_VISUAL_FILTERS.length)].id as SeekerVisualFilter);
      addEchoMessage(AgentName.System, "Randomized Identity Parameters.", "text-cyan-300");
  };

  const handleGenerateAvatar = async () => {
      if (isGeneratingAvatar || !name || !race || !seekerClass) {
          if(!name) addEchoMessage(AgentName.System, "Name required for avatar generation.", "text-yellow-400");
          return;
      }
      
      setIsGeneratingAvatar(true);
      addEchoMessage(AgentName.SeekerProfileWeaverAgent, "Weaving visual avatar with dual resonance...", "text-indigo-300");
      
      const equipStr = existingProfile 
        ? `Wearing ${existingProfile.equippedOutfit?.name || 'standard gear'}, Wielding ${existingProfile.equippedWeapon?.name || 'basic weapon'}.`
        : '';

      const prompt = `Portrait of a ${gender} ${race} ${seekerClass}, sci-fi fantasy style, detailed. 
      Lighting: Bi-tonal glow featuring a primary ${aura.toLowerCase()} aura with intricate ${secondaryAura.toLowerCase()} secondary resonance frequency patterns.
      ${visualFilter} aesthetic. face visible. ${equipStr} 
      IMPORTANT: No text, no words, no paragraphs in image. Purely visual portrait.`;
      
      try {
          const url = await generateImage(prompt);
          if (url) {
              setAvatarUrl(url);
              addEchoMessage(AgentName.SeekerProfileWeaverAgent, "Avatar manifested with bi-tonal resonance.", "text-emerald-300");
          } else {
              addEchoMessage(AgentName.System, "Avatar generation failed.", "text-rose-400");
          }
      } catch (e) {
          console.error(e);
          addEchoMessage(AgentName.System, "Error generating avatar.", "text-rose-400");
      } finally {
          setIsGeneratingAvatar(false);
      }
  };

  const handleCreateOrUpdate = async () => {
    if (!name.trim()) {
        addEchoMessage(AgentName.System, "Identity requires a name.", "text-rose-400");
        return;
    }

    if (isWeavingBio) return;

    const selfTraits = editableTraits.length > 0 ? editableTraits : (existingProfile?.selfTraits || [
        TRAIT_LISTS.self[Math.floor(Math.random() * TRAIT_LISTS.self.length)],
        TRAIT_LISTS.self[Math.floor(Math.random() * TRAIT_LISTS.self.length)]
    ]);
    
    const codexTraits = existingProfile?.codexTraits || [
        TRAIT_LISTS.codex[Math.floor(Math.random() * TRAIT_LISTS.codex.length)]
    ];

    setIsWeavingBio(true);
    addEchoMessage(AgentName.SeekerProfileWeaverAgent, "Weaving legendary biography...", "text-fuchsia-300");
    
    let bio = existingProfile?.bio || "";
    
    try {
        const bioPrompt = `Write a 2-sentence epic, mystical backstory for a ${gender} ${race} ${seekerClass} named ${name} with ${alignment} alignment and a rare ${aura}/${secondaryAura} resonance. Tone: Mysterious.`;
        const generatedBio = await invokeAI(bioPrompt, "You are a master storyteller for a cosmic RPG.");
        if (generatedBio) {
            bio = generatedBio;
            addEchoMessage(AgentName.SeekerProfileWeaverAgent, "Biography inscribed.", "text-emerald-300");
        }
    } catch (e) {
        console.warn("Bio generation failed", e);
    }

    const newProfile: SeekerProfile = {
        ...(existingProfile || {
            id: `seeker-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            generatedAt: Date.now(),
            level: 1,
            experience: 0,
            flux: 100,
            inventory: [],
            selfTraits: [],
            codexTraits: []
        }),
        name,
        race,
        class: seekerClass,
        gender,
        energyAlignment: alignment,
        auraColor: aura,
        auraSecondaryColor: secondaryAura,
        visualFilter,
        faction: (faction || existingProfile?.faction) as SeekerProfile['faction'],
        selfTraits: Array.from(new Set(selfTraits)),
        codexTraits: Array.from(new Set(codexTraits)),
        avatarImageUrl: avatarUrl,
        bio: bio
    };

    if (existingProfile && onUpdateProfile) {
        onUpdateProfile(newProfile);
        addEchoMessage(AgentName.SeekerProfileWeaverAgent, `Profile updated for ${name}.`, "text-emerald-300");
    } else if (onProfileCreated) {
        onProfileCreated(newProfile);
        addEchoMessage(AgentName.SeekerProfileWeaverAgent, `Identity woven: ${name}.`, "text-cyan-300");
    }
    
    setIsWeavingBio(false);
  };

  const handleDownloadCard = () => {
      const cardElement = document.getElementById('seeker-tcg-card');
      if (cardElement) {
          setTimeout(() => {
              html2canvas(cardElement, {
                  backgroundColor: null,
                  scale: 3, 
                  useCORS: true,
                  allowTaint: true
              }).then(canvas => {
                  const link = document.createElement('a');
                  link.download = `TCG_Card_${name.replace(/\s+/g, '_') || 'Seeker'}.png`;
                  link.href = canvas.toDataURL('image/png');
                  link.click();
                  addEchoMessage(AgentName.SeekerProfileWeaverAgent, "TCG Identity Card materialized.", "text-emerald-300");
              });
          }, 100);
      }
  };

  const seekerStats = existingProfile ? {
      atk: Math.floor(existingProfile.level * 10 + (existingProfile.flux / 100)),
      def: Math.floor(existingProfile.level * 8 + (existingProfile.inventory.length * 2)),
      res: Math.floor(existingProfile.level * 12 + 5)
  } : { atk: 10, def: 10, res: 10 };

  return (
    <div 
        className="seeker-profile-weaver-panel bg-slate-950/90 backdrop-blur-xl border border-indigo-600/50 rounded-xl shadow-2xl flex flex-col my-4 overflow-hidden" 
        style={{ width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%', height: height ? (typeof height === 'number' ? `${height}px` : height) : '500px' }}
    >
      <div className="p-4 border-b border-indigo-800/50 bg-slate-900/50 flex justify-between items-center shrink-0">
        <h3 className="text-xl font-cinzel font-bold text-indigo-300 flex items-center">
            <i className="ri-user-6-line mr-2"></i>Seeker Identity Loom
        </h3>
        {existingProfile && (
            <div className="flex gap-2">
                <button onClick={() => setActiveTab('profile')} className={`px-3 py-1 rounded text-xs font-bold transition-colors ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>Profile</button>
                 <button onClick={() => setActiveTab('grimoire')} className={`px-3 py-1 rounded text-xs font-bold transition-colors ${activeTab === 'grimoire' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>Grimoire ({existingProfile.inventory.length})</button>
            </div>
        )}
      </div>

      <div className="flex-grow overflow-hidden flex flex-col relative">
        {activeTab === 'profile' && (
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                <div className="flex flex-col xl:flex-row gap-8 items-center xl:items-start">
                    <div className="w-full max-w-sm md:w-[420px] flex-shrink-0 relative group mx-auto xl:mx-0 overflow-visible">
                         <TCGCard 
                            id="seeker-tcg-card"
                            name={name || "Unknown Seeker"}
                            type={`${race} ${seekerClass}`}
                            rarity={ArtifactRarity.Legendary}
                            imageUrl={avatarUrl}
                            description={existingProfile?.bio || `A ${alignment} ${race} wandering the Codex.`}
                            stats={seekerStats}
                            auraColor={aura}
                            secondaryAuraColor={secondaryAura}
                            isZoomed
                         />
                         <div className="mt-6 flex flex-col gap-3">
                            <div className="flex gap-2">
                                 <Button onClick={handleCreateOrUpdate} disabled={isWeavingBio} className="flex-grow py-2 bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600 shadow-lg font-cinzel font-bold text-xs tracking-wide rounded-lg">
                                    {isWeavingBio ? 'WEAVING...' : (existingProfile ? 'UPDATE IDENTITY' : 'WEAVE IDENTITY')}
                                </Button>
                                 <Button onClick={handleGenerateAvatar} disabled={isGeneratingAvatar} className="flex-grow text-xs py-2 bg-indigo-700 hover:bg-indigo-600 shadow-lg">
                                    {isGeneratingAvatar ? <i className="ri-loader-4-line animate-spin"></i> : 'GENERATE ART'} 
                                </Button>
                            </div>
                             <Button onClick={handleDownloadCard} disabled={!avatarUrl} className="w-full text-xs py-2 bg-slate-700 hover:bg-slate-600">
                                SAVE CARD
                            </Button>
                         </div>
                    </div>

                    <div className="flex-grow w-full space-y-5 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                        <div className="grid grid-cols-1 gap-5">
                             <div className="space-y-1.5">
                                <label className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Designation</label>
                                <div className="flex gap-2">
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="flex-grow bg-slate-800 border border-slate-600 rounded-lg p-3 text-slate-100 outline-none" placeholder="Enter Seeker Name..."/>
                                    <button onClick={handleRandomizeProfile} className="px-4 bg-slate-800 border border-slate-600 rounded-lg hover:bg-indigo-900/50 text-indigo-400 transition-all"><i className="ri-dice-fill text-xl"></i></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Biomorph</label>
                                    <select value={race} onChange={e => setRace(e.target.value as SeekerAvatarType)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-slate-100 outline-none">
                                        {AVATAR_RACES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Archetype</label>
                                     <select value={seekerClass} onChange={e => setSeekerClass(e.target.value as SeekerClass)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-slate-100 outline-none">
                                        {SEEKER_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                             <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Primary Resonance</label>
                                    <select value={aura} onChange={e => setAura(e.target.value as SeekerAuraColor)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-slate-100 outline-none">
                                        {SEEKER_AURA_OPTIONS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-cyan-300 font-bold uppercase tracking-wider">Sub-Resonance Echo</label>
                                     <select value={secondaryAura} onChange={e => setSecondaryAura(e.target.value as SeekerAuraColor)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-slate-100 outline-none">
                                        {SEEKER_AURA_OPTIONS.map(a => <option key={a.id + '_s'} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Alignment</label>
                                     <select value={alignment} onChange={e => setAlignment(e.target.value as SeekerEnergyAlignment)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-slate-100 outline-none">
                                        {ALL_ALIGNMENTS_LIST.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Visual Filter</label>
                                     <select value={visualFilter} onChange={e => setVisualFilter(e.target.value as SeekerVisualFilter)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-slate-100 outline-none">
                                        {SEEKER_VISUAL_FILTERS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-800">
                                <label className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Knowledge Traits & Tags</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {editableTraits.map((trait) => (
                                        <span key={trait} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200">
                                            {trait}
                                            <button
                                                type="button"
                                                onClick={() => setEditableTraits(prev => prev.filter(t => t !== trait))}
                                                className="text-slate-400 hover:text-rose-400 ml-1"
                                                aria-label={`Remove trait ${trait}`}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTraitInput}
                                        onChange={(e) => setNewTraitInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newTraitInput.trim()) {
                                                e.preventDefault();
                                                setEditableTraits(prev => Array.from(new Set([...prev, newTraitInput.trim()])));
                                                setNewTraitInput('');
                                            }
                                        }}
                                        placeholder="Add custom trait or knowledge tag..."
                                        className="flex-grow bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (newTraitInput.trim()) {
                                                setEditableTraits(prev => Array.from(new Set([...prev, newTraitInput.trim()])));
                                                setNewTraitInput('');
                                            }
                                        }}
                                        className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-2"
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'grimoire' && existingProfile && (
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Equipped Weapon', item: existingProfile.equippedWeapon, icon: 'ri-sword-line', color: 'text-rose-400' },
                        { label: 'Equipped Outfit', item: existingProfile.equippedOutfit, icon: 'ri-t-shirt-line', color: 'text-emerald-400' },
                        { label: 'Equipped Relic', item: existingProfile.equippedRelic, icon: 'ri-vip-diamond-line', color: 'text-amber-400' },
                        { label: 'Companion Bond', item: existingProfile.equippedCompanion, icon: 'ri-bear-smile-line', color: 'text-cyan-400' },
                    ].map((slot) => (
                        <div key={slot.label} className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-4 space-y-2">
                            <div className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 ${slot.color}`}>
                                <i className={slot.icon}></i>
                                {slot.label}
                            </div>
                            <div className="text-sm font-cinzel font-bold text-white">
                                {slot.item ? slot.item.name : 'Unbound Slot'}
                            </div>
                            <p className="text-xs text-slate-400 font-cormorant italic">
                                {slot.item ? slot.item.description : 'Acquire or equip items in RPG Nexus.'}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <h4 className="font-cinzel font-bold text-indigo-300 text-sm uppercase">
                            Bound Inventory & Relics ({existingProfile.inventory.length})
                        </h4>
                        <span className="text-xs font-mono text-amber-400">{existingProfile.flux} Flux</span>
                    </div>
                    {existingProfile.inventory.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-4 text-center">No inventory shards bound yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {existingProfile.inventory.map((item) => (
                                <div key={item.id} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                                        <i className={getCardTypeIcon(item.type)}></i>
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                        <div className="text-xs font-bold text-slate-100 truncate">{item.name}</div>
                                        <div className="text-[10px] font-mono text-slate-400 uppercase">{item.type} • {item.rarity}</div>
                                        {item.combatStats && (
                                            <div className="text-[10px] font-mono text-indigo-300 mt-1">
                                                ATK {item.combatStats.atk} / DEF {item.combatStats.def} / RES {item.combatStats.res}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SeekerProfileWeaverPanel;
