import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPostBySlug, getAllPostSlugs } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-amber-50 dark:bg-zinc-950">
      <article className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Posts
          </Link>
        </div>

        <header className="mb-12 pb-8 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500 mb-6">
            <time dateTime={post.date}>
              {formatDate(post.date)}
            </time>
            <span>·</span>
            <span>By Abhiram Chakkiyar</span>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100
          prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
          prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-relaxed
          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100
          prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-zinc-900 dark:prose-pre:bg-black
          prose-blockquote:border-blue-600 dark:prose-blockquote:border-blue-400 prose-blockquote:text-zinc-600 dark:prose-blockquote:text-zinc-400
          prose-li:text-zinc-700 dark:prose-li:text-zinc-300
        ">
          <MDXRemote source={post.content} />
        </div>

        {/* Author Section */}
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0">
              AC
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Written by Abhiram Chakkiyar</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Developer, writer, and creator. I write about code, technology, and everything in between.
              </p>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
