import RSS from 'rss';
import { getAllPosts } from '@/lib/posts';

export const dynamic = 'force-static';

export async function GET() {
  const feed = new RSS({
    title: 'Your Name - Blog',
    description: 'A developer, writer, and creator sharing thoughts on tech and more.',
    feed_url: 'https://yoursite.com/feed.xml',
    site_url: 'https://yoursite.com',
    language: 'en',
    pubDate: new Date(),
    ttl: 60,
  });

  const posts = getAllPosts();

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.description,
      url: `https://yoursite.com/blog/${post.slug}`,
      date: new Date(post.date),
      categories: post.tags || [],
    });
  });

  return new Response(feed.xml(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
