# Data Model: Pokémon Search & Exploration SPA

**Branch**: `001-pokemon-search-explorer`
**Phase**: 1 — Design
**Date**: 2026-03-04

---

## Bounded Contexts

### 1. Pokémon Discovery Context

Responsible for: browsing the full Pokémon catalogue, applying debounced search filters, and managing infinite scroll pagination state.

**Aggregates**: none (read-only, no writes)
**Domain services**: `PokemonSearchService` (client-side name list filter)
**Repositories (via TanStack Query)**: `usePokemonFullList`, `usePokemonList`, `useSearchFilteredList`

### 2. Pokémon Profile Context

Responsible for: fetching and displaying a complete Pokémon detail profile in a modal overlay.

**Aggregates**: none (read-only)
**Domain services**: none
**Repositories (via TanStack Query)**: `usePokemonDetail`

---

## Entities

### `PokemonSummary`

Represents one Pokémon in list/card context. Populated from the PokeAPI individual detail endpoint and used for card rendering.

| Field | Type | PokeAPI Source | Notes |
|-------|------|---------------|-------|
| `id` | `PokemonId` | `.id` | Numeric PokeAPI ID |
| `name` | `string` | `.name` | Lowercase, hyphenated (e.g. `bulbasaur`, `mr-mime`) |
| `displayName` | `string` | Derived | Capitalised for UI display |
| `imageUrl` | `string \| null` | `.sprites.front_default` | `null` for some alternate forms |
| `baseStats` | `BaseStats` | `.stats[]` | All 6 canonical stats (see value object) |

**Invariants**:
- `name` must be a non-empty string.
- `baseStats` must contain all 6 stat entries.

---

### `PokemonDetail`

Extends `PokemonSummary` with complete profile information, displayed in the detail modal.

| Field | Type | PokeAPI Source | Notes |
|-------|------|---------------|-------|
| *(all `PokemonSummary` fields)* | | | |
| `types` | `PokemonType[]` | `.types[].type.name` | 1–2 types per Pokémon |
| `abilities` | `PokemonAbility[]` | `.abilities[]` | 1–3 abilities |
| `heightDecimetres` | `number` | `.height` | PokeAPI unit: decimetres |
| `weightHectograms` | `number` | `.weight` | PokeAPI unit: hectograms |

**Derived display values** (computed in components, not stored):
- Height in metres: `heightDecimetres / 10`
- Weight in kg: `weightHectograms / 10`

**Note**: The detail endpoint response is a superset of summary data. Fetching detail for a card is cached by TanStack Query under key `['pokemon', 'detail', name]` — opening the modal re-uses the same cached entry without a second request.

---

### `PokemonNameEntry`

Lightweight record from the full name list. Used as the search index only — never rendered directly.

| Field | Type | PokeAPI Source |
|-------|------|---------------|
| `name` | `string` | `.results[].name` |
| `url` | `string` | `.results[].url` |

---

## Value Objects

### `PokemonId`

Wraps the numeric PokeAPI Pokémon identifier. Prevents accidental use of raw numbers as IDs.

```typescript
type PokemonId = { readonly value: number }
// Constructor: { value: number } where value > 0
```

**Invariants**: `value` is a positive integer.

---

### `SearchQuery`

Represents the current search input after normalisation. Encodes the domain rule that search is always case-insensitive and whitespace-trimmed.

```typescript
type SearchQuery = {
  readonly raw: string       // original user input
  readonly normalised: string // raw.trim().toLowerCase()
}
```

**Invariants**: `normalised` is always lowercase and trimmed. An empty `normalised` value (`''`) means no active search — browse mode is used.

**Factory**:
```typescript
function createSearchQuery(raw: string): SearchQuery {
  return { raw, normalised: raw.trim().toLowerCase() }
}
```

---

### `BaseStats`

Encapsulates all six canonical Pokémon base stats as a single value object. Prevents partial stat objects.

```typescript
type BaseStats = {
  readonly hp: number
  readonly attack: number
  readonly defense: number
  readonly specialAttack: number
  readonly specialDefense: number
  readonly speed: number
}
```

**Invariants**: All values are non-negative integers (0–255, per PokeAPI).

**PokeAPI `stat.name` → `BaseStats` field mapping**:

| `stat.name` | `BaseStats` field |
|-------------|------------------|
| `hp` | `hp` |
| `attack` | `attack` |
| `defense` | `defense` |
| `special-attack` | `specialAttack` |
| `special-defense` | `specialDefense` |
| `speed` | `speed` |

---

### `PokemonType`

Union of all valid Pokémon type names. Invalid types from API are filtered at the mapper boundary.

```typescript
type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy'
```

---

### `PokemonAbility`

```typescript
type PokemonAbility = {
  readonly name: string
  readonly isHidden: boolean
}
```

---

## State Model

### `SearchSessionState`

Owned by the `PokemonDiscoveryPage` component (React state). Not persisted. Drives which TanStack Query hooks are active.

| Field | Type | Description |
|-------|------|-------------|
| `searchQuery` | `SearchQuery` | Current debounced search term |
| `selectedPokemon` | `PokemonId \| null` | ID of Pokémon whose detail modal is open (`null` = closed) |

**Derived state** (not stored):
- `isDetailOpen`: `selectedPokemon !== null`
- `isSearchActive`: `searchQuery.normalised !== ''`

---

## Pagination Model

### Browse Mode (no active search)

```
page 0 → GET /api/v2/pokemon?limit=20&offset=0
page 1 → GET /api/v2/pokemon?limit=20&offset=20
page N → GET /api/v2/pokemon?limit=20&offset=N×20
```

- `getNextPageParam`: extract `offset` from the `next` URL field, or return `undefined` if `next === null`.
- `initialPageParam`: `0`

### Search Mode (active search query)

1. Full name list is pre-fetched once: `GET /api/v2/pokemon?limit=10000&offset=0`
2. Cached under `queryKey: ['pokemon', 'full-list']` with `staleTime: Infinity`
3. Client-side filter: `allNames.filter(e => e.name.includes(query.normalised))`
4. Virtual pages: `filteredNames.slice(pageIndex × 20, (pageIndex + 1) × 20)`
5. Detail fetch per page entry: parallel `useQueries` with `queryKey: ['pokemon', 'detail', name]`

---

## Constants

```typescript
// src/constants/pokemon.ts
export const SEARCH_DEBOUNCE_MS = 500
export const POKEMON_PAGE_SIZE = 20
export const POKEMON_FULL_LIST_LIMIT = 10_000
export const POKEMON_MAX_STAT_VALUE = 255
```

---

## Validation Rules

| Entity / Field | Rule | Enforcement Point |
|----------------|------|-------------------|
| `PokemonSummary.name` | Non-empty string | Mapper throws `MappingError` if empty |
| `BaseStats.*` | Integer 0–255 | Mapper warns + clamps out-of-range values |
| `PokemonType` | Member of valid type union | Mapper filters unknown types with structured warning |
| `SearchQuery.normalised` | Trimmed lowercase string | `createSearchQuery()` factory function |
| PokeAPI URL params | Must be URL-encoded | `encodeURIComponent()` applied in `src/infrastructure/pokeapi/client.ts` |
| `PokemonAbility.name` | Non-empty string | Mapper filters empty-name abilities |

---

## Mapper Layer (Infrastructure → Domain)

All mapping occurs in `src/infrastructure/pokeapi/mappers.ts`. The mapper is the only place that knows about raw PokeAPI response shapes.

```
PokeAPI JSON Response
      ↓
  mappers.ts          (infrastructure)
      ↓
PokemonSummary / PokemonDetail  (domain entities)
      ↓
  React components    (UI)
```

No raw PokeAPI types (`sprites.front_default`, `base_stat`, `is_hidden`) appear outside `infrastructure/pokeapi/`.
