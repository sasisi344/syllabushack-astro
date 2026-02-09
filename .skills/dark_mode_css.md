# CSS Dark Mode Styling Rules (AstroWind)

This skill defines the standard approach for implementing dark mode in custom CSS components within the Syllabus Hack Astro project.

## Theme Detection Method

AstroWind (via tailwindcss) applies the `.dark` class to the `<html>` element. Custom CSS should target this class.

## Required Selectors

When creating new CSS components, implement dark mode support using the following methods:

### 1. `html.dark` Selector (Primary)

This is the primary method, triggered when the user explicitly selects "Dark" mode.

```css
html.dark .your-component {
  background: #1e293b;
  color: #e2e8f0;
  border-color: #334155;
}
```

### 2. `@media (prefers-color-scheme: dark)` (Fallback)

This handles users whose system is set to dark mode.

```css
@media (prefers-color-scheme: dark) {
  .your-component {
    background: #1e293b;
    color: #e2e8f0;
    border-color: #334155;
  }
}
```

## Standard Color Palette

Use the following Tailwind-inspired Slate palette:

| Purpose           | Light Mode | Dark Mode |
| :---------------- | :--------- | :-------- |
| Background (Card) | `#ffffff`  | `#1e293b` |
| Text (Primary)    | `#111827`  | `#f3f4f6` |
| Text (Secondary)  | `#4b5563`  | `#9ca3af` |
| Border (Default)  | `#e5e7eb`  | `#374151` |

## Integration with Tailwind

Prefer using Tailwind's `dark:` classes in `.astro` components when possible. Only use custom CSS when highly complex styling is required.
