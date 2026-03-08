## The Concept

`asyncio.create_task()` takes a coroutine and wraps it in a **Task** — a `Future` subclass that is immediately scheduled on the running event loop. The distinction between a coroutine and a Task is the distinction between a recipe and a cook following it. A coroutine is inert until someone drives it; a Task is self-driving, advancing itself through the event loop's scheduling cycle without waiting for your `await`.

Python's asyncio uses **cooperative scheduling**: tasks voluntarily yield control at `await` points, and the event loop picks the next ready task from its queue. This is fundamentally different from OS thread scheduling, which is preemptive. A task that never hits an `await` will hog the loop forever. But when tasks do yield — at every `await asyncio.sleep()`, every `await response.read()`, every `await cursor.execute()` — the event loop interleaves them seamlessly, giving the illusion of parallelism on a single thread.

## Introduction

This animation wraps both LLM calls with `create_task()` before awaiting either one. Both coroutines are registered with the event loop immediately. When GPT-4's coroutine hits `await asyncio.sleep(1)`, the loop sees Claude's task in its ready queue and starts it. Both network requests are now in flight simultaneously. Total execution time drops from 3 seconds to 2 seconds — determined by the slowest call (`max(1, 2) = 2`) instead of the sum (`1 + 2 = 3`).

## Why This Matters

This is the unlock for asyncio concurrency. Everything in the previous animations was setup for this moment. Without `create_task()`, you are doing sequential awaits with extra syntax. With it, independent I/O operations overlap and your total wallclock time collapses to the duration of the slowest one.

The mental model is simple: `create_task()` means "start this now, I will collect the result later." The coroutine begins executing on the next iteration of the event loop — it does not wait for your `await`. When you later `await` the Task, you are collecting a result that may already be finished, not starting the work. This separation of **initiation** from **collection** is the core mechanism of asyncio concurrency.

The scaling implications are dramatic. Five independent 2-second LLM calls go from 10 seconds to 2 seconds. Ten independent database queries that each take 50ms go from 500ms to 50ms. The speedup is `sum / max` for independent operations, and in I/O-heavy applications where you routinely fan out to multiple services, this ratio can be 5x, 10x, or higher.

## What Just Happened

Both `create_task()` calls registered their coroutines with the event loop before any `await` was reached. The event loop's ready queue now contained two tasks. When GPT-4's coroutine hit `await asyncio.sleep(1)`, it yielded control. The loop found Claude's task ready and started executing it. Claude immediately hit `await asyncio.sleep(2)` and yielded.

Now both sleep timers were counting down simultaneously — the event loop registered both with its I/O selector and went idle. GPT-4's timer fired at the 1-second mark, and the loop resumed that coroutine to completion. Claude's timer fired at the 2-second mark. Total time: `max(1, 2) = 2` seconds. The 1 second that GPT-4 would have wasted waiting in the sequential version was filled by Claude's concurrent execution.

## When to Use

- Independent LLM calls such as comparing GPT-4 output against Claude output
- Parallel API requests to different services that do not depend on each other
- Concurrent database queries from independent tables via `asyncpg` or SQLAlchemy async
- Pre-fetching resources while processing the current batch of data
- Fan-out notifications where you send email, SMS, and push simultaneously
- Health checks across multiple dependent services that should run concurrently
- Batch webhook deliveries with a `Semaphore` controlling concurrency limits

## When to Avoid

- Operations with sequential data dependencies where step B needs step A's result
- CPU-bound computation that will hog the event loop without yielding at `await` points
- Fire-and-forget tasks where you never `await` the result — exceptions get silently swallowed
- Creating unbounded thousands of tasks without a `Semaphore` to throttle API rate limits
- Short-lived scripts where the overhead of the event loop exceeds the concurrency benefit
- Coroutines that internally call blocking I/O like `requests.get()` — the task will still block the loop
- Situations where `asyncio.gather()` or `TaskGroup` provides cleaner syntax for the same pattern

## In Production

FastAPI handles every incoming HTTP request as an asyncio Task on Uvicorn's event loop. When a request handler calls `await httpx_client.get(url)`, the event loop suspends that handler's task and services other in-flight requests. Thousands of concurrent connections share a single thread because each handler yields at its `await` points. This is `create_task()` at scale — Uvicorn's internals call `loop.create_task()` for each accepted connection, and the event loop interleaves them cooperatively. A single Uvicorn worker can handle hundreds of concurrent I/O-bound requests where a synchronous WSGI server like Gunicorn would need hundreds of threads.

The Anthropic Python SDK's async client (`anthropic.AsyncAnthropic`) creates streaming connections via `httpx.AsyncClient`. When you use `create_task()` to run multiple `client.messages.create()` calls concurrently, each task independently manages its HTTP/2 stream. The `httpx` transport multiplexes these streams over a single TCP connection using HTTP/2, so `create_task()` is not just overlapping wallclock time — it is also reducing the number of TCP connections and TLS handshakes needed. This is why async HTTP clients paired with `create_task()` can be dramatically more efficient than thread-per-request models.

Kubernetes controllers written in Python — using libraries like `kopf` or custom asyncio controllers — use `create_task()` to reconcile multiple resources concurrently. When a controller watches Deployments, Services, and ConfigMaps, each watch stream runs as a separate task on the event loop. Reconciliation logic for one resource yields at `await` points, allowing the controller to process events from other resource types without delay. The alternative — sequential reconciliation — would cause event backlogs and stale state during high-churn periods like rolling deployments.

`asyncpg`, the high-performance async PostgreSQL driver, is designed to be used with `create_task()`. Its connection pool (`asyncpg.create_pool()`) hands out connections to concurrent tasks, each running independent queries. When task A awaits a slow analytical query, task B can execute a fast lookup on a different connection. The pool manages connection lifecycle and backpressure automatically. In benchmarks, `asyncpg` with concurrent tasks outperforms `psycopg2` with thread pooling by 2-3x for mixed read/write workloads because the cooperative scheduling overhead is far lower than OS thread context switching.
