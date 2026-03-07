import { Link } from 'react-router-dom'
import { ArticleLayout } from '../components/layout/ArticleLayout'
import { streamingAnimations } from '../content/streaming'

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
          when you yield? How does Python pause and resume execution? These 20 animations walk you through everything —
          from basic iteration to async streaming, memory efficiency, and real-world LLM token streaming patterns.
        </p>
        <p className="leading-relaxed text-muted">
          Each animation is interactive — step through the code line by line and watch the generator state,
          memory usage, and data flow in real time. Start from the beginning or jump to any topic.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Animations</h2>
        <ol className="space-y-3">
          {streamingAnimations.map((anim, i) => (
            <li key={anim.id}>
              <Link
                to={`/articles/python-streaming/${i + 1}`}
                className="flex items-start gap-4 rounded-lg border border-border p-5 transition-colors hover:border-border hover:bg-surface-2"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-text">{anim.title}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {getSubtitle(i)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-surface-2 p-6">
        <h2 className="text-xl font-bold text-text">Key Takeaways</h2>
        <ul className="list-disc space-y-2 pl-6 text-muted">
          <li>Lists store values; generators store recipes — memory usage is O(N) vs O(1).</li>
          <li><code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">yield</code> pauses execution and saves state; <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">next()</code> resumes it.</li>
          <li>Generator states: GEN_CREATED → GEN_RUNNING ↔ GEN_SUSPENDED → GEN_CLOSED.</li>
          <li>Lazy evaluation defers computation until values are pulled — perfect for large data.</li>
          <li>Generator expressions <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">(x for x in items)</code> are single-use and memory-efficient.</li>
          <li><code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">send()</code> enables two-way communication; <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">throw()</code> and <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">close()</code> control termination.</li>
          <li><code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">yield from</code> delegates to sub-generators with full protocol support.</li>
          <li>Chained generators create memory-efficient pipelines with no intermediate lists.</li>
          <li><code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">@contextmanager</code> turns generators into context managers for resource management.</li>
          <li><code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">itertools</code> provides battle-tested lazy iterator utilities.</li>
          <li>Pull-based generators provide automatic backpressure — consumers control the pace.</li>
          <li>Async generators (<code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">async def</code> + <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">yield</code>) enable streaming from async sources.</li>
          <li>LLM token streaming uses async generators for real-time response display.</li>
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
              <p className="mt-1 text-xs text-muted">Resumes on next() or send().</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">next(gen)</code>
              <p className="mt-2 text-sm text-muted">Resume and get next value.</p>
              <p className="mt-1 text-xs text-muted">Raises StopIteration when exhausted.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">gen.send(value)</code>
              <p className="mt-2 text-sm text-muted">Resume with injected value.</p>
              <p className="mt-1 text-xs text-muted">Value becomes yield result inside generator.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">gen.throw(exc)</code>
              <p className="mt-2 text-sm text-muted">Inject exception at current yield.</p>
              <p className="mt-1 text-xs text-muted">Generator can catch and recover.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">gen.close()</code>
              <p className="mt-2 text-sm text-muted">Terminate generator cleanly.</p>
              <p className="mt-1 text-xs text-muted">Triggers finally blocks for cleanup.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">yield from iterable</code>
              <p className="mt-2 text-sm text-muted">Delegate to sub-generator.</p>
              <p className="mt-1 text-xs text-muted">Forwards send/throw/close, captures return.</p>
            </div>
          </div>
        </div>
      </section>
    </ArticleLayout>
  )
}

function getSubtitle(index: number): string {
  const subtitles = [
    'Why iterators beat lists for large data — memory and early termination.',
    'How yield pauses execution and saves state between calls.',
    'The four generator states: created, running, suspended, closed.',
    'Deferred computation — work happens only when values are pulled.',
    'O(1) vs O(N) memory — generators hold recipes, not results.',
    'The __iter__ and __next__ protocol that makes iteration work.',
    'Return exits forever; yield pauses and can resume.',
    'Compact (x for x in items) syntax for lazy sequences.',
    'Two-way communication — inject values into running generators.',
    'Error injection and cleanup with throw() and close().',
    'Delegate to sub-generators with full protocol support.',
    'Build memory-efficient pipelines by chaining generators.',
    'Turn generators into context managers for resource management.',
    'Process files larger than RAM, line by line.',
    'Standard library tools for lazy iteration: islice, chain, takewhile.',
    'Pull-based flow control — consumers naturally throttle producers.',
    'Trade latency for throughput with batch collection.',
    'Graceful degradation — handle errors without crashing the stream.',
    'async def + yield for streaming from async sources.',
    'LLM token streaming — the pattern behind ChatGPT-style responses.',
  ]
  return subtitles[index] ?? ''
}
