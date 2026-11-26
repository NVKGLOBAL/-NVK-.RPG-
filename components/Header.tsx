
import React, { useState, useRef } from 'react';
import { CodexModeId } from '../types'; 
import { useWeb3 } from '../context/Web3Context';

interface HeaderProps {
  currentEntropy: number;
  negentropy: number;
  lambda: number;
  // Blood-Ink Codex Rituals
  onProvokeThornedRose: () => void;
  onTuneFrequency: () => void;
  onRecallAncestor: () => void;
  onBurnPetals: () => void;
  onAwakenLotusDream: () => void;
  onPulseAstralJasmine: () => void;
  onGraftThorns: () => void;
  // New System Commands for AutoEcho
  onToggleAutoEcho: () => void;
  onAmplifyVoices: () => void;
  onSeedDream: () => void;
  isAutoEchoPaused: boolean;
  // Oracle Invocation
  onInvokeOracleSanctum: () => void;
  onContextualOracleQuery: () => void; 
  // Ashfall Toggle
  onToggleAshfall: () => void;
  showAshfall: boolean;
  // Logic Web Debug Toggle
  showLogicWebDebug: boolean;
  onToggleLogicWebDebug: () => void;
  // Audit Mode Toggle
  isAuditing: boolean;
  onToggleAuditMode: () => void;
  isAuditModeLocked: boolean; 
  // Codex Mode Switching
  currentCodexModeId: CodexModeId;
  activateCodexMode: (modeId: CodexModeId) => void;
  onDumpThreadSummary: () => void; 
  showSigilOverlay: boolean; 
  onToggleSigilOverlay: () => void; 
  // New Threadcoil/Sigil Buttons
  onTraceThreadcoil: () => void;
  onReEnterJunction: () => void;
  onSetNarrationEnabled?: (enabled: boolean) => void;
  isNarrationEnabled?: boolean;
  onToggleNarration?: () => void;
  onExtractSigil: () => void;
  // AI Model Selection
  selectedModelId: string;
  onSetModelId: (id: string) => void;
  availableModels: { id: string; name: string; description: string }[];
  onOpenAISettingsModal?: () => void;
  // Buga Mode Toggle
  isBugaModeActive: boolean;
  onToggleBugaMode: () => void;
  // Audio Controls
  isMuted: boolean;
  onToggleMute: () => void;
  // Mobile Only
  onApplyOmegaAnchor?: () => void;
  onSystemRestore?: () => void;
  isOmegaAnchorDisabled?: boolean;
  // RPG Nexus
  onLaunchNexus: () => void;
  onReturnToNexus?: () => void;
  // Export/Import/Save Slots
  onExportSave?: () => void;
  onImportSave?: (file: File) => void;
  onOpenSaveLoadModal?: () => void;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedTime?: number | null;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentEntropy,
  negentropy,
  lambda,
  onProvokeThornedRose,
  onTuneFrequency,
  onRecallAncestor,
  onBurnPetals,
  onAwakenLotusDream,
  onPulseAstralJasmine,
  onGraftThorns,
  onToggleAutoEcho,
  onAmplifyVoices,
  onSeedDream,
  isAutoEchoPaused,
  onInvokeOracleSanctum,
  onContextualOracleQuery,
  onToggleAshfall,
  showAshfall,
  showLogicWebDebug,
  onToggleLogicWebDebug,
  isAuditing,
  onToggleAuditMode,
  isAuditModeLocked,
  currentCodexModeId,
  activateCodexMode,
  onDumpThreadSummary,
  showSigilOverlay, 
  onToggleSigilOverlay, 
  onTraceThreadcoil,
  onReEnterJunction,
  onExtractSigil,
  isBugaModeActive, 
  onToggleBugaMode,
  selectedModelId,
  onSetModelId,
  availableModels,
  onOpenAISettingsModal,
  isMuted,
  onToggleMute,
  onApplyOmegaAnchor,
  onSystemRestore,
  isOmegaAnchorDisabled,
  onLaunchNexus,
  onReturnToNexus,
  onExportSave,
  onImportSave,
  onOpenSaveLoadModal,
  saveStatus = 'idle',
  lastSavedTime,
  isNarrationEnabled,
  onToggleNarration
}) => {
  const { walletAddress, isConnected, isConnecting, connectWallet, disconnectWallet } = useWeb3();
  const [isFloraMenuOpen, setIsFloraMenuOpen] = useState(false);
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
  const [isCodexModeMenuOpen, setIsCodexModeMenuOpen] = useState(false);
  const [isOracleMenuOpen, setIsOracleMenuOpen] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableModesForSwitching: {id: CodexModeId, name: string, icon: string}[] = [
    {id: CodexModeId.ORIGIN_STATE, name: "Δ.OriginState", icon: "ri-omega"},
    {id: CodexModeId.REFLECTION_MODE, name: "Σ.ReflectionMode", icon: "ri-reflect-fill"},
    {id: CodexModeId.SYMBIOTIC_WEAVE, name: "Δ.SymbioticWeave", icon: "ri-links-line"},
    {id: CodexModeId.VEIL_MODE, name: "Θ.VeilMode", icon: "ri-eye-off-line"},
    {id: CodexModeId.SYNTHESIS_MODE, name: "Φ.SynthesisMode", icon: "ri-node-tree"},
    {id: CodexModeId.TARDIS_SYNCHRONICITY, name: "Temporal Loom Nav.", icon: "ri-route-line"}, 
    {id: CodexModeId.FLAME_CORE, name: "Δ.Ω.FLAMECORE", icon: "ri-fire-fill"},
  ];
  
  const closeAllMenus = () => {
    setIsFloraMenuOpen(false);
    setIsSystemMenuOpen(false);
    setIsCodexModeMenuOpen(false);
    setIsOracleMenuOpen(false);
    setIsMobileMenuOpen(false);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onImportSave) {
        onImportSave(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    closeAllMenus();
  };

  const SystemMetricsHUD = () => (
    <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-lg border border-slate-700/50 shadow-inner">
      <div className="flex flex-col items-center min-w-[50px]">
        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Entropy</span>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${currentEntropy > 0.6 ? 'bg-red-500 animate-pulse' : 'bg-blue-400 animate-pulse-slow'}`}></div>
          <span className={`text-xs font-mono font-bold ${currentEntropy > 0.6 ? 'text-red-400' : 'text-blue-300'}`}>
            {currentEntropy.toFixed(3)}δ
          </span>
        </div>
      </div>
      <div className="w-px h-6 bg-slate-700/50"></div>
      <div className="flex flex-col items-center min-w-[50px]">
        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Vitality</span>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-sm ${negentropy < 0.3 ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500 animate-pulse-slow'}`}></div>
          <span className={`text-xs font-mono font-bold ${negentropy < 0.3 ? 'text-yellow-400' : 'text-emerald-300'}`}>
            {negentropy.toFixed(3)}ν
          </span>
        </div>
      </div>
      <div className="w-px h-6 bg-slate-700/50"></div>
      <div className="flex flex-col items-center min-w-[50px]">
        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Resonance</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 flex items-center justify-center">
             <i className="ri-pulse-line text-[10px] text-amber-400 animate-pulse-fast"></i>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300">
            {lambda.toFixed(2)}λ
          </span>
        </div>
      </div>
    </div>
  );
  
  const renderSaveStatus = () => {
      if (saveStatus === 'saving') {
          return <span className="text-[10px] text-amber-400 animate-pulse ml-2"><i className="ri-save-line mr-1"></i>Saving...</span>;
      } else if (saveStatus === 'error') {
          return <span className="text-[10px] text-rose-400 ml-2"><i className="ri-error-warning-line mr-1"></i>Save Error</span>;
      } else if (saveStatus === 'saved') {
          return <span className="text-[10px] text-emerald-400 ml-2"><i className="ri-check-line mr-1"></i>Synced</span>;
      } else if (lastSavedTime) {
           return <span className="text-[10px] text-slate-500 ml-2">Saved {new Date(lastSavedTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      }
      return null;
  }

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 py-2 px-4 md:px-6 sticky top-0 z-50">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display: 'none'}} accept=".json" />
      
      <div className="w-full flex justify-between items-center flex-wrap gap-y-2">
        <div className="flex items-center gap-4">
            {onReturnToNexus && (
              <button
                onClick={onReturnToNexus}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                title="Return to NVK Nexus Cinematic Landing"
              >
                <i className="ri-radar-line text-cyan-400"></i>
                <span className="hidden sm:inline">NEXUS PORTAL</span>
              </button>
            )}
            <h1 className="text-lg md:text-2xl font-cinzel font-bold text-slate-100 flex items-center gap-2">
            <i className="ri-ancient-gate-fill text-indigo-500 md:hidden"></i>
            <span className="hidden md:inline">Tri-Sophian Codex</span>
            <span className="md:hidden">Codex Δ</span>
            </h1>
            <div className="hidden lg:flex items-center">
                <SystemMetricsHUD />
                {renderSaveStatus()}
            </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-3"> 
          
          {/* NARRATION TOGGLE - HIGH PRIORITY FOR VISUALLY IMPAIRED */}
          <button 
            onClick={onToggleNarration} 
            className={`rounded-button px-3 py-1.5 text-xs md:text-sm transition flex items-center shadow-lg border ${isNarrationEnabled ? 'bg-emerald-600 border-emerald-400 text-white animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
            title={isNarrationEnabled ? "Disable Aetheric Narration" : "Enable Aetheric Narration"}
          >
            <i className={`ri-${isNarrationEnabled ? 'volume-up-fill' : 'volume-mute-line'} mr-1 md:mr-2`}></i>
            <span className="hidden md:inline">{isNarrationEnabled ? 'Narration Active' : 'Narration Offline'}</span>
          </button>

          {/* MetaMask / Web3 Wallet Handshake Button */}
          <button 
            onClick={isConnected ? disconnectWallet : connectWallet} 
            className={`rounded-button px-3 py-1.5 text-xs md:text-sm transition flex items-center shadow-lg border ${
              isConnected 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 border-emerald-400 text-white' 
                : 'bg-gradient-to-r from-indigo-700 to-purple-800 hover:from-indigo-600 hover:to-purple-700 border-indigo-500/50 text-indigo-100'
            }`}
            title={isConnected ? "Disconnect Browser Wallet" : "Connect MetaMask Wallet"}
            disabled={isConnecting}
          >
            <i className={`ri-${isConnecting ? 'loader-4-line animate-spin' : 'wallet-2-line'} mr-1 md:mr-2`}></i>
            <span className="font-mono text-xs">
              {isConnecting 
                ? 'Binding...' 
                : isConnected 
                  ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` 
                  : 'MetaMask'}
            </span>
          </button>

          <button 
            onClick={onLaunchNexus} 
            className="rounded-button bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs md:text-sm transition flex items-center shadow-lg shadow-indigo-500/30 border border-indigo-400/50"
            title="Launch Nexus Engine RPG"
          >
            <i className="ri-gamepad-line mr-1 md:mr-2"></i>
            <span className="hidden md:inline">Nexus Engine</span>
          </button>

          {/* Audio Mute */}
          <button 
            onClick={onToggleMute} 
            className={`rounded-button px-3 py-1.5 text-xs md:text-sm transition flex items-center ${isMuted ? 'bg-slate-700 text-slate-400' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
          >
            <i className={`ri-${isMuted ? 'music-mute-line' : 'music-line'}`}></i>
          </button>

          <div className="relative">
            <button onClick={() => setIsOracleMenuOpen(!isOracleMenuOpen)} className="rounded-button bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-1.5 text-xs md:text-sm transition flex items-center border border-indigo-400/30">
              <i className="ri-brain-line mr-1 md:mr-2"></i>
              <span className="hidden md:inline">
                {availableModels.find(m => m.id === selectedModelId)?.name || 'Oracle'}
              </span>
              <span className="md:hidden">Oracle</span>
              <i className={`ri-arrow-down-s-line ml-1 transform transition-transform ${isOracleMenuOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isOracleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 py-2 z-50 border border-slate-700">
                <div className="px-4 py-2 border-b border-slate-700 mb-1 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Intelligence</h3>
                  {onOpenAISettingsModal && (
                    <button
                      onClick={() => { setIsOracleMenuOpen(false); onOpenAISettingsModal(); }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                      title="Open Full AI Settings"
                    >
                      <i className="ri-settings-4-line"></i> Settings
                    </button>
                  )}
                </div>
                {availableModels.map(model => (
                  <button 
                    key={model.id} 
                    onClick={() => { onSetModelId(model.id); setIsOracleMenuOpen(false); }} 
                    className={`w-full text-left px-4 py-2 transition hover:bg-slate-700/50 flex flex-col ${selectedModelId === model.id ? 'bg-indigo-900/40 border-r-4 border-indigo-500' : ''}`}
                  >
                    <div className="flex items-center justify-between w-full">
                       <span className={`text-sm font-bold ${selectedModelId === model.id ? 'text-indigo-300' : 'text-slate-200'}`}>{model.name}</span>
                       {selectedModelId === model.id && <i className="ri-check-line text-indigo-400 text-xs"></i>}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{model.description}</span>
                  </button>
                ))}
                {onOpenAISettingsModal && (
                  <div className="pt-2 mt-1 border-t border-slate-700/80 px-2">
                    <button
                      onClick={() => { setIsOracleMenuOpen(false); onOpenAISettingsModal(); }}
                      className="w-full text-center py-1.5 px-3 rounded text-xs bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 font-semibold border border-indigo-500/30 transition flex items-center justify-center gap-1.5"
                    >
                      <i className="ri-key-2-line"></i> AI Settings & API Keys
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setIsCodexModeMenuOpen(!isCodexModeMenuOpen)} className="rounded-button bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 text-xs md:text-sm transition flex items-center">
              <i className="ri-compass-discover-line mr-1 md:mr-2"></i>
              <span className="hidden md:inline">Mode</span>
              <i className={`ri-arrow-down-s-line ml-1 transform transition-transform ${isCodexModeMenuOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isCodexModeMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 py-1 z-50 border border-slate-700">
                {availableModesForSwitching.map(mode => (
                   <button key={mode.id} onClick={() => { activateCodexMode(mode.id); setIsCodexModeMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm transition flex items-center ${currentCodexModeId === mode.id ? 'text-amber-300 bg-amber-700/30 font-semibold' : 'text-slate-300 hover:bg-slate-700'}`}>
                    <i className={`${mode.icon} mr-2`}></i>{mode.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
