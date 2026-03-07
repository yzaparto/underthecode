# Introduction

**Async generators** combine `async def` with `yield`. They can `await` between yields, making them perfect for I/O-bound streaming like network requests. You consume them with `async for`.

```python
async def stream():
    for item in items:
        await asyncio.sleep(0.1)  # Async operation
        yield item
```

# Why This Matters

This is exactly how ChatGPT, Claude, and other LLMs stream responses! Instead of waiting seconds for the complete response, you receive tokens as they're generated and display them progressively.

# What Just Happened

The animation simulated LLM streaming:

1. User sent a prompt
2. Generator started producing tokens with delays (simulating generation time)
3. Each token appeared immediately: "Hello" → "!" → " I" → " am" → ...
4. User saw text appear progressively instead of waiting for everything

This creates a much better user experience — perceived latency drops dramatically.

# Keep in Mind

- Async generators need `async for` to consume
- `await` between yields lets other coroutines run
- Async generators are still lazy and single-use

# Common Pitfalls

- **Using sync generators for I/O** — You'll block the event loop
- **Buffering the whole response before displaying** — Defeats the purpose of streaming

# Where to Incorporate This

Essential for:

- LLM token streaming (ChatGPT, etc.)
- Server-Sent Events (SSE)
- WebSocket streams
- Any async data source

# Related Patterns

- **Your First Generator** (Animation 1) — Sync generator basics
- **Backpressure** (Animation 16) — Flow control still applies

# The Future

Async generators are the foundation of modern Python streaming. As AI and real-time applications grow, this pattern becomes increasingly important. Master it and you'll be ready for the streaming-first future!
