import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { pipelineColumns, basicsStatuses } from './layouts'

const sourceCode = `def read_data():
    for item in ["  HELLO  ", "world  ", "  TEST"]:
        yield item


def clean(items):
    for item in items:
        yield item.strip()


def lowercase(items):
    for item in items:
        yield item.lower()


# Build the pipeline!
raw = read_data()
cleaned = clean(raw)
final = lowercase(cleaned)

# Pull data through the chain
for result in final:
    print(result)`

const chainingGenerators: AnimationDefinition = {
  id: 'streaming-13-chaining',
  title: 'Chaining Generators',
  columns: pipelineColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'The Pipeline Pattern',
      explanation: '• Each generator takes an iterable as input\n• Each transforms and yields to the next\n• Data flows: read → clean → lowercase → output',
      startStep: 0,
      endStep: 2,
    },
    {
      title: 'Build the Pipeline',
      explanation: '• Connect generators by passing one to the next\n• Nothing runs yet — all lazy!\n• Just wiring up the stages',
      startStep: 3,
      endStep: 5,
    },
    {
      title: 'Data Flows Through',
      explanation: '• Pulling from `final` triggers the whole chain\n• Each item flows through all stages\n• One item at a time — no intermediate lists!',
      startStep: 6,
      endStep: 14,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-0' },
      { action: 'addCard', columnId: 'pipeline', id: 'stage1', title: '1️⃣ read_data()', statusId: 'waiting' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'addCard', columnId: 'pipeline', id: 'arrow1', title: '  ↓', statusId: 'created' },
      { action: 'addCard', columnId: 'pipeline', id: 'stage2', title: '2️⃣ clean() — strips whitespace', statusId: 'waiting' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'addCard', columnId: 'pipeline', id: 'arrow2', title: '  ↓', statusId: 'created' },
      { action: 'addCard', columnId: 'pipeline', id: 'stage3', title: '3️⃣ lowercase() — to lower', statusId: 'waiting' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'setStatus', cardId: 'stage1', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'setStatus', cardId: 'stage2', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'setStatus', cardId: 'stage3', statusId: 'created' },
      { action: 'addCard', columnId: 'pipeline', id: 'ready', title: '✨ Pipeline ready (no work done yet!)', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'removeCard', cardId: 'ready' },
      { action: 'setStatus', cardId: 'stage1', statusId: 'running' },
      { action: 'setStatus', cardId: 'stage2', statusId: 'running' },
      { action: 'setStatus', cardId: 'stage3', statusId: 'running' },
      { action: 'setGlow', cardId: 'stage3', glow: true },
    ],
    [
      { action: 'setGlow', cardId: 'stage3', glow: false },
      { action: 'setGlow', cardId: 'stage2', glow: true },
    ],
    [
      { action: 'setGlow', cardId: 'stage2', glow: false },
      { action: 'setGlow', cardId: 'stage1', glow: true },
      { action: 'addCard', columnId: 'pipeline', id: 'v1', title: '📦 "  HELLO  "', statusId: 'value' },
    ],
    [
      { action: 'setGlow', cardId: 'stage1', glow: false },
      { action: 'setGlow', cardId: 'stage2', glow: true },
      { action: 'removeCard', cardId: 'v1' },
      { action: 'addCard', columnId: 'pipeline', id: 'v2', title: '📦 "HELLO" (stripped)', statusId: 'value' },
    ],
    [
      { action: 'setGlow', cardId: 'stage2', glow: false },
      { action: 'setGlow', cardId: 'stage3', glow: true },
      { action: 'removeCard', cardId: 'v2' },
      { action: 'addCard', columnId: 'pipeline', id: 'v3', title: '📦 "hello" (lowered)', statusId: 'value' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'setGlow', cardId: 'stage3', glow: false },
      { action: 'removeCard', cardId: 'v3' },
      { action: 'addOutput', id: 'o1', text: 'hello', time: '0.0s' },
      { action: 'setStatus', cardId: 'stage1', statusId: 'paused' },
      { action: 'setStatus', cardId: 'stage2', statusId: 'paused' },
      { action: 'setStatus', cardId: 'stage3', statusId: 'paused' },
    ],
    [
      { action: 'setStatus', cardId: 'stage1', statusId: 'running' },
      { action: 'setStatus', cardId: 'stage2', statusId: 'running' },
      { action: 'setStatus', cardId: 'stage3', statusId: 'running' },
      { action: 'addCard', columnId: 'pipeline', id: 'flow2', title: '📦 "world  " → "world" → "world"', statusId: 'value' },
    ],
    [
      { action: 'removeCard', cardId: 'flow2' },
      { action: 'addOutput', id: 'o2', text: 'world', time: '0.0s' },
      { action: 'addCard', columnId: 'pipeline', id: 'flow3', title: '📦 "  TEST" → "TEST" → "test"', statusId: 'value' },
    ],
    [
      { action: 'removeCard', cardId: 'flow3' },
      { action: 'addOutput', id: 'o3', text: 'test', time: '0.0s' },
      { action: 'setStatus', cardId: 'stage1', statusId: 'done' },
      { action: 'setStatus', cardId: 'stage2', statusId: 'done' },
      { action: 'setStatus', cardId: 'stage3', statusId: 'done' },
      { action: 'addCard', columnId: 'pipeline', id: 'done', title: '✅ All data processed!', statusId: 'done' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default chainingGenerators
