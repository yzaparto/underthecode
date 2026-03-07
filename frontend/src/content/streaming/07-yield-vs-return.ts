import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `def with_return():
    """Return exits immediately."""
    print("Before return")
    return 1
    print("After return")  # Never runs!


def with_yield():
    """Yield pauses, can resume."""
    print("Before first yield")
    yield 1
    print("Between yields")
    yield 2
    print("After last yield")


# Return: function exits completely
result = with_return()
print(f"Got: {result}")

# Yield: function pauses and resumes
gen = with_yield()
print(f"First: {next(gen)}")
print(f"Second: {next(gen)}")
try:
    next(gen)
except StopIteration:
    print("Generator exhausted")`

const yieldVsReturn: AnimationDefinition = {
  id: 'streaming-yield-vs-return',
  title: 'yield vs return',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define Functions',
      explanation: '• `with_return()` uses `return` — exits the function completely\n• `with_yield()` uses `yield` — pauses execution, can resume later\n• Note: code after `return` never executes',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'Using return',
      explanation: '• `with_return()` prints "Before return" then immediately exits\n• The function is completely finished after `return 1`\n• "After return" is dead code — it never runs',
      startStep: 2,
      endStep: 5,
    },
    {
      title: 'Generator Creation',
      explanation: '• `with_yield()` creates a generator object\n• "Before first yield" has NOT printed yet\n• The function body is paused at the very start',
      startStep: 6,
      endStep: 7,
    },
    {
      title: 'First yield',
      explanation: '• `next(gen)` runs until the first `yield`\n• "Before first yield" prints, then `yield 1` pauses execution\n• The function is still alive, just suspended',
      startStep: 8,
      endStep: 11,
    },
    {
      title: 'Second yield',
      explanation: '• `next(gen)` resumes FROM where it paused\n• "Between yields" prints, then `yield 2` pauses again\n• State is fully preserved between calls',
      startStep: 12,
      endStep: 15,
    },
    {
      title: 'Exhaustion',
      explanation: '• The third `next()` runs the remaining code\n• "After last yield" prints, then the function ends\n• `StopIteration` is raised — no more values',
      startStep: 16,
      endStep: 19,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-7' }],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'addCard', columnId: 'code', id: 'ret', title: 'with_return()', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
      { action: 'addOutput', id: 'o1', text: 'Before return', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'addOutput', id: 'o2', text: '(return 1 - function exits)', time: '0.0s' },
      { action: 'setStatus', cardId: 'ret', statusId: 'complete' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'removeCard', cardId: 'ret' },
      { action: 'addOutput', id: 'o3', text: 'Got: 1', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addCard', columnId: 'generator', id: 'gen', title: 'with_yield()', statusId: 'ready' },
    ],
    [
      { action: 'addOutput', id: 'o4', text: 'Generator created (paused at start)', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'addOutput', id: 'o5', text: 'Before first yield', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'addCard', columnId: 'memory', id: 'v1', title: 'yielded: 1', statusId: 'yielding' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'removeCard', cardId: 'v1' },
      { action: 'addOutput', id: 'o6', text: 'First: 1', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addOutput', id: 'o7', text: 'Between yields', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'addCard', columnId: 'memory', id: 'v2', title: 'yielded: 2', statusId: 'yielding' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'removeCard', cardId: 'v2' },
      { action: 'addOutput', id: 'o8', text: 'Second: 2', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-25' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'addOutput', id: 'o9', text: 'After last yield', time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o10', text: '(StopIteration raised)', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-27' },
      { action: 'addOutput', id: 'o11', text: 'Generator exhausted', time: '0.0s' },
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'gen' },
    ],
  ],
}

export default yieldVsReturn
