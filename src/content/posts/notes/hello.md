---
title: "Quick Note: Filtering Astro Content Collections by Subdirectory"
pubDatetime: 2026-06-19T00:00:00.000Z
description: "How to use post.id.startsWith() to filter content collection entries to a specific subdirectory in Astro."
tags:
  - astro
  - notes
draft: true
---

DRAFT — This note is a shape example. Fill in once there's a real finding worth keeping.

When you need to filter Astro content collection posts to only those in a specific subdirectory, use the `id` field. It holds the relative path within the collection base, so you can do this:

```ts
const allPosts = await getCollection("posts", ({ data }) => !data.draft);
const notes = allPosts.filter(post => post.id.startsWith("notes/"));
```

The `id` comes from the file path relative to the `base` directory set in `content.config.ts` (via `glob({ base: "./src/content/posts" })`). A file at `src/content/posts/notes/hello.md` gets `id = "notes/hello"`.

Worth noting: this approach is stable across Astro versions that use the content layer (v5+). Earlier versions used `slug` instead of `id`.

Needs more: edge cases around nested subdirectories, what happens with index files.
