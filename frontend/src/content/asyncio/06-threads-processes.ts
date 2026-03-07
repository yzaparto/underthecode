import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio
from concurrent.futures import ProcessPoolExecutor


def call_llm_sync(model):
    print(f"Calling {model}...")
    import time; time.sleep(2 if model == "claude" else 1)
    print(f"{model} responded")
    return f"Response from {model}"


async def main():
    # Run in Threads
    task1 = asyncio.create_task(asyncio.to_thread(call_llm_sync, "gpt-4"))
    task2 = asyncio.create_task(asyncio.to_thread(call_llm_sync, "claude"))
    result1 = await task1
    print("Thread: GPT-4 done")
    result2 = await task2
    print("Thread: Claude done")

    # Run in Process Pool
    loop = asyncio.get_running_loop()
    with ProcessPoolExecutor() as executor:
        task3 = loop.run_in_executor(executor, call_llm_sync, "gpt-4")
        task4 = loop.run_in_executor(executor, call_llm_sync, "claude")
        result3 = await task3
        print("Process: GPT-4 done")
        result4 = await task4
        print("Process: Claude done")

    return [result1, result2, result3, result4]


results = asyncio.run(main())
print(results)`

const animation: AnimationDefinition = {
  id: 'asyncio-06-threads-processes',
  title: 'Running Threads and Processes',
  columns: asyncioColumns,
  statuses: asyncioStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Import `asyncio`',
      explanation:
        '• Loading Python\'s async framework for coroutines and event loops',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Import `ProcessPoolExecutor`',
      explanation:
        '• From `concurrent.futures` — runs blocking functions in separate OS processes\n• Combined with `asyncio`, this lets us offload CPU-bound work',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define `call_llm_sync`',
      explanation:
        '• A regular function (not `async`!) with blocking `time.sleep()` simulating a synchronous LLM API call\n• This is the work we\'ll offload to threads and processes',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Define `main`',
      explanation:
        '• An `async` function with two sections: threads and processes\n• Each section schedules `call_llm_sync` in a different executor',
      startStep: 3,
      endStep: 3,
    },
    {
      title: 'Start Event Loop',
      explanation:
        '• `asyncio.run(main())` creates the event loop and enters `main()`\n• About to schedule blocking LLM calls in threads first',
      startStep: 4,
      endStep: 4,
    },
    {
      title: 'Scheduling Thread Tasks',
      explanation:
        '• `main()` uses `asyncio.to_thread()` to wrap the synchronous `call_llm_sync` function\n• This lets it run in a thread pool managed by the event loop\n• Two thread tasks are created, each beginning execution in a separate OS thread',
      startStep: 5,
      endStep: 9,
    },
    {
      title: 'Threads Execute Concurrently',
      explanation:
        '• Both threads run with true OS-level concurrency — they bypass the GIL for I/O-bound work like LLM API calls\n• Each thread blocks independently while the event loop remains free\n• GPT-4 finishes first because its call takes only 1 second',
      startStep: 10,
      endStep: 15,
    },
    {
      title: 'Collecting Thread Results',
      explanation:
        '• `main()` resumes to `await` each thread task\n• Since both threads have already completed, the awaits return immediately with the LLM responses',
      startStep: 16,
      endStep: 20,
    },
    {
      title: 'Scheduling Process Pool Tasks',
      explanation:
        '• The second section uses a `ProcessPoolExecutor` for CPU-bound work\n• `loop.run_in_executor()` submits `call_llm_sync` to separate OS processes\n• These bypass the GIL entirely and achieve true parallelism',
      startStep: 21,
      endStep: 27,
    },
    {
      title: 'Processes Execute Concurrently',
      explanation:
        '• Both worker processes execute `call_llm_sync` simultaneously in their own memory space\n• The behavior mirrors the thread section, but uses separate processes\n• Ideal for CPU-intensive work that needs to bypass the GIL',
      startStep: 28,
      endStep: 33,
    },
    {
      title: 'Collecting Process Results',
      explanation:
        '• `main()` resumes to collect the process results\n• As with threads, both processes have already finished — the awaits return immediately',
      startStep: 34,
      endStep: 38,
    },
    {
      title: 'Return & Final Output',
      explanation:
        '• `main()` returns all four LLM responses as a list\n• `asyncio.run()` completes and the program prints the combined results\n• Both thread and process sections produced identical output',
      startStep: 39,
      endStep: 42,
    },
  ],

  steps: [
    // ── Phase 1: Imports & Program Start (snapshots 1–4) ──

    [{ action: 'highlightLine', lineId: 'line-0' }],

    [{ action: 'highlightLine', lineId: 'line-1' }],

    [{ action: 'highlightLine', lineId: 'line-33' }, { action: 'addCard', columnId: 'code', id: 'main', title: 'main()', statusId: 'ready' }],

    [{ action: 'highlightLine', lineId: 'line-11' }, { action: 'setStatus', cardId: 'main', statusId: 'running' }],

    // ── Phase 2: Scheduling Thread Tasks (snapshots 5–9) ──

    [{ action: 'highlightLine', lineId: 'line-12' }],

    [{ action: 'highlightLine', lineId: 'line-13' }, { action: 'addCard', columnId: 'loop', id: 'task1', title: 'task1: to_thread("gpt-4")', statusId: 'ready' }],

    [{ action: 'setStatus', cardId: 'task1', statusId: 'running' }, { action: 'addCard', columnId: 'io', id: 'thread1-io', title: 'Thread: call_llm("gpt-4")', statusId: 'io', hasSpinner: true }],

    [{ action: 'highlightLine', lineId: 'line-14' }, { action: 'addCard', columnId: 'loop', id: 'task2', title: 'task2: to_thread("claude")', statusId: 'ready' }],

    [{ action: 'setStatus', cardId: 'task2', statusId: 'running' }, { action: 'addCard', columnId: 'io', id: 'thread2-io', title: 'Thread: call_llm("claude")', statusId: 'io', hasSpinner: true }],

    // ── Phase 3: Threads Execute Concurrently (snapshots 10–15) ──

    [{ action: 'highlightLine', lineId: 'line-15' }, { action: 'setStatus', cardId: 'main', statusId: 'suspended' }, { action: 'setGlow', cardId: 'thread1-io', glow: true }, { action: 'setGlow', cardId: 'thread2-io', glow: true }],

    [{ action: 'highlightLine', lineId: 'line-5' }, { action: 'addOutput', id: 't-do-1', text: 'Calling gpt-4...', time: '0.0s' }],

    [{ action: 'addOutput', id: 't-do-2', text: 'Calling claude...', time: '0.0s' }],

    [{ action: 'highlightLine', lineId: 'line-6' }],

    [{ action: 'highlightLine', lineId: 'line-7' }, { action: 'addOutput', id: 't-done-1', text: 'gpt-4 responded', time: '1.0s' }, { action: 'setSpinner', cardId: 'thread1-io', hasSpinner: false }, { action: 'setStatus', cardId: 'thread1-io', statusId: 'complete' }, { action: 'setGlow', cardId: 'thread1-io', glow: false }],

    [{ action: 'addOutput', id: 't-done-2', text: 'claude responded', time: '2.0s' }, { action: 'setSpinner', cardId: 'thread2-io', hasSpinner: false }, { action: 'setStatus', cardId: 'thread2-io', statusId: 'complete' }, { action: 'setGlow', cardId: 'thread2-io', glow: false }],

    // ── Phase 4: Collecting Thread Results (snapshots 16–20) ──

    [{ action: 'highlightLine', lineId: 'line-15' }, { action: 'setStatus', cardId: 'main', statusId: 'running' }, { action: 'setStatus', cardId: 'task1', statusId: 'complete' }, { action: 'removeCard', cardId: 'thread1-io' }],

    [{ action: 'highlightLine', lineId: 'line-16' }, { action: 'addOutput', id: 't-print-1', text: 'Thread: GPT-4 done', time: '2.0s' }],

    [{ action: 'highlightLine', lineId: 'line-17' }, { action: 'setStatus', cardId: 'task2', statusId: 'complete' }, { action: 'removeCard', cardId: 'thread2-io' }],

    [{ action: 'highlightLine', lineId: 'line-18' }, { action: 'addOutput', id: 't-print-2', text: 'Thread: Claude done', time: '2.0s' }],

    [{ action: 'removeCard', cardId: 'task1' }, { action: 'removeCard', cardId: 'task2' }],

    // ── Phase 5: Scheduling Process Pool Tasks (snapshots 21–27) ──

    [{ action: 'highlightLine', lineId: 'line-20' }],

    [{ action: 'highlightLine', lineId: 'line-21' }],

    [{ action: 'highlightLine', lineId: 'line-22' }],

    [{ action: 'highlightLine', lineId: 'line-23' }, { action: 'addCard', columnId: 'loop', id: 'task3', title: 'task3: executor("gpt-4")', statusId: 'ready' }],

    [{ action: 'setStatus', cardId: 'task3', statusId: 'running' }, { action: 'addCard', columnId: 'io', id: 'process1-io', title: 'Process: call_llm("gpt-4")', statusId: 'io', hasSpinner: true }],

    [{ action: 'highlightLine', lineId: 'line-24' }, { action: 'addCard', columnId: 'loop', id: 'task4', title: 'task4: executor("claude")', statusId: 'ready' }],

    [{ action: 'setStatus', cardId: 'task4', statusId: 'running' }, { action: 'addCard', columnId: 'io', id: 'process2-io', title: 'Process: call_llm("claude")', statusId: 'io', hasSpinner: true }],

    // ── Phase 6: Processes Execute Concurrently (snapshots 28–33) ──

    [{ action: 'highlightLine', lineId: 'line-25' }, { action: 'setStatus', cardId: 'main', statusId: 'suspended' }, { action: 'setGlow', cardId: 'process1-io', glow: true }, { action: 'setGlow', cardId: 'process2-io', glow: true }],

    [{ action: 'highlightLine', lineId: 'line-5' }, { action: 'addOutput', id: 'p-do-1', text: 'Calling gpt-4...', time: '2.0s' }],

    [{ action: 'addOutput', id: 'p-do-2', text: 'Calling claude...', time: '2.0s' }],

    [{ action: 'highlightLine', lineId: 'line-6' }],

    [{ action: 'highlightLine', lineId: 'line-7' }, { action: 'addOutput', id: 'p-done-1', text: 'gpt-4 responded', time: '3.0s' }, { action: 'setSpinner', cardId: 'process1-io', hasSpinner: false }, { action: 'setStatus', cardId: 'process1-io', statusId: 'complete' }, { action: 'setGlow', cardId: 'process1-io', glow: false }],

    [{ action: 'addOutput', id: 'p-done-2', text: 'claude responded', time: '4.0s' }, { action: 'setSpinner', cardId: 'process2-io', hasSpinner: false }, { action: 'setStatus', cardId: 'process2-io', statusId: 'complete' }, { action: 'setGlow', cardId: 'process2-io', glow: false }],

    // ── Phase 7: Collecting Process Results (snapshots 34–38) ──

    [{ action: 'highlightLine', lineId: 'line-25' }, { action: 'setStatus', cardId: 'main', statusId: 'running' }, { action: 'setStatus', cardId: 'task3', statusId: 'complete' }, { action: 'removeCard', cardId: 'process1-io' }],

    [{ action: 'highlightLine', lineId: 'line-26' }, { action: 'addOutput', id: 'p-print-1', text: 'Process: GPT-4 done', time: '4.0s' }],

    [{ action: 'highlightLine', lineId: 'line-27' }, { action: 'setStatus', cardId: 'task4', statusId: 'complete' }, { action: 'removeCard', cardId: 'process2-io' }],

    [{ action: 'highlightLine', lineId: 'line-28' }, { action: 'addOutput', id: 'p-print-2', text: 'Process: Claude done', time: '4.0s' }],

    [{ action: 'removeCard', cardId: 'task3' }, { action: 'removeCard', cardId: 'task4' }],

    // ── Phase 8: Return & Final Output (snapshots 39–42) ──

    [{ action: 'highlightLine', lineId: 'line-30' }, { action: 'setStatus', cardId: 'main', statusId: 'complete' }],

    [{ action: 'highlightLine', lineId: 'line-33' }],

    [{ action: 'highlightLine', lineId: 'line-34' }, { action: 'addOutput', id: 'final', text: "['Response from gpt-4', 'Response from claude', 'Response from gpt-4', 'Response from claude']", time: '4.0s' }],

    [{ action: 'clearHighlights' }, { action: 'removeCard', cardId: 'main' }],
  ],
}

export default animation
