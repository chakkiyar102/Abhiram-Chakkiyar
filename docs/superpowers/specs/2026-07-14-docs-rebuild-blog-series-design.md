# Design: "The Docs Rebuild" — 4-part blog series

**Date:** 2026-07-14
**Target repo:** `/Users/abhiram/abhiram-site` (AstroPaper, Astro content collections)
**Deploy:** Vercel (preview → user approval → production)
**Status:** Approved by Abhiram 2026-07-14

## Purpose

A 4-part series on abhiram.cyou showing how one documentation lead — a writer,
not a coder — used Claude Code and an agent fleet to build Kissflow's new help
docs platform from scratch: Fumadocs site, Scalar-based API + SDK reference,
a graph-grounded RAG answer engine, and Spanish localization — replacing a
$9,000/year vendor platform.

**Primary reader:** docs/product people building with AI (technical writers,
PMs, docs leads). Narrative-first; code appears as evidence, not tutorial.

## Disclosure boundaries (hard rules)

- Kissflow named openly; live-site screenshots allowed.
- $9,000/year savings figure allowed.
- Incumbent vendor NEVER named — always "our previous docs platform".
- No leaked-key episode, no internal repo names other than the public
  kissflow-docs work, no customer data, no true-spend figures from other
  sessions. Screenshots audited pane-by-pane before publish (cmux screenshot
  included).
- Abhiram positioned as writer/docs lead directing AI, never as engineer.

## Series architecture

Four essays in `src/content/posts/essays/`, shared tag `docs-rebuild`,
frontmatter matching existing essays (author, pubDatetime, title, featured,
tags, description). Each post links prev/next in a small series-nav block.

Recurring structure per post:

1. **Cold open** — a concrete hook moment, not a thesis.
2. **Build narrative** — chronological, instructive, fun.
3. **"What went wrong"** — the friction section; always present, always honest.
4. **Numbers box** — designed stat panel of that post's metrics.
5. **The Workbench** — styled panel: cmux sessions, models used, skills invoked.
6. **Cliffhanger** — one paragraph teasing the next part (post 4 closes the
   series with the aggregate tally instead).

## The four posts

### Part 1 — "We Replaced Our $9,000-a-Year Docs Platform with a Git Repo"

Spine: why leave, then the migration and the quality pipeline.
Beats: Forumbee crawl of 556 articles (Playwright, 8 concurrent agent groups);
fumadocs site standing up (1,764 pages); the 4-stage rework pipeline
(fact-check → rework → review → reader-test, 118 QA subagents over 59
articles); zero-context reader-test catching what three prior stages missed
(heading with zero steps; prose contradicting a permissions table); the
`.vercelignore` bare-`build` line silently eating 352 pages; 1,746-link audit.
Workbench intro: cmux multi-session screenshot, model roster (Codex Sol,
Claude Fable, Sonnet, Opus, OpenCode GLM 5.2 — different models for different
jobs), skills named (brainstorming, prd, tech-writing, Playwright MCP).
Sources: doc-rework record, link-audit record, announcements record.

### Part 2 — "API Docs That Don't Lie"

Spine: Postman collection → Scalar/OpenAPI reference that tells the truth.
Beats: 106 Postman requests → 87 paths / 105 operations with real schemas and
456 response schemas; the agent that refused to fabricate response bodies (22
invalid bodies in the source handled honestly); fact-checking library claims
by reading installed `.d.ts` files (caught 2 design errors before code);
`{{baseurl}}` ghosts silently breaking "Try It", found only at whole-branch
review; subagent-driven development (15 implementer + ~19 reviewer
dispatches); the 33k-line JSON round-trip that re-escaped Unicode, caught by a
diff-size check. Workbench: doc-prep, graphify/codebase-memory fact-checks,
subagent-driven-development skill.
Sources: postman-scalar record, session artifact page.

### Part 3 — "An Answer Engine, Not a Search Box"

Spine: from search box to a graph-grounded answer engine with a hero to match.
Beats: 720-node content graph — 586 help articles + 105 API operations + 29
SDK pages as nodes, 1,044 edges; answers with enforced citations and honest
abstention; the integrity beat — the hero promised API/SDK answers the corpus
couldn't back, so ingest the corpus rather than soften the copy; six hero
background iterations ending at a 2D glass-physics field ("I hate the idea of
petals"); benchmark vs a LangChain+Chroma baseline: 12/12 retrieval vs 11/12,
4.2s vs 15.8s mean latency, citations enforced 13/13 vs none. Workbench:
impeccable (hero polish), Playwright in-browser verification every step, Opus
verification pass.
Sources: answer-engine-hero record, RAG handoff, benchmark record,
theme/branding session-note (sidebar garnish).

### Part 4 — "588 Docs in Spanish for $5.07"

Spine: localization pilot end-to-end, then the day-2 detective story.
Beats: GT SaaS feasibility → fumadocs dot-suffix i18n + own-key LLM script;
four PRD decisions; frontmatter-invariant validation as the trust mechanism;
657 files, $5.07, 5 flaky failures all recovered; `.next` corruption
(HTML 200 / chunks 500); ship — then "the AI is making typos": raw stream
capture exonerating the model, screenshot string forensics unmasking Chrome
auto-translate, the 34-line fix (`translate="no"` + locale answers).
Series close: aggregate numbers box (588 articles × 2 languages, 105 API ops,
29 SDK pages, 2,367 pages, 1,089 pre-release notes, 24 announcements,
720-node graph, $9,000/yr → about $5 of API calls) and the one-person-team
reflection — how times have transformed, said through the numbers.
Sources: spanish-i18n pilot pair, autotranslate-detective record.

## Media pipeline

- **Heroes:** hyperframes (gsap-core runtime) renders a 6–10s branded MP4
  loop per post; embedded as muted autoplay looped `<video>` (poster PNG
  fallback). Palette: Kissflow brand hexes on paper-design parchment.
- **UI screenshots:** Playwright drives the deployed docs site (live prod
  URLs) — hero answer engine mid-stream, /es/ banner, Scalar Try-It, roadmap.
- **Terminal shots:** styled designed code-panels (not raw screenshots) for
  translate-script runs, build output, cost lines.
- **Inline motion:** 1–2 hyperframes slides per post max, only where a concept
  needs motion (e.g. graph retrieval hop in part 3). slideshow-gate check
  before every render; ffmpeg for trim/compress/poster extraction.
- **Figures:** blog-writer's hand-drawn black line-art SVGs for concepts
  (pipeline stages, dot-suffix layout, node/edge sketch).
- Assets live in `public/essays/<slug>/`.

## Writing pipeline

blog-writer skill (paper-design editorial system, markdown twin, Abhiram's
voice) with eos-style and skilled-writer passes. Each post ~2,000–3,000 words.
All four written as drafts; user reviews each before publish/deploy.

## Site integration & ship

- Essays collection, tag `docs-rebuild`, series-nav block (plain markdown/HTML
  links; no new Astro collection or routing).
- Verify: `npm run build` green + local preview screenshots per post.
- Commit per post; Vercel preview deploy → user approval → production.

## Non-goals

- No new Astro collection/section, no scrollytelling mega-post.
- No narrated explainer videos (possible follow-up).
- No Medium cross-post work in this pass (markdown twin makes it easy later).
- No naming the incumbent vendor, ever.
