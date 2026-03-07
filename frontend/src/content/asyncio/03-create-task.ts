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
    result1 = await task1
    print("GPT-4 done")
    result2 = await task2
    print("Claude done")
    return [result1, result2]


results = asyncio.run(main())
print(results)`

// line-0:  import asyncio
// line-1:  (empty)
// line-2:  (empty)
// line-3:  async def call_llm(model):
// line-4:      print(f"Calling {model}...")
// line-5:      await asyncio.sleep(2 if model == "claude" else 1)
// line-6:      print(f"{model} responded")
// line-7:      return f"Response from {model}"
// line-8:  (empty)
// line-9:  (empty)
// line-10: async def main():
// line-11:     task1 = asyncio.create_task(call_llm("gpt-4"))
// line-12:     task2 = asyncio.create_task(call_llm("claude"))
// line-13:     result1 = await task1
// line-14:     print("GPT-4 done")
// line-15:     result2 = await task2
// line-16:     print("Claude done")
// line-17:     return [result1, result2]
// line-18: (empty)
// line-19: (empty)
// line-20: results = asyncio.run(main())
// line-21: print(results)

const createTask: AnimationDefinition = {
  id: 'asyncio-create-task',
  title: 'Concurrent Tasks with create_task',
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
        '• Same async coroutine as before — uses `await asyncio.sleep()` for the LLM API request\n• The function itself hasn\'t changed from Animation 2',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define main',
      explanation:
        '• This is the key difference: `asyncio.create_task()` wraps each coroutine\n• `create_task()` registers the coroutine on the event loop immediately\n• Both tasks are scheduled BEFORE we `await` either one',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Start the Event Loop',
      explanation:
        '• `asyncio.run(main())` creates the event loop and enters `main()`\n• Watch what happens — both tasks appear in the Event Loop column as "Ready"',
      startStep: 3,
      endStep: 3,
    },
    {
      title: 'Creating Tasks',
      explanation:
        '• `main()` calls `create_task()` for both coroutines\n• Both `call_llm("gpt-4")` and `call_llm("claude")` are now scheduled on the event loop\n• They appear as "Ready" — waiting for the loop to pick them up\n• When `main()` hits `await task1`, it suspends and the loop starts running tasks',
      startStep: 4,
      endStep: 7,
    },
    {
      title: 'Running Concurrently',
      explanation:
        '• `task1` runs and hits `await asyncio.sleep(1)` — it suspends\n• The loop picks up `task2` (the next ready task) and runs it\n• `task2` also hits its sleep — both timers run in parallel\n• This is real concurrency!',
      startStep: 8,
      endStep: 13,
    },
    {
      title: 'task1 Completes',
      explanation:
        '• After 1 second, `task1`\'s timer fires and it completes\n• `main()` resumes from `await task1` and prints confirmation\n• Then `main()` hits `await task2` — `task2` is still sleeping',
      startStep: 14,
      endStep: 19,
    },
    {
      title: 'task2 Completes',
      explanation:
        '• After 2 seconds total, `task2`\'s timer fires\n• `task2` prints "claude responded" and returns its result\n• Now the thing `main()` was waiting on is done',
      startStep: 20,
      endStep: 22,
    },
    {
      title: 'Completion',
      explanation:
        '• `main()` wakes up with `task2`\'s result and prints confirmation\n• Both responses collected and returned\n• `max(1s, 2s) = 2s` total — not `1s + 2s = 3s`\n• `create_task()` was the only change needed for real concurrency',
      startStep: 23,
      endStep: 28,
    },
  ],

  steps: [
    // Phase: Module Setup (steps 0–3)
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-3' }],
    [{ action: 'highlightLine', lineId: 'line-10' }],
    [{ action: 'highlightLine', lineId: 'line-20' }],

    // Phase: Scheduling Concurrent Tasks (steps 4–7)
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'addCard', columnId: 'code', id: 'main', title: 'main()', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addCard', columnId: 'loop', id: 'task1', title: 'call_llm("gpt-4")', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'addCard', columnId: 'loop', id: 'task2', title: 'call_llm("claude")', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
    ],

    // Phase: Both Tasks Start and Suspend (steps 8–13)
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

    // Phase: task1 Completes First (steps 14–19)
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
    [
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'highlightLine', lineId: 'line-13' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'addOutput', id: 'o4', text: 'GPT-4 done', time: '1.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
    ],

    // Phase: task2 Completes (steps 20–22)
    [
      { action: 'removeCard', cardId: 'timer2' },
      { action: 'setStatus', cardId: 'task2', statusId: 'running' },
      { action: 'setGlow', cardId: 'task2', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o5', text: 'claude responded', time: '2.0s' },
    ],
    [{ action: 'highlightLine', lineId: 'line-7' }],
    [
      { action: 'setStatus', cardId: 'task2', statusId: 'complete' },
      { action: 'setGlow', cardId: 'task2', glow: false },
      { action: 'removeCard', cardId: 'task2' },
    ],

    // Phase: Final Results (steps 23–28)
    [
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'highlightLine', lineId: 'line-15' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'addOutput', id: 'o6', text: 'Claude done', time: '2.0s' },
    ],
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

export default createTask
