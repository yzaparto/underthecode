import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio

barrier = asyncio.Barrier(3)


async def research_agent(name, delay):
    print(f"{name}: researching...")
    await asyncio.sleep(delay)
    print(f"{name}: research done")
    await barrier.wait()
    print(f"{name}: synthesizing...")
    await asyncio.sleep(1)
    print(f"{name}: complete")


async def main():
    async with asyncio.TaskGroup() as tg:
        tg.create_task(research_agent("agent-A", 1))
        tg.create_task(research_agent("agent-B", 2))
        tg.create_task(research_agent("agent-C", 3))
    print("All agents done")


asyncio.run(main())`

// line-0:  import asyncio
// line-1:  (empty)
// line-2:  barrier = asyncio.Barrier(3)
// line-3:  (empty)
// line-4:  (empty)
// line-5:  async def research_agent(name, delay):
// line-6:      print(f"{name}: researching...")
// line-7:      await asyncio.sleep(delay)
// line-8:      print(f"{name}: research done")
// line-9:      await barrier.wait()
// line-10:     print(f"{name}: synthesizing...")
// line-11:     await asyncio.sleep(1)
// line-12:     print(f"{name}: complete")
// line-13: (empty)
// line-14: (empty)
// line-15: async def main():
// line-16:     async with asyncio.TaskGroup() as tg:
// line-17:         tg.create_task(research_agent("agent-A", 1))
// line-18:         tg.create_task(research_agent("agent-B", 2))
// line-19:         tg.create_task(research_agent("agent-C", 3))
// line-20:     print("All agents done")
// line-21: (empty)
// line-22: (empty)
// line-23: asyncio.run(main())

const barrier: AnimationDefinition = {
  id: 'asyncio-barrier',
  title: 'Barrier: Synchronizing Agents',
  columns: asyncioColumns,
  statuses: asyncioStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Import & Setup',
      explanation:
        '• Loading `asyncio` and creating a `Barrier(3)`\n• Three agents must arrive before any can proceed',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'Define Functions',
      explanation:
        '• `research_agent(name, delay)` — researches, waits at barrier, then synthesizes\n• `main()` — spawns three agents inside a `TaskGroup`',
      startStep: 2,
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
      title: 'Create TaskGroup & Tasks',
      explanation:
        '• `TaskGroup` manages the lifecycle of all child tasks\n• Three agents are scheduled with different research delays (1s, 2s, 3s)',
      startStep: 5,
      endStep: 8,
    },
    {
      title: 'All Agents Start Researching',
      explanation:
        '• Each agent prints its status and hits `await asyncio.sleep(delay)`\n• All three are now suspended, waiting for their I/O to complete\n• They run concurrently — the event loop interleaves them',
      startStep: 9,
      endStep: 14,
    },
    {
      title: 'agent-A Finishes Research (1s)',
      explanation:
        '• agent-A\'s 1-second sleep completes first\n• It calls `barrier.wait()` and suspends — only 1 of 3 have arrived\n• The barrier holds agent-A until all three reach it',
      startStep: 15,
      endStep: 17,
    },
    {
      title: 'agent-B Finishes Research (2s)',
      explanation:
        '• agent-B\'s 2-second sleep completes\n• It calls `barrier.wait()` — now 2 of 3 have arrived\n• Both A and B are waiting at the barrier for C',
      startStep: 18,
      endStep: 20,
    },
    {
      title: 'agent-C Arrives — Barrier Releases!',
      explanation:
        '• agent-C\'s 3-second sleep completes — the last agent arrives!\n• `barrier.wait()` returns for ALL THREE simultaneously\n• This is the key pattern: nobody proceeds until everyone is ready',
      startStep: 21,
      endStep: 24,
    },
    {
      title: 'All Agents Synthesize',
      explanation:
        '• All three agents are now running synthesis in parallel\n• Each prints its status and sleeps for 1 second\n• Thanks to the barrier, they all started this phase together',
      startStep: 25,
      endStep: 30,
    },
    {
      title: 'All Complete',
      explanation:
        '• All agents finish and the `TaskGroup` exits cleanly\n• "All agents done" — the barrier ensured synchronized phases\n• Use `Barrier` when agents must reach a checkpoint before continuing',
      startStep: 31,
      endStep: 35,
    },
  ],

  steps: [
    // Phase: Import & Setup (steps 0–1)
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-2' }],

    // Phase: Define Functions (steps 2–3)
    [{ action: 'highlightLine', lineId: 'line-5' }],
    [{ action: 'highlightLine', lineId: 'line-15' }],

    // Phase: Start Event Loop (step 4)
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'addCard', columnId: 'code', id: 'main', title: 'main()', statusId: 'running' },
    ],

    // Phase: Create TaskGroup & Tasks (steps 5–8)
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'addCard', columnId: 'loop', id: 'task-group', title: 'TaskGroup', statusId: 'running' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'addCard', columnId: 'loop', id: 'agent-a', title: 'agent-A', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addCard', columnId: 'loop', id: 'agent-b', title: 'agent-B', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'addCard', columnId: 'loop', id: 'agent-c', title: 'agent-C', statusId: 'ready' },
    ],

    // Phase: All Agents Start Researching (steps 9–14)
    [
      { action: 'setStatus', cardId: 'agent-a', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-a', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o1', text: 'agent-A: researching...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'agent-a', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'agent-a', glow: false },
      { action: 'addCard', columnId: 'io', id: 'a-sleep', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'setStatus', cardId: 'agent-b', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-b', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o2', text: 'agent-B: researching...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'agent-b', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'agent-b', glow: false },
      { action: 'addCard', columnId: 'io', id: 'b-sleep', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'setStatus', cardId: 'agent-c', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-c', glow: true },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o3', text: 'agent-C: researching...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'setStatus', cardId: 'agent-c', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'agent-c', glow: false },
      { action: 'addCard', columnId: 'io', id: 'c-sleep', title: 'sleep(3)', statusId: 'io', hasSpinner: true },
    ],

    // Phase: agent-A Finishes Research (steps 15–17)
    [
      { action: 'removeCard', cardId: 'a-sleep' },
      { action: 'setStatus', cardId: 'agent-a', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-a', glow: true },
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'addOutput', id: 'o4', text: 'agent-A: research done', time: '1.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'setStatus', cardId: 'agent-a', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'agent-a', glow: false },
    ],
    [
      { action: 'addCard', columnId: 'loop', id: 'barrier', title: 'Barrier 1/3', statusId: 'suspended' },
    ],

    // Phase: agent-B Finishes Research (steps 18–20)
    [
      { action: 'removeCard', cardId: 'b-sleep' },
      { action: 'setStatus', cardId: 'agent-b', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-b', glow: true },
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'addOutput', id: 'o5', text: 'agent-B: research done', time: '2.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'setStatus', cardId: 'agent-b', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'agent-b', glow: false },
    ],
    [
      { action: 'removeCard', cardId: 'barrier' },
      { action: 'addCard', columnId: 'loop', id: 'barrier', title: 'Barrier 2/3', statusId: 'suspended' },
    ],

    // Phase: agent-C Arrives — Barrier Releases! (steps 21–24)
    [
      { action: 'removeCard', cardId: 'c-sleep' },
      { action: 'setStatus', cardId: 'agent-c', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-c', glow: true },
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'addOutput', id: 'o6', text: 'agent-C: research done', time: '3.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-9' },
    ],
    [
      { action: 'removeCard', cardId: 'barrier' },
      { action: 'addCard', columnId: 'loop', id: 'barrier', title: 'Barrier 3/3 — released!', statusId: 'running' },
      { action: 'setGlow', cardId: 'barrier', glow: true },
    ],
    [
      { action: 'removeCard', cardId: 'barrier' },
      { action: 'setStatus', cardId: 'agent-a', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-a', glow: true },
      { action: 'setStatus', cardId: 'agent-b', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-b', glow: true },
      { action: 'setGlow', cardId: 'agent-c', glow: true },
    ],

    // Phase: All Agents Synthesize (steps 25–30)
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'addOutput', id: 'o7', text: 'agent-A: synthesizing...', time: '3.0s' },
    ],
    [
      { action: 'addOutput', id: 'o8', text: 'agent-B: synthesizing...', time: '3.0s' },
      { action: 'addOutput', id: 'o9', text: 'agent-C: synthesizing...', time: '3.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'setStatus', cardId: 'agent-a', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'agent-a', glow: false },
      { action: 'addCard', columnId: 'io', id: 'a-synth', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'setStatus', cardId: 'agent-b', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'agent-b', glow: false },
      { action: 'addCard', columnId: 'io', id: 'b-synth', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'setStatus', cardId: 'agent-c', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'agent-c', glow: false },
      { action: 'addCard', columnId: 'io', id: 'c-synth', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],
    [],

    // Phase: All Complete (steps 31–35)
    [
      { action: 'removeCard', cardId: 'a-synth' },
      { action: 'removeCard', cardId: 'b-synth' },
      { action: 'removeCard', cardId: 'c-synth' },
      { action: 'setStatus', cardId: 'agent-a', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-a', glow: true },
      { action: 'setStatus', cardId: 'agent-b', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-b', glow: true },
      { action: 'setStatus', cardId: 'agent-c', statusId: 'running' },
      { action: 'setGlow', cardId: 'agent-c', glow: true },
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'addOutput', id: 'o10', text: 'agent-A: complete', time: '4.0s' },
      { action: 'addOutput', id: 'o11', text: 'agent-B: complete', time: '4.0s' },
      { action: 'addOutput', id: 'o12', text: 'agent-C: complete', time: '4.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'agent-a', statusId: 'complete' },
      { action: 'setGlow', cardId: 'agent-a', glow: false },
      { action: 'setStatus', cardId: 'agent-b', statusId: 'complete' },
      { action: 'setGlow', cardId: 'agent-b', glow: false },
      { action: 'setStatus', cardId: 'agent-c', statusId: 'complete' },
      { action: 'setGlow', cardId: 'agent-c', glow: false },
      { action: 'removeCard', cardId: 'agent-a' },
      { action: 'removeCard', cardId: 'agent-b' },
      { action: 'removeCard', cardId: 'agent-c' },
    ],
    [
      { action: 'setStatus', cardId: 'task-group', statusId: 'complete' },
      { action: 'removeCard', cardId: 'task-group' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'addOutput', id: 'o13', text: 'All agents done', time: '4.0s' },
      { action: 'setStatus', cardId: 'main', statusId: 'complete' },
    ],
    [
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'main' },
    ],
  ],
}

export default barrier
