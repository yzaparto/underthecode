import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { mechanicsColumns, basicsStatuses } from './layouts'

const sourceCode = `def expensive_task(n):
    print(f"  Computing {n}... (slow!)")
    return n * 100


# EAGER: Compute ALL upfront
def eager_compute():
    return [expensive_task(i) for i in range(3)]


# LAZY: Compute only when needed
def lazy_compute():
    for i in range(3):
        yield expensive_task(i)


print("=== EAGER ===")
results = eager_compute()  # All computed NOW
print(f"Got list: {results}")

print("=== LAZY ===")
gen = lazy_compute()  # Nothing computed yet!
print("Generator ready")
print(f"First: {next(gen)}")  # Now computes 0
print(f"Second: {next(gen)}") # Now computes 1`

const lazyEvaluation: AnimationDefinition = {
  id: 'streaming-08-lazy',
  title: 'Lazy Evaluation',
  columns: mechanicsColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Eager vs Lazy',
      explanation: '• EAGER: compute all values upfront\n• LAZY: compute values only when requested\n• Same results, different timing!',
      startStep: 0,
      endStep: 2,
    },
    {
      title: 'Eager Execution',
      explanation: '• `eager_compute()` runs ALL expensive tasks immediately\n• Watch: all 3 computations happen before we get results\n• We wait for everything, even if we only need one!',
      startStep: 3,
      endStep: 7,
    },
    {
      title: 'Lazy Execution',
      explanation: '• `lazy_compute()` creates generator instantly — no work yet!\n• First `next()` computes first value\n• Second `next()` computes second value\n• Work happens on-demand!',
      startStep: 8,
      endStep: 17,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-0' },
      { action: 'addCard', columnId: 'state', id: 'task', title: '🐢 expensive_task()', statusId: 'waiting' },
      { action: 'addCard', columnId: 'output', id: 'info', title: 'Simulates slow computation', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'removeCard', cardId: 'info' },
      { action: 'addCard', columnId: 'output', id: 'eager', title: '📋 EAGER: list comprehension', statusId: 'waiting' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'removeCard', cardId: 'eager' },
      { action: 'addCard', columnId: 'output', id: 'lazy', title: '⚡ LAZY: generator with yield', statusId: 'waiting' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'removeCard', cardId: 'lazy' },
      { action: 'removeCard', cardId: 'task' },
      { action: 'addOutput', id: 'o1', text: '=== EAGER ===', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'addCard', columnId: 'state', id: 'eager-run', title: 'eager_compute()', statusId: 'running' },
      { action: 'setGlow', cardId: 'eager-run', glow: true },
    ],
    [
      { action: 'addOutput', id: 'o2', text: '  Computing 0... (slow!)', time: '0.0s' },
      { action: 'addCard', columnId: 'output', id: 'e1', title: '⏳ Computing 0...', statusId: 'running' },
    ],
    [
      { action: 'addOutput', id: 'o3', text: '  Computing 1... (slow!)', time: '0.0s' },
      { action: 'addOutput', id: 'o4', text: '  Computing 2... (slow!)', time: '0.0s' },
      { action: 'removeCard', cardId: 'e1' },
      { action: 'addCard', columnId: 'output', id: 'e2', title: '⚠️ ALL computed before return!', statusId: 'paused' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'setStatus', cardId: 'eager-run', statusId: 'done' },
      { action: 'setGlow', cardId: 'eager-run', glow: false },
      { action: 'addOutput', id: 'o5', text: 'Got list: [0, 100, 200]', time: '0.0s' },
      { action: 'removeCard', cardId: 'e2' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'removeCard', cardId: 'eager-run' },
      { action: 'addOutput', id: 'o6', text: '=== LAZY ===', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addCard', columnId: 'state', id: 'lazy-gen', title: 'lazy_compute()', statusId: 'created' },
    ],
    [
      { action: 'addCard', columnId: 'output', id: 'l1', title: '✨ Generator created instantly!', statusId: 'receiving' },
      { action: 'addCard', columnId: 'output', id: 'l2', title: '📝 ZERO computations yet', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'addOutput', id: 'o7', text: 'Generator ready', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'removeCard', cardId: 'l1' },
      { action: 'removeCard', cardId: 'l2' },
      { action: 'setStatus', cardId: 'lazy-gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'lazy-gen', glow: true },
      { action: 'addCard', columnId: 'output', id: 'now1', title: '⏳ NOW computing 0...', statusId: 'running' },
    ],
    [
      { action: 'addOutput', id: 'o8', text: '  Computing 0... (slow!)', time: '0.0s' },
      { action: 'setStatus', cardId: 'lazy-gen', statusId: 'paused' },
      { action: 'setGlow', cardId: 'lazy-gen', glow: false },
      { action: 'removeCard', cardId: 'now1' },
      { action: 'addCard', columnId: 'output', id: 'got1', title: '📤 Yielded: 0', statusId: 'value' },
    ],
    [
      { action: 'addOutput', id: 'o9', text: 'First: 0', time: '0.0s' },
      { action: 'removeCard', cardId: 'got1' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'setStatus', cardId: 'lazy-gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'lazy-gen', glow: true },
      { action: 'addCard', columnId: 'output', id: 'now2', title: '⏳ NOW computing 1...', statusId: 'running' },
    ],
    [
      { action: 'addOutput', id: 'o10', text: '  Computing 1... (slow!)', time: '0.0s' },
      { action: 'setStatus', cardId: 'lazy-gen', statusId: 'paused' },
      { action: 'setGlow', cardId: 'lazy-gen', glow: false },
      { action: 'removeCard', cardId: 'now2' },
      { action: 'addCard', columnId: 'output', id: 'got2', title: '📤 Yielded: 100', statusId: 'value' },
    ],
    [
      { action: 'addOutput', id: 'o11', text: 'Second: 100', time: '0.0s' },
      { action: 'removeCard', cardId: 'got2' },
      { action: 'addCard', columnId: 'output', id: 'note', title: '💡 Value 2 NEVER computed!', statusId: 'receiving' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default lazyEvaluation
