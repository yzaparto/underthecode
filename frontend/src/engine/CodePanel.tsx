import type { AnimationState } from './types'
import { theme } from './theme'

interface Props {
  sourceCode: string
  highlights: AnimationState['codeHighlights']
}

export function CodePanel({ sourceCode, highlights }: Props) {
  const lines = sourceCode.split('\n')
  const highlightMap = new Map(highlights.map((h) => [h.lineId, h.type]))

  return (
    <pre className="overflow-x-auto rounded-lg bg-gray-950 p-4 text-xs leading-relaxed">
      <code>
        {lines.map((line, i) => {
          const lineId = `line-${i}`
          const type = highlightMap.get(lineId)
          let className = theme.codeHighlight.default
          if (type === 'active') className = theme.codeHighlight.active
          else if (type === 'inactive') className = theme.codeHighlight.inactive
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
