import { Link } from 'react-router-dom'

export function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight text-white">
        under<span className="text-blue-400">the</span>code
      </h1>
      <p className="mt-3 text-lg text-gray-400">
        Hard concepts made simple through text and animations.
      </p>
      <hr className="my-8 border-gray-800" />
      <ul className="space-y-4">
        <li>
          <Link
            to="/articles/python-asyncio"
            className="group block overflow-hidden rounded-lg border border-gray-800 transition-colors hover:border-gray-600 hover:bg-gray-900"
          >
            <div className="p-5">
              <span className="text-sm font-medium text-blue-400">Python</span>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Python Asyncio: Concurrency Made Simple
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Step-by-step interactive animations showing how async/await, the event loop,
                and task scheduling actually work under the hood.
              </p>
            </div>
          </Link>
        </li>
      </ul>
    </main>
  )
}
