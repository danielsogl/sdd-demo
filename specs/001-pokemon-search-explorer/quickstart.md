# Quickstart: Pokémon Search & Exploration SPA

**Branch**: `001-pokemon-search-explorer`
**Stack**: Next.js 16 · npm · TypeScript · Tailwind CSS v4 · shadcn/ui · TanStack Query v5 · Biome · Vitest · Playwright · Lefthook

---

## Prerequisites

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | 24 LTS | [nodejs.org](https://nodejs.org) |
| npm | 10.x (bundled with Node 24) | bundled |
| Git | 2.x | system |

---

## 1. Scaffold the Project with `create-next-app`

Next.js 16's `create-next-app` supports Biome as a first-class linter option (ESLint / **Biome** / None). Use the `--biome` flag to scaffold with Biome pre-configured. Note: Next.js 16 removed `next lint`; Biome is the recommended replacement.

```bash
# From the repo root (or a new empty directory)
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --biome \
  --app \
  --src-dir \
  --import-alias "@/*"
```

> `--biome` installs `@biomejs/biome` and generates an initial `biome.json`. Skip step 4 ("Configure Biome") if the scaffold generates a satisfactory config — you'll only need to customise it.
> `--tailwind` adds postcss and Tailwind configuration automatically.

**Verify / upgrade Tailwind to v4** — `create-next-app` may scaffold Tailwind v3:

```bash
# Check what was installed
npm ls tailwindcss

# Upgrade to v4 if needed
npm install tailwindcss@latest @tailwindcss/postcss
```

Update `postcss.config.mjs` (Tailwind v4 uses its own PostCSS plugin):

```js
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

Replace the content of `src/app/globals.css`:

```css
/* src/app/globals.css */
@import "tailwindcss";
```

---

## 2. Install Feature Dependencies

```bash
# Data fetching & infinite scroll
npm install @tanstack/react-query react-intersection-observer

# shadcn/ui peer deps
npm install class-variance-authority clsx tailwind-merge lucide-react

# Dev — Biome
npm install --save-dev @biomejs/biome

# Dev — Vitest + React Testing Library
npm install --save-dev vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event @vitest/coverage-v8

# Dev — Playwright
npm install --save-dev @playwright/test

# Dev — Lefthook
npm install --save-dev lefthook
```

---

## 3. Initialise shadcn/ui

```bash
npx shadcn@latest init
```

Accept prompts — choose **Next.js** (single project), **Neutral** base colour, **CSS variables** for theming. This creates `components.json`.

Install components used by this feature:

```bash
npx shadcn@latest add dialog skeleton button badge
```

---

## 4. Configure Biome

```bash
npx biome init
```

Replace the generated `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "files": {
    "ignore": ["**/node_modules/**", "**/.next/**", "**/dist/**"]
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
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      },
      "suspicious": { "noExplicitAny": "warn" }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "all",
      "semicolons": "always"
    }
  },
  "overrides": [
    {
      "include": ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
      "linter": {
        "rules": {
          "suspicious": { "noExplicitAny": "off" }
        }
      }
    }
  ]
}
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "format": "biome format --write .",
    "format:check": "biome format --check .",
    "lint": "biome lint .",
    "lint:fix": "biome lint --write .",
    "check": "biome check .",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:unit:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 5. Configure Vitest

Create `vitest.config.ts` in the project root:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/', 'tests/e2e/', 'src/components/ui/'],
    },
  },
});
```

Create `src/test/setup.ts`:

```ts
// src/test/setup.ts
import '@testing-library/jest-dom';
```

---

## 6. Configure Playwright

```bash
npx playwright install chromium --with-deps
```

Create `playwright.config.ts`:

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

---

## 7. Configure Lefthook

Create `lefthook.yml` in the project root:

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  jobs:
    - name: format-check
      run: npx biome format --check {staged_files}
      glob: "*.{ts,tsx,js,jsx,json,css}"

    - name: lint-check
      run: npx biome lint {staged_files}
      glob: "*.{ts,tsx,js,jsx}"
```

Install the hooks:

```bash
npx lefthook install
```

---

## 8. Configure GitHub Actions CI

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  format-check:
    name: Format Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24', cache: 'npm' }
      - run: npm ci
      - run: npm run format:check

  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24', cache: 'npm' }
      - run: npm ci
      - run: npm run lint

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [format-check, lint]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24', cache: 'npm' }
      - run: npm ci
      - run: npm run build

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24', cache: 'npm' }
      - run: npm ci
      - run: npm run test:unit:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: unit-coverage
          path: coverage/
          retention-days: 7

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24', cache: 'npm' }
      - run: npm ci
      - run: npx playwright install chromium --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

---

## 9. Source Directory Structure

After setup, the `src/` tree should match the following layout before writing any feature code:

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx          # wraps with <Providers>
│   ├── page.tsx            # or [[...slug]]/page.tsx for SPA
│   └── providers.tsx       # TanStack QueryClientProvider ('use client')
├── components/
│   ├── ui/                 # shadcn/ui generated (Dialog, Skeleton, Button, Badge)
│   ├── pokemon/            # feature components (created during implementation)
│   └── search/             # SearchInput component (created during implementation)
├── constants/
│   └── pokemon.ts          # SEARCH_DEBOUNCE_MS, POKEMON_PAGE_SIZE, etc.
├── domain/
│   └── pokemon/
│       ├── entities.ts
│       └── value-objects.ts
├── hooks/                  # custom hooks (created during implementation)
├── infrastructure/
│   └── pokeapi/
│       ├── client.ts
│       ├── mappers.ts
│       └── types.ts
├── lib/
│   └── utils.ts            # cn() utility (generated by shadcn init)
└── test/
    └── setup.ts

tests/
├── unit/
│   ├── domain/
│   ├── infrastructure/
│   └── hooks/
└── e2e/
    ├── pokemon-discovery.spec.ts
    ├── pokemon-cards.spec.ts
    ├── pokemon-detail.spec.ts
    └── loading-error-states.spec.ts
```

---

## Common Commands

| Action | Command |
|--------|---------|
| Start dev server | `npm run dev` |
| Run unit tests (watch) | `npm run test:unit:watch` |
| Run unit tests once | `npm run test:unit` |
| Run unit tests + coverage | `npm run test:unit:coverage` |
| Run e2e tests | `npm run test:e2e` |
| Run e2e tests (UI mode) | `npm run test:e2e:ui` |
| Format all files | `npm run format` |
| Check formatting | `npm run format:check` |
| Lint all files | `npm run lint` |
| Lint + fix | `npm run lint:fix` |
| Full check (format + lint) | `npm run check` |
| Production build | `npm run build` |

---

## Key URLs

| Resource | URL |
|----------|-----|
| PokeAPI v2 base | `https://pokeapi.co/api/v2` |
| PokeAPI docs | `https://pokeapi.co/docs/v2` |
| TanStack Query docs | `https://tanstack.com/query/v5` |
| shadcn/ui docs | `https://ui.shadcn.com` |
| Biome docs | `https://biomejs.dev` |
| Lefthook docs | `https://lefthook.dev` |
