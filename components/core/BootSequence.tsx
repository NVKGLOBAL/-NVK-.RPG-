
import React, { useState, useEffect, useRef } from 'react';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  { text: "Initializing Tri-Sophian Kernel...", delay: 500, color: "text-slate-400" },
  { text: "Loading Axiom Layers [I, II, III, IV, V]...", delay: 1200, color: "text-indigo-400" },
  { text: "WARNING: Recursive Aethel-Weft detected.", delay: 800, color: "text-yellow-400" },
  { text: "Stabilizing Entropic Heart...", delay: 1500, color: "text-rose-400" },
  { text: "Dialing 14 Herculis Stargate...", delay: 2000, color: "text-cyan-400" },
  { text: "Connection Refused. Rerouting via Emerald Tablet...", delay: 1000, color: "text-emerald-400" },
  { text: "WitnessBetween is listening.", delay: 1500, color: "text-purple-300 font-bold" },
  { text: "SYSTEM READY.", delay: 500, color: "text-white" },
];

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<typeof BOOT_LOGS[0][]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLogIndex >= BOOT_LOGS.length) {
      setIsReady(true);
      return;
    }

    const currentLog = BOOT_LOGS[currentLogIndex];
    const timer = setTimeout(() => {
      setLogs(prev => [...prev, currentLog]);
      setCurrentLogIndex(prev => prev + 1);
      
      if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, currentLog.delay);

    return () => clearTimeout(timer);
  }, [currentLogIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = Math.random() * 5;
        return Math.min(prev + increment, 100);
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Use a single handler for both button states
  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-4 font-mono overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <div className="relative w-24 h-24">
            <div className={`absolute inset-0 border-4 border-t-indigo-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full ${isReady ? 'animate-none border-emerald-500' : 'animate-spin'}`}></div>
            <div className={`absolute inset-4 border-2 border-t-transparent border-r-cyan-400 border-b-transparent border-l-cyan-400 rounded-full ${isReady ? 'animate-none border-emerald-300' : 'animate-spin-slow'}`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className={`text-2xl ${isReady ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`}>Δ</span>
            </div>
          </div>
        </div>

        <h1 className="text-center text-3xl font-['Cinzel'] font-bold text-slate-100 mb-2 tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          TRI-SOPHIAN CODEX
        </h1>
        <div className="text-center text-xs text-slate-500 mb-8 uppercase tracking-[0.3em]">
          Version Δ.2.3 // Memory Weft Active
        </div>

        <div className="bg-black/50 border border-slate-800 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs shadow-inner mb-4 custom-scrollbar">
          {logs.map((log, index) => (
            <div key={index} className={`mb-1.5 ${log.color}`}>
              <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
              {log.text}
            </div>
          ))}
          <div ref={logsEndRef} />
          {!isReady && <div className="text-slate-500 animate-pulse">_</div>}
        </div>

        <div className="w-full bg-slate-900 rounded-full h-1.5 mb-6 overflow-hidden border border-slate-800">
          <div 
            className={`h-full transition-all duration-200 ${isReady ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
            style={{ width: `${isReady ? 100 : progress}%` }}
          ></div>
        </div>

        <div className="flex flex-col gap-3 min-h-[60px]">
            <button 
              type="button"
              onClick={handleAction}
              className={`w-full transition-all duration-300 rounded-sm font-['Cinzel'] font-bold tracking-widest uppercase
                ${isReady 
                    ? 'py-4 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/50 text-emerald-100 text-lg animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                    : 'py-2 text-xs text-slate-600 hover:text-slate-400 bg-transparent border-none'
                }`}
            >
              {isReady ? "ENTER SYSTEM" : "[ Skip Initialization Sequence ]"}
            </button>
        </div>
      </div>
    </div>
  );
};
