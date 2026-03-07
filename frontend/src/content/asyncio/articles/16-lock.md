## Introduction

Even in single-threaded async code, shared mutable state is dangerous. When two coroutines read-compute-write the same variable with `await` points in between, they interleave and overwrite each other. The event loop switches control at every `await`, creating the exact same race conditions that plague multi-threaded code. `asyncio.Lock` ensures only one coroutine enters the critical section at a time, serializing access to shared state.

This animation shows two agents (GPT-4 and Claude) sharing a token counter. Without the lock, both would read 0, compute independently, and overwrite each other — resulting in a lost update. With the lock, GPT-4 acquires it first, does its work, and releases it. Only then does Claude get access, reading the correct updated value of 100 instead of the stale 0.

The `async with lock:` syntax guarantees the lock is released even if an exception occurs inside the critical section. This is the only safe way to use locks in production async code.

## Why This Matters

"Single thread means no race conditions, right?" Wrong. The `await` points are where the event loop switches tasks, creating interleaving just like threads. GPT-4 reads 0, hits `await`, Claude reads 0 (the same stale value), both compute independently, and both write their results — one overwrites the other. This is textbook data corruption, and it happens in single-threaded async code every day.

The insidious part is that this bug is timing-dependent. In testing with small payloads, coroutines may complete so fast that interleaving never happens. In production with real network latency, the `await` points take long enough for the event loop to switch — and the corruption begins. Locks prevent this regardless of timing.

Race conditions in async code are harder to reproduce than in threaded code because the interleaving is deterministic within a single run but varies across runs based on I/O timing. A lock makes the behavior deterministic: one coroutine at a time, always.

## When to Use This Pattern

- Shared counters or accumulators across concurrent agents that update the same variable
- Token usage tracking for billing where undercounting means lost revenue
- Rate limit state management where multiple callers check and decrement a shared quota
- In-memory cache updates with read-modify-write cycles that span `await` points
- Any mutable shared state with `await` points in the critical path between read and write
- Session state management in async web applications where concurrent requests modify the same session

## What Just Happened

GPT-4 acquired the lock first, read the counter value of 0, slept for 1 second simulating computation, and wrote 100 to the counter. During that entire time, Claude was BLOCKED waiting for the lock — the event loop was free to run other tasks, but Claude specifically could not proceed past `async with lock:`.

After GPT-4 released the lock, Claude immediately acquired it. Claude read 100 (the correct updated value), slept for its computation, and wrote 300 (100 + 200). The final counter value is 300 — exactly correct.

Without the lock, both agents would have read 0 simultaneously, computed 100 and 200 independently, and the last writer would have set the counter to either 100 or 200 — never the correct 300. The interleaving at the `await` point is what makes this possible even in single-threaded code.

## Keep in Mind

- `asyncio.Lock` is NOT reentrant — the same task acquiring it twice causes a deadlock with no error message
- Always use `async with lock:` for exception safety — it guarantees release even if the critical section raises
- Locks serialize access, meaning only one task runs the critical section at a time — this is a throughput tradeoff
- Keep critical sections as short as possible to avoid starving other waiters and reducing concurrency
- `asyncio.Lock` does not protect against concurrent access from other threads — use `threading.Lock` for that

## Common Pitfalls

- Holding locks across long `await` operations like LLM calls, which starves other waiters for seconds or minutes
- Deadlocks from acquiring multiple locks in different orders — task A holds lock1 and wants lock2 while task B holds lock2 and wants lock1
- Using `threading.Lock` in async code, which blocks the entire event loop instead of just the calling coroutine
- Thinking single-threaded async means no data races — the `await` interleaving in this animation proves otherwise
- Forgetting that `lock.acquire()` without `async with` requires a manual `lock.release()` in a `finally` block

## Where to Incorporate This

- Token usage counters across concurrent LLM calls where accurate billing depends on correct totals
- Shared rate limit state across multiple API callers checking and decrementing the same quota
- In-memory cache with concurrent readers and writers performing read-modify-write operations
- Accumulating results from multiple parallel agents into a shared data structure like a list or dict
- Session state management in async web frameworks like FastAPI or aiohttp where concurrent requests hit the same session

## Related Patterns

- `Event` for one-to-many signaling without mutual exclusion where you notify rather than guard
- `Semaphore` for N-way concurrent access when you want to allow multiple but limited concurrent entries
- `Condition` for complex wait-then-modify patterns where tasks need to wait for a specific state before proceeding
- `RWLock` from third-party libraries for allowing multiple concurrent readers with exclusive writers
- Database transactions as an external locking mechanism when shared state lives outside the process
