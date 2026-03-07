import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `import asyncio


async def async_counter(n):
    """Async generator: async def + yield."""
    for i in range(n):
        await asyncio.sleep(0.5)
        yield i


async def main():
    # async for consumes async generators
    async for num in async_counter(4):
        print(f"Got: {num}")


asyncio.run(main())`

const asyncGenerators: AnimationDefinition = {
  id: 'streaming-async-generators',
  title: 'Async Generators',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define Async Generator',
      explanation: '• `async def` + `yield` creates an async generator\n• It can use `await` between yields\n• This is the foundation for async streaming',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'Start Event Loop',
      explanation: '• `asyncio.run(main())` starts the event loop\n• `async for` is required to consume async generators\n• Regular `for` loops cannot iterate async generators',
      startStep: 2,
      endStep: 3,
    },
    {
      title: 'First Value',
      explanation: '• The async generator starts executing\n• It hits `await asyncio.sleep(0.5)` and suspends\n• After 0.5s, it yields 0 and the consumer receives it',
      startStep: 4,
      endStep: 7,
    },
    {
      title: 'Streaming Values',
      explanation: '• Each iteration: await sleep, yield value\n• Between yields, other async tasks could run (not shown)\n• This is how LLM token streaming works under the hood',
      startStep: 8,
      endStep: 15,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-3' }],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addCard', columnId: 'code', id: 'loop', title: 'Event Loop', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addCard', columnId: 'generator', id: 'gen', title: 'async_counter(4)', statusId: 'ready' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addCard', columnId: 'memory', id: 'sleep', title: 'await sleep(0.5)', statusId: 'buffered', hasSpinner: true },
      { action: 'addOutput', id: 'o1', text: 'await asyncio.sleep(0.5)...', time: '0.0s' },
    ],
    [
      { action: 'removeCard', cardId: 'sleep' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'addCard', columnId: 'memory', id: 'v0', title: 'yield 0', statusId: 'yielding' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'removeCard', cardId: 'v0' },
      { action: 'addOutput', id: 'o2', text: 'Got: 0', time: '0.5s' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addCard', columnId: 'memory', id: 'sleep2', title: 'await sleep(0.5)', statusId: 'buffered', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'sleep2' },
      { action: 'setStatus', cardId: 'gen', statusId: 'yielding' },
      { action: 'highlightLine', lineId: 'line-7' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'addOutput', id: 'o3', text: 'Got: 1', time: '1.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
      { action: 'addOutput', id: 'o4', text: '(await sleep...)', time: '1.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o5', text: 'Got: 2', time: '1.5s' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
      { action: 'addOutput', id: 'o6', text: '(await sleep...)', time: '1.5s' },
    ],
    [
      { action: 'setStatus', cardId: 'gen', statusId: 'exhausted' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o7', text: 'Got: 3', time: '2.0s' },
      { action: 'addOutput', id: 'o8', text: '(generator exhausted)', time: '2.0s' },
      { action: 'setStatus', cardId: 'loop', statusId: 'complete' },
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'gen' },
    ],
  ],
}

export default asyncGenerators
