import type { AnimationDefinition } from './types'
import { useStepper } from './useStepper'
import { Column } from './Column'
import { Stepper } from './Stepper'

interface Props {
  definition: AnimationDefinition
}

export function AnimationViewer({ definition }: Props) {
  const { state, currentStep, totalSteps, currentPhase, next, prev } =
    useStepper(definition)

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950 p-4">
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

      <div className="mt-4">
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
