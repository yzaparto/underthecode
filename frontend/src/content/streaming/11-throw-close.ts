import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { toolsColumns, basicsStatuses } from './layouts'

const sourceCode = `def worker():
    try:
        while True:
            task = yield "Ready for task"
            print(f"Working on: {task}")
    except ValueError as e:
        yield f"Error handled: {e}"
    finally:
        print("Cleanup complete!")


gen = worker()
print(next(gen))  # Start it

print(gen.send("Task 1"))  # Send a task

# Inject an error!
result = gen.throw(ValueError("Bad task!"))
print(result)

# Close the generator
gen.close()
print("Generator closed")`

const throwClose: AnimationDefinition = {
  id: 'streaming-11-throw-close',
  title: 'throw() and close()',
  columns: toolsColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Controlling Generators',
      explanation: '• `send()` — inject values\n• `throw()` — inject exceptions\n• `close()` — shut down gracefully\n• `finally` always runs on close!',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Normal Operation',
      explanation: '• Start the generator with next()\n• Send it a task to work on\n• Generator processes and yields status',
      startStep: 1,
      endStep: 5,
    },
    {
      title: 'throw() — Inject an Error',
      explanation: '• `gen.throw(ValueError(...))` raises inside generator\n• The except block catches it\n• Generator can recover and continue!',
      startStep: 6,
      endStep: 9,
    },
    {
      title: 'close() — Graceful Shutdown',
      explanation: '• `gen.close()` raises GeneratorExit inside\n• The `finally` block ALWAYS runs\n• Perfect for cleanup (close files, etc.)',
      startStep: 10,
      endStep: 12,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-0' },
      { action: 'addCard', columnId: 'generator', id: 'api', title: 'Generator Control API', statusId: 'waiting' },
      { action: 'addCard', columnId: 'flow', id: 'a1', title: 'send(val) → inject value', statusId: 'receiving' },
      { action: 'addCard', columnId: 'flow', id: 'a2', title: 'throw(err) → inject error', statusId: 'paused' },
      { action: 'addCard', columnId: 'flow', id: 'a3', title: 'close() → shutdown', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'removeCard', cardId: 'api' },
      { action: 'removeCard', cardId: 'a1' },
      { action: 'removeCard', cardId: 'a2' },
      { action: 'removeCard', cardId: 'a3' },
      { action: 'addCard', columnId: 'generator', id: 'gen', title: 'worker()', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-12' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addOutput', id: 'o1', text: 'Ready for task', time: '0.0s' },
      { action: 'addCard', columnId: 'flow', id: 'ready', title: '✅ Ready for task', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'removeCard', cardId: 'ready' },
      { action: 'addCard', columnId: 'flow', id: 'task1', title: '📥 send("Task 1")', statusId: 'receiving' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'removeCard', cardId: 'task1' },
      { action: 'addOutput', id: 'o2', text: 'Working on: Task 1', time: '0.0s' },
      { action: 'addOutput', id: 'o3', text: 'Ready for task', time: '0.0s' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'setGlow', cardId: 'gen', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'addCard', columnId: 'flow', id: 'throw', title: '💥 throw(ValueError)', statusId: 'paused' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'removeCard', cardId: 'throw' },
      { action: 'addCard', columnId: 'flow', id: 'catch', title: '🛡️ except caught it!', statusId: 'running' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'removeCard', cardId: 'catch' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'addCard', columnId: 'flow', id: 'recover', title: '✅ Recovered with response', statusId: 'value' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'removeCard', cardId: 'recover' },
      { action: 'addOutput', id: 'o4', text: 'Error handled: Bad task!', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addCard', columnId: 'flow', id: 'close', title: '🔒 close() called', statusId: 'done' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'removeCard', cardId: 'close' },
      { action: 'addCard', columnId: 'flow', id: 'finally', title: '🧹 finally block runs!', statusId: 'running' },
      { action: 'addOutput', id: 'o5', text: 'Cleanup complete!', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'setStatus', cardId: 'gen', statusId: 'done' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'removeCard', cardId: 'finally' },
      { action: 'addOutput', id: 'o6', text: 'Generator closed', time: '0.0s' },
      { action: 'addCard', columnId: 'flow', id: 'done', title: '✅ Clean shutdown!', statusId: 'done' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default throwClose
