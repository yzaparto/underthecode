import type { ReactNode } from 'react'

interface Props {
  title: string
  description: string
  children: ReactNode
}

export function ArticleLayout({ title, description, children }: Props) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-text">{title}</h1>
      <p className="mt-3 text-lg text-muted">{description}</p>
      <hr className="my-8 border-border" />
      <div className="space-y-16">{children}</div>
    </main>
  )
}
