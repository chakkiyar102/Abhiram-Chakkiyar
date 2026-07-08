---
author: Abhiram Chakkiyar
pubDatetime: 2026-07-08T17:00:00.000Z
title: "Why This Site Needed a Real Chatbot Integration"
draft: false
tags:
  - ai
  - chatbot
  - ux
  - astro
  - vercel
description: "I replaced my hand-rolled Ask AI widget with AI Elements and streaming via Vercel AI SDK, not for polish points, but because the old chat broke trust in the first three seconds."
---

A few weeks ago I added an **Ask AI** button to this site.

<video src="/essays/why-this-chatbot-integration-was-needed/hero.mp4" autoplay loop muted playsinline controls style="width:100%;border-radius:14px;margin:18px 0 10px;"></video>

It worked. Technically.

You typed a question, it sent my corpus to the model, and it replied from my own writing. No personality theater, no fake support voice, no made-up facts. Just grounded answers from `/llms-full.txt`.

On paper, that sounds fine.

In practice, it felt wrong the moment you used it.

The chat opened as a clean panel. You asked a question. Then nothing moved for a bit. No visible response line, no hint that the system was alive, just a quiet empty area that looked like it had stalled.

It was doing work in the background. It just did not *feel* like it.

That gap is why I rebuilt it.

## Working is not the same as believable

The first version was a small custom script wired into my [Astro](https://astro.build/) layout. It used direct `fetch` calls to my serverless endpoint and rendered full answers when they came back.

That design was simple, and simplicity is usually my bias.

But chat has one sharp UX rule: users need immediate evidence of progress. If the interface stays still after submit, people assume failure long before your model has a chance to prove itself.

A normal form can wait. A chatbot cannot.

The old version had three real issues:

1. It returned buffered responses, so there was no token-level progression.
2. It used manual DOM management, which made state transitions brittle.
3. It offered no composable path to richer chat behaviors without writing more one-off UI code.

None of these are dramatic bugs. Together, they create low confidence.

And low confidence is fatal in a chat interface.

<video src="/essays/why-this-chatbot-integration-was-needed/before-vs-after.mp4" autoplay loop muted playsinline controls style="width:100%;border-radius:14px;margin:20px 0 10px;"></video>

## Why I moved to AI Elements

I switched the frontend to [AI Elements](https://elements.ai-sdk.dev/), the component layer built for AI-native UIs.

This was not a design refresh project. It was a trust project.

AI Elements gave me a structured conversation shell, message primitives, prompt input primitives, scroll behavior, and a status-driven submit control that already understands chat states.

That matters because hand-rolled chat UIs mostly fail at the same places:

- ambiguous loading states
- inconsistent message rendering
- fragile control logic as features grow

When those pieces come pre-structured, I can spend effort on product behavior, not repeated widget plumbing.

## Why I moved transport to Vercel AI SDK

UI components alone were not enough. The transport layer had to change too.

So I shifted to [Vercel AI SDK](https://ai-sdk.dev/) for the chat loop and streaming flow.

On the client, I now use `useChat` with the SDK transport. On the server, I stream model output as UI message events instead of waiting for a full response blob.

The visible result is simple:

- users see an assistant row quickly
- streamed text appears progressively
- stop behavior is native, not bolted on

The structural result is bigger:

- request and message flow are normalized
- state management is less custom
- future features have a stable base

<video src="/essays/why-this-chatbot-integration-was-needed/grounded-pipeline.mp4" autoplay loop muted playsinline controls style="width:100%;border-radius:14px;margin:20px 0 10px;"></video>

This is the classic build-vs-adopt decision. I still like writing small systems from scratch. I do not like rewriting solved problems around streaming semantics and chat state machines.

## Grounding stayed the same, and that was important

One thing I did **not** change was the truth model.

The assistant is still grounded on this site's own corpus. The server still builds its system prompt around the generated `/llms-full.txt` content, so answers are constrained to what I have actually published.

I care about that constraint more than any UI effect.

A nicer chatbot that hallucinates confidently is worse than an ugly chatbot that says "I don't know." The integration was meant to improve responsiveness and trust, not relax factual boundaries.

## The part that looked "empty" and what fixed it

After the integration, one subtle issue remained.

Streaming was technically on, but if the model took a moment before the first token, the panel still looked empty right after submit. No bug in transport, just first-token latency.

That is where perception and implementation diverge.

So I replaced that gap with a pinned assistant waiting row that appears immediately on submit and stays visible until actual assistant text arrives, with rotating status lines tied to the site's own content context.

> The user does not grade your architecture. They grade what the interface does in the first second after they press Enter.

That one state transition changed the feel of the whole system.

## What the metrics said (July 8, 2026)

I ran a small production benchmark against the live endpoint (`/api/v1/chat/stream`) for the same prompt, 12 times:

`"Summarize Abhiram writing themes in one sentence"`

| Metric | Median | P95 |
| --- | ---: | ---: |
| Stream open (response headers) | 296.76 ms | 469.42 ms |
| First text delta | 9.82 s | 15.53 s |
| Full streamed completion | 10.63 s | 16.72 s |

Two things are clear from this:

1. Transport startup is fast and stable.
2. First-token latency can still be high and variable.

That is exactly why the waiting-state UX mattered. If first token can take 10+ seconds, users need continuous, trustworthy progress feedback from the first click, not a blank panel.

## Why this integration was actually necessary

I could have left the original script in place and called it "good enough." It answered questions. It was cheap to run. It was already deployed.

But "good enough" chat is expensive in a quieter way.

It costs retries.
It costs trust.
It costs the user's willingness to ask the second question.

This integration fixed that tax.

Not because the stack is fancier, but because the interaction is clearer:

- submit gives instant feedback
- waiting is visible, not ambiguous
- output arrives progressively
- the chat behaves like a live system, not a static form

If the goal is to help someone get value from your writing, that behavior is not optional polish. It is core product behavior.

## The engineering lesson I am keeping

I lead a documentation team, so I naturally optimize for clarity.

This migration reminded me that interface clarity is not just wording. It is timing, state visibility, and honest feedback loops.

In docs, we say "show progress" with headings and structure.
In chat, we say it with streamed tokens, pending states, and predictable controls.

Same principle, different medium.

I still like small systems. I still value simple architecture. I still think custom code is often the right call.

But for this problem, integrating a purpose-built UI layer plus a purpose-built streaming transport was the right trade.

Because the real requirement was never "have a chatbot."

The requirement was: **make the chatbot feel alive quickly, stay grounded, and earn trust every turn.**
