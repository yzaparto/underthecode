import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio


async def call_agent(name, delay):
    print(f"Agent {name} thinking...")
    await asyncio.sleep(delay)
    print(f"Agent {name} done")
    return f"{name}'s answer"


async def main():
    tasks = [
        asyncio.create_task(call_agent("researcher", 3)),
        asyncio.create_task(call_agent("coder", 1)),
        asyncio.create_task(call_agent("reviewer", 2)),
    ]
    for coro in asyncio.as_completed(tasks):
        result = await coro
        print(f"Received: {result}")

    print("All agents finished")


asyncio.run(main())`

// line-0:  import asyncio
// line-1:  (empty)
// line-2:  (empty)
// line-3:  async def call_agent(name, delay):
// line-4:      print(f"Agent {name} thinking...")
// line-5:      await asyncio.sleep(delay)
// line-6:      print(f"Agent {name} done")
// line-7:      return f"{name}'s answer"
// line-8:  (empty)
// line-9:  (empty)
// line-10: async def main():
// line-11:     tasks = [
// line-12:         asyncio.create_task(call_agent("researcher", 3)),
// line-13:         asyncio.create_task(call_agent("coder", 1)),
// line-14:         asyncio.create_task(call_agent("reviewer", 2)),
// line-15:     ]
// line-16:     for coro in asyncio.as_completed(tasks):
// line-17:         result = await coro
// line-18:         print(f"Received: {result}")
// line-19: (empty)
// line-20:     print("All agents finished")
// line-21: (empty)
// line-22: (empty)
// line-23: asyncio.run(main())

const asCompleted: AnimationDefinition = {
  id: 'asyncio-as-completed',
  title: 'Processing Results as They Arrive',
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
      title: 'Define call_agent',
      explanation:
        '• An async coroutine that simulates an AI agent\n• Takes a name and delay, sleeps for the given time, and returns an answer',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define main',
      explanation:
        '• Creates three tasks with different delays\n• Uses `asyncio.as_completed()` to iterate results in completion order\n• Unlike `gather()`, results arrive as soon as each task finishes',
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
      title: 'Create All Tasks',
      explanation:
        '• Three tasks created with `create_task()`: researcher (3s), coder (1s), reviewer (2s)\n• All three are scheduled on the event loop immediately\n• The tasks have different durations — watch which finishes first',
      startStep: 4,
      endStep: 6,
    },
    {
      title: 'Tasks Start Running',
      explanation:
        '• `main()` enters the `as_completed()` loop and suspends\n• All three agents start running and hit their `await asyncio.sleep()`\n• Each agent suspends with a different timer running in the background',
      startStep: 7,
      endStep: 9,
    },
    {
      title: 'Coder Finishes First (1s)',
      explanation:
        '• Coder had the shortest delay (1s) — it completes first\n• `as_completed()` yields the coder\'s result immediately\n• `main()` resumes, prints the result, then waits for the next one',
      startStep: 10,
      endStep: 12,
    },
    {
      title: 'Reviewer Finishes Next (2s)',
      explanation:
        '• Reviewer\'s 2-second timer fires next\n• `as_completed()` yields reviewer\'s result\n• Results arrive in completion order, not creation order',
      startStep: 13,
      endStep: 15,
    },
    {
      title: 'Researcher Finishes Last (3s)',
      explanation:
        '• Researcher had the longest delay (3s) — finishes last\n• `as_completed()` yields the final result\n• All three results processed in order: coder → reviewer → researcher',
      startStep: 16,
      endStep: 18,
    },
    {
      title: 'All Done',
      explanation:
        '• The `as_completed()` loop has consumed all results\n• "All agents finished" prints, and `main()` completes\n• Key insight: results were processed as they arrived, not in creation order',
      startStep: 19,
      endStep: 20,
    },
  ],

  steps: [
    // Phase: Import + Define (steps 0–2)
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-3' }],
    [{ action: 'highlightLine', lineId: 'line-10' }],

    // Phase: Start Event Loop (step 3)
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'addCard', columnId: 'loop', id: 'main', title: 'main()', statusId: 'running' },
    ],

    // Phase: Create All Tasks (steps 4–6)
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'addCard', columnId: 'loop', id: 'researcher', title: 'call_agent("researcher", 3)', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'addCard', columnId: 'loop', id: 'coder', title: 'call_agent("coder", 1)', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'addCard', columnId: 'loop', id: 'reviewer', title: 'call_agent("reviewer", 2)', statusId: 'ready' },
    ],

    // Phase: Tasks Start Running (steps 7–9)
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'researcher', statusId: 'running' },
      { action: 'setGlow', cardId: 'researcher', glow: true },
      { action: 'addOutput', id: 'o1', text: 'Agent researcher thinking...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'researcher', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'researcher', glow: false },
      { action: 'addCard', columnId: 'io', id: 'timer-researcher', title: 'sleep(3)', statusId: 'io', hasSpinner: true },
      { action: 'setStatus', cardId: 'coder', statusId: 'running' },
      { action: 'setGlow', cardId: 'coder', glow: true },
      { action: 'addOutput', id: 'o2', text: 'Agent coder thinking...', time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'coder', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'coder', glow: false },
      { action: 'addCard', columnId: 'io', id: 'timer-coder', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
      { action: 'setStatus', cardId: 'reviewer', statusId: 'running' },
      { action: 'setGlow', cardId: 'reviewer', glow: true },
      { action: 'addOutput', id: 'o3', text: 'Agent reviewer thinking...', time: '0.0s' },
      { action: 'setStatus', cardId: 'reviewer', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'reviewer', glow: false },
      { action: 'addCard', columnId: 'io', id: 'timer-reviewer', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
    ],

    // Phase: Coder Finishes First (steps 10–12)
    [
      { action: 'removeCard', cardId: 'timer-coder' },
      { action: 'setStatus', cardId: 'coder', statusId: 'running' },
      { action: 'setGlow', cardId: 'coder', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o4', text: 'Agent coder done', time: '1.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'coder', statusId: 'complete' },
      { action: 'setGlow', cardId: 'coder', glow: false },
      { action: 'removeCard', cardId: 'coder' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addOutput', id: 'o5', text: "Received: coder's answer", time: '1.0s' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
    ],

    // Phase: Reviewer Finishes Next (steps 13–15)
    [
      { action: 'removeCard', cardId: 'timer-reviewer' },
      { action: 'setStatus', cardId: 'reviewer', statusId: 'running' },
      { action: 'setGlow', cardId: 'reviewer', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o6', text: 'Agent reviewer done', time: '2.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'reviewer', statusId: 'complete' },
      { action: 'setGlow', cardId: 'reviewer', glow: false },
      { action: 'removeCard', cardId: 'reviewer' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addOutput', id: 'o7', text: "Received: reviewer's answer", time: '2.0s' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
    ],

    // Phase: Researcher Finishes Last (steps 16–18)
    [
      { action: 'removeCard', cardId: 'timer-researcher' },
      { action: 'setStatus', cardId: 'researcher', statusId: 'running' },
      { action: 'setGlow', cardId: 'researcher', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o8', text: 'Agent researcher done', time: '3.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'researcher', statusId: 'complete' },
      { action: 'setGlow', cardId: 'researcher', glow: false },
      { action: 'removeCard', cardId: 'researcher' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addOutput', id: 'o9', text: "Received: researcher's answer", time: '3.0s' },
    ],

    // Phase: All Done (steps 19–20)
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'addOutput', id: 'o10', text: 'All agents finished', time: '3.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'main', statusId: 'complete' },
      { action: 'removeCard', cardId: 'main' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default asCompleted
