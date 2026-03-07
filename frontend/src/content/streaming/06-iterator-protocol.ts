import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { mechanicsColumns, basicsStatuses } from './layouts'

const sourceCode = `def nums():
    yield 1
    yield 2


gen = nums()

# What for loop does internally:
# 1. Get an iterator
iterator = iter(gen)

# 2. Call __next__() repeatedly
print(iterator.__next__())  # Same as next(iterator)
print(iterator.__next__())

# 3. Catch StopIteration to know when done
try:
    iterator.__next__()
except StopIteration:
    print("No more items!")

# That's all a for loop does!`

const iteratorProtocol: AnimationDefinition = {
  id: 'streaming-06-iterator-protocol',
  title: 'The Iterator Protocol',
  columns: mechanicsColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'The Secret Behind for Loops',
      explanation: '• `for x in something` uses the "iterator protocol"\n• Two special methods make it work:\n  - `__iter__()` — get an iterator\n  - `__next__()` — get next value',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'Step 1: Get an Iterator',
      explanation: '• `iter(gen)` calls `gen.__iter__()`\n• For generators, this returns itself\n• The iterator remembers where we are',
      startStep: 2,
      endStep: 3,
    },
    {
      title: 'Step 2: Call __next__() Repeatedly',
      explanation: '• Each `__next__()` call gets one value\n• `next(x)` is just shorthand for `x.__next__()`\n• The iterator tracks position internally',
      startStep: 4,
      endStep: 7,
    },
    {
      title: 'Step 3: StopIteration Signals Done',
      explanation: '• When no more values, `__next__()` raises StopIteration\n• `for` loops catch this automatically\n• That\'s how they know when to stop!',
      startStep: 8,
      endStep: 11,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-0' },
      { action: 'addCard', columnId: 'state', id: 'protocol', title: 'Iterator Protocol', statusId: 'waiting' },
      { action: 'addCard', columnId: 'state', id: 'p1', title: '1️⃣ __iter__() → get iterator', statusId: 'created' },
      { action: 'addCard', columnId: 'state', id: 'p2', title: '2️⃣ __next__() → get value', statusId: 'created' },
      { action: 'addCard', columnId: 'state', id: 'p3', title: '3️⃣ StopIteration → done!', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'addCard', columnId: 'output', id: 'gen', title: 'nums() → generator object', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'setGlow', cardId: 'p1', glow: true },
      { action: 'setStatus', cardId: 'p1', statusId: 'running' },
    ],
    [
      { action: 'addCard', columnId: 'output', id: 'iter', title: 'iter(gen) → same object!', statusId: 'receiving' },
      { action: 'addCard', columnId: 'output', id: 'note', title: '💡 Generators ARE iterators', statusId: 'waiting' },
      { action: 'setGlow', cardId: 'p1', glow: false },
      { action: 'setStatus', cardId: 'p1', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'setGlow', cardId: 'p2', glow: true },
      { action: 'setStatus', cardId: 'p2', statusId: 'running' },
      { action: 'removeCard', cardId: 'note' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-1' },
      { action: 'addOutput', id: 'o1', text: '1', time: '0.0s' },
      { action: 'addCard', columnId: 'output', id: 'v1', title: '__next__() → 1', statusId: 'value' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'removeCard', cardId: 'v1' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
      { action: 'addOutput', id: 'o2', text: '2', time: '0.0s' },
      { action: 'addCard', columnId: 'output', id: 'v2', title: '__next__() → 2', statusId: 'value' },
      { action: 'setGlow', cardId: 'p2', glow: false },
      { action: 'setStatus', cardId: 'p2', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'removeCard', cardId: 'v2' },
      { action: 'setGlow', cardId: 'p3', glow: true },
      { action: 'setStatus', cardId: 'p3', statusId: 'running' },
    ],
    [
      { action: 'addCard', columnId: 'output', id: 'stop', title: '🛑 StopIteration raised!', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'addOutput', id: 'o3', text: 'No more items!', time: '0.0s' },
      { action: 'setGlow', cardId: 'p3', glow: false },
      { action: 'setStatus', cardId: 'p3', statusId: 'done' },
      { action: 'addCard', columnId: 'output', id: 'summary', title: '✨ for loop does exactly this!', statusId: 'receiving' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default iteratorProtocol
