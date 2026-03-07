import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { toolsColumns, basicsStatuses } from './layouts'

const sourceCode = `def inner():
    yield "A"
    yield "B"
    return "inner done!"


def outer_manual():
    # The hard way - manual delegation
    for item in inner():
        yield item


def outer_easy():
    # The easy way - yield from!
    result = yield from inner()
    print(f"Inner returned: {result}")
    yield "C"


# yield from passes through ALL values
for val in outer_easy():
    print(val)`

const yieldFrom: AnimationDefinition = {
  id: 'streaming-12-yield-from',
  title: 'yield from — Delegation',
  columns: toolsColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'The Problem',
      explanation: '• Sometimes a generator needs to yield from another generator\n• Manual way: loop and yield each item\n• Easy way: `yield from` does it automatically!',
      startStep: 0,
      endStep: 2,
    },
    {
      title: 'yield from in Action',
      explanation: '• `yield from inner()` delegates completely\n• All values from inner pass through outer\n• Caller doesn\'t know about inner!',
      startStep: 3,
      endStep: 7,
    },
    {
      title: 'Bonus: Capture Return Value',
      explanation: '• `yield from` can capture inner\'s return value!\n• `result = yield from inner()` gets "inner done!"\n• Then outer continues with its own yields',
      startStep: 8,
      endStep: 11,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-0' },
      { action: 'addCard', columnId: 'generator', id: 'inner', title: 'inner()', statusId: 'waiting' },
      { action: 'addCard', columnId: 'flow', id: 'i1', title: 'yields: A, B', statusId: 'value' },
      { action: 'addCard', columnId: 'flow', id: 'i2', title: 'returns: "inner done!"', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'removeCard', cardId: 'inner' },
      { action: 'removeCard', cardId: 'i1' },
      { action: 'removeCard', cardId: 'i2' },
      { action: 'addCard', columnId: 'generator', id: 'manual', title: 'Manual delegation', statusId: 'waiting' },
      { action: 'addCard', columnId: 'flow', id: 'm1', title: 'for item in inner():', statusId: 'created' },
      { action: 'addCard', columnId: 'flow', id: 'm2', title: '    yield item', statusId: 'created' },
      { action: 'addCard', columnId: 'flow', id: 'm3', title: '😫 Tedious!', statusId: 'paused' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'removeCard', cardId: 'manual' },
      { action: 'removeCard', cardId: 'm1' },
      { action: 'removeCard', cardId: 'm2' },
      { action: 'removeCard', cardId: 'm3' },
      { action: 'addCard', columnId: 'generator', id: 'easy', title: 'yield from', statusId: 'receiving' },
      { action: 'addCard', columnId: 'flow', id: 'e1', title: 'yield from inner()', statusId: 'receiving' },
      { action: 'addCard', columnId: 'flow', id: 'e2', title: '✨ One line!', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'removeCard', cardId: 'easy' },
      { action: 'removeCard', cardId: 'e1' },
      { action: 'removeCard', cardId: 'e2' },
      { action: 'addCard', columnId: 'generator', id: 'outer', title: 'outer_easy()', statusId: 'running' },
      { action: 'setGlow', cardId: 'outer', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'addCard', columnId: 'generator', id: 'inner', title: '↳ inner()', statusId: 'running' },
      { action: 'addCard', columnId: 'flow', id: 'del', title: '🔗 Delegating to inner...', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-1' },
      { action: 'removeCard', cardId: 'del' },
      { action: 'setStatus', cardId: 'inner', statusId: 'paused' },
      { action: 'addCard', columnId: 'flow', id: 'v1', title: '📤 inner yields: A', statusId: 'value' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'removeCard', cardId: 'v1' },
      { action: 'addOutput', id: 'o1', text: 'A', time: '0.0s' },
      { action: 'addCard', columnId: 'flow', id: 'pass', title: '↗️ Passed through outer!', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
      { action: 'removeCard', cardId: 'pass' },
      { action: 'setStatus', cardId: 'inner', statusId: 'running' },
      { action: 'addCard', columnId: 'flow', id: 'v2', title: '📤 inner yields: B', statusId: 'value' },
    ],
    [
      { action: 'removeCard', cardId: 'v2' },
      { action: 'addOutput', id: 'o2', text: 'B', time: '0.0s' },
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'setStatus', cardId: 'inner', statusId: 'done' },
      { action: 'addCard', columnId: 'flow', id: 'ret', title: '🎁 inner returns: "inner done!"', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'removeCard', cardId: 'inner' },
      { action: 'removeCard', cardId: 'ret' },
      { action: 'addCard', columnId: 'flow', id: 'cap', title: '📥 result = "inner done!"', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'removeCard', cardId: 'cap' },
      { action: 'addOutput', id: 'o3', text: 'Inner returned: inner done!', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'setStatus', cardId: 'outer', statusId: 'paused' },
      { action: 'addCard', columnId: 'flow', id: 'v3', title: '📤 outer yields: C', statusId: 'value' },
    ],
    [
      { action: 'removeCard', cardId: 'v3' },
      { action: 'addOutput', id: 'o4', text: 'C', time: '0.0s' },
      { action: 'setStatus', cardId: 'outer', statusId: 'done' },
      { action: 'setGlow', cardId: 'outer', glow: false },
      { action: 'addCard', columnId: 'flow', id: 'sum', title: '✅ A, B from inner + C from outer', statusId: 'done' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default yieldFrom
