# Tasks: Pokémon Search & Exploration SPA

**Input**: Design documents from `/specs/001-pokemon-search-explorer/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Stack**: Next.js 16 · TypeScript 5.x · Node.js 24 LTS · TanStack Query v5 · Tailwind CSS v4 · shadcn/ui · Biome v2 · Vitest v3 · Playwright · Lefthook

**Tests**: Included — plan.md Constitution Check (Principle I) explicitly requires test tasks listed before implementation tasks in each vertical slice.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths are included in every description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the project and configure all tooling. No feature code — only the environment that makes feature code possible.

- [ ] T001 Scaffold Next.js 16 project via `npx create-next-app@latest . --typescript --tailwind --biome --app --src-dir --import-alias "@/*"` at repository root
- [ ] T002 Install feature runtime dependencies: `@tanstack/react-query react-intersection-observer class-variance-authority clsx tailwind-merge lucide-react`
- [ ] T003 [P] Upgrade to Tailwind CSS v4: install `tailwindcss@latest @tailwindcss/postcss`, update `postcss.config.mjs` to use `@tailwindcss/postcss`, replace `src/app/globals.css` with `@import "tailwindcss"`
- [ ] T004 [P] Customise `biome.json` with project rules: `indentStyle: space`, `indentWidth: 2`, `lineWidth: 100`, `noUnusedVariables: error`, `noUnusedImports: error`, `noExplicitAny: warn`, single quotes, trailing commas, LF endings
- [ ] T005 [P] Install and configure Vitest: `npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/coverage-v8`; create `vitest.config.ts` and `src/test/setup.ts`
- [ ] T006 [P] Install and configure Playwright: `npm install --save-dev @playwright/test`; create `playwright.config.ts` targeting Chromium, Firefox, WebKit; create `tests/e2e/` directory
- [ ] T007 [P] Install and configure Lefthook: `npm install --save-dev lefthook`; create `lefthook.yml` with pre-commit Biome format-check and pre-push lint+test hooks
- [ ] T008 [P] Create CI workflow at `.github/workflows/ci.yml` with jobs: `format-check`, `lint`, `build`, `unit-tests`, `e2e-tests` using Node.js 24 LTS
- [ ] T009 Initialise shadcn/ui: `npx shadcn@latest init` (Neutral base, CSS variables); install components: `npx shadcn@latest add dialog skeleton button badge`; verify `components.json` uses Tailwind v4 mode; confirm `src/lib/utils.ts` `cn()` is generated

**Checkpoint**: `npm run build` passes with zero errors. Biome, Vitest, and Playwright are runnable.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain layer, infrastructure adapter, and Next.js shell that ALL user stories share. No user story work begins until this phase is complete.

**⚠️ CRITICAL**: These files must exist before any hook, component, or page can be implemented.

- [ ] T010 [P] Create domain constants in `src/constants/pokemon.ts`: export `SEARCH_DEBOUNCE_MS = 500`, `POKEMON_PAGE_SIZE = 20`, `POKEMON_FULL_LIST_LIMIT = 10_000`, `POKEMON_MAX_STAT_VALUE = 255`
- [ ] T011 [P] Create domain value objects in `src/domain/pokemon/value-objects.ts`: `PokemonId`, `SearchQuery`, `createSearchQuery()`, `BaseStats`, `PokemonType` union, `PokemonAbility` — copied verbatim from `contracts/domain-interfaces.ts`; add `QUERY_KEYS` constant map
- [ ] T012 Create domain entities in `src/domain/pokemon/entities.ts`: `PokemonSummary`, `PokemonDetail`, `PokemonNameEntry`, `SearchSessionState`, `PokemonListPage`, `PokemonSearchPage` — depends on T011
- [ ] T013 [P] Create PokeAPI raw response types in `src/infrastructure/pokeapi/types.ts`: `RawPokemonListResponse`, `RawPokemonListItem`, `RawPokemonDetailResponse`, `RawStatEntry`, `RawTypeEntry`, `RawAbilityEntry`
- [ ] T014 [P] Create PokeAPI HTTP client in `src/infrastructure/pokeapi/client.ts`: `POKEAPI_BASE_URL` constant, `fetchPokemonPage(offset: number)`, `fetchPokemonFullList()`, `fetchPokemonDetail(name: string)` — all params wrapped with `encodeURIComponent()`; no retry; throws typed errors
- [ ] T015 Create PokeAPI mappers in `src/infrastructure/pokeapi/mappers.ts`: `mapRawDetailToPokemonSummary()`, `mapRawDetailToPokemonDetail()`, `mapStatName()` — stat name mapping per data-model.md table; invalid `PokemonType` values filtered at boundary — depends on T011, T012, T013
- [ ] T016 [P] Create TanStack Query provider in `src/app/providers.tsx`: `'use client'`, singleton `QueryClient` with `staleTime: 60_000` and `retry: false`; export `Providers` wrapping `QueryClientProvider`
- [ ] T017 Create root layout in `src/app/layout.tsx`: wrap `{children}` with `<Providers>`; import `globals.css` — depends on T016
- [ ] T018 [P] Create Next.js config in `next.config.ts`: enable `typedRoutes: true`; add CSP headers via `headers()` callback
- [ ] T019 Create SPA optional catch-all route: `src/app/[[...slug]]/page.tsx` with `generateStaticParams()` returning `[{ slug: [''] }]`; rename/remove default `src/app/page.tsx` — depends on T017

**Checkpoint**: `npm run build` passes. Domain types compile. PokeAPI client can be imported. Provider renders without errors.

---

## Phase 3: User Story 1 — Discover Pokémon Through Searchable Infinite List (Priority: P1) 🎯 MVP

**Goal**: Users can land on the page, see a grid of Pokémon that expands as they scroll, and filter the full catalogue by typing a name.

**Independent Test**: Load the page → grid appears → scroll to bottom → additional Pokémon load → type "char" → list resets to matching Pokémon only → type gibberish → empty-state message appears.

### Tests for User Story 1

> **Write these tests FIRST — they must FAIL before implementation begins**

- [ ] T020 [P] [US1] Write unit tests for `SearchQuery` value object and `createSearchQuery()` in `tests/unit/domain/search-query.test.ts`: test normalisation, empty string, whitespace trimming, case folding
- [ ] T021 [P] [US1] Write unit tests for `useDebounce` hook in `tests/unit/hooks/use-debounce.test.ts`: test that value updates after delay, does not update before delay, resets on new input
- [ ] T022 [P] [US1] Write unit tests for `usePokemonFullList` hook in `tests/unit/hooks/use-pokemon-full-list.test.ts`: mock `fetchPokemonFullList`, assert query key `['pokemon', 'full-list']`, staleTime `Infinity`
- [ ] T023 [P] [US1] Write unit tests for `usePokemonList` hook in `tests/unit/hooks/use-pokemon-list.test.ts`: mock `fetchPokemonPage`, assert infinite query structure, `getNextPageParam` returns next offset or `undefined`
- [ ] T024 [P] [US1] Write unit tests for `useSearchFilteredList` hook in `tests/unit/hooks/use-search-filtered-list.test.ts`: mock full list, assert empty query returns browse mode, non-empty query filters by substring, pagination slices correctly
- [ ] T025 [P] [US1] Write Playwright e2e scenario for discovery in `tests/e2e/pokemon-discovery.spec.ts`: grid visible on load, scroll triggers next page, search resets list, no-match shows empty state

### Implementation for User Story 1

- [ ] T026 [P] [US1] Create `useDebounce` generic hook in `src/hooks/use-debounce.ts`: accepts `value: T` and `delayMs: number`; returns debounced value using `useEffect` + `setTimeout`; uses `SEARCH_DEBOUNCE_MS` as default
- [ ] T027 [P] [US1] Create `usePokemonFullList` hook in `src/hooks/use-pokemon-full-list.ts`: `useQuery` with key `QUERY_KEYS.pokemonFullList`, `queryFn: fetchPokemonFullList`, `staleTime: Infinity`; returns `PokemonNameEntry[]`
- [ ] T028 [P] [US1] Create `usePokemonList` hook in `src/hooks/use-pokemon-list.ts`: `useInfiniteQuery` with key `['pokemon', 'list']`, `initialPageParam: 0`, `getNextPageParam` derived from `nextOffset`; `enabled` only when no active search
- [ ] T029 Create `useSearchFilteredList` hook in `src/hooks/use-search-filtered-list.ts`: consumes full list from T027, filters by `searchQuery.normalised` substring, paginates filtered results via `useInfiniteQuery` + parallel `useQueries` for detail fetches; `enabled` only when search is active — depends on T027, T028
- [ ] T030 [P] [US1] Create `SearchInput` component in `src/components/search/SearchInput.tsx`: controlled `<input>` with `SEARCH_DEBOUNCE_MS` debounce via `useDebounce`; emits `onSearch(query: SearchQuery)` callback; accessible label; Tailwind styled
- [ ] T031 Create `PokemonGrid` component (grid shell + infinite scroll trigger) in `src/components/pokemon/PokemonGrid.tsx`: responsive grid (`grid-cols-2 md:grid-cols-3 lg:grid-cols-5`); `useInView` sentinel div; calls `fetchNextPage` when in view; accepts `items: PokemonSummary[]` and renders name-only placeholders — depends on T028, T029
- [ ] T032 Wire `SearchInput` and `PokemonGrid` into the discovery page in `src/app/[[...slug]]/page.tsx`: `'use client'`; manage `SearchSessionState` with `useState`; pass `searchQuery` to grid and search hooks — depends on T030, T031

**Checkpoint**: Page loads, grid renders names, infinite scroll appends results, search filters the list, empty state appears for no matches. US1 is fully functional.

---

## Phase 4: User Story 4 — Receive Clear Loading and Error Feedback (Priority: P1)

**Goal**: Users always see skeleton placeholders while data loads and friendly error messages when requests fail — never blank screens or raw error output.

**Independent Test**: Throttle network → skeleton cards appear in grid positions → simulate API failure → error message appears with page structure intact → skeleton does not linger after data arrives.

### Tests for User Story 4

> **Write these tests FIRST — they must FAIL before implementation begins**

- [ ] T033 [P] [US4] Write Playwright e2e scenarios for loading and error states in `tests/e2e/loading-error-states.spec.ts`: skeleton visible during slow fetch, error message shown on failure (mocked with `page.route`), page structure preserved during error, no raw error output visible

### Implementation for User Story 4

- [ ] T034 [P] [US4] Create `PokemonSkeletonCard` shimmer placeholder component in `src/components/pokemon/PokemonSkeletonCard.tsx`: uses shadcn `<Skeleton>` for image, name, and stat bar placeholders; matches `PokemonCard` layout dimensions
- [ ] T035 [US4] Add skeleton loading state to `PokemonGrid` in `src/components/pokemon/PokemonGrid.tsx`: render `POKEMON_PAGE_SIZE` `<PokemonSkeletonCard>` components when `isLoading` or `isFetchingNextPage`; replace with real cards once data arrives — depends on T034
- [ ] T036 [US4] Add error boundary and user-friendly error UI to `PokemonGrid` in `src/components/pokemon/PokemonGrid.tsx`: when `isError`, render styled error message (no raw error text); include retry affordance using `refetch`; structured `console.error` with context
- [ ] T037 [US4] Add empty-state UI to `PokemonGrid` in `src/components/pokemon/PokemonGrid.tsx`: when data is loaded, search is active, and `items.length === 0`, render "No Pokémon matched your search" message with search term echoed back
- [ ] T038 [US4] Add error handling for failed detail fetches in page-level state in `src/app/[[...slug]]/page.tsx`: catch individual card detail fetch errors and display per-card error fallback; no raw errors surfaced

**Checkpoint**: Skeletons appear on initial load and scroll. Error states show friendly messages. Empty state shows for no-match searches. US4 is fully functional alongside US1.

---

## Phase 5: User Story 2 — Compare Pokémon Quickly From Cards (Priority: P2)

**Goal**: Each card in the grid shows the Pokémon image, name, and all six base stats so users can compare without opening the detail view.

**Independent Test**: Browse any result set → each card shows sprite image, display name, and labelled values for HP, Attack, Defense, Sp. Atk, Sp. Def, Speed → at 375 px grid is 2 cols, at 768 px is 3 cols, at 1280 px is 5 cols.

### Tests for User Story 2

> **Write these tests FIRST — they must FAIL before implementation begins**

- [ ] T039 [P] [US2] Write unit tests for PokeAPI mappers in `tests/unit/infrastructure/mappers.test.ts`: verify `mapRawDetailToPokemonSummary()` maps all six stat names correctly, sets `displayName`, handles null `imageUrl`, filters invalid types
- [ ] T040 [P] [US2] Write unit tests for `PokemonSummary` entity invariants in `tests/unit/domain/pokemon-summary.test.ts`: non-empty name, all 6 BaseStats fields present, PokemonId positive integer
- [ ] T041 [P] [US2] Write Playwright e2e scenarios for card content in `tests/e2e/pokemon-cards.spec.ts`: each card has image, name, six stat labels and values; responsive column count verified at mobile/tablet/desktop breakpoints using `page.setViewportSize`

### Implementation for User Story 2

- [ ] T042 [US2] Create `PokemonCard` component in `src/components/pokemon/PokemonCard.tsx`: display `imageUrl` via `next/image` (fallback on error), `displayName`, and inline labelled base stats (hp, attack, defense, specialAttack, specialDefense, speed) using `POKEMON_MAX_STAT_VALUE` for relative sizing; shadcn `<Badge>` for types (placeholder); clickable with `onClick(id: PokemonId)` callback — depends on T012, T015
- [ ] T043 [US2] Integrate `PokemonCard` into `PokemonGrid` in `src/components/pokemon/PokemonGrid.tsx`: replace name-only placeholders from T031 with `<PokemonCard>`; pass `onClick` that sets `selectedPokemon` in page state; fetch detail per card using parallel `useQueries` with `staleTime: Infinity` — depends on T042

**Checkpoint**: Cards render images, names, and all six stats. Grid is 2/3/5 columns at mobile/tablet/desktop. US1 + US4 + US2 all work together.

---

## Phase 6: User Story 3 — Explore Complete Pokémon Profile (Priority: P3)

**Goal**: Selecting a card opens a modal with the full Pokémon profile including a stat bar chart for quick visual comparison.

**Independent Test**: Click any card → modal opens on same page → shows image, name, types, abilities, height in metres, weight in kg, and a bar chart with all 6 stats → close modal → grid is still usable.

### Tests for User Story 3

> **Write these tests FIRST — they must FAIL before implementation begins**

- [ ] T044 [P] [US3] Write unit tests for `usePokemonDetail` hook in `tests/unit/hooks/use-pokemon-detail.test.ts`: mock `fetchPokemonDetail`, assert query key `QUERY_KEYS.pokemonDetail(name)`, `staleTime: Infinity`, `enabled` only when name is provided
- [ ] T045 [P] [US3] Write unit tests for `PokemonDetail` entity and mapper in `tests/unit/domain/pokemon-detail.test.ts`: verify `mapRawDetailToPokemonDetail()` maps types, abilities, height, weight; types list contains 1–2 entries; abilities `isHidden` set correctly
- [ ] T046 [P] [US3] Write Playwright e2e scenarios for detail modal in `tests/e2e/pokemon-detail.spec.ts`: click card opens modal, modal contains image/name/types/abilities/height/weight/stat bars, close button returns to grid, modal does not open on scroll

### Implementation for User Story 3

- [ ] T047 [US3] Create `usePokemonDetail` hook in `src/hooks/use-pokemon-detail.ts`: `useQuery` with key `QUERY_KEYS.pokemonDetail(name)`, `queryFn: () => fetchPokemonDetail(name).then(mapRawDetailToPokemonDetail)`, `staleTime: Infinity`, `enabled: !!name` — depends on T014, T015
- [ ] T048 [P] [US3] Create `PokemonStatBar` component in `src/components/pokemon/PokemonStatBar.tsx`: renders single stat row with label, filled progress bar relative to `POKEMON_MAX_STAT_VALUE`, and numeric value; Tailwind `w-full` progress div with `style={{ width: ... }}`; accessible `role="meter"` with `aria-valuenow/min/max`
- [ ] T049 [US3] Create `PokemonStatChart` component in `src/components/pokemon/PokemonStatChart.tsx`: renders `<PokemonStatBar>` for each of the 6 stats from `BaseStats`; accepts `stats: BaseStats` prop — depends on T048
- [ ] T050 [US3] Create `PokemonDetailModal` component in `src/components/pokemon/PokemonDetailModal.tsx`: uses shadcn `<Dialog>`; calls `usePokemonDetail(name)` internally; renders image (`next/image`), `displayName`, type `<Badge>` list, ability list, height (÷10 m), weight (÷10 kg), `<PokemonStatChart>`; skeleton loading state while fetching; friendly error state on failure — depends on T047, T049
- [ ] T051 [US3] Wire modal into discovery page in `src/app/[[...slug]]/page.tsx`: render `<PokemonDetailModal open={isDetailOpen} pokemonName={selectedPokemonName} onClose={() => setSelectedPokemon(null)}`; derive `selectedPokemonName` from full list by `selectedPokemon.value`; pass `onClick` from `PokemonCard` to set `selectedPokemon` — depends on T050

**Checkpoint**: Clicking any card opens the detail modal. Stat chart renders. Closing the modal returns to the grid. All four user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates, accessibility hardening, and validation that the entire feature meets the Definition of Done.

- [ ] T052 [P] Verify `encodeURIComponent()` is applied to all PokeAPI URL parameters in `src/infrastructure/pokeapi/client.ts`; audit for any raw string interpolation
- [ ] T053 [P] Remove any leftover ESLint config (`eslint.config.mjs`, `.eslintrc*`) that `create-next-app` may have generated; ensure only Biome is active for linting
- [ ] T054 [P] Run `npx biome check --write src/ tests/` and resolve all lint and format violations across the entire codebase
- [ ] T055 [P] Run full Vitest unit test suite with coverage: `npx vitest run --coverage`; ensure all unit tests pass
- [ ] T056 [P] Run Playwright e2e suite: `npx playwright test`; ensure all acceptance scenarios pass across Chromium, Firefox, WebKit
- [ ] T057 Run quickstart.md end-to-end validation: follow every step in `specs/001-pokemon-search-explorer/quickstart.md` on a clean clone; verify `npm run dev`, `npm test`, `npm run build` all succeed
- [ ] T058 [P] Audit accessibility: verify WCAG 2.1 AA for `SearchInput` (label), `PokemonCard` (img alt), `PokemonStatBar` (meter role), `PokemonDetailModal` (dialog accessible name, focus trap)
- [ ] T059 [P] Performance check: verify initial page interactive < 2 s on simulated 4G in Chrome DevTools; verify search debounce does not trigger requests before 500 ms; verify detail modal opens in < 500 ms on subsequent visits (cache hit)

**Checkpoint**: All checks green. Feature is shippable.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Requires Phase 1 complete — **BLOCKS all user stories**
- **US1 (Phase 3)**: Requires Phase 2 complete — no dependency on other user stories
- **US4 (Phase 4)**: Requires Phase 3 complete — augments grid and page from US1
- **US2 (Phase 5)**: Requires Phase 2 complete — card content can be developed in parallel with US4
- **US3 (Phase 6)**: Requires Phase 2 complete — modal requires hooks from foundation; stat bar independent
- **Polish (Phase 7)**: Requires all desired user stories complete

### User Story Dependencies

| Story | Phase | Depends On | Independently Testable |
|-------|-------|------------|----------------------|
| US1 (P1) | 3 | Phase 2 (Foundational) | ✅ — grid + search + infinite scroll works standalone |
| US4 (P1) | 4 | US1 (grid shell exists) | ✅ — skeleton/error states visible without US2–US3 |
| US2 (P2) | 5 | Phase 2 (mappers, entities) | ✅ — card content testable independent of modal |
| US3 (P3) | 6 | Phase 2 (hooks, mappers) | ✅ — modal testable by directly triggering open state |

### Within Each User Story

1. Tests written first → confirmed FAILING
2. Domain/entity tasks before service/hook tasks
3. Hooks before components
4. Components before page wiring
5. Story complete and tested before proceeding

### Parallel Opportunities Per Story

```bash
# Phase 3 — US1: All test files can be written simultaneously
T020, T021, T022, T023, T024, T025  # (all [P] [US1] test tasks)

# Phase 3 — US1: All independent hook implementations together
T026, T027, T028                     # (all [P] [US1] hook tasks)

# Phase 4 — US4: T034 (SkeletonCard) in parallel while test is written
T033, T034                           # (test + component can start together)

# Phase 5 — US2: Tests and mapper validation together
T039, T040, T041                     # (all [P] [US2] test tasks)

# Phase 6 — US3: Tests, StatBar, and detail unit tests all independent
T044, T045, T046, T048               # (all [P] [US3] parallel tasks)
```

---

## Implementation Strategy

### MVP First (US1 + US4 Only — Two P1 Stories)

1. Complete **Phase 1**: Setup and tooling
2. Complete **Phase 2**: Foundational layer (domain, infra, shell)
3. Complete **Phase 3**: US1 — functional grid with infinite scroll and search
4. Complete **Phase 4**: US4 — skeleton loading and error states
5. **STOP and VALIDATE**: Pokémon discovery works end-to-end with correct UX feedback
6. Deploy / demo MVP

### Incremental Delivery

```
Phase 1+2 → Foundation ready (not shippable)
Phase 3   → US1 complete: searchable infinite grid (minimal cards) → MVP candidate
Phase 4   → US4 complete: skeleton + error states → Production-quality MVP
Phase 5   → US2 complete: rich cards with images + stats → Enhanced MVP
Phase 6   → US3 complete: detail modal + stat chart → Full feature
Phase 7   → Polish: quality gates, accessibility, performance → Ship
```

Each increment is independently functional and demable without breaking prior stories.

### Parallel Team Strategy (if staffed)

Once Phase 2 (Foundational) is complete:
- **Developer A**: US1 (search + grid + infinite scroll)
- **Developer B**: US2 (card content + mappers)
- **Developer C**: US3 (detail modal + stat chart)
- US4 (skeleton + error) is a short pass — any developer can take it after US1 grid exists

---

## Summary

| Metric | Count |
|--------|-------|
| Total tasks | 59 |
| Phase 1 (Setup) | 9 |
| Phase 2 (Foundational) | 10 |
| Phase 3 (US1 — P1) | 13 |
| Phase 4 (US4 — P1) | 6 |
| Phase 5 (US2 — P2) | 5 |
| Phase 6 (US3 — P3) | 8 |
| Phase 7 (Polish) | 8 |
| Tasks marked [P] (parallelizable) | 38 |
| User stories covered | 4 |
| E2e test files | 4 |
| Unit test files | 8 |

**Suggested MVP scope**: Complete Phases 1–4 (US1 + US4) — delivers a fully functional searchable, infinitely scrolling Pokémon catalogue with production-quality loading and error feedback.
