import type { OutputLine } from './types'

interface Props {
  lines: OutputLine[]
}

export function OutputPanel({ lines }: Props) {
  return (
    <pre className="mt-2 h-40 overflow-auto rounded-lg border border-border bg-bg p-4 text-xs leading-relaxed">
      <code>
        <span className="text-muted">Output:</span>
        {'\n'}
        {lines.map((line) => (
          <span key={line.id} className="text-green">
            {line.time != null && (
              <span className="text-muted">[{line.time}] </span>
            )}
            {line.text}
            {'\n'}
          </span>
        ))}
        {lines.length === 0 && <span className="text-muted">{'\u00A0\n'}</span>}
      </code>
    </pre>
  )
}
