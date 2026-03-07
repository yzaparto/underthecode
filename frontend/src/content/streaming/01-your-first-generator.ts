import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { basicsColumns, basicsStatuses } from './layouts'

const sourceCode = `def count_to_three():
    print("Starting...")
    yield 1
    print("Resuming...")
    yield 2
    print("Almost done...")
    yield 3
    print("Finished!")


gen = count_to_three()
print("Generator created")

val = next(gen)
print(f"Got: {val}")

val = next(gen)
print(f"Got: {val}")

val = next(gen)
print(f"Got: {val}")`

const yourFirstGenerator: AnimationDefinition = {
  id: 'streaming-01-first-generator',
  title: 'Your First Generator',
  columns: basicsColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define the Generator',
      explanation: '• This function has `yield` statements — that makes it a generator function\n• `yield` is like `return`, but the function PAUSES instead of exiting\n• Each `yield` outputs a value and waits',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Create the Generator',
      explanation: '• Calling `count_to_three()` does NOT run the code inside!\n• It creates a generator object — like a paused function\n• Notice: "Starting..." has NOT printed yet',
      startStep: 1,
      endStep: 2,
    },
    {
      title: 'First next() — Run Until yield',
      explanation: '• `next(gen)` starts the generator running\n• It runs until it hits `yield 1`, then PAUSES\n• The value 1 is returned to us',
      startStep: 3,
      endStep: 6,
    },
    {
      title: 'Second next() — Resume and Pause',
      explanation: '• Calling `next()` again RESUMES from where it paused\n• It runs until `yield 2`, then pauses again\n• Notice: "Resuming..." prints because we continued from line 4',
      startStep: 7,
      endStep: 10,
    },
    {
      title: 'Third next() — Last Value',
      explanation: '• One more `next()` resumes again\n• It runs to `yield 3` and pauses\n• If we called `next()` again, it would print "Finished!" then raise StopIteration',
      startStep: 11,
      endStep: 14,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addCard', columnId: 'viz', id: 'gen', title: 'count_to_three()', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'addOutput', id: 'o1', text: 'Generator created', time: '0.0s' },
      { action: 'addCard', columnId: 'viz', id: 'status', title: '🆕 Created — not started yet', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setStatus', cardId: 'status', statusId: 'running' },
      { action: 'removeCard', cardId: 'status' },
      { action: 'addCard', columnId: 'viz', id: 'status', title: '🟢 Running — executing code', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-1' },
      { action: 'addOutput', id: 'o2', text: 'Starting...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'removeCard', cardId: 'status' },
      { action: 'addCard', columnId: 'viz', id: 'status', title: '⏸️ Paused at: yield 1', statusId: 'paused' },
      { action: 'addCard', columnId: 'viz', id: 'val', title: '📤 Yielding: 1', statusId: 'value' },
      { action: 'setGlow', cardId: 'gen', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'removeCard', cardId: 'val' },
      { action: 'addOutput', id: 'o3', text: 'Got: 1', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'removeCard', cardId: 'status' },
      { action: 'addCard', columnId: 'viz', id: 'status', title: '🟢 Running — resumed!', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'addOutput', id: 'o4', text: 'Resuming...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'removeCard', cardId: 'status' },
      { action: 'addCard', columnId: 'viz', id: 'status', title: '⏸️ Paused at: yield 2', statusId: 'paused' },
      { action: 'addCard', columnId: 'viz', id: 'val2', title: '📤 Yielding: 2', statusId: 'value' },
      { action: 'setGlow', cardId: 'gen', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'removeCard', cardId: 'val2' },
      { action: 'addOutput', id: 'o5', text: 'Got: 2', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'removeCard', cardId: 'status' },
      { action: 'addCard', columnId: 'viz', id: 'status', title: '🟢 Running — resumed!', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'addOutput', id: 'o6', text: 'Almost done...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'removeCard', cardId: 'status' },
      { action: 'addCard', columnId: 'viz', id: 'status', title: '⏸️ Paused at: yield 3', statusId: 'paused' },
      { action: 'addCard', columnId: 'viz', id: 'val3', title: '📤 Yielding: 3', statusId: 'value' },
      { action: 'setGlow', cardId: 'gen', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'removeCard', cardId: 'val3' },
      { action: 'addOutput', id: 'o7', text: 'Got: 3', time: '0.0s' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default yourFirstGenerator
