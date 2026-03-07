import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio
import time


async def call_llm(model):
    print(f"Calling {model}...")
    time.sleep(2 if model == "claude" else 1)
    print(f"{model} responded")
    return f"Response from {model}"


async def main():
    task1 = asyncio.create_task(call_llm("gpt-4"))
    task2 = asyncio.create_task(call_llm("claude"))
    result1 = await task1
    print("GPT-4 done")
    result2 = await task2
    print("Claude done")
    return [result1, result2]


results = asyncio.run(main())
print(results)`

const blockingLoop: AnimationDefinition = {
  id: 'asyncio-blocking-loop',
  title: 'Blocking the Event Loop',
  columns: asyncioColumns,
  statuses: asyncioStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Imports',
      explanation:
        '• Loading `asyncio` AND `time` — notice the extra import\n• `time` gives us `time.sleep()`, a synchronous blocking call',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'Define `call_llm`',
      explanation:
        '• Looks like an `async` function, but uses `time.sleep()` to simulate a synchronous LLM API call!\n• Unlike `await asyncio.sleep()`, this will freeze the entire thread',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Define `main`',
      explanation:
        '• Same `create_task()` pattern as the concurrent version\n• Two LLM calls will be scheduled — but will they actually run concurrently?',
      startStep: 3,
      endStep: 3,
    },
    {
      title: 'Start Event Loop',
      explanation:
        '• `asyncio.run(main())` creates the event loop and schedules `main()`\n• The loop begins executing the `main` coroutine',
      startStep: 4,
      endStep: 5,
    },
    {
      title: 'Creating Tasks',
      explanation:
        '• `main()` schedules both LLM tasks with `create_task()`\n• So far, everything looks identical to the concurrent version\n• Both tasks are ready in the event loop',
      startStep: 6,
      endStep: 7,
    },
    {
      title: 'main() Awaits task1',
      explanation:
        '• `main()` awaits `task1` and suspends\n• The event loop is free to pick a ready task',
      startStep: 8,
      endStep: 8,
    },
    {
      title: 'task1 Runs — Blocking!',
      explanation:
        '• The loop picks `task1` — it calls GPT-4, then hits `time.sleep(1)`\n• This is a synchronous blocking call — it freezes the entire Python thread\n• `task1` stays in "Running" (NOT suspended) because it never yielded control\n• `task2` sits in "Ready", unable to run — the event loop is stuck',
      startStep: 9,
      endStep: 14,
    },
    {
      title: 'main() Gets task1 Result',
      explanation:
        '• `task1` finally completes after blocking for 1 second\n• `main()` resumes, prints the result, then awaits `task2`',
      startStep: 15,
      endStep: 17,
    },
    {
      title: 'task2 Runs — Still Blocking!',
      explanation:
        '• Only now does `task2` get to run — after `task1` fully completed\n• Same blocking pattern: `time.sleep(2)` freezes everything for another 2 seconds\n• Total elapsed: 3 seconds — zero concurrency',
      startStep: 18,
      endStep: 23,
    },
    {
      title: 'Final Results',
      explanation:
        '• Everything ran sequentially: 1s + 2s = 3s total\n• With `await asyncio.sleep()` it would have been ~2s\n• `time.sleep()` blocks the event loop — use async HTTP clients for real concurrency',
      startStep: 24,
      endStep: 29,
    },
  ],

  steps: [
    // Phase 1: Setup (steps 0–3)
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-1' }],
    [{ action: 'highlightLine', lineId: 'line-4' }],
    [{ action: 'highlightLine', lineId: 'line-11' }],

    // Phase 2: Starting the Event Loop (steps 4–5)
    [{ action: 'highlightLine', lineId: 'line-21' }],
    [{ action: 'highlightLine', lineId: 'line-11' }, { action: 'addCard', columnId: 'loop', id: 'main', title: 'main()', statusId: 'running' }],

    // Phase 3: Creating Tasks (steps 6–7)
    [{ action: 'highlightLine', lineId: 'line-12' }, { action: 'addCard', columnId: 'loop', id: 'task1', title: 'call_llm("gpt-4")', statusId: 'ready' }],
    [{ action: 'highlightLine', lineId: 'line-13' }, { action: 'addCard', columnId: 'loop', id: 'task2', title: 'call_llm("claude")', statusId: 'ready' }],

    // Phase 4: main() Awaits task1 (step 8)
    [{ action: 'highlightLine', lineId: 'line-14' }, { action: 'setStatus', cardId: 'main', statusId: 'suspended' }],

    // Phase 5: task1 Runs — Blocking! (steps 9–14)
    [{ action: 'setStatus', cardId: 'task1', statusId: 'running' }, { action: 'setGlow', cardId: 'task1', glow: true }, { action: 'highlightLine', lineId: 'line-5' }, { action: 'addOutput', id: 'o1', text: 'Calling gpt-4...', time: '0.0s' }],
    [{ action: 'highlightLine', lineId: 'line-6' }],
    [{ action: 'addCard', columnId: 'io', id: 'block1', title: 'time.sleep(1) ⚠️ BLOCKING', statusId: 'io', hasSpinner: true }, { action: 'highlightLine', lineId: 'line-6' }],
    [{ action: 'removeCard', cardId: 'block1' }],
    [{ action: 'highlightLine', lineId: 'line-7' }, { action: 'addOutput', id: 'o2', text: 'gpt-4 responded', time: '1.0s' }],
    [{ action: 'highlightLine', lineId: 'line-8' }, { action: 'setStatus', cardId: 'task1', statusId: 'complete' }, { action: 'setGlow', cardId: 'task1', glow: false }, { action: 'removeCard', cardId: 'task1' }],

    // Phase 6: main() Gets task1 Result (steps 15–17)
    [{ action: 'setStatus', cardId: 'main', statusId: 'running' }, { action: 'highlightLine', lineId: 'line-14' }],
    [{ action: 'highlightLine', lineId: 'line-15' }, { action: 'addOutput', id: 'o3', text: 'GPT-4 done', time: '1.0s' }],
    [{ action: 'highlightLine', lineId: 'line-16' }, { action: 'setStatus', cardId: 'main', statusId: 'suspended' }],

    // Phase 7: task2 Runs — Still Blocking! (steps 18–23)
    [{ action: 'setStatus', cardId: 'task2', statusId: 'running' }, { action: 'setGlow', cardId: 'task2', glow: true }, { action: 'highlightLine', lineId: 'line-5' }, { action: 'addOutput', id: 'o4', text: 'Calling claude...', time: '1.0s' }],
    [{ action: 'highlightLine', lineId: 'line-6' }],
    [{ action: 'addCard', columnId: 'io', id: 'block2', title: 'time.sleep(2) ⚠️ BLOCKING', statusId: 'io', hasSpinner: true }, { action: 'highlightLine', lineId: 'line-6' }],
    [{ action: 'removeCard', cardId: 'block2' }],
    [{ action: 'highlightLine', lineId: 'line-7' }, { action: 'addOutput', id: 'o5', text: 'claude responded', time: '3.0s' }],
    [{ action: 'highlightLine', lineId: 'line-8' }, { action: 'setStatus', cardId: 'task2', statusId: 'complete' }, { action: 'setGlow', cardId: 'task2', glow: false }, { action: 'removeCard', cardId: 'task2' }],

    // Phase 8: Final Results (steps 24–29)
    [{ action: 'setStatus', cardId: 'main', statusId: 'running' }, { action: 'highlightLine', lineId: 'line-16' }],
    [{ action: 'highlightLine', lineId: 'line-17' }, { action: 'addOutput', id: 'o6', text: 'Claude done', time: '3.0s' }],
    [{ action: 'highlightLine', lineId: 'line-18' }],
    [{ action: 'setStatus', cardId: 'main', statusId: 'complete' }, { action: 'highlightLine', lineId: 'line-21' }],
    [{ action: 'highlightLine', lineId: 'line-22' }, { action: 'addOutput', id: 'o7', text: "['Response from gpt-4', 'Response from claude']", time: '3.0s' }],
    [{ action: 'clearHighlights' }, { action: 'removeCard', cardId: 'main' }],
  ],
}

export default blockingLoop
