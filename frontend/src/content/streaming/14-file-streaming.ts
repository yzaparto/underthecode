import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { pipelineColumns, basicsStatuses } from './layouts'

const sourceCode = `def read_lines(filename):
    """Read file line by line - O(1) memory!"""
    with open(filename) as f:
        for line in f:
            yield line.strip()


def filter_errors(lines):
    """Only yield lines containing ERROR"""
    for line in lines:
        if "ERROR" in line:
            yield line


# Process a 10GB log file with constant memory!
lines = read_lines("huge_log.txt")
errors = filter_errors(lines)

for i, error in enumerate(errors):
    print(error)
    if i >= 2:  # Just show first 3
        break`

const fileStreaming: AnimationDefinition = {
  id: 'streaming-14-file',
  title: 'File Streaming',
  columns: pipelineColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'The Problem',
      explanation: '• File is 10GB — can\'t load into memory!\n• `file.readlines()` would crash\n• Solution: read and process ONE LINE at a time',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'Build the Pipeline',
      explanation: '• `read_lines()` yields one line at a time\n• `filter_errors()` passes through only ERROR lines\n• Memory usage: just ONE line, always!',
      startStep: 2,
      endStep: 4,
    },
    {
      title: 'Process and Break Early',
      explanation: '• We only need first 3 errors\n• `break` stops reading the file early\n• Remaining 9.9GB never even loaded!',
      startStep: 5,
      endStep: 12,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-0' },
      { action: 'addCard', columnId: 'pipeline', id: 'problem', title: '💾 huge_log.txt = 10GB', statusId: 'paused' },
      { action: 'addCard', columnId: 'pipeline', id: 'bad', title: '❌ file.readlines() = 💥 crash', statusId: 'paused' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'removeCard', cardId: 'problem' },
      { action: 'removeCard', cardId: 'bad' },
      { action: 'addCard', columnId: 'pipeline', id: 'good', title: '✅ yield line = O(1) memory', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'removeCard', cardId: 'good' },
      { action: 'addCard', columnId: 'pipeline', id: 'stage1', title: '📂 read_lines("huge_log.txt")', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'addCard', columnId: 'pipeline', id: 'arrow', title: '  ↓', statusId: 'created' },
      { action: 'addCard', columnId: 'pipeline', id: 'stage2', title: '🔍 filter_errors()', statusId: 'created' },
    ],
    [
      { action: 'addCard', columnId: 'pipeline', id: 'ready', title: '✨ Ready — file not opened yet!', statusId: 'created' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'removeCard', cardId: 'ready' },
      { action: 'setStatus', cardId: 'stage1', statusId: 'running' },
      { action: 'setStatus', cardId: 'stage2', statusId: 'running' },
      { action: 'setGlow', cardId: 'stage1', glow: true },
      { action: 'addCard', columnId: 'pipeline', id: 'file', title: '📖 File opened, reading...', statusId: 'running' },
    ],
    [
      { action: 'removeCard', cardId: 'file' },
      { action: 'addCard', columnId: 'pipeline', id: 'l1', title: '📄 "INFO: Starting up"', statusId: 'created' },
      { action: 'addCard', columnId: 'pipeline', id: 'skip1', title: '⏭️ No ERROR, skip', statusId: 'created' },
    ],
    [
      { action: 'removeCard', cardId: 'l1' },
      { action: 'removeCard', cardId: 'skip1' },
      { action: 'addCard', columnId: 'pipeline', id: 'l2', title: '📄 "ERROR: Connection failed"', statusId: 'value' },
      { action: 'addCard', columnId: 'pipeline', id: 'match1', title: '✅ Match! Yielding...', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'removeCard', cardId: 'l2' },
      { action: 'removeCard', cardId: 'match1' },
      { action: 'setGlow', cardId: 'stage1', glow: false },
      { action: 'setStatus', cardId: 'stage1', statusId: 'paused' },
      { action: 'setStatus', cardId: 'stage2', statusId: 'paused' },
      { action: 'addOutput', id: 'o1', text: 'ERROR: Connection failed', time: '0.0s' },
    ],
    [
      { action: 'setStatus', cardId: 'stage1', statusId: 'running' },
      { action: 'setStatus', cardId: 'stage2', statusId: 'running' },
      { action: 'setGlow', cardId: 'stage1', glow: true },
      { action: 'addCard', columnId: 'pipeline', id: 'more', title: '📄 Reading more lines...', statusId: 'running' },
    ],
    [
      { action: 'removeCard', cardId: 'more' },
      { action: 'addOutput', id: 'o2', text: 'ERROR: Timeout', time: '0.0s' },
      { action: 'addOutput', id: 'o3', text: 'ERROR: Auth failed', time: '0.0s' },
      { action: 'setGlow', cardId: 'stage1', glow: false },
    ],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addCard', columnId: 'pipeline', id: 'break', title: '🛑 break! (i >= 2)', statusId: 'done' },
    ],
    [
      { action: 'setStatus', cardId: 'stage1', statusId: 'done' },
      { action: 'setStatus', cardId: 'stage2', statusId: 'done' },
      { action: 'removeCard', cardId: 'break' },
      { action: 'addCard', columnId: 'pipeline', id: 'saved', title: '🚀 Remaining 9.9GB never read!', statusId: 'receiving' },
      { action: 'addCard', columnId: 'pipeline', id: 'mem', title: '💾 Peak memory: ~1 line', statusId: 'done' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default fileStreaming
