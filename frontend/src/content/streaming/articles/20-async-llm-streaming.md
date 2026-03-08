## The Concept

Async generators were introduced in **PEP 525** (Python 3.6, 2016) by Yury Selivanov, the same author who designed `asyncio` and PEP 492 (`async`/`await`). The problem was clear: synchronous generators could `yield` values lazily, and coroutines could `await` I/O, but there was no way to do both in the same function. You could not write a function that awaited a network response and then yielded the result to a consumer. PEP 525 filled that gap by allowing `yield` inside `async def` functions.

The syntax is deceptively simple — `async def` + `yield` creates an async generator, consumed with `async for`. But the execution model is fundamentally different from sync generators. A sync generator suspends at `yield` and resumes when the caller calls `next()`. An async generator suspends at **both** `yield` and `await` — at `yield` it returns a value to the consumer, and at `await` it yields control to the event loop so other coroutines can run. This dual suspension is what makes async generators the correct primitive for streaming I/O.

This is the pattern that connects the entire generator series to asyncio. Synchronous generators taught lazy evaluation, backpressure, pipelines, and error recovery. Asyncio teaches the event loop, coroutines, task scheduling, and cancellation. Async generators are the **bridge** — they combine generator laziness with asyncio concurrency. The evolution path is direct: **PEP 255** (generators) → **PEP 342** (`send`/`throw`/`close`) → **PEP 380** (`yield from`) → **PEP 492** (`async`/`await` as syntactic sugar over generators) → **PEP 525** (async generators). The language started with `yield` as a simple value producer and ended with `yield` inside `async def` as the foundation of real-time streaming systems.

## Introduction

This animation simulates LLM token streaming using an async generator. The `stream_llm()` function is an `async def` that yields tokens one at a time — "Hello", "!", " I", " am", " a", " helpful", " assistant" — with an `await asyncio.sleep()` between each yield to simulate the model's generation latency. The consumer in `main()` uses `async for` to receive each token immediately as it is produced, displaying it to the user in real time.

This is exactly how ChatGPT, Claude, and every streaming chat interface works. Instead of waiting 3-5 seconds for the model to generate a complete response, you see the first token in ~100 milliseconds and each subsequent token as it is generated. The async generator is the Python-level primitive that makes this possible — it yields tokens as they arrive from the model and awaits the next chunk from the network in between.

## Why This Matters

Streaming transforms perceived latency from seconds to milliseconds. When a user sends a message to an LLM, the model takes several seconds to generate the full response. Without streaming, the user stares at a blank screen for the entire generation time. With streaming, the first token appears in under 200ms (**time to first token**, TTFT), and subsequent tokens appear every 20-50ms. The user starts reading immediately, and the perceived wait drops to near zero.

Beyond UX, streaming is a systems requirement. A non-streaming LLM response buffered server-side holds the entire response in memory, ties up a connection for the full generation duration, and cannot be cancelled partway through. A streaming response can be cancelled on the first bad token (saving GPU time and cost), forwarded through intermediary services without buffering, and processed incrementally by downstream stages like content filtering or citation extraction.

Async generators are specifically designed for this. The `await` between yields means the event loop is free to handle other requests while this generator waits for the next token. A FastAPI server using async generator responses can serve **thousands of concurrent streaming connections** on a single thread — each generator is parked on the heap between tokens, consuming zero CPU and minimal memory. This is cooperative scheduling applied to streaming data production.

There is also the cancellation dimension. When a user navigates away mid-response, the server can close the async generator with `aclose()`, which throws `GeneratorExit` into the generator and triggers cleanup. Without streaming, the server would generate the full response, send it, and waste the GPU time. With an async generator, cancellation propagates from the HTTP connection through ASGI, into the generator, and can stop model inference early. This is real cost savings — LLM inference is priced per output token, and not generating tokens the user will never read directly reduces the bill.

## What Just Happened

The animation walked through the async generator's lifecycle. First, calling `stream_llm()` created an async generator object — no code executed, just like a sync generator. The generator was in its initial suspended state, registered with the event loop.

The `async for` loop in `main()` began driving the generator. Each iteration called `__anext__()` on the async generator — the async equivalent of `next()`. This resumed the generator, which ran to its first `await asyncio.sleep()`, simulating the wait for the next token from the model. During this `await`, the generator was suspended and the event loop was free to run other coroutines. When the sleep completed, the generator continued to `yield`, producing the token "Hello". The token was immediately delivered to the `async for` loop.

This cycle repeated for each token: **await** (wait for data from the model), **yield** (emit token to the consumer), **await** (wait for more data), **yield** (emit next token). After the final token, the generator function returned, raising `StopAsyncIteration`, and the `async for` loop exited cleanly.

The dual suspension is the critical concept. `await` suspends to the event loop — other tasks can run. `yield` suspends to the consumer — a value is delivered. The generator alternates between these two kinds of suspension, and this alternating rhythm is the heartbeat of every streaming application in Python. Between the first `await` and the last `yield`, the generator object sits on the heap consuming only a few hundred bytes — its frame, locals, and bytecode pointer. Multiply that by a thousand concurrent connections and you are still under a megabyte of memory, which is why single-threaded async servers can handle massive streaming concurrency.

## When to Use

- LLM token streaming for chat UIs that display responses as they are generated, token by token
- Server-sent events (SSE) endpoints that push real-time updates from server to browser clients
- WebSocket message handlers that process incoming messages and yield responses as they arrive
- Streaming HTTP responses where the body is produced incrementally via chunked transfer encoding
- Database cursor iteration over large result sets using async drivers like `asyncpg` or `motor`
- Real-time log tailing where new log lines are awaited from a file or network source and yielded to consumers

## When to Avoid

- When the entire response is needed before processing can begin — buffering everything anyway negates the benefit
- When the data source is synchronous and CPU-bound — use regular generators; `async def` + `yield` adds event loop overhead for no concurrency gain
- When you need to fan out the same stream to multiple consumers — async generators are single-consumer and single-pass
- When the consumer is faster than the producer and there is no I/O between yields — a sync generator or plain list is simpler
- When error handling requires replaying the stream — async generators cannot be rewound or reset
- When you are not inside an async context — `async for` only works inside `async def` functions running on an event loop
- When you need to iterate the same data multiple times — the generator is exhausted after one pass

## In Production

**The OpenAI Python SDK** returns an async generator from `client.chat.completions.create(stream=True)`. Each iteration yields a `ChatCompletionChunk` object containing one token's `delta.content`. Under the hood, the SDK maintains an HTTP connection using server-sent events, and each SSE `data:` line triggers an `await` that resolves to a `yield`. Developers consume this with `async for chunk in response:` — the exact pattern shown in this animation. The `stream=True` parameter changes the API from returning a single `ChatCompletion` to returning an `AsyncStream[ChatCompletionChunk]`, which implements `__aiter__` and `__anext__`.

**The Anthropic Python SDK** provides `client.messages.stream()` which returns an async context manager wrapping an async generator. Inside `async with client.messages.stream() as stream:`, you use `async for text in stream.text_stream:` to receive tokens. The context manager ensures the HTTP connection is properly closed when streaming ends or on exception — combining the `@asynccontextmanager` pattern with async generators. The SDK also exposes event-level streaming via `stream.events()`, where each yielded event carries metadata like `input_tokens`, `output_tokens`, and `stop_reason` alongside the content delta.

**FastAPI's `StreamingResponse`** accepts an async generator as its `content` parameter. Each `yield` from the generator is sent to the client as a chunk of the HTTP response body using chunked transfer encoding. For SSE endpoints, the generator yields `data: {json}\n\n` formatted strings. This allows a single FastAPI endpoint to stream LLM responses to hundreds of concurrent browser clients — each connected client has its own async generator instance, and between yields, the event loop serves other connections. Starlette (FastAPI's foundation) handles the ASGI send/receive protocol around the generator automatically.

**gRPC's Python async streaming** uses async generators for both server-side and bidirectional streaming RPCs. A server-streaming RPC handler is an `async def` that yields response messages one at a time. The gRPC framework reads each yielded message and sends it over HTTP/2 as individual frames. Client-side, `async for response in stub.StreamMethod(request):` drives the response stream. For bidirectional streaming, the handler both receives an async iterator of requests and yields responses — async generators on both ends of the connection, with HTTP/2 multiplexing underneath.
