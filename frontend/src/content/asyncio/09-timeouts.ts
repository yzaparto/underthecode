import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio


async def call_llm(model):
    print(f"Calling {model}...")
    await asyncio.sleep(3)
    print(f"{model} responded")
    return f"Response from {model}"


async def main():
    try:
        async with asyncio.timeout(1.0):
            result = await call_llm("claude")
            print(result)
    except TimeoutError:
        print("Claude timed out — using cache")

    try:
        result = await asyncio.wait_for(
            call_llm("gpt-4"), timeout=2.0
        )
        print(result)
    except TimeoutError:
        print("GPT-4 timed out!")


asyncio.run(main())`

// line-0:  import asyncio
// line-1:  (empty)
// line-2:  (empty)
// line-3:  async def call_llm(model):
// line-4:      print(f"Calling {model}...")
// line-5:      await asyncio.sleep(3)
// line-6:      print(f"{model} responded")
// line-7:      return f"Response from {model}"
// line-8:  (empty)
// line-9:  (empty)
// line-10: async def main():
// line-11:     try:
// line-12:         async with asyncio.timeout(1.0):
// line-13:             result = await call_llm("claude")
// line-14:             print(result)
// line-15:     except TimeoutError:
// line-16:         print("Claude timed out — using cache")
// line-17: (empty)
// line-18:     try:
// line-19:         result = await asyncio.wait_for(
// line-20:             call_llm("gpt-4"), timeout=2.0
// line-21:         )
// line-22:         print(result)
// line-23:     except TimeoutError:
// line-24:         print("GPT-4 timed out!")
// line-25: (empty)
// line-26: (empty)
// line-27: asyncio.run(main())

const timeouts: AnimationDefinition = {
  id: 'asyncio-timeouts',
  title: 'Timeouts',
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
      title: 'Define call_llm',
      explanation:
        '• Same 3-second LLM call from before\n• Both timeouts we set will be shorter than 3 seconds — so both will fire',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define main',
      explanation:
        '• `main()` demonstrates two timeout patterns:\n• `asyncio.timeout()` — context manager style (Python 3.11+)\n• `asyncio.wait_for()` — function-based timeout',
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
      title: 'Timeout with asyncio.timeout()',
      explanation:
        '• `async with asyncio.timeout(1.0)` sets a 1-second deadline\n• `call_llm("claude")` starts and hits `sleep(3)` — needs 3 seconds\n• After 1 second the timeout fires and cancels the task\n• `TimeoutError` is raised — caught by `except`\n• This is the modern, recommended approach (Python 3.11+)',
      startStep: 4,
      endStep: 11,
    },
    {
      title: 'Timeout with wait_for()',
      explanation:
        '• `asyncio.wait_for()` wraps a coroutine with a timeout in one call\n• `call_llm("gpt-4")` starts, hits `sleep(3)` — needs 3 seconds\n• After 2 seconds, `wait_for` cancels it and raises `TimeoutError`\n• Older API but still widely used — works in all asyncio versions',
      startStep: 12,
      endStep: 18,
    },
    {
      title: 'Done',
      explanation:
        '• Both LLM calls timed out — neither ran for the full 3 seconds\n• `asyncio.timeout()` is best for scoped deadlines (multiple operations)\n• `asyncio.wait_for()` is best for single-coroutine timeouts\n• Both raise `TimeoutError` and cancel the underlying task',
      startStep: 19,
      endStep: 20,
    },
  ],

  steps: [
    // Phase: Import (step 0)
    [{ action: 'highlightLine', lineId: 'line-0' }],

    // Phase: Define call_llm (step 1)
    [{ action: 'highlightLine', lineId: 'line-3' }],

    // Phase: Define main (step 2)
    [{ action: 'highlightLine', lineId: 'line-10' }],

    // Phase: Start Event Loop (step 3)
    [
      { action: 'highlightLine', lineId: 'line-27' },
      { action: 'addCard', columnId: 'code', id: 'main', title: 'main()', statusId: 'running' },
    ],

    // Phase: Timeout with asyncio.timeout() (steps 4–11)
    [{ action: 'highlightLine', lineId: 'line-11' }],
    [{ action: 'highlightLine', lineId: 'line-12' }],
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'addCard', columnId: 'loop', id: 'claude-task', title: 'call_llm("claude")', statusId: 'ready' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
    ],
    [
      { action: 'setStatus', cardId: 'claude-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'claude-task', glow: true },
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o1', text: 'Calling claude...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'claude-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'claude-task', glow: false },
      { action: 'addCard', columnId: 'io', id: 'claude-sleep', title: 'sleep(3)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'claude-sleep' },
      { action: 'removeCard', cardId: 'claude-task' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
    ],
    [{ action: 'highlightLine', lineId: 'line-15' }],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'addOutput', id: 'o2', text: 'Claude timed out — using cache', time: '1.0s' },
    ],

    // Phase: Timeout with wait_for() (steps 12–18)
    [{ action: 'highlightLine', lineId: 'line-18' }],
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-19', type: 'active' },
        { lineId: 'line-20', type: 'active' },
      ]},
      { action: 'addCard', columnId: 'loop', id: 'gpt-task', title: 'call_llm("gpt-4")', statusId: 'ready' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
    ],
    [
      { action: 'setStatus', cardId: 'gpt-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'gpt-task', glow: true },
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o3', text: 'Calling gpt-4...', time: '1.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'gpt-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gpt-task', glow: false },
      { action: 'addCard', columnId: 'io', id: 'gpt-sleep', title: 'sleep(3)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'gpt-sleep' },
      { action: 'removeCard', cardId: 'gpt-task' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
    ],
    [{ action: 'highlightLine', lineId: 'line-23' }],
    [
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'addOutput', id: 'o4', text: 'GPT-4 timed out!', time: '3.0s' },
    ],

    // Phase: Done (steps 19–20)
    [{ action: 'setStatus', cardId: 'main', statusId: 'complete' }],
    [
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'main' },
    ],
  ],
}

export default timeouts
