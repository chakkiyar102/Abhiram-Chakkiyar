---
title: "Colophon"
pubDatetime: 2026-06-19T00:00:00.000Z
modDatetime: 2026-07-03T11:15:00.000Z
description: "What this site is, who made it, and how it was built."
tags:
  - meta
draft: false
featured: true
---

This site is mine. Not a brand. Not a portfolio deck with case studies and conversion goals. Just a personal slice of the internet where I write things down and occasionally figure out what I think.

I'm Abhiram. I lead a technical writing team, which means most of my working hours are spent thinking about how people understand things. Not just what words to use, but what order to say them in, what to leave out, when a diagram helps more than a paragraph. I write documentation. I also build small things with AI, this site included, even though I'm no engineer. The through-line across all of it is clarity, which is harder to achieve than it sounds.

The essays here are for longer thoughts. The kind that don't fit in a doc comment or a Slack thread. The notes are shorter, more technical, closer to "here's a thing I worked out and didn't want to forget." Both are honest about what they are.

---

**How this is built.**

I started with AstroPaper (version 6.1.0), a minimal Astro theme that handled the structural heavy lifting. Then I recolored it. The original is clean but dark and fairly monochrome. I wanted something that felt warmer and more coastal, so I gave it a marine teal for the primary tone and kept everything else deliberately plain. Body copy is set in Inter, a clean sans-serif that gets out of the way. I tried a few heavier treatments along the way, textures and a serif display face, and then took them all back out. Simpler read better.

The site is deployed on [Vercel](https://vercel.com). Build times are fast, the setup is minimal, and it gets out of the way.

---

**There's a robot that reads it back.**

Recently I added a button that says Ask AI. It isn't a chatbot with a personality, and it isn't a support desk pretending to be a person. It's an answering machine pointed at my own writing. Every time the site builds, it bundles every essay and note into a single plain-text file, and when you ask a question, that whole file goes along as context. The site literally hands the model everything I've written and says answer from this, and if it isn't in here, say so. You can read that file yourself, it's [right here](/llms-full.txt).

No database, no search index, no vector store. The entire body of writing is small enough to fit in one pass, so the simplest possible version works. It runs on the cheapest model I could find, through a small function on Vercel, on my own key. About a hundred and fifty lines of code, no framework.

I like that it can only speak from what's actually here. Ask it about something I've written and it points you at the essay. Ask it about something I haven't, and it tells you it doesn't know. That's the same rule I try to hold myself to.

---

None of this is meant to be impressive. It's meant to be usable and honest. The design reflects how I think about most things: find the version that's clear, make it look like it was made by someone who cared, and then leave it alone.

If you're reading this, you found a corner of the internet I actually maintain. That's either a good sign or a sign you've gone too far down a rabbit hole. Either way, welcome.
