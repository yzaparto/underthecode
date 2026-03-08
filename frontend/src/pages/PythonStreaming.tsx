import { Link } from 'react-router-dom'
import { ArticleLayout } from '../components/layout/ArticleLayout'
import { VoteButtons } from '../components/VoteButtons'
import { streamingAnimations, streamingSections } from '../content/streaming'

export function PythonStreaming() {
  return (
    <ArticleLayout
      title="Python Streaming: Generators In Depth"
      description="Step-by-step interactive animations showing how generators, iterators, and streaming work under the hood in Python."
    >
      {/* Conceptual Introduction */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">What Are Generators?</h2>
        <p className="leading-relaxed text-muted">
          A generator is a function that can <strong className="font-semibold text-text">pause and resume</strong>.
          When a normal function hits <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">return</code>,
          its stack frame is destroyed — all local variables are gone. But when a generator
          hits <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">yield</code>, the stack frame is
          frozen in place. Every local variable, every loop counter, the exact instruction pointer — all preserved. When
          you call <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">next()</code>, execution
          resumes from exactly where it paused. This makes generators fundamentally different from regular functions:
          they maintain state across calls without any external storage.
        </p>
        <p className="leading-relaxed text-muted">
          Generators first appeared in Python 2.2 via PEP 255, inspired by CLU's iterators and Icon's generators. They
          were initially just a convenient way to write iterators. But PEP 342 (Python 2.5)
          added <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">send()</code>, <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">throw()</code>,
          and <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">close()</code>, turning generators
          into full coroutines — functions that can both produce and consume values. PEP 380
          added <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">yield from</code> for generator
          delegation. This machinery became the foundation of Python's asyncio: <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">await</code> is,
          at the C level, the same mechanism as <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">yield from</code>.
        </p>
        <p className="leading-relaxed text-muted">
          This guide takes you from complete beginner to expert through 20 interactive animations. Start with the basics,
          understand the mechanics, master the tools, build pipelines, and learn expert patterns. Each animation lets you
          step through code line by line and watch exactly what happens.
        </p>
      </section>

      {/* Cross-Series Bridge */}
      <section className="rounded-lg border border-brand/30 bg-brand/5 p-6">
        <h2 className="mb-3 text-lg font-bold text-text">The Foundation for Asyncio</h2>
        <p className="leading-relaxed text-muted">
          This series is the prerequisite for{' '}
          <Link to="/articles/python-asyncio" className="font-medium text-brand underline decoration-brand/30 hover:decoration-brand">
            Python Asyncio: Concurrency Made Simple
          </Link>. The <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">yield</code> → <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">send()</code> → <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">yield from</code> → <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">await</code> progression
          is one continuous story. Animation 20 of this series (Async Generators) is the direct bridge to asyncio's event
          loop and <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">async for</code> patterns.
          Master generators here, and asyncio will feel like a natural extension rather than a new concept.
        </p>
      </section>

      {/* Honest Trade-offs */}
      <section className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6">
        <h2 className="mb-3 text-lg font-bold text-text">The Honest Take</h2>
        <p className="leading-relaxed text-muted">
          Generators are not always the right tool. They are <strong className="font-semibold text-text">single-use</strong> — once
          exhausted, you must recreate them. They don't support random access or <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">len()</code>.
          Debugging is harder because the stack frame is suspended between calls. For small datasets that fit comfortably in
          memory, a list is simpler, faster (no per-item function call overhead), and easier to debug. Generator pipelines
          can also obscure control flow — a chain of 5 generators is elegant but can be difficult to trace when something goes
          wrong. We cover both the power and the pitfalls throughout these animations so you know when to reach for generators
          and when a list comprehension is the better choice.
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
                  <div className="flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:border-brand/50 hover:bg-surface-2">
                    <Link
                      to={`/articles/python-streaming/${animIndex + 1}`}
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
                      <VoteButtons animationId={`python-streaming/${animIndex + 1}`} compact />
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

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">In Production</h2>
        <p className="leading-relaxed text-muted">
          Generator patterns power some of the most widely-used Python libraries. Here's where you'll encounter them in real-world codebases:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface-2 p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">LLM & AI SDKs</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="https://github.com/openai/openai-python/blob/main/src/openai/_streaming.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>OpenAI SDK</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">Stream.__iter__</code> yields <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">ChatCompletionChunk</code> via SSE parsing</li>
              <li><a href="https://github.com/anthropics/anthropic-sdk-python/blob/main/src/anthropic/lib/streaming/_messages.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>Anthropic SDK</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">MessageStream.__stream__</code> generator yields typed stream events</li>
              <li><a href="https://github.com/huggingface/datasets/blob/main/src/datasets/iterable_dataset.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>Hugging Face Datasets</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">IterableDataset</code> wraps <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">ExamplesIterable</code> generators for streaming</li>
              <li><a href="https://github.com/langchain-ai/langchain/blob/master/libs/core/langchain_core/runnables/base.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>LangChain</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">Runnable.stream()</code> returns <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">Iterator[Output]</code> via generator</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">Data & Analytics</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="https://github.com/apache/arrow/blob/main/python/pyarrow/ipc.pxi" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>Apache Arrow</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">RecordBatchReader.__next__</code> calls <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">read_next_batch()</code> per iteration</li>
              <li><a href="https://github.com/pandas-dev/pandas/blob/main/pandas/io/parsers/readers.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>Pandas</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">TextFileReader.__next__</code> yields chunk-sized DataFrames from CSV</li>
              <li><a href="https://github.com/pola-rs/polars/blob/main/py-polars/src/polars/lazyframe/frame.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>Polars</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">LazyFrame.collect(streaming=True)</code> processes in chunks</li>
              <li><a href="https://github.com/duckdb/duckdb-python/blob/main/src/duckdb_py/pyresult.cpp" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>DuckDB</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">fetchone()</code> / <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">fetchmany()</code> use streaming result construction</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">Web & APIs</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="https://github.com/encode/starlette/blob/master/starlette/responses.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>FastAPI / Starlette</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">StreamingResponse.body_iterator</code> consumes async generators</li>
              <li><a href="https://github.com/grpc/grpc/blob/master/examples/python/route_guide/route_guide_server.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>gRPC</strong></a> — server-streaming RPCs <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">yield</code> response messages to clients</li>
              <li><a href="https://github.com/sqlalchemy/sqlalchemy/blob/main/lib/sqlalchemy/engine/result.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>SQLAlchemy</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">Result.__iter__</code> with <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">yield_per()</code> streams rows in batches</li>
              <li><a href="https://github.com/boto/botocore/blob/main/botocore/response.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>boto3</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">StreamingBody.__iter__</code> yields chunks from S3 objects</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">Infrastructure & Tooling</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="https://github.com/dpkp/kafka-python/blob/master/kafka/consumer/group.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>kafka-python</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">KafkaConsumer.__next__</code> pulls messages on demand</li>
              <li><a href="https://github.com/pytest-dev/pytest/blob/main/src/_pytest/fixtures.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>pytest</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">call_fixture_func</code> detects generators for yield-based teardown</li>
              <li><a href="https://github.com/python/cpython/blob/main/Lib/contextlib.py" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>contextlib</strong></a> — <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">_GeneratorContextManager</code> wraps generator <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">yield</code> as enter/exit</li>
              <li><a href="https://github.com/python/cpython/blob/main/Modules/itertoolsmodule.c" target="_blank" rel="noopener noreferrer" className="text-text underline decoration-border hover:decoration-brand"><strong>itertools</strong></a> — C-level <code className="rounded bg-surface px-1 py-0.5 text-xs text-brand">iternext</code> slots implement lazy iterator protocol</li>
            </ul>
          </div>
        </div>
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
