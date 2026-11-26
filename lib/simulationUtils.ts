
import type { GridPoint, AgentNode, TraitSimulationCell } from '../types';
import { AgentFaction, AgentRace, AgentLineage, AgentTrade } from '../types';
import { GRID_DIMENSIONS } from '../constants';
import { generateProceduralAgent } from './agentEngine';

export type SimulationGrid = TraitSimulationCell[][];

export const generateInitialGrid = (): SimulationGrid => {
  return Array.from({ length: GRID_DIMENSIONS.rows }, (_, y) =>
    Array.from({ length: GRID_DIMENSIONS.cols }, (_, x): TraitSimulationCell => ({
      id: `cell-${x}-${y}`, // Added id to match TraitSimulationCell type
      x,
      y,
      resonanceField: 0.3 + Math.random() * 0.4,
      glyphAffinity: null,
      agentInfluence: {},
      isDisrupted: Math.random() > 0.85,
      entropy: 0.5 + (Math.random() * 0.3 - 0.15)
    }))
  );
};

export const generateInitialAgents = (): AgentNode[] => {
  const AGENT_NAMES = ['Sovereign', 'Nevik', 'Sophia', 'Orion', 'Lyra', 'Vega', 'Helix', 'Cipher'];
  return AGENT_NAMES.map((name, i) => {
    const position: GridPoint = [
      Math.floor(Math.random() * GRID_DIMENSIONS.cols),
      Math.floor(Math.random() * GRID_DIMENSIONS.rows)
    ];
    const agent = generateProceduralAgent(`agent-${i}`, position);
    agent.name = name; // Override the procedurally generated name with the specific one
    return agent;
  });
};

export const performRitualMove = (agent: AgentNode, grid: SimulationGrid): AgentNode => {
  // 30% chance to move each tick: if random value (0-1) is > 0.3, then 70% of the time agent does NOT move.
  // So, agent moves if random value is <= 0.3 (which is 30% of the time).
  if (Math.random() > 0.3) return agent; 

  const directions: GridPoint[] = [
    [0, 1], [1, 0], [0, -1], [-1, 0], // Cardinal
    [1, 1], [1, -1], [-1, 1], [-1, -1] // Diagonal
  ];

  const [x, y] = agent.position;
  const validMoves = directions
    .map(([dx, dy]): GridPoint => [x + dx, y + dy]) // Ensure GridPoint type
    .filter(([nx, ny]) =>
      nx >= 0 && nx < GRID_DIMENSIONS.cols &&
      ny >= 0 && ny < GRID_DIMENSIONS.rows &&
      grid[ny] && grid[ny][nx] && !grid[ny][nx].isDisrupted // Added checks for grid[ny] and grid[ny][nx]
    );

  if (validMoves.length > 0) {
    return {
      ...agent,
      position: validMoves[Math.floor(Math.random() * validMoves.length)]
    };
  }
  return agent;
};

// Placeholder for updating cell entropy
export const updateCellEntropy = (cell: TraitSimulationCell, agents: AgentNode[]): number => {
  // Basic placeholder: slightly random walk.
  let newEntropy = cell.entropy + (Math.random() - 0.5) * 0.02; // Small random fluctuation
  
  // Example: Nearby "Entropic" agents might increase entropy, "Harmonic" might decrease.
  agents.forEach(agent => {
    if (!agent || !agent.position) return; // Safeguard
    const dist = Math.sqrt(Math.pow(agent.position[0] - cell.x, 2) + Math.pow(agent.position[1] - cell.y, 2));
    if (dist < 3) { // If agent is within 3 cells
      if (agent.traits.includes('Entropic')) {
        newEntropy += 0.01 * (agent.harmony < 0 ? Math.abs(agent.harmony) : 0.1); // More entropic if disharmonious
      } else if (agent.traits.includes('Harmonic')) {
        newEntropy -= 0.01 * (agent.harmony > 0 ? agent.harmony : 0.1); // More harmonizing if harmonious
      }
    }
  });
  
  newEntropy = Math.max(0.05, Math.min(0.95, newEntropy)); // Clamp between 0.05 and 0.95
  return newEntropy;
};
