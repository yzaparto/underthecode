import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `class CountDown:
    """A manual iterator (no generator)."""
    
    def __init__(self, start):
        self.current = start
    
    def __iter__(self):
        return self
    
    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        self.current -= 1
        return self.current + 1


# Using the iterator
countdown = CountDown(3)
iterator = iter(countdown)

print(next(iterator))  # 3
print(next(iterator))  # 2
print(next(iterator))  # 1

try:
    print(next(iterator))
except StopIteration:
    print("StopIteration raised!")`

const iteratorProtocol: AnimationDefinition = {
  id: 'streaming-iterator-protocol',
  title: 'Iterator Protocol',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define Iterator Class',
      explanation: '• An iterator must implement `__iter__()` and `__next__()`\n• `__iter__()` returns the iterator itself (enables `for` loops)\n• `__next__()` returns the next value or raises `StopIteration`',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Create Iterator',
      explanation: '• `CountDown(3)` creates an instance with `current = 3`\n• `iter(countdown)` calls `__iter__()` which returns `self`\n• The iterator is now ready to produce values',
      startStep: 1,
      endStep: 2,
    },
    {
      title: 'First next() Call',
      explanation: '• `next(iterator)` calls `__next__()` on the iterator\n• `current` is 3, so we return 3 and decrement to 2\n• State is maintained inside the object',
      startStep: 3,
      endStep: 5,
    },
    {
      title: 'Second and Third Calls',
      explanation: '• Each `next()` returns the current value and decrements\n• The iterator tracks its position internally\n• No external state management needed',
      startStep: 6,
      endStep: 9,
    },
    {
      title: 'StopIteration',
      explanation: '• When `current <= 0`, we raise `StopIteration`\n• This signals to the caller that the iterator is exhausted\n• `for` loops catch this automatically and exit cleanly',
      startStep: 10,
      endStep: 12,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'addCard', columnId: 'generator', id: 'cd', title: 'CountDown(3)', statusId: 'ready' },
      { action: 'addCard', columnId: 'memory', id: 'state', title: 'current = 3', statusId: 'buffered' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addOutput', id: 'o1', text: 'iter() calls __iter__() -> self', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'setStatus', cardId: 'cd', statusId: 'running' },
      { action: 'setGlow', cardId: 'cd', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'addOutput', id: 'o2', text: '__next__(): current=3, return 3', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'setStatus', cardId: 'cd', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'cd', glow: false },
      { action: 'addOutput', id: 'o3', text: '3', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'setStatus', cardId: 'cd', statusId: 'running' },
      { action: 'setGlow', cardId: 'cd', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'setStatus', cardId: 'state', statusId: 'buffered' },
      { action: 'addOutput', id: 'o4', text: '__next__(): current=2, return 2', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'setStatus', cardId: 'cd', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'cd', glow: false },
      { action: 'addOutput', id: 'o5', text: '2', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'setStatus', cardId: 'cd', statusId: 'running' },
      { action: 'setGlow', cardId: 'cd', glow: true },
      { action: 'addOutput', id: 'o6', text: '1', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-25' },
      { action: 'setStatus', cardId: 'cd', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'addOutput', id: 'o7', text: '__next__(): current=0, raise StopIteration', time: '0.0s' },
      { action: 'setStatus', cardId: 'cd', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'cd', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-27' },
      { action: 'addOutput', id: 'o8', text: 'StopIteration raised!', time: '0.0s' },
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'cd' },
      { action: 'removeCard', cardId: 'state' },
    ],
  ],
}

export default iteratorProtocol
