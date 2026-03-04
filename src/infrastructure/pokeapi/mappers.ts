import type { PokemonDetail, PokemonSummary } from '@/domain/pokemon/entities';
import type { BaseStats, PokemonAbility, PokemonType } from '@/domain/pokemon/value-objects';
import type { RawPokemonDetailResponse } from './types';

const VALID_POKEMON_TYPES: ReadonlySet<string> = new Set([
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
]);

const STAT_NAME_MAP: Record<string, keyof BaseStats> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  speed: 'speed',
};

export function mapStatName(apiStatName: string): keyof BaseStats | undefined {
  return STAT_NAME_MAP[apiStatName];
}

function capitalise(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function mapBaseStats(raw: RawPokemonDetailResponse): BaseStats {
  const stats: Record<string, number> = {};

  for (const entry of raw.stats) {
    const field = mapStatName(entry.stat.name);
    if (field) {
      stats[field] = Math.max(0, Math.min(255, entry.base_stat));
    }
  }

  return {
    hp: stats.hp ?? 0,
    attack: stats.attack ?? 0,
    defense: stats.defense ?? 0,
    specialAttack: stats.specialAttack ?? 0,
    specialDefense: stats.specialDefense ?? 0,
    speed: stats.speed ?? 0,
  };
}

export function mapRawDetailToPokemonSummary(raw: RawPokemonDetailResponse): PokemonSummary {
  if (!raw.name) {
    throw new Error('Mapping error: Pokémon name is empty');
  }

  return {
    id: { value: raw.id },
    name: raw.name,
    displayName: capitalise(raw.name),
    imageUrl: raw.sprites.front_default,
    baseStats: mapBaseStats(raw),
  };
}

export function mapRawDetailToPokemonDetail(raw: RawPokemonDetailResponse): PokemonDetail {
  const summary = mapRawDetailToPokemonSummary(raw);

  const types: PokemonType[] = raw.types
    .map((t) => t.type.name)
    .filter((name): name is PokemonType => {
      if (!VALID_POKEMON_TYPES.has(name)) {
        console.error(`[mapper] Unknown Pokémon type filtered: "${name}" for ${raw.name}`);
        return false;
      }
      return true;
    });

  const abilities: PokemonAbility[] = raw.abilities
    .filter((a) => a.ability.name)
    .map((a) => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
    }));

  return {
    ...summary,
    types,
    abilities,
    heightDecimetres: raw.height,
    weightHectograms: raw.weight,
  };
}
