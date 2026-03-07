import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio

lock = asyncio.Lock()
counter = {"tokens": 0}


async def agent(name, amount):
    print(f"{name}: wants to add {amount}")
    async with lock:
        current = counter["tokens"]
        print(f"{name}: read {current}")
        await asyncio.sleep(1)
        counter["tokens"] = current + amount
        print(f"{name}: wrote {current + amount}")


async def main():
    await asyncio.gather(
        agent("gpt-4", 100),
        agent("claude", 200),
    )
    print(f"Total: {counter['tokens']}")


asyncio.run(main())`

// line-0:  import asyncio
// line-1:  (empty)
// line-2:  lock = asyncio.Lock()
// line-3:  counter = {"tokens": 0}
// line-4:  (empty)
// line-5:  (empty)
// line-6:  async def agent(name, amount):
// line-7:      print(f"{name}: wants to add {amount}")
// line-8:      async with lock:
// line-9:          current = counter["tokens"]
// line-10:         print(f"{name}: read {current}")
// line-11:         await asyncio.sleep(1)
// line-12:         counter["tokens"] = current + amount
// line-13:         print(f"{name}: wrote {current + amount}")
// line-14: (empty)
// line-15: (empty)
// line-16: async def main():
// line-17:     await asyncio.gather(
// line-18:         agent("gpt-4", 100),
// line-19:         agent("claude", 200),
// line-20:     )
// line-21:     print(f"Total: {counter['tokens']}")
// line-22: (empty)
// line-23: (empty)
// line-24: asyncio.run(main())

const lock: AnimationDefinition = {
  id: 'asyncio-lock',
  title: 'Lock: Protecting Shared State',
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
      title: 'Setup Globals',
      explanation:
        '• `asyncio.Lock()` creates a mutual-exclusion lock\n• `counter` is shared mutable state — exactly what locks protect',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define agent',
      explanation:
        '• Each agent acquires the lock before reading/writing the counter\n• `async with lock:` ensures only one coroutine is in the critical section at a time',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Define main',
      explanation:
        '• `asyncio.gather()` runs both agents concurrently\n• Without the lock, both could read 0 and overwrite each other\'s result',
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
      title: 'Gather Starts',
      explanation:
        '• `gather()` schedules both agent tasks on the event loop\n• `main()` suspends waiting for both to complete',
      startStep: 5,
      endStep: 7,
    },
    {
      title: 'gpt-4 Acquires Lock',
      explanation:
        '• gpt-4 prints "wants to add 100" and enters `async with lock:`\n• The lock is free — gpt-4 acquires it immediately\n• Reads counter (0), prints it, then hits `sleep(1)` and suspends\n• **The lock is still held** even though gpt-4 is suspended!',
      startStep: 8,
      endStep: 11,
    },
    {
      title: 'claude Blocked on Lock',
      explanation:
        '• claude prints "wants to add 200" and tries `async with lock:`\n• **The lock is held by gpt-4** — claude suspends waiting for it\n• This is the key insight: locks prevent interleaved access at `await` points',
      startStep: 12,
      endStep: 14,
    },
    {
      title: 'gpt-4 Finishes, Releases Lock',
      explanation:
        '• gpt-4 wakes from sleep, writes `counter["tokens"] = 100`\n• Prints "wrote 100" and exits the `async with` block\n• **The lock is released** — claude can now proceed',
      startStep: 15,
      endStep: 18,
    },
    {
      title: 'claude Acquires Lock',
      explanation:
        '• claude wakes up and acquires the now-free lock\n• Reads counter (100 — the correct value!), prints it\n• Hits `sleep(1)`, wakes, writes 300, prints "wrote 300"\n• Without the lock, claude would have read 0 and the total would be wrong',
      startStep: 19,
      endStep: 23,
    },
    {
      title: 'Done',
      explanation:
        '• `gather()` returns — both agents finished\n• "Total: 300" — the correct result thanks to the lock\n• Without locks, concurrent read-modify-write at `await` points corrupts shared state',
      startStep: 24,
      endStep: 26,
    },
  ],

  steps: [
    // Phase: Import (step 0)
    [{ action: 'highlightLine', lineId: 'line-0' }],

    // Phase: Setup Globals (step 1)
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-2', type: 'active' },
        { lineId: 'line-3', type: 'active' },
      ]},
    ],

    // Phase: Define agent (step 2)
    [{ action: 'highlightLine', lineId: 'line-6' }],

    // Phase: Define main (step 3)
    [{ action: 'highlightLine', lineId: 'line-16' }],

    // Phase: Start Event Loop (step 4)
    [
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'addCard', columnId: 'loop', id: 'main', title: 'main()', statusId: 'running' },
    ],

    // Phase: Gather Starts (steps 5–7)
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-17', type: 'active' },
        { lineId: 'line-18', type: 'active' },
        { lineId: 'line-19', type: 'active' },
      ]},
    ],
    [
      { action: 'addCard', columnId: 'loop', id: 'gpt4-task', title: 'agent("gpt-4", 100)', statusId: 'ready' },
      { action: 'addCard', columnId: 'loop', id: 'claude-task', title: 'agent("claude", 200)', statusId: 'ready' },
    ],
    [{ action: 'setStatus', cardId: 'main', statusId: 'suspended' }],

    // Phase: gpt-4 Acquires Lock (steps 8–11)
    [
      { action: 'setStatus', cardId: 'gpt4-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'gpt4-task', glow: true },
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'addOutput', id: 'o1', text: 'gpt-4: wants to add 100', time: '0.0s' },
    ],
    [{ action: 'highlightLine', lineId: 'line-8' }],
    [
      { action: 'highlightLine', lineId: 'line-9' },
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'addOutput', id: 'o2', text: 'gpt-4: read 0', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'setStatus', cardId: 'gpt4-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'gpt4-task', glow: false },
      { action: 'addCard', columnId: 'io', id: 'gpt4-sleep', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],

    // Phase: claude Blocked on Lock (steps 12–14)
    [
      { action: 'setStatus', cardId: 'claude-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'claude-task', glow: true },
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'addOutput', id: 'o3', text: 'claude: wants to add 200', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
    ],
    [
      { action: 'setStatus', cardId: 'claude-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'claude-task', glow: false },
    ],

    // Phase: gpt-4 Finishes, Releases Lock (steps 15–18)
    [
      { action: 'removeCard', cardId: 'gpt4-sleep' },
      { action: 'setStatus', cardId: 'gpt4-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'gpt4-task', glow: true },
      { action: 'highlightLine', lineId: 'line-12' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'addOutput', id: 'o4', text: 'gpt-4: wrote 100', time: '1.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'gpt4-task', statusId: 'complete' },
      { action: 'setGlow', cardId: 'gpt4-task', glow: false },
      { action: 'removeCard', cardId: 'gpt4-task' },
    ],
    [
      { action: 'setStatus', cardId: 'claude-task', statusId: 'ready' },
    ],

    // Phase: claude Acquires Lock (steps 19–23)
    [
      { action: 'setStatus', cardId: 'claude-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'claude-task', glow: true },
      { action: 'highlightLine', lineId: 'line-8' },
    ],
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-9', type: 'active' },
        { lineId: 'line-10', type: 'active' },
      ]},
      { action: 'addOutput', id: 'o5', text: 'claude: read 100', time: '1.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'setStatus', cardId: 'claude-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'claude-task', glow: false },
      { action: 'addCard', columnId: 'io', id: 'claude-sleep', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'claude-sleep' },
      { action: 'setStatus', cardId: 'claude-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'claude-task', glow: true },
      { action: 'highlightLines', entries: [
        { lineId: 'line-12', type: 'active' },
        { lineId: 'line-13', type: 'active' },
      ]},
      { action: 'addOutput', id: 'o6', text: 'claude: wrote 300', time: '2.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'claude-task', statusId: 'complete' },
      { action: 'setGlow', cardId: 'claude-task', glow: false },
      { action: 'removeCard', cardId: 'claude-task' },
    ],

    // Phase: Done (steps 24–26)
    [
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addOutput', id: 'o7', text: 'Total: 300', time: '2.0s' },
    ],
    [{ action: 'setStatus', cardId: 'main', statusId: 'complete' }],
    [
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'main' },
    ],
  ],
}

export default lock
