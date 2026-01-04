import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-static';

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-amber-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-12 text-zinc-900 dark:text-zinc-100 border-b-2 border-blue-600 dark:border-blue-400 pb-4">
          All Posts
        </h1>

        {posts.length === 0 ? (
          <p className="text-zinc-500 italic">No posts yet. Check back soon!</p>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-zinc-200 dark:border-zinc-800"
              >
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                    {post.title}
                  </h2>
                  <time className="text-sm text-zinc-500 dark:text-zinc-500" dateTime={post.date}>
                    {formatDate(post.date)}
                  </time>
                  {post.description && (
                    <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {post.description}
                    </p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium"
                        >
                          #{tag}
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
