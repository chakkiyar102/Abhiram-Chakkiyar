# "The Docs Rebuild" Blog Series Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce and deploy a 4-part blog series on abhiram.cyou showing how one documentation lead used Claude Code + an agent fleet to rebuild Kissflow's help docs (Fumadocs, Scalar API/SDK docs, RAG answer engine, Spanish i18n), replacing a $9,000/year platform.

**Architecture:** Four markdown essays in the existing AstroPaper essays collection, each with a hyperframes-rendered MP4 hero, Playwright screenshots of the live docs site, designed terminal panels, and hand-drawn SVG figures. Drafts first (`draft: true`), user approval gates publish + Vercel prod deploy.

**Tech Stack:** Astro (AstroPaper) at `/Users/abhiram/abhiram-site`, hyperframes + gsap-core for heroes/motion, Playwright MCP for screenshots, ffmpeg, Vercel CLI.

**Spec:** `/Users/abhiram/abhiram-site/docs/superpowers/specs/2026-07-14-docs-rebuild-blog-series-design.md` — read it before any task.

## Global Constraints

- Disclosure hard rules (from spec, non-negotiable): Kissflow named openly; $9,000/year figure allowed; incumbent vendor NEVER named (always "our previous docs platform"); no leaked-key episode; no internal repo names beyond the kissflow-docs work; no customer data; no true-spend figures from other sessions; Abhiram is a writer/docs lead directing AI, never an engineer.
- Every screenshot audited before commit: no tokens, no private repo names, no customer names, no email inboxes. The cmux screenshot panes must be individually checked.
- Writing pipeline per post: blog-writer skill (voice + paper-design editorial system) then eos-style pass then skilled-writer pass.
- Post frontmatter must match existing essays (see Task 3 for the exact block); all four posts carry `draft: true` until Abhiram approves.
- Voice: narrative-first for docs/product people; code appears as evidence, not tutorial. Fun and instructive.
- Assets live in `/Users/abhiram/abhiram-site/public/essays/<slug>/`.
- Commits in abhiram-site end with:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` and
  `Claude-Session: https://claude.ai/code/session_017LTVR97KW7W11az2GcEgMN`
- Site build check: `cd /Users/abhiram/abhiram-site && source ~/.nvm/nvm.sh && nvm use 22.22.1 && npx astro build` must exit 0.
- Source records directory (read-only input): `MEMDIR=/Users/abhiram/.claude/projects/-Users-abhiram-Documents-KF-code-kissflow-docs/memory`
- Live docs site for screenshots: try `https://kissflow-docs.vercel.app` first; if not 200 or auth-walled, build locally in `/Users/abhiram/Documents/KF-code/kissflow-docs` (`npm run build && npx next start -p 3458`) and shoot `http://localhost:3458`. Never run `next dev` after a build there (corrupts `.next`).

## The four posts (canonical slugs + sources)

| # | Slug | Title | Primary sources (in MEMDIR unless noted) |
|---|------|-------|------------------------------------------|
| 1 | `we-replaced-our-9000-dollar-docs-platform` | We Replaced Our $9,000-a-Year Docs Platform with a Git Repo | `doc-rework-pipeline-two-batch-session-record.md`, `SESSION-2026-07-12-link-audit-roadmap-collision.md`, `SESSION-2026-07-12-announcements-page.md` |
| 2 | `api-docs-that-dont-lie` | API Docs That Don't Lie | `postman-scalar-migration-session-record.md` |
| 3 | `an-answer-engine-not-a-search-box` | An Answer Engine, Not a Search Box | `SESSION-2026-07-12-answer-engine-hero.md`, `HANDOFF-2026-07-11-rag-engine.md`, `project-rag-benchmark-vs-shwetha.md`, repo file `/Users/abhiram/Documents/KF-code/kissflow-docs/docs/session-notes/2026-07-12-theme-and-browser-branding.md` |
| 4 | `588-docs-in-spanish-for-5-dollars` | 588 Docs in Spanish for $5.07 | `SESSION-2026-07-12-spanish-i18n-pilot.md`, `project-spanish-i18n-pilot.md`, `SESSION-2026-07-13-autotranslate-detective.md` |

---

### Task 1: Series scaffolding + screenshot bank

**Files:**
- Create: `/Users/abhiram/abhiram-site/public/essays/<slug>/` (all 4 dirs)
- Create: `/Users/abhiram/abhiram-site/src/content/posts/essays/_series-nav-snippet.md` (NOT a post — underscore prefix; reference snippet used by Tasks 3–6)
- Create: `/Users/abhiram/abhiram-site/public/essays/_shots/` (raw screenshot bank, gitignored)

**Interfaces:**
- Produces: screenshot bank at `public/essays/_shots/` with the exact filenames below; series-nav HTML snippet all posts copy.

- [ ] **Step 1: Create asset dirs + gitignore the raw bank**

```bash
cd /Users/abhiram/abhiram-site
mkdir -p public/essays/we-replaced-our-9000-dollar-docs-platform \
         public/essays/api-docs-that-dont-lie \
         public/essays/an-answer-engine-not-a-search-box \
         public/essays/588-docs-in-spanish-for-5-dollars \
         public/essays/_shots
printf "public/essays/_shots/\n" >> .gitignore
```

- [ ] **Step 2: Write the series-nav snippet**

Create `src/content/posts/essays/_series-nav-snippet.md` containing:

```html
<!-- Series nav: paste at the END of each series post, edit part numbers/links.
     For part 1 omit the "Previous" line; for part 4 omit "Next". -->
<hr />
<p><em>This is part N of <strong>The Docs Rebuild</strong>, a four-part series on rebuilding Kissflow's help docs with Claude Code.</em></p>
<p>
<em>← Previous: <a href="/posts/PREV_SLUG">PREV_TITLE</a></em><br />
<em>Next: <a href="/posts/NEXT_SLUG">NEXT_TITLE</a> →</em>
</p>
```

(Confirm the live URL pattern first: run `grep -rn "getPath\|/posts/" src/utils/getPath* src/pages 2>/dev/null | head -5` and check an existing essay's URL in `dist/` after a build, or look at astro-paper.config.ts. Adjust `/posts/` prefix in the snippet to match.)

- [ ] **Step 3: Screenshot bank via Playwright MCP**

Resolve the live docs URL (Global Constraints). Then with Playwright MCP (`browser_navigate`, `browser_resize` to 1440×900, `browser_take_screenshot`), capture into `public/essays/_shots/`:

| File | URL / state |
|------|-------------|
| `hero-answer-engine.png` | `/` home, hero visible |
| `hero-answer-streaming.png` | `/` after typing a question into the ask box and submitting, mid-answer with citations |
| `docs-article.png` | any reworked article, e.g. `/docs/admin/users/user-roles-and-permissions` |
| `api-reference-tryit.png` | `/api-reference` with an endpoint expanded showing Try-It panel |
| `es-banner.png` | `/es/docs/get-started` showing the amber machine-translation banner |
| `es-hero.png` | `/es` Spanish home ("Todo sobre Kissflow, respondido") |
| `language-switcher.png` | docs page with language switcher dropdown open |
| `roadmap.png` | `/docs/roadmap` |
| `prerelease.png` | pre-release notes page |
| `announcements.png` | `/announcements` |

- [ ] **Step 4: Copy + audit the cmux screenshot**

```bash
cp "/Users/abhiram/Desktop/Screenshot 2026-07-09 at 7.03.29 PM.png" \
   /Users/abhiram/abhiram-site/public/essays/_shots/cmux-workbench.png
```

Read the image. Check every visible pane/sidebar entry for: tokens, non-kissflow-docs private repo names, emails, customer names. If anything sensitive: crop with ffmpeg (`ffmpeg -i in.png -vf "crop=w:h:x:y" out.png`) or blur the region; re-read to confirm. Record what was checked in the task summary.

- [ ] **Step 5: Audit all captured screenshots**

Read each PNG in `_shots/`. Same checklist. Kissflow product UI and public docs content are fine; anything user-account-specific (avatars/emails in a logged-in navbar) must be cropped out.

- [ ] **Step 6: Verify build unaffected + commit**

```bash
cd /Users/abhiram/abhiram-site && source ~/.nvm/nvm.sh && nvm use 22.22.1 && npx astro build
```
Expected: exit 0. Then:

```bash
git add .gitignore src/content/posts/essays/_series-nav-snippet.md public/essays/*/.gitkeep 2>/dev/null
git add .gitignore src/content/posts/essays/_series-nav-snippet.md
git commit -m "chore: scaffold docs-rebuild series (asset dirs, series nav snippet)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017LTVR97KW7W11az2GcEgMN"
```

Note: if AstroPaper's content loader chokes on `_series-nav-snippet.md` (build error about missing frontmatter), move it to `docs/superpowers/plans/series-nav-snippet.md` instead and adjust later tasks' references.

---

### Task 2: Hero design system + 4 MP4 hero loops

**Files:**
- Create: hyperframes project in `/private/tmp/claude-501/-Users-abhiram-Documents-KF-code-kissflow-docs/c844234e-22c6-4b80-9479-d3059b7d4573/scratchpad/series-heroes/`
- Create: `public/essays/<slug>/hero.mp4` + `public/essays/<slug>/hero-poster.png` (all 4)

**Interfaces:**
- Consumes: nothing from other tasks (design brief below is self-contained).
- Produces: `hero.mp4` (≤2.5MB, 1600×900, 6–10s seamless loop, no audio) + `hero-poster.png` (≤300KB) in each post's asset dir.

- [ ] **Step 1: Read the required skills**

Invoke Skill `hyperframes:hyperframes` (router), then follow it to `hyperframes-core` + `hyperframes-animation` (gsap adapter — user explicitly wants gsap-core powering the motion). Also invoke `slideshow-gate` before rendering.

- [ ] **Step 2: One design system, four variants**

Shared: paper-design parchment field (#f6f0e4-ish warm paper), Kissflow brand accents (pink #CF2C91, blue #1F80FF, orange #F58220, green #4AA147), Plus Jakarta Sans + Fraunces italic accent, hand-drawn line-art aesthetic, big typographic title matching the post. Motion identity per post:
1. **Part 1:** stack of paper cards (old platform) sweeping into a clean git-branch line drawing; "$9,000/yr" ticking down to "$0".
2. **Part 2:** a request line morphing into a truthful schema tree; a red "fabricated?" stamp being rejected.
3. **Part 3:** node-edge graph pulsing; a question dot hopping nodes to an answer with a citation tag.
4. **Part 4:** English page folding/flipping into Spanish ("Getting started" → "Primeros pasos"); "$5.07" counter.
Each 6–10s, loops seamlessly (end state == start state), no text smaller than ~28px @1600w.

- [ ] **Step 3: Build + gate + render each hero**

Per hero: author composition → `npx hyperframes lint && npx hyperframes validate` → slideshow-gate self-check (motion is the message, not animated slides) → `npx hyperframes render` at 1600×900. Then compress + poster:

```bash
ffmpeg -i render.mp4 -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -an hero.mp4
ffmpeg -i hero.mp4 -vf "select=eq(n\,0)" -vframes 1 hero-poster.png
```

Check: `hero.mp4` ≤2.5MB (raise crf to 28 if over), poster ≤300KB (pngquant/`ffmpeg -qscale` if over).

- [ ] **Step 4: Verify loops visually**

Open each MP4 (QuickTime or Playwright file:// page) — confirm seamless loop, both first and last frames, no clipped text. Copy final files into `public/essays/<slug>/`.

- [ ] **Step 5: Commit**

```bash
cd /Users/abhiram/abhiram-site
git add public/essays/*/hero.mp4 public/essays/*/hero-poster.png
git commit -m "feat: hyperframes hero loops for docs-rebuild series (4 posts)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017LTVR97KW7W11az2GcEgMN"
```

---

### Task 3: Post 1 — "We Replaced Our $9,000-a-Year Docs Platform with a Git Repo"

**Files:**
- Create: `src/content/posts/essays/we-replaced-our-9000-dollar-docs-platform.md`
- Create: `public/essays/we-replaced-our-9000-dollar-docs-platform/` inline assets (SVG figures, terminal panels, screenshots copied from `_shots/`)

**Interfaces:**
- Consumes: `_shots/` bank (Task 1), `hero.mp4`/`hero-poster.png` (Task 2), series-nav snippet (Task 1).
- Produces: complete draft post, `draft: true`, build-green.

- [ ] **Step 1: Read sources + skills**

Read (full): `$MEMDIR/doc-rework-pipeline-two-batch-session-record.md`, `$MEMDIR/SESSION-2026-07-12-link-audit-roadmap-collision.md`, `$MEMDIR/SESSION-2026-07-12-announcements-page.md`, the spec, and 2 existing essays for voice (`the-54-percent-rule.md`, `building-a-promo-without-code.md`). Invoke Skill `blog-writer`.

- [ ] **Step 2: Draft the post (2,000–3,000 words)**

Frontmatter (exact shape):

```yaml
---
author: Abhiram Chakkiyar
pubDatetime: 2026-07-15T09:00:00Z
title: "We Replaced Our $9,000-a-Year Docs Platform with a Git Repo"
featured: true
draft: true
tags:
  - docs-rebuild
  - ai
  - documentation
description: "Part 1 of The Docs Rebuild: how a writer with an agent fleet migrated 556 help articles off a $9,000-a-year platform and onto a git repo — and what broke on the way."
---
```

Structure (spec's 6 elements): cold open (a concrete moment — e.g. the renewal invoice vs `git init`); build narrative (Forumbee crawl of 556 articles via Playwright with 8 concurrent agent groups → fumadocs site, 1,764 pages; 4-stage rework pipeline: fact-check → rework → review → reader-test, 118 QA subagents over 59 articles); **What went wrong** (zero-context reader-test catching what three stages missed — heading with zero steps, prose contradicting a permissions table; `.vercelignore` bare `build` silently eating 352 pages; 1,746-link audit); numbers box; **Workbench panel** (cmux screenshot `cmux-workbench.png`, model roster: Codex Sol, Claude Fable, Sonnet, Opus, OpenCode GLM 5.2 — "different models for different jobs"; skills: brainstorming, prd, tech-writing, Playwright MCP); cliffhanger → part 2 (API docs were still a Postman collection).
Hero embed at top:

```html
<video autoplay loop muted playsinline poster="/essays/we-replaced-our-9000-dollar-docs-platform/hero-poster.png" style="width:100%;border-radius:12px;">
  <source src="/essays/we-replaced-our-9000-dollar-docs-platform/hero.mp4" type="video/mp4" />
</video>
```

Inline media (copy from `_shots/`, create figures per blog-writer's SVG style): `docs-article.png`, `announcements.png`, one SVG figure of the 4-stage pipeline, one designed terminal panel (crawl progress or link-audit output — reconstruct from records, style as blog-writer code-panel, never fabricate numbers).

- [ ] **Step 3: eos-style pass**

Invoke Skill `writing-skills:eos-style` on the draft; apply fixes.

- [ ] **Step 4: skilled-writer pass**

Invoke Skill `skilled-writer`; make it read like a human telling a story, kill any AI-ish cadence. Verify disclosure rules (grep draft for the incumbent vendor names, "key", "sk-", internal repo names — zero hits).

- [ ] **Step 5: Build + visual check**

```bash
cd /Users/abhiram/abhiram-site && source ~/.nvm/nvm.sh && nvm use 22.22.1 && npx astro build
```
Expected: exit 0. Then `npm run preview` (or `astro dev`) + Playwright: screenshot the rendered post top-fold and one mid-section; confirm hero plays, images load, series-nav renders.

- [ ] **Step 6: Commit**

```bash
git add src/content/posts/essays/we-replaced-our-9000-dollar-docs-platform.md public/essays/we-replaced-our-9000-dollar-docs-platform/
git commit -m "feat: docs-rebuild part 1 draft — replacing the \$9k/yr docs platform

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017LTVR97KW7W11az2GcEgMN"
```

---

### Task 4: Post 2 — "API Docs That Don't Lie"

**Files:**
- Create: `src/content/posts/essays/api-docs-that-dont-lie.md`
- Create: `public/essays/api-docs-that-dont-lie/` assets

**Interfaces:** same pattern as Task 3.

- [ ] **Step 1: Read sources + skills** — `$MEMDIR/postman-scalar-migration-session-record.md` (full), spec, 1 existing essay for voice. Invoke `blog-writer`.

- [ ] **Step 2: Draft (2,000–3,000 words), frontmatter as Task 3 with:**

```yaml
pubDatetime: 2026-07-16T09:00:00Z
title: "API Docs That Don't Lie"
featured: false
description: "Part 2 of The Docs Rebuild: turning a Postman collection into a Scalar API reference with real schemas — and the agent that refused to make things up."
```

Beats: cold open (the agent refusing to fabricate response bodies — best moment, lead with it); 106 Postman requests → 87 paths / 105 operations, 456 response schemas; fact-checking library claims by reading installed `.d.ts` files (caught 2 design errors before code); subagent-driven development (15 implementer + ~19 reviewer dispatches); **What went wrong** (22 invalid response bodies in the source handled honestly; the 33k-line JSON round-trip re-escaping Unicode caught by a diff-size check; `{{baseurl}}` ghosts silently breaking Try-It, found only at whole-branch review); numbers box; Workbench (skills: doc-prep, graphify/codebase-memory fact-checks, subagent-driven-development); cliffhanger → part 3 (docs you can read vs docs that answer).
Inline media: `api-reference-tryit.png`, one SVG figure (Postman → OpenAPI → Scalar flow), one terminal panel (diff-size check moment).
Series nav: prev = part 1, next = part 3.

- [ ] **Step 3–6:** identical to Task 3 steps 3–6 (eos-style, skilled-writer + disclosure grep, build + Playwright check, commit `feat: docs-rebuild part 2 draft — API docs that don't lie`).

---

### Task 5: Post 3 — "An Answer Engine, Not a Search Box"

**Files:**
- Create: `src/content/posts/essays/an-answer-engine-not-a-search-box.md`
- Create: `public/essays/an-answer-engine-not-a-search-box/` assets

**Interfaces:** same pattern; ALSO consumes the optional inline motion slide (Step 2b).

- [ ] **Step 1: Read sources + skills** — `$MEMDIR/SESSION-2026-07-12-answer-engine-hero.md`, `$MEMDIR/HANDOFF-2026-07-11-rag-engine.md`, `$MEMDIR/project-rag-benchmark-vs-shwetha.md`, `/Users/abhiram/Documents/KF-code/kissflow-docs/docs/session-notes/2026-07-12-theme-and-browser-branding.md`, spec. Invoke `blog-writer`. SANITIZE: the RAG handoff mentions a key-rotation episode — it does NOT appear in the post.

- [ ] **Step 2: Draft, frontmatter with:**

```yaml
pubDatetime: 2026-07-17T09:00:00Z
title: "An Answer Engine, Not a Search Box"
featured: false
description: "Part 3 of The Docs Rebuild: wiring a 720-node graph of help articles, API operations, and SDK pages into an answer engine — and making the homepage honest about it."
```

Beats: cold open (typing a question into your own docs and getting an answer with citations); the graph — 586 help articles + 105 API ops + 29 SDK pages as nodes, 1,044 edges; enforced citations + honest abstention ("capital of France" test); the **integrity beat** (hero promised API/SDK answers the corpus couldn't back → ingest the corpus instead of softening the copy); six hero background iterations ending at 2D glass physics ("I hate the idea of petals" — user taste driving iteration); benchmark vs LangChain+Chroma baseline: 12/12 vs 11/12 retrieval, 4.2s vs 15.8s mean latency, citations 13/13 vs none; **What went wrong** (dead search = two enum values disagreeing; broken tables = missing remark-gfm, not the model); numbers box; Workbench (impeccable, Playwright verify-in-browser, Opus verification pass); cliffhanger → part 4 (English-only engine, Spanish-speaking users).
Inline media: `hero-answer-engine.png`, `hero-answer-streaming.png`, SVG figure (question hopping graph nodes), terminal panel (benchmark table).

- [ ] **Step 2b: Inline motion slide (the one hyperframes inline for the series)**

Small hyperframes composition: a question token hopping across 4–5 graph nodes, edge lighting up, citation chip landing. 5–6s loop, 1200×675, same design system as heroes, render → `graph-hop.mp4` (≤1.5MB) + poster into the post's asset dir; embed mid-article with the same `<video>` pattern. slideshow-gate first.

- [ ] **Step 3–6:** identical to Task 3 steps 3–6 (commit `feat: docs-rebuild part 3 draft — the answer engine`).

---

### Task 6: Post 4 — "588 Docs in Spanish for $5.07"

**Files:**
- Create: `src/content/posts/essays/588-docs-in-spanish-for-5-dollars.md`
- Create: `public/essays/588-docs-in-spanish-for-5-dollars/` assets

**Interfaces:** same pattern as Task 3.

- [ ] **Step 1: Read sources + skills** — `$MEMDIR/SESSION-2026-07-12-spanish-i18n-pilot.md`, `$MEMDIR/project-spanish-i18n-pilot.md`, `$MEMDIR/SESSION-2026-07-13-autotranslate-detective.md`, spec. Invoke `blog-writer`.

- [ ] **Step 2: Draft, frontmatter with:**

```yaml
pubDatetime: 2026-07-18T09:00:00Z
title: "588 Docs in Spanish for $5.07"
featured: true
description: "Part 4 of The Docs Rebuild: localizing an entire docs site with an LLM script and a glossary, shipping it, and then solving the case of the AI that seemed to make typos."
```

Beats: cold open (the localization SaaS quote vs a $5.07 API bill); GT feasibility → fumadocs dot-suffix i18n + own-key script; the four PRD decisions; frontmatter-invariant validation as the trust mechanism; the run — 657 files, 721,862 tokens in / 711,420 out, $5.07, 5 flaky failures all recovered; **What went wrong, twice** (the `.next` corruption pre-ship; then the day-2 detective story: "the AI is making typos" → raw stream capture exonerates the model → screenshot string forensics → strings exist nowhere in the repo → Google-Translate artifacts → Chrome auto-translate mangling streamed React DOM → 34-line fix, `translate="no"` + locale-aware answers, NOT an LLM proofread pass); **series close**: aggregate numbers box (588 articles × 2 languages, 105 API ops, 29 SDK pages, 2,367 pages, 1,089 pre-release notes, 24 announcements, 720-node graph, $9,000/yr → about $5 of API calls) + the one-person-team reflection, said through the numbers; Workbench (prd, eos-style, translate script + glossary).
Inline media: `es-banner.png`, `es-hero.png`, `language-switcher.png`, SVG figure (dot-suffix file layout), terminal panel (translate-script cost line `DONE: 657/657 … cost: $5.07`).
Series nav: prev = part 3, no next; instead a "read the series from part 1" line.

- [ ] **Step 3–6:** identical to Task 3 steps 3–6 (commit `feat: docs-rebuild part 4 draft — Spanish for \$5.07`).

---

### Task 7: Series-wide review + Vercel preview deploy

**Files:**
- Modify: possibly all 4 posts (cross-post consistency fixes)

**Interfaces:**
- Consumes: all 4 committed drafts.
- Produces: Vercel preview URL for Abhiram's review.

- [ ] **Step 1: Cross-series consistency read**

Read all 4 posts start to finish in order. Check: numbers agree across posts (588 vs 556-at-migration-time is CORRECT — 556 migrated, corpus grew to 588 by i18n; make sure each post uses the right one for its moment); series-nav links resolve (slug-exact); Workbench panels don't repeat the same anecdote; each cliffhanger matches the next post's cold open; tone consistent. Fix + amend commits as needed.

- [ ] **Step 2: Disclosure sweep (final)**

```bash
cd /Users/abhiram/abhiram-site
grep -rniE "document360|zendesk|helpjuice|readme\.com|archbee|gitbook" src/content/posts/essays/ && echo "VENDOR HIT — FIX" || echo "vendor clean"
grep -rniE "sk-[a-zA-Z0-9]|api[_-]?key|kf-xg|kissflow-xg" src/content/posts/essays/*.md && echo "SENSITIVE HIT — FIX" || echo "sensitive clean"
```
Expected: both "clean". (Vendor list = common docs platforms; the real incumbent must not appear whichever it is.)

- [ ] **Step 3: Full build + preview deploy**

```bash
source ~/.nvm/nvm.sh && nvm use 22.22.1 && npx astro build
```
Expected: exit 0. Deploy preview (Vercel CLI; install if missing per plugin note):

```bash
npx vercel deploy --cwd /Users/abhiram/abhiram-site
```
Note: drafts are `draft: true` — confirm AstroPaper renders drafts in dev but hides in prod build. If drafts are invisible on the preview URL, temporarily flip `draft: false` on a preview branch deploy ONLY (never prod) so Abhiram can review rendered posts, or share `npm run preview` screenshots instead.

- [ ] **Step 4: Hand review package to Abhiram**

Deliver: preview URL (or screenshots), per-post word counts, asset weights, the sanitization sweep results. STOP — user approval gate.

---

### Task 8: Publish (ONLY after Abhiram approves each post)

- [ ] **Step 1: Flip approved posts** — `draft: true` → remove or `false`; set final `pubDatetime` values (user may want staggered dates — ask in the review handoff).
- [ ] **Step 2: Build + commit** (`feat: publish docs-rebuild series` with trailers).
- [ ] **Step 3: Prod deploy** — `npx vercel deploy --prod --cwd /Users/abhiram/abhiram-site`. Verify live URLs 200 + hero plays on prod (Playwright).
- [ ] **Step 4: Memory** — update project memory with series URLs + status.

---

## Self-Review Notes

- Spec coverage: disclosure rules → Global Constraints + Task 7 Step 2; 6-element post structure → Tasks 3–6 Step 2; workbench/cmux/models/skills → per-post beats + Task 1 Step 4; media pipeline → Tasks 1–2 + per-post assets + Task 5 Step 2b (the "1–2 inline motion max" spec line satisfied with one high-value slide); drafts-first + approval gates → `draft: true` + Task 7 Step 4 + Task 8; Vercel deploy → Tasks 7–8. No gaps found.
- Numbers cross-checked against source records (556 migrated / 588 at i18n; 105 API ops; 720 nodes / 1,044 edges; $5.07; 2,367 pages).
- URL pattern for posts is verified in Task 1 Step 2 rather than assumed.
