import { describe, expect, it } from 'vitest';
import {
  mapRawDetailToPokemonDetail,
  mapRawDetailToPokemonSummary,
  mapStatName,
} from '@/infrastructure/pokeapi/mappers';
import type { RawPokemonDetailResponse } from '@/infrastructure/pokeapi/types';

const mockRawDetail: RawPokemonDetailResponse = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  sprites: {
    front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
  },
  types: [
    { slot: 1, type: { name: 'grass' } },
    { slot: 2, type: { name: 'poison' } },
  ],
  abilities: [
    { ability: { name: 'overgrow' }, is_hidden: false, slot: 1 },
    { ability: { name: 'chlorophyll' }, is_hidden: true, slot: 3 },
  ],
  stats: [
    { base_stat: 45, stat: { name: 'hp' } },
    { base_stat: 49, stat: { name: 'attack' } },
    { base_stat: 49, stat: { name: 'defense' } },
    { base_stat: 65, stat: { name: 'special-attack' } },
    { base_stat: 65, stat: { name: 'special-defense' } },
    { base_stat: 45, stat: { name: 'speed' } },
  ],
};

describe('mapStatName', () => {
  it('maps hp to hp', () => {
    expect(mapStatName('hp')).toBe('hp');
  });
  it('maps attack to attack', () => {
    expect(mapStatName('attack')).toBe('attack');
  });
  it('maps defense to defense', () => {
    expect(mapStatName('defense')).toBe('defense');
  });
  it('maps special-attack to specialAttack', () => {
    expect(mapStatName('special-attack')).toBe('specialAttack');
  });
  it('maps special-defense to specialDefense', () => {
    expect(mapStatName('special-defense')).toBe('specialDefense');
  });
  it('maps speed to speed', () => {
    expect(mapStatName('speed')).toBe('speed');
  });
  it('returns undefined for unknown stat names', () => {
    expect(mapStatName('unknown-stat')).toBeUndefined();
  });
});

describe('mapRawDetailToPokemonSummary', () => {
  it('maps all six stat names correctly', () => {
    const summary = mapRawDetailToPokemonSummary(mockRawDetail);
    expect(summary.baseStats).toEqual({
      hp: 45,
      attack: 49,
      defense: 49,
      specialAttack: 65,
      specialDefense: 65,
      speed: 45,
    });
  });

  it('sets displayName to capitalised name', () => {
    const summary = mapRawDetailToPokemonSummary(mockRawDetail);
    expect(summary.displayName).toBe('Bulbasaur');
  });

  it('handles null imageUrl', () => {
    const raw = { ...mockRawDetail, sprites: { front_default: null } };
    const summary = mapRawDetailToPokemonSummary(raw);
    expect(summary.imageUrl).toBeNull();
  });

  it('throws on empty name', () => {
    const raw = { ...mockRawDetail, name: '' };
    expect(() => mapRawDetailToPokemonSummary(raw)).toThrow('Mapping error');
  });

  it('clamps out-of-range stat values', () => {
    const raw = {
      ...mockRawDetail,
      stats: [
        { base_stat: 300, stat: { name: 'hp' } },
        { base_stat: -5, stat: { name: 'attack' } },
        { base_stat: 49, stat: { name: 'defense' } },
        { base_stat: 65, stat: { name: 'special-attack' } },
        { base_stat: 65, stat: { name: 'special-defense' } },
        { base_stat: 45, stat: { name: 'speed' } },
      ],
    };
    const summary = mapRawDetailToPokemonSummary(raw);
    expect(summary.baseStats.hp).toBe(255);
    expect(summary.baseStats.attack).toBe(0);
  });
});

describe('mapRawDetailToPokemonDetail', () => {
  it('maps types correctly', () => {
    const detail = mapRawDetailToPokemonDetail(mockRawDetail);
    expect(detail.types).toEqual(['grass', 'poison']);
  });

  it('filters invalid types', () => {
    const raw = {
      ...mockRawDetail,
      types: [
        { slot: 1, type: { name: 'grass' } },
        { slot: 2, type: { name: 'unknown-type' } },
      ],
    };
    const detail = mapRawDetailToPokemonDetail(raw);
    expect(detail.types).toEqual(['grass']);
  });

  it('maps abilities with isHidden flag', () => {
    const detail = mapRawDetailToPokemonDetail(mockRawDetail);
    expect(detail.abilities).toEqual([
      { name: 'overgrow', isHidden: false },
      { name: 'chlorophyll', isHidden: true },
    ]);
  });

  it('maps height and weight', () => {
    const detail = mapRawDetailToPokemonDetail(mockRawDetail);
    expect(detail.heightDecimetres).toBe(7);
    expect(detail.weightHectograms).toBe(69);
  });
});
