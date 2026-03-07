import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `from itertools import islice, chain, takewhile


def numbers():
    n = 0
    while True:
        yield n
        n += 1


# islice: Take first N from infinite generator
first_five = islice(numbers(), 5)
print(f"First 5: {list(first_five)}")

# chain: Concatenate multiple iterables lazily
combined = chain([1, 2], [3, 4], [5])
print(f"Chained: {list(combined)}")

# takewhile: Take while condition is true
nums = numbers()
under_5 = takewhile(lambda x: x < 5, nums)
print(f"Under 5: {list(under_5)}")`

const itertools: AnimationDefinition = {
  id: 'streaming-itertools',
  title: 'itertools Patterns',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Infinite Generator',
      explanation: '• `numbers()` yields 0, 1, 2, ... forever\n• Without limits, this would run infinitely\n• itertools provides tools to work safely with infinite streams',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'islice: Bounded Iteration',
      explanation: '• `islice(numbers(), 5)` takes only the first 5 values\n• The infinite generator is stopped after 5 yields\n• This is how you safely consume infinite streams',
      startStep: 2,
      endStep: 5,
    },
    {
      title: 'chain: Lazy Concatenation',
      explanation: '• `chain()` joins multiple iterables into one stream\n• Unlike `list1 + list2`, it does not build a new list\n• Items are yielded one at a time from each source',
      startStep: 6,
      endStep: 9,
    },
    {
      title: 'takewhile: Conditional Streaming',
      explanation: '• `takewhile()` yields items while the condition is True\n• When the condition becomes False, it stops immediately\n• The rest of the stream is never consumed',
      startStep: 10,
      endStep: 14,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'addOutput', id: 'o1', text: 'numbers() yields 0, 1, 2, ... forever', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addCard', columnId: 'generator', id: 'nums1', title: 'numbers()', statusId: 'ready' },
      { action: 'addCard', columnId: 'generator', id: 'islice', title: 'islice(..., 5)', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'setStatus', cardId: 'nums1', statusId: 'running' },
      { action: 'setStatus', cardId: 'islice', statusId: 'running' },
      { action: 'setGlow', cardId: 'islice', glow: true },
    ],
    [
      { action: 'addCard', columnId: 'memory', id: 'buf1', title: '[0, 1, 2, 3, 4]', statusId: 'buffered' },
      { action: 'addOutput', id: 'o2', text: 'islice yields: 0, 1, 2, 3, 4 (STOP)', time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'nums1', statusId: 'exhausted' },
      { action: 'setStatus', cardId: 'islice', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'islice', glow: false },
      { action: 'removeCard', cardId: 'buf1' },
      { action: 'removeCard', cardId: 'nums1' },
      { action: 'removeCard', cardId: 'islice' },
      { action: 'addOutput', id: 'o3', text: 'First 5: [0, 1, 2, 3, 4]', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addCard', columnId: 'generator', id: 'chain', title: 'chain([1,2], [3,4], [5])', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'setStatus', cardId: 'chain', statusId: 'running' },
      { action: 'setGlow', cardId: 'chain', glow: true },
    ],
    [
      { action: 'addOutput', id: 'o4', text: 'chain yields: 1, 2 (from first)', time: '0.1s' },
      { action: 'addOutput', id: 'o5', text: 'chain yields: 3, 4 (from second)', time: '0.1s' },
      { action: 'addOutput', id: 'o6', text: 'chain yields: 5 (from third)', time: '0.1s' },
    ],
    [
      { action: 'setStatus', cardId: 'chain', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'chain', glow: false },
      { action: 'removeCard', cardId: 'chain' },
      { action: 'addOutput', id: 'o7', text: 'Chained: [1, 2, 3, 4, 5]', time: '0.1s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'addCard', columnId: 'generator', id: 'nums2', title: 'numbers()', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'addCard', columnId: 'generator', id: 'take', title: 'takewhile(x < 5)', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'setStatus', cardId: 'nums2', statusId: 'running' },
      { action: 'setStatus', cardId: 'take', statusId: 'running' },
      { action: 'setGlow', cardId: 'take', glow: true },
    ],
    [
      { action: 'addOutput', id: 'o8', text: 'takewhile yields: 0, 1, 2, 3, 4', time: '0.2s' },
      { action: 'addOutput', id: 'o9', text: 'takewhile sees 5 → STOP', time: '0.2s' },
    ],
    [
      { action: 'setStatus', cardId: 'nums2', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'take', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'take', glow: false },
      { action: 'addOutput', id: 'o10', text: 'Under 5: [0, 1, 2, 3, 4]', time: '0.2s' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default itertools
