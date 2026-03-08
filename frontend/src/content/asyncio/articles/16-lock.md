## Introduction

This animation shows two agents — GPT-4 and Claude — sharing a mutable token counter. Without a lock, both read the counter at 0, compute independently, and overwrite each other: a classic lost-update bug. With `asyncio.Lock`, GPT-4 acquires the lock first, reads 0, computes, and writes 100. Only after GPT-4 releases does Claude acquire the lock, read the correct value of 100, and write 300. The `async with lock:` syntax guarantees release even if an exception fires inside the critical section.

The animation makes the interleaving visible. GPT-4 enters the critical section and the lock indicator turns red. Claude arrives and blocks — not busy-waiting, but yielding to the event loop so other work can proceed. When GPT-4 exits, Claude immediately enters. The final counter reads 300, which is exactly correct. Without the lock, the counter would read either 100 or 200 depending on which coroutine wrote last.

## Why This Matters

"Single thread means no race conditions" is one of the most dangerous myths in async Python. The event loop switches control at every `await` point, creating interleaving identical to thread preemption. GPT-4 reads 0, hits `await` for its API call, and the event loop hands control to Claude. Claude reads the same stale 0, computes independently, and both write their results — one overwrites the other. This is textbook data corruption happening in single-threaded code.

The bug is timing-dependent and nearly impossible to reproduce in unit tests. With fast in-memory operations, coroutines complete between `await` points so quickly that interleaving never occurs. In production with real network latency — 200ms LLM calls, 50ms database queries — the `await` points take long enough for the event loop to switch, and the corruption begins. A lock makes behavior deterministic regardless of timing: one coroutine at a time, always, no matter how long the I/O takes.

Race conditions in async code are also harder to debug than threaded ones. Thread races are non-deterministic across runs, but async races are deterministic within a single event loop tick ordering — meaning the bug appears consistently under one load pattern and vanishes under another. When your billing counter undercounts by 15% only during peak traffic, an `asyncio.Lock` around the read-modify-write cycle is the fix.

## What Just Happened

GPT-4 acquired the lock first, entered the critical section, read the counter value of 0, and slept for 1 second simulating an API call. During that entire period, Claude was blocked at `async with lock:` — the event loop was free to run other tasks, but Claude specifically could not proceed past the lock acquisition.

After GPT-4 wrote 100 and exited the `async with` block, the lock released automatically. Claude immediately acquired it, read 100 (the correct updated value), performed its computation, and wrote 300. The final counter value is 300 — exactly the sum of both contributions.

Without the lock, both agents would have read 0, computed 100 and 200 independently, and the last writer would have set the counter to either 100 or 200 — never the correct 300. The `await` between read and write is the window where interleaving occurs, and the lock closes that window completely.

## When to Use

- Shared counters or accumulators updated by concurrent coroutines with `await` points between read and write
- Token usage tracking for billing where undercounting means lost revenue and overcounting means overcharging
- Rate limit state management where multiple callers check and decrement a shared quota concurrently
- In-memory cache updates with read-modify-write cycles that span network calls or disk I/O
- Singleton initialization where multiple coroutines may trigger setup simultaneously on first access
- Session state in async web handlers where concurrent requests modify the same user session
- Connection pool checkout where only one coroutine should claim a specific idle connection

## When to Avoid

- Pure reads with no mutation — locks serialize access, and concurrent reads are safe without them
- State that lives in an external system like PostgreSQL or Redis which has its own transactional guarantees
- High-throughput hot paths where serialization creates a bottleneck — consider sharding state or using atomic operations
- Cross-process shared state where `asyncio.Lock` only protects within a single event loop, not across workers
- Long critical sections spanning LLM calls that would block other waiters for seconds, starving concurrency
- Situations where `asyncio.Semaphore` is more appropriate because you want N-way concurrent access, not mutual exclusion
- Reentrant access patterns where the same coroutine needs to acquire the lock twice — `asyncio.Lock` deadlocks silently

## In Production

**asyncpg** connection pools use internal locking to manage the checkout and return of database connections. When a coroutine calls `pool.acquire()`, the pool must atomically find an idle connection, mark it as in-use, and return it — a classic read-modify-write on shared state. Without locking, two concurrent `acquire()` calls could claim the same connection, leading to interleaved SQL queries on a single wire-protocol session. The lock ensures each connection is handed to exactly one caller, and the `async with pool.acquire() as conn:` pattern guarantees the connection returns to the pool even on exception.

**FastAPI** dependency injection with shared state — such as an in-memory rate limiter or a request counter — requires explicit locking when the state is mutated across `await` points. FastAPI runs each request handler as a separate coroutine on the same event loop, so two concurrent POST requests modifying a shared `dict` will interleave at any `await`. The idiomatic pattern is to store an `asyncio.Lock` alongside the shared state in the app's lifespan context and acquire it in the dependency function. Without this, rate limit counters drift under load and shared caches serve stale-then-overwritten values.

**aiohttp's session and cookie jar** implementations use locks internally to protect mutable session state during concurrent requests. When multiple coroutines share a single `ClientSession` and modify headers or cookies between requests, the jar's read-modify-write must be serialized. The session's connection pool similarly locks during connector acquisition to prevent double-checkout of the same TCP connection. This is invisible to users but critical for correctness under concurrency.

**Redis client libraries like aioredis** (now merged into redis-py's async interface) use locks to manage the connection pool and pipeline buffer. When multiple coroutines pipeline commands through the same connection, the send-buffer must be locked to prevent interleaved RESP protocol frames. A half-written `SET` command interleaved with another coroutine's `GET` produces garbage on the wire. The lock serializes access to the socket write buffer while allowing concurrent coroutines to queue commands.
