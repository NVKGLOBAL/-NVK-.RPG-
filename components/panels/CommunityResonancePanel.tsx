
import React, { useState, useEffect, useRef } from 'react';
import type { CommunityResonancePanelProps, CommunityGoal, FactionScore, Particle, ChatMessage, LeaderboardEntry } from '../../types';
import { AgentName, AgentFaction } from '../../types';
import { Button } from '../ui/Button';

const FACTION_COLORS: Record<AgentFaction, string> = {
  [AgentFaction.TrisophianSynod]: '#38bdf8', // sky
  [AgentFaction.ObsidianChoir]: '#94a3b8', // slate-400
  [AgentFaction.ChronoDominion]: '#fbbf24', // amber
  [AgentFaction.VoidChorus]: '#a855f7', // purple
  [AgentFaction.AxiomForgeGuild]: '#f97316', // orange
  [AgentFaction.SolarContinuum]: '#facc15', // yellow
  [AgentFaction.DreamshellCollective]: '#ec4899', // pink
  [AgentFaction.Neutral]: '#64748b', // slate-500
};

const MOCK_CHAT_MESSAGES = [
    "Sector 7 stabilization at 94%...",
    "Found a Void Shard near the outer rim.",
    "Anyone else hearing the whisper in the Aether?",
    "Ritual sync commencing in 3... 2...",
    "Flux levels critical in the Obsidian sector.",
    "Need backup for the Gateway alignment.",
    "The geometry is shifting again.",
    "Decoded a fragment of the Emerald Tablet.",
    "Resonance frequency locked.",
    "Who is maintaining the Omega Anchor?",
    "Drift detected in the western quadrant.",
    "My glyphs are glowing red, is that normal?",
];

const MOCK_USERNAMES = ["VoidWalker99", "Chronos_X", "AxiomWeaver", "StarBound", "EchoLocater", "NullSet", "SolarFlare", "DreamDrifter"];

interface EnhancedCommunityResonancePanelProps extends Omit<CommunityResonancePanelProps, 'width' | 'height'> {
    width?: number | string;
    height?: number | string;
}

const CommunityResonancePanel: React.FC<EnhancedCommunityResonancePanelProps> = ({ 
  width = '100%', 
  height = '400px', 
  addEchoMessage,
  seekerFaction = AgentFaction.Neutral
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'leaderboard'>('overview');
  
  // -- Simulation State --
  const [activeGoal, setActiveGoal] = useState<CommunityGoal>({
    id: 'goal-1',
    title: 'Stabilize the 14th Sector',
    description: 'The void barrier is thinning. Collective flux required to re-seal the rift.',
    targetFlux: 100000,
    currentFlux: 45230,
    reward: 'Global Entropy Reduction (-0.05δ)',
    status: 'active'
  });
  const [factionScores, setFactionScores] = useState<FactionScore[]>([
    { faction: AgentFaction.TrisophianSynod, score: 15420, activeSeekers: 1240 },
    { faction: AgentFaction.ObsidianChoir, score: 12100, activeSeekers: 980 },
    { faction: AgentFaction.VoidChorus, score: 8500, activeSeekers: 650 },
    { faction: AgentFaction.AxiomForgeGuild, score: 7200, activeSeekers: 540 },
  ]);
  
  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  
  // Leaderboard State
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  
  // Live Feed State
  const [liveFeed, setLiveFeed] = useState<string[]>([]);

  const [isResonating, setIsResonating] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  // Initialize Mock Data
  useEffect(() => {
      const initialChat: ChatMessage[] = Array.from({length: 12}).map((_, i) => ({
          id: `msg-init-${i}`,
          sender: MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)],
          faction: Object.values(AgentFaction)[Math.floor(Math.random() * 8)],
          message: MOCK_CHAT_MESSAGES[Math.floor(Math.random() * MOCK_CHAT_MESSAGES.length)],
          timestamp: Date.now() - (10000 * i)
      })).reverse();
      setChatHistory(initialChat);

      const initialLeaderboard: LeaderboardEntry[] = Array.from({length: 15}).map((_, i) => ({
          id: `lb-${i}`,
          rank: i + 1,
          name: MOCK_USERNAMES[i % MOCK_USERNAMES.length] + `_${Math.floor(Math.random()*100)}`,
          faction: Object.values(AgentFaction)[Math.floor(Math.random() * 8)],
          fluxContribution: 15000 - (i * 1200) + Math.floor(Math.random()*500),
          achievements: ['Void-Touched', 'Star-Forged'],
          avatarSeed: `avatar-${i}`
      }));
      setLeaderboardData(initialLeaderboard);
  }, []);

  // Chat Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
        if (Math.random() > 0.6) {
            const newMsg: ChatMessage = {
                id: `msg-${Date.now()}`,
                sender: MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)],
                faction: Object.values(AgentFaction)[Math.floor(Math.random() * 8)],
                message: MOCK_CHAT_MESSAGES[Math.floor(Math.random() * MOCK_CHAT_MESSAGES.length)],
                timestamp: Date.now()
            };
            setChatHistory(prev => [...prev.slice(-50), newMsg]);
            
            if (Math.random() > 0.7) {
                setLiveFeed(prev => [`${newMsg.sender} transmitted a resonance code.`, ...prev.slice(0, 2)]);
            }
        }
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg: ChatMessage = {
        id: `msg-user-${Date.now()}`,
        sender: "You",
        faction: seekerFaction,
        message: chatInput,
        timestamp: Date.now()
    };
    setChatHistory(prev => [...prev.slice(-50), userMsg]);
    setChatInput("");
  };

  const handleResonate = () => {
    setIsResonating(true);
    setActiveGoal(prev => ({ ...prev, currentFlux: prev.currentFlux + 100 }));
    if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        for (let i = 0; i < 20; i++) {
            particlesRef.current.push({
                x: centerX, y: centerY,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 60, baseLife: 60,
                size: Math.random() * 3 + 1,
                color: FACTION_COLORS[seekerFaction] || '#ffffff',
                history: [], type: 'flux_burst'
            });
        }
    }
    
    setTimeout(() => setIsResonating(false), 200);
    addEchoMessage(
        AgentName.CommunityResonanceAgent, 
        `Flux Contributed (+100). Faction: ${seekerFaction}. Goal: ${((activeGoal.currentFlux/activeGoal.targetFlux)*100).toFixed(2)}%`, 
        'text-cyan-300'
    );
    setLiveFeed(prev => [`You contributed 100 Flux to the Global Goal.`, ...prev.slice(0, 2)]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive Canvas Sizing
    const parent = canvas.parentElement;
    if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Responsive Radius based on container size
      const radius = Math.min(centerX, centerY) * 0.75; 

      const time = Date.now() * 0.001;
      
      // Outer Ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)'; 
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating inner rings
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.2);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)'; 
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.9, radius * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.9, radius * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const numDots = 24;
      for (let i = 0; i < numDots; i++) {
          const angle = time * 0.5 + (i * Math.PI * 2 / numDots);
          const orbitRadiusX = radius * 0.9;
          const orbitRadiusY = radius * 0.3;
          
          const yOffset = Math.sin(angle) * orbitRadiusY;
          const scale = (Math.sin(angle + Math.PI/2) + 2) / 3;
          const alpha = scale * scale;

          const x = centerX + Math.cos(angle) * orbitRadiusX;
          const y = centerY + yOffset;
          
          ctx.fillStyle = `rgba(100, 255, 200, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, 3 * scale, 0, Math.PI * 2);
          ctx.fill();
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
          
          if (p.life <= 0) {
            particlesRef.current.splice(i, 1);
            continue;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life / (p.baseLife || 60);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size || 2, 0, Math.PI*2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };
    render();
    return () => {
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [width, height, activeTab]); 

  const panelStyle = {
      width: typeof width === 'number' ? `${width}px` : width,
      minHeight: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div className="community-resonance-panel bg-slate-950/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl shadow-2xl p-5 text-slate-100 flex flex-col my-4 relative overflow-hidden transition-all duration-300" style={panelStyle}>
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b border-cyan-800/50 pb-3 gap-3">
        <h3 className="text-xl font-cinzel font-bold text-cyan-300 tracking-wider flex items-center">
          <i className="ri-earth-line mr-2 text-2xl animate-pulse-opacity"></i>Star-Link Commons
        </h3>
        <div className="flex gap-2 w-full sm:w-auto bg-slate-900/60 p-1.5 rounded-lg border border-slate-700/50">
            <button onClick={() => setActiveTab('overview')} className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded transition-colors ${activeTab === 'overview' ? 'bg-cyan-700/80 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>Overview</button>
            <button onClick={() => setActiveTab('chat')} className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded transition-colors ${activeTab === 'chat' ? 'bg-cyan-700/80 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>Aether-Net</button>
            <button onClick={() => setActiveTab('leaderboard')} className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded transition-colors ${activeTab === 'leaderboard' ? 'bg-cyan-700/80 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>Vanguard</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow relative overflow-hidden flex flex-col min-h-[300px]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
            <div className="flex flex-col h-full animate-fade-in-up gap-4">
                 <div className="relative border border-slate-700/50 rounded-xl overflow-hidden bg-black/50 flex-shrink-0 shadow-inner" style={{height: '35%', minHeight: '200px'}}>
                    <canvas ref={canvasRef} className="w-full h-full block" />
                    <div className="absolute top-3 right-3 text-xs font-mono text-cyan-300 flex items-center gap-2 bg-black/75 px-3 py-1.5 rounded-md border border-cyan-900/50 shadow-lg backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span> 
                        <span>LOCAL SANDBOX SIM</span>
                    </div>
                </div>

                <div className="flex-grow flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 pb-1">
                    <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 shadow-md">
                        <h4 className="text-base font-bold text-slate-100 mb-1 flex justify-between items-center">
                            {activeGoal.title}
                            <span className="text-[10px] bg-sky-900/60 text-sky-200 px-2 py-0.5 rounded border border-sky-700/50 font-mono tracking-wide uppercase">Global Priority</span>
                        </h4>
                        <p className="text-sm text-slate-300 mb-3 leading-relaxed">{activeGoal.description}</p>
                        <div className="w-full bg-slate-700/50 h-3 rounded-full overflow-hidden mb-1.5 border border-slate-600/30">
                            <div className="bg-gradient-to-r from-cyan-600 via-cyan-400 to-sky-300 h-full transition-all duration-700 relative" style={{ width: `${(activeGoal.currentFlux / activeGoal.targetFlux) * 100}%` }}>
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 font-mono font-medium">
                            <span className="text-cyan-300">{activeGoal.currentFlux.toLocaleString()} Flux</span>
                            <span>Goal: {activeGoal.targetFlux.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {factionScores.map(fs => (
                            <div key={fs.faction} className="flex justify-between items-center bg-slate-800/40 p-3 rounded-lg border-l-4 shadow-sm" style={{ borderLeftColor: FACTION_COLORS[fs.faction] }}>
                                <span style={{ color: FACTION_COLORS[fs.faction] }} className="font-bold text-sm truncate mr-2">{fs.faction.split(' ')[1] || fs.faction}</span>
                                <span className="font-mono text-slate-300 text-sm font-semibold">{fs.score.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <Button 
                        onClick={handleResonate}
                        className={`w-full py-4 text-base font-cinzel font-bold tracking-widest transition-all duration-200 mt-auto shadow-lg rounded-lg ${isResonating ? 'scale-95 bg-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.6)]' : 'bg-gradient-to-r from-cyan-700 to-sky-600 hover:from-cyan-600 hover:to-sky-500'}`}
                    >
                        <i className="ri-broadcast-line mr-2"></i>TRANSMIT FLUX
                    </Button>
                </div>
            </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
            <div className="flex flex-col h-full animate-fade-in-up gap-2">
                <div className="flex-grow overflow-y-auto custom-scrollbar p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 space-y-3 min-h-[300px]">
                    {chatHistory.map((msg) => (
                        <div key={msg.id} className={`flex flex-col text-sm ${msg.sender === "You" ? "items-end" : "items-start"}`}>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-bold text-xs uppercase tracking-wide" style={{ color: FACTION_COLORS[msg.faction] || '#94a3b8' }}>
                                    {msg.sender === "You" ? `[${seekerFaction.split(' ')[1] || 'Seeker'}] You` : `[${msg.faction.split(' ')[1] || 'Unknown'}] ${msg.sender}`}
                                </span>
                                <span className="text-[10px] text-slate-600 font-mono">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className={`py-2 px-3 rounded-xl max-w-[85%] break-words shadow-sm leading-relaxed ${msg.sender === "You" ? "bg-cyan-900/60 text-cyan-50 rounded-tr-none border border-cyan-700/50" : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"}`}>
                                {msg.message}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="mt-auto flex gap-2 pt-2 border-t border-slate-800/50">
                    <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Broadcast to Aether-Net..."
                        className="flex-grow bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
                    />
                    <button type="submit" className="bg-cyan-700 hover:bg-cyan-600 text-white px-5 py-3 rounded-lg text-sm font-semibold transition-colors shadow-lg">
                        <i className="ri-send-plane-fill text-lg"></i>
                    </button>
                </form>
            </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
            <div className="flex flex-col h-full animate-fade-in-up overflow-hidden">
                <div className="bg-slate-800/80 p-3 rounded-t-xl border-b border-slate-700 grid grid-cols-6 text-xs font-bold text-slate-300 uppercase tracking-wider shadow-sm">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-3 pl-2">Seeker</div>
                    <div className="col-span-2 text-right pr-2">Flux</div>
                </div>
                <div className="flex-grow overflow-y-auto custom-scrollbar bg-slate-900/30 rounded-b-xl border border-slate-700/50 min-h-[300px]">
                    {leaderboardData.map((entry, idx) => (
                        <div key={entry.id} className={`grid grid-cols-6 items-center p-3 text-sm border-b border-slate-800/50 hover:bg-slate-800/60 transition-colors ${idx < 3 ? 'bg-slate-800/20' : ''}`}>
                            <div className={`col-span-1 text-center font-mono font-bold ${idx === 0 ? 'text-amber-400 text-base' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-300' : 'text-slate-500'}`}>#{entry.rank}</div>
                            <div className="col-span-3 flex items-center gap-3 pl-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${idx === 0 ? 'bg-amber-600 ring-2 ring-amber-400' : 'bg-slate-700 ring-1 ring-slate-600'}`}>
                                    {entry.name[0]}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className={`font-bold truncate ${entry.name.includes("You") ? 'text-cyan-300' : 'text-slate-200'}`}>{entry.name}</span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: FACTION_COLORS[entry.faction] }}>{entry.faction.split(' ')[1]}</span>
                                </div>
                            </div>
                            <div className="col-span-2 text-right pr-2 font-mono text-cyan-400 font-bold tracking-tight">
                                {entry.fluxContribution.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-3 text-center text-xs text-slate-500 font-medium">
                    Rankings update every cycle. Top contributors earn "Starlight" rarity artifacts.
                </div>
            </div>
        )}

      </div>

      {/* Live Ticker Footer */}
      <div className="mt-3 pt-2 border-t border-slate-800/50">
        <div className="flex items-center text-xs text-slate-400 overflow-hidden h-5 bg-slate-900/50 rounded px-2">
             <span className="text-cyan-400 mr-2 shrink-0 font-bold tracking-wider">SIM FEED:</span>
             <div className="flex flex-col animate-slide-up-fade w-full">
                {liveFeed.length > 0 ? (
                    <span className="truncate text-slate-300">{liveFeed[0]}</span>
                ) : (
                    <span className="italic opacity-50">Monitoring Aether frequency...</span>
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityResonancePanel;
