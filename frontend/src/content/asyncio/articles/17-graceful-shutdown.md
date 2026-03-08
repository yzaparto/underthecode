## The Concept

Every production process eventually receives a "please stop" signal — Kubernetes sends **SIGTERM** before killing a pod, Ctrl+C raises `KeyboardInterrupt`, and `asyncio.run()` cancels remaining tasks when the main coroutine finishes. Graceful shutdown is the discipline of catching that signal and doing something useful before dying: saving state, flushing buffers, re-enqueueing unfinished work, closing connections with proper protocol frames. The `try/except CancelledError` pattern is asyncio's mechanism for this. When `task.cancel()` is called, `CancelledError` is raised at the task's next `await` point — not immediately, but at the next yield to the event loop. The task catches it, runs cleanup, and exits. This structured cancellation model means every coroutine has a guaranteed opportunity to clean up, and the parent can wait for that cleanup to finish before proceeding.

## Introduction

This animation shows two worker agents in infinite loops processing items from a queue. After 3 seconds, `main()` calls `task.cancel()` on both. Watch how `CancelledError` is raised at each worker's next `await asyncio.sleep()` point, each worker catches it, executes cleanup logic (simulating a state save with a 0.5-second async write), and exits cleanly. `gather(return_exceptions=True)` collects everything without crashing the parent. Both workers shut down with zero data loss.

The animation highlights the critical timeline: workers are mid-sleep when cancellation arrives, the exception propagates to the `except CancelledError` block, cleanup runs (including further `await` calls), and the coroutines return. The parent sees clean completion instead of a crash.

## Why This Matters

In production, processes get stopped constantly. Deployments roll out new code, autoscalers remove instances, operators restart services, and health checks fail. If your coroutines do not handle cancellation, every single one of these events causes data loss. In-flight LLM responses vanish, partial results disappear, database transactions hang open with locks held, and message queue items are neither acknowledged nor re-enqueued — they enter limbo.

Graceful shutdown is the difference between "data loss on every deploy" and "zero-downtime deployment." When a worker catches `CancelledError`, it can re-enqueue its current item, flush buffered writes, close WebSocket connections with proper close frames, and log its final state. The next worker instance picks up exactly where this one left off. Without it, every deployment is a minor incident.

This is also what `asyncio.run()` does internally. When the main coroutine finishes, it cancels all remaining tasks, waits for them to handle the cancellation, and then shuts down the event loop. Understanding this pattern means understanding the shutdown sequence of every asyncio application.

## What Just Happened

Both workers ran two loop iterations each — processing an item, sleeping, processing another item, sleeping. At the 3-second mark, `main()` called `task.cancel()` on both. `CancelledError` was injected at their next `await asyncio.sleep(2)` point, interrupting the sleep mid-way.

Each worker caught the `CancelledError` in its `except` block and executed cleanup: a 0.5-second `await asyncio.sleep(0.5)` simulating a state save to disk or database. The cleanup code itself used `await` — this is allowed and essential for async cleanup operations like flushing a write buffer or sending a WebSocket close frame.

`gather(*workers, return_exceptions=True)` collected the results. Because `return_exceptions=True` was set, the `CancelledError` exceptions appeared as return values instead of propagating up and crashing `main()`. Both workers shut down cleanly, state was saved, and the program exited with code 0.

## When to Use

- Long-running background workers that must persist state on exit to avoid losing hours of progress
- WebSocket handlers that need to send close frames before disconnecting to avoid client-side errors
- Queue consumers that should re-enqueue unfinished items so another worker can pick them up immediately
- Periodic polling tasks that maintain state between iterations and must flush before stopping
- Any infinite-loop coroutine in a production system that will eventually be stopped by external forces
- Database connection holders that must commit or rollback open transactions before the connection drops
- LLM streaming handlers that should save partial responses when cancellation interrupts mid-stream

## When to Avoid

- Short-lived coroutines where cleanup cost exceeds the value of the saved state
- Fire-and-forget tasks where losing in-flight work is acceptable and retry will handle it
- Coroutines that hold no external resources and have no state worth persisting
- Situations where `asyncio.shield()` is more appropriate because the operation must complete regardless of cancellation
- Cleanup logic that is purely synchronous and blocks the event loop — use `run_in_executor` for blocking cleanup
- Cases where the upstream caller expects `CancelledError` to propagate and catching it would break structured concurrency
- Test harnesses where fast teardown matters more than graceful state preservation

## In Production

**Kubernetes pod lifecycle** sends SIGTERM to the main process when a pod is scheduled for termination, then waits `terminationGracePeriodSeconds` (default 30s) before sending SIGKILL. **Uvicorn** registers a signal handler for SIGTERM that calls `server.should_exit = True`, which causes the server to stop accepting new connections, wait for in-flight requests to complete, and then shut down the event loop. The entire chain — Kubernetes SIGTERM to Uvicorn signal handler to asyncio task cancellation to `CancelledError` in your handler — is a structured cancellation pipeline. If your request handler catches `CancelledError` and flushes its response buffer, the client receives a complete response even during a rolling deployment.

**Celery's warm shutdown** (`SIGTERM` to the worker) finishes currently executing tasks before stopping. The worker transitions to a "not accepting new tasks" state, waits for in-flight tasks to complete (up to a configurable timeout), and then exits. The async equivalent with `CancelledError` mirrors this exactly: cancel the task, let it catch the error and finish its current unit of work, then collect the result. Celery's `SoftTimeLimitExceeded` exception is the same pattern — a cooperative signal that the task should wrap up, not an immediate kill.

**gRPC Python async servers** handle shutdown through `server.stop(grace_period)`. During the grace period, the server stops accepting new RPCs but allows in-flight RPCs to complete. Each in-flight handler coroutine receives cancellation if the grace period expires, and the handler's `except CancelledError` block can send a partial response or log the incomplete operation. Google's internal gRPC services use this pattern extensively — a 15-second grace period is typical, matching the Kubernetes default, so that rolling deployments never drop in-flight requests.

**The Anthropic SDK and OpenAI SDK** both implement cancellation-aware streaming. When you iterate an async stream with `async for chunk in response:` and the surrounding task is cancelled, the SDK catches `CancelledError` internally, sends a connection close to the API, and releases the HTTP connection back to the pool. Without this cleanup, cancelled streams would leak TCP connections until the OS reclaims them — a slow resource leak that manifests as connection pool exhaustion after hundreds of cancelled requests.
