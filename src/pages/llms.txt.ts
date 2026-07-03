import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getSortedPosts } from "@/utils/getSortedPosts";
import { getPostUrl } from "@/utils/getPostPaths";
import config from "@/config";

export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin ?? config.site.url;
  const posts = getSortedPosts(await getCollection("posts"));

  const lines: string[] = [
    `# ${config.site.title}`,
    ``,
    `> ${config.site.description}`,
    ``,
    `Author: ${config.site.author}`,
    `Site: ${origin}`,
    ``,
    `## Essays`,
    ...posts.map(
      ({ data, id, filePath }) =>
        `- [${data.title}](${origin}${getPostUrl(id, filePath, config.site.lang)}): ${data.description}`
    ),
    ``,
    `## Sections`,
    `- [Writing index](${origin}/writing/)`,
    `- [Projects](${origin}/projects/)`,
    `- [Tags](${origin}/tags/)`,
    `- [About](${origin}/about/)`,
    `- [Full corpus for AI](${origin}/llms-full.txt)`,
    ``,
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
