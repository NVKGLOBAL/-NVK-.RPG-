import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import PanelModal from './components/modals/PanelModal';
import SaveLoadModal from './components/modals/SaveLoadModal';
import { AISettingsModal } from './components/modals/AISettingsModal';
import OracleSanctumModal from './components/modals/OracleSanctumModal';
import RitualAlchemyResultsModal from './components/modals/RitualAlchemyResultsModal';
import RitualRewriteSuggestionsModal from './components/modals/RitualRewriteSuggestionsModal';
import SystemModulesPanel from './components/panels/SystemModulesPanel';
import RPGNexusPanel from './components/panels/RPGNexusPanel';
import ProtocolDuelPanel from './components/panels/ProtocolDuelPanel';
import FluxFarmPanel from './components/panels/FluxFarmPanel';
import DreambloomGenesisPanel from './components/panels/DreambloomGenesisPanel';
import MutationLoomPanel from './components/panels/MutationLoomPanel';
import GlyphComposerPanel from './components/panels/GlyphComposerPanel';
import EmeraldTabletDecryptionPanel from './components/panels/EmeraldTabletDecryptionPanel';
import CelestialAnomalyWeaverPanel from './components/panels/CelestialAnomalyWeaverPanel';
import CrystalFormationPanel from './components/panels/CrystalFormationPanel';
import FlowerOfLifeEntropyExplorer from './components/panels/FlowerOfLifeEntropyExplorer';
import ExoticMechanismsPanel from './components/panels/ExoticMechanismsPanel';
import CelestialEntropyCyclePanel from './components/panels/CelestialEntropyCyclePanel';
import EntropyDimensionDiagramPanel from './components/panels/EntropyDimensionDiagramPanel';
import GlyphVisualizationPanel from './components/panels/GlyphVisualizationPanel';
import CosmicResonanceDashboardPanel from './components/panels/CosmicResonanceDashboardPanel';
import TemporalOperationsConsolePanel from './components/panels/TemporalOperationsConsolePanel';
import DriftDifferentialOverlay from './components/panels/DriftDifferentialOverlay';
import HarmonicCorePanel from './components/panels/HarmonicCorePanel';
import EntropyDiagnosticsPanel from './components/panels/EntropyDiagnosticsPanel';
import PeptideSimulationPanel from './components/panels/PeptideSimulationPanel';
import CodexPandiumPanel from './components/panels/CodexPandiumPanel';
import DatachegaResthetPanel from './components/panels/DatachegaResthetPanel';
import AethelWeftCodexUpdatePanel from './components/panels/AethelWeftCodexUpdatePanel';
import ChronicleReliquaryPanel from './components/panels/ChronicleReliquaryPanel';
import TabletOfThePhoenixPanel from './components/panels/TabletOfThePhoenixPanel';
import ShatterpointTracePanel from './components/panels/ShatterpointTracePanel';
import BugaGlyphCodexPanel from './components/panels/BugaGlyphCodexPanel';
import BloodInkFloraChamber from './components/panels/BloodInkFloraChamber';
import SigilBloomVariantPanel from './components/panels/SigilBloomVariantPanel';
import AgentInspectorPanel from './components/panels/AgentInspectorPanel';
import AgentSimulationPanel from './components/panels/AgentSimulationPanel';
import AgentChatPanel from './components/panels/AgentChatPanel';
import SeekerProfileDashboardPanel from './components/panels/SeekerProfileDashboardPanel';
import SeekerProfileWeaverPanel from './components/panels/SeekerProfileWeaverPanel';
import CardBookPanel from './components/panels/CardBookPanel';
import CommunityResonancePanel from './components/panels/CommunityResonancePanel';
import LIFEPanel from './components/panels/LIFEPanel';
import CodexDreamPanel from './components/panels/CodexDreamPanel';
import PrimeGenesisPanel from './components/panels/PrimeGenesisPanel';
import SeekerVitalsPanel from './components/panels/SeekerVitalsPanel';
import AssistantDashboardPanel from './components/panels/AssistantDashboardPanel';
import EntropicHeartPanel from './components/panels/EntropicHeartPanel';
import { RitualCanvasContainer } from './components/RitualCanvasContainer';
import { EchoScribePanel } from './components/EchoScribePanel';
import { BootSequence } from './components/core/BootSequence';
import { NVKNexusLanding } from './components/NVKNexusLanding';
import OnboardingFunnel from './components/core/OnboardingFunnel';
import CodexFooterBar from './components/core/CodexFooterBar';
import SeekerAuraDisplay from './components/panels/SeekerAuraDisplay';
import { ChatNVKPanel } from './components/panels/ChatNVKPanel';
import { CryptoNexusPanel } from './components/panels/CryptoNexusPanel';
import { ErrorBoundary } from './components/core/ErrorBoundary';
import { useSovereignAI } from './context/SovereignAIContext';
import { useNarration } from './context/NarrationContext';
import { useNotifications } from './context/NotificationContext';
import { SystemStateProvider } from './context/SystemContext';
import { useCodexPersistence } from './hooks/useCodexPersistence';
import { generateInitialAgents } from './lib/simulationUtils';
import { globalSoundEngine } from './lib/SoundEngine';
import { generateProceduralSvgArtwork } from './lib/ai/providerAdapter';
import MagicalMouseTrail from './components/visuals/MagicalMouseTrail';
import { ParallaxParticles } from './components/visuals/ParallaxParticles';
import { ScrollIndicator } from './components/ui/ScrollIndicator';
import { Web3Provider } from './context/Web3Context';

import {
  CodexModeId,
  AgentName,
  SeekerProfile,
  CodexArtifact,
  EchoMessage,
  AgentNode,
  GeoMode,
  PanelDisplayMode,
  MutationLoomState,
  RitualOutcome,
  RitualAlchemyResult,
  PlacedGlyph,
  CanvasConnection,
  GlyphMutationNode,
  DreambloomInterpretation,
  SigilVariant,
  BloodInkSpeciesName,
  RPGGameState,
  SeekerAuraColor,
  IDriftInterpretationDB,
  CodexStateSnapshot,
} from './types';
import {
  ALL_CANONICAL_AXIOMS,
  AXIOM_RITUAL_ELEMENTS,
  BLOOD_INK_SPECIES_DATA,
} from './constants';

type AppStage = 'NEXUS' | 'BOOT' | 'ONBOARDING' | 'ACTIVE';

const INITIAL_GLYPH_NODES: GlyphMutationNode[] = [
  {
    id: 'root-alpha',
    glyphId: 'G-ALPHA',
    label: 'Seed of Whispers',
    traits: ['Resonant', 'Mnemonic', 'Seed'],
    entropyLevel: 0.24,
    agentInfluences: ['Loom Oracle', 'Seeker'],
    timestamp: 1700000000000,
  },
  {
    id: 'mut-b1',
    glyphId: 'G-BETA',
    label: 'Veil of Sparks',
    traits: ['Kinetic', 'Entropic'],
    entropyLevel: 0.56,
    parentId: 'root-alpha',
    agentInfluences: ['Scribe', 'Fusion Engine'],
    timestamp: 1700000100000,
  },
  {
    id: 'mut-gamma',
    glyphId: 'G-GAMMA',
    label: 'Lotus Coherence',
    traits: ['Harmonic', 'Anchor'],
    entropyLevel: 0.18,
    parentId: 'root-alpha',
    agentInfluences: ['Dreambloom Oracle'],
    timestamp: 1700000200000,
  },
];

const MODAL_TITLES: Record<string, string> = {
  card_book: 'The Card Book: Seeker Archives',
  seeker_weaver: 'Seeker Profile Weaver',
  chat_nvk: 'ChatNVK // Sovereign Architect',
  prime_genesis: 'Prime Genesis Simulator',
  rpg_nexus: 'RPGNexus Hub',
  protocol_duel: 'Protocol Duel Arena',
  flux_farm: 'Flux Hydroponic Farm',
  dreambloom: 'Dreambloom Genesis Matrix',
  mutation_loom: 'Glyph Mutation Loom',
  glyph_composer: 'Harmonic Glyph Composer',
  emerald_tablet: 'Emerald Tablet Decryption',
  celestial_anomaly: '14 Herculis Celestial Anomaly',
  crystal_garden: 'Crystal Formation Chamber',
  geometry_explorer: 'Sacred Geometry Entropy Explorer',
  exotic_mechanisms: 'Exotic Physics Mechanisms',
  celestial_entropy: 'Celestial Entropy Cycle',
  dimension_diagram: 'Entropy Dimension Diagram',
  glyph_vis: 'Deep Glyph Visualization',
  web3_nexus: 'Decentralized Seeker Portal',
  crm_dashboard: 'CRM-Θ8 Cosmic Resonance',
  temporal_ops: 'Temporal Operations Console',
  drift_differential: 'Drift Differential Analysis',
  harmonic_core: 'Harmonic Core Monitor',
  entropy_diagnostics: 'Entropy Diagnostics Telemetry',
  peptide_sim: 'Buga Peptide Simulation',
  codex_pandium: 'Codex Pandium Archive',
  datachega: 'Datachega Resthet Protocol',
  aethel_update: 'Aethel-Weft Codex Update',
  chronicle_display: 'Chronicle Reliquary',
  phoenix_tablet: 'Tablet of the Phoenix',
  shatterpoint_trace: 'Shatterpoint Trace Protocol',
  buga_codex: 'Buga Glyph Codex',
  flora_chamber: 'Blood-Ink Flora Chamber',
  sigil_bloom: 'Sigil Bloom Variants',
  agent_directory: 'Agent Directory & Inspector',
  agent_chat: 'Agent Comm-Link',
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'assistant' | 'rpg'>('assistant');
  const [stage, setStage] = useState<AppStage>('NEXUS');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isSaveLoadModalOpen, setIsSaveLoadModalOpen] = useState(false);
  const [isAISettingsModalOpen, setIsAISettingsModalOpen] = useState(false);
  const [isOracleSanctumOpen, setIsOracleSanctumOpen] = useState(false);
  const [isAlchemyModalOpen, setIsAlchemyModalOpen] = useState(false);
  const [isRewriteModalOpen, setIsRewriteModalOpen] = useState(false);
  const [rewriteSuggestions, setRewriteSuggestions] = useState<string | null>(null);
  const [isRewriteLoading, setIsRewriteLoading] = useState(false);

  const [communicatingAgent, setCommunicatingAgent] = useState<AgentNode | null>(null);
  const [inspectedAgent, setInspectedAgent] = useState<AgentNode | null>(null);
  const [editingProfile, setEditingProfile] = useState<SeekerProfile | null>(null);

  const [currentEntropy, setCurrentEntropy] = useState<number>(0.1);
  const [entropyHistory, setEntropyHistory] = useState<number[]>([0.1, 0.12, 0.11, 0.1]);
  const [codexModeId, setCodexModeId] = useState<CodexModeId>(CodexModeId.ORIGIN_STATE);
  const [echoLog, setEchoLog] = useState<EchoMessage[]>([]);
  const [artifacts, setArtifacts] = useState<CodexArtifact[]>([]);
  const [agents] = useState<AgentNode[]>(generateInitialAgents());

  const [allProfiles, setAllProfiles] = useState<SeekerProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [partyIds, setPartyIds] = useState<string[]>([]);
  const [negentropyLevel, setNegentropyLevel] = useState(0.5);
  const [isNegentropyStable] = useState(true);
  const [appScrollTop, setAppScrollTop] = useState(0);

  const [isAutoEchoPaused, setIsAutoEchoPaused] = useState(false);
  const [showAshfall, setShowAshfall] = useState(false);
  const [showLogicWebDebug, setShowLogicWebDebug] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [showSigilOverlay, setShowSigilOverlay] = useState(false);
  const [isBugaModeActive, setIsBugaModeActive] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => globalSoundEngine.getMuted());
  const [geometryDisplayMode, setGeometryDisplayMode] = useState<PanelDisplayMode>(GeoMode.AethericWeave);
  const [activeFloraSpecies] = useState<BloodInkSpeciesName>(BloodInkSpeciesName.ThornedRose);

  const [rpgState, setRpgState] = useState<RPGGameState | undefined>(undefined);
  const [placedGlyphs, setPlacedGlyphs] = useState<PlacedGlyph[]>([]);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  const [lastRitualOutcome, setLastRitualOutcome] = useState<RitualOutcome | null>(null);

  const [glyphMutationNodes, setGlyphMutationNodes] = useState<GlyphMutationNode[]>(INITIAL_GLYPH_NODES);
  const [mutationLoomState, setMutationLoomState] = useState<MutationLoomState>({
    glyph1Id: 'root-alpha',
    glyph2Id: 'mut-b1',
    isWeaving: false,
    entropyInjection: 0.1,
    traitFocus: ['Harmonic'],
  });

  const [dreambloomInterpretations, setDreambloomInterpretations] = useState<DreambloomInterpretation[]>(() => [
    {
      id: 'db-pulse-1',
      pulseNumber: 1,
      imageUrl: generateProceduralSvgArtwork('Dreambloom Resonance Lotus'),
      title: 'Initial Lotus Resonance',
      symbolism: 'Emergent order blooming out of entropic background noise.',
      codexFunction: 'Stabilizes Seeker semantic anchors',
      codexPlacement: 'First Crown / Core Loom',
      isConjured: false,
      thematicSeed: 'Origin Resonance',
    },
  ]);
  const [isDreambloomAuto, setIsDreambloomAuto] = useState(false);
  const [isDreambloomLoading, setIsDreambloomLoading] = useState(false);

  const [sigilBloomVariants, setSigilBloomVariants] = useState<SigilVariant[]>([]);
  const [selectedBloomVariantId, setSelectedBloomVariantId] = useState<string | null>(null);
  const [isGeneratingBloomVariants, setIsGeneratingBloomVariants] = useState(false);

  const activeProfile = useMemo(
    () => allProfiles.find((p) => p.id === activeProfileId) || null,
    [allProfiles, activeProfileId]
  );

  const seekerTraits = useMemo(() => activeProfile?.selfTraits || [], [activeProfile]);

  const {
    invokeAI,
    isGenerating: isAIGenerating,
    selectedModelId,
    setSelectedModelId,
    availableModels,
  } = useSovereignAI();
  const { speak, isNarrationEnabled, toggleNarration } = useNarration();
  const { notify, confirmDialog } = useNotifications();

  useEffect(() => {
    setEntropyHistory((prev) => [...prev.slice(-24), currentEntropy]);
  }, [currentEntropy]);

  const addEchoMessage = useCallback(
    (source: string, text: string, colorClass: string = 'text-slate-300', isAutoEcho: boolean = false, meta?: any) => {
      const newMessage: EchoMessage = {
        id: `echo-${Date.now()}-${Math.random()}`,
        source,
        text,
        colorClass,
        isAutoEcho,
        meta,
        timestamp: new Date().toISOString(),
      };
      setEchoLog((prev) => [newMessage, ...prev].slice(0, 100));
      if (isNarrationEnabled) speak(`${source} says: ${text}`);
    },
    [isNarrationEnabled, speak]
  );

  const stateSnapshot = useMemo(
    () => ({
      echoLog,
      systemEntropy: currentEntropy,
      ritualState: { currentPhase: 'Active', chaliceStatus: 'Flowing', placedGlyphs, connections },
      artifacts,
      activeProfile,
      allProfiles,
      partyIds,
      rpgState,
    }),
    [echoLog, currentEntropy, placedGlyphs, connections, artifacts, activeProfile, allProfiles, partyIds, rpgState]
  );

  const {
    saveGame,
    loadGame,
    getSaveSlots,
    hydrateState,
    saveStatus,
    lastSavedTime,
    exportSave,
    importRealityFile,
  } = useCodexPersistence(
    ['EchoLog', 'SystemEntropy', 'RitualState', 'Artifacts', 'ActiveProfile', 'AllProfiles', 'PartyIds', 'RPGState'],
    stateSnapshot
  );

  const applySnapshot = useCallback((hydrated: CodexStateSnapshot) => {
    if (hydrated.echoLog) setEchoLog(hydrated.echoLog);
    if (hydrated.systemEntropy !== undefined) setCurrentEntropy(hydrated.systemEntropy);
    if (hydrated.ritualState) {
      setPlacedGlyphs(hydrated.ritualState.placedGlyphs || []);
      setConnections(hydrated.ritualState.connections || []);
    }
    if (hydrated.artifacts) setArtifacts(hydrated.artifacts);
    if (hydrated.allProfiles) {
      setAllProfiles(hydrated.allProfiles);
    } else if (hydrated.activeProfile) {
      setAllProfiles([hydrated.activeProfile]);
    }
    if (hydrated.partyIds) setPartyIds(hydrated.partyIds);
    if (hydrated.activeProfile?.id) {
      setActiveProfileId(hydrated.activeProfile.id);
    } else if (hydrated.allProfiles && hydrated.allProfiles.length > 0) {
      setActiveProfileId(hydrated.allProfiles[0].id);
    }
    if (hydrated.rpgState) setRpgState(hydrated.rpgState);
  }, []);

  useEffect(() => {
    hydrateState().then((hydrated) => {
      if (hydrated) {
        applySnapshot(hydrated);
      }
    });
  }, [hydrateState, applySnapshot]);

  const handleImportReality = useCallback(
    async (file: File) => {
      try {
        const result = await importRealityFile(file);
        if (result.kind === 'save') {
          applySnapshot(result.save.fullState);
          const count = result.save.fullState.allProfiles?.length || (result.save.fullState.activeProfile ? 1 : 0);
          if (count > 0) setStage('ACTIVE');
          addEchoMessage(AgentName.System, `Reality snapshot restored (${count} Seeker profile(s)).`, 'text-emerald-400');
          notify(`Imported reality backup (${count} Seeker shard(s)).`, 'success');
        } else {
          const imported = result.profile;
          setAllProfiles((prev) => {
            const exists = prev.some((p) => p.id === imported.id);
            return exists ? prev.map((p) => (p.id === imported.id ? imported : p)) : [...prev, imported];
          });
          setActiveProfileId(imported.id);
          setStage('ACTIVE');
          addEchoMessage(AgentName.System, `Imported Seeker Shard: ${imported.name}`, 'text-emerald-400');
          notify(`Imported Seeker Shard "${imported.name}".`, 'success');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to import JSON file.';
        notify(msg, 'error');
        addEchoMessage(AgentName.System, `Import rejected: ${msg}`, 'text-rose-400');
      }
    },
    [importRealityFile, applySnapshot, addEchoMessage, notify]
  );

  const handleExportSave = useCallback(async () => {
    const result = await exportSave();
    notify(result.message, result.ok ? 'success' : 'error');
  }, [exportSave, notify]);

  const handleUpdateProfile = useCallback(
    (profile: SeekerProfile) => {
      setAllProfiles((prev) => {
        const existing = prev.find((p) => p.id === profile.id);
        if (existing) {
          return prev.map((p) => (p.id === profile.id ? profile : p));
        }
        return [...prev, profile];
      });
      if (!activeProfileId) setActiveProfileId(profile.id);
    },
    [activeProfileId]
  );

  const handleDeleteProfile = useCallback(
    (id: string) => {
      setAllProfiles((prev) => {
        const next = prev.filter((p) => p.id !== id);
        if (activeProfileId === id) {
          setActiveProfileId(next[0]?.id || null);
        }
        if (next.length === 0) {
          setStage('ONBOARDING');
          setActiveModal(null);
        }
        return next;
      });
      setPartyIds((prev) => prev.filter((pid) => pid !== id));
      addEchoMessage(AgentName.System, 'Seeker Shard removed from local Card Book.', 'text-rose-400');
    },
    [activeProfileId, addEchoMessage]
  );

  const handleProfileManifested = useCallback(
    (profile: SeekerProfile) => {
      setAllProfiles((prev) => {
        const exists = prev.some((p) => p.id === profile.id);
        return exists ? prev.map((p) => (p.id === profile.id ? profile : p)) : [...prev, profile];
      });
      setActiveProfileId(profile.id);
      setStage('ACTIVE');
      addEchoMessage(AgentName.System, `Seeker Shard manifested: ${profile.name}`, 'text-emerald-400');
    },
    [addEchoMessage]
  );

  const handleSetMainCharacter = (id: string) => {
    setActiveProfileId(id);
    const profile = allProfiles.find((p) => p.id === id);
    addEchoMessage(AgentName.System, `Primary Signal swapped to ${profile?.name}.`, 'text-cyan-300');
    globalSoundEngine.playSFX('pulse');
  };

  const handleTogglePartyMember = (id: string) => {
    setPartyIds((prev) => {
      if (prev.includes(id)) return prev.filter((pid) => pid !== id);
      if (prev.length >= 3) {
        addEchoMessage(AgentName.System, 'Party Resonance limit reached (3 members).', 'text-yellow-400');
        return prev;
      }
      return [...prev, id];
    });
    globalSoundEngine.playUIFeedback('click');
  };

  const addArtifact = useCallback(
    (artifact: CodexArtifact) => {
      setArtifacts((prev) => [artifact, ...prev]);
      addEchoMessage(AgentName.ChronicleReliquaryAgent, `Artifact Acquired: ${artifact.name}`, 'text-amber-300');
    },
    [addEchoMessage]
  );

  const handleResetProfile = async () => {
    const ok = await confirmDialog({
      title: 'Sever Active Seeker Identity',
      message: 'Sever this identity shard? If no other shards remain, you will return to the Synthesis Loom.',
      confirmLabel: 'Sever Shard',
      destructive: true,
    });
    if (!ok || !activeProfileId) return;
    handleDeleteProfile(activeProfileId);
  };

  const handleSaveRPGState = useCallback((state: RPGGameState) => {
    setRpgState(state);
  }, []);

  const handleSystemMetricsUpdate = useCallback((entropyDelta: number, negentropyDelta: number) => {
    setCurrentEntropy((prev) => Math.min(1, Math.max(0, prev + entropyDelta)));
    setNegentropyLevel((prev) => Math.min(1, Math.max(0, prev + negentropyDelta)));
  }, []);

  const handleRitualActivated = (success: boolean, details: string, type?: string, alchemyResult?: RitualAlchemyResult) => {
    addEchoMessage(
      AgentName.RitualEngine,
      success ? `Ritual Successful: ${details}` : `Ritual Fizzled: ${details}`,
      success ? 'text-emerald-400' : 'text-rose-400'
    );
    setLastRitualOutcome({ success, details, type, alchemyResult });
    if (alchemyResult) {
      setIsAlchemyModalOpen(true);
    }
    if (success) {
      setCurrentEntropy((prev) => Math.max(0, prev - 0.05));
      setNegentropyLevel((prev) => Math.min(1, prev + 0.05));
    }
  };

  const handleAnalyzeForRewrite = useCallback(async () => {
    setIsRewriteModalOpen(true);
    setIsRewriteLoading(true);
    setRewriteSuggestions(null);
    const glyphSummary = placedGlyphs.map((g) => `${g.label} (${g.type})`).join(', ') || 'Empty Canvas';
    const prompt = `Analyze this Ritual Canvas configuration (${placedGlyphs.length} glyphs: ${glyphSummary}; ${connections.length} connections; system entropy ${currentEntropy.toFixed(3)}) and propose 3 concrete structural rewrite improvements formatted with bullet points starting with * Suggestion: ... and Rationale: ...`;
    try {
      const response = await invokeAI(
        prompt,
        'You are the Ritual Rewrite Oracle of NVK Tri-Sophian Codex. Provide concise, actionable structural glyph suggestions.'
      );
      setRewriteSuggestions(response || '* Suggestion: Anchor a Core glyph to two Resonators\nRationale: Stabilizes local entropy.');
    } finally {
      setIsRewriteLoading(false);
    }
  }, [placedGlyphs, connections.length, currentEntropy, invokeAI]);

  const handleWeaveGlyphs = useCallback(
    async (
      glyph1Id: string,
      glyph2Id: string,
      entropyInjection: number,
      traitFocus: string[]
    ): Promise<GlyphMutationNode | undefined> => {
      const g1 = glyphMutationNodes.find((g) => g.id === glyph1Id);
      const g2 = glyphMutationNodes.find((g) => g.id === glyph2Id);
      if (!g1 || !g2) return undefined;

      setMutationLoomState((prev) => ({ ...prev, isWeaving: true }));
      try {
        const prompt = `Fuse glyph "${g1.label}" (${g1.traits.join(', ')}) and "${g2.label}" (${g2.traits.join(', ')}) at entropy injection ${entropyInjection.toFixed(2)} with trait focus [${traitFocus.join(', ') || 'Balanced'}]. Reply with a concise mutated glyph title on the first line.`;
        const result = await invokeAI(prompt, 'You are the Mutation Loom Oracle.');
        const label = (result?.split('\n')[0] || `${g1.label.split(' ')[0]}-${g2.label.split(' ')[0]} Hybrid`).slice(0, 48);
        const newNode: GlyphMutationNode = {
          id: `mut-${Date.now()}`,
          glyphId: `G-MUT-${glyphMutationNodes.length + 1}`,
          label,
          traits: Array.from(new Set([...traitFocus, ...g1.traits.slice(0, 2), ...g2.traits.slice(0, 2)])).slice(0, 4),
          entropyLevel: Math.min(1, Math.max(0.05, (g1.entropyLevel + g2.entropyLevel) / 2 + entropyInjection * 0.25)),
          parentId: [g1.id, g2.id],
          agentInfluences: ['Loom Oracle', activeProfile?.name || 'Seeker'],
          timestamp: Date.now(),
        };
        setGlyphMutationNodes((prev) => [newNode, ...prev]);
        addEchoMessage(AgentName.LoomOracle, `Mutated glyph woven: "${newNode.label}"`, 'text-teal-300');
        return newNode;
      } finally {
        setMutationLoomState((prev) => ({ ...prev, isWeaving: false }));
      }
    },
    [glyphMutationNodes, invokeAI, activeProfile, addEchoMessage]
  );

  const handleConjureDreambloom = useCallback(
    async (seed?: string) => {
      setIsDreambloomLoading(true);
      try {
        const theme = seed?.trim() || 'Harmonic Recursion';
        const prompt = `Generate a poetic Dreambloom interpretation for thematic seed "${theme}". Give 1 concise symbolism sentence.`;
        const symbolText = await invokeAI(prompt, 'You are the Dreambloom Oracle.');
        const nextNumber = dreambloomInterpretations.length + 1;
        const entry: DreambloomInterpretation = {
          id: `db-pulse-${Date.now()}`,
          pulseNumber: nextNumber,
          imageUrl: generateProceduralSvgArtwork(`Dreambloom: ${theme}`),
          title: `Pulse #${nextNumber}: ${theme}`,
          symbolism: symbolText || `Fractals converge around ${theme}, reducing systemic dissonance.`,
          codexFunction: 'Rebalances dream memory & glyph resonance',
          codexPlacement: 'Crown Axis // Layer II',
          isConjured: true,
          thematicSeed: theme,
        };
        setDreambloomInterpretations((prev) => [entry, ...prev]);
        addEchoMessage(AgentName.DreambloomOracle, `Conjured ${entry.title}`, 'text-emerald-300');
      } finally {
        setIsDreambloomLoading(false);
      }
    },
    [dreambloomInterpretations.length, invokeAI, addEchoMessage]
  );

  const handleRevealBloomVariants = useCallback(
    async (node: GlyphMutationNode) => {
      setIsGeneratingBloomVariants(true);
      try {
        await invokeAI(
          `Describe 3 visual sigil bloom variants for glyph "${node.label}" (${node.traits.join(', ')}).`,
          'You are the Sigil Bloom Curator.'
        );
        const variants: SigilVariant[] = [
          {
            id: `var-solar-${node.id}`,
            name: `${node.label} // Solar Flare`,
            description: 'High-contrast golden corona emphasizing Negentropy coherence.',
            styleKeywords: ['Luminous', 'Ordered', 'Geometric'],
            visualCue: { icon: 'ri-sun-line', color: 'text-amber-300', backgroundColor: 'bg-amber-950/40', borderColor: 'border-amber-500/60' },
          },
          {
            id: `var-prism-${node.id}`,
            name: `${node.label} // Prismatic Lattice`,
            description: 'Split-spectrum geometric refraction attuned for multi-agent synthesis.',
            styleKeywords: ['Spectral', 'Crystalline', 'Symmetric'],
            visualCue: { icon: 'ri-vip-diamond-line', color: 'text-cyan-300', backgroundColor: 'bg-cyan-950/40', borderColor: 'border-cyan-500/60' },
          },
          {
            id: `var-umbra-${node.id}`,
            name: `${node.label} // Umbral Fold`,
            description: 'Deep obsidian outline containing volatile entropy inside a tight boundary.',
            styleKeywords: ['Abyssal', 'Shielded', 'Recursive'],
            visualCue: { icon: 'ri-contrast-2-line', color: 'text-pink-300', backgroundColor: 'bg-pink-950/40', borderColor: 'border-pink-500/60' },
          },
        ];
        setSigilBloomVariants(variants);
        setSelectedBloomVariantId(variants[0].id);
      } finally {
        setIsGeneratingBloomVariants(false);
      }
    },
    [invokeAI]
  );

  const handleLogDriftEvent = useCallback(
    (driftInterpretation: IDriftInterpretationDB) => {
      addEchoMessage(
        AgentName.SovereignDriftNarrator,
        `Drift Analysis logged: ${driftInterpretation.oracleReading.slice(0, 120)}`,
        'text-lime-300'
      );
    },
    [addEchoMessage]
  );

  const onLaunchModule = (moduleId: string) => {
    setActiveModal(moduleId);
  };

  const closeModal = () => {
    setActiveModal(null);
    if (activeModal === 'seeker_weaver') {
      setEditingProfile(null);
    }
  };

  const handleAdvanceFromBoot = useCallback(() => {
    const hasProfile = allProfiles.length > 0;
    setStage(hasProfile ? 'ACTIVE' : 'ONBOARDING');
  }, [allProfiles]);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    globalSoundEngine.toggleMute(nextMuted);
    setIsMuted(nextMuted);
  };

  const renderActiveModuleModal = () => {
    if (!activeModal) return null;

    const effectiveSystemEntropy = Math.max(0, Math.min(1, currentEntropy));

    switch (activeModal) {
      case 'card_book':
        return (
          <CardBookPanel
            profiles={allProfiles}
            activeProfileId={activeProfileId}
            partyIds={partyIds}
            onSetMain={handleSetMainCharacter}
            onToggleParty={handleTogglePartyMember}
            onManifestNew={() => {
              setStage('ONBOARDING');
              closeModal();
            }}
            onEditProfile={(profile) => {
              setEditingProfile(profile);
              setActiveModal('seeker_weaver');
            }}
            onDeleteProfile={handleDeleteProfile}
            onImportShard={handleImportReality}
            addEchoMessage={addEchoMessage}
          />
        );
      case 'seeker_weaver':
        return (
          <SeekerProfileWeaverPanel
            addEchoMessage={addEchoMessage}
            existingProfile={editingProfile || activeProfile}
            onProfileCreated={(created) => {
              handleProfileManifested(created);
              setEditingProfile(null);
              setActiveModal('card_book');
            }}
            onUpdateProfile={(updated) => {
              handleUpdateProfile(updated);
              setEditingProfile(null);
              setActiveModal('card_book');
            }}
          />
        );
      case 'chat_nvk':
        return <ChatNVKPanel activeProfile={activeProfile} addEchoMessage={addEchoMessage} />;
      case 'prime_genesis':
        return <PrimeGenesisPanel width="100%" height={600} addEchoMessage={addEchoMessage} onArtifactCreated={addArtifact} />;
      case 'rpg_nexus':
        return (
          <RPGNexusPanel
            width="100%"
            height="100%"
            addEchoMessage={addEchoMessage}
            activeProfile={activeProfile}
            allProfiles={allProfiles}
            partyIds={partyIds}
            onUpdateProfile={handleUpdateProfile}
            onSetParty={setPartyIds}
            currentEntropy={effectiveSystemEntropy}
            systemMode={codexModeId}
            onArtifactCreated={addArtifact}
            artifacts={artifacts}
            savedState={rpgState}
            onSaveState={handleSaveRPGState}
            onUpdateSystemMetrics={handleSystemMetricsUpdate}
          />
        );
      case 'protocol_duel':
        return (
          <ProtocolDuelPanel
            width="100%"
            height={580}
            activeProfile={activeProfile}
            onUpdateProfile={handleUpdateProfile}
            addEchoMessage={addEchoMessage}
          />
        );
      case 'flux_farm':
        return (
          <FluxFarmPanel
            width={820}
            height={600}
            activeProfile={activeProfile}
            onUpdateProfile={handleUpdateProfile}
            currentEntropy={effectiveSystemEntropy}
            addEchoMessage={addEchoMessage}
          />
        );
      case 'dreambloom':
        return (
          <DreambloomGenesisPanel
            interpretations={dreambloomInterpretations}
            onConjurePulse={handleConjureDreambloom}
            isAutoActive={isDreambloomAuto}
            onToggleAuto={() => setIsDreambloomAuto((prev) => !prev)}
            isLoading={isDreambloomLoading}
            addEchoMessage={addEchoMessage}
          />
        );
      case 'mutation_loom':
        return (
          <MutationLoomPanel
            glyphMutationNodes={glyphMutationNodes}
            onWeaveGlyphs={handleWeaveGlyphs}
            mutationLoomState={mutationLoomState}
            setMutationLoomState={setMutationLoomState}
            addEchoMessage={addEchoMessage}
            isAIGenerating={isAIGenerating}
          />
        );
      case 'glyph_composer':
        return <GlyphComposerPanel addEchoMessage={addEchoMessage} isBugaModeActive={isBugaModeActive} />;
      case 'emerald_tablet':
        return (
          <EmeraldTabletDecryptionPanel
            currentSystemEntropy={effectiveSystemEntropy}
            currentEleganceIndex={negentropyLevel}
            addEchoMessage={addEchoMessage}
            width="100%"
            height={560}
          />
        );
      case 'celestial_anomaly':
        return <CelestialAnomalyWeaverPanel width="100%" height={560} addEchoMessage={addEchoMessage} />;
      case 'crystal_garden':
        return <CrystalFormationPanel width="100%" height={520} currentEntropy={effectiveSystemEntropy} />;
      case 'geometry_explorer':
        return (
          <FlowerOfLifeEntropyExplorer
            currentEntropy={effectiveSystemEntropy}
            width="100%"
            height={540}
            currentDisplayMode={geometryDisplayMode}
            onSetDisplayMode={setGeometryDisplayMode}
          />
        );
      case 'exotic_mechanisms':
        return <ExoticMechanismsPanel currentEntropy={effectiveSystemEntropy} width="100%" height={520} addEchoMessage={addEchoMessage} />;
      case 'celestial_entropy':
        return <CelestialEntropyCyclePanel currentEntropy={effectiveSystemEntropy} width="100%" height={520} />;
      case 'dimension_diagram':
        return <EntropyDimensionDiagramPanel currentEntropy={effectiveSystemEntropy} width="100%" height={560} isFractalModeEnabled={true} />;
      case 'glyph_vis':
        return (
          <GlyphVisualizationPanel
            panelHeight={560}
            glyphData={{
              title: placedGlyphs[0]?.label || 'Origin Vortex Glyph',
            }}
            pulseDetails={{
              label: placedGlyphs[0]?.label || 'Harmonic Root Pulse',
              glyphId: placedGlyphs[0]?.id || 'G-ORIGIN-01',
              state: isNegentropyStable ? 'Coherent' : 'Turbulent',
              mode: codexModeId,
              signatureFrequency: `${(432 + currentEntropy * 96).toFixed(1)} Hz`,
              shadowArchiveDepth: `${glyphMutationNodes.length} Layers`,
              decryptionTraits: seekerTraits.length ? seekerTraits : ['Calibrated', 'Observant'],
            }}
            visualizationDetails={{
              initialPhase: {
                title: 'Phase I // Harmonic Aperture',
                form: 'Triadic toroidal lattice',
                visual: 'Concentric spectral arcs aligned with Seeker aura',
                animation: 'Slow radial breathing synchronized with entropy',
              },
              sonicProfile: {
                description: '432 Hz sub-carrier modulated by local Negentropy index.',
              },
              finalForm: {
                description: 'Standing-wave resonance stabilized inside the Ritual Loom.',
                sigilPulse: ['Origin', 'Spiral', 'Axiom', 'Anchor'],
              },
            }}
            systemNote={{ message: `Active placed glyphs on canvas: ${placedGlyphs.length}` }}
          />
        );
      case 'web3_nexus':
        return (
          <CryptoNexusPanel
            activeProfile={activeProfile}
            onUpdateProfile={handleUpdateProfile}
            addEchoMessage={addEchoMessage}
          />
        );
      case 'crm_dashboard':
        return <CosmicResonanceDashboardPanel width="100%" height={560} addEchoMessage={addEchoMessage} />;
      case 'temporal_ops':
        return <TemporalOperationsConsolePanel width="100%" height={560} addEchoMessage={addEchoMessage} />;
      case 'drift_differential':
        return (
          <DriftDifferentialOverlay
            currentEntropy={effectiveSystemEntropy}
            glyphDriftHistory={[]}
            glyphMutationNodes={glyphMutationNodes}
            currentRitualContext={`Mode ${codexModeId} // ${placedGlyphs.length} Glyphs`}
            isAIGenerating={isAIGenerating}
            addEchoMessage={addEchoMessage}
            logOracleNarrativeDriftEvent={handleLogDriftEvent}
          />
        );
      case 'harmonic_core':
        return (
          <HarmonicCorePanel
            lambdaValue={1.0}
            status={effectiveSystemEntropy > 0.7 ? 'Critical' : effectiveSystemEntropy > 0.4 ? 'Oscillating' : 'Stabilized'}
            eleganceIndex={negentropyLevel}
          />
        );
      case 'entropy_diagnostics':
        return (
          <EntropyDiagnosticsPanel
            baseEntropy={effectiveSystemEntropy}
            effectiveEntropy={effectiveSystemEntropy}
            masterEntropyOverridePercent={0}
            entropyHistory={entropyHistory}
            playbackTime={Math.floor(Date.now() / 1000) % 3600}
            isPlaying={!isAutoEchoPaused}
          />
        );
      case 'peptide_sim':
        return <PeptideSimulationPanel addEchoMessage={addEchoMessage} width={780} height={540} />;
      case 'codex_pandium':
        return <CodexPandiumPanel width={780} height={560} />;
      case 'datachega':
        return <DatachegaResthetPanel addEchoMessage={addEchoMessage} />;
      case 'aethel_update':
        return <AethelWeftCodexUpdatePanel panelHeight={560} />;
      case 'chronicle_display':
        return <ChronicleReliquaryPanel width="100%" height={560} artifacts={artifacts} addEchoMessage={addEchoMessage} />;
      case 'phoenix_tablet':
        return <TabletOfThePhoenixPanel panelHeight={560} />;
      case 'shatterpoint_trace':
        return (
          <ShatterpointTracePanel
            objective="Isolate causal drift vectors across active Ritual Loom connections"
            triggerGlyph={placedGlyphs[0]?.label || 'Seed of Whispers'}
            axiomaticLinks={ALL_CANONICAL_AXIOMS.slice(0, 3).map((a) => a.title)}
            traceParameters={{
              entropyThreshold: currentEntropy.toFixed(3),
              negentropyAnchor: negentropyLevel.toFixed(3),
              connectedNodes: connections.length,
            }}
            oracleCommentary="Trace boundaries remain coherent. Adjust Ω-Anchor whenever entropy rises above 0.600δ."
          />
        );
      case 'buga_codex':
        return <BugaGlyphCodexPanel width={780} height={560} />;
      case 'flora_chamber':
        return <BloodInkFloraChamber activeSpeciesName={activeFloraSpecies} allSpeciesData={BLOOD_INK_SPECIES_DATA} />;
      case 'sigil_bloom':
        return (
          <SigilBloomVariantPanel
            glyphMutationNodes={glyphMutationNodes}
            onRevealBloomVariants={handleRevealBloomVariants}
            sigilBloomVariants={sigilBloomVariants}
            selectedBloomVariantId={selectedBloomVariantId}
            onSelectBloomVariant={setSelectedBloomVariantId}
            isGeneratingBloomVariants={isGeneratingBloomVariants}
            isAIBusy={isAIGenerating}
          />
        );
      case 'agent_directory':
        return (
          <div className="w-full space-y-6">
            <AgentSimulationPanel
              currentEntropy={effectiveSystemEntropy}
              negentropyLevel={negentropyLevel}
              addEchoMessage={addEchoMessage}
              onCommunicate={(agent) => {
                setInspectedAgent(agent);
                setCommunicatingAgent(agent);
                setActiveModal('agent_chat');
              }}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setInspectedAgent(agent)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    inspectedAgent?.id === agent.id
                      ? 'border-indigo-400 bg-indigo-950/60 text-white'
                      : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="font-bold">{agent.name}</div>
                  <div className="text-[10px] text-slate-400">{agent.archetype || agent.faction}</div>
                </button>
              ))}
            </div>
            <AgentInspectorPanel
              agent={inspectedAgent || agents[0] || null}
              onClose={() => setInspectedAgent(null)}
              onCommunicate={(agent) => {
                setCommunicatingAgent(agent);
                setActiveModal('agent_chat');
              }}
            />
          </div>
        );
      case 'agent_chat':
        return communicatingAgent ? (
          <AgentChatPanel agent={communicatingAgent} onClose={closeModal} />
        ) : (
          <div className="text-slate-400 text-sm p-6">No agent selected for Comm-Link.</div>
        );
      default:
        return (
          <div className="p-8 text-center text-slate-400 font-mono text-sm">
            Module "{activeModal}" is not registered in this sector.
          </div>
        );
    }
  };

  const renderAppContent = () => {
    if (stage === 'NEXUS') {
      return (
        <NVKNexusLanding
          onEnterEcosystem={handleAdvanceFromBoot}
          onOpenAISettings={() => setIsAISettingsModalOpen(true)}
          hasExistingProfile={allProfiles.length > 0}
        />
      );
    }
    if (stage === 'BOOT') return <BootSequence onComplete={handleAdvanceFromBoot} />;
    if (stage === 'ONBOARDING') {
      return (
        <OnboardingFunnel
          onComplete={handleProfileManifested}
          addEchoMessage={addEchoMessage}
          onImportRequested={handleImportReality}
        />
      );
    }

    const effectiveSystemEntropy = Math.max(0, Math.min(1, currentEntropy));
    const dominantAgentTone =
      echoLog.length > 0 && Object.values(AgentName).includes(echoLog[0].source as AgentName)
        ? (echoLog[0].source as AgentName)
        : null;

    return (
      <SystemStateProvider
        value={{
          entropy: effectiveSystemEntropy,
          activeTraits: seekerTraits,
          playbackStatus: 'playing',
          activeGlyph: null,
          negentropyLevel,
          isNegentropyStable,
        }}
      >
        <div className="app-container min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col overflow-x-hidden relative">
          <ParallaxParticles scrollY={appScrollTop} />
          <ScrollIndicator isVisible={appScrollTop < 50} />
          <MagicalMouseTrail />
          <Header
            currentEntropy={effectiveSystemEntropy}
            negentropy={negentropyLevel}
            lambda={1.0}
            onProvokeThornedRose={() => {
              handleSystemMetricsUpdate(0.04, -0.02);
              addEchoMessage('System', 'Thorned Rose provoked (+0.040δ entropy).', 'text-rose-400');
            }}
            onTuneFrequency={() => {
              handleSystemMetricsUpdate(-0.04, 0.04);
              addEchoMessage('System', 'Harmonic Frequency tuned (-0.040δ entropy).', 'text-sky-300');
            }}
            onRecallAncestor={() =>
              addEchoMessage('Chronicle', `Recalled lineage echo for ${activeProfile?.name || 'Seeker'}.`, 'text-amber-300')
            }
            onBurnPetals={() => {
              handleSystemMetricsUpdate(0.06, -0.01);
              addEchoMessage('BloodInk', 'Ashen petals consumed inside the kiln.', 'text-orange-400');
            }}
            onAwakenLotusDream={() => onLaunchModule('dreambloom')}
            onPulseAstralJasmine={() => {
              handleSystemMetricsUpdate(-0.03, 0.05);
              addEchoMessage('BloodInk', 'Astral Jasmine pulsed cleanly.', 'text-emerald-300');
            }}
            onGraftThorns={() => onLaunchModule('mutation_loom')}
            onToggleAutoEcho={() => setIsAutoEchoPaused((prev) => !prev)}
            onAmplifyVoices={() =>
              addEchoMessage('EchoMatrix', `Semantic resonance amplified (${echoLog.length} logged echoes).`, 'text-indigo-300')
            }
            onSeedDream={() => {
              handleConjureDreambloom();
              onLaunchModule('dreambloom');
            }}
            isAutoEchoPaused={isAutoEchoPaused}
            onInvokeOracleSanctum={() => setIsOracleSanctumOpen(true)}
            onContextualOracleQuery={() => setIsOracleSanctumOpen(true)}
            onToggleAshfall={() => setShowAshfall((prev) => !prev)}
            showAshfall={showAshfall}
            showLogicWebDebug={showLogicWebDebug}
            onToggleLogicWebDebug={() => setShowLogicWebDebug((prev) => !prev)}
            isAuditing={isAuditing}
            onToggleAuditMode={() => setIsAuditing((prev) => !prev)}
            isAuditModeLocked={false}
            currentCodexModeId={codexModeId}
            activateCodexMode={setCodexModeId}
            onDumpThreadSummary={() =>
              addEchoMessage(
                'ThreadSummary',
                `Active Seekers: ${allProfiles.length} | Party: ${partyIds.length} | Glyphs: ${placedGlyphs.length} | Entropy: ${effectiveSystemEntropy.toFixed(3)}δ`,
                'text-cyan-300'
              )
            }
            showSigilOverlay={showSigilOverlay}
            onToggleSigilOverlay={() => setShowSigilOverlay((prev) => !prev)}
            onTraceThreadcoil={() => onLaunchModule('shatterpoint_trace')}
            onReEnterJunction={() => onLaunchModule('temporal_ops')}
            onExtractSigil={() => onLaunchModule('sigil_bloom')}
            selectedModelId={selectedModelId}
            onSetModelId={setSelectedModelId}
            availableModels={availableModels}
            onOpenAISettingsModal={() => setIsAISettingsModalOpen(true)}
            isBugaModeActive={isBugaModeActive}
            onToggleBugaMode={() => setIsBugaModeActive((prev) => !prev)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onLaunchNexus={() => onLaunchModule('rpg_nexus')}
            onReturnToNexus={() => setStage('NEXUS')}
            onExportSave={handleExportSave}
            onImportSave={handleImportReality}
            onOpenSaveLoadModal={() => setIsSaveLoadModalOpen(true)}
            saveStatus={saveStatus}
            lastSavedTime={lastSavedTime}
            isNarrationEnabled={isNarrationEnabled}
            onToggleNarration={toggleNarration}
          />

          <main
            onScroll={(e) => setAppScrollTop(e.currentTarget.scrollTop)}
            className="flex-grow p-4 overflow-y-auto custom-scrollbar relative z-10 flex flex-col lg:grid lg:grid-cols-12 gap-6"
          >
            <aside className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
              <SeekerAuraDisplay
                seekerTraits={seekerTraits}
                currentEntropy={effectiveSystemEntropy}
                dominantAgentTone={dominantAgentTone}
                lastRitualOutcome={lastRitualOutcome}
                width="100%"
                height={320}
                activeAuraColor={activeProfile?.auraColor as SeekerAuraColor}
                activeSecondaryAuraColor={activeProfile?.auraSecondaryColor as SeekerAuraColor}
              />
              {viewMode === 'rpg' && <SeekerVitalsPanel activeProfile={activeProfile} rpgState={rpgState} />}
              <CommunityResonancePanel addEchoMessage={addEchoMessage} seekerFaction={activeProfile?.faction} />
              {viewMode === 'rpg' && (
                <ProtocolDuelPanel
                  width="100%"
                  height={500}
                  activeProfile={activeProfile}
                  onUpdateProfile={handleUpdateProfile}
                  addEchoMessage={addEchoMessage}
                />
              )}
            </aside>

            <section className="lg:col-span-6 flex flex-col gap-8 order-1 lg:order-2">
              <div className="flex gap-4 p-1.5 bg-slate-900/50 rounded-xl border border-white/10 w-fit mx-auto shadow-inner">
                <button
                  onClick={() => setViewMode('assistant')}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                    viewMode === 'assistant'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className="ri-robot-2-line"></i>Assistant Nexus
                </button>
                <button
                  onClick={() => setViewMode('rpg')}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                    viewMode === 'rpg'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className="ri-gamepad-line"></i>RPG Simulation
                </button>
              </div>

              {viewMode === 'assistant' ? (
                <>
                  <AssistantDashboardPanel addEchoMessage={addEchoMessage} />
                  {activeProfile && (
                    <SeekerProfileDashboardPanel
                      profile={activeProfile}
                      onReset={handleResetProfile}
                      addEchoMessage={addEchoMessage}
                      onOpenCardBook={() => onLaunchModule('card_book')}
                    />
                  )}
                </>
              ) : (
                <>
                  {activeProfile && (
                    <SeekerProfileDashboardPanel
                      profile={activeProfile}
                      onReset={handleResetProfile}
                      addEchoMessage={addEchoMessage}
                      onOpenCardBook={() => onLaunchModule('card_book')}
                    />
                  )}
                  <RPGNexusPanel
                    width="100%"
                    height={600}
                    addEchoMessage={addEchoMessage}
                    activeProfile={activeProfile}
                    allProfiles={allProfiles}
                    partyIds={partyIds}
                    onUpdateProfile={handleUpdateProfile}
                    onSetParty={setPartyIds}
                    currentEntropy={effectiveSystemEntropy}
                    systemMode={codexModeId}
                    onArtifactCreated={addArtifact}
                    artifacts={artifacts}
                    savedState={rpgState}
                    onSaveState={handleSaveRPGState}
                    onUpdateSystemMetrics={handleSystemMetricsUpdate}
                  />
                  <AgentSimulationPanel
                    currentEntropy={effectiveSystemEntropy}
                    negentropyLevel={negentropyLevel}
                    addEchoMessage={addEchoMessage}
                    onCommunicate={(agent) => {
                      setCommunicatingAgent(agent);
                      setActiveModal('agent_chat');
                    }}
                  />
                  <PrimeGenesisPanel width="100%" height={600} addEchoMessage={addEchoMessage} onArtifactCreated={addArtifact} />
                  <CodexDreamPanel
                    currentEntropy={effectiveSystemEntropy}
                    currentAxioms={ALL_CANONICAL_AXIOMS}
                    lambdaValue={1.0}
                    negentropyLevel={negentropyLevel}
                    echoLog={echoLog}
                    addEchoMessage={addEchoMessage}
                    width={600}
                    height={600}
                    currentPhase="Synthesis"
                    chaliceStatus="Stable"
                    onArtifactCreated={addArtifact}
                  />
                  <RitualCanvasContainer
                    addEchoMessage={addEchoMessage}
                    placedGlyphs={placedGlyphs}
                    setPlacedGlyphs={setPlacedGlyphs}
                    connections={connections}
                    setConnections={setConnections}
                    onRitualActivated={handleRitualActivated}
                    availableAxiomElements={AXIOM_RITUAL_ELEMENTS}
                    invokeAI={invokeAI}
                    isAIGenerating={isAIGenerating}
                    onAnalyzeForRewrite={handleAnalyzeForRewrite}
                  />
                </>
              )}
            </section>

            <aside className="lg:col-span-3 flex flex-col gap-6 order-3">
              <EntropicHeartPanel currentEntropy={effectiveSystemEntropy} />
              <LIFEPanel currentEntropy={effectiveSystemEntropy} addEchoMessage={addEchoMessage} />
              <div className="p-4 bg-slate-900/80 border border-slate-700/50 rounded-xl">
                <h4 className="font-cinzel text-indigo-300 mb-4">System Directory</h4>
                <SystemModulesPanel onLaunchModule={onLaunchModule} />
              </div>
              <CelestialEntropyCyclePanel currentEntropy={effectiveSystemEntropy} width="100%" height={320} />
              {viewMode === 'rpg' && (
                <>
                  <ExoticMechanismsPanel currentEntropy={effectiveSystemEntropy} width="100%" height={400} addEchoMessage={addEchoMessage} />
                  <EntropyDimensionDiagramPanel currentEntropy={effectiveSystemEntropy} width="100%" height={500} isFractalModeEnabled={true} />
                  <CrystalFormationPanel width="100%" height={400} currentEntropy={effectiveSystemEntropy} />
                </>
              )}
              <EchoScribePanel echoes={echoLog} />
            </aside>
          </main>

          <CodexFooterBar
            phase="Synthesis"
            mode={codexModeId}
            status={isAIGenerating ? 'AI Synthesizer Active' : 'System Active'}
            currentEntropy={effectiveSystemEntropy}
            currentCodexModeId={codexModeId}
            onApplyOmegaAnchor={() => setCurrentEntropy((e) => Math.max(0, e - 0.1))}
            onRestoreSession={async () => {
              const restored = await hydrateState();
              if (restored) {
                applySnapshot(restored);
                notify('Session restored from local IndexedDB codex.', 'success');
              } else {
                notify('No saved snapshot found to restore.', 'warning');
              }
            }}
          />
          <Footer />

          <SaveLoadModal
            isOpen={isSaveLoadModalOpen}
            onClose={() => setIsSaveLoadModalOpen(false)}
            onSave={saveGame}
            onLoad={async (id) => {
              const h = await loadGame(id);
              if (h) applySnapshot(h);
            }}
            fetchSlots={getSaveSlots}
          />

          <PanelModal
            isOpen={Boolean(activeModal)}
            onClose={closeModal}
            title={
              activeModal === 'agent_chat'
                ? `Comm-Link: ${communicatingAgent?.name || 'Agent'}`
                : activeModal === 'seeker_weaver' && editingProfile
                ? `Weaving Seeker: ${editingProfile.name}`
                : (activeModal && MODAL_TITLES[activeModal]) || 'NVK System Module'
            }
            width={activeModal === 'rpg_nexus' ? '100vw' : activeModal === 'agent_chat' ? '640px' : '95vw'}
            height={activeModal === 'rpg_nexus' ? '100vh' : activeModal === 'agent_chat' ? '620px' : '88vh'}
          >
            <ErrorBoundary fallbackTitle="Module Execution Fault" onReset={closeModal}>
              {renderActiveModuleModal()}
            </ErrorBoundary>
          </PanelModal>

          <OracleSanctumModal
            isOpen={isOracleSanctumOpen}
            onClose={() => setIsOracleSanctumOpen(false)}
            currentEntropy={effectiveSystemEntropy}
            currentMode={codexModeId}
            placedGlyphs={placedGlyphs}
            addEchoMessage={addEchoMessage}
          />

          <RitualAlchemyResultsModal
            isOpen={isAlchemyModalOpen}
            onClose={() => setIsAlchemyModalOpen(false)}
            results={lastRitualOutcome?.alchemyResult || null}
          />

          <RitualRewriteSuggestionsModal
            isOpen={isRewriteModalOpen}
            onClose={() => setIsRewriteModalOpen(false)}
            suggestions={rewriteSuggestions}
            isLoading={isRewriteLoading}
            onApplySuggestion={(suggestion) => {
              addEchoMessage(AgentName.RitualEngine, `Accepted Rewrite Counsel: ${suggestion.slice(0, 140)}`, 'text-sky-300');
              notify('Rewrite suggestion inscribed in Echo Log.', 'success');
              setIsRewriteModalOpen(false);
            }}
          />

          <AISettingsModal isOpen={isAISettingsModalOpen} onClose={() => setIsAISettingsModalOpen(false)} />
        </div>
      </SystemStateProvider>
    );
  };

  return (
    <ErrorBoundary fallbackTitle="NVK Codex Runtime Error">
      <Web3Provider addEchoMessage={addEchoMessage}>{renderAppContent()}</Web3Provider>
    </ErrorBoundary>
  );
};

export default App;
