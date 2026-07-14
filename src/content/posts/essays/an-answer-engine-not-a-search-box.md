---
author: Abhiram Chakkiyar
pubDatetime: 2026-07-10T09:00:00Z
title: "An Answer Engine, Not a Search Box"
featured: false
draft: false
tags:
  - docs-rebuild
  - ai
  - documentation
description: "Part 3 of The Docs Rebuild: wiring a 720-node graph of help articles, API operations, and SDK pages into an answer engine — and making the homepage honest about it."
---

<video autoplay loop muted playsinline poster="/essays/an-answer-engine-not-a-search-box/hero-poster.png" style="width:100%;border-radius:12px;">
  <source src="/essays/an-answer-engine-not-a-search-box/hero.mp4" type="video/mp4" />
</video>

I typed "How do I add a user to Kissflow?" into our own documentation homepage and watched it answer me. Not a list of links. An answer. First the rule that gates the whole task, that only certain admins can add users manually, then the steps, streaming in one at a time, while a rail of the actual articles it drew from filled in down the right side. Four seconds, sourced, done.

![The answer mid-stream: a role rule, then numbered steps assembling one at a time, with a rail of relevant articles filling in on the right.](/essays/an-answer-engine-not-a-search-box/hero-answer-streaming.png)

I run the documentation team at [Kissflow](https://kissflow.com). I am a writer, not an engineer, and everything below was built by AI agents I directed and reviewed. This is part 3 of this series on rebuilding our help docs from scratch. Part 1 moved 556 articles into a git repo and put them through a quality pipeline. Part 2 rebuilt the API reference so it stopped lying to developers. This part is the payoff of owning all that text: turning a static docs site into something that answers questions, with receipts.

Because here is the quiet embarrassment of every documentation site, including ours until this month. A reader arrives holding a question. We hand them a search box. The search box does not answer questions. It finds pages that contain words, and then the reader, who came to us precisely because they did not know the answer, gets to guess which of ten maybes holds it.

A search box hands you maybes. An answer engine owes you one answer, and it owes you the sources.

## A graph, not a *pile*

The standard recipe for "chat with your docs" treats your content as a pile. Chop every article into chunks, embed the chunks into vectors, and when a question comes in, fetch the few chunks that sit nearest to it in vector space. It works, mostly. But it throws away the most human thing about a good docs corpus: writers link things for a reason. The permissions article points at the roles article. The billing FAQ points at the plan-limits table. Those links are years of editorial judgment about what belongs together, sitting right there in the text.

So our engine keeps the connections. Every help article became a node in a graph, carrying a snippet of its content and an embedding. Every authored cross-link between articles became an edge. When a question arrives, the engine finds its best entry points semantically, then walks the edges outward from there, so a question about user roles can pull in the permissions table from a neighboring article that never mentions the question's exact words. Today that graph holds 720 nodes and 1,044 edges.

![Anatomy of the content graph: help article, API operation, and SDK page nodes joined by cross-link edges, with a question token entering at one node and a citation coming back out.](/essays/an-answer-engine-not-a-search-box/graph-anatomy.svg)

The retrieval, animated, looks like this. A question lands on the nearest node, hops the authored edges to its neighbors, and comes back carrying a citation:

<video autoplay loop muted playsinline poster="/essays/an-answer-engine-not-a-search-box/graph-hop-poster.png" style="width:100%;border-radius:12px;">
  <source src="/essays/an-answer-engine-not-a-search-box/graph-hop.mp4" type="video/mp4" />
</video>

One detail I want on the record, because it is the whole personality of this engine: not every question deserves the expensive treatment. Shallow questions route to a lighter model; questions whose evidence spans several articles escalate to a heavier one. The engine decides based on the geometry of what it retrieved, not on how long the question looks.

## Receipts, or *silence*

The feature I insisted on hardest is not the answering. It is the two behaviors around the answering.

First, citations are not optional. The answer format itself requires the model to cite the specific nodes it drew from, and those citations render as the sources rail you saw in the screenshot. An answer that cannot point at its evidence is not an answer we show.

Second, and rarer in the wild: the engine is allowed to say nothing. Ask it the capital of France and it declines, not because someone hard-coded a list of forbidden topics, but because the retrieval comes back too weak to clear the evidence floor, and the engine short-circuits before a model ever runs. Ask it about Kubernetes, a real technology we simply do not document, and it abstains cleanly instead of improvising from the model's general knowledge.

> A docs assistant earns trust on the questions it refuses. Anyone can generate a confident paragraph. "I don't know" is the expensive sentence.

That floor took tuning. Early on it sat too low, and questions about capabilities we never documented could sneak past retrieval and tempt the model into helpfulness. Raising the floor and adding one blunt rule, that a capability the docs never mention means insufficient evidence, turned those into clean abstentions.

## "I hate the idea of *petals*"

The engine needed a front door, and the front door is where I made everyone suffer, because the homepage of a docs site is the one page that is pure design.

One constraint governed everything: whatever lives behind the ask box has to read equally well on a white theme and a black one. Depth had to come from color and motion, never from glows and shadows, which look gorgeous on one theme and like a smudge on the other. And it had to be unmistakably ours, built from Kissflow's brand colors and the butterfly mark.

The first attempt was drifting flower petals with a synchronized wingbeat, technically lovely, built on [GSAP](https://gsap.com). My complete review, quoted verbatim: "I hate the idea of petals."

The agent took it well. Attempt two dissolved the petals into a canvas of about 2,400 particles that coalesced into a butterfly every thirteen seconds. It read as confetti. Attempt three switched to frosted-glass tiles in CSS. Closer, still furniture. So we changed who did what: the agent wrote precise generation prompts for seven photoreal glass objects, self-lit, transparent, no baked-in background, and I generated the images myself and dropped them in.

Then came my favorite five minutes of the project. The renders looked like flat gray rectangles, and I said so. The agent, instead of apologizing and regenerating, checked the actual pixels, sampled the alpha channel, and reported that the images were perfectly transparent; the gray was the chat viewer's own backdrop fooling both of us. The renders were fine. My eyes had bad evidence.

Two iterations later the glass was arranged in a depth-of-field composition, 11MB of renders compressed to 263KB, and I asked for the thing I had wanted all along without knowing it: make them bigger, put them in the first fold, and let them collide and deflect. The agent rewrote the background as a small 2D physics simulation. Each crystal drifts, bounces off the walls, off its neighbors, away from your cursor, and off one invisible wall you will never see: a keep-out box around the headline and ask box, so the glass can never cover the words. Six backgrounds, one keeper.

![The finished homepage: "Everything Kissflow, answered" above the ask box, photoreal glass crystals floating in the margins, starter questions and role folders below, all in one fold.](/essays/an-answer-engine-not-a-search-box/hero-answer-engine.png)

The last touches were words, which is to say, my actual job. The page had launched as "Ask the Kissflow Documentation," which names an archive, not an act; nobody asks a pile of documents. It became "Everything Kissflow, answered." And the three starter questions under the box stopped being static: there is now a pool of sixteen questions spanning the whole corpus, three drawn at random per visit, so the page itself keeps demonstrating its range.

## The subtitle that wrote a *check*

Under the new title sat a subtitle promising answers across "every guide, API, and SDK." Confident. Also, at that moment, false.

The graph held 586 nodes, and all 586 were help articles — the corpus from part one, grown and reworked into its current shape. Our SDK section in the repo was navigation stubs pointing at an external developer portal; the API reference lived in its own OpenAPI spec, unread by the engine. Ask the engine an SDK question and the best it could do was point at where SDK docs lived. The agent flagged it in plain terms: the hero overclaims. Two ways out. Soften the copy, or make the copy true.

We made it true, and it took about 45 minutes. One script parsed our [OpenAPI](https://www.openapis.org) spec and turned all 105 API operations into graph nodes, each carrying its method, path, parameters, and response fields. Another used [Firecrawl](https://www.firecrawl.dev) to crawl the 29 SDK method pages on the developer portal into nodes of their own. The graph went from 586 nodes to 720. Then we asked it "how do I get user details via the API" and it came back with the exact GET endpoint, cited. Ask how to add a row via the SDK, and it cites the SDK page. Ask a how-to in plain product terms, and it still favors the guides, which is exactly the right instinct.

> The cheapest fix was editing the subtitle. The right fix was editing the corpus. If your marketing copy and your retrieval corpus disagree, the copy is the one lying.

This is the beat I would keep if I had to cut everything else in this post. Docs people spend careers deleting overclaims that other teams write. It turns out the discipline transfers: an answer engine's promise is a claim like any other, and you either back it or retract it.

## The *bake-off*

Was any of the graph business worth it? There is a well-known way to build docs Q&A, and it is elegant: about 185 lines of [LangChain](https://www.langchain.com) and [Chroma](https://www.trychroma.com) wiring a vector store to a chat model. A conventional LangChain baseline existed over essentially the same corpus lineage as ours, 484 articles of the older help center, 436 titles in common with our graph. Too close a match to pass up. We ran both engines live on the same thirteen questions.

```text
$ node bench/run-benchmark.mjs --live --questions 13

                        graph engine    vector baseline
  retrieval hit rate     12/12           11/12
  mean answer latency    4.2s            15.8s
  answers with sources   13/13           0/13
```

The retrieval gap was one question, and it is the most instructive miss in the set. Asked about roles inside an application, the baseline retrieved the article about account-level roles. Same word, different feature, nearest neighbor in vector space. The graph engine entered at the same neighborhood but walked an authored cross-link to the right article. That hop is the entire thesis of this post in one row of a table.

The latency and citation rows need honest framing. The baseline was not built to stream or cite; ours was built around both. And this was our benchmark, on our corpus, scored by us. I would not lean on 12 versus 11 in a court of law.

What I will lean on is what the benchmark did to us. Running it exposed three flaws in our own engine, all fixed the same day. The escalation logic turned out to be routing all thirteen questions to the expensive model, so it was rewritten around retrieval-score geometry, after which eight of the thirteen ran on the cheap one. The abstention floor was too permissive, which is how the Kubernetes probe first slipped through. And the edge enrichment that took the graph to its current 1,044 edges, by recovering 699 legacy cross-links from the old platform's URL format, came out of staring at how the baseline lost that one question.

> Winning a benchmark you wrote yourself proves little. The fix list you walk away with is the actual prize.

## What went *wrong*

Three failures this time, and all three are the same failure wearing different clothes: the model was innocent.

**The search box was dead, and the model had nothing to do with it.** Before any of the answer-engine work, plain old search returned nothing at all. Instinct says the index is corrupt or the search library is broken. The agent read the configuration instead. The client component declared its search type as `static`, meaning "expect a prebuilt index in the browser." The server route served `dynamic` queries. Two enum values, disagreeing across two files, and every query fell into the gap. The fix changed one word, `static` to `fetch`, and the agent proved it by typing "decision tables" into a real browser and screenshotting live results.

**Tables rendered as raw pipe characters, and the model was innocent again.** When answers included comparison tables, readers saw the markdown source, pipes and dashes, instead of a table. Everyone's first theory was that the model writes broken markdown. The actual culprit: the component rendering answers had no table support, because the plugin that parses table syntax, `remark-gfm`, was never installed. One dependency, added to both places answers render, and the same answer that looked broken displayed a clean bordered table.

**The same question got two different answers depending on which box you typed it into.** Our floating chat widget and the new hero looked like one product and were secretly two: the hero used the graph engine while the widget still used old keyword retrieval, so the widget abstained on questions the hero answered confidently, three feet away on the same page. The fix kept the widget's interface and swapped its internals to the same engine. One corpus, one engine, however many doors.

> Debugging AI systems is mostly debugging the plumbing around the AI. Read the config before you blame the model.

## The *numbers*

| | |
| ---: | :--- |
| **720** | nodes in the content graph: 586 help articles, 105 API operations, 29 SDK pages |
| **1,044** | edges connecting them, 699 recovered from legacy cross-links |
| **6** | hero backgrounds built to find the one that shipped |
| **263KB** | what 11MB of glass renders weigh after optimization |
| **16** | starter questions in the rotating pool, 3 shown per visit |
| **13** | benchmark questions, run live against a vector-RAG baseline |
| **4.2s** | our mean answer latency, versus 15.8s |
| **13/13** | answers with enforced citations, versus none |
| **45 min** | to ingest the API and SDK corpus once the overclaim was flagged |
| **1** | invisible wall keeping the glass off the headline |

## The *workbench*

The habit that mattered most this round: agents verified their own front-end work in a real browser, every iteration. [Playwright](https://playwright.dev) is wired in as a tool, so after each change the agent boots the dev server, drives the page, and screenshots it on the light theme and the dark one before I ever look. When the physics background went in, the agent captured two frames four seconds apart to prove to both of us that the glass was actually moving. "It works" is not a sentence I accept from an agent without a screenshot attached, for the same reason I stopped accepting it from myself.

Design taste got its own procedure. Rather than me writing "make it prettier" forty times, a design-review skill called impeccable carries the standards — spacing, hierarchy, restraint — and the agent runs it against its own work. And before anything shipped, a second, heavier model ran a verification pass over the work: same discipline as part 1's review stage, where no agent grades its own homework.

My job description did not change: write the briefs, veto the petals, refuse the overclaim, and keep asking the question a reader would ask.

## What's *next*

There is one group of readers this whole answer engine quietly fails. The engine speaks English. Our corpus is English. But watch the questions people actually bring to a Kissflow docs site and a familiar pattern shows up: readers thinking in Spanish, translating themselves into English to ask, then translating our answer back in their heads. Every hop of that loop leaks meaning.

The obvious fix is a Spanish docs site, and the obvious objection is cost, because translation projects are priced like construction projects. Ours cost about as much as two coffees.

That is part 4.

<hr />
<p><em>This is part 3 of <strong>The Docs Rebuild</strong>, a series on rebuilding Kissflow's help docs with Claude Code.</em></p>
<p>
<em>← Previous: <a href="/posts/essays/api-docs-that-dont-lie">API Docs That Don't Lie</a></em><br />
<em>Next: <a href="/posts/essays/588-docs-in-spanish-for-5-dollars">588 Docs in Spanish for $5.07</a> →</em>
</p>
