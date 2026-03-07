import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="border-b border-gray-800 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight text-white">
          under<span className="text-blue-400">the</span>code
        </Link>
        <nav className="flex gap-6 text-sm text-gray-400">
          <Link to="/" className="hover:text-white transition-colors">Articles</Link>
        </nav>
      </div>
    </header>
  )
}
