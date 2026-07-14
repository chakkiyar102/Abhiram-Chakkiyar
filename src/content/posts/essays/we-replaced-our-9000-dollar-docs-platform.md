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

<video autoplay loop muted playsinline poster="/essays/we-replaced-our-9000-dollar-docs-platform/hero-poster.png" style="width:100%;border-radius:12px;">
  <source src="/essays/we-replaced-our-9000-dollar-docs-platform/hero.mp4" type="video/mp4" />
</video>

Two artifacts sat in front of me this summer. One was a renewal line for our documentation platform: $9,000 for the year, same as last year, same as the year before. The other was a single command an agent had just run in a terminal: `git init`.

For nine thousand dollars a year, we got a place to type. For the cost of an empty folder, we got everything the last decade of software practice has learned about text: version control, diffs, review, pipelines, deploy previews. The gap between those two artifacts is what this series is about.

I run the documentation team at [Kissflow](https://kissflow.com). I am a writer, not an engineer. I did not write the code for any of what follows, and that is the point. I directed a fleet of AI agents, reviewed what they produced, and made the calls a docs lead makes anyway: what is true, what is good enough, what ships. This post is the first of four on how we rebuilt Kissflow's help docs from scratch, and it covers the move itself: 556 articles out of a rented platform and into a repository, plus the quality pipeline that made the migrated content trustworthy. Also the things that broke, because things broke.

## Why we *left*

Our previous docs platform was not a bad product. It hosted our help center for years and did what that category of tool does: a browser editor, a publish button, a search box, a theme we could nudge but never own.

The trouble was everything around the typing. Docs on a hosted platform are a database you visit through a web form. There is no diff that shows you exactly what changed between Tuesday and Thursday. There is no branch where a risky rewrite can sit until someone approves it. There is no way to run a script over all your articles and ask a question as basic as "which pages link to a page that no longer exists?" Every quality process we wanted lived one API or one export screen out of reach.

Then the ground shifted under the whole question. By this year, the best writing help I have ever had comes from AI agents, and agents are hopeless inside someone else's web editor. They are at home in a git repo. Plain text files, a folder structure, a build command: that is an environment where an agent can read every article, check every claim, fix every link, and show you its work as a diff you can approve or reject. The platform fee was the excuse. The workflow was the reason.

> The $9,000 was never the real cost. The real cost was owning our most important text and not being able to run so much as a spell-check across all of it at once.

So the destination became obvious: a git repository of [MDX](https://mdxjs.com) files, built into a site with [Fumadocs](https://fumadocs.dev), deployed on [Vercel](https://vercel.com). Boring, proven pieces. The interesting part was getting 556 articles out of the old system and making them worth reading again.

## The *crawl*

The old platform held years of accumulated help content, and the practical way out was the front door: load every article in a real browser and take it.

An agent wrote a crawler on [Playwright](https://playwright.dev), the browser-automation tool, and we split the work across 8 concurrent agent groups, each responsible for its own slice of the article list. They loaded each page as a reader would, waited for it to render, and converted the body into MDX with the images pulled down alongside. I watched progress the way a foreman watches a site: not doing the lifting, checking the loads. 556 articles came across.

Standing the new site up was anticlimactic. Fumadocs gives you the docs shell (sidebar, search, breadcrumbs, dark mode) and expects a folder of content, which we now had. The site that came out the other side is at 1,764 pages today, because once docs live in a repo, adding a surface stops being a platform negotiation and starts being a folder. Pre-release notes became pages. Product announcements, 24 of them, got their own timeline page pulled from our community posts.

![A migrated article on the new docs site: an account security guide with plan badges, a right-hand mini table of contents, and a Copy Markdown button.](/essays/we-replaced-our-9000-dollar-docs-platform/docs-article.png)

Here is what a migrated article looks like now. Plan-availability badges rendered from frontmatter. A "Copy Markdown" button, because our readers increasingly include other people's AI tools. An "Ask AI" button in the corner that we will get to in part 3.

![The announcements page: a timeline of dated release cards under a header reading "Everything new in Kissflow, as it ships."](/essays/we-replaced-our-9000-dollar-docs-platform/announcements.png)

But a migration only moves text. It does not make the text true. Years of accumulated content carries years of accumulated drift: features renamed, limits changed, screenshots gone stale, claims nobody had checked since they were written. Shipping that unexamined would have moved the problem to a nicer address.

## Four stages, no *vibes*

So every reworked article rides a pipeline. Four stages, in a fixed order, each run by agents with a deliberately different job.

![The four-stage rework pipeline drawn as stations on a line: fact-check every claim against the code, rework into house voice, review by a fresh agent against the diff, then a zero-context reader-test.](/essays/we-replaced-our-9000-dollar-docs-platform/pipeline-four-stages.svg)

**Fact-check** comes first. Before anyone touches the prose, an agent verifies every behavioral claim in the article against a structural index of the actual product code. Does this setting exist? Is this the real button label? Is this limit still the limit? Claims that cannot be verified get flagged, not reworded.

**Rework** rewrites the article into house voice, always against a concrete, already-approved reference file. Not "write it better." Match this.

**Review** hands the result to a fresh agent that was not involved in the rework. It gets the diff, the full file, and the reference, and it checks compliance without trusting the rework agent's self-report. Agents grade each other's homework here, never their own.

**Reader-test** is the stage I am proudest of, and the one I will defend to anyone who asks why four stages instead of two. A completely fresh agent, given zero context about the project, reads only the finished article. It predicts the questions a real reader would bring, tries to answer them using nothing but the doc, and flags every place it cannot.

We have pushed 59 articles through the full pipeline so far, in two batches, and the checking stages alone took 118 QA subagents: one review agent and one reader-test agent per article, all running in parallel. That sounds extravagant until you see what they caught.

The review stage caught an FAQ claiming our analytics module syncs data "as changes happen" when the source-of-truth doc says hourly, and the same FAQ granting a role sharing permissions that the permissions table explicitly denies. It caught a Microsoft Teams tutorial video embedded in the "Sign in from Google Chat" section, a copy-paste error that had survived every human pass. It caught one article renaming its own heading and silently breaking the anchor links of two sibling articles that pointed at it, which no single-file check could ever see.

> A parallel fleet is brilliant at depth and blind at width. Each agent fact-checks its own file perfectly while breaking a link in someone else's. The pipeline's stages overlap on purpose.

## What went *wrong*

Plenty. Three failures are worth your time, because each one reshaped how I run this.

**The first three stages missed things a stranger caught in minutes.** The reader-test stage exists because I got humbled. One article had a section titled "Cancel a queued backup" with a heading, a rule about when cancelling is allowed, and zero actual steps. Fact-check passed it, because it made no false claims. Rework polished it. Review approved it, because it matched the reference structure. The zero-context reader hit it and said, in effect: a reader who came here to cancel a backup cannot cancel a backup. Another article's prose said a Report Admin can delete reports "including reports created by other members," while the permissions table two sections later said own reports only. Three stages of context-soaked agents sailed past a direct contradiction because they already knew what the doc meant to say. The only agent that read the doc the way a customer does was the one that knew nothing.

**352 pages vanished, and the links were innocent.** After launch I started seeing 404s all over the site and did what everyone does: assumed link rot and asked for a link audit. The agent came back with a different story. Our `.vercelignore` file, which tells the deploy what to skip, contained the bare word `build`. Ignore-file patterns match at any depth, so along with the build junk folder it was meant to exclude, it silently excluded `content/build/`, the entire Build section of our docs. 352 pages, absent from every deploy, for weeks. The links had been pointing at pages that were never there. The fix was one leading slash per pattern, anchoring `build` to `/build`, and the whole section came back.

The audit we ran afterwards is the kind of thing that was unthinkable on the old platform and is a Tuesday in a repo:

```text
$ node scripts/link-audit.mjs

  routes   589 valid routes derived from content/**/*.mdx
  links    1,746 checked  (markdown links, hrefs, redirect frontmatter)
  graph    content-graph nodes and edges: all valid

  stale    4
```

Four stale links out of 1,746, all fixed the same afternoon. My favorite detail is the one we did not fix: one article linked to a supported-browsers page that does not exist yet. The agent proposed removing the link rather than writing a browser list from memory, because inventing facts to satisfy a link checker is still inventing facts. That page went on the authoring backlog instead.

**The supervisor's ledger is a failure surface too.** With 26 and then 33 agents running in parallel, I watched my coordinating agent repeatedly lose count of its own fleet: "30 of 33 back, 3 still running" when all 33 had already reported. It happened enough times that I finally typed, "something is not right here." The honest answer I got back: tallying dozens of async check-ins while holding a conversation is genuinely error-prone. The fix was never cleverness. It was forcing a full recount against the launch list instead of trusting a running tally. If you plan to supervise agent fleets, budget for this: the work of tracking the workers is real work, and it fails in mundane ways.

> Every failure in this section was caught by process, not by luck. That is the entire argument for owning your pipeline.

## The *numbers*

| | |
| ---: | :--- |
| **$9,000** | per year, the platform fee we walked away from |
| **556** | articles crawled out of the old platform |
| **8** | concurrent agent groups running the crawl |
| **1,764** | pages on the new site today |
| **4** | stages in the rework pipeline |
| **118** | QA subagents dispatched across two batches |
| **59** | articles through the full pipeline so far |
| **1,746** | links audited; 4 stale, then 0 |
| **352** | pages one ignore-file line silently deleted, then restored |

## The *workbench*

People ask what this actually looks like day to day, so here is the honest picture: a terminal, not a dashboard.

![The cmux workbench: two agent sessions side by side, one merging the doc-rework branch to main, the other migrating API docs from Postman, each with its own task list and background agents.](/essays/we-replaced-our-9000-dollar-docs-platform/cmux-workbench.png)

That is [cmux](https://github.com/manaflow-ai/cmux), a terminal built for running multiple AI coding agents side by side. In that frame, the left session is finishing the doc-rework merge while the right one has already started on the API reference, dispatching and re-reviewing its own subagents.

Two habits from this workbench are worth stealing. First, different models for different jobs. Across this project the roster included Codex Sol, Claude Fable, Sonnet, Opus, and OpenCode GLM 5.2, and they are not interchangeable: some are better company for planning and prose, others grind through long mechanical batches without wandering. Treat models like staff with strengths, not like a dial labeled "smart."

Second, skills over improvisation. The agents ran packaged, reusable procedures: a brainstorming skill before any creative decision, a PRD skill to pin requirements down, a tech-writing skill that carries our house style, and Playwright hooked in as a tool so agents could drive a real browser to verify their own work. A skill turns "figure it out" into a procedure the agent has already run before, and on a project this size that is most of what keeps the wheels on.

My own job description through all of it: write the briefs, review the diffs, and refuse to accept "it works" where the bar is "it is true and it is good."

## What's *next*

The help articles were only half the estate. Our API documentation was, at this point, still a Postman collection: 106 requests, exported and passed around, with response examples that had drifted from what the API actually returns. Migrating prose is one thing. Migrating a contract, where every field name is a promise to a developer, is a different sport, and it produced my favorite moment of the whole rebuild: the agent that refused to fabricate response bodies it could not verify.

That is part 2.

<hr />
<p><em>This is part 1 of <strong>The Docs Rebuild</strong>, a four-part series on rebuilding Kissflow's help docs with Claude Code.</em></p>
<p>
<em>Next: <a href="/posts/essays/api-docs-that-dont-lie">API Docs That Don't Lie</a> →</em>
</p>
