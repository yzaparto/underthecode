import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { pipelineColumns, basicsStatuses } from './layouts'

const sourceCode = `import time


def fast_producer():
    for i in range(5):
        print(f"Produced: {i}")
        yield i


def slow_consumer(items):
    for item in items:
        print(f"  Processing {item}...")
        time.sleep(0.5)  # Slow!
        yield f"Done: {item}"


# The magic: consumer controls the pace!
producer = fast_producer()
consumer = slow_consumer(producer)

for result in consumer:
    print(result)`

const backpressure: AnimationDefinition = {
  id: 'streaming-16-backpressure',
  title: 'Backpressure',
  columns: pipelineColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'The Problem',
      explanation: '• Producer is FAST (instant)\n• Consumer is SLOW (0.5s per item)\n• Without control, producer would flood consumer!',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'Build the Pipeline',
      explanation: '• Connect fast producer → slow consumer\n• With generators, consumer PULLS from producer\n• Producer can\'t run ahead!',
      startStep: 2,
      endStep: 3,
    },
    {
      title: 'Backpressure in Action',
      explanation: '• Consumer asks for item → producer provides ONE\n• Consumer processes (slow) → producer WAITS\n• No buffering, no overflow, natural flow control!',
      startStep: 4,
      endStep: 11,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'addCard', columnId: 'pipeline', id: 'fast', title: '🚀 fast_producer() — instant', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'addCard', columnId: 'pipeline', id: 'slow', title: '🐢 slow_consumer() — 0.5s each', statusId: 'paused' },
      { action: 'addCard', columnId: 'pipeline', id: 'problem', title: '❓ How to prevent flooding?', statusId: 'waiting' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'removeCard', cardId: 'problem' },
      { action: 'setStatus', cardId: 'fast', statusId: 'created' },
      { action: 'setStatus', cardId: 'slow', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addCard', columnId: 'pipeline', id: 'key', title: '🔑 Pull-based = automatic backpressure!', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'removeCard', cardId: 'key' },
      { action: 'setStatus', cardId: 'slow', statusId: 'running' },
      { action: 'setGlow', cardId: 'slow', glow: true },
      { action: 'addCard', columnId: 'pipeline', id: 'pull1', title: '📥 Consumer pulls...', statusId: 'running' },
    ],
    [
      { action: 'setStatus', cardId: 'fast', statusId: 'running' },
      { action: 'setGlow', cardId: 'fast', glow: true },
      { action: 'removeCard', cardId: 'pull1' },
      { action: 'addOutput', id: 'o1', text: 'Produced: 0', time: '0.0s' },
      { action: 'addCard', columnId: 'pipeline', id: 'p1', title: '📤 Producer yields 0', statusId: 'value' },
    ],
    [
      { action: 'setGlow', cardId: 'fast', glow: false },
      { action: 'setStatus', cardId: 'fast', statusId: 'paused' },
      { action: 'removeCard', cardId: 'p1' },
      { action: 'addOutput', id: 'o2', text: '  Processing 0...', time: '0.0s' },
      { action: 'addCard', columnId: 'pipeline', id: 'wait1', title: '⏳ Consumer processing... (0.5s)', statusId: 'running', hasSpinner: true },
      { action: 'addCard', columnId: 'pipeline', id: 'blocked', title: '🛑 Producer BLOCKED waiting', statusId: 'paused' },
    ],
    [
      { action: 'removeCard', cardId: 'wait1' },
      { action: 'removeCard', cardId: 'blocked' },
      { action: 'addOutput', id: 'o3', text: 'Done: 0', time: '0.5s' },
    ],
    [
      { action: 'setStatus', cardId: 'fast', statusId: 'running' },
      { action: 'setGlow', cardId: 'fast', glow: true },
      { action: 'addOutput', id: 'o4', text: 'Produced: 1', time: '0.5s' },
      { action: 'addCard', columnId: 'pipeline', id: 'p2', title: '📤 Producer yields 1', statusId: 'value' },
    ],
    [
      { action: 'setGlow', cardId: 'fast', glow: false },
      { action: 'setStatus', cardId: 'fast', statusId: 'paused' },
      { action: 'removeCard', cardId: 'p2' },
      { action: 'addOutput', id: 'o5', text: '  Processing 1...', time: '0.5s' },
      { action: 'addCard', columnId: 'pipeline', id: 'wait2', title: '⏳ Consumer processing... (0.5s)', statusId: 'running', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'wait2' },
      { action: 'addOutput', id: 'o6', text: 'Done: 1', time: '1.0s' },
      { action: 'addCard', columnId: 'pipeline', id: 'pattern', title: '🔄 Pattern: pull → produce → process → repeat', statusId: 'receiving' },
    ],
    [
      { action: 'setStatus', cardId: 'fast', statusId: 'done' },
      { action: 'setStatus', cardId: 'slow', statusId: 'done' },
      { action: 'setGlow', cardId: 'slow', glow: false },
      { action: 'removeCard', cardId: 'pattern' },
      { action: 'addCard', columnId: 'pipeline', id: 'win', title: '✅ No buffer overflow!', statusId: 'done' },
      { action: 'addCard', columnId: 'pipeline', id: 'win2', title: '✅ Natural flow control!', statusId: 'receiving' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default backpressure
