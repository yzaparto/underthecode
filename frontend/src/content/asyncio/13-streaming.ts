import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio


async def stream_llm(prompt):
    print(f"Streaming: {prompt}")
    for token in ["Hello", " world", "!", " How", " can"]:
        await asyncio.sleep(0.5)
        yield token


async def main():
    tokens = []
    async for token in stream_llm("Hi"):
        print(f"Token: {token}")
        tokens.append(token)
    print(f"Full: {''.join(tokens)}")


asyncio.run(main())`

// line-0:  import asyncio
// line-1:  (empty)
// line-2:  (empty)
// line-3:  async def stream_llm(prompt):
// line-4:      print(f"Streaming: {prompt}")
// line-5:      for token in ["Hello", " world", "!", " How", " can"]:
// line-6:          await asyncio.sleep(0.5)
// line-7:          yield token
// line-8:  (empty)
// line-9:  (empty)
// line-10: async def main():
// line-11:     tokens = []
// line-12:     async for token in stream_llm("Hi"):
// line-13:         print(f"Token: {token}")
// line-14:         tokens.append(token)
// line-15:     print(f"Full: {''.join(tokens)}")
// line-16: (empty)
// line-17: (empty)
// line-18: asyncio.run(main())

const streaming: AnimationDefinition = {
  id: 'asyncio-streaming',
  title: 'Streaming with async for',
  columns: asyncioColumns,
  statuses: asyncioStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Import',
      explanation: '• Loading the `asyncio` module',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Define stream_llm',
      explanation:
        '• An async generator that yields tokens one at a time\n• Each `yield` pauses the generator and sends a value to the caller\n• `await asyncio.sleep(0.5)` simulates network latency per token',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define main',
      explanation:
        '• `async for` iterates an async generator — it `await`s each value\n• Collects tokens into a list, then joins them at the end',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Start the Event Loop',
      explanation:
        '• `asyncio.run(main())` creates the event loop and enters `main()`',
      startStep: 3,
      endStep: 3,
    },
    {
      title: 'Enter main + Start Streaming',
      explanation:
        '• `tokens = []` initialises the accumulator\n• `async for` calls `stream_llm("Hi")` — the generator starts executing\n• It prints "Streaming: Hi" and enters the `for` loop',
      startStep: 4,
      endStep: 6,
    },
    {
      title: 'Token 1: "Hello"',
      explanation:
        '• The generator hits `await asyncio.sleep(0.5)` and suspends\n• After 0.5s the sleep completes — the generator resumes and yields "Hello"\n• `main()` receives the token and prints it',
      startStep: 7,
      endStep: 9,
    },
    {
      title: 'Token 2: " world"',
      explanation:
        '• Same cycle: sleep → wake → yield " world"\n• The generator card stays alive in the loop, toggling running ↔ suspended',
      startStep: 10,
      endStep: 12,
    },
    {
      title: 'Token 3: "!"',
      explanation: '• Third iteration — yields "!"',
      startStep: 13,
      endStep: 15,
    },
    {
      title: 'Token 4: " How"',
      explanation: '• Fourth iteration — yields " How"',
      startStep: 16,
      endStep: 18,
    },
    {
      title: 'Token 5: " can"',
      explanation: '• Fifth and final iteration — yields " can"',
      startStep: 19,
      endStep: 21,
    },
    {
      title: 'Stream Ends',
      explanation:
        '• The generator\'s `for` loop is exhausted — it returns implicitly\n• `async for` catches `StopAsyncIteration` and exits the loop\n• `main()` joins all tokens and prints the full response',
      startStep: 22,
      endStep: 24,
    },
  ],

  steps: [
    // Phase: Import (step 0)
    [{ action: 'highlightLine', lineId: 'line-0' }],

    // Phase: Define stream_llm (step 1)
    [{ action: 'highlightLine', lineId: 'line-3' }],

    // Phase: Define main (step 2)
    [{ action: 'highlightLine', lineId: 'line-10' }],

    // Phase: Start Event Loop (step 3)
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addCard', columnId: 'loop', id: 'main', title: 'main()', statusId: 'running' },
    ],

    // Phase: Enter main + Start Streaming (steps 4–6)
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-10', type: 'active' },
        { lineId: 'line-11', type: 'active' },
      ]},
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'addCard', columnId: 'loop', id: 'stream', title: 'stream_llm("Hi")', statusId: 'running' },
      { action: 'setGlow', cardId: 'stream', glow: true },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
    ],
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-4', type: 'active' },
        { lineId: 'line-5', type: 'active' },
      ]},
      { action: 'addOutput', id: 'o1', text: 'Streaming: Hi', time: '0.0s' },
    ],

    // Phase: Token 1 "Hello" (steps 7–9)
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'setStatus', cardId: 'stream', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'stream', glow: false },
      { action: 'addCard', columnId: 'io', id: 'sleep-1', title: 'sleep(0.5)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'sleep-1' },
      { action: 'setStatus', cardId: 'stream', statusId: 'running' },
      { action: 'setGlow', cardId: 'stream', glow: true },
      { action: 'highlightLine', lineId: 'line-7' },
    ],
    [
      { action: 'setStatus', cardId: 'stream', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'stream', glow: false },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'highlightLines', entries: [
        { lineId: 'line-13', type: 'active' },
        { lineId: 'line-14', type: 'active' },
      ]},
      { action: 'addOutput', id: 'o2', text: 'Token: Hello', time: '0.5s' },
    ],

    // Phase: Token 2 " world" (steps 10–12)
    [
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'stream', statusId: 'running' },
      { action: 'setGlow', cardId: 'stream', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addCard', columnId: 'io', id: 'sleep-2', title: 'sleep(0.5)', statusId: 'io', hasSpinner: true },
      { action: 'setStatus', cardId: 'stream', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'stream', glow: false },
    ],
    [
      { action: 'removeCard', cardId: 'sleep-2' },
      { action: 'setStatus', cardId: 'stream', statusId: 'running' },
      { action: 'setGlow', cardId: 'stream', glow: true },
      { action: 'highlightLine', lineId: 'line-7' },
    ],
    [
      { action: 'setStatus', cardId: 'stream', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'stream', glow: false },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'highlightLines', entries: [
        { lineId: 'line-13', type: 'active' },
        { lineId: 'line-14', type: 'active' },
      ]},
      { action: 'addOutput', id: 'o3', text: 'Token:  world', time: '1.0s' },
    ],

    // Phase: Token 3 "!" (steps 13–15)
    [
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'stream', statusId: 'running' },
      { action: 'setGlow', cardId: 'stream', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addCard', columnId: 'io', id: 'sleep-3', title: 'sleep(0.5)', statusId: 'io', hasSpinner: true },
      { action: 'setStatus', cardId: 'stream', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'stream', glow: false },
    ],
    [
      { action: 'removeCard', cardId: 'sleep-3' },
      { action: 'setStatus', cardId: 'stream', statusId: 'running' },
      { action: 'setGlow', cardId: 'stream', glow: true },
      { action: 'highlightLine', lineId: 'line-7' },
    ],
    [
      { action: 'setStatus', cardId: 'stream', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'stream', glow: false },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'highlightLines', entries: [
        { lineId: 'line-13', type: 'active' },
        { lineId: 'line-14', type: 'active' },
      ]},
      { action: 'addOutput', id: 'o4', text: 'Token: !', time: '1.5s' },
    ],

    // Phase: Token 4 " How" (steps 16–18)
    [
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'stream', statusId: 'running' },
      { action: 'setGlow', cardId: 'stream', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addCard', columnId: 'io', id: 'sleep-4', title: 'sleep(0.5)', statusId: 'io', hasSpinner: true },
      { action: 'setStatus', cardId: 'stream', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'stream', glow: false },
    ],
    [
      { action: 'removeCard', cardId: 'sleep-4' },
      { action: 'setStatus', cardId: 'stream', statusId: 'running' },
      { action: 'setGlow', cardId: 'stream', glow: true },
      { action: 'highlightLine', lineId: 'line-7' },
    ],
    [
      { action: 'setStatus', cardId: 'stream', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'stream', glow: false },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'highlightLines', entries: [
        { lineId: 'line-13', type: 'active' },
        { lineId: 'line-14', type: 'active' },
      ]},
      { action: 'addOutput', id: 'o5', text: 'Token:  How', time: '2.0s' },
    ],

    // Phase: Token 5 " can" (steps 19–21)
    [
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'stream', statusId: 'running' },
      { action: 'setGlow', cardId: 'stream', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addCard', columnId: 'io', id: 'sleep-5', title: 'sleep(0.5)', statusId: 'io', hasSpinner: true },
      { action: 'setStatus', cardId: 'stream', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'stream', glow: false },
    ],
    [
      { action: 'removeCard', cardId: 'sleep-5' },
      { action: 'setStatus', cardId: 'stream', statusId: 'running' },
      { action: 'setGlow', cardId: 'stream', glow: true },
      { action: 'highlightLine', lineId: 'line-7' },
    ],
    [
      { action: 'setStatus', cardId: 'stream', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'stream', glow: false },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'highlightLines', entries: [
        { lineId: 'line-13', type: 'active' },
        { lineId: 'line-14', type: 'active' },
      ]},
      { action: 'addOutput', id: 'o6', text: 'Token:  can', time: '2.5s' },
    ],

    // Phase: Stream Ends (steps 22–24)
    [
      { action: 'setStatus', cardId: 'stream', statusId: 'complete' },
      { action: 'removeCard', cardId: 'stream' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addOutput', id: 'o7', text: 'Full: Hello world! How can', time: '2.5s' },
    ],
    [
      { action: 'setStatus', cardId: 'main', statusId: 'complete' },
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'main' },
    ],
  ],
}

export default streaming
