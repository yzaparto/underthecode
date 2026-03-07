import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `def expensive_computation(n):
    """Simulates a costly operation."""
    print(f"Computing result for {n}...")
    return n * n


def eager_approach():
    """Compute ALL results upfront."""
    results = [expensive_computation(i) for i in range(5)]
    return results


def lazy_approach():
    """Compute results only when needed."""
    for i in range(5):
        yield expensive_computation(i)


# Eager: all 5 computations happen immediately
print("=== Eager ===")
all_results = eager_approach()

# Lazy: computations happen on-demand
print("=== Lazy ===")
gen = lazy_approach()
print(f"First: {next(gen)}")
print("Pausing...")
print(f"Second: {next(gen)}")`

const lazyEvaluation: AnimationDefinition = {
  id: 'streaming-lazy-evaluation',
  title: 'Lazy Evaluation',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define Functions',
      explanation: '• `expensive_computation()` simulates a costly operation\n• `eager_approach()` uses a list comprehension — all work happens upfront\n• `lazy_approach()` uses `yield` — work happens only when values are pulled',
      startStep: 0,
      endStep: 2,
    },
    {
      title: 'Eager Execution',
      explanation: '• Calling `eager_approach()` computes ALL 5 results immediately\n• Watch the output — all "Computing..." messages appear before returning\n• The caller must wait for all computations before getting any result',
      startStep: 3,
      endStep: 8,
    },
    {
      title: 'Lazy Execution Setup',
      explanation: '• Calling `lazy_approach()` creates a generator instantly\n• Zero computations have happened yet\n• The caller has a generator object but no actual results',
      startStep: 9,
      endStep: 10,
    },
    {
      title: 'First Value on Demand',
      explanation: '• `next(gen)` triggers the FIRST computation only\n• "Computing result for 0..." appears, then the value is yielded\n• The generator pauses, other work can happen',
      startStep: 11,
      endStep: 14,
    },
    {
      title: 'Second Value on Demand',
      explanation: '• We print "Pausing..." — arbitrary code can run between values\n• Only when we call `next()` again does the second computation happen\n• Each value is computed just-in-time',
      startStep: 15,
      endStep: 18,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-6' }],
    [{ action: 'highlightLine', lineId: 'line-12' }],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addOutput', id: 'o1', text: '=== Eager ===', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'addCard', columnId: 'code', id: 'eager', title: 'eager_approach()', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'addOutput', id: 'o2', text: 'Computing result for 0...', time: '0.1s' },
      { action: 'addCard', columnId: 'memory', id: 'list', title: 'results = [0]', statusId: 'buffered' },
    ],
    [
      { action: 'addOutput', id: 'o3', text: 'Computing result for 1...', time: '0.2s' },
      { action: 'addOutput', id: 'o4', text: 'Computing result for 2...', time: '0.3s' },
      { action: 'addOutput', id: 'o5', text: 'Computing result for 3...', time: '0.4s' },
      { action: 'addOutput', id: 'o6', text: 'Computing result for 4...', time: '0.5s' },
    ],
    [
      { action: 'setStatus', cardId: 'eager', statusId: 'complete' },
      { action: 'removeCard', cardId: 'eager' },
    ],
    [
      { action: 'addOutput', id: 'o7', text: 'All 5 results computed upfront', time: '0.5s' },
      { action: 'removeCard', cardId: 'list' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'addOutput', id: 'o8', text: '=== Lazy ===', time: '0.6s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'addCard', columnId: 'generator', id: 'gen', title: 'lazy_approach()', statusId: 'ready' },
      { action: 'addOutput', id: 'o9', text: 'Generator created (0 computations)', time: '0.6s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addOutput', id: 'o10', text: 'Computing result for 0...', time: '0.7s' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'addCard', columnId: 'memory', id: 'val1', title: 'yielded: 0', statusId: 'yielding' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'removeCard', cardId: 'val1' },
      { action: 'addOutput', id: 'o11', text: 'First: 0', time: '0.7s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-25' },
      { action: 'addOutput', id: 'o12', text: 'Pausing...', time: '0.8s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-26' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addOutput', id: 'o13', text: 'Computing result for 1...', time: '0.9s' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-26' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o14', text: 'Second: 1', time: '0.9s' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default lazyEvaluation
