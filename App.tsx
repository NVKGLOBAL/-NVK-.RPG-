
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import PanelModal from './components/modals/PanelModal';
import SaveLoadModal from './components/modals/SaveLoadModal'; 
import { AISettingsModal } from './components/modals/AISettingsModal'; 
import SystemModulesPanel from './components/panels/SystemModulesPanel';
import RPGNexusPanel from './components/panels/RPGNexusPanel';
import RPGMementoArchivePanel from './components/panels/RPGMementoArchivePanel';
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
import CardBookPanel from './components/panels/CardBookPanel'; 
import CommunityResonancePanel from './components/panels/CommunityResonancePanel';
import LIFEPanel from './components/panels/LIFEPanel';
import CodexDreamPanel from './components/panels/CodexDreamPanel';
import PrimeGenesisPanel from './components/panels/PrimeGenesisPanel'; 
import SeekerVitalsPanel from './components/panels/SeekerVitalsPanel'; 
import AssistantDashboardPanel from './components/panels/AssistantDashboardPanel';
import { RitualCanvasContainer } from './components/RitualCanvasContainer';
import CodexAxiomViewer from './components/CodexAxiomViewer';
import AxiomResonanceViewerPanel from './components/AxiomResonanceViewerPanel'; 
import EntropicHeartPanel from './components/panels/EntropicHeartPanel'; 
import { EchoScribePanel } from './components/EchoScribePanel';
import { BootSequence } from './components/core/BootSequence';
import OnboardingFunnel from './components/core/OnboardingFunnel';
import CodexFooterBar from './components/core/CodexFooterBar';
import SeekerAuraDisplay from './components/panels/SeekerAuraDisplay'; 
import { ChatNVKPanel } from './components/panels/ChatNVKPanel';
import { CryptoNexusPanel } from './components/panels/CryptoNexusPanel';
import { useGemini } from './context/GeminiIntegrationContext';
import { useNarration } from './context/NarrationContext';
import { SystemStateProvider } from './context/SystemContext';
import { useCodexPersistence } from './hooks/useCodexPersistence';
import { generateInitialAgents } from './lib/simulationUtils';
import { globalSoundEngine } from './lib/SoundEngine'; 
import MagicalMouseTrail from './components/visuals/MagicalMouseTrail'; 
import { ParallaxParticles } from './components/visuals/ParallaxParticles';
import { ScrollIndicator } from './components/ui/ScrollIndicator';
import { Web3Provider } from './context/Web3Context';

import { 
  CodexModeId, AgentName, SeekerProfile, CodexArtifact, EchoMessage, AgentNode, 
  HistoricalEventType, GeoMode, VisualizationMatrixMode, MutationLoomState, 
  RitualOutcome, RitualAlchemyResult, PlacedGlyph, CanvasConnection,
  GlyphMutationNode, RewovenGlyph, HistoricalEvent, Axiom, RPGGameState,
  SeekerAuraColor
} from './types';
import { AXIOM_DATA, ALL_CANONICAL_AXIOMS, AXIOM_RITUAL_ELEMENTS } from './constants';

type AppStage = 'BOOT' | 'ONBOARDING' | 'ACTIVE';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'assistant' | 'rpg'>('assistant');
  const [stage, setStage] = useState<AppStage>('BOOT');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isSaveLoadModalOpen, setIsSaveLoadModalOpen] = useState(false);
  const [isAISettingsModalOpen, setIsAISettingsModalOpen] = useState(false);
  const [communicatingAgent, setCommunicatingAgent] = useState<AgentNode | null>(null);
  const [currentEntropy, setCurrentEntropy] = useState<number>(0.1);
  const [codexModeId, setCodexModeId] = useState<CodexModeId>(CodexModeId.ORIGIN_STATE);
  const [echoLog, setEchoLog] = useState<EchoMessage[]>([]);
  const [artifacts, setArtifacts] = useState<CodexArtifact[]>([]);
  const [agents, setAgents] = useState<AgentNode[]>(generateInitialAgents());
  
  const [allProfiles, setAllProfiles] = useState<SeekerProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [partyIds, setPartyIds] = useState<string[]>([]);
  const [negentropyLevel, setNegentropyLevel] = useState(0.5);
  const [isNegentropyStable, setIsNegentropyStable] = useState(true);
  const [appScrollTop, setAppScrollTop] = useState(0);

  const activeProfile = useMemo(() => 
    allProfiles.find(p => p.id === activeProfileId) || null, 
    [allProfiles, activeProfileId]
  );

  const seekerTraits = useMemo(() => 
    activeProfile?.selfTraits || [], 
    [activeProfile]
  );

  const [rpgState, setRpgState] = useState<RPGGameState | undefined>(undefined); 
  const [placedGlyphs, setPlacedGlyphs] = useState<PlacedGlyph[]>([]);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  const [lastRitualOutcome, setLastRitualOutcome] = useState<RitualOutcome | null>(null); 
  const [mutationLoomState, setMutationLoomState] = useState<MutationLoomState>({
    glyph1Id: null, glyph2Id: null, isWeaving: false, entropyInjection: 0.1, traitFocus: []
  });

  const { 
    invokeGemini, 
    isGenerating: isGeminiGenerating,
    selectedModelId,
    setSelectedModelId,
    availableModels
  } = useGemini();
  const { speak, isNarrationEnabled, toggleNarration } = useNarration();
  
  const stateSnapshot = useMemo(() => ({
    echoLog, 
    systemEntropy: currentEntropy, 
    ritualState: { currentPhase: 'Active', chaliceStatus: 'Flowing', placedGlyphs, connections }, 
    artifacts, 
    activeProfile,
    allProfiles,
    partyIds,
    rpgState
  }), [echoLog, currentEntropy, placedGlyphs, connections, artifacts, activeProfile, allProfiles, partyIds, rpgState]);

  const { saveGame, loadGame, deleteSave, getSaveSlots, hydrateState, isHydrating, saveStatus, lastSavedTime, exportSave, importSave } = useCodexPersistence(['EchoLog', 'SystemEntropy', 'RitualState', 'Artifacts', 'ActiveProfile', 'AllProfiles', 'PartyIds', 'RPGState'], stateSnapshot);

  useEffect(() => {
    hydrateState().then((hydrated) => {
        if (hydrated) {
            if (hydrated.echoLog) setEchoLog(hydrated.echoLog);
            if (hydrated.systemEntropy !== undefined) setCurrentEntropy(hydrated.systemEntropy);
            if (hydrated.ritualState) {
                setPlacedGlyphs(hydrated.ritualState.placedGlyphs || []);
                setConnections(hydrated.ritualState.connections || []);
            }
            if (hydrated.artifacts) setArtifacts(hydrated.artifacts);
            if (hydrated.allProfiles) setAllProfiles(hydrated.allProfiles);
            if (hydrated.partyIds) setPartyIds(hydrated.partyIds);
            if (hydrated.activeProfile && hydrated.activeProfile.id) {
                setActiveProfileId(hydrated.activeProfile.id);
            } else if (hydrated.allProfiles?.length > 0) {
                setActiveProfileId(hydrated.allProfiles[0].id);
            }
            if (hydrated.rpgState) setRpgState(hydrated.rpgState);
        }
    });
  }, [hydrateState]); 

  const handleUpdateProfile = useCallback((profile: SeekerProfile) => {
    setAllProfiles(prev => {
        const existing = prev.find(p => p.id === profile.id);
        if (existing) {
            return prev.map(p => p.id === profile.id ? profile : p);
        }
        return [...prev, profile];
    });
    if (!activeProfileId) setActiveProfileId(profile.id);
  }, [activeProfileId]);

  const handleProfileManifested = useCallback((profile: SeekerProfile) => {
      setAllProfiles(prev => [...prev, profile]);
      setActiveProfileId(profile.id);
      setStage('ACTIVE');
      addEchoMessage(AgentName.System, `Seeker Shard manifested: ${profile.name}`, "text-emerald-400");
  }, []);

  const handleSetMainCharacter = (id: string) => {
      setActiveProfileId(id);
      const profile = allProfiles.find(p => p.id === id);
      addEchoMessage(AgentName.System, `Primary Signal swapped to ${profile?.name}.`, "text-cyan-300");
      globalSoundEngine.playSFX('pulse');
  };

  const handleTogglePartyMember = (id: string) => {
      setPartyIds(prev => {
          if (prev.includes(id)) return prev.filter(pid => pid !== id);
          if (prev.length >= 3) {
              addEchoMessage(AgentName.System, "Party Resonance limit reached (3 members).", "text-yellow-400");
              return prev;
          }
          return [...prev, id];
      });
      globalSoundEngine.playUIFeedback('click');
  };

  const addEchoMessage = useCallback((source: string, text: string, colorClass: string = 'text-slate-300', isAutoEcho: boolean = false, meta?: any) => {
    const newMessage: EchoMessage = {
      id: `echo-${Date.now()}-${Math.random()}`,
      source, text, colorClass, isAutoEcho, meta,
      timestamp: new Date().toISOString()
    };
    setEchoLog(prev => [newMessage, ...prev].slice(0, 100)); 
    if (isNarrationEnabled) speak(`${source} says: ${text}`);
  }, [isNarrationEnabled, speak]);

  const addArtifact = useCallback((artifact: CodexArtifact) => {
    setArtifacts(prev => [artifact, ...prev]);
    addEchoMessage(AgentName.ChronicleReliquaryAgent, `Artifact Acquired: ${artifact.name}`, 'text-amber-300');
  }, [addEchoMessage]);

  const handleResetProfile = async () => {
    if(confirm("Sever this identity? You will return to the Synthesis Loom.")) {
        setAllProfiles(prev => prev.filter(p => p.id !== activeProfileId));
        setPartyIds(prev => prev.filter(p => p !== activeProfileId));
        
        if (allProfiles.length <= 1) {
            setActiveProfileId(null);
            setStage('ONBOARDING');
        } else {
            setActiveProfileId(allProfiles.find(p => p.id !== activeProfileId)?.id || null);
        }
        addEchoMessage(AgentName.System, "Identity Shard Severed.", "text-rose-400");
    }
  }

  const handleSaveRPGState = useCallback((state: RPGGameState) => { setRpgState(state); }, []);
  const handleSystemMetricsUpdate = useCallback((entropyDelta: number, negentropyDelta: number) => {
    setCurrentEntropy(prev => Math.min(1, Math.max(0, prev + entropyDelta)));
    setNegentropyLevel(prev => Math.min(1, Math.max(0, prev + negentropyDelta)));
  }, []);

  const handleRitualActivated = (success: boolean, details: string, type?: string, alchemyResult?: RitualAlchemyResult) => {
    addEchoMessage(AgentName.RitualEngine, success ? `Ritual Successful: ${details}` : `Ritual Fizzled: ${details}`, success ? 'text-emerald-400' : 'text-rose-400');
    setLastRitualOutcome({ success, details, type, alchemyResult });
    if (success) {
      setCurrentEntropy(prev => Math.max(0, prev - 0.05));
      setNegentropyLevel(prev => Math.min(1, prev + 0.05));
    }
  };

  const onLaunchModule = (moduleId: string) => { setActiveModal(moduleId); };
  const closeModal = () => { setActiveModal(null); };

  const handleAdvanceFromBoot = useCallback(() => {
    const hasProfile = allProfiles.length > 0;
    setStage(hasProfile ? 'ACTIVE' : 'ONBOARDING');
  }, [allProfiles]);

  const renderAppContent = () => {
    if (stage === 'BOOT') return <BootSequence onComplete={handleAdvanceFromBoot} />;
    if (stage === 'ONBOARDING') return <OnboardingFunnel onComplete={handleProfileManifested} addEchoMessage={addEchoMessage} />;

    const effectiveSystemEntropy = Math.max(0, Math.min(1, currentEntropy));
    const dominantAgentTone = echoLog.length > 0 && Object.values(AgentName).includes(echoLog[0].source as AgentName) ? echoLog[0].source as AgentName : null;

    return (
      <SystemStateProvider value={{ entropy: effectiveSystemEntropy, activeTraits: seekerTraits, playbackStatus: 'playing', activeGlyph: null, negentropyLevel, isNegentropyStable }}>
        <div className="app-container min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col overflow-x-hidden relative">
          <ParallaxParticles scrollY={appScrollTop} />
          <ScrollIndicator isVisible={appScrollTop < 50} />
          <MagicalMouseTrail /> 
          <Header 
            currentEntropy={effectiveSystemEntropy} negentropy={negentropyLevel} lambda={1.0} 
            onProvokeThornedRose={() => addEchoMessage('System', 'Rose Provoked', 'text-rose-400')}
            onTuneFrequency={() => addEchoMessage('System', 'Frequency Tuned', 'text-sky-300')}
            onRecallAncestor={() => {}} onBurnPetals={() => {}} onAwakenLotusDream={() => {}} onPulseAstralJasmine={() => {}} onGraftThorns={() => {}}
            onToggleAutoEcho={() => {}} onAmplifyVoices={() => {}} onSeedDream={() => {}} isAutoEchoPaused={false}
            onInvokeGeminiOracle={() => {}} onContextualOracleQuery={() => {}}
            onToggleAshfall={() => {}} showAshfall={false} showLogicWebDebug={false} onToggleLogicWebDebug={() => {}}
            isAuditing={false} onToggleAuditMode={() => {}} isAuditModeLocked={false}
            currentCodexModeId={codexModeId} activateCodexMode={setCodexModeId}
            onDumpThreadSummary={() => {}} showSigilOverlay={false} onToggleSigilOverlay={() => {}}
            onTraceThreadcoil={() => {}} onReEnterJunction={() => {}} onExtractSigil={() => {}}
            selectedModelId={selectedModelId}
            onSetModelId={setSelectedModelId}
            availableModels={availableModels}
            onOpenAISettingsModal={() => setIsAISettingsModalOpen(true)}
            isBugaModeActive={false} onToggleBugaMode={() => {}}
            isMuted={false} onToggleMute={() => globalSoundEngine.toggleMute(true)}
            onLaunchNexus={() => onLaunchModule('rpg_nexus')}
            onExportSave={exportSave} onImportSave={importSave}
            onOpenSaveLoadModal={() => setIsSaveLoadModalOpen(true)} 
            saveStatus={saveStatus} lastSavedTime={lastSavedTime} 
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
                  width="100%" height={320}
                  activeAuraColor={activeProfile?.auraColor as SeekerAuraColor}
                  activeSecondaryAuraColor={activeProfile?.auraSecondaryColor as SeekerAuraColor}
                />
                {viewMode === 'rpg' && <SeekerVitalsPanel activeProfile={activeProfile} rpgState={rpgState} />}
                <CommunityResonancePanel addEchoMessage={addEchoMessage} seekerFaction={activeProfile?.faction} />
                {viewMode === 'rpg' && <ProtocolDuelPanel width="100%" height={500} activeProfile={activeProfile} onUpdateProfile={handleUpdateProfile} addEchoMessage={addEchoMessage} />}
            </aside>

            <section className="lg:col-span-6 flex flex-col gap-8 order-1 lg:order-2">
              <div className="flex gap-4 p-1.5 bg-slate-900/50 rounded-xl border border-white/10 w-fit mx-auto shadow-inner">
                 <button onClick={() => setViewMode('assistant')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${viewMode === 'assistant' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <i className="ri-robot-2-line"></i>Assistant Nexus
                 </button>
                 <button onClick={() => setViewMode('rpg')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${viewMode === 'rpg' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
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
                    width="100%" height={600} 
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
                  <CodexDreamPanel currentEntropy={effectiveSystemEntropy} currentAxioms={ALL_CANONICAL_AXIOMS} lambdaValue={1.0} negentropyLevel={negentropyLevel} echoLog={echoLog} addEchoMessage={addEchoMessage} width={600} height={600} currentPhase="Synthesis" chaliceStatus="Stable" onArtifactCreated={addArtifact} />
                  <RitualCanvasContainer addEchoMessage={addEchoMessage} placedGlyphs={placedGlyphs} setPlacedGlyphs={setPlacedGlyphs} connections={connections} setConnections={setConnections} onRitualActivated={handleRitualActivated} availableAxiomElements={AXIOM_RITUAL_ELEMENTS} invokeGemini={invokeGemini} isGeminiGenerating={isGeminiGenerating} onAnalyzeForRewrite={() => {}} />
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

          <CodexFooterBar phase="Synthesis" mode={codexModeId} status="System Active" currentEntropy={effectiveSystemEntropy} currentCodexModeId={codexModeId} onApplyOmegaAnchor={() => setCurrentEntropy(e => Math.max(0, e - 0.1))} />
          <Footer />

          <SaveLoadModal isOpen={isSaveLoadModalOpen} onClose={() => setIsSaveLoadModalOpen(false)} onSave={saveGame} onLoad={(id) => loadGame(id).then(h => h && window.location.reload())} fetchSlots={getSaveSlots} />
          
          <PanelModal isOpen={activeModal === 'card_book'} onClose={closeModal} title="The Card Book: Seeker Archives" width="95vw">
            <CardBookPanel 
                profiles={allProfiles} 
                activeProfileId={activeProfileId} 
                partyIds={partyIds}
                onSetMain={handleSetMainCharacter}
                onToggleParty={handleTogglePartyMember}
                onManifestNew={() => { setStage('ONBOARDING'); closeModal(); }}
                addEchoMessage={addEchoMessage}
            />
          </PanelModal>

          <PanelModal isOpen={activeModal === 'chat_nvk'} onClose={closeModal} title="ChatNVK // Sovereign Architect" width="95vw" height="90vh">
            <ChatNVKPanel 
                activeProfile={activeProfile}
                addEchoMessage={addEchoMessage}
            />
          </PanelModal>

          <PanelModal isOpen={activeModal === 'rpg_nexus'} onClose={closeModal} title="RPGNexus Hub" width="100vw" height="100vh">
             <RPGNexusPanel width="100%" height="100%" addEchoMessage={addEchoMessage} activeProfile={activeProfile} allProfiles={allProfiles} partyIds={partyIds} onUpdateProfile={handleUpdateProfile} onSetParty={setPartyIds} currentEntropy={effectiveSystemEntropy} systemMode={codexModeId} onArtifactCreated={addArtifact} artifacts={artifacts} savedState={rpgState} onSaveState={handleSaveRPGState} onUpdateSystemMetrics={handleSystemMetricsUpdate} />
          </PanelModal>

          <PanelModal isOpen={activeModal === 'agent_chat'} onClose={closeModal} title={`Comm-Link: ${communicatingAgent?.name || 'Unknown'}`} width="600px" height="600px">
            {communicatingAgent && (
              <AgentChatPanel agent={communicatingAgent} onClose={closeModal} />
            )}
          </PanelModal>

          <PanelModal isOpen={activeModal === 'web3_nexus'} onClose={closeModal} title="Decentralized Seeker Portal" width="95vw" height="90vh">
            <CryptoNexusPanel 
              activeProfile={activeProfile}
              onUpdateProfile={handleUpdateProfile}
              addEchoMessage={addEchoMessage}
            />
          </PanelModal>

          <AISettingsModal 
            isOpen={isAISettingsModalOpen} 
            onClose={() => setIsAISettingsModalOpen(false)} 
          />
        </div>
      </SystemStateProvider>
    );
  };

  return (
    <Web3Provider addEchoMessage={addEchoMessage}>
      {renderAppContent()}
    </Web3Provider>
  );
};

export default App;
