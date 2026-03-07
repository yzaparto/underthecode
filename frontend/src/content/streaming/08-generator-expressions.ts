import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `# List comprehension - builds entire list
squares_list = [x*x for x in range(5)]
print(f"List: {squares_list}")
print(f"Type: {type(squares_list)}")

# Generator expression - lazy evaluation
squares_gen = (x*x for x in range(5))
print(f"Generator: {squares_gen}")
print(f"Type: {type(squares_gen)}")

# Consume the generator
print("Consuming generator:")
for sq in squares_gen:
    print(f"  {sq}")

# Generator is now exhausted
print(f"List after: {list(squares_gen)}")`

const generatorExpressions: AnimationDefinition = {
  id: 'streaming-generator-expressions',
  title: 'Generator Expressions',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'List Comprehension',
      explanation: '• `[x*x for x in range(5)]` uses square brackets\n• This builds the ENTIRE list immediately\n• All values are computed and stored in memory',
      startStep: 0,
      endStep: 2,
    },
    {
      title: 'Generator Expression',
      explanation: '• `(x*x for x in range(5))` uses parentheses\n• This creates a generator object — no values computed yet\n• The expression is evaluated lazily on iteration',
      startStep: 3,
      endStep: 5,
    },
    {
      title: 'Consuming the Generator',
      explanation: '• The `for` loop pulls values one at a time\n• Each square is computed only when needed\n• Memory usage is constant regardless of size',
      startStep: 6,
      endStep: 12,
    },
    {
      title: 'Generator Exhaustion',
      explanation: '• After iteration, the generator is exhausted\n• `list(squares_gen)` returns empty — all values consumed\n• Generators are single-use; recreate for another pass',
      startStep: 13,
      endStep: 14,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-1' },
      { action: 'addCard', columnId: 'memory', id: 'list', title: '[0, 1, 4, 9, 16]', statusId: 'buffered' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
      { action: 'addOutput', id: 'o1', text: 'List: [0, 1, 4, 9, 16]', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'addOutput', id: 'o2', text: "Type: <class 'list'>", time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addCard', columnId: 'generator', id: 'gen', title: '(x*x for x in range(5))', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'addOutput', id: 'o3', text: 'Generator: <generator object>', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'addOutput', id: 'o4', text: "Type: <class 'generator'>", time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addOutput', id: 'o5', text: 'Consuming generator:', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'addOutput', id: 'o6', text: '  0', time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'addOutput', id: 'o7', text: '  1', time: '0.0s' },
    ],
    [
      { action: 'addOutput', id: 'o8', text: '  4', time: '0.0s' },
    ],
    [
      { action: 'addOutput', id: 'o9', text: '  9', time: '0.0s' },
    ],
    [
      { action: 'addOutput', id: 'o10', text: '  16', time: '0.0s' },
      { action: 'setStatus', cardId: 'gen', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'gen', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
    ],
    [
      { action: 'addOutput', id: 'o11', text: 'List after: []', time: '0.0s' },
      { action: 'addOutput', id: 'o12', text: '(generator exhausted!)', time: '0.0s' },
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'gen' },
    ],
  ],
}

export default generatorExpressions
