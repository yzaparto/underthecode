## Introduction

Not every LLM call should run to completion. If Claude is taking 10 seconds when you expected 2, you might want to abort and fall back to a cached response. `task.cancel()` raises `CancelledError` at the task's next `await` point, giving you a clean way to stop work that is no longer needed.

But what about critical operations like saving chat history or writing audit logs? If a parent task gets cancelled during a save, you do not want the save to be killed mid-write. `asyncio.shield()` protects inner tasks from outer cancellation — the inner coroutine keeps running even when the outer scope is cancelled.

This animation demonstrates both sides. Part 1 cancels a slow LLM call after a timeout. Part 2 shields a critical save operation from cancellation. Together they show how to build resilient async systems that can abort wasteful work while protecting essential operations.

## Why This Matters

Without cancellation, your app waits forever for hung APIs. A single slow dependency can cascade through your entire system — blocked coroutines pile up, memory grows, and eventually the application becomes unresponsive. Cancellation is the safety valve that prevents one bad call from taking down everything.

Without shield, critical saves get killed during shutdown. Imagine cancelling a request handler that is mid-way through persisting a transaction to the database. Without protection, you get corrupted state — half-written records, lost audit trails, inconsistent caches.

Both mechanisms are essential for production resilience. Cancellation is how timeouts, graceful shutdown, and race patterns work under the hood. Shield is how you protect invariants during those same operations. Understanding both is non-negotiable for production async code.

## When to Use This Pattern

- Aborting slow LLM calls that exceed acceptable latency thresholds
- Implementing manual timeouts with more control than `asyncio.timeout()` provides
- Protecting database writes during application shutdown or request cancellation
- Guarding critical file saves and audit log writes from being interrupted
- Cancelling speculative work when the answer has been found by another task
- Cleaning up resources like temporary files or open connections when a request is aborted

## What Just Happened

Part 1 demonstrated cancellation. Claude's task was cancelled after 1 second of a 3-second operation. `CancelledError` was raised at Claude's `await asyncio.sleep(3)` — the next await point after `cancel()` was called. The except block caught it gracefully and printed a fallback message instead of crashing.

Part 2 demonstrated shielding. A `shield()` wrapper was created around a save operation, then the wrapper was cancelled. The outer `await protected` raised `CancelledError` as expected, but the underlying save task kept running independently. When we later awaited the save task directly, it completed successfully with its result intact.

The critical insight is that `shield()` does not prevent the outer await from raising `CancelledError` — it only prevents the inner task from being cancelled. You must separately await the inner task to get its result after the shield is cancelled.

## Keep in Mind

- `cancel()` raises `CancelledError` at the next `await` point, not instantly — code between `cancel()` and the next `await` still executes
- `shield()` protects the inner task but the outer `await` still raises `CancelledError` — you do not get the result through the shield
- You must still `await` the shielded inner task separately to get its result after the outer cancellation
- Cancellation is a REQUEST not a guarantee — tasks can catch and suppress `CancelledError` in their except blocks
- Always re-raise `CancelledError` after cleanup unless you have a specific reason not to — suppressing it silently prevents proper shutdown

## Common Pitfalls

- Not catching `CancelledError` in the cancelled task, allowing it to propagate and cancel parent tasks unexpectedly
- Confusing `shield()` as making the outer await succeed — it does not, the outer await still raises `CancelledError`
- Cancelling a shield but never awaiting the inner task afterward, causing a resource leak and unobserved exception warning
- Suppressing `CancelledError` without re-raising it, which makes the task appear to complete normally and breaks shutdown logic
- Assuming `cancel()` stops the task immediately — synchronous code between await points still runs to completion
- Using `shield()` on fire-and-forget tasks without storing a reference to the inner task for later cleanup

## Where to Incorporate This

- Timeout fallbacks in chatbots where a slow response should be replaced with a cached or default answer
- Protecting chat history saves during graceful shutdown so conversation state is never lost
- Cancelling unused model responses in ensemble voting when the majority result is already determined
- Graceful request abortion on user disconnect to free server resources immediately
- Cleanup operations in long-running background workers that must finish database transactions before stopping

## Related Patterns

- `asyncio.timeout()` for declarative deadlines that use cancellation under the hood (animation 9)
- Graceful shutdown pattern using `try/except CancelledError` for resource cleanup (animation 17)
- `TaskGroup` auto-cancellation that cancels all sibling tasks when one fails (animation 14)
- `CancelledError` handling is fundamental to the race pattern with `wait(FIRST_COMPLETED)` (animation 20)
