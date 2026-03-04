import { describe, expect, it } from 'vitest';
import { mapRawDetailToPokemonSummary } from '@/infrastructure/pokeapi/mappers';
import type { RawPokemonDetailResponse } from '@/infrastructure/pokeapi/types';

const validRaw: RawPokemonDetailResponse = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  sprites: { front_default: 'https://example.com/pikachu.png' },
  types: [{ slot: 1, type: { name: 'electric' } }],
  abilities: [{ ability: { name: 'static' }, is_hidden: false, slot: 1 }],
  stats: [
    { base_stat: 35, stat: { name: 'hp' } },
    { base_stat: 55, stat: { name: 'attack' } },
    { base_stat: 40, stat: { name: 'defense' } },
    { base_stat: 50, stat: { name: 'special-attack' } },
    { base_stat: 50, stat: { name: 'special-defense' } },
    { base_stat: 90, stat: { name: 'speed' } },
  ],
};

describe('PokemonSummary entity invariants', () => {
  it('has a non-empty name', () => {
    const summary = mapRawDetailToPokemonSummary(validRaw);
    expect(summary.name).toBe('pikachu');
    expect(summary.name.length).toBeGreaterThan(0);
  });

  it('has all 6 BaseStats fields present', () => {
    const summary = mapRawDetailToPokemonSummary(validRaw);
    expect(summary.baseStats).toHaveProperty('hp');
    expect(summary.baseStats).toHaveProperty('attack');
    expect(summary.baseStats).toHaveProperty('defense');
    expect(summary.baseStats).toHaveProperty('specialAttack');
    expect(summary.baseStats).toHaveProperty('specialDefense');
    expect(summary.baseStats).toHaveProperty('speed');
  });

  it('has PokemonId as a positive integer', () => {
    const summary = mapRawDetailToPokemonSummary(validRaw);
    expect(summary.id.value).toBe(25);
    expect(summary.id.value).toBeGreaterThan(0);
  });

  it('rejects empty name', () => {
    const raw = { ...validRaw, name: '' };
    expect(() => mapRawDetailToPokemonSummary(raw)).toThrow();
  });
});
