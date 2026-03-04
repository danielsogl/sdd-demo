# Research: Pokémon Search & Exploration SPA

**Phase**: 0 — Pre-implementation research
**Branch**: `001-pokemon-search-explorer`
**Date**: 2026-03-04
**Sources**: context7 documentation, PokéAPI v2 reference

All unknowns from Technical Context have been resolved. No NEEDS CLARIFICATION items remain.

---

## Decision 1: Next.js 16 SPA setup strategy

**Decision**: Use Next.js 16 App Router with an optional catch-all route (`[[...slug]]`) for SPA behaviour. All rendering is client-side; no SSR or SSG for Pokémon data pages. Scaffolded via `create-next-app@latest` with Tailwind and no-ESLint flags. Biome added manually post-scaffold.

**Rationale**: The spec requires a Single Page Application. Next.js 16 supports SPA mode via optional catch-all routes and `generateStaticParams`. The App Router is the current standard. `create-next-app@latest` is the official scaffolding tool; it handles Next.js + Tailwind CSS integration out of the box. Biome is added afterwards because `create-next-app` has no `--biome` flag.

**Scaffold command**:
```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --biome \
  --app \
  --src-dir \
  --import-alias "@/*"
```
> **`--biome` flag**: Next.js 16's `create-next-app` supports Biome as a first-class linter option. Passing `--biome` installs `@biomejs/biome` and generates an initial `biome.json` automatically. `next lint` was removed in Next.js 16; Biome is the officially recommended replacement.
> **Tailwind version note**: After scaffolding, verify the Tailwind version (`npm ls tailwindcss`) and upgrade to v4 if needed (`npm install tailwindcss@latest @tailwindcss/postcss`).

**Key config**:
```ts
// next.config.ts
import type { NextConfig } from 'next'
const nextConfig: NextConfig = { typedRoutes: true }
export default nextConfig
```
```tsx
// app/[[...slug]]/page.tsx
export function generateStaticParams() {
  return [{ slug: [''] }]
}
export default function Page() {
  return <PokemonDiscoveryPage />
}
```

**Alternatives considered**:
- Pure Vite + React SPA: rejected — user explicitly specified Next.js 16.
- Next.js Pages Router: rejected — App Router is the current standard in Next.js 16.
- SSR with prefetching: rejected — PokeAPI data is public/static; SSR complicates TanStack Query hydration unnecessarily.

---

## Decision 2: PokeAPI v2 search strategy — client-side full-list filter

**Decision**: Fetch the complete Pokémon name list once (`GET /api/v2/pokemon?limit=10000&offset=0`) on app load, cache it indefinitely with TanStack Query (`staleTime: Infinity`), and filter client-side on search input. Load individual Pokémon detail records on demand via `useInfiniteQuery` over the filtered name list.

**Rationale**: PokeAPI v2 does not support server-side substring search. The full list is approximately 1,300 entries (~50 KB JSON) — acceptable payload for a client-side SPA. Caching the full list eliminates repeated network calls. TanStack Query's `useInfiniteQuery` pages through filtered results, fetching batches of 20 detail records in parallel via `useQueries`. This satisfies FR-005 (search across full dataset) without a backend proxy.

**Pagination strategy**:
- **Browse mode**: `useInfiniteQuery` with `limit=20, offset=page*20` against the paginated list endpoint.
- **Search mode**: filter cached full list → slice into pages of 20 → fetch detail for each name in the page via parallel `useQueries`.

**Alternatives considered**:
- Server-side proxy with search API: rejected — adds backend complexity; spec is frontend-only.
- PokeAPI GraphQL (`beta.pokeapi.co/graphql/v1beta`): rejected — beta endpoint, unstable, not endorsed by spec.
- Prefix match via `/api/v2/pokemon/{name}` exact: rejected — does not support substring search.

---

## Decision 3: TanStack Query v5 setup in Next.js 16

**Decision**: TanStack Query v5 with a client-only `Providers` wrapper in `app/providers.tsx`. Default `staleTime: 60_000`; individual Pokémon detail queries use `staleTime: Infinity` (data never changes). `retry: false` aligns with FR-016 (no automatic retry).

**Key setup** (from TanStack Query v5 docs):
```tsx
// app/providers.tsx
'use client'
import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: false },
    },
  })
}
let browserQueryClient: QueryClient | undefined
function getQueryClient() {
  if (isServer) return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

**Infinite scroll hook pattern**:
```tsx
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'

const { ref, inView } = useInView()
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['pokemon', 'list'],
  queryFn: async ({ pageParam }) => fetchPokemonPage(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
})

useEffect(() => {
  if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage()
}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])
```

---

## Decision 4: Tailwind CSS v4 + shadcn/ui

**Decision**: Tailwind CSS v4 with `@tailwindcss/postcss` plugin (no `tailwind.config.ts` — v4 uses CSS-first `@theme` directives). shadcn/ui via `npx shadcn@latest init`, `components.json` configured for Tailwind v4 mode.

**Key setup** (from Tailwind v4 + shadcn docs):
```bash
pnpm add tailwindcss @tailwindcss/postcss postcss
npx shadcn@latest init
```
```js
// postcss.config.mjs
export default { plugins: { '@tailwindcss/postcss': {} } }
```
```css
/* app/globals.css */
@import "tailwindcss";
```
```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-nova",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**Alternatives considered**:
- Tailwind v3: rejected — user explicitly specified v4.
- CSS Modules: rejected — user specified Tailwind.
- Radix UI directly (without shadcn): rejected — shadcn provides ready-made styled wrappers.

---

## Decision 5: Biome for linting and formatting

**Decision**: Biome v2 as the sole linter and formatter, replacing Next.js default ESLint + Prettier. ESLint config removed post-scaffolding. `biome.json` in project root.

**Key config** (from Biome docs):
```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true, "defaultBranch": "main" },
  "files": {
    "ignore": ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/*.generated.ts"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": { "noUnusedVariables": "error", "noUnusedImports": "error" },
      "suspicious": { "noExplicitAny": "warn" }
    }
  },
  "javascript": {
    "formatter": { "quoteStyle": "single", "trailingCommas": "all", "semicolons": "always" }
  }
}
```

**Alternatives considered**:
- ESLint + Prettier: rejected — user specified Biome.
- oxlint: rejected — user specified Biome.

---

## Decision 6: Vitest for unit tests

**Decision**: Vitest v3+ with `jsdom` environment and `@testing-library/react` for component tests.

**Key config** (from Vitest docs):
```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/', 'tests/e2e/'],
    },
  },
})
```

**Test scope**: domain entities/value objects, PokeAPI mappers, `useDebounce` hook, isolated component rendering.

---

## Decision 7: Playwright for e2e tests

**Decision**: Playwright with Chromium as primary browser, testing against the Next.js dev server. GitHub Actions uses `npx playwright install --with-deps`.

**Key config** (from Playwright docs):
```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/e2e',
  webServer: { command: 'pnpm dev', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI },
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
})
```

**e2e scope**: all 4 user story acceptance scenarios + edge cases (empty state, error state, skeleton state).

---

## Decision 8: Lefthook pre-commit hooks

**Decision**: Lefthook with parallel Biome format-check and lint jobs on staged files.

**Key config** (from Lefthook docs):
```yaml
# lefthook.yml
pre-commit:
  parallel: true
  jobs:
    - name: format-check
      run: pnpm biome format --check {staged_files}
      glob: "*.{ts,tsx,js,jsx,json,css}"
      stage_fixed: false
    - name: lint-check
      run: pnpm biome lint {staged_files}
      glob: "*.{ts,tsx,js,jsx}"
```

---

## Decision 9: GitHub Actions CI pipeline

**Decision**: Five jobs running on every push and PR to `main`. npm used as the package manager; Node.js 24 LTS.

| Job | Command | Triggers on |
|-----|---------|-------------|
| `format-check` | `npm run format:check` | push + PR |
| `lint` | `npm run lint` | push + PR |
| `build` | `npm run build` | after format-check + lint pass |
| `unit-tests` | `npm run test:unit:coverage` | after build |
| `e2e-tests` | `npm run test:e2e` | after build |

**GitHub Actions pattern**:
```yaml
- uses: actions/setup-node@v4
  with: { node-version: '24', cache: 'npm' }
- run: npm ci
```

---

## Decision 10: Dependency justifications (Principle XII)

| Dependency | Decision | Justification | License |
|------------|----------|---------------|---------|
| `next@16` | Buy | Framework specified; App Router, image optimisation, TypeScript first | MIT |
| `react@19` | Buy | Next.js 16 peer dep; required | MIT |
| `@tanstack/react-query@5` | Buy | Specified; purpose-built server-state, infinite scroll, no-retry config | MIT |
| `tailwindcss@4` | Buy | Specified; utility-first CSS, zero runtime | MIT |
| `@tailwindcss/postcss` | Buy | Required Tailwind v4 PostCSS integration | MIT |
| `shadcn/ui (CLI)` | Buy | Specified; Radix-based accessible components, copy-paste model | MIT |
| `@biomejs/biome` | Buy | Specified; Rust-speed linter+formatter, replaces ESLint+Prettier | MIT/Apache |
| `lefthook` | Buy | Specified; fast parallel Git hooks manager | MIT |
| `vitest@3+` | Buy | Specified; Vite-native, Jest-compatible, fast | MIT |
| `@vitejs/plugin-react` | Buy | Required Vitest + React JSX transform | MIT |
| `@testing-library/react` | Buy | Standard React component testing utilities | MIT |
| `@playwright/test` | Buy | Specified; cross-browser e2e automation | Apache 2.0 |
| `react-intersection-observer` | Buy | ~2 KB; idiomatic IntersectionObserver wrapper for scroll trigger | MIT |

---

## OWASP Top 10 Assessment (Principle XI)

| Risk | Applicability | Mitigation |
|------|--------------|------------|
| A01 Broken Access Control | N/A — no auth or protected resources | — |
| A02 Cryptographic Failures | N/A — no sensitive data stored or transmitted | — |
| A03 Injection | **Low** — search input used in PokeAPI URL | `encodeURIComponent()` on all URL params; Biome lint prevents `eval`/`innerHTML` |
| A04 Insecure Design | Low | All data from trusted public PokeAPI; no business logic risk |
| A05 Security Misconfiguration | Low | No API keys; no `.env` secrets; `next.config` for CSP headers |
| A06 Vulnerable Components | **Medium** | `pnpm audit` in CI; Dependabot alerts enabled |
| A07 Auth Failures | N/A — no authentication | — |
| A08 Software Integrity | Low | `pnpm` lockfile committed and frozen in CI |
| A09 Logging Failures | Low | Structured `console.error` with context for all caught domain errors; no silent swallowing |
| A10 SSRF | N/A — client SPA, no server-side HTTP calls | — |
