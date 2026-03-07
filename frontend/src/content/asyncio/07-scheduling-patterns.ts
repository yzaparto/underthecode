import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio


async def call_llm(model):
    await asyncio.sleep(2 if model == "claude" else 1)
    return f"Response from {model}"


async def main():
    # 1. Manual create_task
    task1 = asyncio.create_task(call_llm("gpt-4"))
    task2 = asyncio.create_task(call_llm("claude"))
    result1 = await task1
    result2 = await task2
    print(f"Manual: {[result1, result2]}")

    # 2. gather with coroutines
    results = await asyncio.gather(call_llm("gpt-4"), call_llm("claude"))
    print(f"Gather coroutines: {results}")

    # 3. gather with tasks
    tasks = [asyncio.create_task(call_llm(m)) for m in ("gpt-4", "claude")]
    results = await asyncio.gather(*tasks)
    print(f"Gather tasks: {results}")

    # 4. TaskGroup (Python 3.11+)
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(call_llm("gpt-4"))
        t2 = tg.create_task(call_llm("claude"))
    print(f"TaskGroup: {[t1.result(), t2.result()]}")


asyncio.run(main())`

const animation: AnimationDefinition = {
  id: 'asyncio-07-scheduling-patterns',
  title: 'Different Ways to Schedule and Run Tasks',
  columns: asyncioColumns,
  statuses: asyncioStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Import `asyncio`',
      explanation:
        '• Loading the `asyncio` module for async coroutines and event loops',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Start Event Loop',
      explanation:
        '• `asyncio.run(main())` creates the event loop and schedules `main()`\n• `call_llm` is a simple async coroutine using `await asyncio.sleep()`',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Enter `main()`',
      explanation:
        '• `main()` begins executing — four scheduling patterns ahead\n• Each pattern runs the same `call_llm` coroutine concurrently',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Scheduling Patterns Overview',
      explanation:
        '• `main()` will demo four equivalent ways to run concurrent LLM calls\n• Starting with the most explicit: manual `create_task()`',
      startStep: 3,
      endStep: 3,
    },
    {
      title: 'Pattern 1 — Manual `create_task`',
      explanation:
        '• The most explicit approach: call `asyncio.create_task()` for each coroutine individually\n• Then `await` each task one by one\n• Gives direct handles for cancellation or inspection, but requires manual bookkeeping',
      startStep: 4,
      endStep: 15,
    },
    {
      title: 'Pattern 2 — `gather` with Coroutines',
      explanation:
        '• `asyncio.gather()` accepts coroutines directly and creates tasks internally\n• It awaits all of them concurrently in a single expression\n• Returns results in the original order — a much cleaner one-liner',
      startStep: 16,
      endStep: 24,
    },
    {
      title: 'Pattern 3 — `gather` with Tasks',
      explanation:
        '• A hybrid approach: create tasks explicitly with `create_task()`, then pass them to `gather()`\n• Combines direct task handles with the convenience of `gather()` collecting all results',
      startStep: 25,
      endStep: 33,
    },
    {
      title: 'Pattern 4 — `TaskGroup`',
      explanation:
        '• Python 3.11\'s `TaskGroup` provides structured concurrency\n• All tasks are guaranteed to complete or be cancelled when the `async with` block exits\n• The safest and most modern approach, with automatic error propagation',
      startStep: 34,
      endStep: 44,
    },
    {
      title: 'Program Complete',
      explanation:
        '• All four patterns produced identical results\n• `asyncio` provides multiple equivalent ways to achieve concurrency\n• The choice depends on how much control and structure you need',
      startStep: 45,
      endStep: 46,
    },
  ],

  steps: [
    // ── Phase 1: Imports & Program Start (snapshots 1–3) ──

    [{ action: 'highlightLine', lineId: 'line-0' }],

    [
      { action: 'highlightLine', lineId: 'line-32' },
      { action: 'addCard', columnId: 'code', id: 'main', title: 'main()', statusId: 'ready' },
    ],

    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
    ],

    // ── Phase 2: Pattern 1 — Manual create_task (snapshots 4–15) ──

    [{ action: 'highlightLine', lineId: 'line-9' }],

    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'addCard', columnId: 'loop', id: 'm-task1', title: 'task1: llm("gpt-4")', statusId: 'ready' },
    ],

    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addCard', columnId: 'loop', id: 'm-task2', title: 'task2: llm("claude")', statusId: 'ready' },
    ],

    [
      { action: 'setStatus', cardId: 'm-task1', statusId: 'running' },
      { action: 'setStatus', cardId: 'm-task2', statusId: 'running' },
      { action: 'addCard', columnId: 'io', id: 'm-io1', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
      { action: 'addCard', columnId: 'io', id: 'm-io2', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
    ],

    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'm-io1', glow: true },
      { action: 'setGlow', cardId: 'm-io2', glow: true },
    ],

    [
      { action: 'setSpinner', cardId: 'm-io1', hasSpinner: false },
      { action: 'setStatus', cardId: 'm-io1', statusId: 'complete' },
      { action: 'setGlow', cardId: 'm-io1', glow: false },
      { action: 'setStatus', cardId: 'm-task1', statusId: 'complete' },
    ],

    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'removeCard', cardId: 'm-io1' },
    ],

    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
    ],

    [
      { action: 'setSpinner', cardId: 'm-io2', hasSpinner: false },
      { action: 'setStatus', cardId: 'm-io2', statusId: 'complete' },
      { action: 'setGlow', cardId: 'm-io2', glow: false },
      { action: 'setStatus', cardId: 'm-task2', statusId: 'complete' },
    ],

    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'removeCard', cardId: 'm-io2' },
    ],

    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'addOutput', id: 'm-out', text: "Manual: ['Response from gpt-4', 'Response from claude']", time: '2.0s' },
    ],

    [
      { action: 'removeCard', cardId: 'm-task1' },
      { action: 'removeCard', cardId: 'm-task2' },
    ],

    // ── Phase 3: Pattern 2 — gather with Coroutines (snapshots 16–24) ──

    [{ action: 'highlightLine', lineId: 'line-16' }],

    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'addCard', columnId: 'loop', id: 'g1-task1', title: 'gather: llm("gpt-4")', statusId: 'ready' },
      { action: 'addCard', columnId: 'loop', id: 'g1-task2', title: 'gather: llm("claude")', statusId: 'ready' },
    ],

    [
      { action: 'setStatus', cardId: 'g1-task1', statusId: 'running' },
      { action: 'setStatus', cardId: 'g1-task2', statusId: 'running' },
      { action: 'addCard', columnId: 'io', id: 'g1-io1', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
      { action: 'addCard', columnId: 'io', id: 'g1-io2', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
    ],

    [
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'g1-io1', glow: true },
      { action: 'setGlow', cardId: 'g1-io2', glow: true },
    ],

    [
      { action: 'setSpinner', cardId: 'g1-io1', hasSpinner: false },
      { action: 'setStatus', cardId: 'g1-io1', statusId: 'complete' },
      { action: 'setGlow', cardId: 'g1-io1', glow: false },
      { action: 'setStatus', cardId: 'g1-task1', statusId: 'complete' },
      { action: 'removeCard', cardId: 'g1-io1' },
    ],

    [
      { action: 'setSpinner', cardId: 'g1-io2', hasSpinner: false },
      { action: 'setStatus', cardId: 'g1-io2', statusId: 'complete' },
      { action: 'setGlow', cardId: 'g1-io2', glow: false },
      { action: 'setStatus', cardId: 'g1-task2', statusId: 'complete' },
      { action: 'removeCard', cardId: 'g1-io2' },
    ],

    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
    ],

    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addOutput', id: 'g1-out', text: "Gather coroutines: ['Response from gpt-4', 'Response from claude']", time: '4.0s' },
    ],

    [
      { action: 'removeCard', cardId: 'g1-task1' },
      { action: 'removeCard', cardId: 'g1-task2' },
    ],

    // ── Phase 4: Pattern 3 — gather with Tasks (snapshots 25–33) ──

    [{ action: 'highlightLine', lineId: 'line-20' }],

    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addCard', columnId: 'loop', id: 'g2-task1', title: 'task: llm("gpt-4")', statusId: 'ready' },
      { action: 'addCard', columnId: 'loop', id: 'g2-task2', title: 'task: llm("claude")', statusId: 'ready' },
    ],

    [
      { action: 'setStatus', cardId: 'g2-task1', statusId: 'running' },
      { action: 'setStatus', cardId: 'g2-task2', statusId: 'running' },
      { action: 'addCard', columnId: 'io', id: 'g2-io1', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
      { action: 'addCard', columnId: 'io', id: 'g2-io2', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
    ],

    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'g2-io1', glow: true },
      { action: 'setGlow', cardId: 'g2-io2', glow: true },
    ],

    [
      { action: 'setSpinner', cardId: 'g2-io1', hasSpinner: false },
      { action: 'setStatus', cardId: 'g2-io1', statusId: 'complete' },
      { action: 'setGlow', cardId: 'g2-io1', glow: false },
      { action: 'setStatus', cardId: 'g2-task1', statusId: 'complete' },
      { action: 'removeCard', cardId: 'g2-io1' },
    ],

    [
      { action: 'setSpinner', cardId: 'g2-io2', hasSpinner: false },
      { action: 'setStatus', cardId: 'g2-io2', statusId: 'complete' },
      { action: 'setGlow', cardId: 'g2-io2', glow: false },
      { action: 'setStatus', cardId: 'g2-task2', statusId: 'complete' },
      { action: 'removeCard', cardId: 'g2-io2' },
    ],

    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
    ],

    [
      { action: 'highlightLine', lineId: 'line-23' },
      { action: 'addOutput', id: 'g2-out', text: "Gather tasks: ['Response from gpt-4', 'Response from claude']", time: '6.0s' },
    ],

    [
      { action: 'removeCard', cardId: 'g2-task1' },
      { action: 'removeCard', cardId: 'g2-task2' },
    ],

    // ── Phase 5: Pattern 4 — TaskGroup (snapshots 34–44) ──

    [{ action: 'highlightLine', lineId: 'line-25' }],

    [
      { action: 'highlightLine', lineId: 'line-26' },
      { action: 'addCard', columnId: 'loop', id: 'tg-group', title: 'TaskGroup', statusId: 'running' },
    ],

    [
      { action: 'highlightLine', lineId: 'line-27' },
      { action: 'addCard', columnId: 'loop', id: 'tg-task1', title: 'tg: llm("gpt-4")', statusId: 'ready' },
    ],

    [
      { action: 'highlightLine', lineId: 'line-28' },
      { action: 'addCard', columnId: 'loop', id: 'tg-task2', title: 'tg: llm("claude")', statusId: 'ready' },
    ],

    [
      { action: 'setStatus', cardId: 'tg-task1', statusId: 'running' },
      { action: 'setStatus', cardId: 'tg-task2', statusId: 'running' },
      { action: 'addCard', columnId: 'io', id: 'tg-io1', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
      { action: 'addCard', columnId: 'io', id: 'tg-io2', title: 'sleep(2)', statusId: 'io', hasSpinner: true },
    ],

    [
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'tg-io1', glow: true },
      { action: 'setGlow', cardId: 'tg-io2', glow: true },
    ],

    [
      { action: 'setSpinner', cardId: 'tg-io1', hasSpinner: false },
      { action: 'setStatus', cardId: 'tg-io1', statusId: 'complete' },
      { action: 'setGlow', cardId: 'tg-io1', glow: false },
      { action: 'setStatus', cardId: 'tg-task1', statusId: 'complete' },
      { action: 'removeCard', cardId: 'tg-io1' },
    ],

    [
      { action: 'setSpinner', cardId: 'tg-io2', hasSpinner: false },
      { action: 'setStatus', cardId: 'tg-io2', statusId: 'complete' },
      { action: 'setGlow', cardId: 'tg-io2', glow: false },
      { action: 'setStatus', cardId: 'tg-task2', statusId: 'complete' },
      { action: 'removeCard', cardId: 'tg-io2' },
    ],

    [
      { action: 'highlightLine', lineId: 'line-29' },
      { action: 'setStatus', cardId: 'main', statusId: 'running' },
      { action: 'setStatus', cardId: 'tg-group', statusId: 'complete' },
    ],

    [{ action: 'addOutput', id: 'tg-out', text: "TaskGroup: ['Response from gpt-4', 'Response from claude']", time: '8.0s' }],

    [
      { action: 'removeCard', cardId: 'tg-task1' },
      { action: 'removeCard', cardId: 'tg-task2' },
      { action: 'removeCard', cardId: 'tg-group' },
    ],

    // ── Phase 6: Program Complete (snapshots 45–46) ──

    [
      { action: 'highlightLine', lineId: 'line-32' },
      { action: 'setStatus', cardId: 'main', statusId: 'complete' },
    ],

    [
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'main' },
    ],
  ],
}

export default animation
