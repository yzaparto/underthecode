import { useParams, Link, Navigate } from 'react-router-dom'
import { AnimationViewer } from '../engine/AnimationViewer'
import { animations } from '../content/asyncio'
import { articles } from '../content/asyncio/articles'
import { Prose } from '../components/InlineCode'

const TOTAL = animations.length

function SectionHeading({ children, color = 'text-blue-400' }: { children: React.ReactNode; color?: string }) {
  return (
    <h2 className={`text-xl font-semibold ${color}`}>
      {children}
    </h2>
  )
}

function Paragraphs({ items }: { items: string[] }) {
  return (
    <>
      {items.map((p, i) => (
        <p key={i} className="text-gray-300 leading-relaxed"><Prose text={p} /></p>
      ))}
    </>
  )
}

function BulletList({ items, className = 'text-gray-300' }: { items: string[]; className?: string }) {
  return (
    <ul className={`list-disc space-y-2 pl-5 ${className}`}>
      {items.map((item, i) => (
        <li key={i}><Prose text={item} /></li>
      ))}
    </ul>
  )
}

export function AnimationPage() {
  const { step } = useParams<{ step: string }>()
  const index = Number(step) - 1

  if (isNaN(index) || index < 0 || index >= TOTAL) {
    return <Navigate to="/articles/python-asyncio/1" replace />
  }

  const animation = animations[index]
  const article = articles[index]
  const prev = index > 0 ? index : null
  const next = index < TOTAL - 1 ? index + 2 : null

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Link
          to="/articles/python-asyncio"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back to overview
        </Link>
        <span className="text-sm text-gray-500">
          {index + 1} of {TOTAL}
        </span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-white">
        {animation.title}
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Animation {index + 1} of {TOTAL}
      </p>

      <hr className="my-8 border-gray-800" />

      {/* ── BEFORE THE ANIMATION ── */}

      {/* Introduction */}
      <section className="mb-10 space-y-4">
        <SectionHeading>Introduction</SectionHeading>
        <Paragraphs items={article.before.intro} />
      </section>

      {/* Why This Matters */}
      <section className="mb-10 space-y-4">
        <SectionHeading color="text-purple-400">Why This Matters</SectionHeading>
        <Paragraphs items={article.before.whyUseful} />
      </section>

      {/* When to Use This Pattern */}
      <section className="mb-10 space-y-4">
        <SectionHeading color="text-cyan-400">When to Use This Pattern</SectionHeading>
        <BulletList items={article.before.whenToUse} />
      </section>

      {/* Stepper hint */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          Press <kbd className="rounded border border-gray-700 bg-gray-800 px-1.5 py-0.5 text-xs">&rarr;</kbd> or
          click &ldquo;Next&rdquo; to step through the animation.
        </p>
      </div>

      {/* The animation */}
      <AnimationViewer definition={animation} />

      {/* ── AFTER THE ANIMATION ── */}

      <hr className="my-10 border-gray-800" />

      {/* Walkthrough */}
      <section className="mt-10 space-y-4">
        <SectionHeading color="text-green-400">What Just Happened</SectionHeading>
        <Paragraphs items={article.after.walkthrough} />
      </section>

      {/* Keep in Mind */}
      {article.after.keepInMind.length > 0 && (
        <section className="mt-10">
          <div className="rounded-lg border border-yellow-900/50 bg-yellow-950/30 p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-yellow-400">
              Keep in Mind
            </h3>
            <BulletList items={article.after.keepInMind} className="text-sm text-yellow-200/80" />
          </div>
        </section>
      )}

      {/* Common Pitfalls */}
      {article.after.pitfalls.length > 0 && (
        <section className="mt-10">
          <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-red-400">
              Common Pitfalls
            </h3>
            <BulletList items={article.after.pitfalls} className="text-sm text-red-200/80" />
          </div>
        </section>
      )}

      {/* Where to Incorporate This */}
      {article.after.realWorld.length > 0 && (
        <section className="mt-10 space-y-4">
          <SectionHeading color="text-emerald-400">Where to Incorporate This</SectionHeading>
          <BulletList items={article.after.realWorld} />
        </section>
      )}

      {/* Related Patterns */}
      {article.after.relatedPatterns.length > 0 && (
        <section className="mt-10 space-y-4">
          <SectionHeading color="text-indigo-400">Related Patterns &amp; Further Reading</SectionHeading>
          <BulletList items={article.after.relatedPatterns} />
        </section>
      )}

      {/* Prev / Next navigation */}
      <hr className="my-10 border-gray-800" />
      <div className="flex items-center justify-between">
        {prev !== null ? (
          <Link
            to={`/articles/python-asyncio/${prev}`}
            className="rounded-lg border border-gray-800 px-5 py-3 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-900"
          >
            &larr; {animations[prev - 1].title}
          </Link>
        ) : (
          <div />
        )}
        {next !== null ? (
          <Link
            to={`/articles/python-asyncio/${next}`}
            className="rounded-lg border border-gray-800 px-5 py-3 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-900"
          >
            {animations[next - 1].title} &rarr;
          </Link>
        ) : (
          <Link
            to="/articles/python-asyncio"
            className="rounded-lg border border-green-800 bg-green-950/30 px-5 py-3 text-sm text-green-300 transition-colors hover:bg-green-950/50"
          >
            Back to overview &rarr;
          </Link>
        )}
      </div>
    </main>
  )
}
