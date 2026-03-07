import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio

sem = asyncio.Semaphore(2)


async def call_llm(model):
    async with sem:
        print(f"Calling {model}...")
        await asyncio.sleep(2)
        print(f"{model} responded")
        return f"Response from {model}"


async def main():
    tasks = [
        asyncio.create_task(call_llm("gpt-4")),
        asyncio.create_task(call_llm("claude")),
        asyncio.create_task(call_llm("gemini")),
        asyncio.create_task(call_llm("llama")),
    ]
    results = await asyncio.gather(*tasks)
    print(results)


asyncio.run(main())`

// line-0:  import asyncio
// line-1:  (empty)
// line-2:  sem = asyncio.Semaphore(2)
// line-3:  (empty)
// line-4:  (empty)
// line-5:  async def call_llm(model):
// line-6:      async with sem:
// line-7:          print(f"Calling {model}...")
// line-8:          await asyncio.sleep(2)
// line-9:          print(f"{model} responded")
// line-10:         return f"Response from {model}"
// line-11: (empty)
// line-12: (empty)
// line-13: async def main():
// line-14:     tasks = [
// line-15:         asyncio.create_task(call_llm("gpt-4")),
// line-16:         asyncio.create_task(call_llm("claude")),
// line-17:         asyncio.create_task(call_llm("gemini")),
// line-18:         asyncio.create_task(call_llm("llama")),
// line-19:     ]
// line-20:     results = await asyncio.gather(*tasks)
// line-21:     print(results)
// line-22: (empty)
// line-23: (empty)
// line-24: asyncio.run(main())

const semaphore: AnimationDefinition = {
  id: 'asyncio-semaphore',
  title: 'Rate Limiting with Semaphore',
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
      title: 'Create Semaphore',
      explanation:
        '• `asyncio.Semaphore(2)` — only 2 tasks can hold it at once\n• This is our rate limiter: max 2 concurrent API calls',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define call_llm',
      explanation:
        '• `async with sem:` acquires the semaphore before calling the API\n• If 2 tasks already hold it, the next one waits until one releases\n• The semaphore is released automatically when the `async with` block exits',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Define main',
      explanation:
        '• Creates 4 tasks — but the semaphore ensures only 2 run at a time\n• `gather()` waits for all 4 to complete',
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
      title: 'Create 4 Tasks',
      explanation:
        '• Four tasks scheduled: gpt-4, claude, gemini, llama\n• All 4 are "Ready" — but the semaphore will limit concurrency\n• Watch: only 2 will actually run at a time',
      startStep: 5,
      endStep: 8,
    },
    {
      title: 'First Batch Acquires Semaphore',
      explanation:
        '• gpt-4 and claude acquire the semaphore (2 slots available)\n• Both start their API calls and hit `await asyncio.sleep(2)`\n• gemini and llama try to acquire but the semaphore is full — they WAIT\n• This is the key visual: 2 running, 2 visibly suspended',
      startStep: 9,
      endStep: 12,
    },
    {
      title: 'First Batch Completes',
      explanation:
        '• After 2 seconds, gpt-4 and claude finish their API calls\n• They release the semaphore slots as they exit `async with`\n• Two slots are now free for the waiting tasks',
      startStep: 13,
      endStep: 16,
    },
    {
      title: 'Second Batch Acquires',
      explanation:
        '• gemini and llama immediately acquire the freed semaphore slots\n• They start their API calls — same 2-second sleep\n• The semaphore smoothly handed off concurrency from batch 1 to batch 2',
      startStep: 17,
      endStep: 19,
    },
    {
      title: 'Second Batch Completes',
      explanation:
        '• gemini and llama finish after 2 more seconds\n• All 4 tasks are now complete',
      startStep: 20,
      endStep: 23,
    },
    {
      title: 'Results',
      explanation:
        '• `gather()` returns all 4 results in creation order\n• Total time: 4s (2 batches × 2s), not 8s (4 × 2s sequential)\n• Semaphore(2) gave us controlled concurrency — fast but not overwhelming',
      startStep: 24,
      endStep: 26,
    },
  ],

  steps: [
    // Phase: Import + Semaphore (steps 0–1)
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-2' }],

    // Phase: Define functions (steps 2–3)
    [{ action: 'highlightLine', lineId: 'line-5' }],
    [{ action: 'highlightLine', lineId: 'line-13' }],

    // Phase: Start Event Loop (step 4)
    [
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'addCard', columnId: 'code', id: 'main', title: 'main()', statusId: 'running' },
    ],

    // Phase: Create 4 Tasks (steps 5–8)
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addCard', columnId: 'loop', id: 'gpt4', title: 'call_llm("gpt-4")', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'addCard', columnId: 'loop', id: 'claude', title: 'call_llm("claude")', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'addCard', columnId: 'loop', id: 'gemini', title: 'call_llm("gemini")', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addCard', columnId: 'loop', id: 'llama', title: 'call_llm("llama")', statusId: 'ready' },
    ],

    // Phase: First Batch Acquires Semaphore (steps 9–12)
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'gpt4', statusId: 'running' },
      { action: 'setGlow', cardId: 'gpt4', glow: true },
      { action: 'addOutput', id: 'o1', text: 'Calling gpt-4...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'setStatus', cardId: 'gpt4', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gpt4', glow: false },
      { action: 'addCard', columnId: 'io', id: 'timer-gpt4', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
      { action: 'setStatus', cardId: 'claude', statusId: 'running' },
      { action: 'setGlow', cardId: 'claude', glow: true },
      { action: 'addOutput', id: 'o2', text: 'Calling claude...', time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'claude', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'claude', glow: false },
      { action: 'addCard', columnId: 'io', id: 'timer-claude', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'setStatus', cardId: 'gemini', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'llama', statusId: 'suspended' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
    ],

    // Phase: First Batch Completes (steps 13–16)
    [
      { action: 'removeCard', cardId: 'timer-gpt4' },
      { action: 'setStatus', cardId: 'gpt4', statusId: 'running' },
      { action: 'setGlow', cardId: 'gpt4', glow: true },
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'addOutput', id: 'o3', text: 'gpt-4 responded', time: '2.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'setStatus', cardId: 'gpt4', statusId: 'complete' },
      { action: 'setGlow', cardId: 'gpt4', glow: false },
      { action: 'removeCard', cardId: 'gpt4' },
    ],
    [
      { action: 'removeCard', cardId: 'timer-claude' },
      { action: 'setStatus', cardId: 'claude', statusId: 'running' },
      { action: 'setGlow', cardId: 'claude', glow: true },
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'addOutput', id: 'o4', text: 'claude responded', time: '2.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'setStatus', cardId: 'claude', statusId: 'complete' },
      { action: 'setGlow', cardId: 'claude', glow: false },
      { action: 'removeCard', cardId: 'claude' },
    ],

    // Phase: Second Batch Acquires (steps 17–19)
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'gemini', statusId: 'running' },
      { action: 'setGlow', cardId: 'gemini', glow: true },
      { action: 'addOutput', id: 'o5', text: 'Calling gemini...', time: '2.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'setStatus', cardId: 'gemini', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gemini', glow: false },
      { action: 'addCard', columnId: 'io', id: 'timer-gemini', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
      { action: 'setStatus', cardId: 'llama', statusId: 'running' },
      { action: 'setGlow', cardId: 'llama', glow: true },
      { action: 'addOutput', id: 'o6', text: 'Calling llama...', time: '2.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'llama', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'llama', glow: false },
      { action: 'addCard', columnId: 'io', id: 'timer-llama', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
    ],

    // Phase: Second Batch Completes (steps 20–23)
    [
      { action: 'removeCard', cardId: 'timer-gemini' },
      { action: 'setStatus', cardId: 'gemini', statusId: 'running' },
      { action: 'setGlow', cardId: 'gemini', glow: true },
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'addOutput', id: 'o7', text: 'gemini responded', time: '4.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'setStatus', cardId: 'gemini', statusId: 'complete' },
      { action: 'setGlow', cardId: 'gemini', glow: false },
      { action: 'removeCard', cardId: 'gemini' },
    ],
    [
      { action: 'removeCard', cardId: 'timer-llama' },
      { action: 'setStatus', cardId: 'llama', statusId: 'running' },
      { action: 'setGlow', cardId: 'llama', glow: true },
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'addOutput', id: 'o8', text: 'llama responded', time: '4.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'setStatus', cardId: 'llama', statusId: 'complete' },
      { action: 'setGlow', cardId: 'llama', glow: false },
      { action: 'removeCard', cardId: 'llama' },
    ],

    // Phase: Results (steps 24–26)
    [
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'highlightLine', lineId: 'line-20' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addOutput', id: 'o9', text: "['Response from gpt-4', 'Response from claude', 'Response from gemini', 'Response from llama']", time: '4.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'main', statusId: 'complete' },
      { action: 'removeCard', cardId: 'main' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default semaphore
