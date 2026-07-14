---
author: Abhiram Chakkiyar
pubDatetime: 2026-07-18T09:00:00Z
title: "588 Docs in Spanish for $5.07"
featured: true
draft: true
tags:
  - docs-rebuild
  - ai
  - documentation
  - localization
description: "Part 4 of The Docs Rebuild: localizing an entire docs site with an LLM script and a glossary, shipping it, and then solving the case of the AI that seemed to make typos."
---

<video autoplay loop muted playsinline poster="/essays/588-docs-in-spanish-for-5-dollars/hero-poster.png" style="width:100%;border-radius:12px;">
  <source src="/essays/588-docs-in-spanish-for-5-dollars/hero.mp4" type="video/mp4" />
</video>

Our help corpus is about 314,000 words. Price that at any per-word rate you've seen on a localization invoice and you get a number with a comma in it, payable again every time the docs change, with your own translated sentences held in someone else's database as "translation memory."

The number we actually paid to put all of it into Spanish is the title of this post. $5.07, itemized on an API bill, one time.

This is the last part of a four-part series on rebuilding [Kissflow](https://kissflow.com)'s help docs. Part 1 moved 556 articles off a rented platform and into a git repo. Part 2 rebuilt the API reference so it could not lie. Part 3 turned the docs into an answer engine. This part asks the question every docs lead eventually gets from upstairs: what would it take to do all this in another language?

The answer turned out to be a config entry, a script, a glossary, and a weekend. And then, because nothing in this series has shipped without a fight, a day-two bug report that looked exactly like the AI falling apart, and wasn't. As in every part of this series, I wrote none of the code. I wrote the briefs, made the calls, and reviewed what shipped.

## The build-or-rent *question*

It started with me asking an agent to evaluate one of the localization platforms that wire into your repo and manage translations as a service — a genuinely good one. The assessment came back balanced: it would work, but it's a subscription priced per word, and the translation memory, the record of how your sentences map across languages, lives on their side of the fence. For a mostly static corpus, that's a recurring bill for a one-time job, plus a new dependency on the exact category of rented platform this series exists because we left.

So I asked the follow-up that's become a reflex: what's the best free option?

The answer had two halves. First, [Fumadocs](https://fumadocs.dev), the framework our site already runs on, ships internationalization built in. Not a plugin, not an enterprise tier. Config. Second, the translation itself doesn't need a platform, because we hold our own API keys. A script can walk every article, send it to a model with strict instructions, and write the Spanish version back into the repo as a plain MDX file. The translation memory is git. The vendor is nobody.

The cost estimate for the whole corpus was just under five dollars per language, one time, with ongoing cost near zero because only changed files ever need retranslating. I asked the agent to double-check that "one time" claim, because it sounded like a typo. It held.

One more scoping call: which languages? The agent checked the marketing site's language tags. Kissflow markets in Spanish, French, German, and Italian. We picked Spanish for the pilot: the largest audience, and the cheapest way to find out whether the pipeline could be trusted before multiplying it by four.

## Four decisions before any *files*

By now the shape of a well-run task is familiar: requirements pinned in a PRD, with the genuinely contestable calls surfaced as explicit either-or decisions instead of buried in an agent's assumptions. Four came up. I took the recommended option on all four; each had a real alternative worth recording.

**The whole corpus, not a top-50 subset.** The cautious version translates the fifty most-read articles and waits. But a half-translated site reads as broken, not cautious. A Spanish reader who follows a link from a translated page onto an English one has just learned not to trust the language switcher. If the pipeline can be trusted for fifty files, the same validation makes it trustworthy for 588.

**Articles and interface strings, not articles alone.** A Spanish article inside English chrome is half a promise. The sidebar, the search box, the "On this page" rail, the landing-page hero, all of it needed a Spanish dictionary. The agent built the English side of that dictionary byte-identical to the strings already in the code, so the English site could not regress by construction. An argument worth stealing: make the refactor provably a no-op in the language you already ship.

**Ship live with a disclaimer, not hidden behind a flag.** Every Spanish page carries an amber banner saying, in Spanish, that the page was machine-translated and is pending editorial review, with a link to the English original. That's the honest version of shipping machine translation, and it beats both dishonest ones: pretending a human wrote it, or hiding everything behind a flag until a review that would never finish.

**The standard model tier, not the cheap one.** The temptation with bulk jobs is to reach for the smallest model and the batch discount. Here, translation quality is the entire product, and the price difference at this corpus size is pocket change either way. We paid full fare.

## Files, not *trees*

The decision I most want other docs teams to steal is the file layout, because that's where localization projects go to die.

The traditional layout mirrors the whole content tree: `content/` for English, `content-es/` for Spanish, two parallel hierarchies that must never drift apart. Every new article, every rename, every moved folder now needs a twin, and the day someone forgets, the trees start lying to each other.

Fumadocs supports a different convention, and we took it: the dot suffix. The Spanish version of `page.mdx` is `page.es.mdx`, sitting in the same folder, next to the same images, in the same git history. Navigation files get the same treatment, `meta.json` beside `meta.es.json`. There is no second tree. A folder is simply bilingual.

![Two ways to localize a docs repo: a mirrored second content tree that must be kept in sync, crossed out, versus the dot suffix, where page.es.mdx sits beside page.mdx in the same folder.](/essays/588-docs-in-spanish-for-5-dollars/dot-suffix-layout.svg)

Same philosophy for URLs: English ones did not change, no `/en/` prefix appeared, so every existing link and bookmark kept working. Spanish lives under `/es/`. Middleware sorts readers to the right side; the language switcher in the sidebar does the rest.

![The language switcher on a docs page: a "Choose a language" menu open above the sidebar footer, offering English and Español.](/essays/588-docs-in-spanish-for-5-dollars/language-switcher.png)

The payoff is one sentence long: adding the next language is one entry in a config array plus one script run. French is an afternoon and about five dollars. That claim, more than the Spanish, is the pilot's real deliverable.

## A trust *mechanism*, not trust

The translation script is the part I'd defend in front of a skeptical review board, so here's how it works.

It's a plain script that talks to [OpenAI](https://openai.com)'s API directly, four files at a time, with a hard cost ceiling that aborts the run if spend crosses it. Every request carries the same system prompt with seven hard rules. Translate the prose. In the frontmatter, translate the title and description and nothing else. Never touch code blocks, URLs, or component attributes. Address the reader as tú, because our Spanish-speaking users are colleagues, not defendants.

Alongside the rules rides a glossary: 19 terms that stay in English no matter how tempting the translation. Kissflow, obviously. But also *dataform*, *child table*, *Smart Link*, *Kanban*, the product nouns that appear as literal labels in the interface. A translated button name is worse than an untranslated one, because the reader will go looking for a button that does not exist.

Rules and glossaries are still just prompts, though, and prompts are requests, not guarantees. What turned "hope the model behaves" into a shippable pipeline is the frontmatter invariant. Our articles carry structured frontmatter: routing fields, persona tags, section assignments, redirect targets. The script parses every translated file and checks that this structure survived translation byte-for-byte, every key present, every protected value untouched. Any deviation and the file is rejected and retried. Nothing structurally suspect can reach the repo.

That validation let me run 588 articles through a language I read far better than I write, unsupervised, and sleep. Not trust in the model. A mechanism that makes the model's occasional weirdness a retry instead of a corruption. The prose still gets human review, ranked and queued. But the structure, the part that can break a site, is checked by a machine that doesn't get tired at file 400.

## The *run*

The backfill took an evening. Here's the line I screenshotted for posterity:

```text
$ node scripts/translate-docs.mjs --locale es

  corpus     588 articles + navigation files
  glossary   19 terms pinned to English
  invariant  frontmatter must survive byte-identical

  DONE: 657/657 files · tokens 721,862 in / 711,420 out · cost: $5.07
```

657 files: the 588 articles plus navigation files, less a few empty stubs. Roughly seven hundred thousand tokens each way. The estimate said just under five dollars; the bill said $5.07, and the overrun, about ten percent, was entirely retries.

Now the five failures, my favorite part of the run. On the first pass, the invariant rejected five files with "keys changed." Inspection showed the keys were fine; the model had flaked on formatting in a way the strict parser refused to forgive. Two rerun passes recovered all five. Zero corrupt files reached the repo. That's the mechanism working as designed, and it taught me the pipeline's real lesson: with cheap retries and strict validation, model flakiness stops being a risk and becomes a line item.

![A Spanish docs page, "Primeros pasos," with the amber machine-translation banner across the top and the sidebar fully in Spanish.](/essays/588-docs-in-spanish-for-5-dollars/es-banner.png)

The ship checklist was the usual paranoia. The site went from 1,774 pages to 2,367. Spot checks across five sections, all rendering. The glossary held: "Kissflow" intact everywhere, natural Spanish around it. Searching in Spanish returns Spanish pages. Every English regression URL still returns 200, and the English landing page is byte-identical to before. Machine translation pending review is a debt, so the agent generated a review queue for our Spanish-speaking colleagues, ranked by inbound links using the content graph from part 3. Top of the queue: the user roles and permissions article, with 22 of them. Review where the traffic converges first.

## What went *wrong*

Pre-ship, one classic. The verification server came up, the page HTML answered 200, and every stylesheet and script chunk answered 500. Twenty-four console errors on one page load. The cause was mundane: a development server had been run on top of a production build and quietly mutated the build directory. Delete the directory, rebuild clean, 2,367 pages statically generated in under half a minute. Small lesson, cheaply paid: when everything is broken identically, suspect the environment before the code.

Day two delivered the better story.

## The AI that seemed to make *typos*

Actually, day two delivered twice. The first bite was quiet: our sidebar's API Reference link died, because the new locale middleware excluded `/api/*` routes by prefix and `/api-reference` starts with the same letters. One character class in a regex fixed it. It's the perfect specimen of an i18n migration bug: no test suite was watching for a route name colliding with an exclusion pattern. Shipping i18n is easy. The seams bite the next day.

Then came the report that earned this post its subtitle. A screenshot of our answer engine, the subject of part 3, showing an answer in visible distress. Bullets truncated mid-sentence: "Webhooks by Kissflow lets a". Words fused together where italics used to be, "sends from Kissflow" rendered as "sendsfromKiss". The request attached was reasonable: add a guardrail that checks and fixes the AI's output, and while you're in there, make sure markdown renders as rich text, tables included.

Every instinct says the model is misbehaving. The suspect list writes itself: the LLM produced sloppy text, the streaming pipeline dropped chunks mid-flight, or the markdown renderer choked. An LLM proofread pass, a second model checking the first, feels like the obvious guardrail.

The investigation cleared all three in order. The renderer first: tables, lists, all of it already rendered fully, so half the request described a feature that already existed, itself a clue. Then the agent replayed the exact question against the answer API and captured the raw stream. The answer came back complete, clean, and well-spaced. The model was innocent. The server was innocent.

Yet the screenshot plainly showed mangled text. So the investigation pivoted to the screenshot itself, and this is the part I'll be retelling for years. The interface text around the broken answer did not match our product. The search box read "Look for." Ours says "Buscar" on Spanish pages and "Search" on English ones. The input placeholder read "Ask another question..." Ours says "Haz otra pregunta..." A grep across the repo found none of the screenshot's strings. The user was looking at a page we never built.

Those strings are what you get when [Google Translate](https://translate.google.com) renders our Spanish interface into English. The user had landed on the Spanish home page, shipped barely a day earlier, and Chrome had helpfully offered to translate it. The browser then machine-translated everything in sight, including the AI's streamed answer, live, while it was still arriving. Auto-translate rewriting a React page that is mutating under it is a known way to shred text nodes: it glues words across formatting boundaries and drops fragments mid-sentence. Our AI didn't have a typo problem. Our page had a second, uninvited translator.

The fix was 34 lines, and not one of them was an LLM proofread pass. First, the root cause: the answer engine now knows what language the page is in, and a single rule appended to its system prompt has it answer Spanish questions in Spanish, grounded in the same English content graph, which works better than I expected. On a Spanish page, auto-translate has nothing left to do. Second, the seatbelt: `translate="no"` on the answer containers, an HTML attribute that tells browser translators to keep their hands off that part of the DOM. Verified end to end by asking the engine, in Spanish, how webhooks work, and watching a clean Spanish answer stream in.

![The Spanish docs home page: "Todo sobre Kissflow, respondido," with the ask-anything input reading "Pregunta lo que quieras sobre Kissflow..."](/essays/588-docs-in-spanish-for-5-dollars/es-hero.png)

> When a user reports that your AI is making typos, remember there is a whole stack of glass between the model and their eyeball. Capture the raw output before you re-prompt anything. The bug may live in the browser, and no amount of prompt engineering fixes Chrome.

The guardrail that was asked for turned out to be one HTML attribute and one prompt line. The version I almost got talked into, a second model proofreading the first, would have added latency and cost to every answer, forever, to fix a bug that was never in the answer.

## The *workbench*

The habits are the same ones running through the series, so just the short version. A PRD skill pinned the four decisions before any file moved. A style-review skill built on Strunk and White runs its pass over prose the way the invariant runs over frontmatter. The repo's two new permanent residents are the translate script and the glossary: when docs change, one command retranslates only the changed files, and when the next language comes, the same script runs with a different locale flag. The pipeline is the asset. Spanish was just its first customer.

## Closing the *tally*

Four posts ago, this series opened with a renewal invoice: $9,000 a year for a place to type. Time to close the books in numbers.

| | |
| ---: | :--- |
| **588** | help articles, each now in two languages |
| **105** | API operations documented against the live contract |
| **29** | SDK pages |
| **1,089** | pre-release notes with a permanent home |
| **24** | product announcements on their own timeline |
| **720** | nodes in the content graph behind the answer engine |
| **2,367** | pages on the site, every one born from a file in git |
| **$9,000/yr** | what the old platform cost, for less than all of the above |
| **~$5** | what an entire new language costs now, one time |

The numbers say the reflection better than adjectives can. Everything in that table used to be a different department. The migration is a vendor engagement. The site is a frontend team. The API reference is a developer-relations hire. The answer engine is a procurement cycle. The Spanish site is a translation-agency contract. What actually happened: one writer, me, directed a fleet of AI agents through all of it in a summer, on a docs lead's judgment calls: what is true, what is good enough, what ships.

I didn't become an engineer this summer. That's the part I most want other writers to hear. Every skill that mattered was already on my side of the desk: writing the brief, smelling the wrong answer, refusing "it works" when the bar is "it is true," and knowing when a bug report is really a story about something else. The agents did the hands. The judgment stayed human, and the judgment was the job.

The docs are rebuilt. The invoice is not coming back.

<hr />
<p><em>This is part 4 of <strong>The Docs Rebuild</strong>, a four-part series on rebuilding Kissflow's help docs with Claude Code.</em></p>
<p>
<em>← Previous: <a href="/posts/essays/an-answer-engine-not-a-search-box">An Answer Engine, Not a Search Box</a></em><br />
<em>New here? The story starts at part 1: <a href="/posts/essays/we-replaced-our-9000-dollar-docs-platform">We Replaced Our $9,000-a-Year Docs Platform with a Git Repo</a></em>
</p>
