import { AnimatePresence } from 'framer-motion'
import type { AnimationState, ColumnDefinition, StatusDefinition } from './types'
import { AnimatedCard } from './AnimatedCard'
import { CodePanel } from './CodePanel'
import { OutputPanel } from './OutputPanel'

interface Props {
  column: ColumnDefinition
  state: AnimationState
  statuses: StatusDefinition[]
  sourceCode?: string
}

export function Column({ column, state, statuses, sourceCode }: Props) {
  const cards = state.cards.filter((c) => c.columnId === column.id)

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-lg bg-surface-2 p-4">
      <h2 className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-muted">
        {column.title}
      </h2>
      <hr className="mb-4 border-border" />

      {column.hasCodePanel && sourceCode && (
        <CodePanel sourceCode={sourceCode} highlights={state.codeHighlights} />
      )}
      {column.hasOutputPanel && <OutputPanel lines={state.outputLines} />}

      <div className="mt-2 min-h-[120px] flex-1">
        <AnimatePresence mode="popLayout">
          {cards.map((card) => (
            <AnimatedCard key={card.id} card={card} statuses={statuses} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
