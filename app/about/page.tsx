import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-amber-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Back to Home */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Profile Picture */}
        <div className="mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
            AC
          </div>
        </div>

        {/* Name */}
        <h1 className="text-5xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 font-sans">
          <span className="text-blue-600 dark:text-blue-400">Abhiram Chakkiyar</span>
        </h1>

        <p className="text-2xl text-zinc-700 dark:text-zinc-300 mb-12 font-light">
          Developer, Writer, & Creator
        </p>

        {/* About Content */}
        <section className="prose prose-zinc dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-zinc-100">About Me</h2>

          <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            I'm a passionate developer who loves building things for the web. When I'm not coding,
            you'll find me reading about the latest tech trends, experimenting with new frameworks,
            or sharing my knowledge through writing.
          </p>

          <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed mb-8">
            This blog is my space to document my journey, share tutorials, and connect with fellow
            developers. Feel free to explore my posts or reach out!
          </p>

          {/* Skills/Interests */}
          <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Interests</h2>
          <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 space-y-2 mb-8">
            <li>Web Development</li>
            <li>React & Next.js</li>
            <li>Tech Writing</li>
            <li>Open Source</li>
          </ul>

          {/* Connect */}
          <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Let's Connect</h2>
          <p className="text-zinc-700 dark:text-zinc-300 mb-6">
            Feel free to reach out through any of these platforms:
          </p>

          <div className="flex flex-wrap gap-6">
            <a
              href="https://github.com/chakkiyar102"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a
              href="https://twitter.com/abhichakkiyar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter
            </a>
            <a
              href="https://linkedin.com/in/abhiramchakkiyar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <a
              href="mailto:abhiram@chakkiyar.org"
              className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
