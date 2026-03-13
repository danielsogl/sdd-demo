## Context

The Pokémon Search & Explorer app uses Next.js 16, React 19, Tailwind CSS v4, and shadcn/ui. It currently renders in light mode only. The layout is a single-page app with a providers wrapper (`src/app/providers.tsx`) already in place for TanStack Query. shadcn/ui components are installed and use CSS variables for theming, making dark mode integration straightforward.

## Goals / Non-Goals

**Goals:**
- Allow users to switch between dark, light, and system theme
- Default to system preference on first visit
- Persist the user's choice across sessions
- Ensure all existing shadcn/ui components render correctly in dark mode
- Avoid flash of unstyled content (FOUC) on page load

**Non-Goals:**
- Custom color palette beyond shadcn/ui defaults
- Per-page or per-component theme overrides
- Theme animations or transitions

## Decisions

### 1. Use `next-themes` for theme management

**Choice**: `next-themes` library
**Why**: De-facto standard for Next.js theme switching. Handles SSR hydration, `localStorage` persistence, system preference detection, and class-based toggling out of the box. shadcn/ui documents this as the recommended approach.
**Alternatives considered**:
- Manual `prefers-color-scheme` media query — no persistence, no toggle UI
- Custom React context — reinvents what `next-themes` already solves reliably

### 2. CSS class strategy (not media query)

**Choice**: `class` strategy via Tailwind's `darkMode: "class"` equivalent in v4 (using `@custom-variant dark (&:is(.dark *))`)
**Why**: Allows programmatic toggling independent of OS setting. Required for the three-way toggle (dark/light/system).

### 3. shadcn/ui `DropdownMenu` for theme toggle

**Choice**: A dropdown menu button with three options (Light, Dark, System) using existing shadcn/ui `DropdownMenu` component with icons.
**Why**: Compact, accessible, follows shadcn/ui patterns already in the project. Placed in the app header/navigation area.
**Alternatives considered**:
- Three-segment toggle — takes more horizontal space
- Icon-only cycle button — less discoverable, no clear indication of current state

### 4. Integration point: `providers.tsx`

**Choice**: Add `ThemeProvider` inside the existing `Providers` component.
**Why**: Centralizes all providers in one place. The theme provider must wrap the entire app to ensure all components respond to theme changes.

## Risks / Trade-offs

- **[FOUC risk]** → Mitigated by `next-themes`' inline script that sets the class before React hydrates. Requires `suppressHydrationWarning` on `<html>`.
- **[shadcn/ui dark variables]** → shadcn/ui with Tailwind v4 may need CSS variable adjustments for dark mode. Mitigated by running `shadcn` init/add with dark mode support or manually adding the `:root.dark` CSS variables block.
- **[New dependency]** → `next-themes` is small (~2KB), well-maintained, and widely used. Low risk.
