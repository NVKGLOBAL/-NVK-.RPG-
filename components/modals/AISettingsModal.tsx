import React, { useState } from 'react';
import { useSovereignAI } from '../../context/SovereignAIContext';
import { Button } from '../ui/Button';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    selectedModelId, 
    setSelectedModelId, 
    customModelInput, 
    setCustomModelInput, 
    availableModels, 
    testConnection,
    isGenerating 
  } = useSovereignAI();

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  const isCustom = selectedModelId === 'custom';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <i className="ri-cpu-line text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold font-cinzel text-indigo-300">AI Engine & Model Architecture</h2>
              <p className="text-xs text-slate-400">Preconfigured open-source AI, zero API keys needed. Ready for GitHub deployment.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Close"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* Key Status Banner */}
          <div className="p-4 rounded-xl border bg-emerald-950/30 border-emerald-500/40 text-emerald-300 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <i className="ri-shield-check-line text-2xl text-emerald-400 shrink-0 mt-0.5"></i>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">Zero-Key Mode: ACTIVE & READY</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                    No API Key Required
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Text Generation, FLUX Image Synthesis, Web Speech Narration, and Vector Memories operate out-of-the-box with zero API keys or billing setup.
                </p>
                
                {/* Feature Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-emerald-500/20">
                  <div className="bg-slate-950/60 p-2 rounded border border-emerald-500/20 text-center">
                    <span className="text-[10px] text-slate-400 block font-mono">LLM REASONING</span>
                    <span className="text-xs font-bold text-emerald-400">Sovereign Local</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-emerald-500/20 text-center">
                    <span className="text-[10px] text-slate-400 block font-mono">IMAGE SYNTHESIS</span>
                    <span className="text-xs font-bold text-emerald-400">FLUX / Diffusion</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-emerald-500/20 text-center">
                    <span className="text-[10px] text-slate-400 block font-mono">SPEECH / TTS</span>
                    <span className="text-xs font-bold text-emerald-400">Web Speech API</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-emerald-500/20 text-center">
                    <span className="text-[10px] text-slate-400 block font-mono">VECTOR MEMORY</span>
                    <span className="text-xs font-bold text-emerald-400">Local Cosine 128d</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Active Intelligence Architecture
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableModels.map((model) => {
                const isSelected = selectedModelId === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => { setSelectedModelId(model.id); setTestResult(null); }}
                    className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-400/50' 
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-sm font-bold ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {model.name}
                      </span>
                      {isSelected && <i className="ri-checkbox-circle-fill text-indigo-400 text-base"></i>}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{model.description}</p>
                    <span className="text-[9px] font-mono text-indigo-400/70 mt-2 uppercase tracking-wide">
                      {model.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Model ID Input */}
          {isCustom && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-indigo-500/40 space-y-2 animate-fade-in">
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Enter Custom Model Identifier
              </label>
              <input 
                type="text"
                value={customModelInput}
                onChange={(e) => setCustomModelInput(e.target.value)}
                placeholder="e.g., pollinations-deepseek or ollama:llama3.1"
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Specify any custom provider endpoint or model handle.
              </p>
            </div>
          )}

          {/* Test Diagnostics */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${testResult.success ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/40 border-rose-500/50 text-rose-200'}`}>
              <i className={`ri-${testResult.success ? 'checkbox-circle-line text-lg text-emerald-400' : 'error-warning-line text-lg text-rose-400'} shrink-0`}></i>
              <div>
                <span className="font-bold">{testResult.success ? 'Connection Status:' : 'Diagnostic Notice:'}</span> {testResult.message}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-t border-slate-800">
          <button
            onClick={handleRunTest}
            disabled={isTesting || isGenerating}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700 flex items-center gap-2"
          >
            {isTesting ? (
              <>
                <i className="ri-loader-4-line animate-spin text-indigo-400"></i>
                <span>Verifying Zero-Key Link...</span>
              </>
            ) : (
              <>
                <i className="ri-wifi-line text-indigo-400"></i>
                <span>Test Connection</span>
              </>
            )}
          </button>

          <Button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-500 text-xs px-6 py-2">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AISettingsModal;
