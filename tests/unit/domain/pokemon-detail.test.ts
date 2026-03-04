import { describe, expect, it } from 'vitest';
import { mapRawDetailToPokemonDetail } from '@/infrastructure/pokeapi/mappers';
import type { RawPokemonDetailResponse } from '@/infrastructure/pokeapi/types';

const validRaw: RawPokemonDetailResponse = {
  id: 6,
  name: 'charizard',
  height: 17,
  weight: 905,
  sprites: { front_default: 'https://example.com/charizard.png' },
  types: [
    { slot: 1, type: { name: 'fire' } },
    { slot: 2, type: { name: 'flying' } },
  ],
  abilities: [
    { ability: { name: 'blaze' }, is_hidden: false, slot: 1 },
    { ability: { name: 'solar-power' }, is_hidden: true, slot: 3 },
  ],
  stats: [
    { base_stat: 78, stat: { name: 'hp' } },
    { base_stat: 84, stat: { name: 'attack' } },
    { base_stat: 78, stat: { name: 'defense' } },
    { base_stat: 109, stat: { name: 'special-attack' } },
    { base_stat: 85, stat: { name: 'special-defense' } },
    { base_stat: 100, stat: { name: 'speed' } },
  ],
};

describe('PokemonDetail entity', () => {
  it('maps types as 1-2 entries', () => {
    const detail = mapRawDetailToPokemonDetail(validRaw);
    expect(detail.types).toHaveLength(2);
    expect(detail.types).toEqual(['fire', 'flying']);
  });

  it('maps abilities with isHidden correctly', () => {
    const detail = mapRawDetailToPokemonDetail(validRaw);
    expect(detail.abilities).toHaveLength(2);
    expect(detail.abilities[0]).toEqual({ name: 'blaze', isHidden: false });
    expect(detail.abilities[1]).toEqual({ name: 'solar-power', isHidden: true });
  });

  it('maps height and weight', () => {
    const detail = mapRawDetailToPokemonDetail(validRaw);
    expect(detail.heightDecimetres).toBe(17);
    expect(detail.weightHectograms).toBe(905);
  });

  it('maps all base stats', () => {
    const detail = mapRawDetailToPokemonDetail(validRaw);
    expect(detail.baseStats.hp).toBe(78);
    expect(detail.baseStats.attack).toBe(84);
    expect(detail.baseStats.speed).toBe(100);
  });

  it('handles single type Pokémon', () => {
    const raw = {
      ...validRaw,
      types: [{ slot: 1, type: { name: 'fire' } }],
    };
    const detail = mapRawDetailToPokemonDetail(raw);
    expect(detail.types).toHaveLength(1);
  });
});
