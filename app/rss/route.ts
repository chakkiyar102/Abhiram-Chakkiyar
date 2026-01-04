import { getAllPosts } from '@/lib/posts';

export const dynamic = 'force-static';

export async function GET() {
  const posts = getAllPosts();

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Abhiram Chakkiyar - Blog</title>
    <description>A developer, writer, and creator sharing thoughts on tech and more.</description>
    <link>https://yoursite.com</link>
    <language>en</language>
    ${posts.map(post => `
    <item>
      <title>${post.title}</title>
      <description>${post.description || ''}</description>
      <link>https://yoursite.com/blog/${post.slug}</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>https://yoursite.com/blog/${post.slug}</guid>
    </item>`).join('')}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
