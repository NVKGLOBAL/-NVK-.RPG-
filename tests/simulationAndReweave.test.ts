import { describe, it, expect } from 'vitest';
import {
  calculateEntropyCost,
  generateTraitPreview,
  reweaveGlyph,
} from '../lib/reweaveLogic';
import type { GlyphMutationNode, MarketItemType } from '../types';

describe('Glyph Reweaving & Duel Inventory Compatibility', () => {
  const rootAlpha: GlyphMutationNode = {
    id: 'root-alpha',
    glyphId: 'G-ALPHA',
    label: 'Seed of Whispers',
    traits: ['Mnemonic', 'Entropic Seed'],
    entropyLevel: 0.4,
    agentInfluences: ['Loom Oracle'],
    timestamp: 1700000000000,
  };

  it('produces deterministic special-case trait mutations and costs for Seed of Whispers + AXIOM_Ω', () => {
    expect(generateTraitPreview(rootAlpha, 'AXIOM_Ω')).toEqual([
      'Ω-Bound',
      'Mirror Essence',
      'Stable Core',
    ]);
    expect(calculateEntropyCost(rootAlpha, 'AXIOM_Ω')).toBe(0.054);
  });

  it('executes reweaveGlyph and returns a RewovenGlyph record with negative entropy delta', async () => {
    const traits = generateTraitPreview(rootAlpha, 'AXIOM_Ω');
    const result = await reweaveGlyph(rootAlpha, 'AXIOM_Ω', traits);

    expect(result.baseGlyphId).toBe('root-alpha');
    expect(result.boundAxiomKey).toBe('AXIOM_Ω');
    expect(result.mutatedTraits).toEqual(traits);
    expect(result.entropyChange).toBe(-0.054);
    expect(result.resonanceSignature).toEqual([88.3, 92.7, 101.5]);
  });

  it('validates MarketItemType categories used by Protocol Duel combat deck', () => {
    const combatTypes: MarketItemType[] = ['Weapon', 'Armor', 'Construct', 'Companion', 'Relic'];
    expect(combatTypes).toContain('Armor');
    expect(combatTypes).toContain('Construct');
    expect(combatTypes).toContain('Weapon');
  });
});
