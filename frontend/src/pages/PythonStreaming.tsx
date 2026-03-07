import { Link } from 'react-router-dom'
import { ArticleLayout } from '../components/layout/ArticleLayout'
import { streamingAnimations, streamingSections } from '../content/streaming'

export function PythonStreaming() {
  return (
    <ArticleLayout
      title="Python Streaming: Generators In Depth"
      description="Step-by-step interactive animations showing how generators, iterators, and streaming work under the hood in Python."
    >
      <section className="space-y-4">
        <p className="leading-relaxed text-muted">
          Python's <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">yield</code> keyword
          transforms functions into generators — lazy sequences that compute values on demand. But what actually happens
          when you yield? How does Python pause and resume execution?
        </p>
        <p className="leading-relaxed text-muted">
          This guide takes you from complete beginner to expert through 20 interactive animations. Start with the basics,
          understand the mechanics, master the tools, build pipelines, and learn expert patterns. Each animation lets you
          step through code line by line and watch exactly what happens.
        </p>
      </section>

      {/* Sections with animations */}
      {streamingSections.map((section, sectionIndex) => (
        <section key={section.title} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              {sectionIndex + 1}
            </span>
            <div>
              <h2 className="text-xl font-bold text-text">{section.title}</h2>
              <p className="text-sm text-muted">{section.description}</p>
            </div>
          </div>
          <ol className="space-y-2 pl-11">
            {section.animations.map((animIndex) => {
              const anim = streamingAnimations[animIndex]
              return (
                <li key={anim.id}>
                  <Link
                    to={`/articles/python-streaming/${animIndex + 1}`}
                    className="flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:border-brand/50 hover:bg-surface-2"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-muted">
                      {animIndex + 1}
                    </span>
                    <div>
                      <h3 className="font-medium text-text">{anim.title}</h3>
                      <p className="mt-0.5 text-sm text-muted">{getSubtitle(animIndex)}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ol>
        </section>
      ))}

      <section className="space-y-4 rounded-lg border border-border bg-surface-2 p-6">
        <h2 className="text-xl font-bold text-text">Key Takeaways</h2>
        <ul className="list-disc space-y-2 pl-6 text-muted">
          <li><code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand">yield</code> pauses execution and saves state; <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand">next()</code> resumes it.</li>
          <li><code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand">return</code> exits forever; <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand">yield</code> pauses and can resume.</li>
          <li>Generators have 4 states: CREATED → RUNNING ↔ PAUSED → DONE.</li>
          <li>Memory is O(1) not O(n) — generators hold state, not all values.</li>
          <li>Lazy evaluation defers computation until values are pulled.</li>
          <li><code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand">send()</code> enables two-way communication; <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand">throw()</code> and <code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand">close()</code> control termination.</li>
          <li><code className="rounded bg-surface px-1.5 py-0.5 text-sm text-brand">yield from</code> delegates to sub-generators with full protocol support.</li>
          <li>Chained generators create memory-efficient pipelines.</li>
          <li>Pull-based flow provides automatic backpressure.</li>
          <li>Async generators enable streaming from async sources like LLM APIs.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text">Quick Reference</h2>

        <div className="rounded-lg border border-border bg-surface-2 p-6">
          <h3 className="mb-4 text-lg font-bold text-text">Generator Operations</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">yield value</code>
              <p className="mt-2 text-sm text-muted">Pause and output a value.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">next(gen)</code>
              <p className="mt-2 text-sm text-muted">Resume and get next value.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">gen.send(value)</code>
              <p className="mt-2 text-sm text-muted">Resume with injected value.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">gen.throw(exc)</code>
              <p className="mt-2 text-sm text-muted">Inject exception at yield.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">gen.close()</code>
              <p className="mt-2 text-sm text-muted">Terminate generator cleanly.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">yield from iter</code>
              <p className="mt-2 text-sm text-muted">Delegate to sub-generator.</p>
            </div>
          </div>
        </div>
      </section>
    </ArticleLayout>
  )
}

function getSubtitle(index: number): string {
  const subtitles = [
    'yield pauses, next() resumes — the foundation of generators',
    'return exits forever; yield pauses temporarily',
    'for loops call next() automatically and catch StopIteration',
    'Stop early and skip work you don\'t need',
    'Created → Running → Paused → Done',
    'The __iter__ and __next__ protocol behind for loops',
    'O(1) vs O(n) — generators hold state, not all values',
    'Compute values only when needed',
    '(x for x in items) — compact lazy sequences',
    'Two-way communication with generators',
    'Error injection and cleanup control',
    'Delegate to sub-generators cleanly',
    'Connect generators into processing pipelines',
    'Process files larger than RAM',
    'Standard library tools: islice, chain, takewhile',
    'Consumers naturally throttle producers',
    'Turn generators into context managers',
    'Trade latency for throughput with batching',
    'Handle errors without stopping the stream',
    'Streaming from async sources like LLM APIs',
  ]
  return subtitles[index] ?? ''
}
