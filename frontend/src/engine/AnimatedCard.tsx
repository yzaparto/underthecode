import { motion } from 'framer-motion'
import type { CardState, StatusDefinition } from './types'
import { StatusBadge } from './StatusBadge'
import { useTheme } from '../contexts/ThemeContext'
import { getTheme } from './theme'

interface Props {
  card: CardState
  statuses: StatusDefinition[]
}

export function AnimatedCard({ card, statuses }: Props) {
  const { theme } = useTheme()
  const t = getTheme(theme)
  const status = statuses.find((s) => s.id === card.statusId)
  const headerColor = status?.headerColor ?? t.card.fallbackHeaderColor
  const opacity = status?.opacity ?? 1

  return (
    <motion.div
      layout
      initial={{ x: t.card.slideOffset, opacity: 0 }}
      animate={{ x: 0, opacity }}
      exit={{ x: t.card.slideOffset, opacity: 0 }}
      transition={{ duration: t.card.animationDuration, ease: t.card.animationEase }}
      className="mb-3 w-full overflow-hidden rounded-lg border border-border"
      style={{
        boxShadow: card.glow ? t.card.glowShadow : 'none',
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ backgroundColor: headerColor }}
      >
        <h3 className="text-sm font-semibold text-white">{card.title}</h3>
        <div className="flex items-center gap-2">
          {card.hasSpinner && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-dashed border-border" />
          )}
          {status && <StatusBadge status={status} />}
        </div>
      </div>
      {card.code && (
        <div className="min-h-[4.5rem] rounded-b-lg border-t border-border bg-bg p-3">
          <pre className="text-xs leading-relaxed">
            <code>
              {card.code.lines.map((line, i) => {
                const isActive = card.code?.highlightLine !== undefined && card.code.highlightLine === String(i)
                return (
                  <div
                    key={i}
                    className={
                      isActive
                        ? t.codeHighlight.active
                        : t.codeHighlight.default
                    }
                  >
                    {line || '\u00A0'}
                  </div>
                )
              })}
            </code>
          </pre>
        </div>
      )}
    </motion.div>
  )
}
