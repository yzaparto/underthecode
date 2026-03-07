import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio


async def call_llm(model):
    print(f"Calling {model}...")
    await asyncio.sleep(2 if model == "claude" else 1)
    print(f"{model} responded")
    return f"Response from {model}"


async def main():
    task1 = asyncio.create_task(call_llm("gpt-4"))
    task2 = asyncio.create_task(call_llm("claude"))
    result2 = await task2
    print("Claude done")
    result1 = await task1
    print("GPT-4 done")
    return [result1, result2]


results = asyncio.run(main())
print(results)`

const awaitOrdering: AnimationDefinition = {
  id: 'asyncio-await-ordering',
  title: 'Awaiting in Different Orders',
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
      explanation: '• Same async coroutine as before — uses `await asyncio.sleep()` for the LLM API request',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define main',
      explanation:
        '• Same `create_task()` pattern as before\n• But this time we `await task2` first, not `task1`',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Starting the Event Loop',
      explanation:
        '• `asyncio.run()` creates an event loop and schedules `main()` as the first coroutine',
      startStep: 3,
      endStep: 4,
    },
    {
      title: 'Creating Tasks',
      explanation:
        '• `main()` uses `create_task` to schedule both `call_llm("gpt-4")` and `call_llm("claude")`\n• Both enter the event loop as "Ready" — they haven\'t started running yet',
      startStep: 5,
      endStep: 6,
    },
    {
      title: 'main() Awaits task2',
      explanation:
        '• Here\'s the twist: `main()` awaits `task2` first, not `task1`\n• `main()` suspends and yields control to the event loop\n• The loop is now free to run the ready tasks',
      startStep: 7,
      endStep: 7,
    },
    {
      title: 'Event Loop Runs task1',
      explanation:
        '• The event loop picks `task1` (it was scheduled first)\n• `task1` prints its message, then hits `await asyncio.sleep(1)` and suspends\n• A 1-second LLM API request timer starts in the background',
      startStep: 8,
      endStep: 10,
    },
    {
      title: 'Event Loop Runs task2',
      explanation:
        '• With `task1` suspended, the loop picks `task2`\n• Same pattern: print, then `await asyncio.sleep(2)` suspends it\n• A 2-second timer starts — now all coroutines are waiting',
      startStep: 11,
      endStep: 13,
    },
    {
      title: 'Timer 1 Fires — task1 Completes',
      explanation:
        '• After 1 second, `task1`\'s timer fires and it resumes\n• `task1` prints "gpt-4 responded" and completes\n• But `main()` is waiting on `task2`, not `task1` — so `main` stays suspended\n• `task1`\'s result is stored for later',
      startStep: 14,
      endStep: 16,
    },
    {
      title: 'Timer 2 Fires — task2 Completes',
      explanation:
        '• After 2 seconds, `task2`\'s timer fires and it resumes\n• `task2` prints "claude responded" and completes\n• Now the thing `main()` was waiting on is done',
      startStep: 17,
      endStep: 19,
    },
    {
      title: 'main() Resumes',
      explanation:
        '• With `task2` complete, `main()` wakes up\n• It receives `task2`\'s result and prints the completion message',
      startStep: 20,
      endStep: 21,
    },
    {
      title: 'await task1 Returns Immediately',
      explanation:
        '• `main()` hits `await task1` — but `task1` finished a full second ago!\n• Since the task is already complete, `await` returns the result instantly with no suspension\n• The `await` order doesn\'t change when tasks finish — it changes when your code gets the result',
      startStep: 22,
      endStep: 23,
    },
    {
      title: 'Final Results',
      explanation:
        '• `main()` returns both results\n• `asyncio.run()` finishes and prints the list\n• Total wall time ≈ 2 seconds — the tasks ran concurrently regardless of `await` order',
      startStep: 24,
      endStep: 27,
    },
  ],

  steps: [
    // Phase 1: Setup (steps 0–2)
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-3' }],
    [{ action: 'highlightLine', lineId: 'line-10' }],

    // Phase 2: Starting the Event Loop (steps 3–4)
    [{ action: 'highlightLine', lineId: 'line-20' }],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'addCard', columnId: 'loop', id: 'main', title: 'main()', statusId: 'running' },
    ],

    // Phase 3: Creating Tasks (steps 5–6)
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addCard', columnId: 'loop', id: 'task1', title: 'call_llm("gpt-4")', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'addCard', columnId: 'loop', id: 'task2', title: 'call_llm("claude")', statusId: 'ready' },
    ],

    // Phase 4: main() Awaits task2 (step 7)
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
    ],

    // Phase 5: Event Loop Runs task1 (steps 8–10)
    [
      { action: 'setStatus', cardId: 'task1', statusId: 'running' },
      { action: 'setGlow', cardId: 'task1', glow: true },
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o1', text: 'Calling gpt-4...', time: '0.0s' },
    ],
    [{ action: 'highlightLine', lineId: 'line-5' }],
    [
      { action: 'setStatus', cardId: 'task1', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'task1', glow: false },
      { action: 'addCard', columnId: 'io', id: 'timer1', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],

    // Phase 6: Event Loop Runs task2 (steps 11–13)
    [
      { action: 'setStatus', cardId: 'task2', statusId: 'running' },
      { action: 'setGlow', cardId: 'task2', glow: true },
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o2', text: 'Calling claude...', time: '0.0s' },
    ],
    [{ action: 'highlightLine', lineId: 'line-5' }],
    [
      { action: 'setStatus', cardId: 'task2', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'task2', glow: false },
      { action: 'addCard', columnId: 'io', id: 'timer2', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
    ],

    // Phase 7: Timer 1 Fires — task1 Completes (steps 14–16)
    [
      { action: 'removeCard', cardId: 'timer1' },
      { action: 'setStatus', cardId: 'task1', statusId: 'running' },
      { action: 'setGlow', cardId: 'task1', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o3', text: 'gpt-4 responded', time: '1.0s' },
    ],
    [{ action: 'highlightLine', lineId: 'line-7' }],
    [
      { action: 'setStatus', cardId: 'task1', statusId: 'complete' },
      { action: 'setGlow', cardId: 'task1', glow: false },
      { action: 'removeCard', cardId: 'task1' },
    ],

    // Phase 8: Timer 2 Fires — task2 Completes (steps 17–19)
    [
      { action: 'removeCard', cardId: 'timer2' },
      { action: 'setStatus', cardId: 'task2', statusId: 'running' },
      { action: 'setGlow', cardId: 'task2', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o4', text: 'claude responded', time: '2.0s' },
    ],
    [{ action: 'highlightLine', lineId: 'line-7' }],
    [
      { action: 'setStatus', cardId: 'task2', statusId: 'complete' },
      { action: 'setGlow', cardId: 'task2', glow: false },
      { action: 'removeCard', cardId: 'task2' },
    ],

    // Phase 9: main() Resumes (steps 20–21)
    [
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'highlightLine', lineId: 'line-13' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'addOutput', id: 'o5', text: 'Claude done', time: '2.0s' },
    ],

    // Phase 10: await task1 Returns Immediately (steps 22–23)
    [{ action: 'highlightLine', lineId: 'line-15' }],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'addOutput', id: 'o6', text: 'GPT-4 done', time: '2.0s' },
    ],

    // Phase 11: Final Results (steps 24–27)
    [{ action: 'highlightLine', lineId: 'line-17' }],
    [
      { action: 'setStatus', cardId: 'main', statusId: 'complete' },
      { action: 'highlightLine', lineId: 'line-20' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addOutput', id: 'o7', text: "['Response from gpt-4', 'Response from claude']", time: '2.0s' },
    ],
    [
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'main' },
    ],
  ],
}

export default awaitOrdering
