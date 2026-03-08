## The Concept

Asyncio cancellation is **cooperative**, not preemptive. Calling `task.cancel()` does not kill the task — it requests cancellation by scheduling a `CancelledError` to be raised at the task's next `await` point. Synchronous code between `await` points still runs to completion. This means a task that never awaits can never be cancelled.

`CancelledError` inherits from `BaseException` (since Python 3.9), not `Exception`. This inheritance chain matters: a bare `except Exception` will **not** catch cancellation, which is correct behavior — cancellation should propagate through normal error handlers. Code that catches `BaseException` or `CancelledError` directly must re-raise it after cleanup, or it silently suppresses shutdown and timeout logic that depends on cancellation propagating.

`asyncio.shield()` is the counterpart: it wraps a coroutine so that outer cancellation does not reach the inner task. The outer `await` still raises `CancelledError`, but the shielded inner task keeps running independently. You must separately await the inner task to retrieve its result. Shield protects **critical operations** — database commits, audit log writes, billing finalization — from being killed when a parent scope is cancelled.

## Introduction

This animation demonstrates both sides of cancellation. Part 1 cancels a slow LLM call after a timeout — `CancelledError` is raised at the task's next `await`, the except block catches it gracefully, and a fallback response is returned. Part 2 shields a critical save operation from outer cancellation — the outer await raises `CancelledError` as expected, but the shielded inner task completes independently with its result intact.

## Why This Matters

Without cancellation, your application waits forever for hung APIs. A single slow dependency cascades through the system — blocked coroutines accumulate, memory grows, connection pools exhaust, and eventually the application becomes unresponsive. Cancellation is the safety valve that converts "wait forever" into "wait this long, then recover."

Without shield, critical writes get killed during shutdown. Imagine a request handler cancelled mid-way through persisting a financial transaction. Without protection, you get half-written records, lost audit trails, and inconsistent state that is expensive to detect and painful to repair.

Both mechanisms are foundational to production async code. Timeouts use cancellation under the hood. Graceful shutdown sequences depend on `CancelledError` propagating correctly. `TaskGroup` cancels siblings through this exact mechanism. Race patterns with `wait(FIRST_COMPLETED)` cancel losers via `task.cancel()`. Understanding cooperative cancellation is not optional — it is the control plane of asyncio.

## What Just Happened

Part 1 demonstrated cancellation. The slow task was cancelled after 1 second of a 3-second operation. `CancelledError` was raised at the task's `await asyncio.sleep(3)` — the next await point after `cancel()` was called. The except block caught it, printed a fallback message, and execution continued cleanly without crashing.

Part 2 demonstrated shielding. A `shield()` wrapper was created around a save operation, then the wrapper was cancelled. The outer `await protected` raised `CancelledError` as expected, but the underlying save task continued running in the background because `shield()` intercepted the cancellation. When the inner task was awaited directly afterward, it completed successfully with its result intact.

The critical insight: `shield()` does **not** make the outer await succeed. It only prevents the inner task from receiving the cancellation. You must hold a separate reference to the inner task and await it independently to get the result.

## When to Use

- Aborting slow LLM API calls that exceed acceptable latency thresholds before falling back to cached responses
- Implementing manual timeouts with finer control than `asyncio.timeout()` provides, such as conditional cancellation
- Protecting database commits and transaction finalization during request cancellation or application shutdown
- Guarding audit log writes and billing record persistence from being interrupted by parent scope cancellation
- Cancelling speculative work in race patterns when the winning result has been determined by another task
- Cleaning up temporary files, closing connections, and releasing locks when a long-running operation is aborted

## When to Avoid

- Suppressing `CancelledError` without re-raising — this silently breaks shutdown sequences, timeout logic, and `TaskGroup` cancellation
- Using `shield()` as a general-purpose "ignore cancellation" wrapper — it creates tasks that outlive their parent scope, violating structured concurrency
- Catching `CancelledError` in library code that does not need cleanup — let it propagate to callers who understand the cancellation context
- Shielding fire-and-forget tasks without storing a reference to the inner task, causing resource leaks and unobserved exception warnings
- Assuming `cancel()` stops the task immediately — CPU-bound code between await points runs to completion regardless
- Over-shielding everything out of caution — if every task is shielded, graceful shutdown cannot cancel anything and the process hangs
- Using cancellation for flow control instead of exceptions — `CancelledError` is for aborting, not for signaling normal completion

## In Production

**httpx** implements request cancellation through asyncio's cooperative model. When you cancel an `httpx.AsyncClient.get()` call, the `CancelledError` propagates through httpx's connection pool layer, which closes the underlying TCP socket and returns the connection slot to the pool. If cancellation hits during TLS negotiation or header parsing, httpx's internal `try/finally` blocks ensure partial connection state is cleaned up. This is why httpx connections do not leak on timeout — the cancellation path is as carefully coded as the success path.

**Uvicorn** uses `CancelledError` propagation for graceful shutdown. When Uvicorn receives SIGTERM, it cancels the server's `serve()` task, which propagates cancellation to all active request handler tasks. Each handler's `CancelledError` triggers Starlette's middleware cleanup chain — closing response streams, releasing database connections, flushing buffered logs. Handlers that shield critical work (like session persistence) continue running during the shutdown grace period. If shielded tasks do not complete within `--timeout-graceful-shutdown`, Uvicorn force-kills the remaining tasks and exits.

**Celery** with its async backends (`aio-celery`, `celery[asyncio]`) maps task revocation to `task.cancel()`. When you call `result.revoke()` from the Celery client, the worker's event loop cancels the corresponding asyncio task. The revoked task receives `CancelledError` at its next await, runs its cleanup logic, and reports `REVOKED` status back to the result backend. Tasks that use `shield()` around database writes continue their commits even after revocation — a pattern used in financial processing workers where partial writes are worse than delayed completion.

**gRPC-Python's async server** cancels handler coroutines when clients disconnect or deadlines expire. The `grpc.aio` server watches for client-side cancellation signals on the HTTP/2 stream and translates them into `asyncio.Task.cancel()` calls on the handler. This means a streaming RPC handler can detect client disconnect at any `await` point via `CancelledError`, clean up server-side resources (GPU memory, file handles, database cursors), and free capacity for other requests. Without this cooperative cancellation bridge between gRPC's C-core and Python's asyncio, disconnected clients would leave zombie handlers consuming resources until they naturally completed.
