import React, { useState } from 'react';
import { useGemini } from '../../context/GeminiIntegrationContext';
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
    customApiKey, 
    setCustomApiKey, 
    hasActiveKey, 
    effectiveApiKey,
    availableModels, 
    testConnection,
    isGenerating 
  } = useGemini();

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(customApiKey);

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSaveApiKey = () => {
    setCustomApiKey(tempApiKey);
    setTestResult(null);
  };

  const handleClearApiKey = () => {
    setTempApiKey('');
    setCustomApiKey('');
    setTestResult(null);
  };

  const activeModelObj = availableModels.find(m => m.id === selectedModelId);
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
              <h2 className="text-lg font-bold font-cinzel text-indigo-300">AI Model & Provider Configuration</h2>
              <p className="text-xs text-slate-400">Easily swap AI models, fine-tuned checkpoints, and API keys for GitHub deployment.</p>
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
          <div className={`p-4 rounded-xl border flex items-center justify-between ${hasActiveKey ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/30 border-amber-500/40 text-amber-300'}`}>
            <div className="flex items-center gap-3">
              <i className={`ri-${hasActiveKey ? 'shield-check-line text-2xl text-emerald-400' : 'alert-line text-2xl text-amber-400'}`}></i>
              <div>
                <h4 className="text-sm font-bold">{hasActiveKey ? 'API Key Active' : 'Fallback Simulation Mode'}</h4>
                <p className="text-xs text-slate-300">
                  {customApiKey ? 'Using Custom User API Key (Saved in browser storage).' : (hasActiveKey ? 'Using Environment Variable API Key (.env).' : 'No API key detected. Add GEMINI_API_KEY to .env or paste below.')}
                </p>
              </div>
            </div>
            {effectiveApiKey && (
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-700 text-slate-400">
                Key: ••••{effectiveApiKey.slice(-4)}
              </span>
            )}
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select AI Model Architecture
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
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-500/10' 
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-sm font-bold ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {model.name}
                      </span>
                      {isSelected && <i className="ri-checkbox-circle-fill text-indigo-400"></i>}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{model.description}</p>
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
                placeholder="e.g., tunedModels/my-special-model or gemini-3.1-pro-preview"
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                You can specify fine-tuned Gemini model identifiers (`tunedModels/...`), custom endpoint handles, or experimental release tags.
              </p>
            </div>
          )}

          {/* Custom API Key Input Drawer */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-200">Custom API Key Override</h4>
                <p className="text-xs text-slate-400">Useful when running from a cloned GitHub repository locally without modifying code.</p>
              </div>
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                {showKeyInput ? 'Hide Key Input' : (customApiKey ? 'Edit Custom Key' : 'Enter Key Manually')}
              </button>
            </div>

            {showKeyInput && (
              <div className="pt-2 space-y-3 border-t border-slate-800/80 animate-fade-in">
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <Button onClick={handleSaveApiKey} className="bg-indigo-600 hover:bg-indigo-500 text-xs px-4">
                    Save Key
                  </Button>
                  {customApiKey && (
                    <Button onClick={handleClearApiKey} className="bg-rose-900/60 hover:bg-rose-800 text-xs px-3 text-rose-300 border border-rose-700/50">
                      Clear
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Keys are kept exclusively in browser `localStorage`. They are never uploaded or committed to git.
                </p>
              </div>
            )}
          </div>

          {/* Test Diagnostics */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${testResult.success ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/40 border-rose-500/50 text-rose-200'}`}>
              <i className={`ri-${testResult.success ? 'checkbox-circle-line text-lg text-emerald-400' : 'error-warning-line text-lg text-rose-400'} shrink-0`}></i>
              <div>
                <span className="font-bold">{testResult.success ? 'Connection Success:' : 'Diagnostic Notice:'}</span> {testResult.message}
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
                <span>Pinging Model...</span>
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
