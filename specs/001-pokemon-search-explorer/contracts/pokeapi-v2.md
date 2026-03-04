# PokeAPI v2 Contract

**Version**: PokeAPI v2 (stable)
**Base URL**: `https://pokeapi.co/api/v2`
**Auth**: None required
**Rate limit**: ~100 req/min per IP (unofficial; no hard limit documented)
**Caching**: Responses are HTTP-cacheable; TanStack Query caches in memory with `staleTime: Infinity` for detail records

> This contract defines the subset of the PokeAPI v2 surface consumed by this feature.
> No implementation may consume fields not listed here without updating this document.

---

## Endpoint 1: Paginated Pokémon List

```
GET /pokemon?limit={limit}&offset={offset}
```

**Used for**:
- Browse mode: `limit=20`, `offset=page*20`
- Search index: `limit=10000`, `offset=0` (one-time cached fetch, `staleTime: Infinity`)

### Query Parameters

| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| `limit` | integer | Yes | 1–10000 |
| `offset` | integer | Yes | 0 ≤ offset < count |

### Response — HTTP 200

```json
{
  "count": 1302,
  "next": "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
  "previous": null,
  "results": [
    { "name": "bulbasaur", "url": "https://pokeapi.co/api/v2/pokemon/1/" },
    { "name": "ivysaur",   "url": "https://pokeapi.co/api/v2/pokemon/2/" }
  ]
}
```

**Consumed fields**:

| Field | Type | Used for |
|-------|------|----------|
| `count` | integer | Total Pokémon count; displayed in UI |
| `next` | `string \| null` | `getNextPageParam` — `null` means last page |
| `results[].name` | string | Card display name; search index key |
| `results[].url` | string | Search index (derive `name` from URL if needed) |

**Error responses**:
- HTTP 404: offset exceeds `count` — treat as last page reached.

---

## Endpoint 2: Pokémon Detail

```
GET /pokemon/{nameOrId}
```

**Used for**:
- Fetching card data (parallel `useQueries` per page of names)
- Fetching modal data (cached from card fetch — no duplicate request)

### Path Parameter

| Parameter | Type | Format | Example |
|-----------|------|--------|---------|
| `nameOrId` | string \| integer | Lowercase hyphenated name or numeric ID | `bulbasaur`, `1`, `mr-mime` |

> **Security note**: `nameOrId` MUST be passed through `encodeURIComponent()` before URL construction.

### Response — HTTP 200 (consumed fields only)

```json
{
  "id": 1,
  "name": "bulbasaur",
  "height": 7,
  "weight": 69,
  "sprites": {
    "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
  },
  "types": [
    { "slot": 1, "type": { "name": "grass" } },
    { "slot": 2, "type": { "name": "poison" } }
  ],
  "abilities": [
    { "ability": { "name": "overgrow" }, "is_hidden": false, "slot": 1 },
    { "ability": { "name": "chlorophyll" }, "is_hidden": true, "slot": 3 }
  ],
  "stats": [
    { "base_stat": 45, "stat": { "name": "hp" } },
    { "base_stat": 49, "stat": { "name": "attack" } },
    { "base_stat": 49, "stat": { "name": "defense" } },
    { "base_stat": 65, "stat": { "name": "special-attack" } },
    { "base_stat": 65, "stat": { "name": "special-defense" } },
    { "base_stat": 45, "stat": { "name": "speed" } }
  ]
}
```

**Consumed fields**:

| Field | Type | Maps to |
|-------|------|---------|
| `id` | integer | `PokemonId.value` |
| `name` | string | `PokemonSummary.name` |
| `height` | integer | `PokemonDetail.heightDecimetres` |
| `weight` | integer | `PokemonDetail.weightHectograms` |
| `sprites.front_default` | `string \| null` | `PokemonSummary.imageUrl` |
| `types[].type.name` | string | `PokemonDetail.types` (cast to `PokemonType`) |
| `abilities[].ability.name` | string | `PokemonAbility.name` |
| `abilities[].is_hidden` | boolean | `PokemonAbility.isHidden` |
| `stats[].base_stat` | integer | `BaseStats.*` (mapped by `stats[].stat.name`) |
| `stats[].stat.name` | string | Discriminator for `BaseStats` field selection |

**Error responses**:
- HTTP 404: Pokémon not found — display user-friendly error per FR-012/FR-013.
- Network failure: surface error state per FR-014; no retry per FR-016.

---

## Contract Compliance Rules

1. No field outside the "Consumed fields" tables above may be read in production code without updating this contract.
2. All URL parameters must be URL-encoded via `encodeURIComponent()`.
3. `sprites.front_default` may be `null` — the mapper must handle this gracefully.
4. The `effort` field in `stats[]` is **not consumed** — ignore it.
5. Fields not in the `types[]` union set are filtered at the mapper boundary with a structured warning log.
