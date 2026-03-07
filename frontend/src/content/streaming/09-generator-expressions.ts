import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { toolsColumns, basicsStatuses } from './layouts'

const sourceCode = `# List comprehension - uses [ ]
squares_list = [x*x for x in range(5)]
print(f"List: {squares_list}")
print(f"Type: {type(squares_list)}")

# Generator expression - uses ( )
squares_gen = (x*x for x in range(5))
print(f"Gen: {squares_gen}")
print(f"Type: {type(squares_gen)}")

# Consume the generator
print("Values:")
for sq in squares_gen:
    print(f"  {sq}")

# Generator is now empty!
print(f"Again: {list(squares_gen)}")`

const generatorExpressions: AnimationDefinition = {
  id: 'streaming-09-gen-expr',
  title: 'Generator Expressions',
  columns: toolsColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'List vs Generator Comprehension',
      explanation: '• `[expr for x in iter]` — builds a LIST (eager)\n• `(expr for x in iter)` — creates a GENERATOR (lazy)\n• Same syntax, just different brackets!',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'List Comprehension',
      explanation: '• Square brackets `[ ]` build a complete list\n• All values computed and stored immediately\n• Result is a list object',
      startStep: 1,
      endStep: 3,
    },
    {
      title: 'Generator Expression',
      explanation: '• Parentheses `( )` create a generator\n• NO values computed yet!\n• Result is a generator object',
      startStep: 4,
      endStep: 6,
    },
    {
      title: 'Consuming the Generator',
      explanation: '• Values are computed as we iterate\n• After iteration, generator is EXHAUSTED\n• Second iteration gets nothing!',
      startStep: 7,
      endStep: 13,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-1' },
      { action: 'addCard', columnId: 'generator', id: 'syntax', title: 'Syntax Difference', statusId: 'waiting' },
      { action: 'addCard', columnId: 'flow', id: 's1', title: '[ ] → List (eager)', statusId: 'created' },
      { action: 'addCard', columnId: 'flow', id: 's2', title: '( ) → Generator (lazy)', statusId: 'created' },
    ],
    [
      { action: 'removeCard', cardId: 'syntax' },
      { action: 'removeCard', cardId: 's1' },
      { action: 'removeCard', cardId: 's2' },
      { action: 'addCard', columnId: 'generator', id: 'list', title: '[x*x for x in range(5)]', statusId: 'running' },
      { action: 'setGlow', cardId: 'list', glow: true },
    ],
    [
      { action: 'setStatus', cardId: 'list', statusId: 'done' },
      { action: 'setGlow', cardId: 'list', glow: false },
      { action: 'addCard', columnId: 'flow', id: 'lval', title: '📦 [0, 1, 4, 9, 16]', statusId: 'done' },
      { action: 'addCard', columnId: 'flow', id: 'lnote', title: '⚡ All computed NOW', statusId: 'paused' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
      { action: 'addOutput', id: 'o1', text: 'List: [0, 1, 4, 9, 16]', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'removeCard', cardId: 'list' },
      { action: 'removeCard', cardId: 'lval' },
      { action: 'removeCard', cardId: 'lnote' },
      { action: 'addCard', columnId: 'generator', id: 'gen', title: '(x*x for x in range(5))', statusId: 'created' },
    ],
    [
      { action: 'addCard', columnId: 'flow', id: 'gnote', title: '✨ Generator created', statusId: 'created' },
      { action: 'addCard', columnId: 'flow', id: 'gnote2', title: '📝 ZERO values computed!', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'addOutput', id: 'o2', text: 'Gen: <generator object>', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'removeCard', cardId: 'gnote' },
      { action: 'removeCard', cardId: 'gnote2' },
      { action: 'addOutput', id: 'o3', text: 'Values:', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'addCard', columnId: 'flow', id: 'v1', title: '📤 0', statusId: 'value' },
      { action: 'addOutput', id: 'o4', text: '  0', time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'removeCard', cardId: 'v1' },
      { action: 'addOutput', id: 'o5', text: '  1', time: '0.0s' },
      { action: 'addOutput', id: 'o6', text: '  4', time: '0.0s' },
      { action: 'addOutput', id: 'o7', text: '  9', time: '0.0s' },
      { action: 'addOutput', id: 'o8', text: '  16', time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'done' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addCard', columnId: 'flow', id: 'empty', title: '🚫 Generator EXHAUSTED', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
    ],
    [
      { action: 'addOutput', id: 'o9', text: 'Again: []', time: '0.0s' },
      { action: 'addCard', columnId: 'flow', id: 'warn', title: '⚠️ Single-use only!', statusId: 'paused' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default generatorExpressions
