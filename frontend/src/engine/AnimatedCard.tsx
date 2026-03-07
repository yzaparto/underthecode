import { motion } from 'framer-motion'
import type { CardState, StatusDefinition } from './types'
import { StatusBadge } from './StatusBadge'
import { theme } from './theme'

interface Props {
  card: CardState
  statuses: StatusDefinition[]
}

export function AnimatedCard({ card, statuses }: Props) {
  const status = statuses.find((s) => s.id === card.statusId)
  const headerColor = status?.headerColor ?? theme.card.fallbackHeaderColor
  const opacity = status?.opacity ?? 1

  return (
    <motion.div
      layout
      initial={{ x: theme.card.slideOffset, opacity: 0 }}
      animate={{ x: 0, opacity }}
      exit={{ x: theme.card.slideOffset, opacity: 0 }}
      transition={{ duration: theme.card.animationDuration, ease: theme.card.animationEase }}
      className="mb-3 w-full overflow-hidden rounded-lg border border-gray-700"
      style={{
        boxShadow: card.glow ? theme.card.glowShadow : 'none',
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ backgroundColor: headerColor }}
      >
        <h3 className="text-sm font-semibold text-white">{card.title}</h3>
        <div className="flex items-center gap-2">
          {card.hasSpinner && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-dashed border-gray-300" />
          )}
          {status && <StatusBadge status={status} />}
        </div>
      </div>
      {card.code && (
        <div className="bg-gray-950 p-3">
          <pre className="text-xs leading-relaxed">
            <code>
              {card.code.lines.map((line, i) => (
                <div
                  key={i}
                  className={
                    card.code?.highlightLine === String(i)
                      ? theme.codeHighlight.active
                      : theme.codeHighlight.default
                  }
                >
                  {line}
                </div>
              ))}
            </code>
          </pre>
        </div>
      )}
    </motion.div>
  )
}
