import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `def resilient_gen():
    """Generator with cleanup."""
    try:
        count = 0
        while True:
            count += 1
            yield count
    except ValueError as e:
        print(f"Caught: {e}")
        yield -1  # Recovery value
    finally:
        print("Cleanup executed!")


gen = resilient_gen()
print(f"Value: {next(gen)}")
print(f"Value: {next(gen)}")

# Inject an exception
result = gen.throw(ValueError("Invalid!"))
print(f"After throw: {result}")

# Close the generator
gen.close()
print("Generator closed")`

const throwClose: AnimationDefinition = {
  id: 'streaming-throw-close',
  title: 'throw() and close()',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define Resilient Generator',
      explanation: '• `try/except/finally` inside the generator handles errors\n• `except` catches thrown exceptions and can recover\n• `finally` always runs — perfect for cleanup',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Normal Operation',
      explanation: '• The generator yields 1, then 2\n• Each `next()` increments and yields the count\n• So far, everything is working normally',
      startStep: 1,
      endStep: 5,
    },
    {
      title: 'Throw Exception',
      explanation: '• `gen.throw(ValueError("Invalid!"))` injects an exception\n• The exception is raised AT the current yield point\n• The `except` block catches it and yields a recovery value',
      startStep: 6,
      endStep: 10,
    },
    {
      title: 'Close Generator',
      explanation: '• `gen.close()` raises `GeneratorExit` inside the generator\n• This triggers the `finally` block for cleanup\n• The generator is permanently closed',
      startStep: 11,
      endStep: 13,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'addCard', columnId: 'generator', id: 'gen', title: 'resilient_gen()', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'addCard', columnId: 'memory', id: 'count', title: 'count = 1', statusId: 'yielding' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o1', text: 'Value: 1', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o2', text: 'Value: 2', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'addOutput', id: 'o3', text: 'gen.throw(ValueError("Invalid!"))', time: '0.0s' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'addOutput', id: 'o4', text: 'Exception raised at yield', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'addOutput', id: 'o5', text: 'Caught: Invalid!', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'addOutput', id: 'o6', text: 'yield -1 (recovery)', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o7', text: 'After throw: -1', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'addOutput', id: 'o8', text: 'gen.close()', time: '0.0s' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addOutput', id: 'o9', text: 'Cleanup executed!', time: '0.0s' },
      { action: 'setStatus', cardId: 'gen', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'gen', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'addOutput', id: 'o10', text: 'Generator closed', time: '0.0s' },
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'gen' },
      { action: 'removeCard', cardId: 'count' },
    ],
  ],
}

export default throwClose
