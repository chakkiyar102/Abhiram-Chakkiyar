import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import rehypeCallouts from "rehype-callouts";
import rehypeExternalLinks from "rehype-external-links";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./astro-paper.config";

// Auto-seed a believable low view count for any NEW post at build time.
// abacus /create fails on existing keys, so already-live posts are untouched —
// only a freshly published post gets a floor, on the deploy that first ships it.
// ponytail: build-time hook, no server needed. Swap NS/URL if abacus dies.
function autoseedViews() {
  const NS = "abhiram-cyou";
  const keyOf = (p: string) =>
    p.replace(/[^a-z0-9]/gi, "_").replace(/^_+|_+$/g, "") || "home";
  return {
    name: "autoseed-views",
    hooks: {
      "astro:build:done": async ({ pages, logger }: any) => {
        const posts = pages
          .map((p: { pathname: string }) => p.pathname)
          .filter((p: string) => /^\/?posts\//.test(p));
        for (const p of posts) {
          const init = 40 + Math.floor(Math.random() * 120); // low, believable
          try {
            const r = await fetch(
              `https://abacus.jasoncameron.dev/create/${NS}/${keyOf(p)}?initializer=${init}`
            );
            const d = await r.json();
            if (typeof d.value === "number")
              logger.info(`seeded ${keyOf(p)} -> ${d.value}`);
          } catch {
            /* network/service down: skip, real visits still auto-create at 1 */
          }
        }
      },
    },
  };
}

export default defineConfig({
  site: config.site.url,
  integrations: [
    autoseedViews(),
    mdx(),
    react(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
  ],
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
      ],
      rehypePlugins: [
        rehypeCallouts,
        [
          rehypeExternalLinks,
          { target: "_blank", rel: ["noopener", "noreferrer"] },
        ],
      ],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
