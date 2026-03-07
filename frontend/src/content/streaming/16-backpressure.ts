import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `import time
from collections import deque


def fast_producer():
    """Produces data faster than consumer."""
    for i in range(10):
        print(f"Produced: {i}")
        yield i


def slow_consumer(items):
    """Consumes data slowly."""
    for item in items:
        time.sleep(0.3)  # Slow processing
        print(f"Consumed: {item}")
        yield item


# Natural backpressure with generators
producer = fast_producer()
consumer = slow_consumer(producer)

# Pull-based: consumer controls the pace
for result in consumer:
    if result >= 3:
        break`

const backpressure: AnimationDefinition = {
  id: 'streaming-backpressure',
  title: 'Backpressure',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define Producer and Consumer',
      explanation: '• `fast_producer()` yields values quickly\n• `slow_consumer()` processes each value slowly (0.3s delay)\n• In a push model, the producer would overwhelm the consumer',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'Build Pipeline',
      explanation: '• We connect producer to consumer\n• Nothing runs yet — generators are lazy\n• The consumer wraps the producer',
      startStep: 2,
      endStep: 3,
    },
    {
      title: 'Pull-Based Flow',
      explanation: '• The `for` loop pulls from consumer\n• Consumer pulls from producer only when ready\n• Producer is blocked waiting for consumer — natural backpressure',
      startStep: 4,
      endStep: 11,
    },
    {
      title: 'Early Termination',
      explanation: '• We break after processing 4 items (0, 1, 2, 3)\n• Producer never produces items 4-9\n• Pull-based streaming = automatic flow control',
      startStep: 12,
      endStep: 13,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-4' }],
    [{ action: 'highlightLine', lineId: 'line-11' }],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'addCard', columnId: 'generator', id: 'producer', title: 'fast_producer()', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'addCard', columnId: 'generator', id: 'consumer', title: 'slow_consumer(producer)', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'setStatus', cardId: 'consumer', statusId: 'running' },
      { action: 'setGlow', cardId: 'consumer', glow: true },
    ],
    [
      { action: 'setStatus', cardId: 'producer', statusId: 'running' },
      { action: 'setGlow', cardId: 'producer', glow: true },
      { action: 'addOutput', id: 'o1', text: 'Produced: 0', time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'producer', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'producer', glow: false },
      { action: 'addCard', columnId: 'memory', id: 'buf', title: 'Processing: 0', statusId: 'buffered', hasSpinner: true },
      { action: 'addOutput', id: 'o2', text: '(consumer processing...)', time: '0.0s' },
    ],
    [
      { action: 'setSpinner', cardId: 'buf', hasSpinner: false },
      { action: 'addOutput', id: 'o3', text: 'Consumed: 0', time: '0.3s' },
      { action: 'setStatus', cardId: 'consumer', statusId: 'yielding' },
    ],
    [
      { action: 'removeCard', cardId: 'buf' },
      { action: 'setStatus', cardId: 'consumer', statusId: 'running' },
      { action: 'setStatus', cardId: 'producer', statusId: 'running' },
      { action: 'setGlow', cardId: 'producer', glow: true },
      { action: 'addOutput', id: 'o4', text: 'Produced: 1', time: '0.3s' },
    ],
    [
      { action: 'setStatus', cardId: 'producer', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'producer', glow: false },
      { action: 'addCard', columnId: 'memory', id: 'buf2', title: 'Processing: 1', statusId: 'buffered', hasSpinner: true },
    ],
    [
      { action: 'setSpinner', cardId: 'buf2', hasSpinner: false },
      { action: 'addOutput', id: 'o5', text: 'Consumed: 1', time: '0.6s' },
      { action: 'removeCard', cardId: 'buf2' },
      { action: 'addOutput', id: 'o6', text: 'Produced: 2 → Consumed: 2', time: '0.9s' },
    ],
    [
      { action: 'addOutput', id: 'o7', text: 'Produced: 3 → Consumed: 3', time: '1.2s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-25' },
      { action: 'addOutput', id: 'o8', text: 'break! (result >= 3)', time: '1.2s' },
    ],
    [
      { action: 'setStatus', cardId: 'producer', statusId: 'exhausted' },
      { action: 'setStatus', cardId: 'consumer', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'consumer', glow: false },
      { action: 'addOutput', id: 'o9', text: 'Items 4-9 never produced!', time: '1.2s' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default backpressure
