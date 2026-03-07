## Introduction

Every major LLM API supports streaming: tokens arrive one at a time instead of waiting for the complete response. This transforms user experience — instead of staring at a loading spinner for 10 seconds, users see text appear in real time. The implementation is an async generator that yields tokens as they arrive from the network.

This animation simulates an LLM streaming API. Tokens arrive with network latency, are yielded by the async generator, and rendered immediately. The "typewriter" effect demonstrates how streaming feels to users.

## Why This Matters

Time-to-first-token (TTFT) is a key UX metric. With streaming, TTFT is typically under 500ms even for complex prompts. Without streaming, users wait for the entire response, which can take 10+ seconds. Streaming makes LLM applications feel responsive.

Streaming also enables early cancellation. If the first few tokens show the response is off-track, users can cancel and try again. Without streaming, they wait for a full response they do not want.

From an architecture perspective, streaming reduces memory pressure. Instead of buffering a 10,000-token response, you process tokens incrementally. This matters for high-throughput services handling many concurrent requests.

## When to Use This Pattern

- Chat interfaces showing LLM responses as they generate
- Code completion tools displaying suggestions in real time
- Document generation with live preview
- Any LLM application where responsiveness matters
- Building LLM streaming APIs that proxy to upstream providers
- Implementing streaming for custom LLM deployments

## What Just Happened

The async generator simulated an LLM API that yields tokens with network latency. Each token arrived after a 0.3s delay (simulating network round-trip and generation time).

The renderer consumed tokens with `async for`, appending each to the full response and displaying immediately. Users saw "Hello" at 0.3s, "Hello!" at 0.6s, and so on. The progressive reveal creates the familiar ChatGPT-like experience.

Total time was 1.8s (6 tokens × 0.3s), but the first token appeared at 0.3s. This is the power of streaming: work is visible immediately, not just at the end.

## Keep in Mind

- Real LLM APIs (OpenAI, Anthropic, etc.) provide streaming via SSE or similar
- Token arrival rate varies — generation is not constant-time
- Handle connection drops and incomplete streams gracefully
- Accumulate tokens for final processing (logging, storage, etc.)
- Consider timeout handling for stalled streams
- The last token often signals completion (or a separate done event)

## Common Pitfalls

- Not streaming when you could (poor UX for users)
- Not accumulating the full response for logging or storage
- Not handling network errors mid-stream
- Assuming constant token arrival rate (it varies with complexity)
- Not providing cancel functionality for long generations
- Blocking the event loop with sync processing of tokens

## Where to Incorporate This

- Chat applications (ChatGPT-style interfaces)
- IDE code completion and suggestions
- Document drafting and editing tools
- Customer support chatbots
- Content generation applications
- Any user-facing LLM feature where responsiveness matters

## Related Patterns

- Async generators (animation 19) provides the foundation
- Backpressure (animation 16) for consumer-controlled pacing
- Error handling (animation 18) for handling mid-stream errors
- Buffering (animation 17) for batching tokens if needed
