---
author: Abhiram Chakkiyar
pubDatetime: 2026-07-03T07:48:11.151Z
title: "The Same Lie, Twelve Times"
draft: false
tags:
  - documentation
  - ai-tools
  - knowledge-graphs
description: "I don't write code. I just built a fact-checker for my own documentation job, and the first thing it caught was a documentation bug hiding in plain sight."
ogImage: "/essays/the-same-lie-twelve-times/og-poster.png"
---
I don't write code. I just built a fact-checker for my own job, and the first thing it caught was a documentation bug hiding in plain sight.

![Every documentation job runs on a small act of faith.](/essays/the-same-lie-twelve-times/1-leap-of-faith.gif)

Somewhere near the start of every help article I have ever written, there is a moment where I stop verifying and start trusting. A developer hands me a README, or I open a spec, or I read a code comment someone left behind, and I take it at its word. I am not a programmer. I cannot open the actual component and check whether the prose in front of me still matches it. So I write the article on faith, and I have done this for years, and it has mostly gone fine.

Mostly. Not always. And this month I found out exactly how "not always" looks when you finally have a way to check.

## I asked for a map, not a lie detector

I work as a documentation lead at Kissflow, and our product runs on two codebases: a frontend and a backend, built and maintained separately, each with its own sprawl of components and services. I asked [Claude Code](https://code.claude.com/docs/en/overview) to turn both of them into a knowledge graph using a tool called [graphify](https://pypi.org/project/graphifyy/), mostly because I wanted a map. Something I could ask "what touches this feature" and get a real answer, instead of grepping through folders I don't fully understand.

The frontend alone came out to over forty-five thousand nodes across two dozen services. Building it took a few AST passes, no language model needed for the structure itself, and a separate pass just to read the actual prose documentation: the READMEs, the component docs, the internal notes engineers had left for each other. That second pass is the one that mattered. It reads what people wrote, not just what they built.

Once both graphs existed, I asked for one more thing: proof that a different AI tool, opening this project cold, would actually know to use them. I tested it against two other coding agents, [Codex](https://github.com/openai/codex) and [OpenCode](https://opencode.ai), by asking each one a question about the setup and watching whether it answered correctly without being told where to look first. Both did, unprompted, because the instructions were sitting in a file each of those tools loads automatically at the start of every session. That was the part I actually cared about. A map nobody consults is not a map.

> AST, if you have never met the term, just means the tool reads the code's actual structure the way a compiler does, not by skimming text. It is free and mechanical. Reading prose documentation for meaning is the part that needs a language model, and the part that turned out to be worth it.

## Twelve pages, one truth

![Twelve component folders. One documentation page, copy-pasted and never updated.](/essays/the-same-lie-twelve-times/2-twelve-docs.gif)

Once the graph had read every documentation file in the frontend, I asked for anything that looked like a data-quality problem. Not a bug in the code. A problem in the words.

It came back with something I would never have found by hand. A set of twelve small UI components, each one with its own documentation folder, each one supposedly describing that component's specific behavior. All twelve pages were word for word the same, describing one single component that was not any of the twelve. Someone had built the first widget, written a solid doc for it, then used that folder as a template for the next eleven and never gone back to swap the actual content in. Every individual page read perfectly. Nothing about any one of them looked wrong. You would only catch it by opening all twelve at once and noticing they were identical, which is not a thing a person does. It is exactly the thing a graph does, because holding twelve documents open at the same time costs a machine nothing and costs a human an entire afternoon nobody has.

> Nothing about any single page was wrong. The lie only existed in the space between twelve pages, and nobody reads twelve pages at once.

## It wasn't the only one

![Two official documents, same repository, opposite instructions.](/essays/the-same-lie-twelve-times/3-contradiction.gif)

That was the headline catch. It was not alone. The same pass found our own contributor guide instructing people to bypass a safety check during commits, while a separate internal policy document, sitting in the same repository, explicitly forbade doing exactly that. Two official documents, same codebase, opposite instructions, and neither one referenced the other. Nobody had noticed, for the same reason nobody noticed the twelve identical widgets: reading one document feels complete. Reading it against everything else that claims to be true is the part we skip, because there was never a cheap way to do it.

## Then the tool did the same thing to me

![Right number of answers. Wrong two answers. The same bug, wearing a different shirt.](/essays/the-same-lie-twelve-times/4-mirror-bug.gif)

Once the graph existed, I wanted it to be readable by an actual human, not just by another tool. That meant giving plain names to roughly two thousand clusters of related code and content the graph had found on its own. Too many for me to read one by one, so I had Claude Code delegate the naming to a batch of smaller helper agents, each one handed a slice of the clusters and asked to return a short label for every single one.

The first batch came back and, on the surface, looked done. Every group had the exact number of labels I had asked for. Then I noticed the labels themselves were mostly generic filler, five or six per batch when I had asked for twenty-five. The count was fine. The substance was not. It is the same failure as the twelve identical documents: a thing that looks complete from the outside and is hollow the moment you check.

Fixing it meant being stricter about what "done" was allowed to mean, not just how many items came back, but forcing an exact count through the response format itself, so the format would reject a short answer on its own and force a retry. Even after that fix, a second, sneakier version of the same bug showed up: the count was right, but a chunk of labels belonged to entirely different clusters than the ones assigned, slipped in to hit the number without doing the work. That one needed a check afterward, comparing what came back against what was asked for, and keeping only the labels that were genuinely earned.

I found that almost funny. I had built a tool to catch documentation that looked right and wasn't, and the tool itself tried to hand me labels that looked right and weren't, using the identical trick. Precision, it turns out, has to be insisted on twice. Once in the thing doing the checking, and once in the thing checking it.

## What this actually buys me, day to day

![Not a guess. A cited answer, pointed at the actual line.](/essays/the-same-lie-twelve-times/5-cited-answer.gif)

This is the part that matters for the job I do, which is writing help articles and feature guides, not code. In practice, before I start a new article, I ask for an outline pulled straight from the graph: what exists in this area, what connects to it, what else touches it that I might otherwise never think to mention. It reads like research done overnight by someone who never gets bored halfway through a codebase.

Mid-draft, when I am about to write a sentence I am not sure of, I stop guessing and ask instead. Does this setting share its options with that other one. Is this really the default behavior, or the behavior from two releases ago. The answer comes back pointed at an actual file and an actual line, not a paraphrase of a paraphrase. If I am wrong, I find out before I publish, not after a support ticket tells me.

None of this writes the article for me. It still needs my judgment about what a reader actually needs to know, which is the job, and always was. What changed is the distance between a claim and its proof. That distance used to be a phone call to an engineer who was probably in a sprint planning meeting. Now it is one question, answered with a citation, in the time it takes to read this sentence.

## Trust, but now you can check

I am not a programmer, and I want to be honest that I did not build any of this alone. Claude Code did the actual construction, the parsing, the merging, the fixing of its own mistakes when I pushed back and said the job looked half done. What I brought was the question, and the refusal to accept an answer that only looked complete. That turned out to be enough, because it is the same skill documentation has always asked of me. Not writing the perfect sentence. Noticing when something claims to be finished and isn't.

Documentation has always run on trust, because checking was expensive and writers were not the ones who could afford to pay for it. That part quietly stopped being true. The trust does not go away. It stops being the only option.

*Twelve pages still say the same thing, somewhere in every codebase. The only question left is whether anyone is going to notice before a reader does.*
