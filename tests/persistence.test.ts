import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { buildSnapshotForTargets } from '../hooks/useCodexPersistence';
import { driftDB } from '../db';
import { validateGameSave, validateSeekerShard, sanitizeImageUrl } from '../lib/nvk/contracts';
import {
  ArtifactRarity,
  SeekerAuraColor,
  SeekerAvatarType,
  SeekerClass,
  SeekerEnergyAlignment,
  SeekerGender,
  SeekerVisualFilter,
  type SeekerProfile,
} from '../types';

const makeProfile = (id: string, name: string): SeekerProfile => ({
  id,
  generatedAt: 1700000000000,
  level: 3,
  experience: 250,
  flux: 420,
  inventory: [
    {
      id: 'item-1',
      name: 'Obsidian Blade',
      type: 'Weapon',
      rarity: ArtifactRarity.Rare,
      cost: 100,
      description: 'Harmonic edge',
      visualPromptMod: 'obsidian blade',
      icon: 'ri-sword-line',
    },
  ],
  selfTraits: ['Calibrated', 'Observant'],
  codexTraits: ['Seeker'],
  name,
  race: SeekerAvatarType.Human,
  class: SeekerClass.Gatewalker,
  gender: SeekerGender.NonBinary,
  energyAlignment: SeekerEnergyAlignment.Balanced,
  auraColor: SeekerAuraColor.Azure,
  auraSecondaryColor: SeekerAuraColor.Violet,
  visualFilter: SeekerVisualFilter.Standard,
  avatarImageUrl: 'data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C/svg%3E',
  bio: 'Keeper of the first gate.',
});

describe('Chronicle Persistence & Security Validators', () => {
  it('buildSnapshotForTargets preserves AllProfiles and PartyIds alongside ActiveProfile', () => {
    const p1 = makeProfile('p1', 'Kaelen');
    const p2 = makeProfile('p2', 'Lyra');

    const snapshot = buildSnapshotForTargets(
      ['ActiveProfile', 'AllProfiles', 'PartyIds', 'SystemEntropy'],
      {
        activeProfile: p1,
        allProfiles: [p1, p2],
        partyIds: ['p1', 'p2'],
        systemEntropy: 0.42,
      }
    );

    expect(snapshot.activeProfile?.id).toBe('p1');
    expect(snapshot.allProfiles).toHaveLength(2);
    expect(snapshot.allProfiles?.map((p) => p.name)).toEqual(['Kaelen', 'Lyra']);
    expect(snapshot.partyIds).toEqual(['p1', 'p2']);
    expect(snapshot.systemEntropy).toBe(0.42);
  });

  it('driftDB persists and loads GameSaveData slots cleanly', async () => {
    const p1 = makeProfile('db-p1', 'Seren');
    await driftDB.saveGameSlot({
      slotId: 'test_slot_1',
      timestamp: 1700000123456,
      previewData: {
        seekerName: p1.name,
        level: p1.level,
        location: 'Aethel-Weft',
        playtime: '00:12:00',
      },
      fullState: {
        activeProfile: p1,
        allProfiles: [p1],
        partyIds: ['db-p1'],
        systemEntropy: 0.25,
      },
    });

    const loaded = await driftDB.loadGameSlot('test_slot_1');
    expect(loaded).toBeDefined();
    expect(loaded?.fullState.allProfiles).toHaveLength(1);
    expect(loaded?.fullState.partyIds).toEqual(['db-p1']);
    expect(loaded?.previewData.seekerName).toBe('Seren');
  });

  it('sanitizeImageUrl rejects dangerous protocols and XSS SVG payloads', () => {
    expect(sanitizeImageUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeImageUrl('vbscript:msgbox(1)')).toBe('');
    expect(sanitizeImageUrl('data:image/svg+xml,<svg onload=alert(1)></svg>')).toBe('');
    expect(sanitizeImageUrl('data:image/svg+xml;utf8,<svg><script>alert(1)</script></svg>')).toBe('');
    expect(sanitizeImageUrl('https://example.com/avatar.png')).toBe('https://example.com/avatar.png');
    expect(sanitizeImageUrl('data:image/png;base64,iVBORw0KGgo=')).toBe('data:image/png;base64,iVBORw0KGgo=');
  });

  it('validateSeekerShard fills missing defaults and strips prototype pollution keys', () => {
    const malicious = JSON.parse(
      '{"name":"Aether","__proto__":{"polluted":true},"avatarImageUrl":"javascript:alert(1)","level":5}'
    );
    const result = validateSeekerShard(malicious);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.profile.name).toBe('Aether');
      expect(result.profile.level).toBe(5);
      expect(result.profile.avatarImageUrl).toBe('');
      expect((Object.prototype as any).polluted).toBeUndefined();
      expect(Object.prototype.hasOwnProperty.call(result.profile, '__proto__')).toBe(false);
    }
  });

  it('validateGameSave accepts structured backups and sanitizes nested profiles', () => {
    const rawSave = {
      slotId: 'slot_1',
      timestamp: 1700000999000,
      fullState: {
        systemEntropy: 1.8,
        allProfiles: [
          {
            id: 's1',
            name: 'Vesper',
            avatarImageUrl: 'javascript:evil()',
          },
        ],
        partyIds: ['s1', 42],
      },
    };

    const result = validateGameSave(rawSave);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.save.fullState.systemEntropy).toBe(1);
      expect(result.save.fullState.allProfiles).toHaveLength(1);
      expect(result.save.fullState.allProfiles?.[0].avatarImageUrl).toBe('');
      expect(result.save.fullState.partyIds).toEqual(['s1']);
    }
  });
});
