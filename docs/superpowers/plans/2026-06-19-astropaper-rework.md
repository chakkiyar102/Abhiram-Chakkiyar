# AstroPaper Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the half-finished Next.js template at abhiram.cyou with an AstroPaper-based site, recolored to a marine + tropical-pastel + watercolor identity, positioning Abhiram as a "writer who codes."

**Architecture:** Adopt the AstroPaper theme wholesale (Astro + Tailwind v4 + TS), preserve git history, then override its color tokens, add watercolor/texture/serif-accent layers, split content into essays/notes subdirectories, add a projects collection, and seed one real intro essay plus marked drafts.

**Tech Stack:** Astro 5, TailwindCSS v4, TypeScript, Pagefind (search), Satori/Sharp (OG images), Markdown/MDX content collections.

## Global Constraints

- Public site. NO Kissflow customer/commercial/internal data. Abhiram's own work only. Nothing fabricated published (drafts must be `draft: true` and visibly marked `DRAFT`).
- Domain: `https://abhiram.cyou` (exact, used in SITE config + canonical + RSS).
- Social: GitHub `chakkiyar102`, Twitter `@abhichakkiyar`, LinkedIn `abhiramchakkiyar`, email `abhiram@chakkiyar.org`.
- Palette: marine + tropical pastel + watercolor. NO terracotta. Dark mode = warm "deep water" navy, not cold zinc.
- Texture: two-layer (base + grain), light touch — must not regress AstroPaper's WCAG AA / Lighthouse a11y.
- No new runtime deps beyond what AstroPaper ships + Google Fonts already used. CSS/SVG for texture & watercolor — no raster assets.
- Work on branch `rework-paper-site`. Commit frequently.

---

### Task 1: Scaffold AstroPaper into the repo (replace Next.js)

**Files:**
- Delete: `app/`, `lib/`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `package.json`, `package-lock.json`, `tsconfig.json`
- Keep: `.git/`, `docs/`, `.gitignore` (will be overwritten by theme's), `content/posts/*.md` (copied to a temp holding spot for reuse text)
- Create: full AstroPaper tree at repo root

**Interfaces:**
- Produces: a building Astro project. Canonical paths used by later tasks (AstroPaper v5): `src/config.ts`, `src/styles/global.css`, `src/data/blog/` (post collection dir), `src/content.config.ts` (collection schema), `src/components/`, `src/layouts/`, `src/pages/`.

- [ ] **Step 1: Stop the old Next.js dev server**

Run: `pkill -f "next dev" || true`
Expected: returns (server on :3000 stops).

- [ ] **Step 2: Save reusable post text out of the way**

```bash
cd /Users/abhiram/abhiram-site
mkdir -p /tmp/old-posts && cp content/posts/*.md /tmp/old-posts/ 2>/dev/null || true
```

- [ ] **Step 3: Scaffold AstroPaper into a temp dir**

```bash
cd /tmp
rm -rf ap-scaffold
npm create astro@latest ap-scaffold -- --template satnaing/astro-paper --no-install --no-git --yes
ls ap-scaffold
```
Expected: directory with `src/`, `astro.config.ts`, `package.json`, `public/`.

- [ ] **Step 4: Remove old Next.js files from repo (keep .git, docs)**

```bash
cd /Users/abhiram/abhiram-site
rm -rf app lib content public next.config.ts postcss.config.mjs eslint.config.mjs package.json package-lock.json tsconfig.json node_modules
```

- [ ] **Step 5: Copy AstroPaper files into repo**

```bash
cd /tmp/ap-scaffold
cp -R . /Users/abhiram/abhiram-site/
cd /Users/abhiram/abhiram-site
ls
```
Expected: AstroPaper files now at repo root, `docs/` still present.

- [ ] **Step 6: Install and confirm it builds**

Run:
```bash
cd /Users/abhiram/abhiram-site
npm install
npm run build
```
Expected: build completes with no errors; `dist/` produced.

- [ ] **Step 7: Record the real tree for later tasks**

Run: `find src -maxdepth 2 -type f | sort`
Expected: confirm actual paths for `config.ts`, `global.css` / styles, blog collection dir, `content.config.ts`. If they differ from the canonical paths above, note the real paths — later tasks use them.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold AstroPaper, remove Next.js template"
```

---

### Task 2: Site config, metadata, and social

**Files:**
- Modify: `src/config.ts` (the `SITE` object)
- Modify: social links data file (AstroPaper v5: `src/constants.ts` `SOCIALS`, or `src/data/` — use the path found in Task 1 Step 7)
- Modify: `astro.config.ts` (`site:` field)

**Interfaces:**
- Consumes: paths confirmed in Task 1.
- Produces: correct global metadata consumed by every layout/page.

- [ ] **Step 1: Set astro.config site**

In `astro.config.ts`, set `site: "https://abhiram.cyou"`.

- [ ] **Step 2: Set SITE config**

In `src/config.ts`, set:
```ts
export const SITE = {
  website: "https://abhiram.cyou/",
  author: "Abhiram Chakkiyar",
  profile: "https://abhiram.cyou/",
  desc: "Writer who codes. Essays and notes on making complex things clear — in docs, code, and pixels.",
  title: "Abhiram Chakkiyar",
  ogImage: "og.png",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 6,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: true,
  showBackButton: true,
  editPost: { enabled: false },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "en",
  timezone: "Asia/Kolkata",
} as const;
```
(Keep keys that the installed version's type requires; drop any it rejects — match the scaffolded shape.)

- [ ] **Step 3: Set socials**

In the socials constant, enable and set: GitHub `https://github.com/chakkiyar102`, X/Twitter `https://twitter.com/abhichakkiyar`, LinkedIn `https://linkedin.com/in/abhiramchakkiyar`, Mail `mailto:abhiram@chakkiyar.org`. Disable the rest (`active: false`).

- [ ] **Step 4: Build and grep for stale template strings**

Run:
```bash
npm run build
grep -rIn "localhost:3000\|Your Name\|@yourhandle\|satnaing\|/static/favicons" dist src | grep -v node_modules || echo "CLEAN"
```
Expected: `CLEAN` (no Next.js leftovers; the `satnaing` author defaults replaced).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: configure SITE metadata and socials"
```

---

### Task 3: Marine / watercolor palette recolor

**Files:**
- Modify: `src/styles/global.css` (or the theme's color-token file found in Task 1 — AstroPaper v5 defines CSS custom properties under `@layer base` with `:root` and `html[data-theme="dark"]`)

**Interfaces:**
- Produces: marine light + deep-water dark color schemes applied site-wide via existing theme variables (no markup changes needed).

- [ ] **Step 1: Replace light-mode tokens**

In the `:root` / light block, set the theme's color variables to a marine-on-parchment scheme. Reference values (map onto whatever variable names the theme uses — `--background`, `--foreground`, `--accent`, `--muted`, `--border`):
```
background: #f4f1e8   /* warm-cool parchment */
foreground: #15363d   /* deep marine ink */
accent:     #0e8a8a   /* teal */
muted:      #5b7d80
border:     #d8d2c2
```

- [ ] **Step 2: Replace dark-mode tokens**

In the `html[data-theme="dark"]` block:
```
background: #0c1f29   /* deep water navy */
foreground: #e6f0ee
accent:     #5fd0c5   /* aqua, desaturated for dark */
muted:      #8fb0b2
border:     #1f3b45
```

- [ ] **Step 3: Verify contrast**

Confirm foreground/background pairs meet WCAG AA (>= 4.5:1) for both modes. Use any contrast checker; adjust foreground darkness/lightness if it fails. Record the ratios in the commit message.

- [ ] **Step 4: Render check**

Run: `npm run dev` then load `http://localhost:4321/` in both light and dark (toggle). Expected: marine light + deep-water dark, no unreadable text, no leftover black/white theme defaults.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "style: recolor theme to marine/deep-water palette (AA verified)"
```

---

### Task 4: Watercolor component, paper texture, serif display accent

**Files:**
- Create: `src/components/Watercolor.astro`
- Create: `src/components/PaperTexture.astro`
- Modify: the base layout (`src/layouts/Layout.astro`) to mount `PaperTexture` behind content
- Modify: `src/styles/global.css` (font-face / display accent wiring), `src/config.ts` or font import location for the serif

**Interfaces:**
- Produces:
  - `Watercolor.astro` — props `{ tint?: string; opacity?: number; class?: string }`, renders an absolutely-positioned soft SVG/gradient blob.
  - `PaperTexture.astro` — zero-prop, renders fixed full-viewport two-layer texture behind content.
  - CSS class `.display-serif` applying the italic serif accent.

- [ ] **Step 1: Build PaperTexture**

`src/components/PaperTexture.astro` — fixed, `inset-0`, `-z-10`, `pointer-events-none`, two stacked layers: (a) base subtle paper via repeating gradients / inline SVG `feTurbulence` fractalNoise at low opacity, (b) finer grain layer. Respect dark mode (lower opacity on dark). Keep total opacity light (≈0.04–0.08) so text contrast holds.

```astro
---
---
<div aria-hidden="true" class="paper-texture pointer-events-none fixed inset-0 -z-10">
  <svg class="absolute inset-0 h-full w-full opacity-[0.05] mix-blend-multiply dark:opacity-[0.08] dark:mix-blend-screen">
    <filter id="paperBase"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="7"/></filter>
    <rect width="100%" height="100%" filter="url(#paperBase)"/>
  </svg>
  <svg class="absolute inset-0 h-full w-full opacity-[0.04] mix-blend-multiply dark:opacity-[0.06] dark:mix-blend-screen">
    <filter id="paperGrain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/></filter>
    <rect width="100%" height="100%" filter="url(#paperGrain)"/>
  </svg>
</div>
```

- [ ] **Step 2: Mount texture in base layout**

In `src/layouts/Layout.astro`, render `<PaperTexture />` just inside `<body>` before the page content.

- [ ] **Step 3: Build Watercolor**

`src/components/Watercolor.astro`:
```astro
---
interface Props { tint?: string; opacity?: number; class?: string; }
const { tint = "#5fd0c5", opacity = 0.35, class: klass = "" } = Astro.props;
---
<div aria-hidden="true" class={`watercolor pointer-events-none absolute ${klass}`} style={`--wc-tint:${tint};--wc-opacity:${opacity}`}>
  <svg viewBox="0 0 200 200" class="h-full w-full">
    <defs>
      <filter id="wc"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="28"/></filter>
      <radialGradient id="wcg"><stop offset="0%" stop-color="var(--wc-tint)" stop-opacity="var(--wc-opacity)"/><stop offset="70%" stop-color="var(--wc-tint)" stop-opacity="0"/></radialGradient>
    </defs>
    <circle cx="100" cy="100" r="90" fill="url(#wcg)" filter="url(#wc)"/>
  </svg>
</div>
```
(Give each instance a unique filter id if multiple appear on one page — suffix with an index prop — to avoid SVG id collisions.)

- [ ] **Step 4: Wire serif display accent**

Add Fraunces italic (Google Fonts) via the theme's font setup. Add `.display-serif { font-family: "Fraunces", serif; font-style: italic; }` in global.css. Apply to the site wordmark/title and post `<h1>` (via the theme's heading override or a class on the title component).

- [ ] **Step 5: Render check**

Run dev server. Expected: subtle paper texture visible behind content (not muddy), watercolor renders with soft bleeding edge, serif italic on title/headings, contrast still fine.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add watercolor + paper texture components and serif accent"
```

---

### Task 5: Essays/Notes content split

**Files:**
- Create dirs: `src/data/blog/essays/`, `src/data/blog/notes/` (move existing demo posts or remove them)
- Create: `src/pages/essays/index.astro`, `src/pages/notes/index.astro` (listing pages filtered by subdirectory)
- Modify: `src/components/Header.astro` (or nav constants) — add Essays + Notes nav links
- Reference: `src/content.config.ts` (confirm subdirectory slugs work; AstroPaper maps subdir → URL segment)

**Interfaces:**
- Consumes: AstroPaper blog collection + its `getSortedPosts`/`getPostsByGroupCondition` helpers (path confirmed in Task 1).
- Produces: `/essays` and `/notes` index pages; posts addressable at `/essays/<slug>` and `/notes/<slug>` (or the theme's `/posts/...` scheme with category filter — use whichever the subdir feature yields).

- [ ] **Step 1: Create the two subdirectories with one demo post each**

Move two of the scaffold's demo posts into `essays/` and `notes/` (temporary, replaced in Task 9). Confirm frontmatter has required fields (`title`, `pubDatetime`, `description`, `tags`, `draft`).

- [ ] **Step 2: Build essays listing page**

`src/pages/essays/index.astro` — import the theme's post helpers, filter posts whose id/filepath starts with `essays/`, render with the theme's `Card`/listing component and `Main`/`Layout`. Title "Essays".

- [ ] **Step 3: Build notes listing page**

Same as Step 2 for `notes/`, title "Notes".

- [ ] **Step 4: Add nav links**

Add "Essays" → `/essays`, "Notes" → `/notes` to the header nav (theme nav config or `Header.astro`).

- [ ] **Step 5: Build + render check**

Run `npm run build` then `npm run dev`. Visit `/essays`, `/notes`, and a post URL in each. Expected: both lists render only their own posts; post pages render; nav links work.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: split content into essays and notes streams"
```

---

### Task 6: Projects collection + page

**Files:**
- Modify: `src/content.config.ts` — add a `projects` collection schema
- Create: `src/data/projects/` with 1–2 `DRAFT` example project files
- Create: `src/components/ProjectCard.astro`
- Create: `src/pages/projects/index.astro`
- Modify: header nav — add Projects link

**Interfaces:**
- Produces:
  - `projects` collection, schema: `{ title: string; summary: string; why: string; link?: string; repo?: string; year: number; tags?: string[]; featured?: boolean; draft?: boolean }`.
  - `ProjectCard.astro` — props `{ project }`, renders title, summary, why, link/repo, watercolor tint.
  - `/projects` page listing non-draft projects (drafts shown only in dev).

- [ ] **Step 1: Add projects collection schema**

In `src/content.config.ts`, define:
```ts
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    why: z.string(),
    link: z.string().url().optional(),
    repo: z.string().url().optional(),
    year: z.number(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().default(false),
  }),
});
export const collections = { blog, projects };
```
(Merge into the existing `collections` export — keep `blog`.)

- [ ] **Step 2: Create example project files (drafts)**

Create `src/data/projects/example-project.md` with `draft: true` and a body starting `DRAFT —`. Real content arrives later from Abhiram.

- [ ] **Step 3: Build ProjectCard**

`src/components/ProjectCard.astro` rendering the fields, with a `<Watercolor tint="..." />` accent positioned in the card (card needs `relative overflow-hidden`).

- [ ] **Step 4: Build /projects page**

`src/pages/projects/index.astro` — `getCollection("projects")`, filter out drafts in prod (`import.meta.env.PROD`), sort by `year` desc then featured first, render `ProjectCard` grid inside the theme layout. Title "Projects".

- [ ] **Step 5: Add nav link**

Add "Projects" → `/projects` to header nav.

- [ ] **Step 6: Build + render check**

Run build + dev. Visit `/projects`. Expected: card(s) render with watercolor tint; prod build excludes drafts (`npm run build` then grep `dist` for the draft title returns nothing).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: add projects collection and page"
```

---

### Task 7: Home / hero recolor + avatar

**Files:**
- Modify: `src/pages/index.astro` (theme homepage)
- Create: `src/components/Avatar.astro`
- Add (later): `public/avatar.jpg` (real photo, dropped in on arrival)

**Interfaces:**
- Produces: `Avatar.astro` — props `{ src?: string; alt: string }`, renders the photo if `src` exists else a marine monogram fallback ("AC"). Used on home + about.

- [ ] **Step 1: Build Avatar component**

```astro
---
interface Props { src?: string; alt: string; size?: number; }
const { src, alt, size = 128 } = Astro.props;
---
{src ? (
  <img src={src} alt={alt} width={size} height={size} class="rounded-2xl object-cover shadow-md" />
) : (
  <div class="flex items-center justify-center rounded-2xl shadow-md display-serif text-4xl text-white"
       style={`width:${size}px;height:${size}px;background:linear-gradient(135deg,#0e8a8a,#5fd0c5)`}
       aria-label={alt}>AC</div>
)}
```

- [ ] **Step 2: Rewrite homepage hero**

In `src/pages/index.astro`: hero with `<Avatar src={...} alt="Abhiram Chakkiyar" />` (src points to `/avatar.jpg` — fallback shows until file added), wordmark in `.display-serif`, the line "Writer who codes — I make complex things clear, in docs, code, and pixels.", a `<Watercolor />` wash behind the hero. Below: featured essay (most recent from `essays/`), recent notes (3), project teasers (2 featured). Reuse theme card components.

- [ ] **Step 3: Render check**

Run dev, load `/`. Expected: hero with monogram fallback + watercolor wash, serif wordmark, featured essay + notes + project teasers all linking correctly.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: recolor home hero, add avatar slot, watercolor wash"
```

---

### Task 8: About page

**Files:**
- Modify: the theme's about page (`src/data/blog/`? no — AstroPaper about lives at `src/pages/about.md` or `src/data/...`; use path from Task 1)

**Interfaces:**
- Consumes: `Avatar`, `Watercolor`.

- [ ] **Step 1: Rewrite about content**

Replace with a real bio in Abhiram's voice (drafted with kf-writer / skilled-writer in Task 9's voice pass — placeholder acceptable here, finalized in Task 9): writer-who-codes story, what he makes, link to projects + colophon. NO employer-internal/customer detail. Mention role at a high level only if desired.

- [ ] **Step 2: Add avatar + watercolor to about**

Include `<Avatar src="/avatar.jpg" alt="Abhiram Chakkiyar" />` and a subtle `<Watercolor />`.

- [ ] **Step 3: Render check**

Run dev, load `/about`. Expected: renders with real bio, avatar fallback, watercolor.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: rewrite about page with real bio"
```

---

### Task 9: Content seeding (intro essay, drafts, voice pass)

**Files:**
- Create: `src/data/blog/essays/colophon.md` (real intro/colophon essay)
- Create: `src/data/blog/notes/<draft-note>.md` (`draft: true`, marked DRAFT)
- Modify: about page copy (finalize voice)
- Delete: any remaining scaffold demo posts

**Interfaces:** none (content only).

- [ ] **Step 1: Remove demo posts**

Delete all scaffold demo `.md` from `src/data/blog/` except the new essays/notes created here.

- [ ] **Step 2: Write the intro/colophon essay**

Using the `kf-writer` (or `skilled-writer`) skill, write `colophon.md` in Abhiram's voice: what this site is, who he is (writer who codes), how it's built (AstroPaper, recolored marine/watercolor), no em-dashes per his style. Full frontmatter (`title`, `pubDatetime`, `description`, `tags: ["meta"]`, `draft: false`). This is the one real published piece.

- [ ] **Step 3: Add one DRAFT note stub**

Create a `notes/` file with `draft: true`, body begins `DRAFT —`, as a shape example.

- [ ] **Step 4: Finalize about voice**

Apply the same skill to polish the about page copy from Task 8.

- [ ] **Step 5: Build + verify draft exclusion**

Run `npm run build`. Expected: build clean. `grep -rIl "DRAFT" dist` returns nothing (drafts excluded from prod).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "content: add intro/colophon essay, draft stubs, final about copy"
```

---

### Task 10: Final verification + deploy prep

**Files:**
- Create: `vercel.json` only if needed (Astro static usually auto-detected; add `@astrojs/vercel` adapter only if SSR features require it — they don't here, keep static)
- Modify: `README.md` (replace AstroPaper readme with a short project readme)

**Interfaces:** none.

- [ ] **Step 1: Full build + lint**

Run:
```bash
npm run build
npm run lint 2>/dev/null || npx astro check
```
Expected: build succeeds, no type/lint errors.

- [ ] **Step 2: Stale-string scrub**

Run:
```bash
grep -rIn "localhost:3000\|Your Name\|@yourhandle\|satnaing\|/static/favicons\|chakkiyar.org" dist | grep -v "abhiram@chakkiyar.org" || echo "CLEAN"
```
Expected: `CLEAN` (only the real email may match, which is allowed).

- [ ] **Step 3: Feature smoke test**

Run `npm run dev`. Verify: `/`, `/essays`, `/notes`, `/projects`, `/about`, one essay, one note all render with no console errors; search (Pagefind) returns results after a build+preview (`npm run preview`); `/rss.xml` and sitemap exist in `dist/`.

- [ ] **Step 4: a11y/contrast spot check**

Run Lighthouse (or axe) on `/` and a post page in both themes. Expected: a11y score not regressed below AstroPaper baseline (~100); contrast passes.

- [ ] **Step 5: Replace README**

Short readme: what the site is, stack (AstroPaper-based), how to run (`npm run dev`), deploy (Vercel, static).

- [ ] **Step 6: Final commit**

```bash
git add -A && git commit -m "chore: final build verification, readme, deploy prep"
```

- [ ] **Step 7: Hand off for Vercel**

Report to Abhiram: branch `rework-paper-site` ready, how to preview, note that Vercel project may need its build framework preset switched from Next.js to Astro (Output: static, build `npm run build`, dir `dist`). Merge to `main` triggers deploy. Drop real `public/avatar.jpg` before or after merge.

---

## Self-Review

**Spec coverage:** stack swap (T1), config/metadata/social + bug elimination (T2), marine/deep-water palette (T3), watercolor+texture+serif (T4), essays/notes split (T5), projects collection+page (T6), home/hero/avatar (T7), about (T8), intro essay + drafts + voice (T9), build/a11y/RSS/search/deploy (T10). All spec sections mapped.

**Placeholder scan:** real code/commands in every step; draft content is intentionally marked `DRAFT`/`draft: true` per the no-fabrication constraint, not a plan placeholder.

**Type consistency:** `Watercolor` props `{tint,opacity,class}` consistent T4→T6/T7; `Avatar` props `{src,alt,size}` consistent T7→T8; `projects` schema fields consistent T6→ProjectCard. Paths flagged "confirm in Task 1 Step 7" where the installed AstroPaper version may differ from canonical v5 layout.
