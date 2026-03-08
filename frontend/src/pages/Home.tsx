import { Link } from 'react-router-dom'

export function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight text-text">
        <span className="text-brand">_</span>underthecode
      </h1>
      <p className="mt-3 text-lg text-muted">
        Hard concepts made simple through text and animations.
      </p>
      <hr className="my-8 border-border" />
      <ul className="space-y-4">
        <li>
          <Link
            to="/articles/python-asyncio"
            className="group block overflow-hidden rounded-lg border border-border transition-colors hover:border-border hover:bg-surface-2"
          >
            <div className="p-5">
              <span className="text-sm font-medium text-brand">Python</span>
              <h2 className="mt-1 text-xl font-semibold text-text">
                Python Asyncio: Concurrency Made Simple
              </h2>
              <p className="mt-2 text-sm text-muted">
                Step-by-step interactive animations showing how async/await, the event loop,
                and task scheduling actually work under the hood.
              </p>
            </div>
          </Link>
        </li>
        <li>
          <Link
            to="/articles/python-streaming"
            className="group block overflow-hidden rounded-lg border border-border transition-colors hover:border-border hover:bg-surface-2"
          >
            <div className="p-5">
              <span className="text-sm font-medium text-brand">Python</span>
              <h2 className="mt-1 text-xl font-semibold text-text">
                Python Streaming: Generators In Depth
              </h2>
              <p className="mt-2 text-sm text-muted">
                Step-by-step interactive animations showing how generators, iterators,
                and streaming work under the hood in Python.
              </p>
            </div>
          </Link>
        </li>
      </ul>
    </main>
  )
}
