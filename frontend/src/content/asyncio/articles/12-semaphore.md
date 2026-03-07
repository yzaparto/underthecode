## Introduction

LLM providers cap concurrent requests — exceed the limit and you get 429 errors. `asyncio.Semaphore(N)` is a counter that allows at most N tasks to enter a critical section simultaneously. In this animation, `Semaphore(2)` limits 4 LLM calls to 2 at a time. They run in two batches of 2.

The semaphore pattern is the simplest and most effective way to enforce concurrency limits in async Python. You wrap the rate-limited operation in `async with sem:` and the semaphore handles the rest — blocking excess tasks until a slot opens up. No manual counting, no complex scheduling logic.

This is different from a queue. A queue buffers work items and processes them in order. A semaphore lets tasks run freely up to a limit, then makes the rest wait. Tasks are not ordered — whichever task acquires the semaphore first gets to run. The semaphore is purely a concurrency gate.

## Why This Matters

Without rate limiting, `gather()` on 100 LLM calls hammers the API instantly. Semaphores let you run at maximum safe throughput. You trade some speed (batching) for API compliance. In production, this is the difference between reliable calls and constant 429 "Too Many Requests" errors.

Every major LLM provider enforces concurrency limits. OpenAI, Anthropic, Google, and others all have per-account or per-key limits on simultaneous requests. Exceeding these limits means dropped requests, retry storms, and degraded user experience. A semaphore makes compliance automatic and invisible.

The beauty of the semaphore is composability. You can wrap any async function with `async with sem:` without changing its interface or behavior. Callers do not need to know about the rate limit. This makes it easy to add concurrency control to existing code without refactoring.

## When to Use This Pattern

- LLM API rate limiting for OpenAI, Anthropic, and other providers with concurrency caps
- Database connection pooling where the pool has a fixed maximum number of connections
- File descriptor limits when opening many files or sockets concurrently
- Concurrent download caps to avoid overwhelming a server or your own bandwidth
- Web scraping with politeness limits to respect target server capacity
- GPU memory management across concurrent model inference calls

## What Just Happened

GPT-4 and Claude acquired the semaphore first, filling both of the 2 available slots. Gemini and Llama attempted to acquire but the semaphore was full, so they suspended and waited. When GPT-4 and Claude finished and released their slots, Gemini and Llama acquired and ran.

Total execution time was 4 seconds instead of 2 — two batches of 2 seconds each. Without the semaphore, all 4 would have started simultaneously and likely triggered rate limit errors. We traded speed for reliability, which is almost always the right trade in production.

The semaphore managed all of this automatically. Each task used `async with sem:` and the semaphore handled acquisition, blocking, and release. Even if a task raised an exception, the context manager guarantees the slot is released.

## Keep in Mind

- `async with sem:` guarantees release even on exception, preventing slot leaks
- `Semaphore(N)` allows N concurrent holders — N tasks can be inside the critical section at once
- `BoundedSemaphore(N)` adds a check that you do not release more times than you acquire
- Semaphore controls concurrency (simultaneous tasks) not rate (requests per minute)
- The semaphore is fair — waiters are served in FIFO order, preventing starvation
- You can use `await sem.acquire()` and `sem.release()` manually, but the context manager is safer

## Common Pitfalls

- Setting the semaphore value too low, underutilizing your API quota and slowing throughput
- Setting it too high, hitting rate limits anyway and triggering retry storms
- Not using the context manager, risking forgotten release on exception paths
- Confusing concurrency limit with rate limit — use a token bucket for requests-per-minute
- Using a single global semaphore when different endpoints have different concurrency limits
- Creating a new semaphore per request instead of sharing one across all requests

## Where to Incorporate This

- OpenAI and Anthropic API concurrency caps to stay within provider limits
- Database connection pools where the pool size is the semaphore value
- Concurrent file uploads to S3 or GCS with a cap on simultaneous transfers
- Parallel web scraping with politeness limits to respect server capacity
- Limiting GPU memory usage across concurrent model inference calls
- Controlling concurrent WebSocket connections to rate-limited services
- Batch processing with a cap on simultaneous worker tasks

## Related Patterns

- Queues for ordered producer-consumer processing with buffering (animation 11)
- Retry with backoff when rate limits are hit despite the semaphore (animation 18)
- Token bucket algorithm for true rate limiting measured in requests per minute
- `BoundedSemaphore` for safety against accidental over-release bugs
- Circuit breaker pattern for failing fast when a service is consistently overloaded
