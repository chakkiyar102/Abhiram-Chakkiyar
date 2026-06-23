# abhiram.cyou — AstroPaper Rework (marine/watercolor)

**Date:** 2026-06-19
**Status:** Approved design (Astro pivot), pending spec review
**Repo:** `/Users/abhiram/abhiram-site` (origin: github.com/chakkiyar102/Abhiram-Chakkiyar)
**Branch:** `rework-paper-site`

## Goal

Replace the half-finished Next.js blog template with a site built on
**AstroPaper** (github.com/satnaing/astro-paper), recolored to a **marine +
tropical-pastel + watercolor** identity. Position Abhiram as a **writer who
codes**. Distinctive, not boring, on proven accessible bones.

> Pivot note: an earlier version of this spec planned a hand-built Next.js
> paper-design site. Superseded — we adopt AstroPaper's structure/features and
> override its theme. "AstroPaper" the theme name is unrelated to the
> `paper-design` skill aesthetic; our look comes from the recolor, not the
> theme default (which is minimalist black/white).

## Positioning

"Writer who codes." Lead with clarity — docs, code, pixels. Personal,
public-facing site.

**Guardrail:** PUBLIC site. No Kissflow customer/commercial/internal data.
Abhiram's own work as writer/maker is fine. Nothing fabricated goes live.

## Stack

AstroPaper as-is: **Astro + TailwindCSS + TypeScript**, Pagefind static search,
Satori/Sharp dynamic OG images, draft posts, pagination, collapsible ToC, RSS,
sitemap, i18n-ready, strong a11y/Lighthouse. Deploy target: **Vercel** (static
output; domain abhiram.cyou already points there). No extra runtime deps beyond
what the theme ships.

## Migration into the repo

Preserve git history. Scaffold AstroPaper fresh, then replace the Next.js files:

1. Pull AstroPaper template into a temp dir (`npm create astro@latest --
   --template satnaing/astro-paper`, or degit).
2. In the repo branch `rework-paper-site`: remove the old Next.js app
   (`app/`, `lib/`, `next.config.ts`, `postcss.config.mjs`, Next deps in
   `package.json`), keep `.git/`, `docs/`, and migrate `content/posts/*` source
   text where reused.
3. Copy AstroPaper files in. Reinstall deps. Verify it builds before styling.
4. Stop the running Next.js dev server first.

## Recolor / aesthetic

- **Palette:** override AstroPaper's color-scheme CSS variables to marine +
  tropical pastels. Deep marine/teal ink text on warm-cool light parchment;
  accents in aqua, seafoam, coral-pastel, soft tropical blue. Dark mode =
  "deep water" warm-dark navy.
- **Watercolor:** reusable Astro component — layered radial-gradient blobs + SVG
  `feTurbulence`/`feDisplacementMap` for soft bleeding edges. Used on hero wash
  (behind avatar), section dividers, project-card tints, link/heading accents.
  No raster image deps.
- **Paper texture:** subtle two-layer treatment (base + grain) behind content,
  tuned not to fight AstroPaper's readability. Light touch, not the full opaque
  parchment.
- **Type:** keep AstroPaper's type system; introduce a serif italic display
  accent (Fraunces or Bodoni Moda italic) for headings/wordmark to match the
  editorial feel. Body stays clean sans; mono for code.
- **Contrast:** marine-on-parchment text must meet WCAG AA (theme is a11y-first;
  don't regress it).

## Content structure (AstroPaper native)

```
src/data/blog/
  essays/   # long-form .md/.mdx  -> /essays/<slug>
  notes/    # quick technical     -> /notes/<slug>
src/data/projects/   # one .md per project (custom collection)
```

- Use AstroPaper's subdirectory-as-URL feature for the essays/notes split.
- Add `/essays` and `/notes` listing pages filtering by subdirectory; keep the
  theme's default posts/tags/archive pages working.
- `/projects` page + `ProjectCard`, reading the `projects` collection
  (fields: `title`, `summary`, `why`, `link`, `repo?`, `year`, `tags?`,
  `featured?`).
- About page: AstroPaper's `src/data/`/pages about, recolored, real bio.
- Home: AstroPaper hero recolored — writer-who-codes line, **real photo
  avatar** (Abhiram provides file; wire slot now, monogram fallback until then),
  featured essay, recent notes, project teasers.

## Site config / metadata

Set AstroPaper `SITE` in `src/config.ts`: title "Abhiram Chakkiyar", real
`website: https://abhiram.cyou`, author, description, social links (GitHub
chakkiyar102, Twitter @abhichakkiyar, LinkedIn abhiramchakkiyar, email
abhiram@chakkiyar.org). This eliminates the old template's localhost / "Your
Name" / @yourhandle / dead `/static/` bugs by construction.

## Content seeding

- Drop the 3 filler posts (mysql, next-static-site-generation, typescript-tips).
- Rewrite into ONE real intro/colophon essay in Abhiram's voice (kf-writer /
  skilled-writer) — what the site is, who he is, how it's built. In
  `src/data/blog/essays/`.
- Clearly-marked `DRAFT —` stubs for 1 note + 1–2 project cards as shape
  examples (visibly placeholder, set as draft so they don't publish).
- Real photo: dropped in on arrival.

## Non-goals (YAGNI)

- No CMS, comments, analytics, newsletter.
- No Now page.
- No i18n content (theme is i18n-ready; we ship English only).
- No raster texture/watercolor assets — CSS/SVG only.

## Deploy

Work on `rework-paper-site`. Abhiram reviews locally (`npm run dev`). On
approval, add Vercel Astro support if needed (static build), merge to `main` →
Vercel auto-builds.

## Verification

- `npm run build` passes; lint/format clean.
- Every route renders (`npm run dev`), no console errors.
- Pagefind search works; `/rss.xml` + sitemap generate; both streams listed.
- Marine-on-parchment text meets WCAG AA (Lighthouse a11y not regressed).
- No "Your Name" / localhost / @yourhandle / dead /static path remains.
