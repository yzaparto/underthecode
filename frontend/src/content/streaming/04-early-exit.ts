import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { basicsColumns, basicsStatuses } from './layouts'

const sourceCode = `def search_users():
    print("Searching user 1...")
    yield "alice"
    print("Searching user 2...")
    yield "bob"
    print("Searching user 3...")
    yield "charlie"
    print("Searching user 4...")
    yield "diana"
    print("Done searching all!")


# Find "bob" and STOP - don't search the rest!
for user in search_users():
    print(f"Checking: {user}")
    if user == "bob":
        print("Found bob! Stopping.")
        break

print("Search complete")`

const earlyExit: AnimationDefinition = {
  id: 'streaming-04-early-exit',
  title: 'Why Generators? Early Exit',
  columns: basicsColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'A Search Generator',
      explanation: '• Imagine each yield is an expensive database query\n• With a list, you\'d query ALL users first\n• With a generator, you query ONE AT A TIME',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Search Until Found',
      explanation: '• We\'re looking for "bob"\n• The generator searches one user at a time\n• Watch: we\'ll stop as soon as we find him!',
      startStep: 1,
      endStep: 3,
    },
    {
      title: 'First User: alice',
      explanation: '• Generator yields "alice"\n• Not who we want, continue searching',
      startStep: 4,
      endStep: 7,
    },
    {
      title: 'Second User: bob — FOUND!',
      explanation: '• Generator yields "bob"\n• That\'s who we want! We `break` out of the loop\n• The generator NEVER searches for charlie or diana!',
      startStep: 8,
      endStep: 14,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-0' },
      { action: 'addCard', columnId: 'viz', id: 'info', title: '🔍 Each yield = expensive search', statusId: 'waiting' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'removeCard', cardId: 'info' },
      { action: 'addCard', columnId: 'viz', id: 'gen', title: 'search_users()', statusId: 'created' },
      { action: 'addCard', columnId: 'viz', id: 'goal', title: '🎯 Looking for: "bob"', statusId: 'waiting' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-1' },
      { action: 'addOutput', id: 'o1', text: 'Searching user 1...', time: '0.0s' },
      { action: 'addCard', columnId: 'viz', id: 'search', title: '⏳ Searching...', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-2' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'removeCard', cardId: 'search' },
      { action: 'addCard', columnId: 'viz', id: 'found', title: '📤 Found: "alice"', statusId: 'value' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'removeCard', cardId: 'found' },
      { action: 'addOutput', id: 'o2', text: 'Checking: alice', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addCard', columnId: 'viz', id: 'check1', title: '❌ "alice" != "bob"', statusId: 'created' },
    ],
    [
      { action: 'removeCard', cardId: 'check1' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'setGlow', cardId: 'gen', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'addOutput', id: 'o3', text: 'Searching user 2...', time: '0.0s' },
      { action: 'addCard', columnId: 'viz', id: 'search2', title: '⏳ Searching...', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-4' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
      { action: 'setGlow', cardId: 'gen', glow: false },
      { action: 'removeCard', cardId: 'search2' },
      { action: 'addCard', columnId: 'viz', id: 'found2', title: '📤 Found: "bob"', statusId: 'value' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'removeCard', cardId: 'found2' },
      { action: 'addOutput', id: 'o4', text: 'Checking: bob', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addCard', columnId: 'viz', id: 'match', title: '✅ "bob" == "bob" — MATCH!', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'addOutput', id: 'o5', text: 'Found bob! Stopping.', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'removeCard', cardId: 'match' },
      { action: 'removeCard', cardId: 'goal' },
      { action: 'setStatus', cardId: 'gen', statusId: 'done' },
      { action: 'addCard', columnId: 'viz', id: 'skip', title: '🚀 charlie & diana NEVER searched!', statusId: 'done' },
      { action: 'addCard', columnId: 'viz', id: 'save', title: '💰 Saved 2 expensive searches', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'addOutput', id: 'o6', text: 'Search complete', time: '0.0s' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default earlyExit
