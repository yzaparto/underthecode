import type { AnimationDefinition } from '../../engine/types'
import { EMPTY_STATE } from '../../engine/types'
import { expertColumns, basicsStatuses } from './layouts'

const sourceCode = `import asyncio


async def stream_llm_response(prompt):
    """Simulates ChatGPT-style streaming"""
    tokens = ["Hello", "!", " I", " am", " an", " AI", "."]
    for token in tokens:
        await asyncio.sleep(0.1)  # Simulate network delay
        yield token


async def main():
    prompt = "Say hello"
    print(f"User: {prompt}")
    print("AI: ", end="")
    
    async for token in stream_llm_response(prompt):
        print(token, end="", flush=True)
    
    print()  # Newline at end


asyncio.run(main())`

const asyncLlmStreaming: AnimationDefinition = {
  id: 'streaming-20-llm',
  title: 'Async Generators & LLM Streaming',
  columns: expertColumns,
  statuses: basicsStatuses,
  sourceCode,
  initialState: EMPTY_STATE,

  phases: [
    {
      title: 'Async Generators',
      explanation: '• `async def` + `yield` = async generator\n• Use `async for` to consume\n• Can `await` between yields!\n• Perfect for streaming APIs',
      startStep: 0,
      endStep: 1,
    },
    {
      title: 'The LLM Streaming Pattern',
      explanation: '• LLMs generate tokens one at a time\n• Instead of waiting for full response...\n• Stream tokens as they\'re generated!\n• Users see text appear progressively',
      startStep: 2,
      endStep: 4,
    },
    {
      title: 'Watching It Stream',
      explanation: '• Each token arrives with slight delay\n• Display immediately (flush=True)\n• User sees: "Hello! I am an AI." appear word by word\n• Much better UX than waiting!',
      startStep: 5,
      endStep: 12,
    },
  ],

  steps: [
    [
      { action: 'highlightLine', lineId: 'line-3' },
      { action: 'addCard', columnId: 'context', id: 'async', title: 'async def + yield', statusId: 'waiting' },
      { action: 'addCard', columnId: 'result', id: 'type', title: '= Async Generator', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-7' },
      { action: 'removeCard', cardId: 'type' },
      { action: 'addCard', columnId: 'result', id: 'await', title: '✨ Can await between yields!', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-11' },
      { action: 'removeCard', cardId: 'async' },
      { action: 'removeCard', cardId: 'await' },
      { action: 'addCard', columnId: 'context', id: 'main', title: 'main()', statusId: 'running' },
      { action: 'setGlow', cardId: 'main', glow: true },
    ],
    [
      { action: 'highlightLine', lineId: 'line-13' },
      { action: 'addOutput', id: 'o1', text: 'User: Say hello', time: '0.0s' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-14' },
      { action: 'addOutput', id: 'o2', text: 'AI: ', time: '0.0s' },
      { action: 'addCard', columnId: 'result', id: 'ready', title: '⏳ Starting stream...', statusId: 'waiting' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-16' },
      { action: 'removeCard', cardId: 'ready' },
      { action: 'addCard', columnId: 'context', id: 'gen', title: 'stream_llm_response()', statusId: 'running' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'addCard', columnId: 'result', id: 't1', title: '📤 "Hello"', statusId: 'value' },
      { action: 'setStatus', cardId: 'gen', statusId: 'paused' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-17' },
      { action: 'removeCard', cardId: 't1' },
      { action: 'updateOutput', id: 'o2', text: 'AI: Hello', time: '0.1s' },
      { action: 'addCard', columnId: 'result', id: 'display', title: '📺 User sees: "Hello"', statusId: 'receiving' },
    ],
    [
      { action: 'highlightLine', lineId: 'line-8' },
      { action: 'setStatus', cardId: 'gen', statusId: 'running' },
      { action: 'removeCard', cardId: 'display' },
      { action: 'addCard', columnId: 'result', id: 't2', title: '📤 "!"', statusId: 'value' },
    ],
    [
      { action: 'removeCard', cardId: 't2' },
      { action: 'updateOutput', id: 'o2', text: 'AI: Hello!', time: '0.2s' },
      { action: 'addCard', columnId: 'result', id: 't3', title: '📤 " I"', statusId: 'value' },
    ],
    [
      { action: 'removeCard', cardId: 't3' },
      { action: 'updateOutput', id: 'o2', text: 'AI: Hello! I', time: '0.3s' },
      { action: 'addCard', columnId: 'result', id: 'stream', title: '⚡ Streaming continues...', statusId: 'running' },
    ],
    [
      { action: 'removeCard', cardId: 'stream' },
      { action: 'updateOutput', id: 'o2', text: 'AI: Hello! I am an AI.', time: '0.7s' },
      { action: 'setStatus', cardId: 'gen', statusId: 'done' },
      { action: 'addCard', columnId: 'result', id: 'done', title: '✅ Stream complete!', statusId: 'done' },
    ],
    [
      { action: 'setGlow', cardId: 'main', glow: false },
      { action: 'setStatus', cardId: 'main', statusId: 'done' },
      { action: 'addCard', columnId: 'result', id: 'ux', title: '🎯 Great UX: progressive display', statusId: 'receiving' },
      { action: 'addCard', columnId: 'result', id: 'ux2', title: '💡 This is how ChatGPT works!', statusId: 'receiving' },
      { action: 'clearHighlights' },
    ],
  ],
}

export default asyncLlmStreaming
