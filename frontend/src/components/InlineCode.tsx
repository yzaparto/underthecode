import type { ReactNode } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { getTheme } from '../engine/theme'

export function Prose({ text }: { text: string }): ReactNode {
  const { theme } = useTheme()
  const t = getTheme(theme)
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/)
  return tokens.map((tok, i) => {
    if (tok.startsWith('`') && tok.endsWith('`')) {
      return <code key={i} className={t.inlineCode}>{tok.slice(1, -1)}</code>
    }
    if (tok.startsWith('**') && tok.endsWith('**')) {
      return <strong key={i} className="font-semibold text-text">{tok.slice(2, -2)}</strong>
    }
    return <span key={i}>{tok}</span>
  })
}
