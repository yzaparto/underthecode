import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { toolsColumns, basicsStatuses } from './layouts'

const sourceCode = `def accumulator():
    total = 0
    while True:
        # value comes FROM send()
        value = yield total
        if value is None:
            break
        total += value


gen = accumulator()

# Start the generator (prime it)
current = next(gen)
print(f"Start: {current}")

# Send values IN, get totals OUT
current = gen.send(10)
print(f"After +10: {current}")

current = gen.send(5)
print(f"After +5: {current}")

gen.send(None)  # Signal to stop`

const sendMethod: AnimationDefinition = {
  id: 'streaming-10-send',
  title: 'send() — Two-Way Communication',
  columns: toolsColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Two-Way Generators',
      explanation: '• So far: generator sends values OUT via yield\n• But you can also send values IN via send()!\n• `value = yield output` — yields OUT, receives IN',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'Prime the Generator',
      explanation: '• Must call `next()` first to start the generator\n• This runs it to the first yield\n• Now it\'s ready to receive send() calls',
      startStep: 2,
      endStep: 4,
    },
    {
      title: 'Send Values In',
      explanation: '• `gen.send(10)` resumes AND injects 10\n• The 10 becomes the value of `yield`\n• Generator adds it to total, yields new total',
      startStep: 5,
      endStep: 8,
    },
    {
      title: 'Continue the Conversation',
      explanation: '• Each send() is a two-way exchange\n• We send a number IN, get the total OUT\n• send(None) signals we\'re done',
      startStep: 9,
      endStep: 13,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-0' },
      { action: 'addCard', columnId: 'generator', id: 'info', title: 'Two-Way Generator', statusId: 'waiting' },
      { action: 'addCard', columnId: 'flow', id: 'out', title: 'yield → sends OUT', statusId: 'value' },
      { action: 'addCard', columnId: 'flow', id: 'in', title: 'send() → injects IN', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'removeCard', cardId: 'out' },
      { action: 'removeCard', cardId: 'in' },
      { action: 'addCard', columnId: 'flow', id: 'syntax', title: 'value = yield total', statusId: 'waiting' },
      { action: 'addCard', columnId: 'flow', id: 's1', title: '↑ total goes OUT', statusId: 'value' },
      { action: 'addCard', columnId: 'flow', id: 's2', title: '↓ value comes IN', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'removeCard', cardId: 'info' },
      { action: 'removeCard', cardId: 'syntax' },
      { action: 'removeCard', cardId: 's1' },
      { action: 'removeCard', cardId: 's2' },
      { action: 'addCard', columnId: 'generator', id: 'gen', title: 'accumulator()', statusId: 'created' },
      { action: 'addCard', columnId: 'flow', id: 'state', title: 'total = 0', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
      { action: 'addCard', columnId: 'flow', id: 'prime', title: '⚡ next() primes generator', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'removeCard', cardId: 'prime' },
      { action: 'addCard', columnId: 'flow', id: 'y1', title: '📤 yield total → 0', statusId: 'value' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'removeCard', cardId: 'y1' },
      { action: 'addOutput', id: 'o1', text: 'Start: 0', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'addCard', columnId: 'flow', id: 'send1', title: '📥 send(10) → value = 10', statusId: 'receiving' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'removeCard', cardId: 'send1' },
      { action: 'removeCard', cardId: 'state' },
      { action: 'addCard', columnId: 'flow', id: 'state', title: 'total = 10', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addCard', columnId: 'flow', id: 'y2', title: '📤 yield total → 10', statusId: 'value' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'removeCard', cardId: 'y2' },
      { action: 'addOutput', id: 'o2', text: 'After +10: 10', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'addCard', columnId: 'flow', id: 'send2', title: '📥 send(5) → value = 5', statusId: 'receiving' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'removeCard', cardId: 'send2' },
      { action: 'removeCard', cardId: 'state' },
      { action: 'addCard', columnId: 'flow', id: 'state', title: 'total = 15', statusId: 'running' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'setGlow', cardId: 'gen', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addOutput', id: 'o3', text: 'After +5: 15', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'addCard', columnId: 'flow', id: 'stop', title: '📥 send(None) → stop signal', statusId: 'done' },
      { action: 'setStatus', cardId: 'gen', statusId: 'done' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default sendMethod
