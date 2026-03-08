import { Link } from 'react-router-dom'
import { ArticleLayout } from '../components/layout/ArticleLayout'
import { VoteButtons } from '../components/VoteButtons'
import { animations, asyncioSections } from '../content/asyncio'

export function AsyncioConcurrency() {
  return (
    <ArticleLayout
      title="Python Asyncio: Concurrency Made Simple"
      description="Step-by-step interactive animations showing how async/await, the event loop, and task scheduling actually work under the hood."
    >
      {/* Conceptual Introduction */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">What Is Asyncio?</h2>
        <p className="leading-relaxed text-muted">
          At its core, asyncio is a <strong className="font-semibold text-text">single-threaded event loop</strong> that
          multiplexes I/O-bound work. Think of it as a restaurant with one waiter serving many tables: the waiter takes an
          order, sends it to the kitchen, and immediately moves to the next table instead of standing idle. When a dish
          is ready, the waiter picks it up and delivers it. No dish requires a dedicated waiter — the single waiter serves
          everyone by never blocking on any one task. That waiter is the event loop. The orders are coroutines. The kitchen
          is your I/O — network requests, database queries, file reads.
        </p>
        <p className="leading-relaxed text-muted">
          Python's asyncio evolved from generators. Before <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">async</code>/<code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">await</code> existed
          (PEP 492, Python 3.5), coroutines were generators decorated
          with <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">@asyncio.coroutine</code> that
          used <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">yield from</code> to suspend.
          The <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">await</code> keyword is, internally,
          syntactic sugar over that same yield-based suspension. Understanding this lineage — PEP 255 (generators) → PEP 342
          (send/throw) → PEP 380 (yield from) → PEP 3156 (asyncio) → PEP 492 (async/await) — turns asyncio from magic
          into a logical progression.
        </p>
        <p className="leading-relaxed text-muted">
          These 20 animations walk you through everything — from "why concurrency matters" to streaming, error handling,
          coordination, and production patterns — all using real-world LLM and multi-agent examples. Each animation is
          interactive: step through the code line by line and watch the event loop, tasks, and I/O operations in real time.
        </p>
      </section>

      {/* Cross-Series Bridge */}
      <section className="rounded-lg border border-brand/30 bg-brand/5 p-6">
        <h2 className="mb-3 text-lg font-bold text-text">Built on Generators</h2>
        <p className="leading-relaxed text-muted">
          This series builds on the concepts from{' '}
          <Link to="/articles/python-streaming" className="font-medium text-brand underline decoration-brand/30 hover:decoration-brand">
            Python Streaming: Generators In Depth
          </Link>. If <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">yield</code> doesn't
          feel intuitive yet, start there. Generators are the foundation — coroutines are generators that can receive
          values, and <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">await</code> is how modern
          Python suspends coroutines at I/O boundaries. The mental model is the same: pause, hand control back, resume later.
        </p>
      </section>

      {/* Honest Trade-offs */}
      <section className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6">
        <h2 className="mb-3 text-lg font-bold text-text">The Honest Take</h2>
        <p className="leading-relaxed text-muted">
          Asyncio is powerful but has real trade-offs. The <strong className="font-semibold text-text">function coloring problem</strong> means
          you cannot call an <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">async</code> function
          from synchronous code without <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">asyncio.run()</code> or <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">run_coroutine_threadsafe()</code> —
          this splits your codebase into two worlds. Stack traces in async code are harder to read. Most third-party libraries
          need async-specific drivers (<code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">asyncpg</code> instead
          of <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">psycopg2</code>, <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">httpx</code> instead
          of <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">requests</code>). Debugging is
          harder — <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">RuntimeError: This event loop is already running</code> is
          the most common asyncio error, and it's confusing the first time you hit it. We cover both the patterns and their
          limitations throughout these animations.
        </p>
      </section>

      {asyncioSections.map((section, sectionIndex) => (
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
              const anim = animations[animIndex]
              return (
                <li key={anim.id}>
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:border-brand/50 hover:bg-surface-2">
                    <Link
                      to={`/articles/python-asyncio/${animIndex + 1}`}
                      className="flex min-w-0 flex-1 items-start gap-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-muted">
                        {animIndex + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-text">{anim.title}</h3>
                        <p className="mt-0.5 text-sm text-muted">{getSubtitle(animIndex)}</p>
                      </div>
                    </Link>
                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      <VoteButtons animationId={`python-asyncio/${animIndex + 1}`} compact />
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      ))}

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

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">In Production</h2>
        <p className="leading-relaxed text-muted">
          Asyncio patterns are the backbone of modern Python services. Here's where you'll encounter them in production codebases:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface-2 p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">LLM & AI Frameworks</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="https://github.com/openai/openai-python/blob/main/src/openai/_streaming.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>OpenAI SDK</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">AsyncStream.__aiter__</code> yields chunks via async SSE parsing</li>
              <li><a href="https://github.com/anthropics/anthropic-sdk-python/blob/main/src/anthropic/lib/streaming/_messages.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>Anthropic SDK</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">AsyncMessageStream</code> async generator for token events</li>
              <li><a href="https://github.com/langchain-ai/langchain/blob/master/libs/core/langchain_core/runnables/base.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>LangChain</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">Runnable.astream()</code> returns <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">AsyncIterator[Output]</code></li>
              <li><a href="https://github.com/crewAIInc/crewAI/blob/main/lib/crewai/src/crewai/crew.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>CrewAI</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">async_execution</code> orchestrates agents with asyncio tasks</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">Web Frameworks</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="https://github.com/fastapi/fastapi/blob/master/fastapi/routing.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>FastAPI</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">async def</code> endpoints run directly on the asyncio event loop</li>
              <li><a href="https://github.com/encode/starlette/blob/master/starlette/routing.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>Starlette</strong></a> — ASGI routing, middleware, and WebSocket handlers via <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">async def</code></li>
              <li><a href="https://github.com/aio-libs/aiohttp/blob/master/aiohttp/client.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>aiohttp</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">ClientSession</code> async context manager for HTTP requests</li>
              <li><a href="https://github.com/django/django/blob/main/django/core/handlers/asgi.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>Django</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">ASGIHandler</code> runs async views on the event loop</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">Data & Infrastructure</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="https://github.com/MagicStack/asyncpg/blob/master/asyncpg/connection.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>asyncpg</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">Connection.fetch()</code> async queries with prepared statement caching</li>
              <li><a href="https://github.com/aio-libs/aiokafka/blob/master/aiokafka/consumer/consumer.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>aiokafka</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">AIOKafkaConsumer.__aiter__</code> for async message consumption</li>
              <li><a href="https://github.com/redis/redis-py/blob/master/redis/asyncio/client.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>redis-py</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">redis.asyncio.Redis</code> async client with pub/sub support</li>
              <li><a href="https://github.com/encode/httpx/blob/master/httpx/_client.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>httpx</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">AsyncClient</code> with connection pooling and HTTP/2</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">Task Queues & Messaging</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="https://github.com/celery/celery/blob/main/celery/concurrency/asynpool.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>Celery</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">asynpool</code> async-aware worker pool for task execution</li>
              <li><a href="https://github.com/python-arq/arq/blob/main/arq/worker.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>arq</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">Worker._poll_iteration</code> async job polling via Redis</li>
              <li><a href="https://github.com/mosquito/aio-pika/blob/master/aio_pika/channel.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>aio-pika</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">Channel</code> async context manager for RabbitMQ messaging</li>
              <li><a href="https://github.com/grpc/grpc/blob/master/examples/python/route_guide/asyncio_route_guide_server.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>gRPC</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">async def</code> streaming RPCs with <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">yield</code> responses</li>
            </ul>
          </div>
        </div>
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
