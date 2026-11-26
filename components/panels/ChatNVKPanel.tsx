
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SeekerProfile, SovereignPhase, AgentPlan, ProjectMetadata, ProjectFile, ArtifactType, ArtifactRarity } from '../../types';
import { globalSovereignKernel } from '../../lib/SovereignKernel';
import { globalSoundEngine } from '../../lib/SoundEngine';

interface ChatNVKPanelProps {
    activeProfile: SeekerProfile | null;
    addEchoMessage: (s: string, t: string, c: string) => void;
}

export const ChatNVKPanel: React.FC<ChatNVKPanelProps> = ({ activeProfile, addEchoMessage }) => {
    const [messages, setMessages] = useState<{sender: string, text: string, type: 'user' | 'bot'}[]>([]);
    const [input, setInput] = useState("");
    const [phase, setPhase] = useState<SovereignPhase>(SovereignPhase.IDLE);
    const [activePlan, setActivePlan] = useState<AgentPlan | null>(null);
    const [currentProject, setCurrentProject] = useState<ProjectMetadata | null>(null);
    const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
    
    // Fusion State
    const [mergeMode, setMergeMode] = useState(false);
    const [selectedFilesForMerge, setSelectedFilesForMerge] = useState<string[]>([]);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const thinkingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (thinkingRef.current) thinkingRef.current.scrollTop = thinkingRef.current.scrollHeight;
    }, [thinkingSteps]);

    const runFusionProtocol = async () => {
        if (selectedFilesForMerge.length < 2 || isThinking) return;
        
        setIsThinking(true);
        setPhase(SovereignPhase.MERGING);
        setThinkingSteps(["Initiating Harmonic Idea Fusion...", "Gathering resonant artifacts..."]);
        globalSoundEngine.playSFX('pulse');

        const filesToMerge = currentProject?.files.filter(f => selectedFilesForMerge.includes(f.path)) || [];

        try {
            const fusionResult = await globalSovereignKernel.mergeArtifacts(filesToMerge);
            setThinkingSteps(prev => [...prev, ...fusionResult.thinking, "Synthesis loop finalized."]);
            
            if (currentProject) {
                const fusionPath = `fused_${Date.now()}.json`;
                await globalSovereignKernel.writeProjectFile(currentProject.id, {
                    path: fusionPath,
                    content: fusionResult.content,
                    type: 'json'
                });
                
                const updatedProject = await globalSovereignKernel.getProject(currentProject.id);
                setCurrentProject(updatedProject);
                addEchoMessage("SovereignArchitect", `Great Work complete: ${fusionResult.name}`, "text-teal-400 font-bold");
                setMessages(prev => [...prev, { sender: 'Architect', text: `Synthesis successful. Created ${fusionResult.name}.`, type: 'bot' }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { sender: 'System', text: "Fusion Cascaded: Coherence lost.", type: 'bot' }]);
        } finally {
            setIsThinking(false);
            setPhase(SovereignPhase.IDLE);
            setMergeMode(false);
            setSelectedFilesForMerge([]);
        }
    };

    const runAngelicWorkflow = async (goal: string) => {
        if (!goal.trim() || isThinking) return;
        setIsThinking(true);
        setThinkingSteps(["Initiating neural weft..."]);
        setMessages(prev => [...prev, { sender: activeProfile?.name || 'Seeker', text: goal, type: 'user' }]);
        
        try {
            setPhase(SovereignPhase.RESEARCH);
            globalSoundEngine.playSFX('pulse');
            const research = await globalSovereignKernel.researchGoal(goal);
            setThinkingSteps(prev => [...prev, ...research.thinking, "Research layer stabilized."]);
            setMessages(prev => [...prev, { sender: 'Architect', text: `Research completed. Foundational constraints established for: ${goal}`, type: 'bot' }]);

            setPhase(SovereignPhase.PLANNING);
            const plan = await globalSovereignKernel.generatePlan(goal, research.summary);
            setActivePlan(plan);
            setThinkingSteps(prev => [...prev, ...plan.thinking_process, "Plan etched into silicon."]);

            setPhase(SovereignPhase.CREATION);
            const projectId = await globalSovereignKernel.provisionVM(plan.objective.substring(0, 15));
            let project = await globalSovereignKernel.getProject(projectId);
            setCurrentProject(project);

            for (const step of plan.steps) {
                setThinkingSteps(prev => [...prev, `Executing creation node: ${step.description}`]);
                await globalSovereignKernel.writeProjectFile(projectId, {
                    path: `${step.id}.txt`,
                    content: `Sovereign Output for ${step.description}\nGenerated by ChatNVK Alpha\n\nResult: Verified.`,
                    type: 'text'
                });
                project = await globalSovereignKernel.getProject(projectId);
                setCurrentProject(project);
                setActivePlan(prev => prev ? {
                    ...prev,
                    steps: prev.steps.map(s => s.id === step.id ? { ...s, status: 'done' } : s)
                } : null);
                await new Promise(r => setTimeout(r, 1200));
            }

            setPhase(SovereignPhase.AUDIT);
            setThinkingSteps(prev => [...prev, "Finalizing structural audit...", "Axiomatic alignment confirmed."]);
            setMessages(prev => [...prev, { sender: 'Architect', text: "Artifact creation cycle complete. Local IndexedDB Workspace is mounted and saved.", type: 'bot' }]);
            
        } catch (e) {
            setMessages(prev => [...prev, { sender: 'System', text: "Fatal resonance error in creation loop.", type: 'bot' }]);
        } finally {
            setIsThinking(false);
            setPhase(SovereignPhase.IDLE);
        }
    };

    const toggleFileSelection = (path: string) => {
        if (!mergeMode) {
            const file = currentProject?.files.find(f => f.path === path);
            if (file) setSelectedFile(file);
            return;
        }

        setSelectedFilesForMerge(prev => 
            prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
        );
    };

    return (
        <div className="flex h-full w-full bg-slate-950 border border-indigo-500/20 rounded-3xl overflow-hidden shadow-2xl relative font-sans text-slate-200">
            
            {/* Fusion Chamber Overlay */}
            <AnimatePresence>
                {phase === SovereignPhase.MERGING && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center"
                    >
                        <div className="relative w-64 h-64">
                            <motion.svg 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                viewBox="0 0 100 100" className="w-full h-full opacity-50"
                            >
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#2dd4bf" strokeWidth="0.5" strokeDasharray="5,5" />
                                <circle cx="50" cy="50" r="35" fill="none" stroke="#818cf8" strokeWidth="0.5" strokeDasharray="10,2" />
                            </motion.svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-16 h-16 bg-teal-500 rounded-full blur-2xl" 
                                />
                                <i className="ri-omega text-4xl text-white relative z-10 animate-pulse"></i>
                            </div>
                            {/* Orbital Particles representing merged files */}
                            {selectedFilesForMerge.map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ 
                                        rotate: 360,
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{ 
                                        rotate: { duration: 3 + i, repeat: Infinity, ease: "linear" },
                                        scale: { duration: 2, repeat: Infinity }
                                    }}
                                    className="absolute inset-0"
                                >
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full blur-[1px] absolute top-0 left-1/2" />
                                </motion.div>
                            ))}
                        </div>
                        <h2 className="text-2xl font-cinzel font-bold text-teal-300 mt-8 tracking-widest animate-pulse">Harmonic Fusion in Progress</h2>
                        <p className="text-xs font-mono text-slate-500 mt-2 uppercase">Synthesizing {selectedFilesForMerge.length} artifacts</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pane 1: Task Orchestrator (Left) */}
            <aside className="w-72 bg-slate-900/40 border-r border-white/5 flex flex-col backdrop-blur-xl shrink-0">
                <header className="p-4 border-b border-white/10 bg-black/20">
                    <h3 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Task Orchestrator</h3>
                    <div className="text-xs font-cinzel font-bold text-white mt-1">{phase}</div>
                </header>
                <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-grow">
                    {activePlan?.steps.map((step, i) => (
                        <div key={step.id} className={`p-3 rounded-xl border transition-all ${step.status === 'done' ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-800/40 border-white/5'}`}>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-mono text-slate-500">0{i+1}</span>
                                <i className={`ri-${step.status === 'done' ? 'checkbox-circle-fill text-emerald-400' : 'time-line text-slate-500'} text-xs`}></i>
                                <span className={`text-[10px] font-bold uppercase tracking-tighter ${step.status === 'done' ? 'text-emerald-300' : 'text-slate-400'}`}>
                                    {step.tool}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-1 leading-tight">{step.description}</p>
                        </div>
                    ))}
                    {!activePlan && <div className="text-center py-10 text-slate-600 italic text-xs">Waiting for objective...</div>}
                </div>
            </aside>

            {/* Pane 2: Neural Chat & Thinking (Center) */}
            <main className="flex-grow flex flex-col bg-slate-950/20 relative min-w-0">
                
                {/* Thinking HUD (Top Overlay) */}
                <AnimatePresence>
                    {isThinking && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 120, opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-indigo-950/20 border-b border-indigo-500/30 backdrop-blur-md overflow-hidden relative shrink-0"
                        >
                            <div ref={thinkingRef} className="p-4 h-full overflow-y-auto custom-scrollbar font-mono text-[10px] text-indigo-300 space-y-1">
                                {thinkingSteps.map((step, i) => (
                                    <div key={i} className="flex gap-2">
                                        <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
                                        <span>{step}</span>
                                    </div>
                                ))}
                                <div className="animate-pulse">_</div>
                            </div>
                            <div className="absolute top-2 right-2 px-2 py-1 bg-indigo-500 text-white text-[8px] font-bold rounded uppercase">Neural Stream</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Chat Log */}
                <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto custom-scrollbar space-y-6">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl border ${
                                m.type === 'user' 
                                ? 'bg-indigo-600/10 border-indigo-500/30 rounded-tr-none' 
                                : 'bg-slate-900/60 border-white/10 rounded-tl-none'
                            }`}>
                                <div className="text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-widest">{m.sender}</div>
                                <p className="text-sm font-cormorant leading-relaxed italic">{m.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900/40 border-t border-white/5 backdrop-blur-md">
                    <div className="flex gap-2 max-w-4xl mx-auto relative">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), runAngelicWorkflow(input), setInput(""))}
                            placeholder="Initialize Objective (e.g., 'Research and create a manifest for a Dyson Swarm ritual')"
                            className="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-4 pr-16 text-sm text-slate-100 outline-none focus:border-indigo-500/40 transition-all resize-none h-14"
                        />
                        <button 
                            onClick={() => { runAngelicWorkflow(input); setInput(""); }}
                            disabled={isThinking || !input.trim()}
                            className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 disabled:opacity-30 transition-all shadow-xl"
                        >
                            <i className="ri-send-plane-2-fill text-xl"></i>
                        </button>
                    </div>
                </div>
            </main>

            {/* Pane 3: VM Explorer & Preview (Right) */}
            <aside className="w-80 bg-slate-900/40 border-l border-white/5 flex flex-col backdrop-blur-xl shrink-0">
                <header className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                    <div>
                        <h3 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Artifact Explorer</h3>
                        <div className="text-[8px] font-mono text-slate-500 mt-1 truncate">ID: {currentProject?.id || 'NO_LINK'}</div>
                    </div>
                    <button 
                        onClick={() => { setMergeMode(!mergeMode); setSelectedFilesForMerge([]); }}
                        className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all border ${mergeMode ? 'bg-teal-600 border-teal-400 text-white shadow-[0_0_10px_rgba(45,212,191,0.5)]' : 'bg-slate-800 border-white/10 text-slate-400'}`}
                    >
                        {mergeMode ? 'Cancel Merge' : 'Merge Mode'}
                    </button>
                </header>
                
                {/* File List */}
                <div className="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {currentProject?.files.map(file => {
                        const isSelected = mergeMode ? selectedFilesForMerge.includes(file.path) : selectedFile?.path === file.path;
                        const isFused = file.path.startsWith('fused_');

                        return (
                            <button 
                                key={file.path}
                                onClick={() => toggleFileSelection(file.path)}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all relative group
                                    ${isSelected 
                                        ? (mergeMode ? 'bg-teal-900/30 border-teal-500/50 border shadow-[0_0_8px_rgba(45,212,191,0.2)]' : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30') 
                                        : 'hover:bg-white/5 text-slate-400 border border-transparent'}
                                    ${isFused ? 'animate-axiomCardPulse' : ''}
                                `}
                            >
                                <i className={`ri-${file.type === 'json' ? 'braces-line' : file.type === 'log' ? 'terminal-line' : 'file-text-line'} text-base ${isFused ? 'text-teal-400' : ''}`}></i>
                                <div className="truncate flex-grow">
                                    <div className={`text-xs font-mono ${isFused ? 'text-teal-200' : ''}`}>{file.path}</div>
                                    <div className="text-[8px] opacity-40 uppercase">{file.type}</div>
                                </div>
                                {mergeMode && (
                                    <div className={`w-3 h-3 rounded-sm border ${selectedFilesForMerge.includes(file.path) ? 'bg-teal-500 border-teal-400' : 'border-slate-700'}`}>
                                        {selectedFilesForMerge.includes(file.path) && <i className="ri-check-line text-[8px] text-white flex items-center justify-center"></i>}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                    {!currentProject && <div className="text-center py-10 text-slate-600 italic text-xs">Awaiting local workspace instantiation...</div>}
                </div>

                {/* Merge Action Button (Fixed above preview) */}
                <AnimatePresence>
                    {mergeMode && selectedFilesForMerge.length >= 2 && (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            exit={{ y: 20, opacity: 0 }}
                            className="p-4"
                        >
                            <button 
                                onClick={runFusionProtocol}
                                disabled={isThinking}
                                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-cinzel font-bold text-xs tracking-[0.2em] rounded-xl shadow-xl shadow-teal-900/40 border border-teal-400/50 flex items-center justify-center gap-2"
                            >
                                <i className="ri-flask-line"></i>
                                INITIATE FUSION
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Preview Window (Bottom of right pane) */}
                <div className="h-64 bg-black/40 border-t border-white/10 p-4 relative flex flex-col">
                    <div className="text-[9px] font-mono text-indigo-500 uppercase mb-2 flex justify-between">
                        <span>Sanctum Preview</span>
                        {selectedFile?.path.startsWith('fused_') && <span className="text-teal-400 animate-pulse">Sacred Synthesis</span>}
                    </div>
                    <div className="flex-grow overflow-auto bg-slate-900/60 rounded-lg p-3 border border-white/5 shadow-inner">
                        {selectedFile ? (
                            <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap leading-tight">
                                {selectedFile.content}
                            </pre>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-700 text-[10px] uppercase font-bold text-center p-4">
                                Select a file to inspect its data structure
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    );
};
