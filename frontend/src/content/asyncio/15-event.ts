import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio


async def prepare_context(event):
    print("Loading knowledge base...")
    await asyncio.sleep(2)
    print("Context ready!")
    event.set()


async def agent(name, event):
    print(f"{name}: waiting for context...")
    await event.wait()
    print(f"{name}: processing with context")
    await asyncio.sleep(1)
    print(f"{name}: done")


async def main():
    event = asyncio.Event()
    async with asyncio.TaskGroup() as tg:
        tg.create_task(prepare_context(event))
        tg.create_task(agent("summarizer", event))
        tg.create_task(agent("translator", event))
    print("All agents finished")


asyncio.run(main())`

// line-0:  import asyncio
// line-1:  (empty)
// line-2:  (empty)
// line-3:  async def prepare_context(event):
// line-4:      print("Loading knowledge base...")
// line-5:      await asyncio.sleep(2)
// line-6:      print("Context ready!")
// line-7:      event.set()
// line-8:  (empty)
// line-9:  (empty)
// line-10: async def agent(name, event):
// line-11:     print(f"{name}: waiting for context...")
// line-12:     await event.wait()
// line-13:     print(f"{name}: processing with context")
// line-14:     await asyncio.sleep(1)
// line-15:     print(f"{name}: done")
// line-16: (empty)
// line-17: (empty)
// line-18: async def main():
// line-19:     event = asyncio.Event()
// line-20:     async with asyncio.TaskGroup() as tg:
// line-21:         tg.create_task(prepare_context(event))
// line-22:         tg.create_task(agent("summarizer", event))
// line-23:         tg.create_task(agent("translator", event))
// line-24:     print("All agents finished")
// line-25: (empty)
// line-26: (empty)
// line-27: asyncio.run(main())

const event: AnimationDefinition = {
  id: 'asyncio-event',
  title: 'Event: Coordinating Agents',
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
      title: 'Define prepare_context',
      explanation:
        '• An async coroutine that loads a knowledge base\n• After a 2-second simulated load, it calls `event.set()` to signal readiness',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define agent',
      explanation:
        '• Each agent waits for the event before processing\n• `await event.wait()` suspends until `event.set()` is called',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Define main',
      explanation:
        '• Creates an `asyncio.Event` and a `TaskGroup`\n• Spawns three tasks: one to prepare context, two agents that depend on it',
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
      title: 'Create Event and TaskGroup',
      explanation:
        '• `asyncio.Event()` creates a signaling primitive — starts unset\n• `TaskGroup` is entered and all three tasks are scheduled',
      startStep: 5,
      endStep: 7,
    },
    {
      title: 'All Tasks Start',
      explanation:
        '• `prepare_context` prints "Loading knowledge base..." and suspends on `sleep(2)`\n• Both agents print "waiting for context..." and suspend on `event.wait()`\n• The event is not set yet — both agents are blocked',
      startStep: 8,
      endStep: 12,
    },
    {
      title: 'Context Ready — event.set()',
      explanation:
        '• `prepare_context` wakes up, prints "Context ready!" and calls `event.set()`\n• **Both agents wake up simultaneously** — `event.set()` releases all waiters\n• `prepare_context` completes',
      startStep: 13,
      endStep: 15,
    },
    {
      title: 'Agents Process',
      explanation:
        '• Both agents are now running concurrently\n• Each prints "processing with context" and hits `sleep(1)`\n• Their I/O timers run in parallel',
      startStep: 16,
      endStep: 19,
    },
    {
      title: 'Agents Complete',
      explanation:
        '• Both agents wake from sleep, print "done", and complete\n• The `TaskGroup` sees all tasks finished',
      startStep: 20,
      endStep: 23,
    },
    {
      title: 'Done',
      explanation:
        '• `TaskGroup` exits — all tasks completed successfully\n• "All agents finished" — `Event` coordinated three concurrent tasks\n• Use `Event` when multiple coroutines need to wait for a single signal',
      startStep: 24,
      endStep: 26,
    },
  ],

  steps: [
    // Phase: Import (step 0)
    [{ action: 'highlightLine', lineId: 'line-0' }],

    // Phase: Define prepare_context (step 1)
    [{ action: 'highlightLine', lineId: 'line-3' }],

    // Phase: Define agent (step 2)
    [{ action: 'highlightLine', lineId: 'line-10' }],

    // Phase: Define main (step 3)
    [{ action: 'highlightLine', lineId: 'line-18' }],

    // Phase: Start Event Loop (step 4)
    [
      { action: 'highlightLine', lineId: 'line-27' },
      { action: 'addCard', columnId: 'loop', id: 'main', title: 'main()', statusId: 'running' },
    ],

    // Phase: Create Event and TaskGroup (steps 5–7)
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-19', type: 'active' },
        { lineId: 'line-20', type: 'active' },
      ]},
    ],
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-21', type: 'active' },
        { lineId: 'line-22', type: 'active' },
        { lineId: 'line-23', type: 'active' },
      ]},
      { action: 'addCard', columnId: 'loop', id: 'prepare-task', title: 'prepare_context(event)', statusId: 'ready' },
      { action: 'addCard', columnId: 'loop', id: 'summarizer-task', title: 'agent("summarizer")', statusId: 'ready' },
      { action: 'addCard', columnId: 'loop', id: 'translator-task', title: 'agent("translator")', statusId: 'ready' },
    ],
    [
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'addCard', columnId: 'loop', id: 'taskgroup', title: 'TaskGroup', statusId: 'running' },
    ],

    // Phase: All Tasks Start (steps 8–12)
    [
      { action: 'setStatus', cardId: 'prepare-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'prepare-task', glow: true },
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o1', text: 'Loading knowledge base...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'prepare-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'prepare-task', glow: false },
      { action: 'addCard', columnId: 'io', id: 'prepare-sleep', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'setStatus', cardId: 'summarizer-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'summarizer-task', glow: true },
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addOutput', id: 'o2', text: 'summarizer: waiting for context...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'setStatus', cardId: 'summarizer-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'summarizer-task', glow: false },
    ],
    [
      { action: 'setStatus', cardId: 'translator-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'translator-task', glow: true },
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addOutput', id: 'o3', text: 'translator: waiting for context...', time: '0.0s' },
    ],

    // Phase: Context Ready — event.set() (steps 13–15)
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'setStatus', cardId: 'translator-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'translator-task', glow: false },
      { action: 'removeCard', cardId: 'prepare-sleep' },
      { action: 'setStatus', cardId: 'prepare-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'prepare-task', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o4', text: 'Context ready!', time: '2.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'summarizer-task', statusId: 'ready' },
      { action: 'setStatus', cardId: 'translator-task', statusId: 'ready' },
    ],
    [
      { action: 'setStatus', cardId: 'prepare-task', statusId: 'complete' },
      { action: 'setGlow', cardId: 'prepare-task', glow: false },
      { action: 'removeCard', cardId: 'prepare-task' },
    ],

    // Phase: Agents Process (steps 16–19)
    [
      { action: 'setStatus', cardId: 'summarizer-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'summarizer-task', glow: true },
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'addOutput', id: 'o5', text: 'summarizer: processing with context', time: '2.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'setStatus', cardId: 'summarizer-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'summarizer-task', glow: false },
      { action: 'addCard', columnId: 'io', id: 'summarizer-sleep', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'setStatus', cardId: 'translator-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'translator-task', glow: true },
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'addOutput', id: 'o6', text: 'translator: processing with context', time: '2.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'setStatus', cardId: 'translator-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'translator-task', glow: false },
      { action: 'addCard', columnId: 'io', id: 'translator-sleep', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],

    // Phase: Agents Complete (steps 20–23)
    [
      { action: 'removeCard', cardId: 'summarizer-sleep' },
      { action: 'setStatus', cardId: 'summarizer-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'summarizer-task', glow: true },
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addOutput', id: 'o7', text: 'summarizer: done', time: '3.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'summarizer-task', statusId: 'complete' },
      { action: 'setGlow', cardId: 'summarizer-task', glow: false },
      { action: 'removeCard', cardId: 'summarizer-task' },
    ],
    [
      { action: 'removeCard', cardId: 'translator-sleep' },
      { action: 'setStatus', cardId: 'translator-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'translator-task', glow: true },
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addOutput', id: 'o8', text: 'translator: done', time: '3.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'translator-task', statusId: 'complete' },
      { action: 'setGlow', cardId: 'translator-task', glow: false },
      { action: 'removeCard', cardId: 'translator-task' },
    ],

    // Phase: Done (steps 24–26)
    [
      { action: 'removeCard', cardId: 'taskgroup' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'addOutput', id: 'o9', text: 'All agents finished', time: '3.0s' },
    ],
    [{ action: 'setStatus', cardId: 'main', statusId: 'complete' }],
    [
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'main' },
    ],
  ],
}

export default event
