## Introduction

LLM APIs are unpredictable — what takes 1 second today might take 30 seconds tomorrow when the provider is under load. `async with asyncio.timeout(1.0)` (Python 3.11+) sets a deadline for an entire block of code. Everything inside the `async with` must complete within the deadline or the block is cancelled and `TimeoutError` is raised. `asyncio.wait_for(coro, timeout=2.0)` wraps a single coroutine with the same behavior for older Python versions.

Both mechanisms auto-cancel the underlying task and raise `TimeoutError` when the deadline expires. The difference is scope: `timeout()` can wrap multiple awaits sharing one deadline, while `wait_for()` targets a single coroutine. This animation demonstrates both approaches against the same slow LLM call.

## Why This Matters

Without timeouts, one hung API call cascades through your system. The user waits, retires, and now you have two hung requests consuming memory and connection pool slots. Multiply this across hundreds of concurrent users and a brief API slowdown becomes a full outage. Timeouts are the **circuit breaker** for async code — they transform "wait forever" into "wait this long, then recover."

Every external call in a production system needs a timeout: LLM APIs, databases, search engines, third-party services. The question is never whether to use timeouts, but **how long** to set them. Too tight and normal latency variance triggers false failures. Too loose and slow dependencies still cascade. The right value comes from measuring P99 latency of the dependency and adding a buffer.

Timeouts compose with the rest of asyncio's control flow. Under the hood, `asyncio.timeout()` uses `task.cancel()` — the same cooperative cancellation mechanism from the previous animation. Nested timeouts follow **inner-wins semantics**: the tightest deadline always fires first. `asyncio.timeout_at()` accepts an absolute deadline for sharing a single budget across multiple sequential operations.

## What Just Happened

Both timeouts fired before the 3-second LLM call completed. `asyncio.timeout()` raised `TimeoutError` after 1 second, cutting the operation short by 2 seconds. `wait_for()` raised `TimeoutError` after 2 seconds, giving the operation more time but still enforcing a ceiling.

In both cases, the underlying task was automatically cancelled — no manual `task.cancel()` call was needed. The cancellation happened at the task's next `await` point, exactly like explicit cancellation. The `except TimeoutError` blocks ran immediately, returning fallback responses to the caller.

The total execution time was determined by the **timeouts**, not by the LLM call duration. A 3-second call became a 1-second or 2-second operation with graceful degradation. This is the fundamental value: you control how long your code waits, regardless of how long the external service takes.

## When to Use

- Any external API call — LLM providers, search engines, databases, third-party services — where "too slow" equals "failed"
- User-facing request handlers with response time SLAs that must be enforced regardless of backend latency
- Health check endpoints that must respond within milliseconds to avoid being marked unhealthy by load balancers
- Background jobs with processing deadlines that should fail fast rather than consume resources indefinitely
- CI/CD pipeline steps where a hanging test or build is worse than a fast failure
- Multi-step workflows where a total time budget must be split across sequential external calls using `timeout_at()`

## When to Avoid

- Setting timeouts without a fallback strategy — timeout plus crash is worse UX than timeout plus a cached or default response
- Choosing timeout values without measuring actual P99 latency of the dependency, leading to false positives or useless ceilings
- Nesting `timeout()` contexts without understanding inner-wins semantics — the tightest deadline always fires first regardless of nesting order
- Using `wait_for()` and expecting to retry the same coroutine object afterward — coroutines are single-use and consumed after the first await
- Setting identical timeout values on retries without backoff — rapid retries against a degraded service amplify the problem
- Wrapping CPU-bound synchronous code in `timeout()` — cancellation only fires at `await` points, so blocking code runs to completion regardless
- Omitting timeout logging and metrics — timeouts are signals that a dependency is degrading and needs attention before it causes an outage

## In Production

**httpx** exposes a structured timeout configuration via `httpx.Timeout(connect=5.0, read=10.0, write=5.0, pool=2.0)` that maps each phase of an HTTP request to a separate deadline. Under the hood, each phase timeout is implemented using `asyncio.timeout()` scoped to that phase's awaitable. The `pool` timeout is particularly subtle — it limits how long a request will wait for an available connection from the pool, preventing backpressure from a slow upstream from starving unrelated request paths. Production configurations typically set `connect` aggressively (1-3s) since DNS and TCP handshake latency is predictable, while setting `read` more generously for LLM streaming responses that take variable time to complete.

**OpenAI's Python SDK** accepts a `timeout` parameter on every API call (`client.chat.completions.create(timeout=30.0)`) and a default `timeout` on the client constructor. Internally, this wraps the HTTP request in `asyncio.timeout()`. The SDK also supports `max_retries` with exponential backoff, but critically, each retry gets its own fresh timeout — the deadline is per-attempt, not cumulative. Teams running latency-sensitive applications set per-call timeouts based on model and expected token count: GPT-4 calls with long outputs get 60s, GPT-3.5-turbo classification calls get 10s.

**Kubernetes** liveness and readiness probes use timeouts as the primary health signal. A liveness probe configured with `timeoutSeconds: 3` sends an HTTP GET to the pod's health endpoint and expects a response within 3 seconds. If the asyncio application's event loop is blocked — by a GIL-holding CPU computation, a missing timeout on a database call, or a deadlocked semaphore — the health endpoint cannot respond in time, and Kubernetes restarts the pod. This is why `asyncio.timeout()` on every external dependency is not just good practice but a **liveness requirement**: one missing timeout on one database call can cause Kubernetes to kill the entire pod.

**Redis** clients like **redis-py** with async support use `asyncio.timeout()` around both individual commands and connection acquisition from the pool. The `socket_timeout` parameter controls per-command deadlines, while `socket_connect_timeout` limits connection establishment. In production Redis deployments behind Sentinel or Cluster, the failover detection relies on these timeouts — when the master becomes unreachable, the timeout fires, the client queries Sentinel for the new master, and reconnects. Without aggressive socket timeouts (typically 1-3s for cache operations), a network partition between the application and a failed Redis master would stall every coroutine waiting on cache reads until the TCP stack's own timeout (often 15+ minutes) expired.
