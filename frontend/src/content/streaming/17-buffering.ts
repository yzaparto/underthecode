import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `def stream_items():
    """Yields items one at a time."""
    for i in range(10):
        yield f"item_{i}"


def batch(iterable, size):
    """Collect items into fixed-size batches."""
    batch = []
    for item in iterable:
        batch.append(item)
        if len(batch) >= size:
            yield batch
            batch = []
    if batch:  # Yield remaining items
        yield batch


# Stream in batches of 3
items = stream_items()
batches = batch(items, 3)

for b in batches:
    print(f"Processing batch: {b}")`

const buffering: AnimationDefinition = {
  id: 'streaming-buffering',
  title: 'Buffering Strategies',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define Source and Batching',
      explanation: '• `stream_items()` yields items one at a time\n• `batch()` collects items into fixed-size groups\n• Batching balances latency vs throughput — more items per operation',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'Build Pipeline',
      explanation: '• We wrap the item stream with the batch generator\n• Nothing runs yet — all generators are lazy\n• The batch size of 3 is set at creation time',
      startStep: 2,
      endStep: 3,
    },
    {
      title: 'First Batch',
      explanation: '• The `for` loop pulls from batches\n• batch() pulls 3 items from stream_items(), buffers them\n• Only then does it yield the batch [item_0, item_1, item_2]',
      startStep: 4,
      endStep: 8,
    },
    {
      title: 'Remaining Batches',
      explanation: '• The pattern repeats: pull 3, buffer, yield batch\n• The final batch may be smaller if items don\'t divide evenly\n• 10 items / 3 = 3 full batches + 1 partial batch',
      startStep: 9,
      endStep: 14,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-6' }],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'addCard', columnId: 'generator', id: 'items', title: 'stream_items()', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'addCard', columnId: 'generator', id: 'batch', title: 'batch(items, 3)', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'setStatus', cardId: 'batch', statusId: 'running' },
      { action: 'setGlow', cardId: 'batch', glow: true },
    ],
    [
      { action: 'setStatus', cardId: 'items', statusId: 'running' },
      { action: 'setGlow', cardId: 'items', glow: true },
      { action: 'addCard', columnId: 'memory', id: 'buf', title: 'buffer: []', statusId: 'buffered' },
    ],
    [
      { action: 'addOutput', id: 'o1', text: 'Buffering: item_0', time: '0.0s' },
      { action: 'addOutput', id: 'o2', text: 'Buffering: item_1', time: '0.0s' },
      { action: 'addOutput', id: 'o3', text: 'Buffering: item_2', time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'items', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'items', glow: false },
      { action: 'setStatus', cardId: 'batch', statusId: 'yielding' },
      { action: 'removeCard', cardId: 'buf' },
      { action: 'addCard', columnId: 'memory', id: 'b1', title: "['item_0', 'item_1', 'item_2']", statusId: 'yielding' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'setStatus', cardId: 'batch', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'batch', glow: false },
      { action: 'removeCard', cardId: 'b1' },
      { action: 'addOutput', id: 'o4', text: "Processing batch: ['item_0', 'item_1', 'item_2']", time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'batch', statusId: 'running' },
      { action: 'setGlow', cardId: 'batch', glow: true },
      { action: 'setStatus', cardId: 'items', statusId: 'running' },
      { action: 'setGlow', cardId: 'items', glow: true },
      { action: 'addCard', columnId: 'memory', id: 'buf2', title: 'buffer: []', statusId: 'buffered' },
    ],
    [
      { action: 'addOutput', id: 'o5', text: 'Buffering: item_3, item_4, item_5', time: '0.1s' },
      { action: 'setStatus', cardId: 'items', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'items', glow: false },
    ],
    [
      { action: 'setStatus', cardId: 'batch', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'batch', glow: false },
      { action: 'removeCard', cardId: 'buf2' },
      { action: 'addOutput', id: 'o6', text: "Processing batch: ['item_3', 'item_4', 'item_5']", time: '0.1s' },
    ],
    [
      { action: 'setStatus', cardId: 'batch', statusId: 'running' },
      { action: 'setGlow', cardId: 'batch', glow: true },
      { action: 'setStatus', cardId: 'items', statusId: 'running' },
      { action: 'setGlow', cardId: 'items', glow: true },
      { action: 'addOutput', id: 'o7', text: 'Buffering: item_6, item_7, item_8', time: '0.2s' },
    ],
    [
      { action: 'addOutput', id: 'o8', text: "Processing batch: ['item_6', 'item_7', 'item_8']", time: '0.2s' },
      { action: 'setStatus', cardId: 'items', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'items', glow: false },
    ],
    [
      { action: 'addOutput', id: 'o9', text: 'Buffering: item_9 (partial batch)', time: '0.3s' },
      { action: 'addOutput', id: 'o10', text: "Processing batch: ['item_9']", time: '0.3s' },
      { action: 'setStatus', cardId: 'batch', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'batch', glow: false },
      { action: 'clearHighlights' },
    ],
  ],
}

export default buffering
