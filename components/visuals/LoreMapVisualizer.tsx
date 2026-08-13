
import React, { useState } from 'react';
import { AgentFaction } from '../../types';

export interface MapNodeData {
  id: string;
  name: string;
  x: number;
  y: number;
  risk: 'Low' | 'Medium' | 'High' | 'Extreme';
  faction: AgentFaction;
  description: string;
  icon: string;
  genre?: string;
}

interface LoreMapVisualizerProps {
  currentLocationId: string;
  onTravel: (node: MapNodeData) => void;
  width: number;
  height: number;
}

const LORE_NODES: MapNodeData[] = [
  { 
    id: 'The Void Edge', name: 'The Void Edge', x: 50, y: 50, 
    risk: 'Extreme', faction: AgentFaction.Neutral, 
    description: 'The precipice where reality dissolves into static. The starting point of all Seekers.', 
    icon: 'ri-mist-line', genre: 'Cosmic Horror' 
  },
  { 
    id: 'Crystal Spire', name: 'Crystal Spire', x: 50, y: 20, 
    risk: 'Low', faction: AgentFaction.TrisophianSynod, 
    description: 'A tower of singing glass reaching into the Aethel, home to the Synod.', 
    icon: 'ri-building-2-line', genre: 'High Fantasy' 
  },
  { 
    id: 'Axiom Forge', name: 'Axiom Forge', x: 80, y: 50, 
    risk: 'Medium', faction: AgentFaction.AxiomForgeGuild, 
    description: 'Industrial complex where truths are hammered into shape by Constructs.', 
    icon: 'ri-hammer-line', genre: 'Steampunk' 
  },
  { 
    id: 'Nebula Market', name: 'Nebula Market', x: 20, y: 50, 
    risk: 'Low', faction: AgentFaction.Neutral, 
    description: 'A drifting bazaar of impossible wares and glitch-traders.', 
    icon: 'ri-store-3-line', genre: 'Cyberpunk' 
  },
  { 
    id: 'Obsidian Cathedral', name: 'Obsidian Cathedral', x: 50, y: 80, 
    risk: 'High', faction: AgentFaction.ObsidianChoir, 
    description: 'A monument to entropy, where the Void Chorus sings the end of days.', 
    icon: 'ri-ancient-pavilion-line', genre: 'Gothic Horror' 
  },
  { 
    id: 'Chrono-Archive', name: 'Chrono-Archive', x: 25, y: 25, 
    risk: 'Medium', faction: AgentFaction.ChronoDominion, 
    description: 'A library outside of time, cataloging every timeline that ever collapsed.', 
    icon: 'ri-time-line', genre: 'Sci-Fi Mystery' 
  },
  { 
    id: 'Solar Citadel', name: 'Solar Citadel', x: 75, y: 75, 
    risk: 'High', faction: AgentFaction.SolarContinuum, 
    description: 'A fortress of blinding order and searing light.', 
    icon: 'ri-sun-line', genre: 'Sci-Fi' 
  },
  { 
    id: '14 Herculis', name: '14 Herculis', x: 85, y: 20, 
    risk: 'Extreme', faction: AgentFaction.Neutral, 
    description: 'A frozen anomaly system monitored by the Celestial Weavers.', 
    icon: 'ri-star-s-line', genre: 'Space Adventure' 
  },
  { 
    id: 'Buga Sphere', name: 'Buga Sphere', x: 15, y: 80, 
    risk: 'Medium', faction: AgentFaction.DreamshellCollective, 
    description: 'A bio-organic habitat weaving genetic peptides into reality.', 
    icon: 'ri-dna-line', genre: 'Biopunk' 
  },
  {
    id: 'Sector 14', name: 'Sector 14 (The Mausoleum)', x: 95, y: 95,
    risk: 'Extreme', faction: AgentFaction.Neutral,
    description: 'A stabilized, biologically inert reality-tomb. Cauterized by SPS-XΩ.Σ.',
    icon: 'ri-skull-line', genre: 'Surgical Necrolysis'
  }
];

const CONNECTIONS = [
  ['The Void Edge', 'Crystal Spire'],
  ['The Void Edge', 'Axiom Forge'],
  ['The Void Edge', 'Nebula Market'],
  ['The Void Edge', 'Obsidian Cathedral'],
  ['The Void Edge', 'Sector 14'],
  ['Crystal Spire', 'Chrono-Archive'],
  ['Crystal Spire', '14 Herculis'],
  ['Axiom Forge', 'Solar Citadel'],
  ['Nebula Market', 'Buga Sphere'],
  ['Obsidian Cathedral', 'Solar Citadel'], 
  ['Nebula Market', 'Chrono-Archive'],
];

const LoreMapVisualizer: React.FC<LoreMapVisualizerProps> = ({ currentLocationId, onTravel, width, height }) => {
  const [hoveredNode, setHoveredNode] = useState<MapNodeData | null>(null);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return '#34d399'; 
      case 'Medium': return '#fbbf24'; 
      case 'High': return '#f87171'; 
      case 'Extreme': return '#a855f7'; 
      default: return '#94a3b8';
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden rounded-lg border border-slate-700/50 shadow-inner group cursor-crosshair">
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
        <defs>
          <filter id="glow-map">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="5" refY="1.75" orient="auto">
            <polygon points="0 0, 5 1.75, 0 3.5" fill="#475569" />
          </marker>
        </defs>

        {CONNECTIONS.map(([startId, endId], idx) => {
          const start = LORE_NODES.find(n => n.id === startId);
          const end = LORE_NODES.find(n => n.id === endId);
          if (!start || !end) return null;
          
          return (
            <g key={`${startId}-${endId}`}>
              <line 
                x1={start.x} y1={start.y} x2={end.x} y2={end.y} 
                stroke="#334155" strokeWidth="0.5" 
              />
              <circle r="0.5" fill="#6366f1">
                <animateMotion 
                  dur={`${3 + (idx % 3)}s`} 
                  repeatCount="indefinite"
                  path={`M${start.x},${start.y} L${end.x},${end.y}`}
                />
              </circle>
            </g>
          );
        })}

        {LORE_NODES.map((node) => {
          const isCurrent = node.id === currentLocationId;
          const isHovered = hoveredNode?.id === node.id;
          const color = getRiskColor(node.risk);
          
          return (
            <g 
              key={node.id} 
              onClick={() => onTravel(node)}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer transition-all duration-300"
            >
              {isCurrent && (
                <circle cx={node.x} cy={node.y} r="8" fill="none" stroke={color} strokeWidth="0.5" opacity="0.5">
                  <animate attributeName="r" from="4" to="12" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              <circle 
                cx={node.x} cy={node.y} 
                r={isHovered ? 3 : 2} 
                fill={isCurrent ? '#ffffff' : '#0f172a'} 
                stroke={color} 
                strokeWidth={isHovered ? 0.8 : 0.5}
                filter="url(#glow-map)"
              />
              
              {isHovered && (
                 <text x={node.x} y={node.y + 6} textAnchor="middle" fontSize="3" fill="#e2e8f0" className="font-cinzel pointer-events-none drop-shadow-md">
                   {node.name}
                 </text>
              )}
            </g>
          );
        })}
      </svg>

      {hoveredNode && (
        <div 
          className="absolute z-50 p-3 bg-slate-900/95 border border-indigo-500/50 rounded-lg shadow-xl backdrop-blur-md pointer-events-none animate-fade-in-up"
          style={{ 
            left: `${hoveredNode.x}%`, 
            top: `${hoveredNode.y}%`,
            transform: 'translate(-50%, -130%)',
            width: '220px'
          }}
        >
            <div className="flex items-center gap-2 mb-1 border-b border-slate-700 pb-1">
                <i className={`${hoveredNode.icon} text-lg text-indigo-400`}></i>
                <h4 className="font-cinzel font-bold text-slate-100 text-sm">{hoveredNode.name}</h4>
            </div>
            <div className="text-[10px] space-y-1">
                <div className="flex justify-between">
                    <span className="text-slate-500">Faction:</span>
                    <span className="text-slate-300">{hoveredNode.faction.split(' ')[1] || 'Neutral'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Risk:</span>
                    <span style={{ color: getRiskColor(hoveredNode.risk) }} className="font-bold">{hoveredNode.risk}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">Genre:</span>
                    <span className="text-indigo-300">{hoveredNode.genre}</span>
                </div>
                <p className="text-slate-400 italic mt-1 leading-tight">{hoveredNode.description}</p>
                <div className="mt-2 text-center text-emerald-400 font-bold animate-pulse">CLICK TO TRAVEL</div>
            </div>
        </div>
      )}
      
      <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-500 bg-black/40 px-2 py-1 rounded">
        SYSTEM: GALACTIC_POS_TRACKING_ACTIVE
      </div>
    </div>
  );
};

export default LoreMapVisualizer;
