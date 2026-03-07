import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio


async def call_llm(model):
    print(f"Calling {model}...")
    await asyncio.sleep(3)
    print(f"{model} responded")
    return f"Response from {model}"


async def save_history(text):
    print("Saving chat history...")
    await asyncio.sleep(1)
    print("Saved!")


async def main():
    task = asyncio.create_task(call_llm("claude"))
    await asyncio.sleep(1)
    task.cancel()
    try:
        result = await task
    except asyncio.CancelledError:
        print("Claude was too slow — cancelled!")

    save = asyncio.create_task(save_history("log"))
    protected = asyncio.shield(save)
    protected.cancel()
    try:
        await protected
    except asyncio.CancelledError:
        print("Shield blocked the cancel")
    await save
    print("History saved safely!")


asyncio.run(main())`

// line-0:  import asyncio
// line-1:  (empty)
// line-2:  (empty)
// line-3:  async def call_llm(model):
// line-4:      print(f"Calling {model}...")
// line-5:      await asyncio.sleep(3)
// line-6:      print(f"{model} responded")
// line-7:      return f"Response from {model}"
// line-8:  (empty)
// line-9:  (empty)
// line-10: async def save_history(text):
// line-11:     print("Saving chat history...")
// line-12:     await asyncio.sleep(1)
// line-13:     print("Saved!")
// line-14: (empty)
// line-15: (empty)
// line-16: async def main():
// line-17:     task = asyncio.create_task(call_llm("claude"))
// line-18:     await asyncio.sleep(1)
// line-19:     task.cancel()
// line-20:     try:
// line-21:         result = await task
// line-22:     except asyncio.CancelledError:
// line-23:         print("Claude was too slow — cancelled!")
// line-24: (empty)
// line-25:     save = asyncio.create_task(save_history("log"))
// line-26:     protected = asyncio.shield(save)
// line-27:     protected.cancel()
// line-28:     try:
// line-29:         await protected
// line-30:     except asyncio.CancelledError:
// line-31:         print("Shield blocked the cancel")
// line-32:     await save
// line-33:     print("History saved safely!")
// line-34: (empty)
// line-35: (empty)
// line-36: asyncio.run(main())

const cancellation: AnimationDefinition = {
  id: 'asyncio-cancellation',
  title: 'Cancellation and shield',
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
        '• An async coroutine that simulates an LLM API call\n• Takes 3 seconds to respond — long enough to cancel',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define save_history',
      explanation:
        '• A quick 1-second async task to save chat history\n• We\'ll protect this one with `asyncio.shield()`',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Define main',
      explanation:
        '• `main()` demonstrates two patterns:\n• Direct cancellation with `task.cancel()`\n• Protection from cancellation with `asyncio.shield()`',
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
      title: 'Create LLM Task',
      explanation:
        '• `create_task()` schedules `call_llm("claude")` on the event loop\n• `main()` then hits `await asyncio.sleep(1)` and suspends\n• The loop picks up the claude task and starts running it',
      startStep: 5,
      endStep: 6,
    },
    {
      title: 'Running call_llm',
      explanation:
        '• The claude task starts executing — prints "Calling claude..."\n• It hits `await asyncio.sleep(3)` and suspends\n• Both main\'s 1s timer and claude\'s 3s timer are running concurrently',
      startStep: 7,
      endStep: 9,
    },
    {
      title: 'Cancel the Task',
      explanation:
        '• Main\'s 1-second sleep finishes first — main resumes\n• `task.cancel()` sends a cancellation request to the claude task\n• The task and its pending I/O are removed from the loop',
      startStep: 10,
      endStep: 11,
    },
    {
      title: 'Catch CancelledError',
      explanation:
        '• `await task` raises `CancelledError` since the task was cancelled\n• The `except` block catches it gracefully\n• Always wrap `await` of cancellable tasks in try/except!',
      startStep: 12,
      endStep: 14,
    },
    {
      title: 'Shield a Save',
      explanation:
        '• `create_task()` schedules `save_history("log")`\n• `asyncio.shield(save)` wraps the task in a protective layer\n• `protected.cancel()` cancels the shield wrapper — but NOT the underlying task\n• The save task stays alive in the event loop',
      startStep: 15,
      endStep: 17,
    },
    {
      title: 'Shield Catches Cancel',
      explanation:
        '• `await protected` raises `CancelledError` — the shield wrapper was cancelled\n• But the underlying `save` task is still running!\n• `shield()` decouples the outer future from the inner task',
      startStep: 18,
      endStep: 20,
    },
    {
      title: 'Await Save Completes',
      explanation:
        '• `await save` waits for the actual task to finish\n• The save task runs its I/O and completes normally\n• "History saved safely!" — `shield()` protected the critical work',
      startStep: 21,
      endStep: 26,
    },
    {
      title: 'Done',
      explanation:
        '• `main()` completes — both patterns demonstrated\n• `task.cancel()` kills a task; `asyncio.shield()` protects one\n• Use `shield()` for critical operations that must not be interrupted',
      startStep: 27,
      endStep: 28,
    },
  ],

  steps: [
    // Phase: Import (step 0)
    [{ action: 'highlightLine', lineId: 'line-0' }],

    // Phase: Define call_llm (step 1)
    [{ action: 'highlightLine', lineId: 'line-3' }],

    // Phase: Define save_history (step 2)
    [{ action: 'highlightLine', lineId: 'line-10' }],

    // Phase: Define main (step 3)
    [{ action: 'highlightLine', lineId: 'line-16' }],

    // Phase: Start Event Loop (step 4)
    [
      { action: 'highlightLine', lineId: 'line-36' },
      { action: 'addCard', columnId: 'code', id: 'main', title: 'main()', statusId: 'running' },
    ],

    // Phase: Create LLM Task (steps 5–6)
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'addCard', columnId: 'loop', id: 'claude-task', title: 'call_llm("claude")', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'addCard', columnId: 'io', id: 'main-sleep', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],

    // Phase: Running call_llm (steps 7–9)
    [
      { action: 'setStatus', cardId: 'claude-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'claude-task', glow: true },
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o1', text: 'Calling claude...', time: '0.0s' },
    ],
    [{ action: 'highlightLine', lineId: 'line-5' }],
    [
      { action: 'setStatus', cardId: 'claude-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'claude-task', glow: false },
      { action: 'addCard', columnId: 'io', id: 'claude-sleep', title: 'sleep(3)', statusId: 'io', hasSpinner: true },
    ],

    // Phase: Cancel the Task (steps 10–11)
    [
      { action: 'removeCard', cardId: 'main-sleep' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'highlightLine', lineId: 'line-19' },
    ],
    [
      { action: 'removeCard', cardId: 'claude-sleep' },
      { action: 'removeCard', cardId: 'claude-task' },
    ],

    // Phase: Catch CancelledError (steps 12–14)
    [{ action: 'highlightLine', lineId: 'line-20' }],
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-21', type: 'inactive' },
        { lineId: 'line-22', type: 'active' },
      ]},
    ],
    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'addOutput', id: 'o2', text: 'Claude was too slow — cancelled!', time: '1.0s' },
    ],

    // Phase: Shield a Save (steps 15–17)
    [
      { action: 'highlightLine', lineId: 'line-25' },
      { action: 'addCard', columnId: 'loop', id: 'save-task', title: 'save_history("log")', statusId: 'ready' },
    ],
    [{ action: 'highlightLine', lineId: 'line-26' }],
    [{ action: 'highlightLine', lineId: 'line-27' }],

    // Phase: Shield Catches Cancel (steps 18–20)
    [{ action: 'highlightLine', lineId: 'line-28' }],
    [
      { action: 'highlightLines', entries: [
        { lineId: 'line-29', type: 'inactive' },
        { lineId: 'line-30', type: 'active' },
      ]},
    ],
    [
      { action: 'highlightLine', lineId: 'line-31' },
      { action: 'addOutput', id: 'o3', text: 'Shield blocked the cancel', time: '1.0s' },
    ],

    // Phase: Await Save Completes (steps 21–26)
    [
      { action: 'highlightLine', lineId: 'line-32' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
    ],
    [
      { action: 'setStatus', cardId: 'save-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'save-task', glow: true },
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addOutput', id: 'o4', text: 'Saving chat history...', time: '1.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'setStatus', cardId: 'save-task', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'save-task', glow: false },
      { action: 'addCard', columnId: 'io', id: 'save-sleep', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'save-sleep' },
      { action: 'setStatus', cardId: 'save-task', statusId: 'running' },
      { action: 'setGlow', cardId: 'save-task', glow: true },
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'addOutput', id: 'o5', text: 'Saved!', time: '2.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'save-task', statusId: 'complete' },
      { action: 'setGlow', cardId: 'save-task', glow: false },
      { action: 'removeCard', cardId: 'save-task' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-33' },
      { action: 'addOutput', id: 'o6', text: 'History saved safely!', time: '2.0s' },
    ],

    // Phase: Done (steps 27–28)
    [{ action: 'setStatus', cardId: 'main', statusId: 'complete' }],
    [
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'main' },
    ],
  ],
}

export default cancellation
