import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio


async def call_llm(model):
    print(f"Calling {model}...")
    await asyncio.sleep(1)
    raise ConnectionError(f"{model} API error")


async def retry(coro_fn, retries=3):
    for attempt in range(retries):
        try:
            return await coro_fn()
        except Exception as e:
            delay = 2 ** attempt
            print(f"Attempt {attempt+1} failed: {e}")
            if attempt < retries - 1:
                print(f"Retrying in {delay}s...")
                await asyncio.sleep(delay)
    print("All retries exhausted")


async def main():
    await retry(lambda: call_llm("claude"))


asyncio.run(main())`

// line-0:  import asyncio
// line-1:  (empty)
// line-2:  (empty)
// line-3:  async def call_llm(model):
// line-4:      print(f"Calling {model}...")
// line-5:      await asyncio.sleep(1)
// line-6:      raise ConnectionError(f"{model} API error")
// line-7:  (empty)
// line-8:  (empty)
// line-9:  async def retry(coro_fn, retries=3):
// line-10:     for attempt in range(retries):
// line-11:         try:
// line-12:             return await coro_fn()
// line-13:         except Exception as e:
// line-14:             delay = 2 ** attempt
// line-15:             print(f"Attempt {attempt+1} failed: {e}")
// line-16:             if attempt < retries - 1:
// line-17:                 print(f"Retrying in {delay}s...")
// line-18:                 await asyncio.sleep(delay)
// line-19:     print("All retries exhausted")
// line-20: (empty)
// line-21: (empty)
// line-22: async def main():
// line-23:     await retry(lambda: call_llm("claude"))
// line-24: (empty)
// line-25: (empty)
// line-26: asyncio.run(main())

const retry: AnimationDefinition = {
  id: 'asyncio-retry',
  title: 'Retry with Exponential Backoff',
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
        '• Simulates an LLM API call that always fails\n• Sleeps 1 second then raises `ConnectionError`',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define retry',
      explanation:
        '• Generic retry wrapper with exponential backoff\n• Tries up to 3 times with delays of 1s, 2s between attempts\n• Delay formula: `2 ** attempt` — exponential growth',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Define main',
      explanation:
        '• Calls `retry()` with a lambda that invokes `call_llm("claude")`',
      startStep: 3,
      endStep: 3,
    },
    {
      title: 'Start the Event Loop',
      explanation:
        '• `asyncio.run(main())` creates the event loop and enters `main()`',
      startStep: 4,
      endStep: 4,
    },
    {
      title: 'Enter main, call retry',
      explanation:
        '• `main()` awaits `retry()` — control passes to the retry coroutine\n• `main()` suspends until retry finishes all attempts',
      startStep: 5,
      endStep: 6,
    },
    {
      title: 'Attempt 1',
      explanation:
        '• First iteration: `attempt = 0`\n• `call_llm("claude")` is called — prints, sleeps 1s, then raises\n• Exception caught — backoff delay is `2⁰ = 1s`',
      startStep: 7,
      endStep: 12,
    },
    {
      title: 'Attempt 2',
      explanation:
        '• Second iteration: `attempt = 1`\n• Same call, same failure\n• Backoff delay doubles to `2¹ = 2s` — exponential growth visible',
      startStep: 13,
      endStep: 18,
    },
    {
      title: 'Attempt 3 — Final Failure',
      explanation:
        '• Third and last iteration: `attempt = 2`\n• Call fails again — no more retries remain\n• `"All retries exhausted"` — the retry loop exits',
      startStep: 19,
      endStep: 23,
    },
    {
      title: 'Done',
      explanation:
        '• `retry()` returns — all attempts failed\n• `main()` completes — event loop shuts down\n• Exponential backoff prevents hammering a failing service',
      startStep: 24,
      endStep: 25,
    },
  ],

  steps: [
    // Phase: Import (step 0)
    [{ action: 'highlightLine', lineId: 'line-0' }],

    // Phase: Define call_llm (step 1)
    [{ action: 'highlightLine', lineId: 'line-3' }],

    // Phase: Define retry (step 2)
    [{ action: 'highlightLine', lineId: 'line-9' }],

    // Phase: Define main (step 3)
    [{ action: 'highlightLine', lineId: 'line-22' }],

    // Phase: Start Event Loop (step 4)
    [
      { action: 'highlightLine', lineId: 'line-26' },
      { action: 'addCard', columnId: 'loop', id: 'main', title: 'main()', statusId: 'running' },
    ],

    // Phase: Enter main, call retry (steps 5–6)
    [
      { action: 'highlightLine', lineId: 'line-23' },
    ],
    [
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'addCard', columnId: 'loop', id: 'retry', title: 'retry()', statusId: 'running' },
      { action: 'setGlow', cardId: 'retry', glow: true },
    ],

    // Phase: Attempt 1 (steps 7–12)
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-10', type: 'active' },
        { lineId: 'line-11', type: 'active' },
      ]},
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'addCard', columnId: 'loop', id: 'call-llm', title: 'call_llm("claude")', statusId: 'running' },
      { action: 'setGlow', cardId: 'call-llm', glow: true },
      { action: 'setStatus', cardId: 'retry', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'retry', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o1', text: 'Calling claude...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'call-llm', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'call-llm', glow: false },
      { action: 'addCard', columnId: 'io', id: 'call-sleep-1', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'call-sleep-1' },
      { action: 'setStatus', cardId: 'call-llm', statusId: 'running' },
      { action: 'setGlow', cardId: 'call-llm', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'removeCard', cardId: 'call-llm' },
      { action: 'setStatus', cardId: 'retry', statusId: 'running' },
      { action: 'setGlow', cardId: 'retry', glow: true },
      { action: 'highlightLines', entries: [
        { lineId: 'line-13', type: 'active' },
        { lineId: 'line-14', type: 'active' },
        { lineId: 'line-15', type: 'active' },
      ]},
      { action: 'addOutput', id: 'o2', text: 'Attempt 1 failed: claude API error', time: '1.0s' },
    ],
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-16', type: 'active' },
        { lineId: 'line-17', type: 'active' },
        { lineId: 'line-18', type: 'active' },
      ]},
      { action: 'addOutput', id: 'o3', text: 'Retrying in 1s...', time: '1.0s' },
      { action: 'setStatus', cardId: 'retry', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'retry', glow: false },
      { action: 'addCard', columnId: 'io', id: 'backoff-1', title: 'backoff 1s', statusId: 'io', hasSpinner: true },
    ],

    // Phase: Attempt 2 (steps 13–18)
    [
      { action: 'removeCard', cardId: 'backoff-1' },
      { action: 'setStatus', cardId: 'retry', statusId: 'running' },
      { action: 'setGlow', cardId: 'retry', glow: true },
      { action: 'highlightLine', lineId: 'line-10' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'addCard', columnId: 'loop', id: 'call-llm-2', title: 'call_llm("claude")', statusId: 'running' },
      { action: 'setGlow', cardId: 'call-llm-2', glow: true },
      { action: 'setStatus', cardId: 'retry', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'retry', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o4', text: 'Calling claude...', time: '2.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'call-llm-2', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'call-llm-2', glow: false },
      { action: 'addCard', columnId: 'io', id: 'call-sleep-2', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'call-sleep-2' },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'removeCard', cardId: 'call-llm-2' },
      { action: 'setStatus', cardId: 'retry', statusId: 'running' },
      { action: 'setGlow', cardId: 'retry', glow: true },
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addOutput', id: 'o5', text: 'Attempt 2 failed: claude API error', time: '3.0s' },
    ],
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-16', type: 'active' },
        { lineId: 'line-17', type: 'active' },
        { lineId: 'line-18', type: 'active' },
      ]},
      { action: 'addOutput', id: 'o6', text: 'Retrying in 2s...', time: '3.0s' },
      { action: 'setStatus', cardId: 'retry', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'retry', glow: false },
      { action: 'addCard', columnId: 'io', id: 'backoff-2', title: 'backoff 2s', statusId: 'io', hasSpinner: true },
    ],

    // Phase: Attempt 3 — Final Failure (steps 19–23)
    [
      { action: 'removeCard', cardId: 'backoff-2' },
      { action: 'setStatus', cardId: 'retry', statusId: 'running' },
      { action: 'setGlow', cardId: 'retry', glow: true },
      { action: 'highlightLine', lineId: 'line-10' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'addCard', columnId: 'loop', id: 'call-llm-3', title: 'call_llm("claude")', statusId: 'running' },
      { action: 'setGlow', cardId: 'call-llm-3', glow: true },
      { action: 'setStatus', cardId: 'retry', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'retry', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o7', text: 'Calling claude...', time: '5.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'call-llm-3', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'call-llm-3', glow: false },
      { action: 'addCard', columnId: 'io', id: 'call-sleep-3', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
      { action: 'removeCard', cardId: 'call-sleep-3' },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'removeCard', cardId: 'call-llm-3' },
      { action: 'setStatus', cardId: 'retry', statusId: 'running' },
      { action: 'setGlow', cardId: 'retry', glow: true },
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addOutput', id: 'o8', text: 'Attempt 3 failed: claude API error', time: '6.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'addOutput', id: 'o9', text: 'All retries exhausted', time: '6.0s' },
    ],

    // Phase: Done (steps 24–25)
    [
      { action: 'setStatus', cardId: 'retry', statusId: 'complete' },
      { action: 'setGlow', cardId: 'retry', glow: false },
      { action: 'removeCard', cardId: 'retry' },
      { action: 'setStatus', cardId: 'main', statusId: 'complete' },
    ],
    [
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'main' },
    ],
  ],
}

export default retry
