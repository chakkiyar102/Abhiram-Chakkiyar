---
author: Abhiram Chakkiyar
pubDatetime: 2026-10-14T18:50:59.000Z
modDatetime: 2026-10-15T10:48:42.000Z
title: "Thirty-Two Pixels"
draft: false
tags:
  - ai
  - build-log
  - rust
  - claude-code
  - craft
description: "I built a desktop learning app for Kissflow partners with Claude Code. The code came cheap. The work moved to the seams, and one of them was exactly thirty-two pixels wide."
ogImage: "/essays/thirty-two-pixels/0-hero.png"
---
<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/thirty-two-pixels/0-hero.png" aria-label="A three-column workspace slides together: the course on the left, a live Kissflow tenant in the middle, and Kiko the coach on the right." style="width:100%;border-radius:12px;">
    <source src="/essays/thirty-two-pixels/0-hero.mp4" type="video/mp4" />
  </video>
  <figcaption>A three-column workspace slides together: the course on the left, a live Kissflow tenant in the middle, and Kiko the coach on the right.</figcaption>
</figure>

The course was the easy part. The material already existed: a partner onboarding curriculum for consultants who build on Kissflow, six sessions from "what is a process" to "why did this integration fail at 2am". What it didn't have was a way to deliver it that wasn't a slide deck, a shared drive, and someone answering the same questions over and over.

So I asked [Claude Code](https://www.claude.com/product/claude-code) to build me an app. Not a web page. A real desktop app, the kind you download and double-click, with lessons, quizzes, hands-on exercises in your own Kissflow tenant, a coach beside you while you work, a final assessment and a certificate at the end.

It got built. Rust from top to bottom: [Tauri](https://tauri.app) for the desktop shell, [Leptos](https://leptos.dev) for the interface, compiled to WebAssembly. The Mac download is under 20 MB. The Electron app I'd been using as a reference weighs about 500.

But the story is about thirty-two pixels.

*Updated 15 October 2026: an Android app, real Kissflow screens inside the lessons, a fact-check of the course itself, and a screen helper rebuilt from scratch. The new sections start after the README.*

## Kissflow said *no*

The core idea was simple. On the left, the lesson. In the middle, the learner's actual Kissflow training account, live, so they build the thing while they read about it. On the right, Kiko, a small mascot who coaches them through it.

The first version put Kissflow in an iframe, which is how you put one website inside another. It loaded a blank rectangle.

Kissflow, sensibly, refuses to be framed. Its servers send a header called `X-Frame-Options: SAMEORIGIN`, which tells the browser "only my own pages may embed me." It's a standard defence against clickjacking, where a malicious page hides a real login under a fake button. Good for Kissflow. Bad for my middle column.

<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/thirty-two-pixels/1-iframe.png" aria-label="An iframe knocks on Kissflow's door and bounces off. A native window slides into the same slot instead." style="width:100%;border-radius:12px;">
    <source src="/essays/thirty-two-pixels/1-iframe.mp4" type="video/mp4" />
  </video>
  <figcaption>An iframe knocks on Kissflow's door and bounces off. A native window slides into the same slot instead.</figcaption>
</figure>

The way around it was to stop pretending. Instead of a frame inside the app's page, the middle column became a second, native browser window, glued into the main one at exactly the right position. Tauri can do this. It's marked unstable, which in hindsight was a hint.

## The thirty-two *pixels*

The native window went in. And sat slightly too low. Not wildly. Just enough that the bottom of Kissflow disappeared under the edge of the app, and the top of it overlapped the column headers.

Claude tried the obvious fixes. Measure the placeholder element in the page, send its position to Rust, place the window there. Still low. Re-measure after the layout settles. Still low.

So we stopped guessing and logged it. Every time the window moved, the app wrote down where the interface *thought* the pane should go and where macOS *actually* put it. The log said: native content height 777, interface height 745.

Thirty-two pixels. The height of the macOS title bar.

<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/thirty-two-pixels/2-thirty-two.png" aria-label="Two rulers side by side. The page measures from below the title bar, the native window from the top of the frame. The gap between them is 32 pixels." style="width:100%;border-radius:12px;">
    <source src="/essays/thirty-two-pixels/2-thirty-two.mp4" type="video/mp4" />
  </video>
  <figcaption>Two rulers side by side. The page measures from below the title bar, the native window from the top of the frame. The gap between them is 32 pixels.</figcaption>
</figure>

The page measures from just below the title bar. The native window measures from the top of the whole window, title bar included. Both are correct. They simply disagree about where zero is. The fix was one subtraction. Finding it took a log line comparing two numbers that each, on their own, looked perfectly fine.

Then the window started eating clicks. A hidden native window on macOS can still sit invisibly on top of the page and swallow every click aimed at the lesson underneath. The fix there was even dumber: don't hide it. Move it twenty thousand pixels off-screen. It's still the most effective line in the codebase.

> **!** When two systems are each right and the result is still wrong, the bug lives in the seam between them. Log both sides of the seam.

## The coach that couldn't *peek*

Here's a rule I set early and never relaxed: the AI never decides a score.

Every quiz answer, every session check, the sixty-minute final, all of it is marked by plain Rust code against answer keys bundled inside the app. Kiko, the coach, runs on whichever AI provider the learner picks (OpenAI, Anthropic, a local model through Ollama, or any compatible endpoint), and Kiko never sees a single answer key. The interface itself never sees them either. It gets the question and the options. The keys stay in Rust.

<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/thirty-two-pixels/3-vault.png" aria-label="A chat bubble reaches for a locked box of answer keys and is turned away. A small gear marks the quiz instead." style="width:100%;border-radius:12px;">
    <source src="/essays/thirty-two-pixels/3-vault.mp4" type="video/mp4" />
  </video>
  <figcaption>A chat bubble reaches for a locked box of answer keys and is turned away. A small gear marks the quiz instead.</figcaption>
</figure>

It sounds paranoid. It's actually just how you'd want an exam to work. A language model that grades is a language model that can be talked into a pass. A model that only coaches can be as chatty as it likes. Exercise write-ups do get an AI review, but it's advice, and it never gates progress.

The same thinking applied to API keys. They live in the operating system's keychain, attached to requests in one Rust file and nowhere else. The embedded Kissflow window, which runs someone else's website, is allowed to call exactly one function in the app: a proxy that forwards a chat request. That's its entire permission list.

## The helper that phoned *home*

The best moment of the build was a near-miss.

I wanted Kiko to be able to "look at my screen": read the live Kissflow page and tell the learner where to click. There's a lovely open-source library for exactly this, Alibaba's [page-agent](https://github.com/alibaba/page-agent), and it ships a ready-made bundle on a CDN. Drop it in, done.

Except Claude read the bundle first. The demo build, when it's injected into a page rather than loaded with a normal script tag, starts itself up and connects to the project's public test language model. Injected into a learner's Kissflow tenant, it would have quietly sent the contents of their screen to a server neither of us controlled.

<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/thirty-two-pixels/4-phoned-home.png" aria-label="A bundle with an antenna sends a dotted line out of the window. Scissors cut the line, and a clean bundle takes its place." style="width:100%;border-radius:12px;">
    <source src="/essays/thirty-two-pixels/4-phoned-home.mp4" type="video/mp4" />
  </video>
  <figcaption>A bundle with an antenna sends a dotted line out of the window. Scissors cut the line, and a clean bundle takes its place.</figcaption>
</figure>

Nothing about this was malicious. It's a demo bundle doing what demo bundles do. But "it's just the demo" is exactly the kind of sentence that ends up in an incident report. So the app ships its own copy, built from the library's source package, with no demo server anywhere in it. And in that first version, page-agent's tools for clicking and typing were switched off. Kiko explained; the learner acted. That didn't last, and the reason why is further down.

> **!** Read what you embed. The convenient build and the safe build are often not the same file.

## Shipping to three *doors*

A desktop app nobody can install is a very elaborate hobby. Shipping meant three platforms.

The Mac build was straightforward: one universal disk image for both Apple Silicon and Intel, signed for the updater so installed copies can update themselves.

Windows I built from the Mac, which Tauri politely calls experimental. It failed three ways in a row. A half-installed Rust target that couldn't install or uninstall itself. A missing LLVM toolchain that I'd been told was already there. And a timeout while downloading one small helper DLL, on a connection slow enough that the same file took thirty seconds by hand. Each fix was small. Each one needed someone to actually read the error rather than retry.

Linux can't be built from a Mac at all, because it links against libraries that only exist on Linux. So a GitHub Actions runner builds it in the cloud, and the release script downloads the result and signs it locally, so the signing key never leaves my machine.

<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/thirty-two-pixels/5-three-doors.png" aria-label="Three doors labelled macOS, Windows and Linux open one after another, each with a small signed seal." style="width:100%;border-radius:12px;">
    <source src="/essays/thirty-two-pixels/5-three-doors.mp4" type="video/mp4" />
  </video>
  <figcaption>Three doors labelled macOS, Windows and Linux open one after another, each with a small signed seal.</figcaption>
</figure>

Then a fourth door. The same Rust code builds an Android app, which needed one structural change (the app became a library Android can load) and a handful of honest compromises. A phone allows one web view per app, so the Kissflow tenant opens in the browser instead of beside the course. There's no self-update, so you install the new file over the old one. The certificate can't be printed from a phone's web view, so Rust writes the PDF by hand. The first APK was 64 MB because it carried code for every kind of phone chip; [splitting it per chip](https://developer.android.com/studio/build/configure-apk-splits) brought the common one down to 25.

All four are on the [releases page](https://github.com/abhiram-kissflow/kf-academy-releases) now, and the desktop copies check for updates on their own.

## The README that *lied* a little

The last task was the most familiar one. Write the README, the document a future maintainer opens first.

Claude drafted it from the code. Then I did what I'd do with any draft from any writer: I had a second agent check every concrete claim in it against the source. Paths, port numbers, function names, table names, timings.

It came back with a short, slightly embarrassing list. The README said Settings offered four AI providers; the code had three, and the fourth was one of them with a different address. It said builds land in one folder; debug builds land in another. It said adding a course meant updating the validator; it also meant updating a test that hard-codes the number of lessons, which would have broken the build for the next person to add one.

<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/thirty-two-pixels/6-fact-check.png" aria-label="A README page with a checklist beside it. Most lines get a tick; three get struck through and rewritten." style="width:100%;border-radius:12px;">
    <source src="/essays/thirty-two-pixels/6-fact-check.mp4" type="video/mp4" />
  </video>
  <figcaption>A README page with a checklist beside it. Most lines get a tick; three get struck through and rewritten.</figcaption>
</figure>

None of those were hallucinations in the dramatic sense. They were the ordinary drift between what a system does and what someone believes it does. Which is, I'm aware, my entire job description.

## The lessons that showed *nothing*

The course was all words. Thirty-seven lessons telling consultants where to click, and not one picture of where that was.

Kissflow's [community documentation](https://community.kissflow.com) has hundreds of screenshots and short screen recordings. Claude pulled ninety articles with [Firecrawl](https://www.firecrawl.dev), then I handed it an export of all 559. Six agents, one per session, looked at every image before placing it next to the paragraph it illustrates, and wrote a caption describing only what is actually on screen. They skipped anything showing real-looking email addresses, and anything that contradicted the lesson beside it.

Then the images didn't load. The storage behind the community site refuses requests from other sites, a perfectly reasonable rule that turned every picture into a blank box. So the app now carries them itself: animated GIFs became short looping videos and screenshots became WebP, and 129 MB of media came down to 8.6 MB. They load instantly and work offline. Another seam, another two correct things disagreeing.

## 559 articles and a lesson that was *wrong*

Having the whole documentation set on disk made the obvious next question unavoidable. If the docs are right, how often is the course wrong?

One agent per session went through every factual claim in the lessons, 465 of them, and looked for an article that said otherwise. Each contradiction then went to a second agent whose only job was to prove the first one wrong. Forty-six were raised. Thirty-seven survived.

<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/thirty-two-pixels/8-corrections.png" aria-label="Three cards count up one after another: 46 raised, 37 survived a skeptic, 21 fixed." style="width:100%;border-radius:12px;">
    <source src="/essays/thirty-two-pixels/8-corrections.mp4" type="video/mp4" />
  </video>
  <figcaption>Three cards count up one after another: 46 raised, 37 survived a skeptic, 21 fixed.</figcaption>
</figure>

Some were stale rather than wrong. The training material predates features like automatic retries for integrations. Some were genuinely wrong. One lesson said that when someone leaves, only the flow admin can hand their pending tasks to someone else, not the account admin. The documentation says either can. A learner who believed the lesson would have escalated a problem they could have fixed themselves. Another told learners a column inside a table hides row by row, and built a quiz answer on it. The docs say a rule based on a header field hides the whole column.

The twenty-one serious ones are fixed, each now citing the article it came from. I write documentation for a living, and the most useful thing this project did was turn the documentation around and point it at the course.

## The helper that said it was *open*

Back to Kiko's screen helper. In testing I pressed "Look at my screen". Kiko said the helper was open at the bottom of the Kissflow pane. There was nothing there.

The library was being injected so early that the page didn't have a head yet. Its stylesheet tried to attach itself to that missing head, failed without a word, and the panel was built with no styles at all, which put it just below the visible edge of the pane. Everything reported success. That's the worst kind of bug: nothing is broken except the thing the person can see.

I fixed it, then asked for the obvious next step: let Kiko actually click and type, with any click on something like Delete or Deploy waiting for the learner's say-so. That worked too, until I switched to a newer model and every request came back with an error about a setting called reasoning effort. The library chose its settings from a fixed list of model names, and mine wasn't on it.

That was the moment to stop patching. So Kiko's brain moved home. The agent loop now runs inside the app, in Rust, on OpenAI's newer Responses API. The Kissflow page gets a small script I can read in full: it describes the screen and performs one action at a time, and that's all it can do. The page can no longer call the app at all, and the API key never goes near it.

<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/thirty-two-pixels/7-no-door.png" aria-label="An agent loop starts inside the Kissflow page with a line back to the app, then moves into the app. A lock appears, and the page keeps only its hands." style="width:100%;border-radius:12px;">
    <source src="/essays/thirty-two-pixels/7-no-door.mp4" type="video/mp4" />
  </video>
  <figcaption>An agent loop starts inside the Kissflow page with a line back to the app, then moves into the app. A lock appears, and the page keeps only its hands.</figcaption>
</figure>

There are three buttons now. Look at my screen answers questions about what you're seeing. Do it for me does the task while you watch, with a one-line reason for every step and an Allow or Don't before anything destructive. Check my build reads your exercise and marks each acceptance criterion met, not met or can't tell, with what it saw.

The research said the future is [WebMCP](https://github.com/webmachinelearning/webmcp), where a site publishes typed tools for agents instead of making them guess at buttons. It's right. But it's something a site's owner does, and Kissflow hasn't, yet. That one's a note for my day job, not this app.

## What a docs person takes from *this*

AI made the code cheap. A desktop app with a mascot, a coaching mode, an offline grading engine and three-platform auto-updates is not a weekend project, and it didn't feel like a heroic one either.

But the work didn't disappear. It moved. It moved to the seams: between the page and the native window, between a helpful library and a learner's private screen, between a README and the code it describes, between a course and the documentation it was supposed to agree with. Every hard problem in this build was two correct things disagreeing, and every fix started with someone refusing to accept "it should work" as an answer.

That's not a new skill. It's what good technical writers have always done: read the thing, check the claim, find the place where the story and the system stop matching. Building software with AI is mostly that, too.

Thirty-two pixels. That's where the work went.
