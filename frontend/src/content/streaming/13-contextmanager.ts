import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `from contextlib import contextmanager


@contextmanager
def managed_resource(name):
    """Generator-based context manager."""
    print(f"Acquiring {name}")
    resource = {"name": name, "active": True}
    try:
        yield resource  # Give to 'with' block
    finally:
        resource["active"] = False
        print(f"Releasing {name}")


# Using the context manager
with managed_resource("database") as db:
    print(f"Using: {db}")
    print(f"Active: {db['active']}")

print(f"After: active={db['active']}")`

const contextManager: AnimationDefinition = {
  id: 'streaming-contextmanager',
  title: '@contextmanager',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define Context Manager',
      explanation: '• `@contextmanager` turns a generator into a context manager\n• Code before `yield` is the setup (__enter__)\n• Code after `yield` (in finally) is cleanup (__exit__)\n• The yielded value becomes the `as` target',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'Enter Context',
      explanation: '• `with managed_resource("database")` starts the generator\n• Code runs until `yield resource`\n• "Acquiring database" prints, resource is created\n• The yielded dict becomes `db`',
      startStep: 2,
      endStep: 5,
    },
    {
      title: 'Inside the with Block',
      explanation: '• Code inside `with` executes while generator is suspended\n• `db` is the yielded resource — active and usable\n• The generator waits at the yield point',
      startStep: 6,
      endStep: 8,
    },
    {
      title: 'Exit Context',
      explanation: '• Exiting `with` resumes the generator after yield\n• `finally` block runs, deactivating the resource\n• "Releasing database" prints\n• Cleanup happens even if an exception occurred',
      startStep: 9,
      endStep: 12,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-3' }],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'addCard', columnId: 'generator', id: 'ctx', title: 'managed_resource("database")', statusId: 'running' },
      { action: 'setGlow', cardId: 'ctx', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-5' },
      { action: 'addOutput', id: 'o1', text: 'Acquiring database', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-6' },
      { action: 'addCard', columnId: 'memory', id: 'res', title: '{name: "database", active: True}', statusId: 'buffered' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'setStatus', cardId: 'ctx', statusId: 'yielding' },
      { action: 'addOutput', id: 'o2', text: 'yield resource → db', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'setStatus', cardId: 'ctx', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'ctx', glow: false },
    ],
    [
      { action: 'addOutput', id: 'o3', text: "Using: {'name': 'database', 'active': True}", time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addOutput', id: 'o4', text: 'Active: True', time: '0.0s' },
    ],
    [
      { action: 'addOutput', id: 'o5', text: '(exiting with block)', time: '0.0s' },
      { action: 'setStatus', cardId: 'ctx', statusId: 'running' },
      { action: 'setGlow', cardId: 'ctx', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-10' },
      { action: 'setStatus', cardId: 'res', statusId: 'exhausted' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'addOutput', id: 'o6', text: 'Releasing database', time: '0.0s' },
      { action: 'setStatus', cardId: 'ctx', statusId: 'complete' },
      { action: 'setGlow', cardId: 'ctx', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'addOutput', id: 'o7', text: 'After: active=False', time: '0.0s' },
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'ctx' },
      { action: 'removeCard', cardId: 'res' },
    ],
  ],
}

export default contextManager
