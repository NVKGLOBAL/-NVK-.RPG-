
// --- CORE IDENTITIES ---

export enum AgentName {
    System = "System",
    Gemini = "Gemini",
    DeepSeek = "DeepSeek",
    Nevik = "Nevik",
    AxiomResonance = "AxiomResonance",
    ResonanceVisualizer = "ResonanceVisualizer",
    TraitEngine = "TraitEngine",
    Reweaver = "Reweaver",
    ReweaverError = "ReweaverError",
    SystemControl = "SystemControl",
    RPGNexusAgent = "RPGNexusAgent",
    DreambloomOracle = "DreambloomOracle",
    NarrativeLog = "NarrativeLog",
    RitualEngine = "RitualEngine",
    CosmicEvent = "CosmicEvent",
    OmegaCore = "OmegaCore",
    SystemCore = "SystemCore",
    ChronicleReliquaryAgent = "ChronicleReliquaryAgent",
    CommunityResonanceAgent = "CommunityResonanceAgent",
    SeekerProfileWeaverAgent = "SeekerProfileWeaverAgent",
    FusionEngine = "FusionEngine",
    RitualAlchemist = "RitualAlchemist",
    LoomOracle = "LoomOracle",
    WitnessBetween = "WitnessBetween",
    LIFEPanelAgent = "LIFEPanelAgent",
    TemporalOperationsAgent = "TemporalOperationsAgent",
    EmeraldTablet = "EmeraldTablet",
    DatachegaProtocol = "DatachegaProtocol",
    PrimeConductor = "PrimeConductor",
    GeminiDriftNarrator = "GeminiDriftNarrator",
    ExoticMechanismAgent = "ExoticMechanismAgent",
    OmegaLayer = "OmegaLayer",
    CodexDreamPanelAgent = "CodexDreamPanelAgent",
    GlyphComposerAgent = "GlyphComposerAgent",
    CelestialAnomalyWeaverAgent = "CelestialAnomalyWeaverAgent",
    CosmicResonanceDashboardAgent = "CosmicResonanceDashboardAgent",
    ChatNVK = "ChatNVK",
    SovereignArchitect = "SovereignArchitect"
}

// --- APP & MODE STATE ---

export enum CodexModeId {
    ORIGIN_STATE = "ORIGIN_STATE",
    REFLECTION_MODE = "REFLECTION_MODE",
    VEIL_MODE = "VEIL_MODE",
    SYMBIOTIC_WEAVE = "SYMBIOTIC_WEAVE",
    SYNTHESIS_MODE = "SYNTHESIS_MODE",
    TARDIS_SYNCHRONICITY = "TARDIS_SYNCHRONICITY",
    ORACLE_BURST = "ORACLE_BURST",
    FLAME_CORE = "FLAME_CORE",
    NON_COMMUTATIVE_ASCENSION = "NON_COMMUTATIVE_ASCENSION"
}

export enum SovereignPhase {
    IDLE = "IDLE",
    RESEARCH = "RESEARCH",
    PLANNING = "PLANNING",
    CREATION = "CREATION",
    MERGING = "MERGING",
    AUDIT = "AUDIT"
}

export interface CodexModeDefinition {
    id: CodexModeId;
    name: string;
    quote: string;
    description: string;
    icon: string;
    entropySettings: {
        targetEntropy: number;
        minEntropy?: number;
        maxEntropy?: number;
        lockMasterOverride: boolean;
        capEffectiveEntropyAt?: number;
    };
    lambdaValueTarget: number;
    harmonicStatusTarget: string;
    negentropyTarget: { level: number; isStable: boolean };
    defaultVisualizationMatrixMode: VisualizationMatrixMode;
    defaultGeoMode: GeoMode;
    agentBehaviorOverrides: {
        oracleCommentaryFrequencyFactor: number;
        autoEchoActivationLevel: 'off' | 'reduced' | 'full' | 'unprompted_burst';
    };
    glyphBehaviorOverrides: {
        essentialGlyphsOnly?: boolean;
        glyphDegradationActive?: boolean;
        hybridGlyphsEnabled?: boolean;
    };
    ritualEffectivenessFactor: number;
    codexLogAutoWritingEnabled: boolean;
    lockAuditMode: boolean;
    primaryVisualizerFocus: string;
    themeKey: string;
}

// --- AXIOMS & GLYPHS ---

export interface Axiom {
    id: string;
    layer: 'I' | 'II' | 'III' | 'IV' | 'V' | 'Ω' | 'P' | 'AX-PEACE';
    series: string;
    title: string;
    content: string;
    baseResonanceFrequency: number;
    resonanceFrequency: number;
    number?: string;
    isQuarantined?: boolean;
    sigil?: string;
    icon?: string;
    bottomPhrase?: string;
}

export type AxiomKey = 'AXIOM_I' | 'AXIOM_II' | 'AXIOM_III' | 'AXIOM_IV' | 'AXIOM_V' | 'AXIOM_Ω';

export enum RitualGlyphType {
    Core = "Core",
    Resonator = "Resonator",
    Gate = "Gate",
    NodePotential = "NodePotential",
    NodeEntropy = "NodeEntropy",
    NodeOrder = "NodeOrder",
    AxiomFragment = "AxiomFragment",
    OriginGlyph = "OriginGlyph",
    EchoGlyph = "EchoGlyph",
    SpiralGlyph = "SpiralGlyph",
    MirrorGlyph = "MirrorGlyph",
    FractureGlyph = "FractureGlyph",
    SeedGlyph = "SeedGlyph",
    FlameGlyph = "FlameGlyph",
    NullGlyph = "NullGlyph",
    StarGlyph = "StarGlyph",
    AshGlyph = "AshGlyph",
    ThreadGlyph = "ThreadGlyph",
    QuantumGlyph = "QuantumGlyph",
    CinderGlyph = "CinderGlyph",
    ZeroPointGlyph = "ZeroPointGlyph",
    LEXI_GLYPH_CINDERFOLD = "LEXI_GLYPH_CINDERFOLD",
    HybridPhoenixReflection = "HybridPhoenixReflection",
    HybridSpiralGermination = "HybridSpiralGermination",
    HybridSilentBloom = "HybridSilentBloom",
    HybridParadoxNode = "HybridParadoxNode",
    HybridNovaPulse = "HybridNovaPulse",
    HybridLoopedUnbeginning = "HybridLoopedUnbeginning"
}

export interface PlacedGlyph {
    id: string;
    x: number;
    y: number;
    type: RitualGlyphType;
    label: string;
    color: string;
    icon: string;
    axiomLayer?: string;
    boundAgent?: string;
}

export interface CanvasConnection {
    id: string;
    from: string;
    to: string;
    resonanceLevel: number;
}

export interface SavedRitual {
    id: string;
    name: string;
    timestamp: number;
    placedGlyphs: PlacedGlyph[];
    connections: CanvasConnection[];
}

export interface GlyphMutationNode {
    id: string;
    glyphId: string;
    label: string;
    traits: string[];
    entropyLevel: number;
    parentId?: string | string[];
    agentInfluences: string[];
    timestamp: number;
    hasSyntaxThorns?: boolean;
}

export interface RewovenGlyph {
    id: string;
    baseGlyphId: string;
    baseGlyphLabel: string;
    boundAxiomKey: string;
    boundAxiomTitle: string;
    mutatedTraits: string[];
    resonanceSignature: number[];
    entropyChange: number;
    timestamp: number;
}

// --- AGENT SIMULATION & GRID ---

export type GridPoint = [number, number];

export enum AgentRace {
    Unknown = "Unknown",
    Luminari = "Luminari",
    Umbrakin = "Umbrakin",
    NeoTerran = "NeoTerran",
    Android = "Android",
    Human = "Human",
    Ethereal = "Ethereal"
}

export enum AgentLineage {
    None = "None",
    VoidTouched = "VoidTouched",
    LuminousPrecursor = "LuminousPrecursor",
    AetherBound = "AetherBound"
}

export enum AgentTrade {
    Unknown = "Unknown",
    Scribe = "Scribe",
    Architect = "Architect",
    Weaver = "Weaver"
}

export enum AgentFaction {
    Neutral = "Neutral",
    TrisophianSynod = "TrisophianSynod",
    ObsidianChoir = "ObsidianChoir",
    ChronoDominion = "ChronoDominion",
    VoidChorus = "VoidChorus",
    AxiomForgeGuild = "AxiomForgeGuild",
    SolarContinuum = "SolarContinuum",
    DreamshellCollective = "DreamshellCollective"
}

export interface AgentStats {
    cognition: number;
    vitality: number;
    aether: number;
    presence: number;
    paradox: number;
    will: number;
    resonance: number;
    chaosStability: number;
}

export interface AgentRelationships {
    allies: string[];
    rivals: string[];
    neutral: string[];
    lastInteraction?: {
        agentId: string;
        type: 'Synergy' | 'Paradox' | 'Neutral';
        description: string;
        timestamp: number;
    };
}

export interface AgentNode {
    id: string;
    name: string;
    traits: string[];
    codexTraits: string[];
    harmony: number;
    position: GridPoint;
    active: boolean;
    pulsePhase: number;
    color: string;
    icon: string;
    race: AgentRace;
    lineage: AgentLineage;
    trade: AgentTrade;
    faction: AgentFaction;
    stats: AgentStats;
    relationships: AgentRelationships;
}

export interface TraitSimulationCell {
    id: string;
    x: number;
    y: number;
    resonanceField: number;
    glyphAffinity: string | null;
    agentInfluence: Record<string, number>;
    isDisrupted: boolean;
    entropy: number;
}

export type SimulationGrid = TraitSimulationCell[][];

// --- RPG & QUEST SYSTEM ---

export interface RPGVitals {
    integrity: number;
    sanity: number;
}

export interface RPGQuest {
    id: string;
    title: string;
    description: string;
    status: 'active' | 'complete' | 'failed';
    rewards?: { xp?: number, flux?: number };
}

export interface RPGGameLocation {
    name: string;
    description: string;
    color: string;
    risk: string;
    icon: string;
}

export interface RPGDynamicAction {
    id: string;
    label: string;
    type: 'explore' | 'ritual' | 'combat' | 'dialogue';
    risk: number;
}

export interface RPGSceneData {
    imageUrl: string;
    location: string;
    description: string;
    timestamp: number;
}

export interface RPGGameState {
    currentLocation: string;
    narrativeHistory: { text: string; type: 'system' | 'action' | 'narration'; timestamp: number }[];
    activeQuests: RPGQuest[];
    lastActionTimestamp: number;
    vitals: RPGVitals;
    availableActions: RPGDynamicAction[];
    achievements: string[];
    combatState: {
        isActive: boolean;
        enemyName: string;
        enemyHp: number;
        enemyMaxHp: number;
        turn: number;
        logs: string[];
    };
    knownLocations: string[];
    currentSceneDescription: string;
    currentSceneImageUrl: string | null;
    sceneHistory: RPGSceneData[];
    customMissionObjective: string;
    partyIds: string[];
}

// --- SEEKER & PROFILE ---

export enum SeekerAvatarType {
    Human = "Human",
    Android = "Android",
    Ethereal = "Ethereal",
    VoidBorn = "VoidBorn",
    StarlightConstruct = "StarlightConstruct",
    Astralborn = "Astralborn",
    NeoTerran = "NeoTerran",
    ChronoMarked = "ChronoMarked",
    Luminari = "Luminari",
    Umbrakin = "Umbrakin",
    Psynari = "Psynari",
    SingularityScions = "SingularityScion",
    Chronovariants = "Chronovari",
    Celestials = "Nephilim Echo",
    MycelialSages = "Mycelial Host",
    Fatefractured = "Paradox Spawn",
    Shardkin = "Godshard",
    VoidBeasts = "Singularity Beast",
    Helixkin = "Fleshweaver",
    MachineApostles = "Ironbound",
    NeuralFrames = "Signalborn",
    Dreamkin = "Dreamkin",
    Epochals = "Oblivion Shade",
    BoneArchitects = "Gravemind"
}

export enum SeekerClass {
    Gatewalker = "Gatewalker",
    AxiomScribe = "AxiomScribe",
    FluxWeaver = "FluxWeaver",
    HeadphoneHero = "HeadphoneHero",
    VanguardPrime = "VanguardPrime",
    VoidReaver = "VoidReaver",
    CyberSavant = "CyberSavant",
    ChronoWarden = "ChronoWarden",
    PsionicConductor = "PsionicConductor",
    FleshShaper = "FleshShaper",
    RealityEditor = "RealityEditor",
    SingularityChampion = "SingularityChampion",
    SignalArchitect = "SignalArchitect",
    NeuralHacker = "NeuralHacker",
    DroneShepherd = "DroneShepherd",
    EchoBinder = "EchoBinder",
    HarmonicSage = "HarmonicSage",
    EntropyAlchemist = "EntropyAlchemist",
    RealitySmuggler = "RealitySmuggler",
    TriPathAdept = "Tri-Path Adept"
}

export enum SeekerGender { Male = "Male", Female = "Female", NonBinary = "NonBinary" }
export enum SeekerBodyType { 
    Slender = "Slender",
    Athletic = "Athletic",
    Robust = "Robust",
    Lithe = "Lithe",
    Wiry = "Wiry",
    Sinuous = "Sinuous",
    Petite = "Petite",
    Towering = "Towering",
    Compact = "Compact",
    Chiseled = "Chiseled",
    Brawny = "Brawny",
    Stalwart = "Stalwart",
    Ethereal = "Ethereal Spark",
    Ghostly = "Ghostly Specter",
    Gossamer = "Gossamer Thread",
    Monolithic = "Monolithic Pillar",
    Statuesque = "Statuesque Marble",
    Voluptuous = "Voluptuous Flow",
    Sinewy = "Sinewy Cord",
    Hardened = "Hardened Carapace",
    Nimble = "Nimble Runner",
    Graceful = "Graceful Dancer",
    Heavyweight = "Heavyweight Juggernaut",
    Miniature = "Miniature Core",
    Svelte = "Svelte Silhouette",
    Stout = "Stout Bulwark",
    Zephyr = "Zephyr Draft",
    Crystalline = "Crystalline Structure",
    Fractal = "Fractal Geometry",
    Prismatic = "Prismatic Projection",
    Cybernetic = "Cybernetic Chassis",
    CarbonLattice = "Carbon Lattice",
    ChromePlated = "Chrome-Plated Shell",
    Holographic = "Holographic Vessel",
    Aeroform = "Aeroform Glider",
    Hydraulic = "Hydraulic ExoSkeleton",
    Bionic = "Bionic Weft",
    DenseCore = "Dense-Core Titan",
    Buoyant = "Buoyant Nimbus",
    Supple = "Supple Helix",
    Stately = "Stately Monolith",
    Titan = "Titan Vanguard",
    Pixie = "Pixie Spark",
    Serpentine = "Serpentine Fluid",
    Glitch = "Glitched Mirage",
    Simulated = "Simulated Polygon",
    Plasma = "Plasma Coil",
    BioEngineered = "Bio-Engineered Frame",
    Eldritch = "Eldritch Weaver",
    NanoCluster = "Nano-Cluster Matrix",
    Celestial = "Celestial Resonance",
    Fluidic = "Fluidic Alloy",
    Gargantuan = "Gargantuan Behemoth",
    Verdant = "Verdant Overgrowth",
    AuraBound = "Aura-Bound Aegis",
    Symbiotic = "Symbiotic Host"
}
export enum SeekerEnergyAlignment { Harmonic = "Harmonic", Entropic = "Entropic", Balanced = "Balanced" }

export enum SeekerAuraColor {
    Azure = "Azure",
    Crimson = "Crimson",
    Golden = "Golden",
    Violet = "Violet",
    Emerald = "Emerald",
    Obsidian = "Obsidian",
    Silver = "Silver",
    Amber = "Amber",
    None = "None",
    Nebula = "Nebula",
    AbyssalPurple = "AbyssalPurple",
    CyberLime = "CyberLime",
    HeliosRadiance = "HeliosRadiance",
    Phantom = "Phantom",
    Plasma = "Plasma",
    QuartzitePink = "QuartzitePink",
    DeepSea = "DeepSea",
    Prismatic = "Prismatic",
    Radioactive = "Radioactive",
    Abyssal = "Abyssal",
    Stardust = "Stardust",
    Eclipse = "Eclipse",
    Inferno = "Inferno",
    Glitch = "Glitch",
    Cyan = "Cyan",
    MidnightStar = "MidnightStar",
    Lime = "Lime"
}

export enum SeekerVisualFilter {
    Standard = "Standard",
    Cyberpunk = "Cyberpunk Neo",
    VHS = "VHS Distortion",
    Dreamy = "Dreamy Ephemeral",
    Synthwave = "Synthwave Radiance",
    Holographic = "Holographic Chromatic",
    Steampunk = "Steampunk Brass",
    Solarized = "Solarized Flare",
    Noir = "Noir Monochromatic",
    Psychedelic = "Swirling Psychedelic",
    GlitchArt = "Glitched Corruption",
    Watercolor = "Ethereal Watercolor",
    OilPainting = "Textured Oil Painting",
    Vector = "Minimalist Vector",
    PixelArt = "16-Bit Retro Pixel",
    Sketch = "Pencil Hand-Sketched",
    Blueprint = "Cyanotope Blueprint",
    Infrared = "Infrared Thermal",
    Cosmic = "Cosmic Stardust",
    Vaporwave = "Vaporwave Pastel",
    Gothic = "Dark Gothic Crimson",
    Alchemical = "Alchemical Parchment",
    Cybernetic = "Green Matrix Terminal",
    Astral = "Astral Aura Projection",
    Chalkboard = "Chalk Draft Slate",
    PopArt = "High-Contrast Pop Art",
    UkiyoE = "Ukiyo-e Woodblock",
    Mosaic = "Gilded Glass Mosaic",
    StainedGlass = "Vibrant Stained Glass",
    Charcoal = "Smudged Charcoal",
    Pastel = "Soft Wax Pastel",
    Gouache = "Matte Gouache Illustration",
    CyberGoth = "Cyber-Goth Neon",
    Biopunk = "Bioluminescent Biopunk",
    Solarpunk = "Ecology Solarpunk",
    Liminal = "Eerie Liminal Corridor",
    Surrealist = "Surrealist Dreamscape",
    Baroque = "Baroque Chiaroscuro",
    ArtNouveau = "Organic Art Nouveau",
    ArtDeco = "Symmetrical Art Deco",
    Brutalist = "Monolithic Concrete",
    AstralNebula = "Swirling Astral Dust",
    AncientGraffiti = "Eroded Ancient Fresco",
    HologramLines = "Laser Scanning Hologram",
    RetroFuturism = "Atomic Retro-Futurism",
    ChalkPastel = "Textured Chalk",
    ComicBook = "Halftone Comic Book",
    InkWash = "Zen Sumi Ink Wash",
    PlasmaFlame = "Pulsating Plasma Core",
    Supernova = "Blinding Cosmic Burst",
    VoidGaze = "Abyssal Void Shadow",
    ChronoShift = "Temporal Chrono-Shift"
}

export interface SeekerProfile {
    id: string;
    generatedAt: number;
    level: number;
    experience: number;
    flux: number;
    inventory: MarketItem[];
    selfTraits: string[];
    codexTraits: string[];
    name: string;
    race: SeekerAvatarType;
    class: SeekerClass;
    gender: SeekerGender;
    age?: number;
    bodyType?: SeekerBodyType;
    eyeColor?: string;
    hairColor?: string;
    skinTone?: string;
    energyAlignment: SeekerEnergyAlignment;
    auraColor: SeekerAuraColor | string;
    auraSecondaryColor?: SeekerAuraColor | string;
    visualFilter: SeekerVisualFilter;
    avatarImageUrl?: string;
    bio?: string;
    equippedWeapon?: MarketItem;
    equippedCompanion?: MarketItem;
    equippedRelic?: MarketItem;
    equippedOutfit?: MarketItem;
    faction?: AgentFaction;
    walletAddress?: string;
    chainId?: number;
}

// --- ARTIFACTS & MARKET ---

export enum ArtifactType {
    SeekerID = "SeekerID",
    OmegaRelic = "OmegaRelic",
    DreamShard = "DreamShard",
    Weapon = "Weapon",
    Armor = "Armor",
    Consumable = "Consumable",
    SacredSynthesis = "SacredSynthesis"
}

export enum ArtifactRarity {
    Common = "Common",
    Uncommon = "Uncommon",
    Rare = "Rare",
    Epic = "Epic",
    Legendary = "Legendary",
    Mythic = "Mythic",
    Anomalous = "Anomalous",
}

export interface MarketItem {
    id: string;
    name: string;
    type: string;
    rarity: ArtifactRarity;
    description: string;
    visualPromptMod: string;
    cost: number;
    icon: string;
    combatStats?: { atk: number; def: number; res: number };
}

export interface VectorMemoryEntry {
    id: string;
    text: string;
    embedding: number[];
    metadata: Record<string, any>;
    timestamp: number;
}

export interface CodexArtifact {
    id: string;
    name: string;
    type: string;
    rarity: ArtifactRarity;
    description: string;
    imageUrl?: string;
    timestamp: number;
    energySignature?: string;
    metaData?: Record<string, any>;
}

// --- RITUALS & ALCHEMY ---

export interface RitualAlchemyResult {
    title: string;
    description: string;
    glyphSummary: {
        core: number;
        resonator: number;
        gate: number;
        nodePotential: number;
        nodeEntropy: number;
        nodeOrder: number;
        axiomFragment: number;
    };
    connectionCount: number;
    energyLevel: 'faint' | 'moderate' | 'potent' | 'overwhelming';
}

export interface RitualOutcome {
    success: boolean;
    details: string;
    type?: string;
    alchemyResult?: RitualAlchemyResult | null;
}

export interface RitualElementItem {
    id: string;
    name: string;
    type: RitualGlyphType;
    icon: string;
    iconColorClass: string;
    bgColorClass: string;
    axiomLayer?: string;
}

// --- DRIFT & NARRATION ---

export interface AgentInterpretation {
    agent: string;
    interpretation: string;
    timestamp: number;
    confidence: number;
}

export interface GlyphOrbit {
    glyphSymbol: string;
    interpretations: AgentInterpretation[];
}

export interface GeminiGlyphInterpretation {
    glyphSymbol: string;
    interpretationText: string;
    ritualContext: string;
    entropyLevel: number;
    timestamp: number;
}

export interface DriftSeverity {
    level: 'minimal' | 'minor' | 'moderate' | 'significant' | 'critical';
    score: number;
    explanation?: string;
}

export interface IDriftInterpretationDB {
    id?: number;
    glyphId: string;
    glyphSymbol: string;
    geminiReading: string;
    agentConsensus: string;
    entropy: number;
    driftScore: number;
    ritualContext: string;
    timestamp: Date;
    version: string;
}

export interface IGlyphHistory {
    id: string;
    symbol: string;
    entropyHistory: number[];
    lastInterpreted: Date;
    driftVolatility: number;
}

export interface DriftCommentary {
    id?: number;
    linkedDriftId: number;
    agent: AgentName;
    commentaryText: string;
    timestamp: Date;
}

// --- LOGGING & HISTORY ---

export enum HistoricalEventType {
    ENTROPY_UPDATED = "ENTROPY_UPDATED",
    RITUAL_ACTIVATED = "RITUAL_ACTIVATED",
    DREAM_MANIFESTED = "DREAM_MANIFESTED",
    SEEKER_INPUT = "SEEKER_INPUT",
    DATACHEGA_PROTOCOL_EVENT = "DATACHEGA_PROTOCOL_EVENT",
    DREAMBLOOM_PULSE_ANALYSIS = "DREAMBLOOM_PULSE_ANALYSIS",
    EMERALD_TABLET_DECRYPTION = "EMERALD_TABLET_DECRYPTION",
    SPS_STABILIZATION = "SPS_STABILIZATION",
    CELESTIAL_ANOMALY = "CELESTIAL_ANOMALY",
    COSMIC_RESONANCE_EVENT = "COSMIC_RESONANCE_EVENT",
    CODEX_DREAM_SEED = "CODEX_DREAM_SEED"
}

export interface HistoricalEvent {
    id: string;
    type: HistoricalEventType;
    timestamp: number;
    data: any;
}

export interface HistoricalEntropyUpdateEventData {
    oldEntropy: number;
    newEntropy: number;
}

export interface EchoMessage {
    id: string;
    source: string;
    text: string;
    colorClass: string;
    isAutoEcho?: boolean;
    timestamp: string;
    meta?: any;
}

// --- VISUALIZATIONS ---

export enum GeoMode {
    GlyphDNA = "GlyphDNA",
    NullShell = "NullShell",
    CrystalLogic = "CrystalLogic",
    AethericWeave = "AethericWeave",
    Recursive = "Recursive",
    BioFractalPulse = "BioFractalPulse",
    OracleWhisper = "OracleWhisper",
    ShieldedChaos = "ShieldedChaos",
    PhaseResonance = "PhaseResonance",
    HypercubeEcho = "HypercubeEcho"
}

export enum VisualizationMatrixMode {
    NexusPoint = "NexusPoint",
    MirrorLoop = "MirrorLoop",
    VoidEcho = "VoidEcho",
    AethericFlow = "AethericFlow",
    TemporalWeave = "TemporalWeave",
    FractalCascade = "FractalCascade",
    AshfallCycle = "AshfallCycle",
    SacredLattice = "SacredLattice",
    DimensionalBloom = "DimensionalBloom",
    EntropyPulse = "EntropyPulse",
    GlyphicResonance = "GlyphicResonance",
    SymphonicPulse = "SymphonicPulse",
    PrimeGenesis = "PrimeGenesis"
}

export type PanelDisplayMode = GeoMode | VisualizationMatrixMode;

export enum ArtMode {
    DreambloomPulse = "DreambloomPulse",
    FractalGaze = "FractalGaze",
    VoidSketch = "VoidSketch"
}

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    baseLife?: number;
    size?: number;
    color: string;
    type?: string;
    history: { x: number; y: number }[];
}

export interface AshParticle {
    id: string;
    x: number;
    y: number;
    size: number;
    opacity: number;
    speedY: number;
    swayAngle: number;
    swaySpeed: number;
    swayAmplitude: number;
    initialSpeedX: number;
}

export interface AuraFlare {
    id: string;
    angle: number;
    length: number;
    maxLength: number;
    speed: number;
    color: string;
    thickness: number;
    opacity: number;
    type: 'resonance' | 'static';
    pulseSpeed?: number;
    pulseAmount?: number;
}

export interface CrystalGrowth {
    id: string;
    x: number; y: number;
    baseHue: number;
    maxSize: number;
    currentSize: number;
    growthSpeed: number;
    rotation: number;
    rotationSpeed: number;
    numSpokes: number;
    spokeLengthVariance: number;
    spokeWidth: number;
    opacity: number;
    targetOpacity: number;
    lifeCycle: 'growing' | 'stable' | 'fading';
    age: number;
    maxAge: number;
}

export interface Planet {
    id: string;
    orbitRadius: number;
    currentAngle: number;
    baseSpeed: number;
    baseSize: number;
    colorHue: number;
    textureSeed: number;
}

export interface LogicGraphNode {
    id: string;
    type: 'glyph' | 'axiom';
    label: string;
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    color: string;
    data: any;
    entropyLevel?: number;
    resonanceFrequency?: number;
    layer?: string;
}

export interface LogicGraphEdge {
    id: string;
    sourceId: string;
    targetId: string;
    type: 'mutation' | 'axiomBinding' | 'discoveredLattice';
    color: string;
    strength: number;
}

// --- THREADCOIL & TEMPORAL ---

export enum ThreadcoilState {
    Inert = "Inert",
    Spooling = "Spooling",
    Knotted = "Knotted",
    Frayed = "Frayed",
    Woven = "Woven",
    HarmonicLoop = "HarmonicLoop",
    EchoReversion = "EchoReversion"
}

export enum ThreadcoilNodeType {
    Ritual = "Ritual",
    GlyphMutation = "GlyphMutation",
    LoreShard = "LoreShard",
    Junction = "Junction"
}

export interface ThreadcoilSegment {
    id: string;
    type: ThreadcoilNodeType;
    state: ThreadcoilState;
    positionOnSpiral: number;
    label: string;
    description?: string;
    entropyAtPoint?: number;
    isJunction?: boolean;
}

export interface PlaybackState {
    isActive: boolean;
    currentHistoricalTime: number | null;
    playbackSpeed: number;
    timelineRange: { start: number; end: number };
}

// --- PROJECT SPECIFIC (AETHEL, DREAMBLOOM, ETC) ---

export interface AethelWeftTheme {
    id: string;
    name: string;
    signature: '🜂 Fire' | '🜄 Water' | '🜁 Air' | '🜃 Earth' | '🜄🜂🜁 Combined' | '∅ Void';
    narrativeFunction: string;
    visualDriftCue: string;
    colorClass: string;
}

export interface AethelWeftChronicle {
    id: string;
    name: string;
    firstVerse: string;
    currentWeavingMode: string;
    activeThemes: AethelWeftTheme[];
}

export interface DreambloomInterpretation {
    id: string;
    pulseNumber: number;
    imageUrl: string;
    title: string;
    symbolism: string;
    codexFunction: string;
    codexPlacement: string;
    isConjured: boolean;
    thematicSeed: string;
}

export interface SigilVariant {
    id: string;
    name: string;
    description: string;
    styleKeywords: string[];
    visualCue: {
        icon?: string;
        color?: string;
        backgroundColor?: string;
        borderColor?: string;
        animation?: string;
        textShadow?: string;
    };
}

// --- MISC DATA & PROPS ---

export interface XYPosition { x: number; y: number }

export interface MythicEventContext {
    entropyLevel: number;
    astralTidePhase: number;
    ritualHistory: { success: boolean; timestamp: number; type: string }[];
    bloodInkSpeciesActivity: Record<string, boolean>;
    lastDream?: DreamFragment;
    activeProphecies: string[];
    seekerTraits: string[];
}

export interface DreamFragment {
    id: string;
    content: string;
    symbols: string[];
    timestamp: number;
    prophecyLinks: string[];
}

export interface EchoSpeechProps {
    id: string;
    agent: string;
    message: string;
    position: XYPosition;
    lifespan?: number;
    isHarmonized?: boolean;
}

export interface TraitGate {
    id: string;
    glyphId: string;
    requiredTraits: string[];
    unlocked: boolean;
}

export enum AppTheme {
    OBSIDIAN = "OBSIDIAN",
    EMERALD = "EMERALD",
    CRIMSON = "CRIMSON",
    SOLAR = "SOLAR"
}

// --- PERSISTENCE ---

export type PersistenceTarget = 
    'EchoLog' | 'AgentGridState' | 'GlyphTree' | 'RitualState' | 
    'SystemEntropy' | 'AutoEchoState' | 'EventHistory' | 
    'ReweavingHistory' | 'Artifacts' | 'ActiveProfile' | 'AllProfiles' | 'PartyIds' | 'RPGState';

export interface CodexStateSnapshot {
    echoLog?: EchoMessage[];
    agentGridState?: any;
    glyphTree?: any;
    ritualState?: any;
    systemEntropy?: number;
    autoEchoState?: any;
    eventHistory?: HistoricalEvent[];
    reweavingHistory?: RewovenGlyph[];
    artifacts?: CodexArtifact[];
    activeProfile?: SeekerProfile | null;
    allProfiles?: SeekerProfile[];
    partyIds?: string[];
    rpgState?: RPGGameState;
}

export interface GameSaveData {
    slotId: string;
    timestamp: number;
    previewData: {
        seekerName: string;
        level: number;
        location: string;
        playtime: string;
    };
    fullState: CodexStateSnapshot;
}

export interface GameSaveSummary {
    slotId: string;
    timestamp: number;
    previewData: GameSaveData['previewData'];
}

// --- BLOOM SPECIES ---

export enum BloodInkSpeciesName {
    ThornedRose = "ThornedRose",
    HaloLily = "HaloLily",
    AshCrownedViolet = "AshCrownedViolet",
    ChrysanthemumEcho = "ChrysanthemumEcho",
    ObsidianOrchid = "ObsidianOrchid",
    LotusOfDepths = "LotusOfDepths",
    AstralJasmine = "AstralJasmine",
    InkAspect = "InkAspect",
    VoidLensAspect = "VoidLensAspect",
    SpiralFractureAspect = "SpiralFractureAspect"
}

// --- PROJECT FILES ---

export interface ProjectFile {
    path: string;
    content: string;
    lastModified: number;
    type: 'text' | 'json' | 'sigil' | 'log';
}

export interface ProjectMetadata {
    id: string;
    name: string;
    description: string;
    createdAt: number;
    vmStatus: 'Inert' | 'Booting' | 'Active' | 'Faulted';
    files: ProjectFile[];
}

export interface AgentPlan {
    objective: string;
    steps: {
        id: string;
        description: string;
        tool: string;
        status: 'todo' | 'in-progress' | 'done';
    }[];
    thinking_process: string[];
}

// --- MISSING TYPES ---

/**
 * State for the Mutation Loom panel.
 */
export interface MutationLoomState {
    glyph1Id: string | null;
    glyph2Id: string | null;
    isWeaving: boolean;
    entropyInjection: number;
    traitFocus: string[];
}

/**
 * A sensory resonance effect for visualizers.
 */
export interface ResonanceEffect {
    id: string;
    source: string;
    text: string;
    intensity: number;
    duration: string;
    colorProfile: string;
    borderColorClass: string;
    textColorClass: string;
    valueColorClass: string;
    time: string;
    effectType: 'ALL' | 'VISUAL' | 'MULTISENSORY';
}

/**
 * Definition of a Blood-Ink flora species.
 */
export interface BloodInkSpecies {
    id: BloodInkSpeciesName;
    name: string;
    symbol: string;
    colorClass: string;
    description: string;
    inherentTraits: string[];
    ritualCommand: string;
    seekerTraitAffinity: string;
}

/**
 * Personality and messaging profile for a Codex agent.
 */
export interface AgentProfile {
    name: AgentName;
    colorClass: string;
    personality: string[];
    generateMessage?: (event: any, speciesData: any) => string;
}

/**
 * Category of a glyph in the composer.
 */
export type ComposerGlyphCategory = 'Base' | 'Modifier';

/**
 * A basic glyph definition for composers.
 */
export interface ComposerGlyph {
    id: string;
    name: string;
    symbol: string;
}

/**
 * A Buga peptide-linked glyph.
 */
export interface BugaGlyph {
    id: string;
    symbol: string;
    aminoAcid?: string;
    aminoAcidFullName?: string;
    type: 'coding' | 'separator';
    position: number;
    iconicity: string;
    chargeType?: string;
    description?: string;
    binaryCode?: string;
}

/**
 * The specific type of an item in the market.
 */
export type MarketItemType = 'Weapon' | 'Armor' | 'Consumable' | 'Relic' | 'Companion' | 'Augmentation' | 'Material' | 'Construct' | 'Glitch';

/**
 * A thread of resonance between two points.
 */
export interface Thread {
    id: string;
    source: string;
    target: string;
    intensity: number;
}

/**
 * State for the Axiom Reweaver.
 */
export interface ReweaverState {
    activeGlyphId: string | null;
    selectedAxiom: AxiomKey | null;
    traitPreview: string[];
    isWeaving: boolean;
    calculatedEntropyCost: number;
}

/**
 * A log entry for a ritual event.
 */
export interface RitualLogEntry {
    success: boolean;
    timestamp: number;
    type: string;
}

/**
 * A relationship connection between two echoes.
 */
export interface EchoRelation {
    id: string;
    sourceId: string;
    targetId: string;
    type: 'resonance' | 'conflict' | 'reflection';
    strength: number;
}

/**
 * A node in the agent constellation map.
 */
export interface ConstellationNode {
    id: string;
    agent: AgentName;
    xPercent: number;
    yPercent: number;
    currentLuminosity: number;
}

/**
 * Properties for the Gemini Oracle provider.
 */
export interface GeminiContextType {
    isGenerating: boolean;
    error: Error | null;
    lastGeminiResponseText: string | null;
    selectedModelId: string;
    setSelectedModelId: (id: string) => void;
    customModelInput: string;
    setCustomModelInput: (model: string) => void;
    customApiKey: string;
    setCustomApiKey: (key: string) => void;
    hasActiveKey: boolean;
    effectiveApiKey: string | null;
    availableModels: { id: string; name: string; description: string; category?: string }[];
    testConnection: () => Promise<{ success: boolean; message: string }>;
    invokeGemini: (prompt: string, systemInstruction?: string, responseMimeType?: "text/plain" | "application/json", model?: string) => Promise<string | null>;
    generateImage: (prompt: string, model?: 'imagen-4.0-generate-001' | 'gemini-2.5-flash-image' | string, referenceImage?: string) => Promise<string | null>;
    generateVideo: (prompt: string, imageBase64?: string) => Promise<string | null>;
    generateSpeech: (text: string, voiceName?: string) => Promise<ArrayBuffer | null>;
    generateEmbedding: (text: string) => Promise<number[] | null>;
    semanticSearch: (query: string, entries: VectorMemoryEntry[], topK?: number) => Promise<VectorMemoryEntry[]>;
}

/**
 * Props for the Entropic Heart monitor panel.
 */
export interface EntropicHeartPanelProps {
    currentEntropy: number;
}

/**
 * The narrative context for a drift event.
 */
export type RitualContext = string;

/**
 * A frame capturing ritual state at a timestamp.
 */
export interface IRitualFrame {
    id: string;
    timestamp: number;
    entropyLevel: number;
}

/**
 * Props for the Blood-Ink Flora Chamber panel.
 */
export interface BloodInkFloraChamberProps {
    activeSpeciesName: BloodInkSpeciesName | null;
    allSpeciesData: Record<BloodInkSpeciesName, BloodInkSpecies>;
}

/**
 * Props for the Cosmic Entropy Geometry Generator panel.
 */
export interface CosmicEntropyGeometryGeneratorProps {
    currentEntropy: number;
    currentPhase: string;
    chaliceStatus: string;
    width?: number | string;
    height?: number | string;
    currentGeoMode: GeoMode;
    onSetGeoMode: (mode: GeoMode) => void;
}

/**
 * A particle of energy in a visualizer.
 */
export interface Spark {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    branchLevel: number;
}

/**
 * A node in the Tree of Life visualizer.
 */
export interface Sephirah {
    id: string;
    name: string;
    normalizedX: number;
    normalizedY: number;
    colorBaseHue: number;
    x?: number;
    y?: number;
    sourceSparks?: Spark[];
}

/**
 * A log entry for an emergence event.
 */
export interface SourceEchoLogEntry {
    id: string;
    timestamp: string;
    label: string;
    identity: string;
    triggerDescription: string;
}

/**
 * Props for the Living Inflection Field Engine panel.
 */
export interface LIFEPanelProps {
    currentEntropy: number;
    addEchoMessage: (source: string, text: string, colorClass?: string) => void;
}

/**
 * Props for the Ritual Rewrite Suggestions modal.
 */
export interface RitualRewriteSuggestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    suggestions: string | null;
    isLoading: boolean;
    onApplySuggestion: (suggestion: string) => void;
}

/**
 * Props for the Sigil Bloom variant selection panel.
 */
export interface SigilBloomVariantPanelProps {
    glyphMutationNodes: GlyphMutationNode[];
    onRevealBloomVariants: (node: GlyphMutationNode) => void;
    sigilBloomVariants: SigilVariant[];
    selectedBloomVariantId: string | null;
    onSelectBloomVariant: (id: string) => void;
    isGeneratingBloomVariants: boolean;
    isGeminiBusy: boolean;
}

/**
 * Props for the Visualization Matrix panel.
 */
export interface VisualizationMatrixPanelProps {
    width?: number | string;
    height?: number | string;
}

/**
 * Props for the Harmonic Core monitor panel.
 */
export interface HarmonicCorePanelProps {
    lambdaValue: number;
    status: 'Stabilized' | 'Oscillating' | 'Critical' | 'Inert';
    eleganceIndex: number;
}

/**
 * Props for the Codex Dream Panel.
 */
export interface CodexDreamPanelProps {
    currentEntropy: number;
    currentAxioms: Axiom[];
    lambdaValue: number;
    negentropyLevel: number;
    echoLog: EchoMessage[];
    addEchoMessage: (source: string, text: string, colorClass?: string) => void;
    width?: number | string;
    height?: number | string;
    onArtifactCreated: (artifact: CodexArtifact) => void;
    currentPhase?: string;
    chaliceStatus?: string;
}

/**
 * Data for a historical dream seeding event.
 */
export interface HistoricalCodexDreamSeedEventData {
    seedText: string;
    artMode: string;
    timestamp: number;
}

/**
 * Props for the Temporal Spiral visualizer.
 */
export interface TemporalSpiralVisualizerProps {
    segments: ThreadcoilSegment[];
    width: number;
    height: number;
    currentEntropy: number;
}

/**
 * Props for the Exotic Mechanisms physics panel.
 */
export interface ExoticMechanismsPanelProps {
    currentEntropy: number;
    width?: number | string;
    height?: number | string;
    addEchoMessage: (source: string, text: string, colorClass?: string) => void;
}

/**
 * Display modes for the exotic mechanisms panel.
 */
export enum ExoticMechanismMode {
    HiggsField = "HiggsField Dynamics",
    QuantumVacuum = "Quantum Vacuum Fluctuations",
    SpacetimeTopology = "Spacetime Topology Dynamics"
}

/**
 * Props for the Datachega Resthet protocol panel.
 */
export interface DatachegaResthetPanelProps {
    addEchoMessage: (source: string, text: string, colorClass?: string) => void;
}

/**
 * Props for the Glyph Composer panel.
 */
export interface GlyphComposerPanelProps {
    addEchoMessage: (source: string, text: string, colorClass?: string) => void;
    isBugaModeActive: boolean;
}

/**
 * Data for a historical Emerald Tablet decryption event.
 */
export interface HistoricalEmeraldTabletDecryptionEventData {
    starsRecovered: number;
    coherenceLevel: number;
    finalStatus: string;
}

/**
 * Props for the Dreambloom Genesis matrix panel.
 */
export interface DreambloomGenesisPanelProps {
    interpretations: DreambloomInterpretation[];
    onConjurePulse: (seed?: string) => void;
    isAutoActive: boolean;
    onToggleAuto: () => void;
    isLoading: boolean;
    addEchoMessage: (source: string, text: string, colorClass?: string) => void;
}

/**
 * Props for the Celestial Anomaly Weaver panel.
 */
export interface CelestialAnomalyWeaverPanelProps {
    width?: number | string;
    height?: number | string;
    addEchoMessage: (source: string, text: string, colorClass?: string) => void;
}

/**
 * Data for a historical celestial anomaly event.
 */
export interface HistoricalCelestialAnomalyEventData {
    anomalyName: string;
    thermalWaveStrength: number;
    gazeModeActive: boolean;
}

/**
 * Props for the Cosmic Resonance dashboard panel.
 */
export interface CosmicResonanceDashboardPanelProps {
    width?: number | string;
    height?: number | string;
    addEchoMessage: (source: string, text: string, colorClass?: string) => void;
}

/**
 * Data for a historical cosmic resonance event.
 */
export interface HistoricalCosmicResonanceEventData {
    crmNode: string;
    eventType: string;
    details: string;
    intensity?: number;
    data: any;
}

/**
 * Types of resonant pulses sent to CRM nodes.
 */
export type CrmPulseType = 'AX_OMEGA_035' | 'OMEGA_SA_RESONANCE';

/**
 * Props for the Temporal Resonance Log panel.
 */
export interface TemporalResonanceLogPanelProps {
    width?: number | string;
    height?: number | string;
}

/**
 * Props for the Temporal Operations Console panel.
 */
export interface TemporalOperationsConsolePanelProps {
    width?: number | string;
    height?: number | string;
    addEchoMessage: (source: AgentName | string, text: string, colorClass?: string, isAutoEcho?: boolean, meta?: any) => void;
}

/**
 * Data for a historical seeker input event.
 */
export interface HistoricalSeekerInputEventData {
    inputType: string;
    inputValue: string;
    panelContext: string;
    details: string;
}

/**
 * Props for the Axiom Resonance Viewer panel.
 */
export interface AxiomResonanceViewerPanelProps {
    axioms: Axiom[];
    panelHeight?: number;
}

/**
 * Props for the Aethel-Weft Codex update panel.
 */
export interface AethelWeftCodexUpdatePanelProps {
    panelHeight?: number;
}

/**
 * Props for the Deep Glyph Visualization panel.
 */
export interface GlyphVisualizationPanelProps {
    panelHeight?: number;
    glyphData: any;
    pulseDetails: any;
    visualizationDetails: any;
    systemNote: any;
}

/**
 * Props for the Shatterpoint Trace investigation panel.
 */
export interface ShatterpointTracePanelProps {
    objective: string;
    triggerGlyph: string;
    axiomaticLinks: string[];
    traceParameters: any;
    oracleCommentary: string;
}

/**
 * Props for the Tablet of the Phoenix panel.
 */
export interface TabletOfThePhoenixPanelProps {
    panelHeight?: number;
}

/**
 * Props for the Seeker Profile Weaver panel.
 */
export interface SeekerProfileWeaverPanelProps {
    addEchoMessage: (source: string, text: string, colorClass?: string) => void;
    onProfileCreated?: (profile: SeekerProfile) => void;
    existingProfile?: SeekerProfile | null;
    onUpdateProfile?: (profile: SeekerProfile) => void;
    width?: number | string;
    height?: number | string;
}

/**
 * Props for the Agent Inspector panel.
 */
export interface AgentInspectorPanelProps {
    agent: AgentNode | null;
    onClose: () => void;
    onCommunicate?: (agent: AgentNode) => void;
}

/**
 * Data for a historical dreambloom analysis event.
 */
export interface HistoricalDreambloomAnalysisEventData {
    interpretation: DreambloomInterpretation;
    analysisTimestamp: number;
}

/**
 * Props for the Community Resonance commons panel.
 */
export interface CommunityResonancePanelProps {
    width?: number | string;
    height?: number | string;
    addEchoMessage: (source: string, text: string, colorClass?: string) => void;
    seekerFaction?: AgentFaction;
}

/**
 * A collective goal for the seeker community.
 */
export interface CommunityGoal {
    id: string;
    title: string;
    description: string;
    targetFlux: number;
    currentFlux: number;
    reward: string;
    status: 'active' | 'complete';
}

/**
 * Scores and stats for an agent faction.
 */
export interface FactionScore {
    faction: AgentFaction;
    score: number;
    activeSeekers: number;
}

/**
 * A message in the community Aether-Net chat.
 */
export interface ChatMessage {
    id: string;
    sender: string;
    faction: AgentFaction | string;
    message: string;
    timestamp: number;
}

/**
 * An entry in the Seeker leaderboard.
 */
export interface LeaderboardEntry {
    id: string;
    rank: number;
    name: string;
    faction: AgentFaction | string;
    fluxContribution: number;
    achievements: string[];
    avatarSeed: string;
}

/**
 * Props for the Chronicle Reliquary panel.
 */
export interface ChronicleReliquaryPanelProps {
    width?: number | string;
    height?: number | string;
    artifacts: CodexArtifact[];
    addEchoMessage: (source: string, text: string, colorClass?: string) => void;
}

/**
 * Props for the RPG Nexus engine panel.
 */
export interface RPGNexusPanelProps {
    width?: number | string;
    height?: number | string;
    addEchoMessage: (source: string, text: string, colorClass?: string, isAutoEcho?: boolean, meta?: any) => void;
    activeProfile: SeekerProfile | null;
    allProfiles: SeekerProfile[];
    partyIds: string[];
    onUpdateProfile: (profile: SeekerProfile) => void;
    onSetParty: (ids: string[]) => void;
    currentEntropy: number;
    systemMode?: CodexModeId;
    onArtifactCreated: (artifact: CodexArtifact) => void;
    artifacts: CodexArtifact[];
    savedState?: RPGGameState;
    onSaveState?: (state: RPGGameState) => void;
    onUpdateSystemMetrics: (entropyDelta: number, negentropyDelta: number) => void;
}

/**
 * A card used in the Protocol Duel mini-game.
 */
export interface DuelCard {
    id: string;
    name: string;
    type: string;
    rarity: ArtifactRarity;
    stats: { atk: number; def: number; res: number };
    image: string | null;
}

/**
 * State of an active card duel.
 */
export interface CardDuelState {
    isActive: boolean;
    phase: BattlePhase;
    round: number;
    playerHand: DuelCard[];
    enemyHand: DuelCard[];
    playedCardPlayer: DuelCard | null;
    playedCardEnemy: DuelCard | null;
    playerScore: number;
    enemyScore: number;
    logs: string[];
    enemyName: string;
    rewards?: { flux?: number; xp?: number };
}

/**
 * Phases of a card battle.
 */
export enum BattlePhase {
    LOBBY = "LOBBY",
    PLAYER_TURN = "PLAYER_TURN",
    ENEMY_REVEAL = "ENEMY_REVEAL",
    RESOLUTION = "RESOLUTION",
    VICTORY = "VICTORY",
    DEFEAT = "DEFEAT"
}
