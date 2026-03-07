import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `def count_up_to(n):
    """A simple generator that yields 1 to n."""
    print("Generator started")
    i = 1
    while i <= n:
        print(f"About to yield {i}")
        yield i
        print(f"Resumed after yielding {i}")
        i += 1
    print("Generator exhausted")


# Create generator object
gen = count_up_to(3)
print(f"Generator object: {gen}")

# Pull values one at a time
print(f"First: {next(gen)}")
print(f"Second: {next(gen)}")
print(f"Third: {next(gen)}")`

const generatorBasics: AnimationDefinition = {
  id: 'streaming-generator-basics',
  title: 'Generator Basics',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define Generator Function',
      explanation: '• Any function with `yield` becomes a generator function\n• Calling it does NOT execute the body — it returns a generator object\n• The `yield` keyword is what makes it special',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Create Generator Object',
      explanation: '• `count_up_to(3)` creates a generator object\n• "Generator started" is NOT printed yet\n• The function body is paused at the very beginning',
      startStep: 1,
      endStep: 2,
    },
    {
      title: 'First next() Call',
      explanation: '• `next(gen)` starts execution from the beginning\n• Code runs until the first `yield`\n• The value is returned, and execution pauses AT the yield',
      startStep: 3,
      endStep: 7,
    },
    {
      title: 'Second next() Call',
      explanation: '• `next(gen)` resumes execution AFTER the previous yield\n• "Resumed after yielding 1" prints\n• Code runs until the next `yield 2`',
      startStep: 8,
      endStep: 12,
    },
    {
      title: 'Third next() Call',
      explanation: '• Same pattern repeats for the third value\n• After yielding 3, the loop ends\n• "Generator exhausted" would print on the next `next()` call',
      startStep: 13,
      endStep: 17,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'addCard', columnId: 'generator', id: 'gen', title: 'count_up_to(3)', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addOutput', id: 'o1', text: 'Generator object: <generator object>', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
      { action: 'addOutput', id: 'o2', text: 'Generator started', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'addOutput', id: 'o3', text: 'About to yield 1', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'addCard', columnId: 'memory', id: 'val1', title: 'yielded: 1', statusId: 'yielding' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'removeCard', cardId: 'val1' },
      { action: 'addOutput', id: 'o4', text: 'First: 1', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'addOutput', id: 'o5', text: 'Resumed after yielding 1', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'addOutput', id: 'o6', text: 'About to yield 2', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'addCard', columnId: 'memory', id: 'val2', title: 'yielded: 2', statusId: 'yielding' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'removeCard', cardId: 'val2' },
      { action: 'addOutput', id: 'o7', text: 'Second: 2', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'addOutput', id: 'o8', text: 'Resumed after yielding 2', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'addOutput', id: 'o9', text: 'About to yield 3', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'addCard', columnId: 'memory', id: 'val3', title: 'yielded: 3', statusId: 'yielding' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'removeCard', cardId: 'val3' },
      { action: 'addOutput', id: 'o10', text: 'Third: 3', time: '0.0s' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default generatorBasics
