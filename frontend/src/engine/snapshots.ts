import type { AnimationDefinition, AnimationState, Phase } from './types'
import { applyActions } from './interpreter'

export function precomputeSnapshots(def: AnimationDefinition): AnimationState[] {
  const snaps: AnimationState[] = [def.initialState]
  for (const step of def.steps) {
    snaps.push(applyActions(snaps[snaps.length - 1], step))
  }
  return snaps
}

export function findPhase(phases: Phase[], step: number): Phase | undefined {
  return phases.find((p) => step >= p.startStep && step <= p.endStep)
}
