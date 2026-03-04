# Implementation Plan: Pokémon Search & Exploration SPA

**Branch**: `001-pokemon-search-explorer` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-pokemon-search-explorer/spec.md`

## Summary

Build a client-side Single Page Application using Next.js 16 (App Router) that lets users search and infinitely browse the full Pokémon catalogue via the public PokeAPI v2. The UI renders a responsive grid of Pokémon cards (2/3/5 columns on mobile/tablet/desktop) showing each Pokémon's image, name, and six base stats. A modal detail view exposes the complete Pokémon profile with a stat bar chart. Search is debounced at 500ms and filters across all Pokémon names client-side from a pre-cached full-list query. TanStack Query v5 manages all data fetching, caching, and infinite scroll pagination. No backend — all data flows directly from the browser to PokeAPI v2.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 24 LTS
**Package Manager**: npm
**Primary Dependencies**: Next.js 16, React 19, TanStack Query v5, Tailwind CSS v4, shadcn/ui (Radix), Biome v2, Vitest v3, Playwright, Lefthook
**Storage**: N/A — no persistence; PokeAPI v2 as data source via HTTP (cached by TanStack Query in memory)
**Testing**: Vitest v3 + `@testing-library/react` (unit/component), Playwright (e2e)
**Target Platform**: Browser (modern — Chromium, Firefox, WebKit); verified on mobile, tablet, desktop
**Project Type**: Web SPA (Next.js 16 App Router, client-rendered via optional catch-all route)
**Performance Goals**: Initial page interactive < 2s on 4G; infinite scroll page load < 500ms; search debounce 500ms
**Constraints**: No backend, no auth, no persistence; PokeAPI unofficial rate limit ~100 req/min; offline not required
**Scale/Scope**: ~1,300 Pokémon total; full name list ~50 KB; detail per Pokémon ~5 KB; 20 Pokémon per infinite scroll page

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Pre-design | Post-design | Notes |
|---|-----------|-----------|------------|-------|
| I | Test-First / BDD | ✅ PASS | ✅ PASS | Spec has Gherkin scenarios for all 4 user stories. `tasks.md` will list test tasks before implementation tasks in each vertical slice. |
| II | Domain-Driven Design | ✅ PASS | ✅ PASS | Bounded contexts: `pokemon-discovery`, `pokemon-profile`. Entities: `PokemonSummary`, `PokemonDetail`. Value objects: `SearchQuery`, `BaseStats`, `PokemonType`, `PokemonAbility`, `PokemonId`. Mappers isolate infrastructure. |
| III | SOLID | ✅ PASS | ✅ PASS | SRP: each component has one purpose. OCP: new display modes extend hooks, not modify them. DIP: components depend on domain types, not PokeAPI shapes. |
| IV | Mobile-First & Responsive | ✅ PASS | ✅ PASS | Grid starts at 2 columns (mobile), scales to 3 (tablet), 5 (desktop). WCAG 2.1 AA required for all components. |
| V | API-First Design | ✅ PASS | ✅ PASS | PokeAPI v2 contract in `contracts/pokeapi-v2.md`. Domain TypeScript interfaces in `contracts/domain-interfaces.ts`. Agreed before implementation. |
| VI | Ubiquitous Language | ✅ PASS | ✅ PASS | All identifiers use Pokémon domain language. No `data`, `obj`, `mgr`, `tmp`. `PokemonSummary`, `PokemonDetail`, `SearchQuery`, `BaseStats`, `fetchPokemonList`, `openPokemonDetail`. |
| VII | Vertical Slice Architecture | ✅ PASS | ✅ PASS | Four delivery slices: (0) infrastructure + tooling, (1) grid + infinite scroll, (2) card with stats, (3) detail modal, (4) loading/error states. |
| VIII | Definition of Done | ✅ PASS | ✅ PASS | DoD checklist tracked per task in `tasks.md`. All 10 criteria enforced on every task. |
| IX | No Magic Numbers | ✅ PASS | ✅ PASS | Constants extracted: `SEARCH_DEBOUNCE_MS = 500`, `POKEMON_PAGE_SIZE = 20`, `POKEMON_FULL_LIST_LIMIT = 10_000`, `POKEMON_MAX_STAT_VALUE = 255`. Breakpoints as Tailwind utility classes. |
| X | Observability | ⚠️ PARTIAL | ⚠️ PARTIAL | Client SPA — no server metrics infra. Structured `console.error` with context for all caught domain errors. Silent failures prohibited. Acceptable for a frontend-only SPA (justified in Complexity Tracking). |
| XI | Security by Design | ✅ PASS | ✅ PASS | OWASP A03: `encodeURIComponent()` on all PokeAPI URL params. A06: `pnpm audit` in CI. No secrets. CSP headers via `next.config`. Full OWASP assessment in `research.md`. |
| XII | Dependency Management | ✅ PASS | ✅ PASS | All 13 dependencies documented with make-or-buy decisions, license, rationale in `research.md`. `pnpm audit` in CI. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-pokemon-search-explorer/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/
│   ├── pokeapi-v2.md            # PokeAPI v2 endpoint contracts
│   └── domain-interfaces.ts     # TypeScript domain type contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css                   # Tailwind v4 @import "tailwindcss" + CSS variables
│   ├── layout.tsx                    # Root layout wrapping <Providers>
│   ├── page.tsx                      # SPA entry — Pokémon Discovery page
│   └── providers.tsx                 # TanStack Query client provider ('use client')
├── components/
│   ├── ui/                           # shadcn/ui generated (Dialog, Skeleton, Button, Badge)
│   ├── pokemon/
│   │   ├── PokemonGrid.tsx           # Responsive grid container + infinite scroll trigger
│   │   ├── PokemonCard.tsx           # Card: image, name, base stats
│   │   ├── PokemonSkeletonCard.tsx   # Shimmer placeholder (skeleton loading state)
│   │   ├── PokemonDetailModal.tsx    # Modal overlay with full profile
│   │   ├── PokemonStatBar.tsx        # Single stat row (label + progress bar + value)
│   │   └── PokemonStatChart.tsx      # All 6 stats rendered as PokemonStatBar list
│   └── search/
│       └── SearchInput.tsx           # Debounced search input (500ms)
├── constants/
│   └── pokemon.ts                    # SEARCH_DEBOUNCE_MS, POKEMON_PAGE_SIZE, etc.
├── domain/
│   └── pokemon/
│       ├── entities.ts               # PokemonSummary, PokemonDetail, PokemonNameEntry types
│       └── value-objects.ts          # SearchQuery, BaseStats, PokemonType, PokemonAbility, PokemonId
├── hooks/
│   ├── use-debounce.ts               # Generic debounce hook
│   ├── use-pokemon-list.ts           # useInfiniteQuery for browse mode
│   ├── use-pokemon-full-list.ts      # useQuery for full name list (search index)
│   ├── use-search-filtered-list.ts   # Infinite-scroll over client-filtered name list
│   └── use-pokemon-detail.ts         # useQuery for single Pokémon detail
├── infrastructure/
│   └── pokeapi/
│       ├── client.ts                 # fetch wrapper; base URL; encodeURIComponent
│       ├── mappers.ts                # PokeAPI response → domain entities (ONLY bridge)
│       └── types.ts                  # Raw PokeAPI response type shapes
└── lib/
    └── utils.ts                      # cn() utility (generated by shadcn init)

src/test/
└── setup.ts                          # @testing-library/jest-dom setup

tests/
├── unit/
│   ├── domain/                       # Entity + value object unit tests
│   ├── infrastructure/               # Mapper unit tests (PokeAPI → domain)
│   └── hooks/                        # Hook tests with @testing-library/react
└── e2e/
    ├── pokemon-discovery.spec.ts      # US1: grid loads, infinite scroll
    ├── pokemon-cards.spec.ts          # US2: card content + responsive layout
    ├── pokemon-detail.spec.ts         # US3: detail modal opens, stat chart
    └── loading-error-states.spec.ts   # US4: skeleton, error messages

.github/
└── workflows/
    └── ci.yml                        # format-check, lint, build, unit-tests, e2e-tests

biome.json
lefthook.yml
playwright.config.ts
vitest.config.ts
postcss.config.mjs
components.json
```

**Structure Decision**: Single Next.js 16 project (no monorepo). All domain logic in `src/domain/`, all PokeAPI adaptation in `src/infrastructure/pokeapi/`. Tests in top-level `tests/` for clear CI separation. No separate backend — all data fetching happens client-side via TanStack Query hooks.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Principle X partial (no server-side observability) | Frontend-only SPA with no server component. Structured client-side error logging is the maximum achievable without a backend. | Adding a backend logging service is out of spec scope. |
| N+1 PokeAPI detail fetches per card page | PokeAPI list endpoint returns name/url only; cards require stats + image | PokeAPI has no bulk detail endpoint. GraphQL beta is unstable. Mitigated by TanStack Query parallel `useQueries` + aggressive caching (`staleTime: Infinity`). |
| Full list pre-fetch (~50 KB) | PokeAPI has no server-side substring search | No alternative without a backend proxy. 50 KB is acceptable for a SPA first load and is fetched once then cached indefinitely. |
