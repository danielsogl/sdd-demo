/**
 * Domain Interface Contracts
 * Pokémon Search & Exploration SPA — Feature 001
 *
 * These TypeScript types define the agreed domain layer contracts.
 * No implementation may diverge from these types without updating this file
 * and the corresponding pokeapi-v2.md contract document.
 *
 * @module contracts/domain-interfaces
 */

// ─── Constants ────────────────────────────────────────────────────────────────

export const SEARCH_DEBOUNCE_MS = 500;
export const POKEMON_PAGE_SIZE = 20;
export const POKEMON_FULL_LIST_LIMIT = 10_000;
export const POKEMON_MAX_STAT_VALUE = 255;

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  pokemonFullList: ['pokemon', 'full-list'] as const,
  pokemonList: (offset: number) => ['pokemon', 'list', offset] as const,
  pokemonDetail: (name: string) => ['pokemon', 'detail', name] as const,
} as const;

// ─── Value Objects ────────────────────────────────────────────────────────────

/**
 * Wraps the numeric PokeAPI Pokémon identifier.
 * Prevents accidental use of raw numbers as IDs.
 */
export type PokemonId = {
  readonly value: number; // positive integer
};

/**
 * Represents a normalised search input.
 * `normalised` is always trimmed and lowercased.
 * Empty `normalised` string means browse mode (no active search).
 */
export type SearchQuery = {
  readonly raw: string;
  readonly normalised: string;
};

/**
 * Factory for SearchQuery — enforces normalisation invariant.
 */
export function createSearchQuery(raw: string): SearchQuery {
  return { raw, normalised: raw.trim().toLowerCase() };
}

/**
 * All six canonical Pokémon base stats as a single value object.
 * All values are non-negative integers (0–255).
 */
export type BaseStats = {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly specialAttack: number;
  readonly specialDefense: number;
  readonly speed: number;
};

/**
 * Valid Pokémon type names from PokeAPI v2.
 * Unknown types from the API are filtered at the mapper boundary.
 */
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

/**
 * Represents a single Pokémon ability.
 */
export type PokemonAbility = {
  readonly name: string;
  readonly isHidden: boolean;
};

// ─── Entities ────────────────────────────────────────────────────────────────

/**
 * Represents one Pokémon in list/card context.
 * Populated from the PokeAPI individual detail endpoint.
 */
export type PokemonSummary = {
  readonly id: PokemonId;
  readonly name: string; // lowercase hyphenated, e.g. "bulbasaur", "mr-mime"
  readonly displayName: string; // capitalised for UI display
  readonly imageUrl: string | null; // null for some alternate forms
  readonly baseStats: BaseStats;
};

/**
 * Extends PokemonSummary with complete profile data for the detail modal.
 * Cached from the same PokeAPI detail endpoint — no duplicate network request.
 */
export type PokemonDetail = PokemonSummary & {
  readonly types: PokemonType[]; // 1–2 types
  readonly abilities: PokemonAbility[]; // 1–3 abilities
  readonly heightDecimetres: number; // PokeAPI unit; display as / 10 metres
  readonly weightHectograms: number; // PokeAPI unit; display as / 10 kg
};

/**
 * Lightweight record from the full name list.
 * Used as the client-side search index only — never rendered directly.
 */
export type PokemonNameEntry = {
  readonly name: string;
  readonly url: string;
};

// ─── State ───────────────────────────────────────────────────────────────────

/**
 * UI session state for the Pokémon Discovery page.
 * Drives which TanStack Query hooks are active.
 * Not persisted.
 */
export type SearchSessionState = {
  readonly searchQuery: SearchQuery;
  readonly selectedPokemon: PokemonId | null; // null = detail modal closed
};

// ─── Pagination ───────────────────────────────────────────────────────────────

/**
 * Shape of a single page returned by the browse-mode infinite query.
 */
export type PokemonListPage = {
  readonly items: PokemonNameEntry[];
  readonly nextOffset: number | null; // null = last page
  readonly totalCount: number;
};

/**
 * Shape of a single page returned by the search-mode infinite query.
 */
export type PokemonSearchPage = {
  readonly items: PokemonSummary[];
  readonly nextPageIndex: number | null; // null = last page
  readonly totalFilteredCount: number;
};

// ─── Infrastructure (PokeAPI raw types) ──────────────────────────────────────
// Raw PokeAPI types live in src/infrastructure/pokeapi/types.ts.
// They MUST NOT appear outside the infrastructure layer.
// The mapper is the only bridge between raw types and domain types.
