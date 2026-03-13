## 1. Dependencies & Configuration

- [x] 1.1 Install `next-themes` package
- [x] 1.2 Ensure Tailwind CSS v4 dark mode uses class strategy (add `@custom-variant dark (&:is(.dark *))` to CSS if needed)
- [x] 1.3 Add dark mode CSS variables to `globals.css` (`.dark` selector with shadcn/ui dark palette)

## 2. Theme Provider Integration

- [x] 2.1 Add `ThemeProvider` from `next-themes` to `src/app/providers.tsx` with `attribute="class"`, `defaultTheme="system"`, and `enableSystem`
- [x] 2.2 Update `src/app/layout.tsx` to add `suppressHydrationWarning` to `<html>` element

## 3. Theme Toggle Component

- [x] 3.1 Add shadcn/ui `DropdownMenu` component (if not already installed)
- [x] 3.2 Create `src/components/ui/theme-toggle.tsx` with dropdown offering Light, Dark, and System options with icons
- [x] 3.3 Place `ThemeToggle` in the main layout (top-right of page)

## 4. Verification

- [x] 4.1 Verify all existing shadcn/ui components (button, dialog, badge, skeleton) render correctly in dark mode
- [x] 4.2 Verify theme persists across page reloads
- [x] 4.3 Verify no FOUC on page load with stored dark preference
