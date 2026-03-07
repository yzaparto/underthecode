import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { pipelineColumns, basicsStatuses } from './layouts'

const sourceCode = `from itertools import islice, chain, takewhile


def infinite_counter():
    n = 0
    while True:  # Forever!
        yield n
        n += 1


# islice: Take first N from infinite!
first_five = list(islice(infinite_counter(), 5))
print(f"First 5: {first_five}")

# chain: Combine multiple iterables
combined = list(chain([1, 2], [3, 4], [5]))
print(f"Chained: {combined}")

# takewhile: Take while condition true
nums = iter([1, 2, 3, 10, 4, 5])
small = list(takewhile(lambda x: x < 5, nums))
print(f"While < 5: {small}")`

const itertools: AnimationDefinition = {
  id: 'streaming-15-itertools',
  title: 'itertools — Power Tools',
  columns: pipelineColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'The itertools Module',
      explanation: '• Python\'s standard library for iterator tools\n• All lazy — work with infinite iterators!\n• Essential: islice, chain, takewhile, and more',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'islice — Slice Infinite Iterators',
      explanation: '• `islice(iterator, n)` takes first n items\n• Works on INFINITE iterators!\n• Like list slicing but lazy',
      startStep: 2,
      endStep: 4,
    },
    {
      title: 'chain — Combine Iterables',
      explanation: '• `chain(iter1, iter2, ...)` joins them\n• Lazy concatenation — no copying!\n• Yields from each in sequence',
      startStep: 5,
      endStep: 7,
    },
    {
      title: 'takewhile — Conditional Taking',
      explanation: '• `takewhile(predicate, iterable)`\n• Yields while condition is True\n• Stops at first False — doesn\'t skip!',
      startStep: 8,
      endStep: 11,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-0' },
      { action: 'addCard', columnId: 'pipeline', id: 'tools', title: '🧰 itertools essentials', statusId: 'waiting' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'removeCard', cardId: 'tools' },
      { action: 'addCard', columnId: 'pipeline', id: 'inf', title: '♾️ infinite_counter()', statusId: 'waiting' },
      { action: 'addCard', columnId: 'pipeline', id: 'inf2', title: 'yields: 0, 1, 2, 3, ... forever!', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'removeCard', cardId: 'inf' },
      { action: 'removeCard', cardId: 'inf2' },
      { action: 'addCard', columnId: 'pipeline', id: 'islice', title: '✂️ islice(infinite, 5)', statusId: 'running' },
      { action: 'setGlow', cardId: 'islice', glow: true },
    ],
    [
      { action: 'addCard', columnId: 'pipeline', id: 'take', title: 'Takes: 0, 1, 2, 3, 4 — STOP!', statusId: 'value' },
      { action: 'addCard', columnId: 'pipeline', id: 'safe', title: '✅ Infinite made safe!', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'removeCard', cardId: 'islice' },
      { action: 'removeCard', cardId: 'take' },
      { action: 'removeCard', cardId: 'safe' },
      { action: 'addOutput', id: 'o1', text: 'First 5: [0, 1, 2, 3, 4]', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'addCard', columnId: 'pipeline', id: 'chain', title: '🔗 chain([1,2], [3,4], [5])', statusId: 'running' },
      { action: 'setGlow', cardId: 'chain', glow: true },
    ],
    [
      { action: 'addCard', columnId: 'pipeline', id: 'c1', title: '[1,2] → [3,4] → [5]', statusId: 'value' },
      { action: 'addCard', columnId: 'pipeline', id: 'c2', title: '✅ Lazy concat — no copies!', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'removeCard', cardId: 'chain' },
      { action: 'removeCard', cardId: 'c1' },
      { action: 'removeCard', cardId: 'c2' },
      { action: 'addOutput', id: 'o2', text: 'Chained: [1, 2, 3, 4, 5]', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addCard', columnId: 'pipeline', id: 'nums', title: 'nums: [1, 2, 3, 10, 4, 5]', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'removeCard', cardId: 'nums' },
      { action: 'addCard', columnId: 'pipeline', id: 'tw', title: '🎯 takewhile(x < 5, nums)', statusId: 'running' },
      { action: 'setGlow', cardId: 'tw', glow: true },
    ],
    [
      { action: 'addCard', columnId: 'pipeline', id: 'tw1', title: '1 < 5 ✅ → 2 < 5 ✅ → 3 < 5 ✅', statusId: 'value' },
      { action: 'addCard', columnId: 'pipeline', id: 'tw2', title: '10 < 5 ❌ → STOP!', statusId: 'done' },
      { action: 'addCard', columnId: 'pipeline', id: 'tw3', title: '⚠️ 4, 5 never checked!', statusId: 'paused' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'removeCard', cardId: 'tw' },
      { action: 'removeCard', cardId: 'tw1' },
      { action: 'removeCard', cardId: 'tw2' },
      { action: 'removeCard', cardId: 'tw3' },
      { action: 'addOutput', id: 'o3', text: 'While < 5: [1, 2, 3]', time: '0.0s' },
      { action: 'addCard', columnId: 'pipeline', id: 'sum', title: '💡 More: dropwhile, groupby, zip_longest...', statusId: 'receiving' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default itertools
