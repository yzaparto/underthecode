import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio


async def call_agent(name, delay, should_fail=False):
    print(f"Agent {name} working...")
    await asyncio.sleep(delay)
    if should_fail:
        raise ValueError(f"{name} failed!")
    print(f"Agent {name} done")
    return f"{name}'s result"


async def main():
    try:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(call_agent("researcher", 2))
            tg.create_task(call_agent("coder", 0.5, True))
            tg.create_task(call_agent("reviewer", 1.5))
    except* ValueError as eg:
        print(f"Caught: {eg.exceptions}")
    print("Continuing after error")


asyncio.run(main())`

// line-0:  import asyncio
// line-1:  (empty)
// line-2:  (empty)
// line-3:  async def call_agent(name, delay, should_fail=False):
// line-4:      print(f"Agent {name} working...")
// line-5:      await asyncio.sleep(delay)
// line-6:      if should_fail:
// line-7:          raise ValueError(f"{name} failed!")
// line-8:      print(f"Agent {name} done")
// line-9:      return f"{name}'s result"
// line-10: (empty)
// line-11: (empty)
// line-12: async def main():
// line-13:     try:
// line-14:         async with asyncio.TaskGroup() as tg:
// line-15:             tg.create_task(call_agent("researcher", 2))
// line-16:             tg.create_task(call_agent("coder", 0.5, True))
// line-17:             tg.create_task(call_agent("reviewer", 1.5))
// line-18:     except* ValueError as eg:
// line-19:         print(f"Caught: {eg.exceptions}")
// line-20:     print("Continuing after error")
// line-21: (empty)
// line-22: (empty)
// line-23: asyncio.run(main())

const exceptionGroup: AnimationDefinition = {
  id: 'asyncio-exception-group',
  title: 'Error Handling with ExceptionGroup',
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
        '• An async coroutine that simulates an AI agent with configurable delay\n• If `should_fail=True`, it raises `ValueError` after the sleep\n• Otherwise it completes normally and returns a result',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define main',
      explanation:
        '• Uses `asyncio.TaskGroup()` to run multiple agents concurrently\n• `except*` (Python 3.11+) catches specific exception types from an `ExceptionGroup`',
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
      title: 'Enter TaskGroup',
      explanation:
        '• `async with asyncio.TaskGroup() as tg:` creates a task group\n• Three agents scheduled with different delays: researcher (2s), coder (0.5s, will fail), reviewer (1.5s)\n• All three tasks are ready in the event loop',
      startStep: 4,
      endStep: 6,
    },
    {
      title: 'All Agents Start Working',
      explanation:
        '• All three agents begin executing concurrently\n• Each prints its "working…" message and hits `await asyncio.sleep()`\n• Three I/O timers running: researcher (2s), coder (0.5s), reviewer (1.5s)',
      startStep: 7,
      endStep: 9,
    },
    {
      title: 'Coder Fails First — TaskGroup Aborts',
      explanation:
        '• Coder\'s 0.5s timer completes first — it raises `ValueError`\n• TaskGroup immediately cancels researcher and reviewer (still sleeping!)\n• They never reach their "done" print statements — true cancellation\n• This is the key: one failure aborts all sibling tasks',
      startStep: 10,
      endStep: 13,
    },
    {
      title: 'except* Catches ValueError',
      explanation:
        '• `except* ValueError` catches the `ExceptionGroup` containing coder\'s error\n• Only `ValueError` exceptions are matched — other types would propagate\n• The handler prints the captured exceptions tuple',
      startStep: 14,
      endStep: 16,
    },
    {
      title: 'Continue After Error',
      explanation:
        '• Execution continues normally after the `except*` block\n• "Continuing after error" — the program is not crashed\n• `TaskGroup` + `except*` provide structured, recoverable concurrency',
      startStep: 17,
      endStep: 19,
    },
  ],

  steps: [
    // Phase: Import (step 0)
    [{ action: 'highlightLine', lineId: 'line-0' }],

    // Phase: Define call_agent (step 1)
    [{ action: 'highlightLine', lineId: 'line-3' }],

    // Phase: Define main (step 2)
    [{ action: 'highlightLine', lineId: 'line-12' }],

    // Phase: Start Event Loop (step 3)
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'addCard', columnId: 'loop', id: 'main', title: 'main()', statusId: 'running' },
    ],

    // Phase: Enter TaskGroup (steps 4–6)
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-13', type: 'active' },
        { lineId: 'line-14', type: 'active' },
      ]},
      { action: 'addCard', columnId: 'loop', id: 'taskgroup', title: 'TaskGroup', statusId: 'running' },
      { action: 'setGlow', cardId: 'taskgroup', glow: true },
    ],
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-15', type: 'active' },
        { lineId: 'line-16', type: 'active' },
        { lineId: 'line-17', type: 'active' },
      ]},
    ],
    [
      { action: 'addCard', columnId: 'loop', id: 'researcher', title: 'call_agent("researcher", 2)', statusId: 'ready' },
      { action: 'addCard', columnId: 'loop', id: 'coder', title: 'call_agent("coder", 0.5, True)', statusId: 'ready' },
      { action: 'addCard', columnId: 'loop', id: 'reviewer', title: 'call_agent("reviewer", 1.5)', statusId: 'ready' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
    ],

    // Phase: All Agents Start Working (steps 7–9)
    [
      { action: 'setStatus', cardId: 'researcher', statusId: 'running' },
      { action: 'setGlow', cardId: 'researcher', glow: true },
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o1', text: 'Agent researcher working...', time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'coder', statusId: 'running' },
      { action: 'setGlow', cardId: 'coder', glow: true },
      { action: 'addOutput', id: 'o2', text: 'Agent coder working...', time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'reviewer', statusId: 'running' },
      { action: 'setGlow', cardId: 'reviewer', glow: true },
      { action: 'addOutput', id: 'o3', text: 'Agent reviewer working...', time: '0.0s' },
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'setStatus', cardId: 'researcher', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'researcher', glow: false },
      { action: 'setStatus', cardId: 'coder', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'coder', glow: false },
      { action: 'setStatus', cardId: 'reviewer', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'reviewer', glow: false },
      { action: 'addCard', columnId: 'io', id: 'io-researcher', title: 'sleep(2) researcher', statusId: 'io', hasSpinner: true },
      { action: 'addCard', columnId: 'io', id: 'io-coder', title: 'sleep(0.5) coder', statusId: 'io', hasSpinner: true },
      { action: 'addCard', columnId: 'io', id: 'io-reviewer', title: 'sleep(1.5) reviewer', statusId: 'io', hasSpinner: true },
    ],

    // Phase: Coder Fails First — TaskGroup Aborts (steps 10–13)
    [
      { action: 'removeCard', cardId: 'io-coder' },
      { action: 'setStatus', cardId: 'coder', statusId: 'running' },
      { action: 'setGlow', cardId: 'coder', glow: true },
      { action: 'highlightLines', entries: [
        { lineId: 'line-6', type: 'active' },
        { lineId: 'line-7', type: 'active' },
      ]},
    ],
    [
      { action: 'setStatus', cardId: 'coder', statusId: 'complete' },
      { action: 'setGlow', cardId: 'coder', glow: false },
      { action: 'removeCard', cardId: 'coder' },
      { action: 'setStatus', cardId: 'taskgroup', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'taskgroup', glow: false },
    ],
    [
      { action: 'removeCard', cardId: 'io-researcher' },
      { action: 'removeCard', cardId: 'io-reviewer' },
    ],
    [
      { action: 'removeCard', cardId: 'researcher' },
      { action: 'removeCard', cardId: 'reviewer' },
    ],

    // Phase: except* Catches ValueError (steps 14–16)
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'addOutput', id: 'o4', text: "Caught: (ValueError('coder failed!'),)", time: '0.5s' },
    ],
    [
      { action: 'removeCard', cardId: 'taskgroup' },
    ],

    // Phase: Continue After Error (steps 17–19)
    [
      { action: 'highlightLine', lineId: 'line-20' },
    ],
    [
      { action: 'addOutput', id: 'o5', text: 'Continuing after error', time: '0.5s' },
    ],
    [
      { action: 'setStatus', cardId: 'main', statusId: 'complete' },
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'main' },
    ],
  ],
}

export default exceptionGroup
