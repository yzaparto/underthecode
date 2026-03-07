import type { ReactNode } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { getTheme } from '../engine/theme'

export function Prose({ text }: { text: string }): ReactNode {
  const { theme } = useTheme()
  const t = getTheme(theme)
  const parts = text.split(/(`[^`]+`)/)
  return parts.map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={i} className={t.inlineCode}>{part.slice(1, -1)}</code>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}
