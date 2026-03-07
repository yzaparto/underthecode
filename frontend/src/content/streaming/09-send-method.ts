import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `def accumulator():
    """Generator that receives values via send()."""
    total = 0
    while True:
        # yield sends total OUT, receives value IN
        value = yield total
        if value is None:
            break
        print(f"Received: {value}")
        total += value


# Create and prime the generator
gen = accumulator()
initial = next(gen)  # Prime: advance to first yield
print(f"Initial total: {initial}")

# Send values into the generator
print(f"After 10: {gen.send(10)}")
print(f"After 20: {gen.send(20)}")
print(f"After 5: {gen.send(5)}")

# Stop the generator
gen.send(None)`

const sendMethod: AnimationDefinition = {
  id: 'streaming-send-method',
  title: 'send() Method',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define Coroutine-Style Generator',
      explanation: '• `value = yield total` does two things at once\n• It yields `total` OUT to the caller\n• It receives the sent value back IN as `value`\n• This enables two-way communication',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Prime the Generator',
      explanation: '• Generators must be "primed" with `next()` before `send()`\n• This advances to the first `yield`, outputting `total = 0`\n• The generator is now paused AT the yield, ready to receive',
      startStep: 1,
      endStep: 4,
    },
    {
      title: 'Send First Value',
      explanation: '• `gen.send(10)` resumes execution at the yield\n• `value` becomes 10, which is added to `total`\n• The loop continues to yield the new total (10)',
      startStep: 5,
      endStep: 8,
    },
    {
      title: 'Send More Values',
      explanation: '• Each `send()` injects a value and receives the updated total\n• The generator maintains running state between sends\n• This is the foundation of coroutine-based patterns',
      startStep: 9,
      endStep: 14,
    },
    {
      title: 'Stop the Generator',
      explanation: '• Sending `None` triggers the break condition\n• The generator exits cleanly\n• This is a common pattern for signaling completion',
      startStep: 15,
      endStep: 16,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'addCard', columnId: 'generator', id: 'gen', title: 'accumulator()', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
      { action: 'addCard', columnId: 'memory', id: 'total', title: 'total = 0', statusId: 'buffered' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'addOutput', id: 'o1', text: 'yield total (0)', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o2', text: 'Initial total: 0', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
      { action: 'addOutput', id: 'o3', text: 'send(10) -> value = 10', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'addOutput', id: 'o4', text: 'Received: 10', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-9' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o5', text: 'After 10: 10', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
      { action: 'addOutput', id: 'o6', text: 'send(20) -> value = 20', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'addOutput', id: 'o7', text: 'Received: 20', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o8', text: 'After 20: 30', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
      { action: 'addOutput', id: 'o9', text: 'send(5) -> value = 5', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'addOutput', id: 'o10', text: 'Received: 5', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o11', text: 'After 5: 35', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
      { action: 'addOutput', id: 'o12', text: 'send(None) -> break', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'gen', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o13', text: 'Generator stopped', time: '0.0s' },
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'gen' },
      { action: 'removeCard', cardId: 'total' },
    ],
  ],
}

export default sendMethod
