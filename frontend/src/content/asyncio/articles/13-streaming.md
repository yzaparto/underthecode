## Introduction

Every modern LLM streams responses token by token — ChatGPT, Claude, Gemini all do this. Instead of waiting 5 seconds for a full response, you see text appearing in real time. Python's `async for` combined with async generators (`async def` + `yield`) is the pattern that makes this work. The generator yields tokens one at a time, the consumer processes each immediately.

Async generators are the natural fit for any data source that produces items over time. Unlike returning a list, a generator gives the consumer each item as soon as it is available. The consumer does not wait for the entire sequence to complete before it can start processing. This is the fundamental difference between batch and streaming.

This animation shows an async generator `stream_llm()` yielding 5 tokens with a delay between each. The consumer in `main()` prints each token immediately as it arrives via `async for`. The generator stays alive in the event loop across all yields, toggling between running and suspended states.

## Why This Matters

Streaming transforms UX. Users see the first word in 100ms instead of waiting 5 seconds for the complete response. It also enables early cancellation — stop generating if the first tokens look wrong — and real-time processing pipelines. Every chat interface you have used relies on this pattern.

From a systems perspective, streaming reduces memory usage. Instead of buffering a 10,000-token response in memory before sending it to the client, you process and forward each token individually. This is critical for high-throughput services handling many concurrent requests.

The `async for` protocol is also the foundation for consuming any async data source: WebSocket messages, server-sent events, database cursors, file streams. Mastering this pattern unlocks efficient handling of all streaming data in async Python.

## When to Use This Pattern

- LLM response streaming for ChatGPT-style token-by-token display in chat UIs
- Server-sent events (SSE) endpoints that push real-time updates to browser clients
- Real-time log tailing where new log lines are processed as they are written
- WebSocket message processing for bidirectional real-time communication
- Database cursor iteration over large result sets without loading everything into memory
- Any data source that produces items over time rather than all at once

## What Just Happened

The async generator `stream_llm()` yielded 5 tokens one at a time. After each `yield`, control returned to `main()` which printed the token immediately. The generator card stayed alive in the event loop across all yields, toggling between running and suspended.

This is different from returning a list. The consumer got each token in real time as the generator produced it. There was no buffering step. The first token was visible almost immediately, while the last token appeared several seconds later.

The `async for` loop drove the generator forward. Each iteration called `__anext__()` on the generator, which resumed it until the next `yield`. When the generator function returned (no more yields), `StopAsyncIteration` was raised automatically and the loop exited cleanly.

## Keep in Mind

- `async def` + `yield` creates an async generator, not a coroutine — you cannot `await` it directly
- `async for` is the consumer syntax that drives async generators and async iterators
- `StopAsyncIteration` ends the loop automatically when the generator returns or is exhausted
- Generators are tracked by the event loop and cleaned up on shutdown via `shutdown_asyncgens()`
- You can also use `async for` with any object implementing `__aiter__()` and `__anext__()`
- `yield` suspends the generator and returns a value, `await` suspends to wait for a result

## Common Pitfalls

- Trying to `await` an async generator, which does not work — use `async for` instead
- Not closing generators on error, causing resource leaks — use `async with` or try/finally
- Yielding from a non-async generator inside async code — use `async def` with `yield`
- Buffering all tokens before yielding, which defeats the entire purpose of streaming
- Not handling `GeneratorExit` for cleanup when the consumer stops iterating early
- Forgetting that `async for` only works inside `async def` functions

## Where to Incorporate This

- LLM token streaming for chatbot UIs that display responses as they are generated
- SSE endpoints for real-time dashboards that push updates to connected browsers
- Streaming file processing that reads and processes files line by line
- WebSocket message handlers that process incoming messages as they arrive
- Database row iteration with `async for` over async database cursors
- ETL pipeline stages that process records as they arrive rather than in batch
- Audio and video chunk processing for real-time media applications

## Related Patterns

- `as_completed()` for task-level streaming of results as tasks finish (animation 10)
- `aiohttp` streaming responses for HTTP-level streaming between services
- `async with` for resource cleanup in generators that hold open connections
- Async iterators (`__aiter__`/`__anext__`) as the protocol behind `async for`
- `asyncio.Queue` for inter-task streaming where producer and consumer are separate tasks (animation 11)
