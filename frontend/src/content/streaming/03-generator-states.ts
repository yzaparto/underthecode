import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `import inspect


def simple_gen():
    yield 1
    yield 2


gen = simple_gen()

# State 1: GEN_CREATED (never started)
print(f"State: {inspect.getgeneratorstate(gen)}")

# State 2: GEN_RUNNING (inside generator)
# (can only be observed from within)

# State 3: GEN_SUSPENDED (paused at yield)
next(gen)
print(f"State: {inspect.getgeneratorstate(gen)}")

# Exhaust the generator
next(gen)
try:
    next(gen)
except StopIteration:
    pass

# State 4: GEN_CLOSED (exhausted)
print(f"State: {inspect.getgeneratorstate(gen)}")`

const generatorStates: AnimationDefinition = {
  id: 'streaming-generator-states',
  title: 'Generator State Machine',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Import and Define',
      explanation: '• The `inspect` module lets us observe generator internals\n• `simple_gen` is a minimal generator that yields two values\n• We will track its state through all four possible states',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'GEN_CREATED',
      explanation: '• Immediately after creation, the generator is in `GEN_CREATED`\n• No code inside the generator has run yet\n• This is the "ready but not started" state',
      startStep: 2,
      endStep: 3,
    },
    {
      title: 'GEN_RUNNING',
      explanation: '• While code inside the generator executes, state is `GEN_RUNNING`\n• You can only observe this from INSIDE the generator\n• The moment it yields or returns, it leaves this state',
      startStep: 4,
      endStep: 4,
    },
    {
      title: 'GEN_SUSPENDED',
      explanation: '• After yielding, the generator is in `GEN_SUSPENDED`\n• It is paused at the yield statement, waiting for the next `next()` call\n• Local variables are preserved in this state',
      startStep: 5,
      endStep: 7,
    },
    {
      title: 'Exhaust Generator',
      explanation: '• We call `next()` to get the second value\n• The next `next()` raises `StopIteration` because there are no more yields\n• We catch it to prevent the program from crashing',
      startStep: 8,
      endStep: 12,
    },
    {
      title: 'GEN_CLOSED',
      explanation: '• After exhaustion or explicit `.close()`, state is `GEN_CLOSED`\n• The generator can never produce more values\n• Any further `next()` calls will raise `StopIteration`',
      startStep: 13,
      endStep: 14,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-3' }],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'addCard', columnId: 'generator', id: 'gen', title: 'simple_gen()', statusId: 'ready' },
      { action: 'addCard', columnId: 'memory', id: 'state', title: 'State: GEN_CREATED', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addOutput', id: 'o1', text: 'State: GEN_CREATED', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'setStatus', cardId: 'state', statusId: 'running' },
      { action: 'addOutput', id: 'o2', text: '(GEN_RUNNING only visible from inside)', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'addOutput', id: 'o3', text: 'yield 1', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'setStatus', cardId: 'state', statusId: 'suspended' },
      { action: 'addOutput', id: 'o4', text: 'State: GEN_SUSPENDED', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'addOutput', id: 'o5', text: 'yield 2', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'addOutput', id: 'o6', text: 'StopIteration raised and caught', time: '0.0s' },
      { action: 'setStatus', cardId: 'gen', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'gen', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-28' },
      { action: 'setStatus', cardId: 'state', statusId: 'exhausted' },
    ],
    [
      { action: 'addOutput', id: 'o7', text: 'State: GEN_CLOSED', time: '0.0s' },
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'gen' },
    ],
  ],
}

export default generatorStates
