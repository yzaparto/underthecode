import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AnimationDefinition, AnimationState, Phase } from './types'
import { precomputeSnapshots, findPhase } from './snapshots'

export interface StepperState {
  state: AnimationState
  currentStep: number
  totalSteps: number
  currentPhase: Phase | undefined
  next: () => void
  prev: () => void
  goTo: (n: number) => void
}

export function useStepper(definition: AnimationDefinition): StepperState {
  const snapshots = useMemo(() => precomputeSnapshots(definition), [definition])
  const snapshotsRef = useRef(snapshots)
  snapshotsRef.current = snapshots

  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = snapshots.length - 1

  useEffect(() => {
    setCurrentStep(0)
  }, [definition])

  const next = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, snapshotsRef.current.length - 1))
  }, [])

  const prev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  const goTo = useCallback(
    (n: number) => setCurrentStep(Math.max(0, Math.min(n, snapshotsRef.current.length - 1))),
    [],
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  return {
    state: snapshots[currentStep],
    currentStep,
    totalSteps,
    currentPhase: currentStep > 0 ? findPhase(definition.phases, currentStep - 1) : undefined,
    next,
    prev,
    goTo,
  }
}
