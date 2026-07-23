---
author: Abhiram Chakkiyar
pubDatetime: 2026-07-23T02:47:31.404Z
title: "The Plugin Worked. Every Website Looked the Same."
draft: false
tags:
  - ai
  - claude-code
  - design
  - plugins
  - web-development
description: "How an AI website plugin learned to preserve hard-won performance rules while inventing a different experience structure for every build."
ogImage: "/essays/the-plugin-worked-every-website-looked-the-same/hero-poster.png"
---
<video autoplay loop muted playsinline poster="/essays/the-plugin-worked-every-website-looked-the-same/hero-poster.png" style="width:100%;border-radius:12px;">
  <source src="/essays/the-plugin-worked-every-website-looked-the-same/hero.mp4" type="video/mp4" />
</video>

The first version did exactly what I asked.

I gave it a one-line brief for a futuristic car brand. It generated the scenes, chose an image-driven experience, wired the scroll behavior, built the site, and handed back a production build. The next test was an HVAC brand. Different subject, different colors, different copy.

Same website.

Not pixel for pixel. The repetition was harder to see than that. Both sites opened on a pinned full-screen hero. Both put translucent information panels on the left and right. Both used a pill-shaped navigation bar, followed the experience with a card grid, added an alternating story section, and closed with the same footer wearing a new logo.

The [Claude Code plugin](https://code.claude.com/docs/en/plugins) worked. That was the problem. It had learned one successful answer so thoroughly that every new idea became a themed version of the same answer.

I had automated the craft out of the result.

## When success becomes a *template*

The plugin started as my attempt to preserve a difficult build. I had spent hours getting scroll-scrubbed video to feel smooth, keeping the browser from seeking too many frames, synchronizing smooth scrolling with animation, and cleaning up the strange failures that appear only after [React](https://react.dev/) mounts twice in development.

Those lessons deserved to become instructions. I am a documentation manager at [Kissflow](https://kissflow.com), so this instinct is almost impossible for me to resist. If a failure taught me something expensive, I want the next person, or the next agent, to begin after that lesson instead of before it.

I wrote the working page structure into the instructions along with the performance rules. That was the mistake. The physics were evidence. The page structure was merely one design that had survived.

<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/the-plugin-worked-every-website-looked-the-same/1-same-skeleton.png" aria-label="Two browser windows with identical internal layouts" style="width:100%;border-radius:12px;">
    <source src="/essays/the-plugin-worked-every-website-looked-the-same/1-same-skeleton.mp4" type="video/mp4" />
  </video>
  <figcaption>Two browser windows with identical internal layouts, showing how different themes can hide the same structural template.</figcaption>
</figure>

Templates are useful because they remove decisions. That is also how they erase identity. Once the plugin knew that a centered hero, two floating panels, a card grid, and a familiar footer were safe, it had no reason to risk anything else. A creative brief entered at the top. A reskinned skeleton came out at the bottom.

The first useful question was not, “How do I add more templates?” It was, “Which parts of this system have earned the right to stay fixed?”

## Keep the physics, free the *structure*

The answer split the plugin cleanly in two.

Some rules came from measurable failure. Video seeks had to be capped at 24 frames per second because asking the decoder for 60 made the experience choppy. Scroll interpolation at `0.08` gave the motion weight without making it feel detached. Scroll-stop detection had to watch meaningful progress changes, not every inertial tick. [GSAP](https://gsap.com/docs/v3/GSAP/) imports had to happen on the client. [Lenis](https://github.com/darkroomengineering/lenis) needed three precise integration lines and careful cleanup.

These were invariants. Ignoring them did not make a more original site. It made a broken one.

Everything else was negotiable: how the visitor enters, what scrolling does, how scenes exchange control, where information appears, what navigation feels like, what follows the main experience, and which interaction belongs only to this build.

<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/the-plugin-worked-every-website-looked-the-same/2-invariants.png" aria-label="A balance separating performance invariants from flexible structural decisions" style="width:100%;border-radius:12px;">
    <source src="/essays/the-plugin-worked-every-website-looked-the-same/2-invariants.mp4" type="video/mp4" />
  </video>
  <figcaption>A balance separating hard-won performance invariants from seven flexible structural decisions.</figcaption>
</figure>

> Preserve the rules paid for by failure. Reopen the decisions paid for only by habit.

That sentence became the architecture. The plugin would keep the engine and stop keeping the route.

## Seven questions before any *components*

I called the new stage [Structure Invention](https://github.com/chakkiyar102/immersive-oneshot-plugin#structure-invention). It runs after the plugin understands the idea and chooses the asset medium, but before it writes components.

Instead of reaching for a page skeleton, the system must answer seven questions.

1. **Entry ritual:** What happens before the ordinary page begins?
2. **Scroll grammar:** Does scrolling scrub time, travel horizontally, dive through space, reveal masks, or move between chapters?
3. **Transition language:** How does one scene surrender to the next?
4. **Information choreography:** Does copy pin, orbit, stack, interrupt, annotate, or stay absent?
5. **Navigation form:** What navigation belongs to this world instead of defaulting to a pill?
6. **Below-fold rhythm:** Which sections deserve to exist, and in what order?
7. **Signature move:** What is the one interaction this build alone owns?

<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/the-plugin-worked-every-website-looked-the-same/3-seven-axes.png" aria-label="Seven labeled cards orbiting a central Structure DNA document" style="width:100%;border-radius:12px;">
    <source src="/essays/the-plugin-worked-every-website-looked-the-same/3-seven-axes.mp4" type="video/mp4" />
  </video>
  <figcaption>Seven labeled cards orbiting a central Structure DNA document.</figcaption>
</figure>

The distinction between asset medium and experience structure matters. A site can use still images and still behave like a horizontal gallery, a field guide, a product disassembly, or a sequence of theatrical curtains. Video does not require a pinned scrub. Three-dimensional assets do not require a configurator. Medium gives the system material. Structure decides what the visitor does with it.

Each build now gets a `STRUCTURE-DNA.md` before it gets a React component. That document is not a mood board. It is a script for behavior.

## The first thought survived the *argument*

I considered three mechanisms for producing that script.

The safest was a catalog of approved structures. The practical middle was a hybrid: begin with a catalog, then mutate a few pieces. The bold option was full invention, three candidates created from first principles for every brief.

This is exactly the kind of decision I can make worse by staring at it for an hour. The First-Thought protocol I use for decisions inside my domain asks one disconfirming question: has anything made the first answer wrong? My first answer was full invention. I have enough experience reviewing interfaces to know that a larger template catalog still behaves like a catalog. Nothing I found disproved that.

So the plugin drafts three experience scripts, recommends one, and explains the recommendation in a sentence. The user can choose another, but nobody has to compare ten vaguely different directions.

<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/the-plugin-worked-every-website-looked-the-same/4-three-candidates.png" aria-label="Three candidate experience scripts narrowing into one recommended Structure DNA" style="width:100%;border-radius:12px;">
    <source src="/essays/the-plugin-worked-every-website-looked-the-same/4-three-candidates.mp4" type="video/mp4" />
  </video>
  <figcaption>Three candidate experience scripts narrowing into one recommended Structure DNA.</figcaption>
</figure>

That recommendation is important. “Here are three options” often transfers the hardest part of the work back to the person who asked for help. “I recommend this one because the reveal mirrors the product’s transformation” gives them a decision they can accept or challenge.

If they skip the choice, the recommendation wins. Momentum is a feature.

## Originality needs a *memory*

Asking for novelty is easy. Verifying it is harder.

Language models are excellent at producing three options that sound different while sharing the same bones. One says “cinematic chapters,” another says “immersive journey,” and a third says “spatial narrative.” Then all three produce a full-screen hero, floating cards, and a grid.

The plugin needed memory outside the prompt. After each successful build, it records the seven structural axes in a small local log. Before presenting a new candidate, it compares that candidate with the last five builds. If two or more axes match one recent build, those axes must change.

<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/the-plugin-worked-every-website-looked-the-same/5-build-memory.png" aria-label="A build log comparing seven structural axes across five recent projects" style="width:100%;border-radius:12px;">
    <source src="/essays/the-plugin-worked-every-website-looked-the-same/5-build-memory.mp4" type="video/mp4" />
  </video>
  <figcaption>A build log comparing seven structural axes across five recent projects and flagging a repeat.</figcaption>
</figure>

The threshold is intentionally simple. It does not pretend to measure creativity. It catches repetition early enough to force another pass. The log cannot tell whether an idea is good, but it can prove that “different” is not merely a new adjective.

I also fed the invention step a vocabulary gathered from places such as [MotionSites](https://motionsites.ai/) and [21st.dev](https://21st.dev/). These are ingredients, not templates. The system can borrow the notion of a portal entry, a slit reveal, or an exploded product view without copying the page that demonstrated it.

## Ambition needs a *fallback*

Every candidate script also marks the moments where generated video could materially improve the experience: a product changing state, two environments morphing into each other, or an ambient loop that makes a still scene breathe.

But every one of those moments must carry a CSS or GSAP fallback.

That requirement came from a practical annoyance. The most ambitious asset is often the least predictable part of the build. A video model may be unavailable, a generation may come back unusable, an API key may not exist on the current machine, or the user may simply prefer to spend nothing. If the whole structure depends on that clip, a creative suggestion has become a blocker.

So the plugin treats generated media as an upgrade path, not an entrance fee. It can generate assets online when a provider is available, or write a precise offline prompt pack and pause cleanly while the user creates them elsewhere. If the video never arrives, the structural idea still ships through masks, scale, typography, and transitions.

Constraint should shape the expression, not cancel the experience.

## Two gates around the *build*

Full invention creates a new risk: originality can become an excuse for nonsense.

The fix was not to retreat to templates. It was to add judgment at two points. Before coding, the plugin audits the proposed Structure DNA for familiar AI-design habits, weak hierarchy, borrowed navigation, empty spectacle, and interactions that cannot be explained. After coding, it audits the real pages again. A clever plan can still collapse into conventional components during implementation.

<figure>
  <video autoplay loop muted playsinline preload="metadata" poster="/essays/the-plugin-worked-every-website-looked-the-same/6-two-gates.png" aria-label="A Structure DNA passing through two quality gates" style="width:100%;border-radius:12px;">
    <source src="/essays/the-plugin-worked-every-website-looked-the-same/6-two-gates.mp4" type="video/mp4" />
  </video>
  <figcaption>A Structure DNA passing through a design gate, becoming a website, and passing through a second quality gate.</figcaption>
</figure>

The two gates have different evidence. The first asks whether the idea has a coherent reason to exist. The second asks whether the browser actually delivers it. A build does not ship with an open critical finding.

This is the part of AI-assisted work that interests me most. The value is not asking a model for a beautiful website. The value is turning taste into checkpoints, turning failures into invariants, and arranging the workflow so the cheap mistake happens before the expensive implementation.

## Why this became a *plugin*

Once the workflow held together, I packaged it as [immersive-oneshot](https://github.com/chakkiyar102/immersive-oneshot-plugin), an open-source plugin rather than another long prompt in a notes file.

That choice forces useful discipline. A plugin needs a small entry point, separate references for the heavy instructions, explicit commands for starting and resuming work, a version, a changelog, and installation that works outside the machine where it was born. It also makes the real product visible. The product is not any one generated website. It is the repeatable decision system that produces and checks the website.

The code stack is ordinary: [Next.js](https://nextjs.org/), GSAP, Lenis, and optional image, video, or 3D assets. The interesting part lives one level above the stack. The plugin decides which medium fits, invents three structures, checks recent memory, recommends a direction, writes the behavioral contract, builds against fixed performance physics, and audits the result.

I still expect the system to fail in new ways. That is not a disclaimer. It is the maintenance model. When a failure teaches a general lesson, the lesson becomes an invariant, a gate, or a better question. It does not automatically become another fixed page.

## The rule I am keeping *now*

I began this project wanting one command that could build an immersive website. I ended up learning that “one-shot” cannot mean “one answer.” It has to mean one complete process with room for a different answer each time.

The same principle applies well beyond websites. In documentation, a template should preserve metadata and review requirements, not force every explanation into the same rhythm. In management, a recurring process should protect the decisions that are easy to forget, not predetermine every outcome. In agent workflows, the instructions should hold onto scar tissue and loosen their grip on taste.

The plugin now has a simple compact: physics stay fixed, structure starts blank.

That feels less like automation replacing design. It feels like automation finally making space for it.

<p><em>The immersive-oneshot plugin is available on <a href="https://github.com/chakkiyar102/immersive-oneshot-plugin">GitHub</a>. It includes the Structure Invention protocol, four experience archetypes, online and offline asset modes, and the performance rules described here.</em></p>
