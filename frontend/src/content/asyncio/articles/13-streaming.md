## Introduction

Every modern LLM streams responses token by token — ChatGPT, Claude, Gemini all do this. Instead of waiting 5 seconds for a full response, you see text appearing in real time. Python's `async for` combined with async generators (`async def` + `yield`) is the pattern that makes this work. The animation shows `stream_llm()` yielding 5 tokens with a delay between each. The consumer prints each token immediately via `async for`. The generator stays alive across yields, toggling between running and suspended states.

## Why This Matters

Streaming transforms UX. Users see the first word in **100ms** instead of waiting 5 seconds for the complete response. It enables early cancellation — stop generating if the first tokens look wrong — and reduces memory usage by processing tokens individually instead of buffering a 10,000-token response.

From a systems perspective, streaming is essential for high-throughput services. A non-streaming endpoint holds a response buffer in memory for the entire generation time. With 1,000 concurrent users generating 4K-token responses, that is 4 million tokens buffered simultaneously. Streaming reduces this to one token per connection at any given moment. The `async for` protocol is the consumer side of this — it drives the generator forward one `yield` at a time, processing each token before requesting the next.

The pattern extends beyond LLMs. Any data source that produces items over time — WebSocket messages, server-sent events, database cursors, file streams — fits the `async for` model. The async generator is the producer, `async for` is the consumer, and the `yield`/`__anext__` protocol is the handshake between them. Mastering this pattern unlocks efficient handling of all streaming data in async Python.

## What Just Happened

The async generator `stream_llm()` yielded 5 tokens one at a time. After each `yield`, control returned to `main()` which printed the token immediately. There was no buffering step — the first token was visible almost immediately while the last appeared several seconds later. The `async for` loop drove the generator forward by calling `__anext__()` on each iteration, which resumed the generator until the next `yield`. When the generator function returned, `StopAsyncIteration` was raised automatically and the loop exited cleanly.

## When to Use

- LLM response streaming with `stream=True` for token-by-token display in chat UIs
- Server-sent events (SSE) endpoints pushing real-time updates to browser clients
- WebSocket message processing for bidirectional real-time communication
- Database cursor iteration over large result sets via `async for row in cursor`
- Real-time log tailing where new log lines are processed as they are written
- File streaming that reads and processes large files chunk by chunk without full buffering
- Audio and video chunk processing for real-time transcription or media pipelines

## When to Avoid

- When you need the complete result before processing — use `await` and collect the full response
- Small payloads where the overhead of streaming exceeds the latency benefit
- When the consumer is slower than the producer and you need backpressure — use a `Queue` with `maxsize`
- Batch analytics where you aggregate all results anyway — streaming adds complexity for no UX gain
- When the downstream protocol does not support streaming (e.g., some REST API clients)
- CPU-bound token processing where each token requires heavy computation — the event loop will starve
- When you need to retry the entire response on error — streaming makes atomic retry harder

## In Production

**OpenAI's Python SDK** implements streaming via `client.chat.completions.create(stream=True)`, which returns an `AsyncStream` object that implements `__aiter__` and `__anext__`. Each iteration yields a `ChatCompletionChunk` containing one token's delta. Under the hood, the SDK reads from an HTTP response body using chunked transfer encoding, parses SSE frames, and yields parsed objects. The `async for chunk in stream:` pattern in application code is consuming an async generator that wraps raw HTTP byte streaming.

**FastAPI's `StreamingResponse`** accepts an async generator and forwards each yielded chunk to the client as it is produced. When building an LLM proxy, you create an async generator that consumes tokens from OpenAI or Anthropic and yields formatted SSE frames. FastAPI streams these to the browser with zero buffering. Uvicorn's ASGI implementation sends each chunk as a separate HTTP data frame, keeping memory constant regardless of response length.

**Anthropic's SDK** uses a `MessageStream` class that yields `RawMessageStreamEvent` objects. The streaming protocol is more structured than OpenAI's — events include `content_block_start`, `content_block_delta`, and `message_stop`. Each delta contains the incremental text. The SDK parses the SSE stream from the HTTP response and yields typed Python objects. Client code consumes these with `async for event in stream:`, identical to any other async generator pattern.

**LangChain** unifies streaming across providers through its `astream()` interface. When you call `chain.astream(input)`, LangChain creates an async generator that yields `AIMessageChunk` objects regardless of the underlying provider. Each chunk flows through the chain's middleware — callbacks, tracing, output parsers — as a streaming event. This lets you swap between OpenAI, Anthropic, and local models without changing your streaming consumption code.
