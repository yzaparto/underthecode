import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { basicsColumns, basicsStatuses } from './layouts'

const sourceCode = `def colors():
    yield "red"
    yield "green"
    yield "blue"


# The MANUAL way (what for loop does internally)
gen = colors()
print(next(gen))  # "red"
print(next(gen))  # "green"  
print(next(gen))  # "blue"
# next(gen) would raise StopIteration


# The EASY way (for loop does this automatically!)
for color in colors():
    print(color)`

const forLoopMagic: AnimationDefinition = {
  id: 'streaming-03-for-loop',
  title: 'The for Loop Magic',
  columns: basicsColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'A Simple Generator',
      explanation: '• This generator yields 3 colors\n• We\'ll see two ways to consume it:\n  1. Manual: calling next() yourself\n  2. Automatic: using a for loop',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Manual Way: next() Calls',
      explanation: '• You can call `next()` manually to get each value\n• But you have to handle StopIteration yourself\n• It\'s tedious and error-prone',
      startStep: 1,
      endStep: 7,
    },
    {
      title: 'Easy Way: for Loop',
      explanation: '• `for` loop calls `next()` automatically\n• It catches StopIteration and exits cleanly\n• This is how you should normally use generators!',
      startStep: 8,
      endStep: 14,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-0' },
      { action: 'addCard', columnId: 'viz', id: 'info', title: '🎨 Generator yields 3 colors', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'removeCard', cardId: 'info' },
      { action: 'addCard', columnId: 'viz', id: 'gen', title: 'colors()', statusId: 'created' },
      { action: 'addCard', columnId: 'viz', id: 'manual', title: '🔧 Manual approach', statusId: 'waiting' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-1' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o1', text: 'red', time: '0.0s' },
      { action: 'addCard', columnId: 'viz', id: 'v1', title: '📤 "red"', statusId: 'value' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'removeCard', cardId: 'v1' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o2', text: 'green', time: '0.0s' },
      { action: 'addCard', columnId: 'viz', id: 'v2', title: '📤 "green"', statusId: 'value' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'removeCard', cardId: 'v2' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o3', text: 'blue', time: '0.0s' },
      { action: 'removeCard', cardId: 'gen' },
      { action: 'removeCard', cardId: 'manual' },
      { action: 'addCard', columnId: 'viz', id: 'done1', title: '⚠️ One more next() = StopIteration!', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'removeCard', cardId: 'done1' },
      { action: 'addCard', columnId: 'viz', id: 'gen2', title: 'colors()', statusId: 'created' },
      { action: 'addCard', columnId: 'viz', id: 'auto', title: '✨ for loop handles everything!', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'setStatus', cardId: 'gen2', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen2', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-1' },
      { action: 'setStatus', cardId: 'gen2', statusId: 'paused' },
      { action: 'setGlow', cardId: 'gen2', glow: false },
      { action: 'addOutput', id: 'o4', text: 'red', time: '0.1s' },
      { action: 'addCard', columnId: 'viz', id: 'loop1', title: 'for loop: got "red"', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'addOutput', id: 'o4b', text: 'red', time: '0.1s' },
      { action: 'setStatus', cardId: 'gen2', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen2', glow: true },
      { action: 'removeCard', cardId: 'loop1' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
      { action: 'setStatus', cardId: 'gen2', statusId: 'paused' },
      { action: 'setGlow', cardId: 'gen2', glow: false },
      { action: 'addOutput', id: 'o5', text: 'green', time: '0.1s' },
      { action: 'addCard', columnId: 'viz', id: 'loop2', title: 'for loop: got "green"', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'setStatus', cardId: 'gen2', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen2', glow: true },
      { action: 'removeCard', cardId: 'loop2' },
    ],
    [
      { action: 'setStatus', cardId: 'gen2', statusId: 'done' },
      { action: 'setGlow', cardId: 'gen2', glow: false },
      { action: 'addOutput', id: 'o6', text: 'blue', time: '0.1s' },
      { action: 'removeCard', cardId: 'auto' },
      { action: 'addCard', columnId: 'viz', id: 'finish', title: '✅ for loop caught StopIteration', statusId: 'done' },
      { action: 'addCard', columnId: 'viz', id: 'tip', title: '💡 Use for loops with generators!', statusId: 'receiving' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default forLoopMagic
