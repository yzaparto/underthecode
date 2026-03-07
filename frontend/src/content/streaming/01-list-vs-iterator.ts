import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `# Approach 1: Build entire list in memory
def get_all_users():
    users = []
    for i in range(1_000_000):
        users.append(f"user_{i}")
    return users  # 1M strings in memory!


# Approach 2: Yield one at a time
def stream_users():
    for i in range(1_000_000):
        yield f"user_{i}"  # One string at a time


# Compare memory usage
all_users = get_all_users()
print(f"List size: {len(all_users)}")

for user in stream_users():
    if user == "user_5":
        break
print("Done streaming")`

const listVsIterator: AnimationDefinition = {
  id: 'streaming-list-vs-iterator',
  title: 'List vs Iterator',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define List Approach',
      explanation: '• `get_all_users()` builds a complete list before returning\n• All 1 million strings must be in memory simultaneously\n• Caller waits until the entire list is built',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Define Generator Approach',
      explanation: '• `stream_users()` uses `yield` instead of building a list\n• Each value is produced on-demand when requested\n• Memory holds only one string at a time',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Execute List Approach',
      explanation: '• Calling `get_all_users()` executes the entire function\n• Memory fills with 1 million strings\n• Only then does execution return to the caller',
      startStep: 2,
      endStep: 6,
    },
    {
      title: 'Execute Generator Approach',
      explanation: '• Calling `stream_users()` creates a generator object immediately\n• No iteration happens yet — the function body is paused\n• Memory usage is near zero',
      startStep: 7,
      endStep: 8,
    },
    {
      title: 'Iterate and Break Early',
      explanation: '• The `for` loop pulls values one at a time\n• When we hit "user_5", we break out\n• The generator produced only 6 values — the rest were never computed',
      startStep: 9,
      endStep: 16,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-1' }],
    [{ action: 'highlightLine', lineId: 'line-9' }],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addCard', columnId: 'code', id: 'get-all', title: 'get_all_users()', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'addCard', columnId: 'memory', id: 'list', title: 'users = []', statusId: 'buffered' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'setStatus', cardId: 'list', statusId: 'buffered' },
      { action: 'addOutput', id: 'o1', text: 'Building list: 0...999,999', time: '0.0s' },
    ],
    [
      { action: 'addCard', columnId: 'memory', id: 'mem1', title: '1M strings (~50MB)', statusId: 'buffered', hasSpinner: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'setStatus', cardId: 'get-all', statusId: 'complete' },
      { action: 'removeCard', cardId: 'get-all' },
      { action: 'addOutput', id: 'o2', text: 'List size: 1000000', time: '2.5s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addCard', columnId: 'generator', id: 'gen', title: 'stream_users()', statusId: 'ready' },
    ],
    [
      { action: 'addCard', columnId: 'memory', id: 'mem2', title: 'Generator object (tiny)', statusId: 'ready' },
      { action: 'addOutput', id: 'o3', text: 'Generator created (no iteration yet)', time: '2.5s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'addOutput', id: 'o4', text: 'yield: user_0', time: '2.5s' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'addOutput', id: 'o5', text: 'yield: user_1', time: '2.5s' },
    ],
    [
      { action: 'addOutput', id: 'o6', text: 'yield: user_2', time: '2.5s' },
    ],
    [
      { action: 'addOutput', id: 'o7', text: 'yield: user_3', time: '2.5s' },
    ],
    [
      { action: 'addOutput', id: 'o8', text: 'yield: user_4', time: '2.5s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'addOutput', id: 'o9', text: 'yield: user_5 (break!)', time: '2.5s' },
      { action: 'setStatus', cardId: 'gen', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'gen', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addOutput', id: 'o10', text: 'Done streaming', time: '2.5s' },
      { action: 'removeCard', cardId: 'gen' },
      { action: 'removeCard', cardId: 'mem2' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default listVsIterator
