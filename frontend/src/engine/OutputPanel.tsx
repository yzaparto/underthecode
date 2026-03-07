import type { OutputLine } from './types'

interface Props {
  lines: OutputLine[]
}

export function OutputPanel({ lines }: Props) {
  return (
    <pre className="mt-2 h-40 overflow-auto rounded-lg bg-gray-950 p-4 text-xs leading-relaxed">
      <code>
        <span className="text-gray-500">Output:</span>
        {'\n'}
        {lines.map((line) => (
          <span key={line.id} className="text-green-400">
            {line.time != null && (
              <span className="text-gray-500">[{line.time}] </span>
            )}
            {line.text}
            {'\n'}
          </span>
        ))}
        {lines.length === 0 && <span className="text-gray-600">{'\u00A0\n'}</span>}
      </code>
    </pre>
  )
}
