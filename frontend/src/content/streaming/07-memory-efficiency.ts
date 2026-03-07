import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { mechanicsColumns, basicsStatuses } from './layouts'

const sourceCode = `# APPROACH 1: List - stores ALL values in memory
def get_squares_list(n):
    result = []
    for i in range(n):
        result.append(i * i)
    return result


# APPROACH 2: Generator - yields ONE at a time
def get_squares_gen(n):
    for i in range(n):
        yield i * i


# With n = 1,000,000:
# List: ~40MB in memory (all at once)
# Generator: ~100 bytes (just the state)

squares_list = get_squares_list(5)
print(f"List: {squares_list}")

squares_gen = get_squares_gen(5)
print(f"Gen: {list(squares_gen)}")`

const memoryEfficiency: AnimationDefinition = {
  id: 'streaming-07-memory',
  title: 'Memory Efficiency',
  columns: mechanicsColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'The List Approach',
      explanation: '• Builds a complete list in memory\n• ALL values exist at the same time\n• Memory = O(n) — grows with data size',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'The Generator Approach',
      explanation: '• Yields values ONE at a time\n• Only ONE value exists in memory\n• Memory = O(1) — constant regardless of size!',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'List Execution',
      explanation: '• Watch the memory column fill up\n• ALL 5 values are stored\n• For 1M items, this would be ~40MB!',
      startStep: 2,
      endStep: 7,
    },
    {
      title: 'Generator Execution',
      explanation: '• Memory stays tiny\n• Each value is computed on demand\n• For 1M items, still only ~100 bytes!',
      startStep: 8,
      endStep: 13,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-1' },
      { action: 'addCard', columnId: 'state', id: 'list-approach', title: '📋 List Approach', statusId: 'waiting' },
      { action: 'addCard', columnId: 'output', id: 'list-mem', title: 'Memory: waiting...', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'removeCard', cardId: 'list-approach' },
      { action: 'addCard', columnId: 'state', id: 'gen-approach', title: '⚡ Generator Approach', statusId: 'waiting' },
      { action: 'removeCard', cardId: 'list-mem' },
      { action: 'addCard', columnId: 'output', id: 'gen-mem', title: 'Memory: waiting...', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'removeCard', cardId: 'gen-approach' },
      { action: 'removeCard', cardId: 'gen-mem' },
      { action: 'addCard', columnId: 'state', id: 'func', title: 'get_squares_list(5)', statusId: 'running' },
      { action: 'setGlow', cardId: 'func', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
      { action: 'addCard', columnId: 'output', id: 'mem1', title: '📦 Memory: []', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'removeCard', cardId: 'mem1' },
      { action: 'addCard', columnId: 'output', id: 'mem2', title: '📦 Memory: [0]', statusId: 'waiting' },
    ],
    [
      { action: 'removeCard', cardId: 'mem2' },
      { action: 'addCard', columnId: 'output', id: 'mem3', title: '📦 Memory: [0, 1, 4]', statusId: 'waiting' },
    ],
    [
      { action: 'removeCard', cardId: 'mem3' },
      { action: 'addCard', columnId: 'output', id: 'mem4', title: '📦 Memory: [0, 1, 4, 9, 16]', statusId: 'paused' },
      { action: 'addCard', columnId: 'output', id: 'warn', title: '⚠️ ALL 5 values stored!', statusId: 'paused' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'setStatus', cardId: 'func', statusId: 'done' },
      { action: 'setGlow', cardId: 'func', glow: false },
      { action: 'addOutput', id: 'o1', text: 'List: [0, 1, 4, 9, 16]', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'removeCard', cardId: 'func' },
      { action: 'removeCard', cardId: 'mem4' },
      { action: 'removeCard', cardId: 'warn' },
      { action: 'addCard', columnId: 'state', id: 'gen', title: 'get_squares_gen(5)', statusId: 'created' },
      { action: 'addCard', columnId: 'output', id: 'gmem', title: '📦 Memory: ~100 bytes', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'addCard', columnId: 'output', id: 'v1', title: '📤 Yield: 0 (then forgotten)', statusId: 'value' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'removeCard', cardId: 'v1' },
      { action: 'addCard', columnId: 'output', id: 'v2', title: '📤 Yield: 1 (then forgotten)', statusId: 'value' },
    ],
    [
      { action: 'removeCard', cardId: 'v2' },
      { action: 'addCard', columnId: 'output', id: 'v3', title: '📤 Each value: compute → yield → forget', statusId: 'value' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'done' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'removeCard', cardId: 'v3' },
      { action: 'addOutput', id: 'o2', text: 'Gen: [0, 1, 4, 9, 16]', time: '0.0s' },
      { action: 'addCard', columnId: 'output', id: 'win', title: '🏆 Same result, O(1) memory!', statusId: 'receiving' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default memoryEfficiency
