import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `def read_large_file(filepath):
    """Stream file line by line."""
    with open(filepath) as f:
        for line in f:
            yield line.strip()


def process_logs(filepath):
    """Pipeline: read → filter → transform."""
    lines = read_large_file(filepath)
    errors = (l for l in lines if "ERROR" in l)
    parsed = (l.split(": ", 1)[1] for l in errors)
    return parsed


# Process a 10GB log file with constant memory
log_gen = process_logs("/var/log/app.log")

for i, error in enumerate(log_gen):
    print(f"Error {i+1}: {error}")
    if i >= 2:
        break`

const fileStreaming: AnimationDefinition = {
  id: 'streaming-file-streaming',
  title: 'File Streaming',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define File Reader',
      explanation: '• `read_large_file()` yields lines one at a time\n• File handle stays open across yields\n• Memory holds only ONE line at a time, not the entire file',
      startStep: 0,
      endStep: 0,
    },
    {
      title: 'Define Processing Pipeline',
      explanation: '• `process_logs()` chains multiple generators\n• `lines` yields raw lines, `errors` filters for "ERROR"\n• `parsed` extracts the message — all generators, all lazy',
      startStep: 1,
      endStep: 1,
    },
    {
      title: 'Create Pipeline',
      explanation: '• Calling `process_logs()` sets up the generator chain\n• No file I/O has happened yet\n• The file is not even opened until we start iterating',
      startStep: 2,
      endStep: 3,
    },
    {
      title: 'Stream First Errors',
      explanation: '• The `for` loop pulls from the pipeline\n• Each `next()` reads lines until an ERROR is found\n• Only matching lines reach the consumer',
      startStep: 4,
      endStep: 10,
    },
    {
      title: 'Early Termination',
      explanation: '• We `break` after 3 errors — no more reads needed\n• The file is NOT fully read, only what was necessary\n• This is the power of lazy streaming with break',
      startStep: 11,
      endStep: 12,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-7' }],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'addOutput', id: 'o1', text: 'Creating pipeline...', time: '0.0s' },
    ],
    [
      { action: 'addCard', columnId: 'generator', id: 'read', title: 'read_large_file()', statusId: 'ready' },
      { action: 'addCard', columnId: 'generator', id: 'filter', title: 'errors filter', statusId: 'ready' },
      { action: 'addCard', columnId: 'generator', id: 'parse', title: 'parsed transform', statusId: 'ready' },
      { action: 'addOutput', id: 'o2', text: 'Pipeline ready (no I/O yet)', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'setStatus', cardId: 'read', statusId: 'running' },
      { action: 'setStatus', cardId: 'filter', statusId: 'running' },
      { action: 'setStatus', cardId: 'parse', statusId: 'running' },
      { action: 'setGlow', cardId: 'read', glow: true },
    ],
    [
      { action: 'addCard', columnId: 'memory', id: 'line1', title: 'line: "INFO: starting"', statusId: 'buffered' },
      { action: 'addOutput', id: 'o3', text: 'Read: "INFO: starting" (skip)', time: '0.0s' },
    ],
    [
      { action: 'removeCard', cardId: 'line1' },
      { action: 'addCard', columnId: 'memory', id: 'line2', title: 'line: "ERROR: timeout"', statusId: 'yielding' },
      { action: 'addOutput', id: 'o4', text: 'Read: "ERROR: timeout" (match!)', time: '0.1s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-18' },
      { action: 'setStatus', cardId: 'read', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'filter', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'parse', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'read', glow: false },
      { action: 'removeCard', cardId: 'line2' },
      { action: 'addOutput', id: 'o5', text: 'Error 1: timeout', time: '0.1s' },
    ],
    [
      { action: 'setStatus', cardId: 'read', statusId: 'running' },
      { action: 'setStatus', cardId: 'filter', statusId: 'running' },
      { action: 'setStatus', cardId: 'parse', statusId: 'running' },
      { action: 'setGlow', cardId: 'read', glow: true },
      { action: 'addOutput', id: 'o6', text: 'Read: "DEBUG: ..." (skip)', time: '0.2s' },
      { action: 'addOutput', id: 'o7', text: 'Read: "ERROR: connection" (match!)', time: '0.3s' },
    ],
    [
      { action: 'setStatus', cardId: 'read', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'filter', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'parse', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'read', glow: false },
      { action: 'addOutput', id: 'o8', text: 'Error 2: connection', time: '0.3s' },
    ],
    [
      { action: 'setStatus', cardId: 'read', statusId: 'running' },
      { action: 'setStatus', cardId: 'filter', statusId: 'running' },
      { action: 'setStatus', cardId: 'parse', statusId: 'running' },
      { action: 'setGlow', cardId: 'read', glow: true },
      { action: 'addOutput', id: 'o9', text: 'Read: "ERROR: auth failed" (match!)', time: '0.4s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-19' },
      { action: 'setStatus', cardId: 'read', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'filter', statusId: 'suspended' },
      { action: 'setStatus', cardId: 'parse', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'read', glow: false },
      { action: 'addOutput', id: 'o10', text: 'Error 3: auth failed', time: '0.4s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-20' },
      { action: 'addOutput', id: 'o11', text: 'break! (file not fully read)', time: '0.4s' },
      { action: 'setStatus', cardId: 'read', statusId: 'exhausted' },
      { action: 'setStatus', cardId: 'filter', statusId: 'exhausted' },
      { action: 'setStatus', cardId: 'parse', statusId: 'exhausted' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default fileStreaming
