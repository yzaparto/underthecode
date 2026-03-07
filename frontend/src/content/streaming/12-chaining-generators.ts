import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `def read_lines():
    """Stage 1: Produce lines."""
    for line in ["hello", "WORLD", "  test  "]:
        yield line


def normalize(lines):
    """Stage 2: Clean and lowercase."""
    for line in lines:
        yield line.strip().lower()


def add_prefix(lines, prefix):
    """Stage 3: Add prefix."""
    for line in lines:
        yield f"{prefix}: {line}"


# Build the pipeline
raw = read_lines()
cleaned = normalize(raw)
prefixed = add_prefix(cleaned, "OUT")

# Pull through the entire chain
for result in prefixed:
    print(result)`

const chainingGenerators: AnimationDefinition = {
  id: 'streaming-chaining-generators',
  title: 'Chaining Generators',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define Pipeline Stages',
      explanation: '• `read_lines()` produces raw data\n• `normalize()` transforms each item (strip + lowercase)\n• `add_prefix()` adds a prefix to each item\n• Each stage is a generator that consumes another generator',
      startStep: 0,
      endStep: 2,
    },
    {
      title: 'Build the Pipeline',
      explanation: '• We chain generators by passing one to the next\n• `raw → cleaned → prefixed` forms a pipeline\n• Nothing executes yet — we have just set up the chain',
      startStep: 3,
      endStep: 6,
    },
    {
      title: 'First Item Through Pipeline',
      explanation: '• The `for` loop pulls from `prefixed`\n• `prefixed` pulls from `cleaned`, which pulls from `raw`\n• "hello" flows through: raw → cleaned → prefixed → output',
      startStep: 7,
      endStep: 11,
    },
    {
      title: 'Remaining Items',
      explanation: '• Each item follows the same path through all stages\n• "WORLD" becomes "world", "  test  " becomes "test"\n• The pipeline processes items one at a time, not in batches',
      startStep: 12,
      endStep: 17,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-6' }],
    [{ action: 'highlightLine', lineId: 'line-12' }],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addCard', columnId: 'generator', id: 'raw', title: 'read_lines()', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'addCard', columnId: 'generator', id: 'cleaned', title: 'normalize(raw)', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'addCard', columnId: 'generator', id: 'prefixed', title: 'add_prefix(cleaned)', statusId: 'ready' },
    ],
    [
      { action: 'addOutput', id: 'o1', text: 'Pipeline built (nothing executed)', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'setStatus', cardId: 'prefixed', statusId: 'running' },
      { action: 'setGlow', cardId: 'prefixed', glow: true },
    ],
    [
      { action: 'setStatus', cardId: 'cleaned', statusId: 'running' },
      { action: 'setGlow', cardId: 'cleaned', glow: true },
    ],
    [
      { action: 'setStatus', cardId: 'raw', statusId: 'running' },
      { action: 'setGlow', cardId: 'raw', glow: true },
      { action: 'addCard', columnId: 'memory', id: 'v1', title: '"hello"', statusId: 'yielding' },
    ],
    [
      { action: 'setStatus', cardId: 'raw', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'raw', glow: false },
      { action: 'addOutput', id: 'o2', text: 'raw yields "hello"', time: '0.0s' },
      { action: 'addOutput', id: 'o3', text: 'cleaned yields "hello"', time: '0.0s' },
      { action: 'addOutput', id: 'o4', text: 'prefixed yields "OUT: hello"', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'setStatus', cardId: 'cleaned', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'cleaned', glow: false },
      { action: 'setStatus', cardId: 'prefixed', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'prefixed', glow: false },
      { action: 'removeCard', cardId: 'v1' },
      { action: 'addOutput', id: 'o5', text: 'OUT: hello', time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'prefixed', statusId: 'running' },
      { action: 'setGlow', cardId: 'prefixed', glow: true },
      { action: 'setStatus', cardId: 'cleaned', statusId: 'running' },
      { action: 'setGlow', cardId: 'cleaned', glow: true },
      { action: 'setStatus', cardId: 'raw', statusId: 'running' },
      { action: 'setGlow', cardId: 'raw', glow: true },
    ],
    [
      { action: 'addCard', columnId: 'memory', id: 'v2', title: '"WORLD"→"world"', statusId: 'yielding' },
      { action: 'addOutput', id: 'o6', text: 'raw yields "WORLD"', time: '0.1s' },
      { action: 'addOutput', id: 'o7', text: 'cleaned yields "world"', time: '0.1s' },
    ],
    [
      { action: 'setStatus', cardId: 'raw', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'raw', glow: false },
      { action: 'setStatus', cardId: 'cleaned', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'cleaned', glow: false },
      { action: 'setStatus', cardId: 'prefixed', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'prefixed', glow: false },
      { action: 'removeCard', cardId: 'v2' },
      { action: 'addOutput', id: 'o8', text: 'OUT: world', time: '0.1s' },
    ],
    [
      { action: 'setStatus', cardId: 'prefixed', statusId: 'running' },
      { action: 'setGlow', cardId: 'prefixed', glow: true },
      { action: 'setStatus', cardId: 'cleaned', statusId: 'running' },
      { action: 'setGlow', cardId: 'cleaned', glow: true },
      { action: 'setStatus', cardId: 'raw', statusId: 'running' },
      { action: 'setGlow', cardId: 'raw', glow: true },
    ],
    [
      { action: 'addCard', columnId: 'memory', id: 'v3', title: '"  test  "→"test"', statusId: 'yielding' },
      { action: 'addOutput', id: 'o9', text: 'raw yields "  test  "', time: '0.2s' },
      { action: 'addOutput', id: 'o10', text: 'cleaned yields "test"', time: '0.2s' },
      { action: 'addOutput', id: 'o11', text: 'OUT: test', time: '0.2s' },
      { action: 'setStatus', cardId: 'raw', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'raw', glow: false },
      { action: 'setStatus', cardId: 'cleaned', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'cleaned', glow: false },
      { action: 'setStatus', cardId: 'prefixed', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'prefixed', glow: false },
      { action: 'removeCard', cardId: 'v3' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default chainingGenerators
