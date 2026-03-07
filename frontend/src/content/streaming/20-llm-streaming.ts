import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { streamingColumns, streamingStatuses } from './layout'

const sourceCode = `import asyncio


async def stream_llm_response(prompt):
    """Simulates LLM streaming API."""
    tokens = ["Hello", "!", " I", " can", " help", "."]
    for token in tokens:
        await asyncio.sleep(0.3)  # Network latency
        yield token


async def render_response(prompt):
    """Renders tokens as they arrive."""
    full_response = ""
    async for token in stream_llm_response(prompt):
        full_response += token
        print(f"\\r{full_response}", end="", flush=True)
    print()  # Newline at end
    return full_response


asyncio.run(render_response("Hi!"))`

const llmStreaming: AnimationDefinition = {
  id: 'streaming-llm-streaming',
  title: 'Real-world LLM Streaming',
  columns: streamingColumns,
  statuses: streamingStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Define LLM Stream',
      explanation: '• `stream_llm_response()` simulates an LLM streaming API\n• Each token arrives with network latency (0.3s delay)\n• Real LLM APIs (OpenAI, Anthropic) work exactly like this',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'Define Renderer',
      explanation: '• `render_response()` consumes the stream with `async for`\n• Each token is appended and displayed immediately\n• This creates the "typewriter" effect users expect',
      startStep: 2,
      endStep: 2,
    },
    {
      title: 'Start Streaming',
      explanation: '• `asyncio.run()` starts the event loop\n• The renderer calls the LLM stream\n• First token arrives after 0.3s delay',
      startStep: 3,
      endStep: 6,
    },
    {
      title: 'Token-by-Token Rendering',
      explanation: '• Each token arrives and is immediately displayed\n• The response builds up: "Hello" → "Hello!" → "Hello! I" ...\n• Users see progress instead of waiting for the full response',
      startStep: 7,
      endStep: 14,
    },
    {
      title: 'Stream Complete',
      explanation: '• All tokens have arrived\n• The full response is available\n• Total time: 6 tokens × 0.3s = 1.8s, but first token at 0.3s!',
      startStep: 15,
      endStep: 16,
    },
  ],

  steps: [
    [{ action: 'highlightLine', lineId: 'line-0' }],
    [{ action: 'highlightLine', lineId: 'line-3' }],
    [{ action: 'highlightLine', lineId: 'line-11' }],
    [
      { action: 'highlightLine', lineId: 'line-21' },
      { action: 'addCard', columnId: 'code', id: 'loop', title: 'Event Loop', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'addCard', columnId: 'generator', id: 'llm', title: 'stream_llm_response()', statusId: 'ready' },
    ],
    [
      { action: 'setStatus', cardId: 'llm', statusId: 'running' },
      { action: 'setGlow', cardId: 'llm', glow: true },
      { action: 'addCard', columnId: 'memory', id: 'net', title: 'Network request...', statusId: 'buffered', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'net' },
      { action: 'setStatus', cardId: 'llm', statusId: 'yielding' },
      { action: 'addCard', columnId: 'memory', id: 't1', title: 'token: "Hello"', statusId: 'yielding' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-15' },
      { action: 'setStatus', cardId: 'llm', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'llm', glow: false },
      { action: 'removeCard', cardId: 't1' },
      { action: 'addOutput', id: 'o1', text: 'Hello', time: '0.3s' },
    ],
    [
      { action: 'setStatus', cardId: 'llm', statusId: 'running' },
      { action: 'setGlow', cardId: 'llm', glow: true },
      { action: 'addCard', columnId: 'memory', id: 'net2', title: 'Waiting...', statusId: 'buffered', hasSpinner: true },
    ],
    [
      { action: 'removeCard', cardId: 'net2' },
      { action: 'setStatus', cardId: 'llm', statusId: 'yielding' },
    ],
    [
      { action: 'setStatus', cardId: 'llm', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'llm', glow: false },
      { action: 'addOutput', id: 'o2', text: 'Hello!', time: '0.6s' },
    ],
    [
      { action: 'setStatus', cardId: 'llm', statusId: 'running' },
      { action: 'setGlow', cardId: 'llm', glow: true },
    ],
    [
      { action: 'setStatus', cardId: 'llm', statusId: 'suspended' },
      { action: 'setGlow', cardId: 'llm', glow: false },
      { action: 'addOutput', id: 'o3', text: 'Hello! I', time: '0.9s' },
    ],
    [
      { action: 'addOutput', id: 'o4', text: 'Hello! I can', time: '1.2s' },
    ],
    [
      { action: 'addOutput', id: 'o5', text: 'Hello! I can help', time: '1.5s' },
    ],
    [
      { action: 'setStatus', cardId: 'llm', statusId: 'exhausted' },
      { action: 'addOutput', id: 'o6', text: 'Hello! I can help.', time: '1.8s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'setStatus', cardId: 'loop', statusId: 'complete' },
      { action: 'addOutput', id: 'o7', text: '(Stream complete)', time: '1.8s' },
      { action: 'clearHighlights' },
      { action: 'removeCard', cardId: 'llm' },
    ],
  ],
}

export default llmStreaming
