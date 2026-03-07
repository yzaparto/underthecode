## Introduction

LLM APIs are unpredictable — what takes 1 second today might take 30 seconds tomorrow when the provider is under load. Without timeouts, your application is at the mercy of external services. A single hung call can freeze an entire request pipeline and leave users staring at a spinner.

`async with asyncio.timeout(1.0)` (Python 3.11+) sets a deadline for an entire block of code. Everything inside the `async with` must complete within the deadline or the block is cancelled and `TimeoutError` is raised. `asyncio.wait_for(coro, timeout=2.0)` wraps a single coroutine with the same behavior.

Both mechanisms auto-cancel the underlying task and raise `TimeoutError` when the deadline expires. The difference is scope: `timeout()` can wrap multiple awaits in a block, while `wait_for()` targets a single coroutine. This animation demonstrates both approaches against the same slow LLM call.

## Why This Matters

Without timeouts, one hung API call cascades through your system. The user waits, gets frustrated, retries, and now you have two hung requests consuming resources. Multiply this across hundreds of concurrent users and a brief API slowdown becomes a full outage.

Timeouts are circuit breakers for async code. They transform "wait forever" into "wait this long, then recover." Every production system needs them on every external call — LLM APIs, databases, search engines, third-party services. The question is never whether to use timeouts, but how long to set them.

They prevent one slow dependency from taking down your entire application. A 30-second LLM call behind a 5-second timeout becomes a 5-second fallback response instead of a 30-second hang. Combined with retries and fallback strategies, timeouts make your system resilient to the inevitable unreliability of external services.

## When to Use This Pattern

- Any external API call including LLM providers, search engines, and databases
- User-facing request handlers with response time SLAs that must be enforced
- Background jobs with processing deadlines that should fail fast rather than run indefinitely
- Health check endpoints that must respond quickly to avoid being marked as unhealthy by load balancers
- CI/CD pipeline steps where hanging is worse than failing
- Any operation where "too slow" is functionally equivalent to "failed"

## What Just Happened

Both timeouts fired before the 3-second LLM call completed. `asyncio.timeout()` raised `TimeoutError` after 1 second, cutting the operation short by 2 seconds. `wait_for()` raised `TimeoutError` after 2 seconds, giving the operation more time but still enforcing a ceiling.

In both cases, the underlying task was automatically cancelled — no manual `task.cancel()` call was needed. The cancellation happened at the task's next `await` point, just like explicit cancellation. The `except TimeoutError` blocks ran immediately, providing fallback responses to the caller.

The total execution time was determined by the timeouts, not by the LLM call duration. This is the fundamental value proposition: you control how long your code waits, regardless of how long the external service takes. The 3-second call was converted into a 1-second or 2-second operation with graceful degradation.

## Keep in Mind

- `asyncio.timeout()` is Python 3.11+ and scopes an entire `async with` block — multiple awaits share one deadline
- `wait_for()` wraps a single coroutine and works on older Python versions (3.4+)
- Both auto-cancel the underlying task when the deadline expires — no manual cancellation needed
- `TimeoutError` is the built-in Python exception, not an asyncio-specific type
- `asyncio.timeout_at()` accepts an absolute deadline (from `asyncio.get_event_loop().time()`) instead of a relative duration
- Nested timeouts follow inner-wins semantics — the tightest deadline always fires first

## Common Pitfalls

- Not having a fallback strategy — timeout plus crash is worse UX than timeout plus a cached or default response
- Setting timeouts too tight so that normal latency variance triggers them and creates unnecessary failures
- Nesting timeouts without understanding which fires first — the inner (tighter) deadline always wins
- Using `wait_for()` and expecting to retry the same coroutine object — coroutines are single-use and consumed after the first await
- Not logging timeout events for monitoring — timeouts are signals that a dependency is degrading and may need attention
- Setting the same timeout on retries without adding backoff — rapid retries against a slow service make the problem worse

## Where to Incorporate This

- LLM API call deadlines enforced per-call and per-request to bound total response time
- User-facing chatbot response limits where 5 seconds of thinking is acceptable but 30 is not
- Background agent SLA enforcement to prevent runaway tasks from consuming resources indefinitely
- Health probe timeouts for Kubernetes readiness and liveness checks that must respond in milliseconds
- Database query time limits to prevent slow queries from holding connections and starving other requests
- Upstream service call budgets that allocate a time budget across multiple sequential external calls

## Related Patterns

- Cancellation mechanics that timeouts use under the hood (animation 8)
- Retry with exponential backoff after timeout for transient failures (animation 18)
- Circuit breaker pattern that stops calling a service after N consecutive timeouts
- `asyncio.timeout_at()` for absolute deadlines when you need to share a deadline across multiple operations
- Combining timeout with `wait(FIRST_COMPLETED)` for "fastest result within a time budget"
