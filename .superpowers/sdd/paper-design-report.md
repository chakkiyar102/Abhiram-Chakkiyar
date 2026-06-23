# Paper-Design Styling Pass Report

**Branch:** rework-paper-site  
**Date:** 2026-06-19  
**Build gate:** `npx astro build` — clean (16 pages, 0 errors, 0 warnings)

---

## Files Changed

### `src/styles/global.css`

**Google Fonts `@import` expanded:**  
- Fraunces now imports full axis range: `ital,opsz,wght@0,9..144,400..700;1,9..144,400..700` (was only italic 400+600).
- Plus Jakarta Sans added: `ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500`.

**Body font set:**  
`body { font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, sans-serif; }` in `@layer base`. This overrides the `font-app` Tailwind class (Google Sans Code) for prose content, while the Astro `Font` component's `--font-google-sans-code` variable remains for any code/monospace uses.

**Heading italic emphasis rule:**  
`h1 em, h2 em, h3 em, .display-serif em { font-style: italic; font-family: "Fraunces", serif; }` — ensures markdown `## The *word*` renders the emphasis word in serif italic at the global level (typography.css handles it inside `.app-prose` too).

**`.category-label` utility added:**  
11px / 600 weight / uppercase / 3px letter-spacing / `color: var(--accent)` (marine teal in light, aqua in dark). Not forced anywhere — available for kickers when needed.

**`display-serif` utility:** unchanged (Fraunces italic already correct).

---

### `src/styles/typography.css`

**Prose headings — Fraunces:**  
`h1, h2, h3, h4 { font-family: "Fraunces", serif; font-weight: 500; }` added inside `.app-prose`. Card-level h3 gets `font-weight: 600` (bold display, same font). The old `.app-prose h3 { @apply italic; }` is removed in favour of the proper Fraunces rule.

**Prose heading em italic:**  
`h1 em, h2 em, h3 em, h4 em { font-style: italic; font-family: "Fraunces", serif; }` inside `.app-prose` — covers the paper-design signature. The 54% essay uses headings like `## The *lie* I almost told` — "lie" renders in Fraunces italic.

**HR → marine gradient divider:**  
```css
hr {
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--accent), transparent);
  @apply my-8;
}
```
Maps the paper-design gold divider pattern onto marine accent (`#0e8a8a` light / `#5fd0c5` dark).

**Blockquote → paper-design callout:**  
```css
blockquote {
  background-color: color-mix(in srgb, var(--accent) 8%, var(--background));
  border-left: 3px solid var(--accent);
  border-radius: 0 8px 8px 0;
  padding: 0.75rem 1.25rem;
  margin-inline: 0;
  font-style: normal;
  opacity: 1;
}
blockquote p { margin: 0; }
```
The `color-mix()` gives a subtle marine-tinted background that adapts to both light (`#f4f1e8` base) and dark (`#0c1f29` base) without hardcoded hex. Replaces the prior `border-s-accent/80 opacity-80` treatment.

---

### `src/components/PaperTexture.astro`

**Full two-layer canonical crumple texture** replaces the prior two-layer flat fractalNoise implementation.

**Layer 1 — Crumple (light mode):**
- Filter chain: `feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" seed="12"` → `feDiffuseLighting lighting-color="#F5F0EB" surfaceScale="2"` with `feDistantLight azimuth="45" elevation="65"`
- SVG opacity: `0.22`, `mix-blend-mode: multiply`
- The `lighting-color` is warm parchment (`#F5F0EB`) — gives the creases a warm paper feel against the marine-parchment background

**Layer 1 — Crumple (dark mode):**
- Same filter parameters, `lighting-color="#5fd0c5"` (marine aqua tint)
- SVG opacity: `0.08`, `mix-blend-mode: screen`
- Light-mode SVG hidden in dark via `[data-theme="dark"] .paper-texture > svg:first-child { display: none }`

**Layer 2 — Fine grain:**
- `feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="3"`
- Rect `class="opacity-[0.05] dark:opacity-[0.04]"`
- `mix-blend-mode: multiply` (light) / `screen` (dark) via scoped `<style>` block
- This is the same frequency as the previous grain layer, just bumped to 4 octaves for slightly more texture depth

**Scoped `<style>` block** handles dark-mode switching for both layers via `[data-theme="dark"]` selector, consistent with the project's Tailwind v4 dark convention.

---

## Contrast Ratios

| Pair | Ratio | WCAG AA (4.5:1) |
|------|-------|-----------------|
| Light foreground `#15363d` on background `#f4f1e8` | **11.43:1** | Pass |
| Dark foreground `#e6f0ee` on background `#0c1f29` | **14.52:1** | Pass |
| Light accent `#0e8a8a` on background `#f4f1e8` | 3.70:1 | Decorative only (dividers, borders) |
| Dark accent `#5fd0c5` on background `#0c1f29` | 9.10:1 | Pass |

Body text contrast is 11.43:1 (light) and 14.52:1 (dark) — both well above WCAG AA (4.5:1) and near WCAG AAA (7:1). The texture adds opacity over the background but does not reduce contrast meaningfully at these levels (mix-blend-multiply on light background slightly darkens the paper colour, increasing contrast marginally).

The light accent at 3.70:1 is below 4.5:1, but this accent is used exclusively for decorative elements (dividers, borders, bullet markers, blockquote border) — not for body text. Body text is always `--foreground` (`#15363d`).

---

## How Heading-Italic Was Wired

The paper-design signature requires markdown `## The *rule*` to render "rule" in Fraunces italic. The chain:

1. Markdown `*rule*` → `<em>rule</em>` (standard remark processing)
2. `.app-prose h2 em { font-style: italic; font-family: "Fraunces", serif; }` in `typography.css`
3. `.app-prose h2 { font-family: "Fraunces", serif; font-weight: 500; }` sets the heading font
4. The global-level `h2 em` rule in `global.css` provides a fallback for any headings outside `.app-prose`

The 54% essay headings verified to carry these emphasis words: "lie", "rule", "thought", "problem", "question", "Sunday", "breaks" (from markdown italic runs inside h2 headings).

---

## How Callout Blockquotes Were Wired

```
prose blockquote
  ↳ background: color-mix(in srgb, var(--accent) 8%, var(--background))
  ↳ border-left: 3px solid var(--accent)
  ↳ border-radius: 0 8px 8px 0   ← asymmetric per paper-design spec
  ↳ padding: 0.75rem 1.25rem
  ↳ font-style: normal            ← override Tailwind Typography's italic blockquote default
  ↳ opacity: 1                    ← override prior 0.8 opacity treatment
```

`color-mix()` is CSS-native in all modern browsers (Chrome 111+, Safari 16.2+, Firefox 113+). It uses the existing CSS custom property `--accent`, so it responds correctly to both light and dark themes without additional rules.

---

## Concerns

1. **`font-app` vs `body` font:** The `<body>` element carries Tailwind class `font-app` (which maps to `--font-google-sans-code`, a monospace font). The new `body { font-family: "Plus Jakarta Sans"... }` in `@layer base` overrides it for prose. If any component explicitly relies on `font-app` for sans-serif text (not code), it will still get Plus Jakarta Sans via the cascade — but `font-app` is semantically a code/mono token and shouldn't be used for prose anyway. Consider renaming `--font-app` to `--font-mono` in a future cleanup.

2. **Light accent contrast (decorative):** `#0e8a8a` on `#f4f1e8` is 3.70:1, below WCAG AA. This affects the marine gradient hr, blockquote border, bullet markers, and category-label text. None of these convey meaning via colour alone — decorative uses are exempt from SC 1.4.3. If category labels are used for navigation/state in future, the accent colour should be darkened in light mode.

3. **`color-mix()` browser support:** Supported in all evergreen browsers since mid-2023. Legacy IE/old Safari users (<16.2) will see a transparent (unstyled) blockquote background — the border and padding still apply, so callouts remain legible.

4. **PaperTexture dark mode switching:** The approach uses two `<svg>` elements with CSS show/hide. This is functional but adds two SVG filter elements to the DOM. A cleaner approach would use CSS `filter:` on a single element with CSS custom properties for opacity — possible in a future refactor without changing the visual output.

5. **Google Fonts in production:** The expanded `@import` URL adds Plus Jakarta Sans + expanded Fraunces variants. This increases font payload. Weights 300-800 with italic variants are loaded; consider subsetting to 400;500;600;700 if page weight is a concern.
