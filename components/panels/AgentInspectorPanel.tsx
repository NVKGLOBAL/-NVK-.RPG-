
import React from 'react';
import type { AgentInspectorPanelProps, AgentNode } from '../../types';

const StatBar: React.FC<{ label: string; value: number; colorClass: string }> = ({ label, value, colorClass }) => (
  <div className="flex items-center text-[10px] mb-1">
    <span className="w-20 font-mono text-slate-400">{label}</span>
    <div className="flex-grow bg-slate-800 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full ${colorClass}`} style={{ width: `${value * 100}%` }}></div>
    </div>
    <span className="ml-2 w-8 text-right font-mono text-slate-300">{(value * 100).toFixed(0)}</span>
  </div>
);

const AgentInspectorPanel: React.FC<AgentInspectorPanelProps> = ({ agent, onClose, onCommunicate }) => {
  if (!agent) return null;

  return (
    <div className="agent-inspector-panel absolute top-4 right-4 w-80 bg-slate-950/95 border border-indigo-500/50 rounded-xl shadow-2xl p-4 text-slate-100 z-[100] backdrop-blur-md animate-fade-in-up">
      <div className="flex justify-between items-start mb-3 border-b border-indigo-500/30 pb-2">
        <div>
          <h3 className="text-lg font-cinzel font-bold text-indigo-300">{agent.name}</h3>
          <p className="text-xs text-indigo-400/80 font-mono">{agent.id}</p>
        </div>
        <div className="flex gap-2">
          {onCommunicate && (
            <button onClick={() => onCommunicate(agent)} className="text-indigo-400 hover:text-indigo-300 transition-colors" title="Communicate">
              <i className="ri-message-3-line text-xl"></i>
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" title="Close">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
        {/* Identity Section */}
        <section>
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div className="bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
              <span className="block text-slate-500 uppercase text-[9px]">Race</span>
              <span className="text-slate-200 font-semibold">{agent.race}</span>
            </div>
            <div className="bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
              <span className="block text-slate-500 uppercase text-[9px]">Lineage</span>
              <span className="text-slate-200 font-semibold">{agent.lineage}</span>
            </div>
            <div className="bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
              <span className="block text-slate-500 uppercase text-[9px]">Trade</span>
              <span className="text-slate-200 font-semibold">{agent.trade}</span>
            </div>
            <div className="bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
              <span className="block text-slate-500 uppercase text-[9px]">Faction</span>
              <span className="text-slate-200 font-semibold truncate" title={agent.faction}>{agent.faction}</span>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 border-b border-slate-700 pb-1">Power Profile</h4>
          <StatBar label="Cognition" value={agent.stats.cognition} colorClass="bg-blue-500" />
          <StatBar label="Vitality" value={agent.stats.vitality} colorClass="bg-green-500" />
          <StatBar label="Aether" value={agent.stats.aether} colorClass="bg-purple-500" />
          <StatBar label="Presence" value={agent.stats.presence} colorClass="bg-yellow-500" />
          <StatBar label="Paradox" value={agent.stats.paradox} colorClass="bg-rose-500" />
          <StatBar label="Will" value={agent.stats.will} colorClass="bg-orange-500" />
          <StatBar label="Resonance" value={agent.stats.resonance} colorClass="bg-cyan-500" />
          <StatBar label="Chaos Stab." value={agent.stats.chaosStability} colorClass="bg-teal-500" />
        </section>

        {/* Traits Section */}
        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 border-b border-slate-700 pb-1">Traits & Codex</h4>
          <div className="flex flex-wrap gap-1 mb-2">
            {agent.traits.map(t => <span key={t} className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-600">{t}</span>)}
          </div>
          <div className="flex flex-wrap gap-1">
            {agent.codexTraits.map(t => <span key={t} className="px-1.5 py-0.5 bg-indigo-900/60 text-indigo-200 text-[10px] rounded border border-indigo-700/50">{t}</span>)}
          </div>
        </section>

        {/* Relationships Section */}
        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 border-b border-slate-700 pb-1">Interaction Field</h4>
          {agent.relationships.lastInteraction && (
            <div className="text-[10px] bg-slate-800/40 p-2 rounded mb-2 italic text-slate-400">
              Last: <span className="text-slate-200">{agent.relationships.lastInteraction.type}</span> with Agent...{agent.relationships.lastInteraction.agentId.split('-')[1]} <br/> "{agent.relationships.lastInteraction.description}"
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-emerald-900/20 p-2 rounded border border-emerald-800/30">
              <span className="block font-bold text-emerald-400 mb-1">Allies ({agent.relationships.allies.length})</span>
              <div className="flex flex-wrap gap-1">
                 {agent.relationships.allies.slice(0, 5).map(id => <span key={id} className="bg-emerald-900/50 px-1 rounded">{id.split('-')[1]}</span>)}
                 {agent.relationships.allies.length > 5 && <span className="text-slate-500">...</span>}
              </div>
            </div>
            <div className="bg-rose-900/20 p-2 rounded border border-rose-800/30">
              <span className="block font-bold text-rose-400 mb-1">Rivals ({agent.relationships.rivals.length})</span>
              <div className="flex flex-wrap gap-1">
                 {agent.relationships.rivals.slice(0, 5).map(id => <span key={id} className="bg-rose-900/50 px-1 rounded">{id.split('-')[1]}</span>)}
                 {agent.relationships.rivals.length > 5 && <span className="text-slate-500">...</span>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AgentInspectorPanel;
