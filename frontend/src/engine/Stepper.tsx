import type { Phase } from './types'
import { Prose } from '../components/InlineCode'

interface Props {
  currentStep: number
  totalSteps: number
  currentPhase: Phase | undefined
  onNext: () => void
  onPrev: () => void
}

export function Stepper({ currentStep, totalSteps, currentPhase, onNext, onPrev }: Props) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <div className="space-y-3">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-brand transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={currentStep === 0}
          className="rounded-md bg-surface-2 px-3 py-1.5 text-sm text-text transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← Back
        </button>

        <span className="text-xs text-muted">
          Step {currentStep} / {totalSteps}
          {currentPhase && (
            <span className="ml-2 text-muted">— {currentPhase.title}</span>
          )}
        </span>

        <button
          onClick={onNext}
          disabled={currentStep === totalSteps}
          className="rounded-md bg-surface-2 px-3 py-1.5 text-sm text-text transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next →
        </button>
      </div>

      {currentPhase && (
        <div className="rounded-lg border-l-4 border-brand bg-surface-2 px-5 py-4">
          <p className="text-sm font-medium text-brand">{currentPhase.title}</p>
          <ExplanationBody text={currentPhase.explanation} />
        </div>
      )}
    </div>
  )
}

function ExplanationBody({ text }: { text: string }) {
  const lines = text.split('\n').filter((l) => l.trim())
  const bullets = lines.filter((l) => l.startsWith('• '))
  const paragraphs = lines.filter((l) => !l.startsWith('• '))

  return (
    <div className="mt-2 space-y-2 text-sm leading-relaxed text-text">
      {paragraphs.map((p, i) => (
        <p key={`p-${i}`}><Prose text={p} /></p>
      ))}
      {bullets.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-muted">
          {bullets.map((b, i) => (
            <li key={`b-${i}`}><Prose text={b.slice(2)} /></li>
          ))}
        </ul>
      )}
    </div>
  )
}
