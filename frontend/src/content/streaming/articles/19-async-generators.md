## Introduction

Async generators combine generators with async/await. An `async def` function with `yield` creates an async generator. It can use `await` between yields, making it perfect for streaming from async data sources like network APIs, databases, or message queues.

This animation shows a simple async generator that awaits between yields. The `async for` loop consumes it, with each iteration potentially allowing other async tasks to run during the await.

## Why This Matters

LLM token streaming, WebSocket messages, server-sent events — these are all async streams. You cannot use regular generators because the data arrives asynchronously. Async generators are the natural fit: they yield values as they arrive, with await points for I/O.

The event loop can do other work during awaits. While waiting for the next token from an LLM, other requests can be processed. This is the foundation of scalable async services.

Async generators are consumed with `async for`, which is the async equivalent of `for`. The familiar iteration syntax works, but with async semantics.

## When to Use This Pattern

- Streaming from network APIs (HTTP, WebSocket, gRPC)
- Consuming message queues asynchronously
- Database cursor iteration with async drivers
- LLM token streaming
- Any async data source that produces items over time
- Building async pipelines with multiple stages

## What Just Happened

The async generator was created but not started. `async for` began iterating, triggering the first iteration of the generator.

The generator hit `await asyncio.sleep(0.5)` and suspended. The event loop was free to do other work. After 0.5s, the sleep completed, the generator resumed, and it yielded 0.

This pattern repeated for each value: await (suspend), resume, yield. The event loop interleaved this generator with any other async tasks (not shown in this simple example).

## Keep in Mind

- `async def` + `yield` creates an async generator, not a regular coroutine
- Consume with `async for`, not regular `for`
- Async generators can use `await` anywhere in their body
- They implement `__aiter__` and `__anext__` (async iterator protocol)
- `StopAsyncIteration` ends the iteration (async equivalent of `StopIteration`)
- You cannot mix sync and async iteration (`for` on async generator raises TypeError)

## Common Pitfalls

- Using `for` instead of `async for` on async generators
- Forgetting `await` inside async generators (blocks the event loop)
- Not handling `StopAsyncIteration` when manually iterating
- Mixing sync generators in async code without `asyncio.to_thread()`
- Not closing async generators properly (use `async with` or explicit `aclose()`)

## Where to Incorporate This

- HTTP streaming responses from LLM APIs
- WebSocket message handling
- Server-sent events (SSE) consumption
- Async database cursor iteration
- Message queue consumption (Kafka, RabbitMQ, Redis Streams)
- Any async producer-consumer pattern

## Related Patterns

- LLM streaming (animation 20) shows real-world async generator usage
- Generator basics (animation 2) covers sync generator fundamentals
- `asyncio.Queue` for inter-task async streaming
- `aiohttp`, `httpx` for async HTTP streaming
