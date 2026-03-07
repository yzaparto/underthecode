import { Link } from 'react-router-dom'
import { ArticleLayout } from '../components/layout/ArticleLayout'
import { animations } from '../content/asyncio'

export function AsyncioConcurrency() {
  return (
    <ArticleLayout
      title="Python Asyncio: Concurrency Made Simple"
      description="Step-by-step interactive animations showing how async/await, the event loop, and task scheduling actually work under the hood."
    >
      <section className="space-y-4">
        <p className="leading-relaxed text-muted">
          Python's <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">asyncio</code> module
          lets you write concurrent code using <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">async</code> and <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">await</code>.
          But what actually happens when you run async code? These 20 animations walk you through everything — from
          "why concurrency matters" to streaming, error handling, coordination, and production patterns — all using real-world LLM and multi-agent examples.
        </p>
        <p className="leading-relaxed text-muted">
          Each animation is interactive — step through the code line by line and watch the event loop,
          tasks, and I/O operations in real time. Start from the beginning or jump to any topic.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">Animations</h2>
        <ol className="space-y-3">
          {animations.map((anim, i) => (
            <li key={anim.id}>
              <Link
                to={`/articles/python-asyncio/${i + 1}`}
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
          <li>Synchronous LLM calls block everything — total time is the sum of all API waits.</li>
          <li>async/await alone doesn't give you concurrency. You need <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">create_task()</code>.</li>
          <li>The event loop switches between tasks at <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">await</code> points.</li>
          <li>Never use <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">time.sleep()</code> or synchronous HTTP in async code — it blocks the entire loop.</li>
          <li>Use <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">asyncio.to_thread()</code> for blocking SDKs and <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">run_in_executor()</code> for CPU work.</li>
          <li><code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">TaskGroup</code> (3.11+) is the modern way to run multiple tasks with proper error handling.</li>
          <li>Use <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">asyncio.timeout()</code> for LLM deadlines and <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">shield()</code> to protect critical saves.</li>
          <li><code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">Semaphore</code> rate-limits concurrent API calls to stay within provider limits.</li>
          <li><code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">async for</code> + async generators enable real-time LLM token streaming.</li>
          <li><code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">except*</code> catches specific errors from <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">ExceptionGroup</code> when agents fail.</li>
          <li>Use <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">Event</code>, <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">Lock</code>, and <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">Barrier</code> to coordinate multi-agent workflows.</li>
          <li>Always handle <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">CancelledError</code> in long-running workers for graceful shutdown.</li>
          <li>Use <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">asyncio.wait(FIRST_COMPLETED)</code> to race multiple LLMs and take the fastest response.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text">Quick Reference</h2>

        {/* Task coordination methods */}
        <div className="rounded-lg border border-border bg-surface-2 p-6">
          <h3 className="mb-4 text-lg font-bold text-text">Task Coordination Methods</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">gather()</code>
              <p className="mt-2 text-sm text-muted">Run all, get results in input order.</p>
              <p className="mt-1 text-xs text-muted">Best for: fan-out calls where you need all results.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">as_completed()</code>
              <p className="mt-2 text-sm text-muted">Process results as they finish (completion order).</p>
              <p className="mt-1 text-xs text-muted">Best for: progress indicators, streaming partial results.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">wait(FIRST_COMPLETED)</code>
              <p className="mt-2 text-sm text-muted">Return when ANY task finishes.</p>
              <p className="mt-1 text-xs text-muted">Best for: racing multiple models, fastest-wins.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">wait(ALL_COMPLETED)</code>
              <p className="mt-2 text-sm text-muted">Return when ALL tasks finish, gives done+pending sets.</p>
              <p className="mt-1 text-xs text-muted">Best for: fine-grained control with timeout.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">TaskGroup</code>
              <p className="mt-2 text-sm text-muted">Structured concurrency, auto-cancel on failure.</p>
              <p className="mt-1 text-xs text-muted">Best for: tasks that should succeed or fail together (Python 3.11+).</p>
            </div>
          </div>
        </div>
      </section>
    </ArticleLayout>
  )
}

function getSubtitle(index: number): string {
  const subtitles = [
    'Why concurrency matters — what happens when LLM calls block.',
    'Async/await doesn\'t automatically mean concurrent.',
    'create_task() unlocks real concurrency for LLM calls.',
    'Await order vs task completion order.',
    'The #1 asyncio mistake: blocking the event loop.',
    'Escape hatches: threads for blocking SDKs, processes for CPU.',
    'gather(), TaskGroup, and which pattern to choose.',
    'Cancel slow LLM calls and protect critical saves with shield().',
    'Set deadlines on LLM calls with timeout() and wait_for().',
    'Process multi-agent responses as they arrive, fastest first.',
    'Decouple user messages from agent processing with async queues.',
    'Rate-limit concurrent API calls with Semaphore.',
    'Stream LLM tokens in real time with async generators.',
    'Handle multi-agent failures with ExceptionGroup and except*.',
    'Coordinate agents with asyncio.Event — signal when ready.',
    'Protect shared state from interleaving with asyncio.Lock.',
    'Cancel workers cleanly and save state on shutdown.',
    'Retry failed API calls with exponential backoff.',
    'Synchronize agent phases with asyncio.Barrier.',
    'Race pattern — fastest LLM wins with asyncio.wait(FIRST_COMPLETED).',
  ]
  return subtitles[index] ?? ''
}
