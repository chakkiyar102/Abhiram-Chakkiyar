import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="mb-12">
          <Link
            href="/"
            className="text-zinc-500 dark:text-zinc-500 hover:text-black dark:hover:text-zinc-100 transition-colors"
          >
            ← Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-12 text-black dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          All Posts
        </h1>

        {posts.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-500 italic">No posts yet. Check back soon!</p>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-2xl font-medium text-black dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors mb-2">
                    {post.title}
                  </h2>
                  <time className="text-sm text-zinc-400 dark:text-zinc-600" dateTime={post.date}>
                    {formatDate(post.date)}
                  </time>
                  {post.description && (
                    <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                      {post.description}
                    </p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
