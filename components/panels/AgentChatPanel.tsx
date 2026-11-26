import React, { useState, useEffect, useRef } from 'react';
import { AgentNode } from '../../types';
import { useGemini } from '../../context/GeminiIntegrationContext';

interface AgentChatPanelProps {
  agent: AgentNode;
  onClose: () => void;
}

const AgentChatPanel: React.FC<AgentChatPanelProps> = ({ agent, onClose }) => {
  const [messages, setMessages] = useState<{ sender: string; text: string; isUser: boolean }[]>([]);
  const [input, setInput] = useState('');
  const { invokeGemini, isGenerating } = useGemini();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'Seeker', text: userMessage, isUser: true }]);

    const systemPrompt = `You are ${agent.name}, an autonomous agent in the Tri-Sophian Codex simulation.
Race: ${agent.race}
Lineage: ${agent.lineage}
Trade: ${agent.trade}
Faction: ${agent.faction}
Traits: ${agent.traits.join(', ')}
Codex Traits: ${agent.codexTraits.join(', ')}
Stats: Cognition (${agent.stats.cognition.toFixed(2)}), Vitality (${agent.stats.vitality.toFixed(2)}), Resonance (${agent.stats.resonance.toFixed(2)})

Respond in character. Keep responses concise and flavorful, reflecting your faction and traits.`;

    const prompt = `Seeker says: "${userMessage}"\n\nRespond as ${agent.name}:`;

    try {
      const response = await invokeGemini(prompt, systemPrompt);
      setMessages(prev => [...prev, { sender: agent.name, text: response || '*silence*', isUser: false }]);
    } catch (error) {
      console.error("Agent communication error:", error);
      setMessages(prev => [...prev, { sender: 'System', text: '[Communication Link Severed]', isUser: false }]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-200 font-sans rounded-xl overflow-hidden border border-indigo-500/20">
      <div className="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 italic text-sm mt-10">
            Connection established. {agent.name} is listening...
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg border ${
              m.isUser 
                ? 'bg-indigo-900/40 border-indigo-500/30 rounded-tr-none' 
                : 'bg-slate-800/60 border-slate-600/50 rounded-tl-none'
            }`}>
              <div className="text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider">{m.sender}</div>
              <p className="text-sm leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg border bg-slate-800/60 border-slate-600/50 rounded-tl-none">
              <div className="text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider">{agent.name}</div>
              <p className="text-sm leading-relaxed animate-pulse">...</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-indigo-500/30 bg-slate-900/50">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Message ${agent.name}...`}
            className="flex-grow bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={isGenerating || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
          >
            <i className="ri-send-plane-fill"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentChatPanel;
