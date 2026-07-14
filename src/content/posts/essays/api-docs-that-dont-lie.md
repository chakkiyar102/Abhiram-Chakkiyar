---
author: Abhiram Chakkiyar
pubDatetime: 2026-07-16T09:00:00Z
title: "API Docs That Don't Lie"
featured: false
draft: true
tags:
  - docs-rebuild
  - ai
  - api-docs
  - documentation
description: "Part 2 of The Docs Rebuild: turning a Postman collection into a Scalar API reference with real schemas — and the agent that refused to make things up."
---

<video autoplay loop muted playsinline poster="/essays/api-docs-that-dont-lie/hero-poster.png" style="width:100%;border-radius:12px;">
  <source src="/essays/api-docs-that-dont-lie/hero.mp4" type="video/mp4" />
</video>

Halfway through migrating our API documentation, one of my agents told me no.

It was documenting the Portals module of our new API reference, filling in request and response schemas from the evidence in our old collection. For four endpoints, the only captured response was a generic acknowledgement: a status and a message, nothing more. A richer schema would have looked better on the page, and the agent had a folder full of plausible field names it could have borrowed from neighboring endpoints. It wrote the thin, honest schema instead, and flagged exactly why: the source data did not support anything more.

That refusal is my favorite moment of the entire rebuild. Not the 456 schemas that got written. The four that didn't.

I run the documentation team at [Kissflow](https://kissflow.com), and this is part 2 of four on how we rebuilt our docs from scratch with AI agents doing the hands-on work and me directing. [Part 1](/posts/essays/we-replaced-our-9000-dollar-docs-platform) covered moving 556 help articles off a rented platform and into a git repo. This one covers the other half of the estate: our REST API documentation, which lived in a [Postman](https://www.postman.com) collection, and which had to become something better without a single invented field on the way.

## A contract, not a *brochure*

Help articles and API docs fail differently. A stale help article wastes a reader's afternoon. A stale API reference breaks a developer's integration at two in the morning, in production, in code they shipped weeks ago. Every field name in an API reference is a promise, and a promise you cannot verify is just a guess wearing documentation's clothes.

Our promises lived in a Postman collection: 106 requests across 10 folders, covering six product modules. Postman is a fine tool for *making* API calls, and a precarious home for *documenting* them. The collection was exported and passed around as a file. Its response examples had been captured by hand, some of them years ago, some of them pasted in from a browser console. There was no [OpenAPI](https://www.openapis.org) spec, the standard, machine-readable format the rest of the tooling world builds against. Even our authentication was folk knowledge: two custom headers on every request, not modeled in Postman's own auth block, just typed into each request by whoever built it.

The destination was clear enough. An OpenAPI spec as the single source of truth, rendered by [Scalar](https://scalar.com), an open-source API reference UI, and mounted inside the same [Fumadocs](https://fumadocs.dev) site the help articles now live in. One docs estate, one repo, one deploy.

The interesting question was how to get from one to the other without laundering guesses into promises. Pure automation was on the table: converters exist that mechanically turn a Postman collection into an OpenAPI file, and what they produce is technically valid and uselessly shallow. Pure manual authoring was available too, and would have burned weeks re-deriving information the collection already held. So we split the difference.

![The migration path: a Postman collection of 106 requests is converted and sanitized into an OpenAPI spec, then enriched one agent per module into a Scalar-rendered reference with a live Try It panel. The enrichment rule: never invent data.](/essays/api-docs-that-dont-lie/postman-openapi-scalar.svg)

A conversion script built the scaffold. Then one agent per module walked through its slice of the spec and enriched it: real schemas, real descriptions, real examples, drawn strictly from what the Postman collection itself contained. Each agent worked under one standing rule, written into its brief: you may organize, infer structure, and clean up, but you may not invent data. If the evidence is thin, the schema is thin, and you say so.

That rule is where the Portals refusal came from. It was not the agent being cautious. It was the agent doing exactly what the brief said, in a spot where a lazier setup would have quietly made something up.

## Reading the *manual* before the plan

Before any of that ran, something happened during planning that I have been thinking about since.

The plan called for two pieces of infrastructure: a dropdown in the docs sidebar to switch between the help docs and the API reference, and a security model for our two-header authentication. I had a picture in my head of both. So did the agent drafting the plan. Both pictures were wrong.

Instead of writing the plan from memory, the agent installed the actual packages and read their type definition files, the machine-checked `.d.ts` manifests that declare what a library really exposes. Two design errors surfaced before a line of code existed:

**The component we planned around does not exist.** The plan assumed Fumadocs shipped a `RootToggle` component for the sidebar dropdown, because Fumadocs' own site has that dropdown. The installed version has no such export. What it has is a `tabs` prop on its layout component that renders the same dropdown a different way. Designing against the imagined component would have failed on day one of implementation.

**The auth model we planned is illegal in OpenAPI.** The plan said "one shared apiKey scheme" for our two custom headers. OpenAPI's `apiKey` security scheme carries exactly one header. The correct model is two schemes joined in a single AND requirement, so every operation demands both headers together. Get that wrong and every generated code sample teaches developers to authenticate incorrectly.

Both corrections went into the design spec with a note explaining the change, not silently patched. And the same verify-first habit ran down the whole stack: the lint gate for the spec was chosen by running two rulesets against a throwaway file and watching what failed, using [Redocly](https://redocly.com)'s linter, rather than trusting the docs' description of either.

> Training-data memory is a beautifully confident liar. The installed package is the only edition of the truth that compiles.

If you have read part 1, you will recognize the shape. It is the fact-check stage from our article pipeline, pointed at a plan instead of a paragraph. Check the claim against the artifact, before the claim gets expensive.

## Agents grading *agents*

The build itself ran on a pattern I have come to trust: subagent-driven development. Every task in the plan got a fresh implementer agent. Every implementation got a fresh reviewer agent that had no stake in the work, read the brief and the diff independently, and re-ran the verification commands instead of trusting the implementer's report. Anything important looped back for a fix and a re-review. Across the whole migration that came to 15 implementer dispatches and around 19 reviewer and fix dispatches, ending in one final review of the entire branch with fresh eyes.

The enrichment agents worked one module at a time, never two at once, since they all edit the same spec file. Six modules went through: users and groups, portals, processes, boards, dataforms, datasets. By the end, 87 API paths and 105 operations were fully documented, with 456 response schemas and 49 request-body schemas, every one traceable to captured data.

What sold me on the reviewer half of the pattern is how specific the catches were:

The Boards reviewer got suspicious that some "list" endpoints returning a single object might secretly be wrapped arrays. It hand-checked nine endpoints against the raw Postman data. The implementation turned out correct in every case, including one endpoint that genuinely does wrap its result in an array, which the implementer had correctly modeled differently from its eight flat siblings. A review that re-derives the answer is worth ten that read the summary.

The Dataforms reviewer caught the subtlest honesty bug of the whole run. The enrichment had marked fields like `Blood_group` and `Emergency_contact` as required in response schemas. Those fields are real, and they really came back in the captured responses. But they belong to the one demo form somebody used to capture the example years ago. Marking them required promises every customer's form will have them, which is false. The fix kept only genuine system fields required and let the rest be what they are: one account's data, not the contract.

And the Dataforms *implementer* earned its keep too. Four operations had been written off earlier as "truncated, unrecoverable" because their captured responses were mangled console pastes. The agent went back to the raw data and found only two were beyond recovery. One had the full listing sitting intact below the mangled preview. The other was not data loss at all, just a trailing comma breaking the parse. It recovered full schemas for both instead of settling for the label it had been handed.

![The finished API reference rendered by Scalar: the Users and groups module with a Get user details operation, path parameters, a generated cURL example carrying both access-key headers, and a live Test Request button.](/essays/api-docs-that-dont-lie/api-reference-tryit.png)

This is what came out the other end. Every operation gets a generated code sample, and the one in that screenshot carries the proof of the auth correction from planning: both custom headers, together, on every request. There is also a Test Request button, which is a bigger deal than it looks. A reference where you can fire the real call at the real API is a reference that gets caught the moment it drifts. Docs you can execute are docs that stay honest.

## What went *wrong*

Three failures worth your time, in ascending order of how long they took to find.

**The source was lying before we ever touched it.** The converter choked immediately: 22 of the collection's captured response bodies were not valid JSON. Twelve were the literal placeholder text `<binary>`, left where file-download responses would have been. Four were Chrome DevTools console pastes, cut off mid-object. Six were simply empty. The first fix handled exactly the twelve known cases, because I had told the agent nothing else was broken, based on my own incomplete scan. The lesson landed on the second pass: stop patching the examples you know about and generalize. The rewritten sanitizer tried to parse every response body, replaced anything unparseable with an empty object, and logged a warning naming the operation. It caught all 22 cases, including the ten my scan missed, and along the way exposed a bug in its own diagnostic script that had been silently skipping empty bodies.

The dishonesty had layers. Deep in the dataset module, the final enrichment agent found five responses documented as the literal two-character string `{}` when the captured body was zero-length. Claiming a body says `{}` when there is no body at all is a small lie, but it is exactly the kind an integration test trips over. It became an honest empty example with a note.

**The ghost in the servers block.** Every task-level review had passed. Then the final whole-branch review, the one agent that read everything with fresh eyes, found that the generated spec's `servers` block still contained raw Postman leftovers: a URL template reading `http://{{baseurl}}` and a placeholder hostname that pointed nowhere. Individually, every task had been correct. The conversion task correctly converted; the enrichment tasks correctly enriched around it. But that block is what Scalar's Try It feature dials, so the flagship interactive feature of the new reference was silently broken, and no single-task review could have seen it, because no single task owned it. Whole-branch review is not a formality. It is the only reviewer whose job description includes the gaps between tasks.

**The fix that brought a plus-one.** Repairing that servers block should have touched about 15 lines of a 33,000-line JSON file. The first attempt loaded the whole file through a JSON parser and wrote it back out, and the parser, doing nothing wrong by its own lights, re-escaped every literal Unicode character in the file on the way through. Every em-dash in the file turned into its escape code, `\u2014`, in schema descriptions nowhere near the fix. Nobody read all 33,000 lines to catch it. What caught it was a habit: check the size of the diff against the size of the intention.

```text
$ git diff --stat public/openapi/kissflow-api.json

  public/openapi/kissflow-api.json | ~145 lines changed

  intended     ~15 lines  (servers block + one dead auth scheme)
  unexplained  ~130 lines (literal unicode re-escaped by a JSON round-trip)

  verdict      revert. redo as a 15-line text edit.
```

The redo edited those fifteen lines as text and left the rest of the file alone. A diff that is ten times bigger than your intention is not more thorough. It is your first warning that something you did not intend came along for the ride.

> The diff is the product. If you cannot explain a line of it, you are not done reviewing; you have found the next thing to review.

## The *numbers*

| | |
| ---: | :--- |
| **106** | requests in the Postman collection we started from |
| **87 / 105** | API paths and operations in the finished OpenAPI spec |
| **456** | response schemas authored from real captured data |
| **49** | request-body schemas |
| **22** | invalid response bodies in the source, found and handled honestly |
| **15** | implementer agent dispatches |
| **~19** | reviewer and fix dispatches on top of them |
| **2** | design errors caught by reading type definitions before code |
| **3** | pre-existing lies in the spec found and fixed |
| **0** | critical or important issues open at merge |

## The *workbench*

Same terminal as part 1, different skills loaded. Three did the heavy lifting here.

**Doc-prep** is the standing rule that no doc gets drafted from memory. Before writing, build the outline from a knowledge graph of the subject and fact-check every claim against a structural index of the code. For this migration the "doc" was an API contract, but the discipline is identical, and the graph and index, built with graph tooling the agents query directly, are what the fact-check stage runs against.

**Subagent-driven development** is the packaged version of the implementer-reviewer pattern above: fresh agent per task, fresh reviewer per result, re-run the commands, never grade your own homework, end with a whole-branch review. I did not invent it; I just refuse to run a multi-day build without it now.

And [Playwright](https://playwright.dev) stayed hooked in as the agents' browser, which mattered on the day the usual verification trick failed. Scalar renders its UI entirely in the browser, so fetching the page's raw HTML shows an empty shell, and the planned check would have passed on nothing. The agent read the library's actual shipped code, understood why, and switched to driving a real browser: navigate, snapshot the rendered interface, confirm all six modules present. Verify against reality, even when reality requires a browser.

My own job description did not change between part 1 and part 2: write the briefs, read the diffs, and refuse to accept "it works" where the bar is "it is true."

## What's *next*

So the estate is whole. 1,700-plus pages of help docs, and now an API reference where every schema traces to evidence and the Try It button fires real requests. Everything a reader could want, provided readers are willing to go find it.

Most aren't. Watch people arrive at a docs site and you see the same scene: they do not want to *read the reference*, they want *their answer*. They arrive holding a question shaped like their problem, and we hand them a library shaped like our product. The gap between those two shapes is where docs teams quietly lose most of the trust the writing earned.

We had just spent weeks making the corpus true. The next move was making it answer. Not a search box that returns ten links to maybe-relevant pages, but something you can ask in plain language that replies from the docs, cites its sources, and refuses to bluff past the edges of what it knows. Building that meant giving our docs the same treatment we had just given our API: a structure underneath, a contract about honesty, and a way to catch it lying.

That is part 3.

<hr />
<p><em>This is part 2 of <strong>The Docs Rebuild</strong>, a four-part series on rebuilding Kissflow's help docs with Claude Code.</em></p>
<p>
<em>← Previous: <a href="/posts/essays/we-replaced-our-9000-dollar-docs-platform">We Replaced Our $9,000-a-Year Docs Platform with a Git Repo</a></em><br />
<em>Next: <a href="/posts/essays/an-answer-engine-not-a-search-box">An Answer Engine, Not a Search Box</a> →</em>
</p>
