---
author: Abhiram Chakkiyar
pubDatetime: 2026-06-26T02:54:44.042Z
title: "How I Cut My AI Bill Without Talking Less"
draft: false
tags:
  - ai
  - claude-code
  - tokens
  - workflow
description: "Four set-once valves in my Claude Code config that quietly cut token spend, no willpower required."
ogImage: "/essays/ai-token-valves/1-1-receipt-gauge.png"
---
# How I Cut My AI Bill Without *Talking* Less

I spent a bit over $1,700 in a month talking to a robot. The fix was not discipline. It was plumbing you set once and forget.

*Abhiram · 5 min read*

![The number that started it. Eighty-odd dollars on the days I actually used it.](/essays/ai-token-valves/1-1-receipt-gauge.png)

Last week I ran a small script that adds up what I spend inside Claude Code, the AI coding tool I live in. The number came back at a bit over $1,700 for the month. About eighty dollars on the days I actually used it. I am a documentation manager, not an engineer, so my first instinct was guilt. Maybe I should just use it less.

That instinct is wrong. It took me a while to see why. A token is the unit an AI charges by. Every word you send it and every word it sends back has a price. The obvious way to spend less is to type less and ask for less. But that is willpower, and willpower fails by Wednesday. The thing that actually works is plumbing. You install a few valves in the pipe, set them once, and they keep saving while you forget they are there. I have four.

## The valve on *every* command

The first one sits on every command the AI runs. Claude Code does real work in my terminal. It lists files, searches code, reads documents. Each one dumps its output back into the conversation, and that output is tokens I pay for. So I switched on a small hook called RTK in front of all of it. Before any command runs, RTK quietly rewrites it to a leaner version and trims the noise out of the result.

A raw file search might hand back three thousand tokens of paths I will never read. RTK returns the same answer in about a third of that. On a plain search it cuts more than seventy percent. I did not change a thing about how I work. A single line in a config file does the work for me, on every command, forever.

![RTK: a hook that thins the pipe before the bill ever sees it.](/essays/ai-token-valves/2-2-rtk-valve.png)

## Cutting the *padding* out of the reply

The second valve points the other way, at what the AI says back. I keep a mode switched on called caveman that strips replies down to the bone. No "I would be happy to help," no throat-clearing, no three sentences where one fragment will do. The substance stays. The padding dies. If you have ever watched an AI write a whole paragraph to say "yes," you know how much there is to cut. The answer lands shorter, the bill lands smaller, and honestly I read faster too.

Next to it runs a third persona named ponytail. It makes the AI behave like a tired senior developer who got paged at 3am and wants to write as little code as possible. Fewer lines generated means fewer tokens generated. But here is the part I did not expect. The laziest correct solution is usually the one I can actually maintain. Saving money and getting cleaner work turned out to be the same lever.

> You do not save tokens by thinking smaller. You install a valve and forget it exists.

## The menu nobody *caps*

The fourth one I am quietly proud of, because almost nobody talks about it. Every session loads a menu of the tools and skills the AI can reach, and that menu costs tokens before I have asked for a single thing. Mine had grown long, dozens of skills deep. So I capped it. One setting tells Claude Code to spend no more than two percent of its budget describing that menu on the way in.

The skills are all still there. They just stop reciting themselves at length every time I open a session. It is the difference between a waiter reading you the entire menu and one handing you a card. Same kitchen, far less talking.

![The skill menu, capped at two percent. Same kitchen, less reciting.](/essays/ai-token-valves/3-3-menu-cap.png)

## Measure, then *forget*

None of this is clever on its own. The trick is that I never have to remember any of it. The hook fires whether I am paying attention or not. The modes stay on across every session. And once a week I run that same little script, see the number, and adjust if it has drifted. That is the entire system. Not "use the AI less." Measure, install a valve, forget it, check the meter.

> **!** The order matters. Without the weekly number I would never know which valve was actually working, and I would be back to guessing and rationing.

The month I started, I was bracing to put myself on a budget. Instead I let the plumbing do the rationing. I still ask the AI for everything I want. It just costs a good deal less to want it.

*Written from my own Claude Code config, one valve at a time.*
