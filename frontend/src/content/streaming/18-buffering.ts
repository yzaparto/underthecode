import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { expertColumns, basicsStatuses } from './layouts'

const sourceCode = `def read_items():
    for i in range(10):
        yield f"item_{i}"


def batch(items, size=3):
    """Collect items into batches"""
    batch = []
    for item in items:
        batch.append(item)
        if len(batch) >= size:
            yield batch
            batch = []
    if batch:  # Don't forget leftovers!
        yield batch


# Process in batches of 3
for batch in batch(read_items(), 3):
    print(f"Processing batch: {batch}")`

const buffering: AnimationDefinition = {
  id: 'streaming-18-buffering',
  title: 'Buffering & Batching',
  columns: expertColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Why Batching?',
      explanation: '• Processing one item at a time has overhead\n• Database calls, API requests, etc. — batch is faster!\n• Trade latency for throughput',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'The batch() Generator',
      explanation: '• Collects items until batch is full\n• Yields the batch, starts fresh\n• Handles leftover items at the end',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Building Batches',
      explanation: '• Watch the buffer fill up\n• When size=3 is reached, yield the batch\n• Buffer resets, repeat',
      startStep: 3,
      endStep: 8,
    },
    {
      title: 'Handling Leftovers',
      explanation: '• 10 items ÷ 3 = 3 batches + 1 leftover\n• Don\'t forget `if batch: yield batch`\n• Common bug: losing the last partial batch!',
      startStep: 9,
      endStep: 11,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-0' },
      { action: 'addCard', columnId: 'context', id: 'source', title: 'read_items()', statusId: 'waiting' },
      { action: 'addCard', columnId: 'result', id: 'items', title: 'yields: item_0 ... item_9', statusId: 'created' },
    ],
    [
      { action: 'addCard', columnId: 'result', id: 'why', title: '💡 10 single operations = slow', statusId: 'paused' },
      { action: 'addCard', columnId: 'result', id: 'why2', title: '🚀 4 batch operations = fast!', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'removeCard', cardId: 'items' },
      { action: 'removeCard', cardId: 'why' },
      { action: 'removeCard', cardId: 'why2' },
      { action: 'addCard', columnId: 'context', id: 'batch', title: 'batch(items, size=3)', statusId: 'running' },
      { action: 'addCard', columnId: 'result', id: 'buffer', title: '📦 Buffer: []', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'setGlow', cardId: 'batch', glow: true },
      { action: 'setStatus', cardId: 'source', statusId: 'running' },
    ],
    [
      { action: 'removeCard', cardId: 'buffer' },
      { action: 'addCard', columnId: 'result', id: 'buffer', title: '📦 Buffer: [item_0]', statusId: 'waiting' },
    ],
    [
      { action: 'removeCard', cardId: 'buffer' },
      { action: 'addCard', columnId: 'result', id: 'buffer', title: '📦 Buffer: [item_0, item_1]', statusId: 'waiting' },
    ],
    [
      { action: 'removeCard', cardId: 'buffer' },
      { action: 'addCard', columnId: 'result', id: 'buffer', title: '📦 Buffer: [item_0, item_1, item_2]', statusId: 'value' },
      { action: 'addCard', columnId: 'result', id: 'full', title: '✅ Size=3 reached!', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'setStatus', cardId: 'batch', statusId: 'paused' },
      { action: 'setGlow', cardId: 'batch', glow: false },
      { action: 'removeCard', cardId: 'full' },
      { action: 'addOutput', id: 'o1', text: "Processing batch: ['item_0', 'item_1', 'item_2']", time: '0.0s' },
      { action: 'removeCard', cardId: 'buffer' },
      { action: 'addCard', columnId: 'result', id: 'buffer', title: '📦 Buffer: [] (reset)', statusId: 'created' },
    ],
    [
      { action: 'setStatus', cardId: 'batch', statusId: 'running' },
      { action: 'setGlow', cardId: 'batch', glow: true },
      { action: 'removeCard', cardId: 'buffer' },
      { action: 'addCard', columnId: 'result', id: 'buffer', title: '📦 [item_3, item_4, item_5]', statusId: 'value' },
      { action: 'addOutput', id: 'o2', text: "Processing batch: ['item_3', 'item_4', 'item_5']", time: '0.0s' },
      { action: 'removeCard', cardId: 'buffer' },
      { action: 'addCard', columnId: 'result', id: 'buffer', title: '📦 [item_6, item_7, item_8]', statusId: 'value' },
      { action: 'addOutput', id: 'o3', text: "Processing batch: ['item_6', 'item_7', 'item_8']", time: '0.0s' },
    ],
    [
      { action: 'removeCard', cardId: 'buffer' },
      { action: 'addCard', columnId: 'result', id: 'buffer', title: '📦 Buffer: [item_9]', statusId: 'paused' },
      { action: 'addCard', columnId: 'result', id: 'leftover', title: '⚠️ Leftover! Only 1 item', statusId: 'paused' },
      { action: 'setStatus', cardId: 'source', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'removeCard', cardId: 'leftover' },
      { action: 'addCard', columnId: 'result', id: 'check', title: '✅ if batch: yield batch', statusId: 'receiving' },
    ],
    [
      { action: 'addOutput', id: 'o4', text: "Processing batch: ['item_9']", time: '0.0s' },
      { action: 'setStatus', cardId: 'batch', statusId: 'done' },
      { action: 'setGlow', cardId: 'batch', glow: false },
      { action: 'removeCard', cardId: 'buffer' },
      { action: 'removeCard', cardId: 'check' },
      { action: 'addCard', columnId: 'result', id: 'win', title: '✅ 10 items → 4 batches', statusId: 'done' },
      { action: 'addCard', columnId: 'result', id: 'win2', title: '💡 No items lost!', statusId: 'receiving' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default buffering
