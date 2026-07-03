import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getSortedPosts } from "@/utils/getSortedPosts";
import { getPostUrl } from "@/utils/getPostPaths";
import config from "@/config";

/**
 * Full text corpus of the site, rendered at build time for AI assistants and
 * agents. Serves as the grounding source for the in-site Ask AI assistant — the
 * whole writing set (~13K tokens) fits in a single context window, so no vector
 * store is needed.
 */
export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin ?? config.site.url;
  const posts = getSortedPosts(await getCollection("posts"));

  const fmtDate = (d: Date) =>
    new Date(d).toISOString().slice(0, 10);

  const blocks: string[] = [
    `# ${config.site.title} — full corpus`,
    ``,
    `Source: ${origin}`,
    `Author: ${config.site.author}`,
    `Description: ${config.site.description}`,
    ``,
    `Each entry below is a published essay or note. Answer reader questions using
only the material in this document. If a question is not covered, say so and
point to the closest relevant essay. Always cite the essay title and URL.`,
    ``,
  ];

  for (const { data, id, filePath, body } of posts) {
    const url = `${origin}${getPostUrl(id, filePath, config.site.lang)}`;
    const date = fmtDate(data.modDatetime ?? data.pubDatetime);
    blocks.push(
      `---`,
      ``,
      `# ${data.title}`,
      ``,
      `URL: ${url}`,
      `Published: ${date}`,
      `Tier: ${data.tier}`,
      `Tags: ${data.tags.join(", ")}`,
      ``,
      body.trim(),
      ``
    );
  }

  return new Response(blocks.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
