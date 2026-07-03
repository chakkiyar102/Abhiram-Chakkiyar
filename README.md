 # abhiram.cyou

Personal site of Abhiram Chakkiyar, a technical writer focused on simplifying technical concepts for non-technical audiences. Essays and notes on
making complex things clear, in docs, code, and pixels.

Built on [AstroPaper](https://github.com/satnaing/astro-paper), recolored to a
marine and tropical-pastel palette with watercolor accents, a two-layer
crumpled-paper texture, and Fraunces serif display type.

## Stack

Astro, Tailwind v4, TypeScript. Pagefind search, Satori/Sharp OG images, RSS,
sitemap. Deployed static to Vercel.

## Run locally

Requires Node >= 22.12 (use `nvm use 22`).

```bash
npm install
npm run dev      # http://localhost:4321
npx astro build  # production build to dist/ (use this, not `npm run build`)
```

Note: `npm run build` runs `astro check`, which currently throws a known,
unrelated vite-plugin type error. `npx astro build` is the real build gate.

## Content

- Essays: `src/content/posts/essays/`
- Notes: `src/content/posts/notes/`
- Projects: `src/content/projects/`
- About: `src/content/pages/about.md`

Add a real profile photo at `public/avatar.jpg` and set `src="/avatar.jpg"` on
the `<Avatar>` in `src/pages/index.astro` to replace the monogram.

## Theme

- Palette tokens: `src/styles/theme.css`
- Fonts, utilities, crumple texture: `src/styles/global.css`,
  `src/components/PaperTexture.astro`
- Watercolor accent: `src/components/Watercolor.astro`
