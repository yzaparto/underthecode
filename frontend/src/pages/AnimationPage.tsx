import { useParams, Link, Navigate } from 'react-router-dom'
import { AnimationViewer } from '../engine/AnimationViewer'
import { animations } from '../content/asyncio'
import { articles } from '../content/asyncio/articles'
import { Prose } from '../components/InlineCode'

const TOTAL = animations.length

function SectionHeading({ children, color = 'text-brand' }: { children: React.ReactNode; color?: string }) {
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
        <p key={i} className="leading-relaxed text-muted"><Prose text={p} /></p>
      ))}
    </>
  )
}

function BulletList({ items, className = 'text-muted' }: { items: string[]; className?: string }) {
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
          className="text-sm text-muted transition-colors hover:text-text"
        >
          &larr; Back to overview
        </Link>
        <span className="text-sm text-muted">
          {index + 1} of {TOTAL}
        </span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-text">
        {animation.title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Animation {index + 1} of {TOTAL}
      </p>

      <hr className="my-8 border-border" />

      {/* ── BEFORE THE ANIMATION ── */}

      {/* Introduction */}
      <section className="mb-10 space-y-4">
        <SectionHeading>Introduction</SectionHeading>
        <Paragraphs items={article.before.intro} />
      </section>

      {/* Why This Matters */}
      <section className="mb-10 space-y-4">
        <SectionHeading color="text-violet">Why This Matters</SectionHeading>
        <Paragraphs items={article.before.whyUseful} />
      </section>

      {/* When to Use This Pattern */}
      <section className="mb-10 space-y-4">
        <SectionHeading color="text-brand">When to Use This Pattern</SectionHeading>
        <BulletList items={article.before.whenToUse} />
      </section>

      {/* Stepper hint */}
      <div className="mb-6">
        <p className="text-sm text-muted">
          Press <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-xs">&rarr;</kbd> or
          click &ldquo;Next&rdquo; to step through the animation.
        </p>
      </div>

      {/* The animation */}
      <AnimationViewer definition={animation} />

      {/* ── AFTER THE ANIMATION ── */}

      <hr className="my-10 border-border" />

      {/* Walkthrough */}
      <section className="mt-10 space-y-4">
        <SectionHeading color="text-green">What Just Happened</SectionHeading>
        <Paragraphs items={article.after.walkthrough} />
      </section>

      {/* Keep in Mind */}
      {article.after.keepInMind.length > 0 && (
        <section className="mt-10">
          <div className="rounded-lg border border-amber/50 bg-amber/10 p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-amber">
              Keep in Mind
            </h3>
            <BulletList items={article.after.keepInMind} className="text-sm text-amber" />
          </div>
        </section>
      )}

      {/* Common Pitfalls */}
      {article.after.pitfalls.length > 0 && (
        <section className="mt-10">
          <div className="rounded-lg border border-red/50 bg-red/10 p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-red">
              Common Pitfalls
            </h3>
            <BulletList items={article.after.pitfalls} className="text-sm text-red" />
          </div>
        </section>
      )}

      {/* Where to Incorporate This */}
      {article.after.realWorld.length > 0 && (
        <section className="mt-10 space-y-4">
          <SectionHeading color="text-green">Where to Incorporate This</SectionHeading>
          <BulletList items={article.after.realWorld} />
        </section>
      )}

      {/* Related Patterns */}
      {article.after.relatedPatterns.length > 0 && (
        <section className="mt-10 space-y-4">
          <SectionHeading color="text-violet">Related Patterns &amp; Further Reading</SectionHeading>
          <BulletList items={article.after.relatedPatterns} />
        </section>
      )}

      {/* Prev / Next navigation */}
      <hr className="my-10 border-border" />
      <div className="flex items-center justify-between">
        {prev !== null ? (
          <Link
            to={`/articles/python-asyncio/${prev}`}
            className="rounded-lg border border-border px-5 py-3 text-sm text-muted transition-colors hover:border-border hover:bg-surface-2"
          >
            &larr; {animations[prev - 1].title}
          </Link>
        ) : (
          <div />
        )}
        {next !== null ? (
          <Link
            to={`/articles/python-asyncio/${next}`}
            className="rounded-lg border border-border px-5 py-3 text-sm text-muted transition-colors hover:border-border hover:bg-surface-2"
          >
            {animations[next - 1].title} &rarr;
          </Link>
        ) : (
          <Link
            to="/articles/python-asyncio"
            className="rounded-lg border border-green bg-green/20 px-5 py-3 text-sm text-green transition-colors hover:bg-green/30"
          >
            Back to overview &rarr;
          </Link>
        )}
      </div>
    </main>
  )
}
