import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { integrationRegistry } from '../src/integrations/nvk/IntegrationRegistry';
import { knowledgeBridge } from '../src/integrations/nvk/KnowledgeBridge';
import { codexaBridge } from '../src/integrations/nvk/CodexaBridge';
import { identityBridge } from '../src/integrations/nvk/IdentityBridge';
import { offlineQueue } from '../src/integrations/nvk/OfflineQueue';
import { driftDB } from '../db';
import {
  ArtifactRarity,
  MarketItemType,
  SeekerAuraColor,
  SeekerAvatarType,
  SeekerClass,
  SeekerEnergyAlignment,
  SeekerGender,
  SeekerVisualFilter,
  type SeekerProfile,
} from '../types';

const testProfile: SeekerProfile = {
  id: 'seeker-test-1',
  generatedAt: Date.now(),
  level: 5,
  experience: 600,
  flux: 750,
  inventory: [
    {
      id: 'inv-1',
      name: 'Aether Blade',
      type: 'Weapon',
      rarity: ArtifactRarity.Legendary,
      cost: 300,
      description: 'Quantum sharpened blade',
      visualPromptMod: 'aether blade',
      icon: 'ri-sword-line',
    },
  ],
  selfTraits: ['Resilient', 'Focused'],
  codexTraits: ['Gatewalker'],
  name: 'Vaelen',
  race: SeekerAvatarType.Human,
  class: SeekerClass.Gatewalker,
  gender: SeekerGender.NonBinary,
  energyAlignment: SeekerEnergyAlignment.Harmonic,
  auraColor: SeekerAuraColor.Golden,
  auraSecondaryColor: SeekerAuraColor.Violet,
  visualFilter: SeekerVisualFilter.Cyberpunk,
  bio: 'Tested seeker profile in integration suite.',
};

describe('NVK Phase II Sovereign Integration Suite', () => {
  it('evaluates connection health and capabilities without network failure', async () => {
    const health = await integrationRegistry.getSystemHealth();
    expect(health).toBeDefined();
    expect(health.checkedAt).toBeLessThanOrEqual(Date.now());

    const caps = integrationRegistry.getCapabilities();
    expect(caps.supportsText).toBe(true);
    expect(caps.supportsStreaming).toBe(true);
  });

  it('queues operations offline and persists via OfflineQueue and Dexie kvStore', async () => {
    await offlineQueue.enqueue('nexus_event', { topic: 'seeker.updated', payload: { id: 'test' } });
    const queue = await offlineQueue.getQueue();
    expect(queue.length).toBeGreaterThan(0);
    expect(queue[0].type).toBe('nexus_event');

    await offlineQueue.remove(queue[0].id);
    const remaining = await offlineQueue.getQueue();
    expect(remaining.length).toBe(0);
  });

  it('synchronizes Seeker profiles into NVK Knowledge Cards', async () => {
    const card = knowledgeBridge.convertProfileToCard(testProfile, [testProfile], ['seeker-test-1']);
    expect(card.id).toBe('seeker-test-1');
    expect(card.title).toBe('Vaelen');
    expect(card.metrics.level).toBe(5);
    expect(card.tags).toContain('Gatewalker');
  });

  it('performs Codexa inference via local-procedural fallback or active adapter', async () => {
    const res = await codexaBridge.infer({
      requestId: 'req-1',
      capability: 'text',
      prompt: 'Summarize axiom stability',
      systemInstruction: 'Be concise.',
    });
    expect(res.receipt).toBeDefined();
    expect(res.outputText).toBeDefined();
    expect(res.outputText?.length).toBeGreaterThan(0);
  });

  it('establishes identity sessions and enforces permission checks in IdentityBridge', () => {
    const session = identityBridge.establishSession(testProfile, ['all_modules']);
    expect(session.identity.displayName).toBe('Vaelen');
    expect(identityBridge.hasPermission('card_book')).toBe(true);
    expect(identityBridge.hasPermission('restricted_admin')).toBe(true);

    identityBridge.clearSession();
    expect(identityBridge.getSession()).toBeNull();
    expect(identityBridge.hasPermission('card_book')).toBe(false);
  });
});
