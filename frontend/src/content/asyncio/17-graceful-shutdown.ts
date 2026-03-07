import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio


async def llm_worker(name):
    try:
        while True:
            print(f"{name}: processing...")
            await asyncio.sleep(2)
    except asyncio.CancelledError:
        print(f"{name}: saving state...")
        await asyncio.sleep(0.5)
        print(f"{name}: cleanup done")


async def main():
    workers = [
        asyncio.create_task(llm_worker("agent-1")),
        asyncio.create_task(llm_worker("agent-2")),
    ]
    await asyncio.sleep(3)
    print("Shutting down...")
    for w in workers:
        w.cancel()
    results = await asyncio.gather(*workers, return_exceptions=True)
    print("All workers stopped")


asyncio.run(main())`

// line-0:  import asyncio
// line-1:  (empty)
// line-2:  (empty)
// line-3:  async def llm_worker(name):
// line-4:      try:
// line-5:          while True:
// line-6:              print(f"{name}: processing...")
// line-7:              await asyncio.sleep(2)
// line-8:      except asyncio.CancelledError:
// line-9:          print(f"{name}: saving state...")
// line-10:         await asyncio.sleep(0.5)
// line-11:         print(f"{name}: cleanup done")
// line-12: (empty)
// line-13: (empty)
// line-14: async def main():
// line-15:     workers = [
// line-16:         asyncio.create_task(llm_worker("agent-1")),
// line-17:         asyncio.create_task(llm_worker("agent-2")),
// line-18:     ]
// line-19:     await asyncio.sleep(3)
// line-20:     print("Shutting down...")
// line-21:     for w in workers:
// line-22:         w.cancel()
// line-23:     results = await asyncio.gather(*workers, return_exceptions=True)
// line-24:     print("All workers stopped")
// line-25: (empty)
// line-26: (empty)
// line-27: asyncio.run(main())

const gracefulShutdown: AnimationDefinition = {
  id: 'asyncio-graceful-shutdown',
  title: 'Graceful Shutdown',
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
      title: 'Define llm_worker',
      explanation:
        '• A long-running coroutine that loops forever processing work\n• Wraps the loop in `try/except CancelledError` for graceful cleanup\n• On cancel: saves state and confirms cleanup before exiting',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define main',
      explanation:
        '• Creates two worker tasks and lets them run for 3 seconds\n• Then cancels both and uses `gather()` to wait for cleanup',
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
      title: 'Create Workers',
      explanation:
        '• `create_task()` schedules both `llm_worker` coroutines\n• Both tasks are ready on the event loop\n• `main()` then sleeps for 3 seconds, letting the workers run',
      startStep: 4,
      endStep: 6,
    },
    {
      title: 'Workers — Iteration 1',
      explanation:
        '• Both workers start their `while True` loop\n• Each prints "processing..." and then hits `await asyncio.sleep(2)`\n• All three coroutines are now suspended with concurrent timers',
      startStep: 7,
      endStep: 10,
    },
    {
      title: 'Workers — Iteration 2',
      explanation:
        '• After 2 seconds, both workers wake up and loop back\n• They print "processing..." again and suspend on another `sleep(2)`\n• Main is still sleeping (1 second left on its 3s timer)',
      startStep: 11,
      endStep: 14,
    },
    {
      title: 'Shutdown Begins',
      explanation:
        '• Main\'s 3-second sleep finishes — it resumes\n• Prints "Shutting down..." and calls `cancel()` on both workers\n• Cancellation removes the workers\' pending I/O and raises `CancelledError`',
      startStep: 15,
      endStep: 18,
    },
    {
      title: 'Workers Cleanup',
      explanation:
        '• Both workers catch `CancelledError` in their `except` block\n• They save state and do a brief cleanup sleep\n• After cleanup, both workers exit gracefully',
      startStep: 19,
      endStep: 23,
    },
    {
      title: 'Gather and Done',
      explanation:
        '• `gather(*workers, return_exceptions=True)` collects results\n• All workers stopped cleanly — "All workers stopped"\n• The `try/except CancelledError` pattern ensures no work is lost',
      startStep: 24,
      endStep: 26,
    },
  ],

  steps: [
    // Phase: Import (step 0)
    [{ action: 'highlightLine', lineId: 'line-0' }],

    // Phase: Define llm_worker (step 1)
    [{ action: 'highlightLine', lineId: 'line-3' }],

    // Phase: Define main (step 2)
    [{ action: 'highlightLine', lineId: 'line-14' }],

    // Phase: Start Event Loop (step 3)
    [
      { action: 'highlightLine', lineId: 'line-27' },
      { action: 'addCard', columnId: 'code', id: 'main', title: 'main()', statusId: 'running' },
    ],

    // Phase: Create Workers (steps 4–6)
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-15', type: 'active' },
        { lineId: 'line-16', type: 'active' },
      ]},
      { action: 'addCard', columnId: 'loop', id: 'agent-1', title: 'llm_worker("agent-1")', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'addCard', columnId: 'loop', id: 'agent-2', title: 'llm_worker("agent-2")', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'addCard', columnId: 'io', id: 'main-sleep', title: 'sleep(3)', statusId: 'io', hasSpinner: true },
    ],

    // Phase: Workers — Iteration 1 (steps 7–10)
    [
      { action: 'setStatus', cardId: 'agent-1', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-1', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o1', text: 'agent-1: processing...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'agent-1', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'agent-1', glow: false },
      { action: 'addCard', columnId: 'io', id: 'agent-1-sleep', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'setStatus', cardId: 'agent-2', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-2', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o2', text: 'agent-2: processing...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'agent-2', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'agent-2', glow: false },
      { action: 'addCard', columnId: 'io', id: 'agent-2-sleep', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
    ],

    // Phase: Workers — Iteration 2 (steps 11–14)
    [
      { action: 'removeCard', cardId: 'agent-1-sleep' },
      { action: 'removeCard', cardId: 'agent-2-sleep' },
      { action: 'setStatus', cardId: 'agent-1', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-1', glow: true },
      { action: 'highlightLine', lineId: 'line-5' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o3', text: 'agent-1: processing...', time: '2.0s' },
      { action: 'setStatus', cardId: 'agent-1', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'agent-1', glow: false },
      { action: 'addCard', columnId: 'io', id: 'agent-1-sleep2', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'setStatus', cardId: 'agent-2', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-2', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o4', text: 'agent-2: processing...', time: '2.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'agent-2', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'agent-2', glow: false },
      { action: 'addCard', columnId: 'io', id: 'agent-2-sleep2', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
    ],

    // Phase: Shutdown Begins (steps 15–18)
    [
      { action: 'removeCard', cardId: 'main-sleep' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'addOutput', id: 'o5', text: 'Shutting down...', time: '3.0s' },
    ],
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-21', type: 'active' },
        { lineId: 'line-22', type: 'active' },
      ]},
    ],
    [
      { action: 'removeCard', cardId: 'agent-1-sleep2' },
      { action: 'removeCard', cardId: 'agent-2-sleep2' },
      { action: 'setStatus', cardId: 'agent-1', statusId: 'running' },
      { action: 'setStatus', cardId: 'agent-2', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'setGlow', cardId: 'agent-1', glow: true },
      { action: 'setGlow', cardId: 'agent-2', glow: true },
    ],

    // Phase: Workers Cleanup (steps 19–23)
    [
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'addOutput', id: 'o6', text: 'agent-1: saving state...', time: '3.0s' },
      { action: 'addOutput', id: 'o7', text: 'agent-2: saving state...', time: '3.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'setStatus', cardId: 'agent-1', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'agent-2', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'agent-1', glow: false },
      { action: 'setGlow', cardId: 'agent-2', glow: false },
      { action: 'addCard', columnId: 'io', id: 'agent-1-cleanup', title: 'sleep(0.5)', statusId: 'io', hasSpinner: true },
      { action: 'addCard', columnId: 'io', id: 'agent-2-cleanup', title: 'sleep(0.5)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'agent-1-cleanup' },
      { action: 'removeCard', cardId: 'agent-2-cleanup' },
      { action: 'setStatus', cardId: 'agent-1', statusId: 'running' },
      { action: 'setStatus', cardId: 'agent-2', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-1', glow: true },
      { action: 'setGlow', cardId: 'agent-2', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addOutput', id: 'o8', text: 'agent-1: cleanup done', time: '3.5s' },
      { action: 'addOutput', id: 'o9', text: 'agent-2: cleanup done', time: '3.5s' },
    ],
    [
      { action: 'setStatus', cardId: 'agent-1', statusId: 'complete' },
      { action: 'setStatus', cardId: 'agent-2', statusId: 'complete' },
      { action: 'setGlow', cardId: 'agent-1', glow: false },
      { action: 'setGlow', cardId: 'agent-2', glow: false },
      { action: 'removeCard', cardId: 'agent-1' },
      { action: 'removeCard', cardId: 'agent-2' },
    ],

    // Phase: Gather and Done (steps 24–26)
    [
      { action: 'highlightLine', lineId: 'line-23' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'addOutput', id: 'o10', text: 'All workers stopped', time: '3.5s' },
      { action: 'setStatus', cardId: 'main', statusId: 'complete' },
    ],
    [
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'main' },
    ],
  ],
}

export default gracefulShutdown
