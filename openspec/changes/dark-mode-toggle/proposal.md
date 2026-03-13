## Why

The application currently has no theme support and renders only in light mode. Users expect to control the visual theme (dark, light, or system-preferred) for comfort and accessibility, especially during extended use or in low-light environments.

## What Changes

- Add a theme toggle component offering three options: **dark**, **light**, and **system** (default: system)
- Integrate `next-themes` for theme persistence and SSR-safe theme resolution
- Extend Tailwind CSS v4 and shadcn/ui configuration to support dark mode via CSS class strategy
- Persist user preference across sessions via `localStorage` (handled by `next-themes`)

## Capabilities

### New Capabilities

- `theme-toggle`: Theme switching UI component and theme provider integration with dark/light/system support

### Modified Capabilities

_(none)_

## Impact

- **Layout**: `src/app/layout.tsx` — wrap with theme provider, add `suppressHydrationWarning` to `<html>`
- **Providers**: `src/app/providers.tsx` — add `ThemeProvider` from `next-themes`
- **CSS**: `src/app/globals.css` — add dark mode color variables if not already provided by shadcn
- **Components**: New `ThemeToggle` component in `src/components/ui/`
- **Dependencies**: Add `next-themes` package
- **shadcn/ui**: May need to regenerate or adjust CSS variables for dark palette
