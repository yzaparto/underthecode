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
    task1 = call_llm("gpt-4")
    task2 = call_llm("claude")
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
// line-11:     task1 = call_llm("gpt-4")
// line-12:     task2 = call_llm("claude")
// line-13:     result1 = await task1
// line-14:     print("GPT-4 done")
// line-15:     result2 = await task2
// line-16:     print("Claude done")
// line-17:     return [result1, result2]
// line-18: (empty)
// line-19: (empty)
// line-20: results = asyncio.run(main())
// line-21: print(results)

const MAIN_SNIPPET = [
  'async def main():',
  '    task1 = call_llm("gpt-4")',
  '    task2 = call_llm("claude")',
  '    result1 = await task1',
  '    print("GPT-4 done")',
  '    result2 = await task2',
  '    print("Claude done")',
  '    return [result1, result2]',
  '',
  'results = asyncio.run(main())',
  'print(results)',
]

const CALL_LLM_SNIPPET = [
  'async def call_llm(model):',
  '    print(f"Calling {model}...")',
  '    await asyncio.sleep(2 if model == "claude" else 1)',
  '    print(f"{model} responded")',
  '    return f"Response from {model}"',
]

const basicCoroutines: AnimationDefinition = {
  id: 'asyncio-basic-coroutines',
  title: 'Basic Coroutines with await',
  columns: asyncioColumns,
  statuses: asyncioStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Import',
      explanation: '• Loading the `asyncio` module — Python\'s built-in async framework',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Define call_llm',
      explanation: '• `async def` makes this a coroutine function\n• Uses `await asyncio.sleep()` instead of `time.sleep()` to simulate the LLM API request\n• This should allow the event loop to do other work during the wait… right?',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define main',
      explanation: '• `main()` creates two coroutine objects: `task1 = call_llm("gpt-4")` and `task2 = call_llm("claude")`\n• Then it awaits them one at a time — first `task1`, then `task2`\n• Does this run them concurrently?',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Start the Event Loop',
      explanation: '• `asyncio.run(main())` creates an event loop and schedules `main()` as the first coroutine\n• The event loop is now running — watch the Event Loop column',
      startStep: 3,
      endStep: 3,
    },
    {
      title: 'Event Loop Starts',
      explanation: '• `main()` enters and assigns `task1 = call_llm("gpt-4")` — this creates a coroutine object but does NOT start it\n• Same for `task2 = call_llm("claude")` — just an unstarted coroutine\n• Neither is scheduled on the event loop yet\n• Now `main()` hits `await task1` — this is when `task1` actually starts executing',
      startStep: 4,
      endStep: 7,
    },
    {
      title: 'Awaiting task1 — call_llm("gpt-4")',
      explanation: '• `main()` suspends and `task1` starts running in the Event Loop\n• `call_llm("gpt-4")` prints a message, then hits `await asyncio.sleep(1)`\n• The coroutine suspends, a 1-second timer starts in Background I/O\n• No other tasks are scheduled — the loop just waits for the timer\n• Timer fires → `task1` resumes, prints "gpt-4 responded", returns',
      startStep: 8,
      endStep: 13,
    },
    {
      title: 'First Result Returns',
      explanation: '• `task1` is complete — `main()` wakes up and gets the result\n• Prints "GPT-4 done"\n• Only NOW does it move on to `await task2`',
      startStep: 14,
      endStep: 16,
    },
    {
      title: 'Awaiting task2 — call_llm("claude")',
      explanation: '• The exact same sequential pattern repeats\n• `main()` suspends → `task2` runs → sleeps 2 seconds → returns\n• Total time: 1 + 2 = 3 seconds — no better than synchronous code!',
      startStep: 17,
      endStep: 22,
    },
    {
      title: 'Completion',
      explanation: '• Both responses collected and returned\n• Despite `async/await`, execution was fully sequential\n• Each `await` blocked `main()` until that coroutine finished\n• To get real concurrency, you need `asyncio.create_task()`',
      startStep: 23,
      endStep: 27,
    },
  ],

  steps: [
    // Phase: Module Setup (steps 0–3) — show code in Module card
    [
      { action: 'addCard', columnId: 'code', id: 'module', title: 'Module', statusId: 'running' },
      { action: 'setCardCode', cardId: 'module', lines: ['import asyncio'], highlightLine: 0 },
      { action: 'highlightLine', lineId: 'line-0' },
    ],
    [
      { action: 'setCardCode', cardId: 'module', lines: CALL_LLM_SNIPPET, highlightLine: 0 },
      { action: 'highlightLine', lineId: 'line-3' },
    ],
    [
      {
        action: 'setCardCode',
        cardId: 'module',
        lines: MAIN_SNIPPET.slice(0, 9),
        highlightLine: 0,
      },
      { action: 'highlightLine', lineId: 'line-10' },
    ],
    [
      {
        action: 'setCardCode',
        cardId: 'module',
        lines: ['results = asyncio.run(main())', 'print(results)'],
        highlightLine: 0,
      },
      { action: 'highlightLine', lineId: 'line-20' },
    ],

    // Phase: Event Loop Starts (steps 4–7) — main() running; highlight shows current line in source
    [
      { action: 'removeCard', cardId: 'module' },
      { action: 'addCard', columnId: 'loop', id: 'main', title: 'main()', statusId: 'running' },
      { action: 'setCardCode', cardId: 'main', lines: MAIN_SNIPPET, highlightLine: 1 },
      { action: 'highlightLine', lineId: 'line-11' },
    ],
    [
      { action: 'setCardHighlight', cardId: 'main', highlightLine: 2 },
      { action: 'highlightLine', lineId: 'line-12' },
    ],
    [
      { action: 'setCardHighlight', cardId: 'main', highlightLine: 3 },
      { action: 'highlightLine', lineId: 'line-13' },
    ],

    // Phase: Awaiting task1 — call_llm("gpt-4") running on event loop; highlight in source
    [
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'addCard', columnId: 'loop', id: 'task1', title: 'call_llm("gpt-4")', statusId: 'running' },
      { action: 'setCardCode', cardId: 'task1', lines: CALL_LLM_SNIPPET, highlightLine: 0 },
      { action: 'setGlow', cardId: 'task1', glow: true },
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o1', text: 'Calling gpt-4...', time: '0.0s' },
    ],
    [
      { action: 'setCardHighlight', cardId: 'task1', highlightLine: 1 },
      { action: 'highlightLine', lineId: 'line-5' },
    ],
    [
      { action: 'setStatus', cardId: 'task1', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'task1', glow: false },
      { action: 'addCard', columnId: 'io', id: 'timer1', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'timer1' },
      { action: 'setStatus', cardId: 'task1', statusId: 'running' },
      { action: 'setGlow', cardId: 'task1', glow: true },
      { action: 'setCardHighlight', cardId: 'task1', highlightLine: 2 },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o2', text: 'gpt-4 responded', time: '1.0s' },
    ],
    [
      { action: 'setCardHighlight', cardId: 'task1', highlightLine: 3 },
      { action: 'highlightLine', lineId: 'line-7' },
    ],
    [
      { action: 'setStatus', cardId: 'task1', statusId: 'complete' },
      { action: 'setGlow', cardId: 'task1', glow: false },
      { action: 'removeCard', cardId: 'task1' },
    ],

    // Phase: First Result Returns (steps 14–16) — main() running again
    [
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'setCardHighlight', cardId: 'main', highlightLine: 3 },
      { action: 'highlightLine', lineId: 'line-13' },
    ],
    [
      { action: 'setCardHighlight', cardId: 'main', highlightLine: 4 },
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'addOutput', id: 'o3', text: 'GPT-4 done', time: '1.0s' },
    ],
    [
      { action: 'setCardHighlight', cardId: 'main', highlightLine: 5 },
      { action: 'highlightLine', lineId: 'line-15' },
    ],

    // Phase: Awaiting task2 — call_llm("claude") running on event loop
    [
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'addCard', columnId: 'loop', id: 'task2', title: 'call_llm("claude")', statusId: 'running' },
      { action: 'setCardCode', cardId: 'task2', lines: CALL_LLM_SNIPPET, highlightLine: 0 },
      { action: 'setGlow', cardId: 'task2', glow: true },
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'addOutput', id: 'o4', text: 'Calling claude...', time: '1.0s' },
    ],
    [
      { action: 'setCardHighlight', cardId: 'task2', highlightLine: 1 },
      { action: 'highlightLine', lineId: 'line-5' },
    ],
    [
      { action: 'setStatus', cardId: 'task2', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'task2', glow: false },
      { action: 'addCard', columnId: 'io', id: 'timer2', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'timer2' },
      { action: 'setStatus', cardId: 'task2', statusId: 'running' },
      { action: 'setGlow', cardId: 'task2', glow: true },
      { action: 'setCardHighlight', cardId: 'task2', highlightLine: 2 },
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addOutput', id: 'o5', text: 'claude responded', time: '3.0s' },
    ],
    [
      { action: 'setCardHighlight', cardId: 'task2', highlightLine: 3 },
      { action: 'highlightLine', lineId: 'line-7' },
    ],
    [
      { action: 'setStatus', cardId: 'task2', statusId: 'complete' },
      { action: 'setGlow', cardId: 'task2', glow: false },
      { action: 'removeCard', cardId: 'task2' },
    ],

    // Phase: Completion (steps 23–28) — main() running to end
    [
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'setCardHighlight', cardId: 'main', highlightLine: 5 },
      { action: 'highlightLine', lineId: 'line-15' },
    ],
    [
      { action: 'setCardHighlight', cardId: 'main', highlightLine: 6 },
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'addOutput', id: 'o6', text: 'Claude done', time: '3.0s' },
    ],
    [
      { action: 'setCardHighlight', cardId: 'main', highlightLine: 7 },
      { action: 'highlightLine', lineId: 'line-17' },
    ],
    [
      { action: 'setStatus', cardId: 'main', statusId: 'complete' },
      { action: 'setCardHighlight', cardId: 'main', highlightLine: 9 },
      { action: 'highlightLine', lineId: 'line-20' },
    ],
    [
      { action: 'setCardHighlight', cardId: 'main', highlightLine: 10 },
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addOutput', id: 'o7', text: "['Response from gpt-4', 'Response from claude']", time: '3.0s' },
    ],
    [{ action: 'clearHighlights' }, { action: 'removeCard', cardId: 'main' }],
  ],
}

export default basicCoroutines
