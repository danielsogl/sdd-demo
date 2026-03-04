export type PokemonId = {
  readonly value: number;
};

export type SearchQuery = {
  readonly raw: string;
  readonly normalised: string;
};

export function createSearchQuery(raw: string): SearchQuery {
  return { raw, normalised: raw.trim().toLowerCase() };
}

export type BaseStats = {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly specialAttack: number;
  readonly specialDefense: number;
  readonly speed: number;
};

export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

export type PokemonAbility = {
  readonly name: string;
  readonly isHidden: boolean;
};

export const QUERY_KEYS = {
  pokemonFullList: ['pokemon', 'full-list'] as const,
  pokemonList: (offset: number) => ['pokemon', 'list', offset] as const,
  pokemonSummary: (name: string) => ['pokemon', 'summary', name] as const,
  pokemonDetail: (name: string) => ['pokemon', 'detail', name] as const,
} as const;
