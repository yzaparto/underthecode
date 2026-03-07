import type { ReactNode } from 'react'

interface Props {
  title: string
  description: string
  children: ReactNode
}

export function ArticleLayout({ title, description, children }: Props) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-white">{title}</h1>
      <p className="mt-3 text-lg text-gray-400">{description}</p>
      <hr className="my-8 border-gray-800" />
      <div className="space-y-16">{children}</div>
    </main>
  )
}
