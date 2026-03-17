import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();

  // Authenticated users on the console go straight to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-10 lg:px-20 py-4 h-[72px]">
        <Link href="/" className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold">
          Open Animate
        </Link>
        <nav className="flex items-center gap-6 text-sm text-neutral-400">
          <a href="https://docs.open-animate.com" className="hover:text-white transition-colors">Docs</a>
          <a href="https://github.com/jacobcwright/open-animate" className="hover:text-white transition-colors">GitHub</a>
          <Link href="/sign-in" className="hover:text-white transition-colors">Log in</Link>
          <Link href="/sign-up" className="bg-white text-black px-4 py-1.5 font-medium hover:bg-neutral-200 transition-colors">
            Sign up
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 sm:px-10 pt-20 sm:pt-32 pb-24">
        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center border border-neutral-800 bg-neutral-950 p-1">
            <span className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest bg-white text-black">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              Human
            </span>
            <Link
              href="/agent"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              Agent
            </Link>
          </div>
        </div>

        <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl lg:text-6xl font-bold text-center leading-tight mb-6">
          The creative suite<br />for agents.
        </h1>
        <p className="text-center text-neutral-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Open-source motion graphics toolkit that turns any coding agent into a motion designer.
          Describe what you want. Get an MP4. Ship it.
        </p>

        <div className="flex justify-center mb-6">
          <code className="font-[family-name:var(--font-jetbrains-mono)] text-sm bg-neutral-900 border border-neutral-800 px-5 py-2.5 text-neutral-300">
            <span className="text-neutral-600">$ </span>npx oanim init
          </code>
        </div>

        <div className="flex justify-center gap-4 mb-16">
          <a
            href="https://docs.open-animate.com/quickstart"
            className="bg-white text-black px-6 py-2.5 text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            Get started
          </a>
          <a
            href="https://github.com/jacobcwright/open-animate"
            className="border border-neutral-700 text-white px-6 py-2.5 text-sm font-medium hover:bg-neutral-900 transition-colors"
          >
            Star on GitHub
          </a>
        </div>

        <p className="text-center text-neutral-600 text-sm">
          Works with Claude Code · Cursor · Codex · Windsurf · any agent that writes code
        </p>

        {/* How it works */}
        <div className="mt-24 border-t border-neutral-900 pt-16">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl sm:text-3xl font-semibold text-center mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="border border-neutral-800 p-6">
              <div className="text-neutral-600 text-xs font-medium uppercase tracking-widest mb-3">01</div>
              <h3 className="font-medium text-white mb-2">Describe</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Tell your agent what you want. A launch video, explainer, social clip — in plain English.
              </p>
            </div>
            <div className="border border-neutral-800 p-6">
              <div className="text-neutral-600 text-xs font-medium uppercase tracking-widest mb-3">02</div>
              <h3 className="font-medium text-white mb-2">Generate</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Assets are created on the fly — images, video, audio from 30+ AI models.
              </p>
            </div>
            <div className="border border-neutral-800 p-6">
              <div className="text-neutral-600 text-xs font-medium uppercase tracking-widest mb-3">03</div>
              <h3 className="font-medium text-white mb-2">Render</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                React components compile to MP4 via Remotion. Deterministic — same input, same output.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 border-t border-neutral-900 pt-16 text-center">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl sm:text-3xl font-semibold mb-4">
            Your agent&apos;s first video is 60 seconds away.
          </h2>
          <div className="flex justify-center gap-4 mt-8">
            <a
              href="https://docs.open-animate.com/quickstart"
              className="bg-white text-black px-6 py-2.5 text-sm font-medium hover:bg-neutral-200 transition-colors"
            >
              Get started
            </a>
            <a
              href="https://docs.open-animate.com"
              className="border border-neutral-700 text-white px-6 py-2.5 text-sm font-medium hover:bg-neutral-900 transition-colors"
            >
              Read the docs
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 px-6 sm:px-10 lg:px-20 py-8 text-sm text-neutral-600">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>Apache 2.0 Licensed. Always will be.</span>
          <div className="flex gap-6">
            <a href="https://github.com/jacobcwright/open-animate" className="hover:text-neutral-400 transition-colors">GitHub</a>
            <a href="https://www.npmjs.com/package/@oanim/core" className="hover:text-neutral-400 transition-colors">npm</a>
            <a href="https://docs.open-animate.com" className="hover:text-neutral-400 transition-colors">Docs</a>
            <a href="https://oanim.dev" className="hover:text-neutral-400 transition-colors">Console</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
