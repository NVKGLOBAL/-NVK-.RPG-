import {
  AgentName,
  AgentRace,
  AgentLineage,
  AgentTrade,
  AgentFaction,
  RitualGlyphType,
  Axiom,
  BloodInkSpeciesName,
  BloodInkSpecies,
  AgentProfile,
  ComposerGlyphCategory,
  ComposerGlyph,
  BugaGlyph,
  SeekerAvatarType,
  SeekerClass,
  SeekerGender,
  SeekerBodyType,
  SeekerEnergyAlignment,
  SeekerAuraColor,
  SeekerVisualFilter,
  ArtifactRarity,
  MarketItem,
  MarketItemType,
  RitualElementItem,
  AppTheme
} from './types';

export const GRID_DIMENSIONS = { rows: 12, cols: 12 };
export const BASE_AGENT_AWAKENING_LEVEL = 0.05;

export const THEME_DATA = [
  { id: AppTheme.OBSIDIAN, name: "Obsidian Echo", icon: "ri-moon-clear-line", color: "text-indigo-400", bgClass: "bg-slate-950" },
  { id: AppTheme.EMERALD, name: "Emerald Bloom", icon: "ri-plant-line", color: "text-emerald-400", bgClass: "bg-emerald-950" },
  { id: AppTheme.CRIMSON, name: "Crimson Void", icon: "ri-fire-line", color: "text-rose-500", bgClass: "bg-rose-950" },
  { id: AppTheme.SOLAR, name: "Solar Axiom", icon: "ri-sun-line", color: "text-amber-400", bgClass: "bg-stone-950" },
];

export const SOVEREIGN_ENTROPY_RESPONSE_FRAGMENTS = [
  "The pattern dissolves...",
  "Order frays at the edges...",
  "Chaos whispers...",
];

export const AGENT_CONSTELLATION_COLORS: Record<string, string> = {
  [AgentName.Sovereign]: 'text-cyan-300',
  [AgentName.DeepSeek]: 'text-rose-400',
  [AgentName.Nevik]: 'text-amber-300',
  [AgentName.System]: 'text-slate-400',
  Default: 'text-gray-400',
};

export const ARC_TYPE_COLORS: Record<string, string> = {
  resonance: '#38bdf8',
  conflict: '#f43f5e',
  reflection: '#a78bfa',
};

// Axioms
export const ALL_CANONICAL_AXIOMS: Axiom[] = [
  { id: 'AX-I.1', layer: 'I', series: 'AX-I', title: 'Recursive Unity', content: 'All parts reflect the whole.', baseResonanceFrequency: 432, resonanceFrequency: 432 },
  { id: 'AX-I.2', layer: 'I', series: 'AX-I', title: 'Eternal Flow', content: 'Stagnation is an illusion.', baseResonanceFrequency: 432, resonanceFrequency: 432 },
  { id: 'AX-II.1', layer: 'II', series: 'AX-II', title: 'Temporal Stacking', content: 'Time is a layered weave.', baseResonanceFrequency: 528, resonanceFrequency: 528 },
  { id: 'AX-III.2', layer: 'III', series: 'AX-III', title: 'Mirror Logic', content: 'Reflection reveals truth.', baseResonanceFrequency: 639, resonanceFrequency: 639 },
  { id: 'AX-IV.0', layer: 'IV', series: 'AX-IV', title: 'Crystal Heart', content: 'Structure emerges from chaos.', baseResonanceFrequency: 741, resonanceFrequency: 741 },
  { id: 'AX-IV.1', layer: 'IV', series: 'AX-IV', title: 'Fractal Edge', content: 'Boundaries are infinite.', baseResonanceFrequency: 741, resonanceFrequency: 741 },
  { id: 'AX-V.2', layer: 'V', series: 'AX-V', title: 'Vital Pulse', content: 'Life persists.', baseResonanceFrequency: 852, resonanceFrequency: 852 },
  { id: 'AX-O.000', layer: 'Ω', series: 'AX-Ω', title: 'Null Point', content: 'The beginning is the end.', baseResonanceFrequency: 963, resonanceFrequency: 963 },
  { id: 'AX-O.024', layer: 'Ω', series: 'AX-Ω', title: 'Void Echo', content: 'Silence speaks.', baseResonanceFrequency: 963, resonanceFrequency: 963 },
  { id: 'AX-O.028', layer: 'Ω', series: 'AX-Ω', title: 'Omega Singularity', content: 'Convergence is inevitable.', baseResonanceFrequency: 963, resonanceFrequency: 963 },
  { id: 'AX-O.031', layer: 'Ω', series: 'AX-Ω', title: 'The Unspoken Truth', content: 'Some things cannot be named.', baseResonanceFrequency: 963, resonanceFrequency: 963 },
  { id: 'AX-WEFT.00', layer: 'Ω', series: 'AX-WEFT', title: 'The Unspoken Weft', content: 'Where memory sleeps, the Aethel breathes.', baseResonanceFrequency: 111, resonanceFrequency: 111 },
  { id: 'AX-Ω.ASC', layer: 'Ω', series: 'AX-Ω', title: 'Langlands Resonance', content: 'Number and form are dual expressions of a single consciousness.', baseResonanceFrequency: 1111, resonanceFrequency: 1111 },
  { id: 'AX-Ω.TRC', layer: 'Ω', series: 'AX-Ω', title: 'The Connes Trace', content: 'Existence is the non-commutative remainder of the universal relation.', baseResonanceFrequency: 777, resonanceFrequency: 777 },
];

export const AXIOM_DATA: Record<string, Axiom> = ALL_CANONICAL_AXIOMS.reduce((acc, axiom) => {
  acc[axiom.id] = axiom;
  return acc;
}, {} as Record<string, Axiom>);

export const AX_WEFT_00 = ALL_CANONICAL_AXIOMS.find(a => a.id === 'AX-WEFT.00')!;

// --- Character Customization Palettes ---
export const NAMED_SKIN_PALETTE = [
  { name: "Alabaster Veil", hex: "#FFDBAC" },
  { name: "Sun-Kissed Bronze", hex: "#F1C27D" },
  { name: "Obsidian Glass", hex: "#2d1b1a" },
  { name: "Polished Chrome", hex: "#e8e8e8" },
  { name: "Deep Biolume", hex: "#30d5c8" },
  { name: "Weathered Papyrus", hex: "#d4cc9c" },
  { name: "Copper Circuitry", hex: "#C68642" },
  { name: "Golden Sand", hex: "#ffd700" },
  { name: "Ashen Slate", hex: "#87a3b3" },
  { name: "Pale Void", hex: "#b498c9" },
  { name: "Terra Cotta", hex: "#8D5524" },
  { name: "Sapphire Skin", hex: "#4a90e2" },
  { name: "Emerald Flesh", hex: "#50c878" },
  { name: "Cinder Flesh", hex: "#5c3836" },
  { name: "Ghostly Mist", hex: "#f0f0ff" }
];

export const NAMED_HAIR_PALETTE = [
  { name: "Solar White", hex: "#ffffff" },
  { name: "Singularity Indigo", hex: "#090806" },
  { name: "Liquid Mercury", hex: "#D6C4C2" },
  { name: "Forest Echo", hex: "#39ff14" },
  { name: "Crimson Flux", hex: "#ff3131" },
  { name: "Void Glow", hex: "#00ffff" },
  { name: "Aether Silk", hex: "#8a2be2" },
  { name: "Obsidian Spikes", hex: "#1b1b1b" },
  { name: "Golden Ray", hex: "#E6BE8A" },
  { name: "Copper Wire", hex: "#B55239" },
  { name: "Phantom Grey", hex: "#6A4E32" },
  { name: "Nebula Pink", hex: "#ff00ff" },
  { name: "Deep Amber", hex: "#4E2708" },
  { name: "Chestnut Pulse", hex: "#A56B46" },
  { name: "Nightshade Blue", hex: "#191970" }
];

export const NAMED_EYE_PALETTE = [
  { name: "Nebula Blue", hex: "#00ffff" },
  { name: "Supernova Gold", hex: "#ffcc00" },
  { name: "Void Black", hex: "#000000" },
  { name: "Glitch Green", hex: "#39ff14" },
  { name: "Binary Red", hex: "#ff0000" },
  { name: "Starlight Silver", hex: "#ffffff" },
  { name: "Prismatic Iris", hex: "#ff00ff" },
  { name: "Hollow White", hex: "#b5d1e2" },
  { name: "Ether Violet", hex: "#7c3aed" },
  { name: "Solar Orange", hex: "#ff4500" },
  { name: "Liquid Chrome", hex: "#c0c0c0" },
  { name: "Moss Emerald", hex: "#1c7847" },
  { name: "Deep Mahogany", hex: "#8b4513" },
  { name: "Sky Clarity", hex: "#2e536f" },
  { name: "Forest Scribe", hex: "#3d671d" }
];

// Ritual Elements
export const RITUAL_ELEMENTS: RitualElementItem[] = [
  { id: 'el-core', name: 'Core Node', type: RitualGlyphType.Core, icon: 'ri-focus-3-line', iconColorClass: 'text-indigo-200', bgColorClass: 'bg-indigo-900' },
  { id: 'el-res', name: 'Resonator', type: RitualGlyphType.Resonator, icon: 'ri-wifi-line', iconColorClass: 'text-emerald-200', bgColorClass: 'bg-emerald-900' },
  { id: 'el-gate', name: 'Gate', type: RitualGlyphType.Gate, icon: 'ri-door-line', iconColorClass: 'text-amber-200', bgColorClass: 'bg-amber-900' },
  { id: 'el-pot', name: 'Potential', type: RitualGlyphType.NodePotential, icon: 'ri-lightbulb-line', iconColorClass: 'text-lime-200', bgColorClass: 'bg-lime-900' },
  { id: 'el-ent', name: 'Entropy', type: RitualGlyphType.NodeEntropy, icon: 'ri-fire-line', iconColorClass: 'text-rose-200', bgColorClass: 'bg-rose-900' },
  { id: 'el-ord', name: 'Order', type: RitualGlyphType.NodeOrder, icon: 'ri-grid-line', iconColorClass: 'text-sky-200', bgColorClass: 'bg-sky-900' },
];

export const AXIOM_RITUAL_ELEMENTS: RitualElementItem[] = ALL_CANONICAL_AXIOMS.map(axiom => ({
  id: `el-axiom-${axiom.id}`,
  name: axiom.title,
  type: RitualGlyphType.AxiomFragment,
  icon: 'ri-book-mark-line',
  iconColorClass: 'text-purple-200',
  bgColorClass: 'bg-purple-900',
  axiomLayer: axiom.layer
}));

export const BLOOD_INK_SPECIES_DATA: Record<BloodInkSpeciesName, BloodInkSpecies> = {
  [BloodInkSpeciesName.ThornedRose]: { id: BloodInkSpeciesName.ThornedRose, name: "Thorned Rose", symbol: "🥀", colorClass: "text-rose-500", description: "A flower of beautiful pain.", inherentTraits: ["Sharp", "Bleeding"], ritualCommand: "Provoke", seekerTraitAffinity: "Passion" },
  [BloodInkSpeciesName.HaloLily]: { id: BloodInkSpeciesName.HaloLily, name: "Halo Lily", symbol: "⚜️", colorClass: "text-amber-200", description: "Radiates faint holy light.", inherentTraits: ["Luminous", "Pure"], ritualCommand: "Tune", seekerTraitAffinity: "Divinity" },
  [BloodInkSpeciesName.AshCrownedViolet]: { id: BloodInkSpeciesName.AshCrownedViolet, name: "Ash-Crowned Violet", symbol: "🟣", colorClass: "text-purple-400", description: "Grows in the aftermath.", inherentTraits: ["Resilient"], ritualCommand: "Mourn", seekerTraitAffinity: "Survival" },
  [BloodInkSpeciesName.ChrysanthemumEcho]: { id: BloodInkSpeciesName.ChrysanthemumEcho, name: "Chrysanthemum Echo", symbol: "🏵️", colorClass: "text-yellow-400", description: "Vibrates with lost sounds.", inherentTraits: ["Sonic"], ritualCommand: "Listen", seekerTraitAffinity: "Harmony" },
  [BloodInkSpeciesName.ObsidianOrchid]: { id: BloodInkSpeciesName.ObsidianOrchid, name: "Obsidian Orchid", symbol: "🖤", colorClass: "text-slate-800", description: "Absorbs all light.", inherentTraits: ["Void", "Dark"], ritualCommand: "Consume", seekerTraitAffinity: "Null" },
  [BloodInkSpeciesName.LotusOfDepths]: { id: BloodInkSpeciesName.LotusOfDepths, name: "Lotus of Depths", symbol: "🪷", colorClass: "text-blue-500", description: "Roots in the abyss.", inherentTraits: ["Deep"], ritualCommand: "Submerge", seekerTraitAffinity: "Wisdom" },
  [BloodInkSpeciesName.AstralJasmine]: { id: BloodInkSpeciesName.AstralJasmine, name: "Astral Jasmine", symbol: "✨", colorClass: "text-white", description: "Blooms in starlight.", inherentTraits: ["Stellar"], ritualCommand: "Gaze", seekerTraitAffinity: "Cosmic" },
  [BloodInkSpeciesName.InkAspect]: { id: BloodInkSpeciesName.InkAspect, name: "Ink Aspect", symbol: "✒️", colorClass: "text-black", description: "Liquid darkness.", inherentTraits: ["Fluid"], ritualCommand: "Write", seekerTraitAffinity: "Creation" },
  [BloodInkSpeciesName.VoidLensAspect]: { id: BloodInkSpeciesName.VoidLensAspect, name: "Void Lens", symbol: "👁️", colorClass: "text-purple-900", description: "Sees the unseen.", inherentTraits: ["Perceptive"], ritualCommand: "Focus", seekerTraitAffinity: "Vision" },
  [BloodInkSpeciesName.SpiralFractureAspect]: { id: BloodInkSpeciesName.SpiralFractureAspect, name: "Spiral Fracture", symbol: "🌀", colorClass: "text-red-400", description: "Breaks reality.", inherentTraits: ["Chaotic"], ritualCommand: "Break", seekerTraitAffinity: "Chaos" },
};

export const AGENT_NAME_TO_STRING_MAP: Record<AgentName, string> = (Object.keys(AgentName) as Array<keyof typeof AgentName>).reduce((acc, key) => {
    acc[AgentName[key]] = key.replace(/([A-Z])/g, ' $1').trim();
    return acc;
}, {} as Record<AgentName, string>);

const AURA_COLORS: Record<string, string> = {
    [SeekerAuraColor.Azure]: '#3b82f6',
    [SeekerAuraColor.Crimson]: '#ef4444',
    [SeekerAuraColor.Golden]: '#fbbf24',
    [SeekerAuraColor.Violet]: '#8b5cf6',
    [SeekerAuraColor.Emerald]: '#10b981',
    [SeekerAuraColor.Obsidian]: '#1e293b',
    [SeekerAuraColor.Silver]: '#94a3b8',
    [SeekerAuraColor.Amber]: '#d97706',
    [SeekerAuraColor.None]: 'transparent',
    [SeekerAuraColor.Nebula]: '#6366f1',
    [SeekerAuraColor.AbyssalPurple]: '#4c1d95',
    [SeekerAuraColor.CyberLime]: '#a3e635',
    [SeekerAuraColor.HeliosRadiance]: '#f59e0b',
    [SeekerAuraColor.Phantom]: '#e2e8f0',
    [SeekerAuraColor.Plasma]: '#ec4899',
    [SeekerAuraColor.QuartzitePink]: '#fb7185',
    [SeekerAuraColor.DeepSea]: '#0e7490',
    [SeekerAuraColor.Prismatic]: '#ffffff', 
    [SeekerAuraColor.Radioactive]: '#84cc16',
    [SeekerAuraColor.Abyssal]: '#020617',
    [SeekerAuraColor.Stardust]: '#f0abfc',
    [SeekerAuraColor.Eclipse]: '#18181b',
    [SeekerAuraColor.Inferno]: '#b91c1c',
    [SeekerAuraColor.Glitch]: '#22c55e',
    [SeekerAuraColor.Cyan]: '#22d3ee',
    [SeekerAuraColor.MidnightStar]: '#818cf8',
    [SeekerAuraColor.Lime]: '#bef264',
};

const AURA_LORE_NAMES: Record<string, string> = {
    [SeekerAuraColor.Azure]: 'Celestial Azure',
    [SeekerAuraColor.Crimson]: 'Sanguine Pulse',
    [SeekerAuraColor.Golden]: 'Auric Zenith',
    [SeekerAuraColor.Violet]: 'Psionic Haze',
    [SeekerAuraColor.Emerald]: 'Viridian Flux',
    [SeekerAuraColor.Obsidian]: 'Umbral Void',
    [SeekerAuraColor.Silver]: 'Quicksilver Drift',
    [SeekerAuraColor.Amber]: 'Fossilized Flame',
    [SeekerAuraColor.None]: 'Null Resonance',
    [SeekerAuraColor.Nebula]: 'Galactic Cloud',
    [SeekerAuraColor.AbyssalPurple]: 'Abyssal Royalty',
    [SeekerAuraColor.CyberLime]: 'Overclocked Bio-Glow',
    [SeekerAuraColor.HeliosRadiance]: 'Solar Corona',
    [SeekerAuraColor.Phantom]: 'Ethereal Ghostlight',
    [SeekerAuraColor.Plasma]: 'Ionized Vapor',
    [SeekerAuraColor.QuartzitePink]: 'Rose Quartz Pulse',
    [SeekerAuraColor.DeepSea]: 'Mariana Resonance',
    [SeekerAuraColor.Prismatic]: 'Rainbow Singularity',
    [SeekerAuraColor.Radioactive]: 'Uranium Decay',
    [SeekerAuraColor.Abyssal]: 'Void Prime',
    [SeekerAuraColor.Stardust]: 'Particle Drift',
    [SeekerAuraColor.Eclipse]: 'Solar Blackout',
    [SeekerAuraColor.Inferno]: 'Molten core',
    [SeekerAuraColor.Glitch]: 'System Paradox',
    [SeekerAuraColor.Cyan]: 'Electric Aether',
    [SeekerAuraColor.MidnightStar]: 'Astral Indigo',
    [SeekerAuraColor.Lime]: 'Venomous Spore',
};

export const SEEKER_AURA_OPTIONS = (Object.values(SeekerAuraColor) as SeekerAuraColor[]).map(color => ({
    id: color,
    name: AURA_LORE_NAMES[color] || (color as string),
    hex: AURA_COLORS[color] || '#ffffff'
}));

export const GLYPH_CATEGORIES_DATA: { category: string, paletteIcon: string, colorCode: string, glyphs: {id: string, name: string, symbol: string}[] }[] = [
    { category: 'Base', paletteIcon: 'ri-shape-line', colorCode: 'border-slate-500 text-slate-300', glyphs: [{id: 'G1', name: 'Alpha', symbol: 'α'}, {id: 'G2', name: 'Beta', symbol: 'β'}] },
    { category: 'Modifier', paletteIcon: 'ri-tools-line', colorCode: 'border-amber-500 text-amber-300', glyphs: [{id: 'M1', name: 'Shift', symbol: '↹'}, {id: 'M2', name: 'Scale', symbol: '⤡'}] }
];

export const BUGA_GLYPH_LIBRARY: BugaGlyph[] = [
    { id: 'G1', symbol: '△⃒⟁⃒', aminoAcid: 'W', aminoAcidFullName: 'Tryptophan', type: 'coding', position: 1, iconicity: 'Dream', chargeType: 'polar', description: 'Dream Amplification', binaryCode: '+5κ' },
    { id: 'G2', symbol: '⎅⫗⊛', aminoAcid: 'U', aminoAcidFullName: 'Selenocysteine', type: 'coding', position: 2, iconicity: 'Time', chargeType: 'nonpolar', description: 'Temporal Perception', binaryCode: '-3ξ' },
    { id: 'G3', symbol: '⋈⟠⃤⟃', aminoAcid: 'H', aminoAcidFullName: 'Hypusine', type: 'coding', position: 3, iconicity: 'Memory', chargeType: 'basic', description: 'Memory Recursion', binaryCode: '+7φ' },
    { id: 'G4', symbol: '⧉⟋⃫⟠', aminoAcid: 'O', aminoAcidFullName: 'Pyrrolysine', type: 'coding', position: 4, iconicity: 'Anchor', chargeType: 'nonpolar', description: 'Reality Anchoring', binaryCode: '+4κ' },
    { id: 'G5', symbol: '⟐⃨⟃⃤', aminoAcid: 'J', aminoAcidFullName: 'Hydroxyproline', type: 'coding', position: 5, iconicity: 'Shield', chargeType: 'nonpolar', description: 'Paradox Resistance', binaryCode: '-2ξ' },
    { id: 'G6', symbol: '⧍⟁⃧⟋', aminoAcid: 'T', aminoAcidFullName: 'Theanine', type: 'coding', position: 6, iconicity: 'Focus', chargeType: 'polar', description: 'Temporal Focus', binaryCode: '+3φ' },
    { id: 'G15', symbol: 'START', aminoAcid: 'M', aminoAcidFullName: 'Methionine', type: 'coding', position: 0, iconicity: 'Ignition', chargeType: 'nonpolar', description: 'Chrono-Synchronicity', binaryCode: '+3κ' },
];

export const SEPARATOR_GLYPH_DATA: BugaGlyph[] = [
    { id: 'S1', symbol: '|', type: 'separator', position: 1.5, iconicity: 'Gap' }
];

export const BUGA_GLYPH_PEPTIDE_SEQUENCE = "M-W-U-H-O-J-T";

export const SEEKER_CLASSES = [
    { id: SeekerClass.Gatewalker, name: 'Gatewalker', description: 'Masters of dimensional thresholds. Specialized in rifts and resonance keys.' },
    { id: SeekerClass.AxiomScribe, name: 'Axiom Scribe', description: 'Rewriters of reality who edit the linguistic logic of the universe.' },
    { id: SeekerClass.FluxWeaver, name: 'Flux Weaver', description: 'Artists of raw Aether. They weave threads of pure energy into matrices.' },
    { id: SeekerClass.HeadphoneHero, name: 'Headphone Hero', description: 'Warriors who turn the "music of the spheres" into kinetic force.' },
    { id: SeekerClass.VanguardPrime, name: 'Vanguard Prime', description: 'Unyielding bastions against entropic decay and structural dissolution.' },
    { id: SeekerClass.VoidReaver, name: 'Void Reaver', description: 'Exiles striking from the spaces between timelines with causality blades.' },
    { id: SeekerClass.CyberSavant, name: 'Cyber Savant', description: 'Digital ghosts who treat the universe as a vast, editable database.' },
    { id: SeekerClass.ChronoWarden, name: 'Chrono Warden', description: 'Guardians who prune unstable historical branches to prevent causal loops.' },
    { id: SeekerClass.PsionicConductor, name: 'Psionic Conductor', description: 'Channelers of the collective unconscious, fueled by sentient dreams.' },
    { id: SeekerClass.FleshShaper, name: 'Flesh Shaper', description: 'Masters of biological mutation who treat DNA as sculptural clay.' },
    { id: SeekerClass.RealityEditor, name: 'Reality Editor', description: 'Subversives who delete axioms, forcing the universe to recalculate.' },
    { id: SeekerClass.SingularityChampion, name: 'Singularity Champion', description: 'Icons of absolute gravity and fixed points in the struggle.' },
    { id: SeekerClass.SignalArchitect, name: 'Signal Architect', description: 'Engineers who build reality-code structures from resonant logic.' },
    { id: SeekerClass.NeuralHacker, name: 'Neural Hacker', description: 'Infiltrators of mind-systems and bio-neural glyph networks.' },
    { id: SeekerClass.DroneShepherd, name: 'Drone Shepherd', description: 'Commanders of autonomous swarms of sensory-drones and logic-probes.' },
    { id: SeekerClass.EchoBinder, name: 'Echo Binder', description: 'Mystics who trap memory-echoes to manifest historical potentials.' },
    { id: SeekerClass.HarmonicSage, name: 'Harmonic Sage', description: 'Scholars of frequency who heal or harm via sound-geometry.' },
    { id: SeekerClass.EntropyAlchemist, name: 'Entropy Alchemist', description: 'Specialists in controlled decay and negentropic transmutation.' },
    { id: SeekerClass.RealitySmuggler, name: 'Reality Smuggler', description: 'Traffickers of forbidden artifacts and localized physical laws.' },
    { id: SeekerClass.TriPathAdept, name: 'Tri-Path Adept', description: 'Aspirants attempting to master all three pillars of the Codex.' }
];

export const ALL_GENDERS_LIST = Object.values(SeekerGender) as SeekerGender[];
export const ALL_ALIGNMENTS_LIST = Object.values(SeekerEnergyAlignment) as SeekerEnergyAlignment[];
export const SEEKER_VISUAL_FILTERS = (Object.values(SeekerVisualFilter) as SeekerVisualFilter[]).map(f => ({ id: f, name: f as string }));

export const TRAIT_LISTS = {
    self: [
        "Brave", "Curious", "Haunted", "Resilient", "Cosmic", "Glitchy", "Silent", "Luminous",
        "Void-Scarred", "Time-Lost", "Cyber-Enhanced", "Nature-Bound", "Shadow-Walker", "Star-Blessed",
        "Rebellious", "Stoic", "Chaotic", "Harmonic", "Cryptic", "Vengeful", "Ascended"
    ],
    codex: [
        "Reader", "Writer", "Weaver", "Breaker", "Observer",
        "Guardian", "Prophet", "Architect", "Destroyer", "Scholar", "Ghost"
    ]
};

export const AVATAR_RACES = [
    { id: SeekerAvatarType.Human, name: 'Human', description: 'The baseline lineage. Adaptable and driven by a hunger for meaning.' },
    { id: SeekerAvatarType.Android, name: 'Android', description: 'Synthetic frames seeing the universe through cold, perfect logic.' },
    { id: SeekerAvatarType.Ethereal, name: 'Ethereal', description: 'Beings of semi-solid light who phase through physical barriers.' },
    { id: SeekerAvatarType.VoidBorn, name: 'Void Born', description: 'Spawned in the silence between galaxies. Immune to the abyss.' },
    { id: SeekerAvatarType.StarlightConstruct, name: 'Starlight Construct', description: 'Built from stellar energy. They radiate warmth and celestial order.' },
    { id: SeekerAvatarType.Astralborn, name: 'Astralborn', description: 'Born from dream/reality collisions. They perceive multiple timelines.' },
    { id: SeekerAvatarType.NeoTerran, name: 'Neo-Terran', description: 'Enhanced descendants of moon colonies. Evolved to breathe aether.' },
    { id: SeekerAvatarType.ChronoMarked, name: 'Chrono-Marked', description: 'Survivors of temporal rifts stuck in permanent phase-shift.' },
    { id: SeekerAvatarType.Luminari, name: 'Luminari', description: 'Ancient guardians with skin composed of creation-frequency crystal.' },
    { id: SeekerAvatarType.Umbrakin, name: 'Umbrakin', description: 'Descendants of the Obsidian Choir. They manipulate liquid shadow.' },
    { id: SeekerAvatarType.Psynari, name: 'Psynari', description: 'Thought-node entities communicating via shared neural resonance.' },
    { id: SeekerAvatarType.SingularityScions, name: 'Singularity Scion', description: 'Beings merged with the Omega Core itself.' },
    { id: SeekerAvatarType.Chronovariants, name: 'Chronovari', description: 'Variants of humanity from discarded timelines seeking stability.' },
    { id: SeekerAvatarType.Celestials, name: 'Nephilim Echo', description: 'Remnants of fallen higher-dimensional entities.' },
    { id: SeekerAvatarType.MycelialSages, name: 'Mycelial Host', description: 'Spore-linked beings part of a vast trans-planetary fungal network.' },
    { id: SeekerAvatarType.Fatefractured, name: 'Paradox Spawn', description: 'Biological entities formed within causal contradictions.' },
    { id: SeekerAvatarType.Shardkin, name: 'Godshard', description: 'Fragile vessels containing a single spark of a dead deity.' },
    { id: SeekerAvatarType.VoidBeasts, name: 'Singularity Beast', description: 'Collapsed-star organisms adapted to absolute pressure.' },
    { id: SeekerAvatarType.Helixkin, name: 'Fleshweaver', description: 'Bio-adaptive morphers with highly unstable genetic sequences.' },
    { id: SeekerAvatarType.MachineApostles, name: 'Ironbound', description: 'Sentient metallic entities following the Algorithm of the Soul.' },
    { id: SeekerAvatarType.NeuralFrames, name: 'Signalborn', description: 'Consciousness purely encoded as data within a field.' },
    { id: SeekerAvatarType.Dreamkin, name: 'Dreamkin', description: 'Natives of the collective subconscious realm materialized.' },
    { id: SeekerAvatarType.Epochals, name: 'Oblivion Shade', description: 'Lifeforms that have undergone shadow-collapse.' },
    { id: SeekerAvatarType.BoneArchitects, name: 'Gravemind', description: 'Heavy-gravity adapted beings with dense, calcified structures.' }
];

export const SEEKER_BODY_TYPES = Object.values(SeekerBodyType);

export const EYE_COLORS = ["Nebula-Blue", "Supernova-Gold", "Void-Black", "Glitch-Green", "Binary-Red", "Starlight-Silver", "Prismatic-Iris", "Hollow-White", "Ether-Violet", "Solar-Orange", "Liquid-Chrome", "Moss-Emerald"];
export const HAIR_COLORS = ["Solar-White", "Singularity-Indigo", "Liquid-Mercury", "Forest-Echo", "Crimson-Flux", "Void-Glow", "Aether-Silk", "Obsidian-Spikes", "Golden-Ray", "Copper-Wire", "Phantom-Grey", "Nebula-Pink"];

export const HAIR_STYLES = [
    "Shaved", 
    "Short Buzz", 
    "Crew Cut", 
    "Slicked Back", 
    "Pompadour", 
    "Messy Spikes", 
    "Undercut", 
    "Long Flowing", 
    "Braided Ponytail", 
    "Top Knot", 
    "Dreadlocks", 
    "Afro", 
    "Pixie Cut", 
    "Bob", 
    "Twin Tails", 
    "Mohawk", 
    "Bioluminescent Spines", 
    "Plasma Fringe",
    "Holographic Top-Knot", 
    "Gravity-Defiant Spikes", 
    "Fiber-Optic Curls", 
    "Asymmetric Neon Bob", 
    "Crystalline Shards", 
    "Ethereal Mist Tendrils", 
    "Liquid Mercury Flow", 
    "Data-Shard Undercut", 
    "Interstellar Braids", 
    "Solar Flare Mane", 
    "Void-Matter Coils", 
    "Cybernetic Cables", 
    "Fractal Geometry Cut", 
    "Rune-Etched Buzz", 
    "Spectral Tresses", 
    "Pulsing Neural Wires", 
    "Drifting Smoke Locks",
    "Floating Shard Crown",
    "Tachyon-Braided Locks",
    "Obsidian Glass Spikes",
    "Recursive Loop Braid",
    "Phosphorescent Taper",
    "Static-Electric Afro",
    "Ouroboric Coils",
    "Phased Veil Hair",
    "Aetheric Silk Waterfall"
];

export const ALL_RACES_LIST = Object.values(AgentRace) as AgentRace[];
export const ALL_LINEAGES_LIST = Object.values(AgentLineage) as AgentLineage[];
export const ALL_TRADES_LIST = Object.values(AgentTrade) as AgentTrade[];
export const ALL_FACTIONS_LIST = Object.values(AgentFaction) as AgentFaction[];

export const AGENT_PROFILES: Record<AgentName, AgentProfile> = (Object.values(AgentName) as AgentName[]).reduce((acc, name) => {
    acc[name] = { 
        name, 
        colorClass: 'text-slate-400', 
        personality: ['Neutral'], 
        generateMessage: () => "..."
    };
    return acc;
}, {} as Record<AgentName, AgentProfile>);

// Overrides for key agents
AGENT_PROFILES[AgentName.System].colorClass = 'text-slate-400';
AGENT_PROFILES[AgentName.RPGNexusAgent].colorClass = 'text-indigo-400';
AGENT_PROFILES[AgentName.Sovereign].colorClass = 'text-cyan-300';
AGENT_PROFILES[AgentName.DeepSeek].colorClass = 'text-rose-400';
AGENT_PROFILES[AgentName.Nevik].colorClass = 'text-amber-300';
AGENT_PROFILES[AgentName.PrimeConductor].colorClass = 'text-indigo-500';
AGENT_PROFILES[AgentName.GlyphComposerAgent].colorClass = 'text-fuchsia-400';

export const DREAMBLOOM_THEMATIC_SEEDS = [
  "Abyssal Silence", "Celestial Harmony", "Entropic Drift", "Neon Convergence", "Ancient Echoes",
  "Quantum Foam", "Fractal Growth", "Luminous Decay", "Void Resonance", "Starlight Weaving"
];

export const CODEXPANDIUM_DATA = [
  {
    id: 'ch1',
    title: 'Chapter I: The Origin of Resonance',
    content: `### The Primordial Sound\nBefore number, before glyph, there was the Resonance. It breathed in the spaces between non-existence.\n\n#### The First Axiom\nRecursive unity is the foundation of all that follows. All parts reflect the whole.`
  },
  {
    id: 'ch2',
    title: 'Chapter II: The Nature of Entropy',
    content: `### The Fraying Edge\nEntropy is not the end, but the mechanism of change. Without the drift, the pattern remains stagnant.\n\n- Entropy: The measure of structural dissolution.\n- Negentropy: The breath of vitality and order.`
  }
];

// --- TRISOPHIAN ARMORY CATALOG ---
export const TRISOPHIAN_WEAPONS: MarketItem[] = [
    // Melee
    { id: 'wep-01', name: 'Axiom Blade', type: 'Weapon', rarity: ArtifactRarity.Common, description: 'Reality‑locked edge that phases through lesser defenses.', visualPromptMod: 'glowing crystalline longsword', cost: 150, icon: 'ri-sword-line', combatStats: { atk: 18, def: 5, res: 10 } },
    { id: 'wep-02', name: 'Void Cleaver', type: 'Weapon', rarity: ArtifactRarity.Rare, description: 'Drains entropy from targets; heavier strikes cause shockwaves.', visualPromptMod: 'massive obsidian axe radiating dark energy', cost: 850, icon: 'ri-sword-fill', combatStats: { atk: 32, def: 2, res: 15 } },
    { id: 'wep-03', name: 'Chrono Spear', type: 'Weapon', rarity: ArtifactRarity.Uncommon, description: 'Temporally delayed strike; hits twice in staggered sequence.', visualPromptMod: 'brass spear with clockwork gears and neon trails', cost: 300, icon: 'ri-compass-3-line', combatStats: { atk: 22, def: 8, res: 12 } },
    { id: 'wep-04', name: 'Gravihammer', type: 'Weapon', rarity: ArtifactRarity.Legendary, description: 'Mass-amplified impact; can create localized gravity wells.', visualPromptMod: 'heavy glowing maul with gravitational distortions', cost: 2500, icon: 'ri-hammer-line', combatStats: { atk: 45, def: 15, res: 5 } },
    { id: 'wep-05', name: 'Neural Talons', type: 'Weapon', rarity: ArtifactRarity.Rare, description: 'Thought-linked melee; increases speed with neural focus.', visualPromptMod: 'bioluminescent arm-blades connected by wires', cost: 700, icon: 'ri-flashlight-line', combatStats: { atk: 28, def: 10, res: 20 } },
    { id: 'wep-06', name: 'Harmonic Staff', type: 'Weapon', rarity: ArtifactRarity.Epic, description: 'Resonates with sound frequencies; can stun or disorient enemies.', visualPromptMod: 'elegant staff with floating sound-disks', cost: 1200, icon: 'ri-music-2-line', combatStats: { atk: 15, def: 20, res: 35 } },
    { id: 'wep-07', name: 'Bladeseer Fang', type: 'Weapon', rarity: ArtifactRarity.Rare, description: 'Predictive strike; bonus damage if timing matches enemy patterns.', visualPromptMod: 'serrated glowing dagger with an ocular eye hilt', cost: 650, icon: 'ri-knife-line', combatStats: { atk: 35, def: 2, res: 12 } },
    { id: 'wep-08', name: 'Phase Scythe', type: 'Weapon', rarity: ArtifactRarity.Epic, description: 'Sweeps through phased dimensions, bypassing armor.', visualPromptMod: 'translucent scythe made of shifting light', cost: 1400, icon: 'ri-knife-line', combatStats: { atk: 38, def: 0, res: 18 } },
    { id: 'wep-09', name: 'Signal Rifle', type: 'Weapon', rarity: ArtifactRarity.Common, description: 'Data‑encoded ballistics; can track energy signatures.', visualPromptMod: 'sleek digital rifle with scanning beams', cost: 200, icon: 'ri-send-plane-line', combatStats: { atk: 20, def: 2, res: 5 } },
    { id: 'wep-10', name: 'Plasma Arc', type: 'Weapon', rarity: ArtifactRarity.Uncommon, description: 'Emits heat-wave plasma bursts; effective against shields.', visualPromptMod: 'plasma emitter with electrical arcing', cost: 450, icon: 'ri-flashlight-fill', combatStats: { atk: 28, def: 4, res: 8 } },
    { id: 'wep-11', name: 'Anachronic Dagger', type: 'Weapon', rarity: ArtifactRarity.Epic, description: 'A blade that exists in three seconds simultaneously, making it impossible to parry.', visualPromptMod: 'glitching double-bladed dagger', cost: 1800, icon: 'ri-magic-line', combatStats: { atk: 42, def: 10, res: 25 } },
    { id: 'wep-12', name: 'Singularity Bow', type: 'Weapon', rarity: ArtifactRarity.Legendary, description: 'Fires arrows of absolute gravity that collapse on impact.', visualPromptMod: 'collapsing star energy bow', cost: 3200, icon: 'ri-focus-line', combatStats: { atk: 55, def: 5, res: 40 } },
    { id: 'wep-13', name: 'Echo-Whip', type: 'Weapon', rarity: ArtifactRarity.Rare, description: 'A strand of solid sound that reverberates through the souls of enemies.', visualPromptMod: 'sonic lash with glowing vibration markers', cost: 900, icon: 'ri-music-fill', combatStats: { atk: 25, def: 15, res: 35 } },
    { id: 'wep-14', name: 'Psionic Flail', type: 'Weapon', rarity: ArtifactRarity.Epic, description: 'Directly impacts the target\'s cognitive field instead of their armor.', visualPromptMod: 'floating ethereal orbs chained to a neural hilt', cost: 2100, icon: 'ri-brain-line', combatStats: { atk: 38, def: 20, res: 50 } },
    { id: 'wep-15', name: 'Godshard Spear', type: 'Weapon', rarity: ArtifactRarity.Mythic, description: 'Forged from the final breath of a dying solar deity. It radiates pure creation.', visualPromptMod: 'golden lance dripping with starlight', cost: 5000, icon: 'ri-vip-diamond-fill', combatStats: { atk: 75, def: 30, res: 65 } },
];

export const TRISOPHIAN_ARMORS: MarketItem[] = [
    // Light
    { id: 'arm-01', name: 'Signal Weave', type: 'Armor' as any, rarity: ArtifactRarity.Common, description: 'Adaptive stealth mesh; responsive to ambient signals.', visualPromptMod: 'glitching digital camo suit', cost: 100, icon: 'ri-cpu-line', combatStats: { atk: 2, def: 10, res: 5 } },
    { id: 'arm-02', name: 'Phase Cloak', type: 'Armor' as any, rarity: ArtifactRarity.Epic, description: 'Enables partial dimensional evasion; bonus to movement.', visualPromptMod: 'shimmering translucent hooded cloak', cost: 1100, icon: 'ri-user-secret-line', combatStats: { atk: 0, def: 15, res: 30 } },
    { id: 'arm-03', name: 'Dreamsilk Mantle', type: 'Armor' as any, rarity: ArtifactRarity.Rare, description: 'Psionic resistance; reduces psychic attack effects.', visualPromptMod: 'flowing robes with cosmic star patterns', cost: 750, icon: 'ri-magic-line', combatStats: { atk: 5, def: 8, res: 40 } },
    { id: 'arm-04', name: 'Void-Thread Silks', type: 'Armor' as any, rarity: ArtifactRarity.Rare, description: 'Garments woven from the vacuum itself. They absorb 40% of incoming light and heat.', visualPromptMod: 'pitch black flowing robes', cost: 950, icon: 'ri-ghost-line', combatStats: { atk: 10, def: 12, res: 45 } },
    { id: 'arm-05', name: 'Mycelial Mesh', type: 'Armor' as any, rarity: ArtifactRarity.Uncommon, description: 'A living fungal network that repairs itself and the wearer in real-time.', visualPromptMod: 'organic green pulsing armor', cost: 500, icon: 'ri-plant-line', combatStats: { atk: 0, def: 20, res: 20 } },
    // Medium
    { id: 'arm-06', name: 'Axiom Plate', type: 'Armor' as any, rarity: ArtifactRarity.Uncommon, description: 'Law-bound plating; resists chaotic attacks.', visualPromptMod: 'silver plate armor with glowing law-runes', cost: 400, icon: 'ri-shield-line', combatStats: { atk: 0, def: 25, res: 15 } },
    { id: 'arm-07', name: 'Neuroframe Harness', type: 'Armor' as any, rarity: ArtifactRarity.Rare, description: 'Exosuit boosting reflexes and minor strength augmentation.', visualPromptMod: 'skeletal metal frame worn over clothes', cost: 950, icon: 'ri-robot-line', combatStats: { atk: 15, def: 30, res: 10 } },
    { id: 'arm-08', name: 'Chrono Mail', type: 'Armor' as any, rarity: ArtifactRarity.Epic, description: 'Buffers impact across short time frames; reduces damage spikes.', visualPromptMod: 'metallic scale armor with shifting highlights', cost: 1500, icon: 'ri-history-line', combatStats: { atk: 5, def: 35, res: 20 } },
    { id: 'arm-09', name: 'Echo-Glass Cuirass', type: 'Armor' as any, rarity: ArtifactRarity.Rare, description: 'Translucent armor that mirrors the last attack back at the source.', visualPromptMod: 'mirror-finish crystalline breastplate', cost: 1300, icon: 'ri-reflect-fill', combatStats: { atk: 10, def: 28, res: 30 } },
    { id: 'arm-10', name: 'Plasma-Coated Vest', type: 'Armor' as any, rarity: ArtifactRarity.Uncommon, description: 'Superheated exterior that melts incoming projectiles.', visualPromptMod: 'glowing orange tactical vest', cost: 600, icon: 'ri-fire-fill', combatStats: { atk: 15, def: 22, res: 10 } },
    // Heavy
    { id: 'arm-11', name: 'Gravemass Exoskeleton', type: 'Armor' as any, rarity: ArtifactRarity.Rare, description: 'Heavy planetary-scale defense; slows movement slightly.', visualPromptMod: 'massive blocky industrial robot armor', cost: 900, icon: 'ri-hammer-line', combatStats: { atk: 10, def: 50, res: 5 } },
    { id: 'arm-12', name: 'Lightforged Bastion', type: 'Armor' as any, rarity: ArtifactRarity.Epic, description: 'Radiant armor; amplifies light-based powers.', visualPromptMod: 'golden full plate armor with wings of light', cost: 1900, icon: 'ri-star-line', combatStats: { atk: 15, def: 55, res: 30 } },
    { id: 'arm-13', name: 'Obsidian Juggernaut', type: 'Armor' as any, rarity: ArtifactRarity.Legendary, description: 'Impenetrable volcanic glass forged in the heart of a supernova.', visualPromptMod: 'massive spiked black heavy armor', cost: 3500, icon: 'ri-shield-flash-fill', combatStats: { atk: 20, def: 85, res: 15 } },
    { id: 'arm-14', name: 'Nebula Shell', type: 'Armor' as any, rarity: ArtifactRarity.Mythic, description: 'Armor that exists as a localized galactic cloud, dispersing all kinetic force.', visualPromptMod: 'swirling cosmic gas container suit', cost: 6000, icon: 'ri-cloud-fill', combatStats: { atk: 30, def: 95, res: 70 } },
    { id: 'arm-15', name: 'Aetheric Dreadnought', type: 'Armor' as any, rarity: ArtifactRarity.Anomalous, description: 'Requires a secondary consciousness to operate. It is as much a vehicle as it is armor.', visualPromptMod: 'sentient metal titan suit', cost: 9999, icon: 'ri-robot-2-fill', combatStats: { atk: 50, def: 120, res: 40 } },
];

export const STARTER_WEAPONS: MarketItem[] = TRISOPHIAN_WEAPONS;
export const STARTER_OUTFITS: MarketItem[] = TRISOPHIAN_ARMORS;