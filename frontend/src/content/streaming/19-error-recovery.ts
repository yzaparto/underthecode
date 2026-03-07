import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { expertColumns, basicsStatuses } from './layouts'

const sourceCode = `def fetch_data(urls):
    for url in urls:
        try:
            # Simulate fetch - some fail!
            if "bad" in url:
                raise ConnectionError(f"Failed: {url}")
            yield f"Data from {url}"
        except ConnectionError as e:
            yield f"ERROR: {e}"


urls = [
    "https://api.com/good1",
    "https://api.com/bad",
    "https://api.com/good2",
]

for result in fetch_data(urls):
    print(result)`

const errorRecovery: AnimationDefinition = {
  id: 'streaming-19-errors',
  title: 'Error Recovery',
  columns: expertColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'The Challenge',
      explanation: '• Processing a stream of items\n• Some items may fail (network errors, etc.)\n• Don\'t want one failure to stop everything!',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'Try/Except Inside Generator',
      explanation: '• Wrap risky operations in try/except\n• On error: yield an error result instead\n• Generator keeps going — no crash!',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Graceful Error Handling',
      explanation: '• Good URL → yields data\n• Bad URL → catches error, yields error message\n• Processing continues to next URL!',
      startStep: 3,
      endStep: 10,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-0' },
      { action: 'addCard', columnId: 'context', id: 'gen', title: 'fetch_data(urls)', statusId: 'waiting' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addCard', columnId: 'result', id: 'urls', title: '3 URLs to fetch', statusId: 'created' },
      { action: 'addCard', columnId: 'result', id: 'u1', title: '✅ good1', statusId: 'receiving' },
      { action: 'addCard', columnId: 'result', id: 'u2', title: '❌ bad', statusId: 'paused' },
      { action: 'addCard', columnId: 'result', id: 'u3', title: '✅ good2', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
      { action: 'removeCard', cardId: 'urls' },
      { action: 'removeCard', cardId: 'u1' },
      { action: 'removeCard', cardId: 'u2' },
      { action: 'removeCard', cardId: 'u3' },
      { action: 'addCard', columnId: 'result', id: 'pattern', title: '🛡️ try/except inside loop', statusId: 'waiting' },
      { action: 'addCard', columnId: 'result', id: 'pattern2', title: 'Error → yield error, continue', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'removeCard', cardId: 'pattern' },
      { action: 'removeCard', cardId: 'pattern2' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addCard', columnId: 'result', id: 'check1', title: '🔍 "bad" in "good1"? No', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'removeCard', cardId: 'check1' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'addOutput', id: 'o1', text: 'Data from https://api.com/good1', time: '0.0s' },
      { action: 'addCard', columnId: 'result', id: 'ok1', title: '✅ Success: good1', statusId: 'receiving' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'removeCard', cardId: 'ok1' },
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addCard', columnId: 'result', id: 'check2', title: '🔍 "bad" in "bad"? YES!', statusId: 'paused' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'removeCard', cardId: 'check2' },
      { action: 'addCard', columnId: 'result', id: 'err', title: '💥 ConnectionError raised!', statusId: 'paused' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'removeCard', cardId: 'err' },
      { action: 'addCard', columnId: 'result', id: 'catch', title: '🛡️ Caught by except!', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'removeCard', cardId: 'catch' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'addOutput', id: 'o2', text: 'ERROR: Failed: https://api.com/bad', time: '0.0s' },
      { action: 'addCard', columnId: 'result', id: 'recover', title: '🔄 Yielded error, continuing...', statusId: 'value' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'removeCard', cardId: 'recover' },
      { action: 'addOutput', id: 'o3', text: 'Data from https://api.com/good2', time: '0.0s' },
      { action: 'setStatus', cardId: 'gen', statusId: 'done' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addCard', columnId: 'result', id: 'win', title: '✅ All URLs processed!', statusId: 'done' },
      { action: 'addCard', columnId: 'result', id: 'win2', title: '💡 1 error, 2 successes', statusId: 'receiving' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default errorRecovery
