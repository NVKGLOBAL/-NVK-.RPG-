
import { 
  AgentNode, AgentStats, AgentRelationships, GridPoint, 
  AgentRace, AgentLineage, AgentTrade, AgentFaction 
} from '../types';
import { ALL_RACES_LIST, ALL_LINEAGES_LIST, ALL_TRADES_LIST, ALL_FACTIONS_LIST, TRAIT_LISTS } from '../constants';

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateStats = (): AgentStats => ({
  cognition: Math.random(),
  vitality: Math.random(),
  aether: Math.random(),
  presence: Math.random(),
  paradox: Math.random(),
  will: Math.random(),
  resonance: Math.random(),
  chaosStability: Math.random(),
});

export const generateProceduralAgent = (id: string, position: GridPoint): AgentNode => {
  const race = getRandomElement(ALL_RACES_LIST) as AgentRace;
  const lineage = getRandomElement(ALL_LINEAGES_LIST) as AgentLineage;
  const trade = getRandomElement(ALL_TRADES_LIST) as AgentTrade;
  // Simple logic to pick a faction, maybe based on race later, for now random but weighted could be cool
  const faction = getRandomElement(ALL_FACTIONS_LIST) as AgentFaction; 
  
  const traits: string[] = [];
  for (let i = 0; i < 3; i++) traits.push(getRandomElement(TRAIT_LISTS.self));
  
  const codexTraits: string[] = [];
  for (let i = 0; i < 2; i++) codexTraits.push(getRandomElement(TRAIT_LISTS.codex));

  const stats = generateStats();

  // Basic color mapping based on Faction for visual distinction
  let color = '#FFFFFF';
  switch (faction) {
    case AgentFaction.TrisophianSynod: color = '#38bdf8'; break; // Sky blue
    case AgentFaction.ObsidianChoir: color = '#475569'; break; // Slate
    case AgentFaction.ChronoDominion: color = '#fbbf24'; break; // Amber
    case AgentFaction.VoidChorus: color = '#a855f7'; break; // Purple
    case AgentFaction.AxiomForgeGuild: color = '#f97316'; break; // Orange
    case AgentFaction.SolarContinuum: color = '#facc15'; break; // Yellow
    case AgentFaction.DreamshellCollective: color = '#ec4899'; break; // Pink
    default: color = '#94a3b8'; // Neutral
  }

  return {
    id,
    name: `Agent ${id.split('-')[1]}`, // Simplified name
    race,
    lineage,
    trade,
    faction,
    traits: Array.from(new Set(traits)), // Unique traits
    codexTraits: Array.from(new Set(codexTraits)),
    stats,
    relationships: { allies: [], rivals: [], neutral: [] },
    harmony: (stats.resonance + stats.chaosStability) / 2, // Derived harmony
    position,
    active: true,
    pulsePhase: Math.random() * Math.PI * 2,
    color,
    icon: 'ri-user-line' // Could map icon to Trade later
  };
};

export const calculateAffinity = (agentA: AgentNode, agentB: AgentNode): number => {
  let score = 0;

  // Faction Alignment
  if (agentA.faction === agentB.faction) {
    score += 0.5;
  } else if (
    (agentA.faction === AgentFaction.TrisophianSynod && agentB.faction === AgentFaction.VoidChorus) ||
    (agentA.faction === AgentFaction.VoidChorus && agentB.faction === AgentFaction.TrisophianSynod)
  ) {
    score -= 0.6; // Opposing factions
  }
  
  // Lineage Resonance
  if (agentA.lineage === agentB.lineage) score += 0.3;
  // Specific Lineage Paradoxes
  if ((agentA.lineage === AgentLineage.VoidTouched && agentB.lineage === AgentLineage.LuminousPrecursor) ||
      (agentB.lineage === AgentLineage.VoidTouched && agentA.lineage === AgentLineage.LuminousPrecursor)) {
      score -= 0.8; // High paradox chance
  }

  // Trade Synergies
  if (
    (agentA.trade === AgentTrade.Weaver && agentB.trade === AgentTrade.Architect) ||
    (agentB.trade === AgentTrade.Weaver && agentA.trade === AgentTrade.Architect)
  ) {
    score += 0.4; // Complementary trades
  }
  if (agentA.trade === agentB.trade) {
    score += 0.2; // Shared trade understanding
  }

  // Trait Synergy
  const sharedTraits = agentA.traits.filter(t => agentB.traits.includes(t));
  score += sharedTraits.length * 0.15;

  // Stat Compatibility
  const resonanceDiff = Math.abs(agentA.stats.resonance - agentB.stats.resonance);
  if (resonanceDiff < 0.1) score += 0.3;
  else if (resonanceDiff > 0.5) score -= 0.2;

  const paradoxDiff = Math.abs(agentA.stats.paradox - agentB.stats.paradox);
  if (paradoxDiff > 0.6) score -= 0.4; // High paradox difference causes friction

  // Harmony resonance
  const harmonyDiff = Math.abs(agentA.harmony - agentB.harmony);
  if (harmonyDiff < 0.2) score += 0.2;

  return score;
};

export const processAgentInteractions = (agents: AgentNode[], currentEntropy: number = 0.5, negentropy: number = 0.5): AgentNode[] => {
  const updatedAgents = [...agents];
  
  // Simple O(N^2) for demo purposes, optimize with spatial partitioning if N > 500
  for (let i = 0; i < updatedAgents.length; i++) {
    for (let j = i + 1; j < updatedAgents.length; j++) {
      const a = updatedAgents[i];
      const b = updatedAgents[j];
      
      // Check distance (interaction range)
      const dist = Math.sqrt(Math.pow(a.position[0] - b.position[0], 2) + Math.pow(a.position[1] - b.position[1], 2));
      
      // Entropy increases interaction range randomly, negentropy stabilizes it
      const effectiveRange = 2 + (currentEntropy * Math.random() * 2) - (negentropy * 0.5);

      if (dist < effectiveRange) { // Adjacent or same cell
        // Entropy adds noise to affinity, negentropy reinforces existing traits
        const rawAffinity = calculateAffinity(a, b);
        const affinityNoise = (Math.random() - 0.5) * currentEntropy * 2;
        const affinity = rawAffinity + affinityNoise + (negentropy * 0.2);
        
        const timestamp = Date.now();
        
        // Define Relationship Update Logic
        const updateRelationship = (agent: AgentNode, targetId: string, aff: number) => {
            const rels = { ...agent.relationships };
            // Clear previous status
            rels.allies = rels.allies.filter(id => id !== targetId);
            rels.rivals = rels.rivals.filter(id => id !== targetId);
            rels.neutral = rels.neutral.filter(id => id !== targetId);

            let type: 'Synergy' | 'Paradox' | 'Neutral' = 'Neutral';
            // Thresholds shift based on entropy
            const synergyThreshold = 0.6 + (currentEntropy * 0.2);
            const paradoxThreshold = -0.2 - (currentEntropy * 0.2);

            if (aff > synergyThreshold) {
                rels.allies.push(targetId);
                type = 'Synergy';
            } else if (aff < paradoxThreshold) {
                rels.rivals.push(targetId);
                type = 'Paradox';
            } else {
                rels.neutral.push(targetId);
            }
            
            rels.lastInteraction = {
                agentId: targetId,
                type,
                description: type === 'Synergy' ? 'Harmonic Resonance' : (type === 'Paradox' ? 'Dissonant Clash' : 'Passing Observation'),
                timestamp
            };
            return rels;
        };

        updatedAgents[i] = { ...a, relationships: updateRelationship(a, b.id, affinity) };
        updatedAgents[j] = { ...b, relationships: updateRelationship(b, a.id, affinity) };
      }
    }
  }
  return updatedAgents;
};
