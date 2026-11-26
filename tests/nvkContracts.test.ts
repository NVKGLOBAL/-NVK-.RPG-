import { describe, it, expect } from 'vitest';
import { seekerToKnowledgeCard, toNvkIdentityProfile } from '../lib/nvk/contracts';
import {
  ArtifactRarity,
  AgentFaction,
  SeekerAuraColor,
  SeekerAvatarType,
  SeekerClass,
  SeekerEnergyAlignment,
  SeekerGender,
  SeekerVisualFilter,
  type SeekerProfile,
} from '../types';

const makeSeeker = (overrides: Partial<SeekerProfile>): SeekerProfile => ({
  id: 's-1',
  generatedAt: 1700000000000,
  level: 4,
  experience: 400,
  flux: 500,
  inventory: [],
  selfTraits: ['Analytical'],
  codexTraits: ['Seeker'],
  name: 'Orin',
  race: SeekerAvatarType.Android,
  class: SeekerClass.SignalArchitect,
  gender: SeekerGender.NonBinary,
  energyAlignment: SeekerEnergyAlignment.Harmonic,
  auraColor: SeekerAuraColor.Cyan,
  auraSecondaryColor: SeekerAuraColor.Azure,
  visualFilter: SeekerVisualFilter.Cyberpunk,
  bio: 'Architect of signal coherence.',
  ...overrides,
});

describe('NVK Ecosystem Integration Contracts', () => {
  it('converts SeekerProfile to NvkKnowledgeCard with party-ally, faction-kin, and equipped-relic relationships', () => {
    const prime = makeSeeker({
      id: 'prime',
      name: 'Orin',
      faction: AgentFaction.TrisophianSynod,
      equippedWeapon: {
        id: 'wpn-1',
        name: 'Vector Wand',
        type: 'Weapon',
        rarity: ArtifactRarity.Legendary,
        cost: 500,
        description: 'Focus tool',
        visualPromptMod: 'vector wand',
        icon: 'ri-magic-line',
      },
    });
    const ally = makeSeeker({
      id: 'ally-1',
      name: 'Nyx',
      faction: AgentFaction.ChronoDominion,
    });
    const kin = makeSeeker({
      id: 'kin-1',
      name: 'Thal',
      faction: AgentFaction.TrisophianSynod,
    });

    const card = seekerToKnowledgeCard(prime, [prime, ally, kin], ['prime', 'ally-1']);

    expect(card.kind).toBe('seeker-card');
    expect(card.metrics.atk).toBe(45);
    expect(card.tags).toContain('SignalArchitect');
    expect(card.tags).toContain('Analytical');
    expect(card.relationships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ targetId: 'ally-1', relationType: 'party-ally' }),
        expect.objectContaining({ targetId: 'kin-1', relationType: 'faction-kin' }),
        expect.objectContaining({ targetId: 'wpn-1', relationType: 'equipped-relic' }),
      ])
    );
  });

  it('maps wallet presence accurately in toNvkIdentityProfile', () => {
    const localOnly = makeSeeker({ id: 'local-1', name: 'Solo' });
    const withWallet = makeSeeker({
      id: 'web3-1',
      name: 'Signer',
      walletAddress: '0x123400000000000000000000000000000000abcd',
      chainId: 1,
    });

    expect(toNvkIdentityProfile(localOnly).authMode).toBe('local-shard');
    expect(toNvkIdentityProfile(withWallet).authMode).toBe('eip1193-wallet');
    expect(toNvkIdentityProfile(withWallet).chainId).toBe(1);
  });
});
