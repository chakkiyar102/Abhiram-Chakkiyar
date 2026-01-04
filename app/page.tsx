import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

export default function Home() {
  const posts = getAllPosts().slice(0, 5);

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <section className="mb-20">
          <h1 className="text-4xl font-bold mb-4 text-black dark:text-zinc-100">
            Hi, I'm <span className="text-zinc-600 dark:text-zinc-400">Abhiram Chakkiyar</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-2">
            A developer, writer, and creator.
          </p>
          <p className="text-zinc-500 dark:text-zinc-500">
            Welcome to my little, personal slice of the internet. Explore my blogs while you are here.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-8 text-black dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            Latest Posts
          </h2>

          {posts.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-500 italic">No posts yet. Check back soon!</p>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article key={post.slug} className="group">
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-xl font-medium text-black dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                      {post.title}
                    </h3>
                    <time className="text-sm text-zinc-400 dark:text-zinc-600" dateTime={post.date}>
                      {formatDate(post.date)}
                    </time>
                    {post.description && (
                      <p className="mt-2 text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {post.description}
                      </p>
                    )}
                  </Link>
                </article>
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <div className="mt-12">
              <Link
                href="/blog"
                className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-100 transition-colors"
              >
                View all posts →
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
