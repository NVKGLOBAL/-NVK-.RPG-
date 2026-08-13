import React, { useState, useEffect, useCallback } from 'react';
import AgentSimulationGrid from '../center-column/AgentSimulationGrid';
import AgentInspectorPanel from './AgentInspectorPanel';
import { generateInitialGrid, generateInitialAgents, performRitualMove, updateCellEntropy } from '../../lib/simulationUtils';
import { processAgentInteractions } from '../../lib/agentEngine';
import type { AgentNode, SimulationGrid } from '../../types';

interface AgentSimulationPanelProps {
  currentEntropy: number;
  negentropyLevel: number;
  addEchoMessage: (source: string, text: string, colorClass?: string) => void;
  onCommunicate: (agent: AgentNode) => void;
}

const AgentSimulationPanel: React.FC<AgentSimulationPanelProps> = ({ currentEntropy, negentropyLevel, addEchoMessage, onCommunicate }) => {
  const [grid, setGrid] = useState<SimulationGrid>([]);
  const [agents, setAgents] = useState<AgentNode[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentNode | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);

  useEffect(() => {
    setGrid(generateInitialGrid());
    setAgents(generateInitialAgents());
  }, []);

  useEffect(() => {
    if (!isSimulating || agents.length === 0 || grid.length === 0) return;

    const simulationInterval = setInterval(() => {
      setAgents(prevAgents => {
        // 1. Movement
        let movedAgents = prevAgents.map(agent => performRitualMove(agent, grid));
        
        // 2. Interactions
        movedAgents = processAgentInteractions(movedAgents, currentEntropy, negentropyLevel);
        
        // Update selected agent if it exists
        if (selectedAgent) {
          const updatedSelected = movedAgents.find(a => a.id === selectedAgent.id);
          if (updatedSelected) setSelectedAgent(updatedSelected);
        }

        return movedAgents;
      });

      setGrid(prevGrid => {
        return prevGrid.map(row => 
          row.map(cell => ({
            ...cell,
            entropy: updateCellEntropy(cell, agents)
          }))
        );
      });
    }, 2000); // Tick every 2 seconds

    return () => clearInterval(simulationInterval);
  }, [isSimulating, grid, agents, currentEntropy, negentropyLevel, selectedAgent]);

  const handleAgentClick = useCallback((agent: AgentNode) => {
    setSelectedAgent(agent);
    addEchoMessage('System', `Inspecting Agent: ${agent.name}`, 'text-indigo-400');
  }, [addEchoMessage]);

  return (
    <div className="relative w-full">
      <div className="flex justify-end items-center mb-2">
        <button 
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-3 py-1 rounded text-xs font-mono border transition-colors ${isSimulating ? 'bg-rose-900/30 border-rose-700 text-rose-300 hover:bg-rose-900/50' : 'bg-emerald-900/30 border-emerald-700 text-emerald-300 hover:bg-emerald-900/50'}`}
        >
          {isSimulating ? 'HALT SIMULATION' : 'RESUME SIMULATION'}
        </button>
      </div>
      
      <AgentSimulationGrid 
        grid={grid} 
        agents={agents} 
        currentEntropy={currentEntropy} 
        onAgentClick={handleAgentClick} 
      />

      {selectedAgent && (
        <AgentInspectorPanel 
          agent={selectedAgent} 
          onClose={() => setSelectedAgent(null)} 
          onCommunicate={onCommunicate}
        />
      )}
    </div>
  );
};

export default AgentSimulationPanel;
