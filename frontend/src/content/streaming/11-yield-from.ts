import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `def inner():
    """Sub-generator with values."""
    yield "a"
    yield "b"
    return "inner done"


def outer_manual():
    """Manual delegation (tedious)."""
    for item in inner():
        yield item


def outer_yield_from():
    """yield from handles everything."""
    result = yield from inner()
    print(f"Inner returned: {result}")
    yield "c"


# Using yield from
gen = outer_yield_from()
print(next(gen))  # a (from inner)
print(next(gen))  # b (from inner)
print(next(gen))  # c (from outer)`

const yieldFrom: AnimationDefinition = {
  id: 'streaming-yield-from',
  title: 'yield from',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define Generators',
      explanation: '• `inner()` yields "a" and "b", then returns "inner done"\n• `outer_manual()` delegates by looping — but loses the return value\n• `outer_yield_from()` uses `yield from` — handles everything automatically',
      startStep: 0,
      endStep: 2,
    },
    {
      title: 'Create and Start',
      explanation: '• `outer_yield_from()` creates the outer generator\n• When we call `next()`, it hits `yield from inner()`\n• This automatically creates and starts iterating `inner()`',
      startStep: 3,
      endStep: 5,
    },
    {
      title: 'Delegate to Inner',
      explanation: '• Values from `inner()` pass through transparently\n• The caller sees "a" and "b" as if outer yielded them\n• `yield from` is a bidirectional pipe between caller and sub-generator',
      startStep: 6,
      endStep: 9,
    },
    {
      title: 'Capture Return Value',
      explanation: '• When `inner()` returns, `yield from` captures its return value\n• `result` becomes "inner done"\n• The outer generator prints this and continues with its own yields',
      startStep: 10,
      endStep: 13,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-7' }],
    [{ action: 'highlightLine', lineId: 'line-13' }],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addCard', columnId: 'generator', id: 'outer', title: 'outer_yield_from()', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'setStatus', cardId: 'outer', statusId: 'running' },
      { action: 'setGlow', cardId: 'outer', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addCard', columnId: 'generator', id: 'inner', title: 'inner()', statusId: 'running' },
      { action: 'setGlow', cardId: 'inner', glow: true },
      { action: 'addOutput', id: 'o1', text: 'yield from inner() started', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
      { action: 'setStatus', cardId: 'inner', statusId: 'yielding' },
      { action: 'addCard', columnId: 'memory', id: 'val1', title: 'inner yields: "a"', statusId: 'yielding' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'setStatus', cardId: 'outer', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'outer', glow: false },
      { action: 'setStatus', cardId: 'inner', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'inner', glow: false },
      { action: 'removeCard', cardId: 'val1' },
      { action: 'addOutput', id: 'o2', text: 'a', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'setStatus', cardId: 'outer', statusId: 'running' },
      { action: 'setGlow', cardId: 'outer', glow: true },
      { action: 'setStatus', cardId: 'inner', statusId: 'running' },
      { action: 'setGlow', cardId: 'inner', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'setStatus', cardId: 'inner', statusId: 'yielding' },
      { action: 'setStatus', cardId: 'outer', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'outer', glow: false },
      { action: 'setStatus', cardId: 'inner', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'inner', glow: false },
      { action: 'addOutput', id: 'o3', text: 'b', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'setStatus', cardId: 'outer', statusId: 'running' },
      { action: 'setGlow', cardId: 'outer', glow: true },
      { action: 'setStatus', cardId: 'inner', statusId: 'running' },
      { action: 'setGlow', cardId: 'inner', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'setStatus', cardId: 'inner', statusId: 'complete' },
      { action: 'setGlow', cardId: 'inner', glow: false },
      { action: 'addOutput', id: 'o4', text: 'inner() returned "inner done"', time: '0.0s' },
      { action: 'removeCard', cardId: 'inner' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'addOutput', id: 'o5', text: 'Inner returned: inner done', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'setStatus', cardId: 'outer', statusId: 'yielding' },
      { action: 'setStatus', cardId: 'outer', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'outer', glow: false },
      { action: 'addOutput', id: 'o6', text: 'c', time: '0.0s' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default yieldFrom
