import type { AnimationDefinition } from './types'
import { useStepper } from './useStepper'
import { Column } from './Column'
import { Stepper } from './Stepper'

interface Props {
  definition: AnimationDefinition
}

export function AnimationViewer({ definition }: Props) {
  const { state, currentStep, totalSteps, currentPhase, next, prev, handleArrowKey } =
    useStepper(definition)

  return (
    <div
      tabIndex={0}
      onClick={(e) => e.currentTarget.focus()}
      onKeyDown={(e) => handleArrowKey(e.key)}
      className="rounded-xl border border-border bg-surface p-4"
    >
      <div className="flex min-h-[480px] flex-col gap-3 md:flex-row">
        {definition.columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            state={state}
            statuses={definition.statuses}
            sourceCode={
              col.hasCodePanel ? definition.sourceCode : undefined
            }
          />
        ))}
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-10 mt-4 -mx-4 -mb-4 rounded-b-xl border-t border-border bg-surface px-4 py-3">
        <Stepper
          currentStep={currentStep}
          totalSteps={totalSteps}
          currentPhase={currentPhase}
          onNext={next}
          onPrev={prev}
        />
      </div>
    </div>
  )
}
