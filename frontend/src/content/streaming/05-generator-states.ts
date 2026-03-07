import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { mechanicsColumns, basicsStatuses } from './layouts'

const sourceCode = `def simple():
    yield 1
    yield 2


# State 1: CREATED
gen = simple()
print("Created")

# State 2: RUNNING → PAUSED
val = next(gen)
print(f"Got: {val}")

# State 3: RUNNING → PAUSED (again)
val = next(gen)
print(f"Got: {val}")

# State 4: DONE
try:
    next(gen)
except StopIteration:
    print("Generator exhausted!")`

const generatorStates: AnimationDefinition = {
  id: 'streaming-05-generator-states',
  title: 'Generator States',
  columns: mechanicsColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'The Four States',
      explanation: '• Generators have 4 possible states:\n  1. 🆕 CREATED — made but not started\n  2. 🟢 RUNNING — currently executing\n  3. ⏸️ PAUSED — stopped at a yield\n  4. ✅ DONE — finished or exhausted',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'State: CREATED',
      explanation: '• `gen = simple()` creates the generator\n• No code has run yet\n• It\'s waiting for the first `next()` call',
      startStep: 1,
      endStep: 2,
    },
    {
      title: 'State: RUNNING → PAUSED',
      explanation: '• `next(gen)` starts execution (RUNNING)\n• Runs until `yield 1` (PAUSED)\n• The generator remembers where it stopped',
      startStep: 3,
      endStep: 6,
    },
    {
      title: 'State: RUNNING → PAUSED (again)',
      explanation: '• Another `next()` resumes (RUNNING)\n• Runs until `yield 2` (PAUSED)\n• Same cycle: run → yield → pause',
      startStep: 7,
      endStep: 10,
    },
    {
      title: 'State: DONE',
      explanation: '• One more `next()` resumes\n• No more yields — function ends\n• StopIteration raised — generator is DONE',
      startStep: 11,
      endStep: 14,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-0' },
      { action: 'addCard', columnId: 'state', id: 'diagram', title: 'State Diagram', statusId: 'created' },
      { action: 'addCard', columnId: 'state', id: 's1', title: '🆕 CREATED', statusId: 'created' },
      { action: 'addCard', columnId: 'state', id: 's2', title: '🟢 RUNNING', statusId: 'running' },
      { action: 'addCard', columnId: 'state', id: 's3', title: '⏸️ PAUSED', statusId: 'paused' },
      { action: 'addCard', columnId: 'state', id: 's4', title: '✅ DONE', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'removeCard', cardId: 'diagram' },
      { action: 'removeCard', cardId: 's2' },
      { action: 'removeCard', cardId: 's3' },
      { action: 'removeCard', cardId: 's4' },
      { action: 'setGlow', cardId: 's1', glow: true },
      { action: 'addCard', columnId: 'output', id: 'current', title: 'Current State: CREATED', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'addOutput', id: 'o1', text: 'Created', time: '0.0s' },
      { action: 'addCard', columnId: 'output', id: 'note1', title: '📝 No code inside gen has run', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'setGlow', cardId: 's1', glow: false },
      { action: 'removeCard', cardId: 's1' },
      { action: 'addCard', columnId: 'state', id: 's2', title: '🟢 RUNNING', statusId: 'running' },
      { action: 'setGlow', cardId: 's2', glow: true },
      { action: 'removeCard', cardId: 'current' },
      { action: 'addCard', columnId: 'output', id: 'current', title: 'Current State: RUNNING', statusId: 'running' },
      { action: 'removeCard', cardId: 'note1' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-1' },
    ],
    [
      { action: 'setGlow', cardId: 's2', glow: false },
      { action: 'removeCard', cardId: 's2' },
      { action: 'addCard', columnId: 'state', id: 's3', title: '⏸️ PAUSED', statusId: 'paused' },
      { action: 'setGlow', cardId: 's3', glow: true },
      { action: 'removeCard', cardId: 'current' },
      { action: 'addCard', columnId: 'output', id: 'current', title: 'Current State: PAUSED', statusId: 'paused' },
      { action: 'addCard', columnId: 'output', id: 'val1', title: '📤 Yielded: 1', statusId: 'value' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addOutput', id: 'o2', text: 'Got: 1', time: '0.0s' },
      { action: 'removeCard', cardId: 'val1' },
      { action: 'addCard', columnId: 'output', id: 'received1', title: '📥 Received: 1', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'setGlow', cardId: 's3', glow: false },
      { action: 'removeCard', cardId: 's3' },
      { action: 'addCard', columnId: 'state', id: 's2b', title: '🟢 RUNNING', statusId: 'running' },
      { action: 'setGlow', cardId: 's2b', glow: true },
      { action: 'removeCard', cardId: 'current' },
      { action: 'addCard', columnId: 'output', id: 'current', title: 'Current State: RUNNING', statusId: 'running' },
      { action: 'removeCard', cardId: 'received1' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
    ],
    [
      { action: 'setGlow', cardId: 's2b', glow: false },
      { action: 'removeCard', cardId: 's2b' },
      { action: 'addCard', columnId: 'state', id: 's3b', title: '⏸️ PAUSED', statusId: 'paused' },
      { action: 'setGlow', cardId: 's3b', glow: true },
      { action: 'removeCard', cardId: 'current' },
      { action: 'addCard', columnId: 'output', id: 'current', title: 'Current State: PAUSED', statusId: 'paused' },
      { action: 'addCard', columnId: 'output', id: 'val2', title: '📤 Yielded: 2', statusId: 'value' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addOutput', id: 'o3', text: 'Got: 2', time: '0.0s' },
      { action: 'removeCard', cardId: 'val2' },
      { action: 'addCard', columnId: 'output', id: 'received2', title: '📥 Received: 2', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'setGlow', cardId: 's3b', glow: false },
      { action: 'removeCard', cardId: 's3b' },
      { action: 'addCard', columnId: 'state', id: 's2c', title: '🟢 RUNNING', statusId: 'running' },
      { action: 'setGlow', cardId: 's2c', glow: true },
      { action: 'removeCard', cardId: 'current' },
      { action: 'addCard', columnId: 'output', id: 'current', title: 'Current State: RUNNING', statusId: 'running' },
      { action: 'removeCard', cardId: 'received2' },
    ],
    [
      { action: 'setGlow', cardId: 's2c', glow: false },
      { action: 'removeCard', cardId: 's2c' },
      { action: 'addCard', columnId: 'state', id: 's4', title: '✅ DONE', statusId: 'done' },
      { action: 'setGlow', cardId: 's4', glow: true },
      { action: 'removeCard', cardId: 'current' },
      { action: 'addCard', columnId: 'output', id: 'current', title: 'Current State: DONE', statusId: 'done' },
      { action: 'addCard', columnId: 'output', id: 'stop', title: '🛑 StopIteration raised!', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addOutput', id: 'o4', text: 'Generator exhausted!', time: '0.0s' },
      { action: 'setGlow', cardId: 's4', glow: false },
      { action: 'clearHighlights' },
    ],
  ],
}

export default generatorStates
