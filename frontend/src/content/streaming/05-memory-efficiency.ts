import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `import sys


def list_squares(n):
    """Returns a list of squares - all in memory."""
    return [i * i for i in range(n)]


def gen_squares(n):
    """Yields squares one at a time."""
    for i in range(n):
        yield i * i


# Compare memory for 1 million numbers
n = 1_000_000

# List approach
squares_list = list_squares(n)
list_mem = sys.getsizeof(squares_list)
print(f"List memory: {list_mem:,} bytes")

# Generator approach  
squares_gen = gen_squares(n)
gen_mem = sys.getsizeof(squares_gen)
print(f"Generator memory: {gen_mem:,} bytes")

# Ratio
print(f"List uses {list_mem // gen_mem}x more memory!")`

const memoryEfficiency: AnimationDefinition = {
  id: 'streaming-memory-efficiency',
  title: 'Memory Efficiency',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define Approaches',
      explanation: '• `list_squares()` builds a complete list in memory\n• `gen_squares()` yields values one at a time\n• Both produce the same sequence of numbers',
      startStep: 0,
      endStep: 2,
    },
    {
      title: 'List Memory Usage',
      explanation: '• Creating the list allocates space for 1 million integers\n• Python lists store object pointers plus overhead\n• Memory grows linearly with the number of elements',
      startStep: 3,
      endStep: 6,
    },
    {
      title: 'Generator Memory Usage',
      explanation: '• Creating the generator allocates a tiny fixed-size object\n• It stores only the function state and local variables\n• Memory is constant regardless of how many values it will produce',
      startStep: 7,
      endStep: 9,
    },
    {
      title: 'Compare Results',
      explanation: '• The list uses millions of bytes for 1M integers\n• The generator uses only ~200 bytes total\n• This is the fundamental memory advantage of streaming',
      startStep: 10,
      endStep: 11,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-3' }],
    [{ action: 'highlightLine', lineId: 'line-8' }],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addOutput', id: 'o1', text: 'n = 1,000,000', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'addCard', columnId: 'code', id: 'build', title: 'list_squares(n)', statusId: 'running' },
    ],
    [
      { action: 'addCard', columnId: 'memory', id: 'list-mem', title: 'List: 1M integers', statusId: 'buffered', hasSpinner: true },
      { action: 'addOutput', id: 'o2', text: 'Building list of 1M squares...', time: '0.5s' },
    ],
    [
      { action: 'setStatus', cardId: 'build', statusId: 'complete' },
      { action: 'removeCard', cardId: 'build' },
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'setSpinner', cardId: 'list-mem', hasSpinner: false },
      { action: 'addOutput', id: 'o3', text: 'List memory: 8,448,728 bytes', time: '1.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-22' },
      { action: 'addCard', columnId: 'generator', id: 'gen', title: 'gen_squares(n)', statusId: 'ready' },
    ],
    [
      { action: 'addCard', columnId: 'memory', id: 'gen-mem', title: 'Generator object', statusId: 'ready' },
      { action: 'addOutput', id: 'o4', text: 'Generator created instantly', time: '1.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-24' },
      { action: 'addOutput', id: 'o5', text: 'Generator memory: 208 bytes', time: '1.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-27' },
      { action: 'addOutput', id: 'o6', text: 'List uses 40,618x more memory!', time: '1.0s' },
    ],
    [
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'gen' },
      { action: 'removeCard', cardId: 'gen-mem' },
    ],
  ],
}

export default memoryEfficiency
