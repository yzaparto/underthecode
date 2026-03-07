import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `def risky_items():
    """Yields items, might fail."""
    for i in range(5):
        if i == 2:
            raise ValueError(f"Bad item: {i}")
        yield f"item_{i}"


def safe_stream(gen):
    """Wraps generator with error handling."""
    while True:
        try:
            yield next(gen)
        except StopIteration:
            return
        except Exception as e:
            print(f"Error: {e}")
            yield "SKIPPED"


# Process with error recovery
safe = safe_stream(risky_items())

for item in safe:
    print(f"Got: {item}")`

const errorHandling: AnimationDefinition = {
  id: 'streaming-error-handling',
  title: 'Error Handling',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define Risky Generator',
      explanation: '• `risky_items()` yields some items but raises an error on item 2\n• Without error handling, the exception would kill the entire stream\n• We need a wrapper to make the stream resilient',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Define Safe Wrapper',
      explanation: '• `safe_stream()` wraps any generator with try/except\n• `StopIteration` exits cleanly (normal end)\n• Other exceptions are caught, logged, and replaced with "SKIPPED"',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Process First Items',
      explanation: '• Items 0 and 1 yield successfully\n• The safe wrapper passes them through unchanged\n• Everything works normally so far',
      startStep: 2,
      endStep: 6,
    },
    {
      title: 'Handle Error',
      explanation: '• Item 2 raises ValueError inside the inner generator\n• The safe wrapper catches it, logs the error\n• It yields "SKIPPED" instead of crashing',
      startStep: 7,
      endStep: 10,
    },
    {
      title: 'Continue After Error',
      explanation: '• The stream continues with items 3 and 4\n• Note: the generator is actually exhausted after the error\n• In this example, no more items come through after "SKIPPED"',
      startStep: 11,
      endStep: 13,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-8' }],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'addCard', columnId: 'generator', id: 'risky', title: 'risky_items()', statusId: 'ready' },
      { action: 'addCard', columnId: 'generator', id: 'safe', title: 'safe_stream(...)', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'setStatus', cardId: 'safe', statusId: 'running' },
      { action: 'setGlow', cardId: 'safe', glow: true },
    ],
    [
      { action: 'setStatus', cardId: 'risky', statusId: 'running' },
      { action: 'setGlow', cardId: 'risky', glow: true },
      { action: 'addCard', columnId: 'memory', id: 'v0', title: 'item_0', statusId: 'yielding' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'setStatus', cardId: 'risky', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'risky', glow: false },
      { action: 'setStatus', cardId: 'safe', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'safe', glow: false },
      { action: 'removeCard', cardId: 'v0' },
      { action: 'addOutput', id: 'o1', text: 'Got: item_0', time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'safe', statusId: 'running' },
      { action: 'setGlow', cardId: 'safe', glow: true },
      { action: 'setStatus', cardId: 'risky', statusId: 'running' },
      { action: 'setGlow', cardId: 'risky', glow: true },
      { action: 'addOutput', id: 'o2', text: 'Got: item_1', time: '0.0s' },
      { action: 'setStatus', cardId: 'risky', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'risky', glow: false },
      { action: 'setStatus', cardId: 'safe', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'safe', glow: false },
    ],
    [
      { action: 'setStatus', cardId: 'safe', statusId: 'running' },
      { action: 'setGlow', cardId: 'safe', glow: true },
      { action: 'setStatus', cardId: 'risky', statusId: 'running' },
      { action: 'setGlow', cardId: 'risky', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addCard', columnId: 'memory', id: 'err', title: 'ValueError raised!', statusId: 'exhausted' },
      { action: 'addOutput', id: 'o3', text: 'Inner gen raises ValueError', time: '0.1s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'setStatus', cardId: 'risky', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'risky', glow: false },
      { action: 'addOutput', id: 'o4', text: 'Error: Bad item: 2', time: '0.1s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'removeCard', cardId: 'err' },
      { action: 'addCard', columnId: 'memory', id: 'skip', title: 'SKIPPED', statusId: 'yielding' },
      { action: 'addOutput', id: 'o5', text: 'Yielding: SKIPPED', time: '0.1s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'setStatus', cardId: 'safe', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'safe', glow: false },
      { action: 'removeCard', cardId: 'skip' },
      { action: 'addOutput', id: 'o6', text: 'Got: SKIPPED', time: '0.1s' },
    ],
    [
      { action: 'setStatus', cardId: 'safe', statusId: 'running' },
      { action: 'setGlow', cardId: 'safe', glow: true },
      { action: 'addOutput', id: 'o7', text: 'Attempting next(risky)...', time: '0.2s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'addOutput', id: 'o8', text: 'StopIteration (risky exhausted)', time: '0.2s' },
      { action: 'setStatus', cardId: 'safe', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'safe', glow: false },
      { action: 'addOutput', id: 'o9', text: 'Stream complete', time: '0.2s' },
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'risky' },
      { action: 'removeCard', cardId: 'safe' },
    ],
  ],
}

export default errorHandling
