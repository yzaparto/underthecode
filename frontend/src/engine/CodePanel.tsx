import type { AnimationState } from './types'
import { useTheme } from '../contexts/ThemeContext'
import { getTheme } from './theme'

interface Props {
  sourceCode: string
  highlights: AnimationState['codeHighlights']
}

export function CodePanel({ sourceCode, highlights }: Props) {
  const { theme } = useTheme()
  const t = getTheme(theme)
  const lines = sourceCode.split('\n')
  const highlightMap = new Map(highlights.map((h) => [h.lineId, h.type]))

  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-bg p-4 text-xs leading-relaxed">
      <code>
        {lines.map((line, i) => {
          const lineId = `line-${i}`
          const type = highlightMap.get(lineId)
          let className = t.codeHighlight.default
          if (type === 'active') className = t.codeHighlight.active
          else if (type === 'inactive') className = t.codeHighlight.inactive
          return (
            <div key={i} className={className}>
              {line || '\u00A0'}
            </div>
          )
        })}
      </code>
    </pre>
  )
}
