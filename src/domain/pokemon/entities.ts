import type {
  BaseStats,
  PokemonAbility,
  PokemonId,
  PokemonType,
  SearchQuery,
} from './value-objects';

export type PokemonSummary = {
  readonly id: PokemonId;
  readonly name: string;
  readonly displayName: string;
  readonly imageUrl: string | null;
  readonly baseStats: BaseStats;
};

export type PokemonDetail = PokemonSummary & {
  readonly types: PokemonType[];
  readonly abilities: PokemonAbility[];
  readonly heightDecimetres: number;
  readonly weightHectograms: number;
};

export type PokemonNameEntry = {
  readonly name: string;
  readonly url: string;
};

export type SearchSessionState = {
  readonly searchQuery: SearchQuery;
  readonly selectedPokemon: PokemonId | null;
};

export type PokemonListPage = {
  readonly items: PokemonNameEntry[];
  readonly nextOffset: number | null;
  readonly totalCount: number;
};

export type PokemonSearchPage = {
  readonly items: PokemonSummary[];
  readonly nextPageIndex: number | null;
  readonly totalFilteredCount: number;
};
