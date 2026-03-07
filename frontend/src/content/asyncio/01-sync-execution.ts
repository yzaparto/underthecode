import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import time


def call_llm(model):
    print(f"Calling {model}...")
    time.sleep(2 if model == "claude" else 1)
    print(f"{model} responded")
    return f"Response from {model}"


def main():
    result1 = call_llm("gpt-4")
    print("GPT-4 done")
    result2 = call_llm("claude")
    print("Claude done")
    return [result1, result2]


results = main()
print(results)`

// line-0:  import time
// line-1:  (empty)
// line-2:  (empty)
// line-3:  def call_llm(model):
// line-4:      print(f"Calling {model}...")
// line-5:      time.sleep(2 if model == "claude" else 1)
// line-6:      print(f"{model} responded")
// line-7:      return f"Response from {model}"
// line-8:  (empty)
// line-9:  (empty)
// line-10: def main():
// line-11:     result1 = call_llm("gpt-4")
// line-12:     print("GPT-4 done")
// line-13:     result2 = call_llm("claude")
// line-14:     print("Claude done")
// line-15:     return [result1, result2]
// line-16: (empty)
// line-17: (empty)
// line-18: results = main()
// line-19: print(results)

const syncExecution: AnimationDefinition = {
  id: 'asyncio-sync-execution',
  title: 'Synchronous Execution',
  columns: asyncioColumns,
  statuses: asyncioStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Import',
      explanation: '• Loading the `time` module — we\'ll use `time.sleep()` to simulate a slow LLM API request',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Define call_llm',
      explanation: '• `call_llm(model)` is a regular (synchronous) function\n• It prints a message, sleeps to simulate the LLM API request, then returns a response\n• `time.sleep()` is a blocking call — it freezes the entire thread',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define main',
      explanation: '• `main()` calls `call_llm` twice — once for GPT-4 (1 second), once for Claude (2 seconds)\n• It stores each response and prints a confirmation after each call',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Start Execution',
      explanation: '• `results = main()` kicks everything off\n• Python will execute `main()` line by line, top to bottom\n• Nothing can run in parallel — this is plain synchronous code',
      startStep: 3,
      endStep: 3,
    },
    {
      title: 'Calling call_llm("gpt-4")',
      explanation: '• `main()` enters and calls `call_llm("gpt-4")`\n• The function prints a message, then hits `time.sleep(1)`\n• The entire thread freezes for 1 second — watch the Background I/O column\n• After the sleep, it prints "gpt-4 responded" and returns',
      startStep: 4,
      endStep: 11,
    },
    {
      title: 'First LLM Returns',
      explanation: '• Control returns to `main()`\n• `result1` now holds the response from GPT-4\n• A confirmation message is printed — one second has elapsed',
      startStep: 12,
      endStep: 13,
    },
    {
      title: 'Calling call_llm("claude")',
      explanation: '• `main()` calls `call_llm("claude")` — the same blocking pattern repeats\n• Thread freezes for 2 more seconds with `time.sleep(2)`\n• Total wait: 1 + 2 = 3 seconds because each LLM API request ran one after the other',
      startStep: 14,
      endStep: 20,
    },
    {
      title: 'Completion',
      explanation: '• Both responses collected, `main()` returns the list\n• Total time: ~3 seconds — the LLM API requests ran back-to-back with zero overlap\n• This is the baseline that async code aims to improve',
      startStep: 21,
      endStep: 26,
    },
  ],

  steps: [
    // Phase: Module Setup (steps 0–3)
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-3' }],
    [{ action: 'highlightLine', lineId: 'line-10' }],
    [{ action: 'highlightLine', lineId: 'line-18' }],

    // Phase: Calling call_llm("gpt-4") (steps 4–11)
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'addCard', columnId: 'code', id: 'main', title: 'main()', statusId: 'running' },
    ],
    [{ action: 'highlightLine', lineId: 'line-11' }],
    [{ action: 'highlightLine', lineId: 'line-4' }, { action: 'addOutput', id: 'o1', text: 'Calling gpt-4...', time: '0.0s' }],
    [{ action: 'highlightLine', lineId: 'line-5' }],
    [{ action: 'addCard', columnId: 'io', id: 'sleep1', title: 'time.sleep(1)', statusId: 'io', hasSpinner: true }],
    [{ action: 'removeCard', cardId: 'sleep1' }],
    [{ action: 'highlightLine', lineId: 'line-6' }, { action: 'addOutput', id: 'o2', text: 'gpt-4 responded', time: '1.0s' }],
    [{ action: 'highlightLine', lineId: 'line-7' }],

    // Phase: First LLM Returns (steps 12–13)
    [{ action: 'highlightLine', lineId: 'line-11' }],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'addOutput', id: 'o3', text: 'GPT-4 done', time: '1.0s' },
    ],

    // Phase: Calling call_llm("claude") (steps 14–20)
    [{ action: 'highlightLine', lineId: 'line-13' }],
    [{ action: 'highlightLine', lineId: 'line-4' }, { action: 'addOutput', id: 'o4', text: 'Calling claude...', time: '1.0s' }],
    [{ action: 'highlightLine', lineId: 'line-5' }],
    [{ action: 'addCard', columnId: 'io', id: 'sleep2', title: 'time.sleep(2)', statusId: 'io', hasSpinner: true }],
    [{ action: 'removeCard', cardId: 'sleep2' }],
    [{ action: 'highlightLine', lineId: 'line-6' }, { action: 'addOutput', id: 'o5', text: 'claude responded', time: '3.0s' }],
    [{ action: 'highlightLine', lineId: 'line-7' }],

    // Phase: Completion (steps 21–26)
    [{ action: 'highlightLine', lineId: 'line-13' }],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'addOutput', id: 'o6', text: 'Claude done', time: '3.0s' },
    ],
    [{ action: 'highlightLine', lineId: 'line-15' }],
    [
      { action: 'setStatus', cardId: 'main', statusId: 'complete' },
      { action: 'highlightLine', lineId: 'line-18' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'addOutput', id: 'o7', text: "['Response from gpt-4', 'Response from claude']", time: '3.0s' },
    ],
    [{ action: 'clearHighlights' }, { action: 'removeCard', cardId: 'main' }],
  ],
}

export default syncExecution
