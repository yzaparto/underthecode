import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio


async def call_llm(model, delay):
    print(f"Calling {model}...")
    await asyncio.sleep(delay)
    print(f"{model} responded!")
    return f"Response from {model}"


async def main():
    tasks = {
        asyncio.create_task(call_llm("gpt-4", 3)),
        asyncio.create_task(call_llm("claude", 1)),
        asyncio.create_task(call_llm("gemini", 2)),
    }
    done, pending = await asyncio.wait(
        tasks, return_when=asyncio.FIRST_COMPLETED
    )
    winner = done.pop()
    print(f"Winner: {winner.result()}")
    for task in pending:
        task.cancel()
    print(f"Cancelled {len(pending)} remaining")


asyncio.run(main())`

// line-0:  import asyncio
// line-1:  (empty)
// line-2:  (empty)
// line-3:  async def call_llm(model, delay):
// line-4:      print(f"Calling {model}...")
// line-5:      await asyncio.sleep(delay)
// line-6:      print(f"{model} responded!")
// line-7:      return f"Response from {model}"
// line-8:  (empty)
// line-9:  (empty)
// line-10: async def main():
// line-11:     tasks = {
// line-12:         asyncio.create_task(call_llm("gpt-4", 3)),
// line-13:         asyncio.create_task(call_llm("claude", 1)),
// line-14:         asyncio.create_task(call_llm("gemini", 2)),
// line-15:     }
// line-16:     done, pending = await asyncio.wait(
// line-17:         tasks, return_when=asyncio.FIRST_COMPLETED
// line-18:     )
// line-19:     winner = done.pop()
// line-20:     print(f"Winner: {winner.result()}")
// line-21:     for task in pending:
// line-22:         task.cancel()
// line-23:     print(f"Cancelled {len(pending)} remaining")
// line-24: (empty)
// line-25: (empty)
// line-26: asyncio.run(main())

const waitFirst: AnimationDefinition = {
  id: 'asyncio-wait-first',
  title: 'Race: Fastest LLM Wins',
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
        '• An async coroutine that simulates an LLM API call\n• Takes a model name and delay — each "model" responds at a different speed',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define main',
      explanation:
        '• `main()` creates three competing LLM tasks\n• Uses `asyncio.wait(return_when=FIRST_COMPLETED)` to race them\n• The fastest response wins; the rest get cancelled',
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
      title: 'Create All 3 Tasks',
      explanation:
        '• Three `create_task()` calls schedule competing LLM coroutines\n• gpt-4 (3s), claude (1s), gemini (2s) — a race is set up\n• `await asyncio.wait()` suspends main until one finishes',
      startStep: 4,
      endStep: 7,
    },
    {
      title: 'Tasks Start Running',
      explanation:
        '• The event loop runs each task in turn\n• Each task prints its start message and hits `await asyncio.sleep()`\n• All three are now suspended, waiting on concurrent I/O timers',
      startStep: 8,
      endStep: 13,
    },
    {
      title: 'Claude Finishes First!',
      explanation:
        '• Claude\'s 1-second sleep completes first — it wins the race!\n• Claude resumes, prints its response, and completes\n• `asyncio.wait()` returns immediately — `FIRST_COMPLETED` is satisfied\n• gpt-4 and gemini are still mid-call (their I/O cards are visible)',
      startStep: 14,
      endStep: 17,
    },
    {
      title: 'Process the Winner',
      explanation:
        '• `done.pop()` retrieves the completed task (claude)\n• `winner.result()` gets the return value\n• The fastest model\'s response is used',
      startStep: 18,
      endStep: 19,
    },
    {
      title: 'Cancel Remaining Tasks',
      explanation:
        '• The `for` loop cancels every task still in `pending`\n• gpt-4 and gemini are mid-sleep — their I/O is abandoned\n• This is the "race" pattern: fastest wins, rest are discarded',
      startStep: 20,
      endStep: 23,
    },
    {
      title: 'Done',
      explanation:
        '• `main()` completes — the race pattern is demonstrated\n• `asyncio.wait(return_when=FIRST_COMPLETED)` returns on the first done task\n• Always cancel pending tasks to avoid resource leaks',
      startStep: 24,
      endStep: 25,
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
      { action: 'highlightLine', lineId: 'line-26' },
      { action: 'addCard', columnId: 'code', id: 'main', title: 'main()', statusId: 'running' },
    ],

    // Phase: Create All 3 Tasks (steps 4–7)
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'addCard', columnId: 'loop', id: 'gpt4-task', title: 'call_llm("gpt-4")', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'addCard', columnId: 'loop', id: 'claude-task', title: 'call_llm("claude")', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'addCard', columnId: 'loop', id: 'gemini-task', title: 'call_llm("gemini")', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
    ],

    // Phase: Tasks Start Running (steps 8–13)
    // gpt-4 starts
    [
      { action: 'setStatus', cardId: 'gpt4-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'gpt4-task', glow: true },
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o1', text: 'Calling gpt-4...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'gpt4-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gpt4-task', glow: false },
      { action: 'addCard', columnId: 'io', id: 'gpt4-io', title: 'gpt-4 API 3s', statusId: 'io', hasSpinner: true },
    ],
    // claude starts
    [
      { action: 'setStatus', cardId: 'claude-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'claude-task', glow: true },
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o2', text: 'Calling claude...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'claude-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'claude-task', glow: false },
      { action: 'addCard', columnId: 'io', id: 'claude-io', title: 'claude API 1s', statusId: 'io', hasSpinner: true },
    ],
    // gemini starts
    [
      { action: 'setStatus', cardId: 'gemini-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'gemini-task', glow: true },
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o3', text: 'Calling gemini...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'gemini-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gemini-task', glow: false },
      { action: 'addCard', columnId: 'io', id: 'gemini-io', title: 'gemini API 2s', statusId: 'io', hasSpinner: true },
    ],

    // Phase: Claude Finishes First! (steps 14–17)
    [
      { action: 'removeCard', cardId: 'claude-io' },
      { action: 'setStatus', cardId: 'claude-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'claude-task', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o4', text: 'claude responded!', time: '1.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'claude-task', statusId: 'complete' },
      { action: 'setGlow', cardId: 'claude-task', glow: false },
      { action: 'removeCard', cardId: 'claude-task' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
    ],

    // Phase: Process the Winner (steps 18–19)
    [{ action: 'highlightLine', lineId: 'line-19' }],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'addOutput', id: 'o5', text: 'Winner: Response from claude', time: '1.0s' },
    ],

    // Phase: Cancel Remaining Tasks (steps 20–23)
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-21', type: 'active' },
        { lineId: 'line-22', type: 'active' },
      ]},
    ],
    [
      { action: 'removeCard', cardId: 'gpt4-io' },
      { action: 'setStatus', cardId: 'gpt4-task', statusId: 'suspended' },
      { action: 'removeCard', cardId: 'gpt4-task' },
    ],
    [
      { action: 'removeCard', cardId: 'gemini-io' },
      { action: 'setStatus', cardId: 'gemini-task', statusId: 'suspended' },
      { action: 'removeCard', cardId: 'gemini-task' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'addOutput', id: 'o6', text: 'Cancelled 2 remaining', time: '1.0s' },
    ],

    // Phase: Done (steps 24–25)
    [{ action: 'setStatus', cardId: 'main', statusId: 'complete' }],
    [
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'main' },
    ],
  ],
}

export default waitFirst
