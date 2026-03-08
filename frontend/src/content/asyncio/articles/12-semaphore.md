## Introduction

LLM providers cap concurrent requests — exceed the limit and you get **429 errors**. `asyncio.Semaphore(N)` is a counter that allows at most N tasks to enter a critical section simultaneously. The animation shows `Semaphore(2)` limiting 4 LLM calls to 2 at a time — they run in two batches of 2. Each task wraps its API call in `async with sem:` and the semaphore handles blocking, ordering, and release automatically.

## Why This Matters

Without rate limiting, `gather()` on 100 LLM calls hammers the API instantly. You get 429s, retry storms, exponential backoff cascades, and degraded throughput that is actually **worse** than sequential execution. A semaphore lets you run at maximum safe throughput — N concurrent requests, always, automatically.

Every major LLM provider enforces concurrency limits. OpenAI's tier-1 accounts allow roughly 25 concurrent requests. Anthropic's rate limits vary by model and plan. Google's Vertex AI has per-project quotas. Exceeding these means dropped requests and wasted latency on retries. A semaphore makes compliance invisible to callers — wrap the API call in `async with sem:` and the limit is enforced without changing the function's interface.

The composability is what makes semaphores powerful in practice. You can add concurrency control to any async function without refactoring its callers. Multiple independent subsystems can each have their own semaphore with different limits. A database pool might use `Semaphore(10)` while the LLM client uses `Semaphore(5)`. Each enforces its own constraint independently. This is fundamentally different from a queue — a semaphore does not buffer or order work, it simply gates concurrent access.

## What Just Happened

GPT-4 and Claude acquired the semaphore first, filling both available slots. Gemini and Llama attempted to acquire but the semaphore was full, so they suspended. When GPT-4 and Claude finished and exited the `async with` block, their slots were released. Gemini and Llama acquired immediately and ran. Total time was 4 seconds — two batches of 2 seconds each. Without the semaphore, all 4 would have started simultaneously, likely triggering rate limit errors. The context manager guaranteed release even if a task raised an exception.

## When to Use

- LLM API rate limiting for OpenAI, Anthropic, and Google with per-key concurrency caps
- Database connection pooling where `asyncpg` pool size is the semaphore value
- Concurrent S3 uploads via `boto3` with a cap on simultaneous `PutObject` calls
- gRPC client-side concurrency limiting to avoid overwhelming a single backend service
- Web scraping with politeness limits to respect `robots.txt` crawl-delay directives
- GPU memory management across concurrent model inference requests
- File descriptor limits when opening many sockets or files simultaneously

## When to Avoid

- When you need requests-per-minute limiting — semaphores control concurrency, not rate; use a token bucket
- When work must be processed in order — semaphores are unordered; use a `Queue` instead
- When you need to buffer work items — semaphores do not store tasks, they only gate access
- When different operations need different limits — one semaphore per limit, not one global semaphore
- CPU-bound work where the GIL is the bottleneck — semaphores only help with I/O-bound concurrency
- When the downstream service has no concurrency limit — you are throttling yourself for no reason
- When you need distributed rate limiting across multiple processes — use Redis-based token buckets

## In Production

**OpenAI's Python SDK** documents that tier-1 accounts have approximately 25 requests-per-minute and concurrency limits that vary by model. Production wrappers like `litellm` and `langchain`'s `ChatOpenAI` use internal semaphores to enforce these limits. When you configure `max_concurrency` in LangChain's `RunnableConfig`, it creates an `asyncio.Semaphore` that gates all calls through that chain. This prevents thundering-herd problems when a batch of user requests triggers simultaneous LLM calls.

**asyncpg**, the high-performance PostgreSQL client for asyncio, implements its connection pool as a semaphore-guarded resource. The pool has a fixed `max_size` (default 10). When all connections are in use, `pool.acquire()` suspends the caller until one is returned. Internally this is an `asyncio.Semaphore` — the pool size is the semaphore value. FastAPI applications using `asyncpg` rely on this to prevent connection exhaustion under load without any explicit semaphore in application code.

**Kubernetes** uses admission controllers that function as distributed semaphores. The `LimitRange` and `ResourceQuota` objects cap concurrent pod creation and resource consumption per namespace. When a deployment scales up, the API server gates pod scheduling through these limits. The pattern is identical to `asyncio.Semaphore` — N slots, FIFO waiters, automatic release on completion.

**boto3's** `TransferConfig` for S3 uploads uses `max_concurrency` (default 10) to limit simultaneous multipart upload parts. Each part upload acquires a slot from an internal semaphore before starting the HTTP request. This prevents overwhelming S3's per-prefix throughput limits and avoids 503 SlowDown responses on high-throughput buckets.
