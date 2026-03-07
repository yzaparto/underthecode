import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { asyncioColumns, asyncioStatuses } from './layout'

const sourceCode = `import asyncio


async def user_requests(queue):
    for msg in ["Summarize doc", "Write code", "Review PR"]:
        print(f"User: {msg}")
        await queue.put(msg)
        await asyncio.sleep(0.5)
    await queue.put(None)


async def agent_worker(queue):
    while True:
        msg = await queue.get()
        if msg is None:
            break
        print(f"Processing: {msg}...")
        await asyncio.sleep(1)
        print(f"Done: {msg}")
        queue.task_done()


async def main():
    queue = asyncio.Queue(maxsize=2)
    await asyncio.gather(
        user_requests(queue),
        agent_worker(queue),
    )
    print("All messages processed")


asyncio.run(main())`

// line-0:  import asyncio
// line-1:  (empty)
// line-2:  (empty)
// line-3:  async def user_requests(queue):
// line-4:      for msg in ["Summarize doc", "Write code", "Review PR"]:
// line-5:          print(f"User: {msg}")
// line-6:          await queue.put(msg)
// line-7:          await asyncio.sleep(0.5)
// line-8:      await queue.put(None)
// line-9:  (empty)
// line-10: (empty)
// line-11: async def agent_worker(queue):
// line-12:     while True:
// line-13:         msg = await queue.get()
// line-14:         if msg is None:
// line-15:             break
// line-16:         print(f"Processing: {msg}...")
// line-17:         await asyncio.sleep(1)
// line-18:         print(f"Done: {msg}")
// line-19:         queue.task_done()
// line-20: (empty)
// line-21: (empty)
// line-22: async def main():
// line-23:     queue = asyncio.Queue(maxsize=2)
// line-24:     await asyncio.gather(
// line-25:         user_requests(queue),
// line-26:         agent_worker(queue),
// line-27:     )
// line-28:     print("All messages processed")
// line-29: (empty)
// line-30: (empty)
// line-31: asyncio.run(main())

const queues: AnimationDefinition = {
  id: 'asyncio-queues',
  title: 'Async Queues: Producer/Consumer',
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
      title: 'Define user_requests',
      explanation:
        '• The producer coroutine — iterates over three messages\n• Puts each message into the queue, then sleeps briefly\n• Sends `None` as a sentinel to signal "no more work"',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Define agent_worker',
      explanation:
        '• The consumer coroutine — loops forever, pulling from the queue\n• Processes each message with a 1-second delay\n• Breaks out of the loop when it receives `None`',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Define main',
      explanation:
        '• Creates a bounded `asyncio.Queue(maxsize=2)`\n• Uses `gather()` to run producer and consumer concurrently',
      startStep: 3,
      endStep: 3,
    },
    {
      title: 'Start the Event Loop',
      explanation:
        '• `asyncio.run(main())` creates the event loop and enters `main()`\n• The queue is created with a max size of 2',
      startStep: 4,
      endStep: 5,
    },
    {
      title: 'Gather Starts Both',
      explanation:
        '• `gather()` launches `user_requests` and `agent_worker` concurrently\n• The producer starts putting messages; the worker waits for the first one\n• `main()` suspends — it won\'t resume until both finish',
      startStep: 6,
      endStep: 7,
    },
    {
      title: 'Message 1: "Summarize doc"',
      explanation:
        '• Producer puts "Summarize doc" into the queue\n• Worker picks it up, processes for 1 second\n• This is the classic producer/consumer handoff in action',
      startStep: 8,
      endStep: 12,
    },
    {
      title: 'Message 2: "Write code"',
      explanation:
        '• Producer puts "Write code" into the queue\n• Worker processes it the same way\n• The queue decouples production speed from consumption speed',
      startStep: 13,
      endStep: 17,
    },
    {
      title: 'Message 3: "Review PR"',
      explanation:
        '• Final message "Review PR" enters the queue\n• Worker processes it while producer prepares to send the sentinel',
      startStep: 18,
      endStep: 22,
    },
    {
      title: 'Sentinel & Completion',
      explanation:
        '• Producer sends `None` — the sentinel value\n• Worker receives `None`, breaks out of its loop\n• Both coroutines finish, `gather()` returns, and `main()` prints completion',
      startStep: 23,
      endStep: 25,
    },
  ],

  steps: [
    // Phase: Import + Define (steps 0–3)
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-3' }],
    [{ action: 'highlightLine', lineId: 'line-11' }],
    [{ action: 'highlightLine', lineId: 'line-22' }],

    // Phase: Start Event Loop (steps 4–5)
    [
      { action: 'highlightLine', lineId: 'line-31' },
      { action: 'addCard', columnId: 'code', id: 'main', title: 'main()', statusId: 'running' },
    ],
    [{ action: 'highlightLine', lineId: 'line-23' }],

    // Phase: Gather Starts Both (steps 6–7)
    [
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'addCard', columnId: 'loop', id: 'producer', title: 'user_requests()', statusId: 'ready' },
      { action: 'addCard', columnId: 'loop', id: 'worker', title: 'agent_worker()', statusId: 'ready' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'setStatus', cardId: 'main', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'producer', statusId: 'running' },
      { action: 'setGlow', cardId: 'producer', glow: true },
      { action: 'setStatus', cardId: 'worker', statusId: 'suspended' },
    ],

    // Phase: Message 1 — "Summarize doc" (steps 8–12)
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'addOutput', id: 'o1', text: 'User: Summarize doc', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'setStatus', cardId: 'worker', statusId: 'running' },
      { action: 'setGlow', cardId: 'worker', glow: true },
      { action: 'addOutput', id: 'o2', text: 'Processing: Summarize doc...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'setStatus', cardId: 'worker', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'worker', glow: false },
      { action: 'addCard', columnId: 'io', id: 'timer-1', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'timer-1' },
      { action: 'setStatus', cardId: 'worker', statusId: 'running' },
      { action: 'setGlow', cardId: 'worker', glow: true },
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addOutput', id: 'o3', text: 'Done: Summarize doc', time: '1.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'setStatus', cardId: 'worker', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'worker', glow: false },
    ],

    // Phase: Message 2 — "Write code" (steps 13–17)
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'addOutput', id: 'o4', text: 'User: Write code', time: '1.5s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'setStatus', cardId: 'worker', statusId: 'running' },
      { action: 'setGlow', cardId: 'worker', glow: true },
      { action: 'addOutput', id: 'o5', text: 'Processing: Write code...', time: '1.5s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'setStatus', cardId: 'worker', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'worker', glow: false },
      { action: 'addCard', columnId: 'io', id: 'timer-2', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'timer-2' },
      { action: 'setStatus', cardId: 'worker', statusId: 'running' },
      { action: 'setGlow', cardId: 'worker', glow: true },
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addOutput', id: 'o6', text: 'Done: Write code', time: '2.5s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'setStatus', cardId: 'worker', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'worker', glow: false },
    ],

    // Phase: Message 3 — "Review PR" (steps 18–22)
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'addOutput', id: 'o7', text: 'User: Review PR', time: '3.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'setStatus', cardId: 'worker', statusId: 'running' },
      { action: 'setGlow', cardId: 'worker', glow: true },
      { action: 'addOutput', id: 'o8', text: 'Processing: Review PR...', time: '3.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'setStatus', cardId: 'worker', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'worker', glow: false },
      { action: 'addCard', columnId: 'io', id: 'timer-3', title: 'sleep(1)', statusId: 'io', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'timer-3' },
      { action: 'setStatus', cardId: 'worker', statusId: 'running' },
      { action: 'setGlow', cardId: 'worker', glow: true },
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addOutput', id: 'o9', text: 'Done: Review PR', time: '4.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'setStatus', cardId: 'worker', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'worker', glow: false },
    ],

    // Phase: Sentinel & Completion (steps 23–25)
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'setGlow', cardId: 'producer', glow: false },
      { action: 'setStatus', cardId: 'producer', statusId: 'complete' },
      { action: 'removeCard', cardId: 'producer' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'setStatus', cardId: 'worker', statusId: 'complete' },
      { action: 'removeCard', cardId: 'worker' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-28' },
      { action: 'addOutput', id: 'o10', text: 'All messages processed', time: '4.5s' },
      { action: 'setStatus', cardId: 'main', statusId: 'complete' },
      { action: 'removeCard', cardId: 'main' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default queues
