import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { expertColumns, basicsStatuses } from './layouts'

const sourceCode = `from contextlib import contextmanager


@contextmanager
def database_connection(db_name):
    print(f"Opening {db_name}...")
    conn = {"db": db_name, "open": True}
    try:
        yield conn  # Give connection to caller
    finally:
        print(f"Closing {db_name}...")
        conn["open"] = False


# Usage - cleanup is GUARANTEED!
with database_connection("users.db") as conn:
    print(f"Using: {conn}")
    # Even if exception here, finally runs!

print("Connection safely closed")`

const contextManager: AnimationDefinition = {
  id: 'streaming-17-context',
  title: '@contextmanager',
  columns: expertColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Generators as Context Managers',
      explanation: '• `@contextmanager` turns a generator into a context manager\n• Code before `yield` = setup (__enter__)\n• Code after `yield` = cleanup (__exit__)\n• `finally` ensures cleanup even on exceptions!',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'Enter the Context',
      explanation: '• `with database_connection(...) as conn:` triggers entry\n• Runs until `yield conn`\n• The yielded value becomes `conn`',
      startStep: 2,
      endStep: 5,
    },
    {
      title: 'Use the Resource',
      explanation: '• Inside `with` block, we have the connection\n• Generator is PAUSED at yield\n• Waiting for us to finish',
      startStep: 6,
      endStep: 7,
    },
    {
      title: 'Exit and Cleanup',
      explanation: '• Leaving `with` block resumes the generator\n• `finally` block runs — cleanup guaranteed!\n• Even if an exception occurred, cleanup happens',
      startStep: 8,
      endStep: 11,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'addCard', columnId: 'context', id: 'dec', title: '@contextmanager', statusId: 'waiting' },
      { action: 'addCard', columnId: 'result', id: 'r1', title: 'Before yield = __enter__', statusId: 'created' },
      { action: 'addCard', columnId: 'result', id: 'r2', title: 'yield value = resource', statusId: 'value' },
      { action: 'addCard', columnId: 'result', id: 'r3', title: 'After yield = __exit__', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'removeCard', cardId: 'r1' },
      { action: 'removeCard', cardId: 'r2' },
      { action: 'removeCard', cardId: 'r3' },
      { action: 'addCard', columnId: 'result', id: 'struct', title: 'try/yield/finally pattern', statusId: 'waiting' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'removeCard', cardId: 'dec' },
      { action: 'removeCard', cardId: 'struct' },
      { action: 'addCard', columnId: 'context', id: 'ctx', title: 'with database_connection(...)', statusId: 'running' },
      { action: 'setGlow', cardId: 'ctx', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'addCard', columnId: 'result', id: 'setup1', title: '🔧 SETUP phase', statusId: 'running' },
    ],
    [
      { action: 'addOutput', id: 'o1', text: 'Opening users.db...', time: '0.0s' },
      { action: 'addCard', columnId: 'result', id: 'conn', title: '📦 conn created', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'removeCard', cardId: 'setup1' },
      { action: 'setStatus', cardId: 'ctx', statusId: 'paused' },
      { action: 'addCard', columnId: 'result', id: 'yield', title: '⏸️ yield conn → as conn', statusId: 'value' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'removeCard', cardId: 'yield' },
      { action: 'addCard', columnId: 'result', id: 'use', title: '✅ Inside with block', statusId: 'running' },
    ],
    [
      { action: 'addOutput', id: 'o2', text: "Using: {'db': 'users.db', 'open': True}", time: '0.0s' },
      { action: 'addCard', columnId: 'result', id: 'note', title: '💡 Generator paused, waiting', statusId: 'paused' },
    ],
    [
      { action: 'removeCard', cardId: 'use' },
      { action: 'removeCard', cardId: 'note' },
      { action: 'setStatus', cardId: 'ctx', statusId: 'running' },
      { action: 'setGlow', cardId: 'ctx', glow: true },
      { action: 'addCard', columnId: 'result', id: 'exit', title: '🧹 EXIT phase (finally)', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'addOutput', id: 'o3', text: 'Closing users.db...', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'removeCard', cardId: 'conn' },
      { action: 'addCard', columnId: 'result', id: 'closed', title: '🔒 conn["open"] = False', statusId: 'done' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'setStatus', cardId: 'ctx', statusId: 'done' },
      { action: 'setGlow', cardId: 'ctx', glow: false },
      { action: 'removeCard', cardId: 'exit' },
      { action: 'addOutput', id: 'o4', text: 'Connection safely closed', time: '0.0s' },
      { action: 'addCard', columnId: 'result', id: 'win', title: '✅ Cleanup guaranteed!', statusId: 'receiving' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default contextManager
