import type { ReactNode } from 'react'
import { theme } from '../engine/theme'

export function Prose({ text }: { text: string }): ReactNode {
  const parts = text.split(/(`[^`]+`)/)
  return parts.map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={i} className={theme.inlineCode}>{part.slice(1, -1)}</code>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}
