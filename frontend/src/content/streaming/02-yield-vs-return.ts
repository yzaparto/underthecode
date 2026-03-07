import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { basicsColumns, basicsStatuses } from './layouts'

const sourceCode = `# RETURN: Exits immediately, function is DONE
def get_one():
    print("Before return")
    return 1
    print("After return")  # Never runs!


# YIELD: Pauses, function can RESUME
def yield_one():
    print("Before yield")
    yield 1
    print("After yield")  # This WILL run!


# Try return
result = get_one()
print(f"Got: {result}")

# Try yield
gen = yield_one()
val1 = next(gen)
print(f"Got: {val1}")
val2 = next(gen)  # Continues after yield!`

const yieldVsReturn: AnimationDefinition = {
  id: 'streaming-02-yield-vs-return',
  title: 'yield vs return',
  columns: basicsColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'The return Function',
      explanation: '• `return` exits the function IMMEDIATELY\n• The function is completely DONE after return\n• Any code after return NEVER executes',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'The yield Function',
      explanation: '• `yield` PAUSES the function (doesn\'t exit)\n• The function can RESUME later\n• Code after yield WILL execute when resumed',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Call the return Function',
      explanation: '• Calling `get_one()` runs the entire function\n• It prints, returns 1, and the function is DONE\n• "After return" never prints — function exited',
      startStep: 2,
      endStep: 5,
    },
    {
      title: 'Call the yield Function',
      explanation: '• `yield_one()` creates a generator (paused)\n• First `next()` runs to `yield 1` and pauses\n• Second `next()` RESUMES — "After yield" prints!',
      startStep: 6,
      endStep: 14,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-1' },
      { action: 'addCard', columnId: 'viz', id: 'info', title: '📌 return = EXIT forever', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'removeCard', cardId: 'info' },
      { action: 'addCard', columnId: 'viz', id: 'info', title: '📌 yield = PAUSE temporarily', statusId: 'paused' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'removeCard', cardId: 'info' },
      { action: 'addCard', columnId: 'viz', id: 'func', title: 'get_one()', statusId: 'running' },
      { action: 'setGlow', cardId: 'func', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
      { action: 'addOutput', id: 'o1', text: 'Before return', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'setStatus', cardId: 'func', statusId: 'done' },
      { action: 'setGlow', cardId: 'func', glow: false },
      { action: 'addCard', columnId: 'viz', id: 'exit', title: '🚪 Function EXITED', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'addOutput', id: 'o2', text: 'Got: 1', time: '0.0s' },
      { action: 'addCard', columnId: 'viz', id: 'dead', title: '💀 "After return" never runs', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'removeCard', cardId: 'func' },
      { action: 'removeCard', cardId: 'exit' },
      { action: 'removeCard', cardId: 'dead' },
      { action: 'addCard', columnId: 'viz', id: 'gen', title: 'yield_one()', statusId: 'created' },
      { action: 'addCard', columnId: 'viz', id: 'note', title: '🆕 Generator created (not started)', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'removeCard', cardId: 'note' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'addOutput', id: 'o3', text: 'Before yield', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addCard', columnId: 'viz', id: 'pause', title: '⏸️ PAUSED at yield (not exited!)', statusId: 'paused' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addOutput', id: 'o4', text: 'Got: 1', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'removeCard', cardId: 'pause' },
      { action: 'addCard', columnId: 'viz', id: 'resume', title: '🟢 RESUMED from yield!', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addOutput', id: 'o5', text: 'After yield', time: '0.0s' },
      { action: 'addCard', columnId: 'viz', id: 'proof', title: '✨ Code AFTER yield executed!', statusId: 'receiving' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'done' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'removeCard', cardId: 'resume' },
      { action: 'addCard', columnId: 'viz', id: 'stop', title: '🛑 StopIteration (no more yields)', statusId: 'done' },
    ],
    [
      { action: 'clearHighlights' },
    ],
  ],
}

export default yieldVsReturn
