## Introduction

Long-running LLM agents — chat handlers, background processors, queue consumers — run indefinitely until told to stop. Simply killing them risks losing in-flight work, corrupting data, or leaving connections open. The `try/except CancelledError` pattern gives tasks a chance to clean up: save state, flush queues, close connections, then exit gracefully.

This animation shows two worker agents in infinite loops processing items. After 3 seconds, `main()` cancels them both. Watch how each worker catches `CancelledError`, executes its cleanup logic (saving state), and exits cleanly rather than dying mid-operation. `gather(return_exceptions=True)` collects everything without crashing the parent.

Every production async application needs a shutdown strategy. The `CancelledError` mechanism is how asyncio communicates "please stop" to running tasks. Ignoring it means your workers die without saving, your connections leak, and your queues lose messages.

## Why This Matters

In production, processes get stopped constantly — deployments roll out new code, autoscalers remove instances, operators restart services, users press Ctrl+C. If your agents do not handle cancellation, every single one of these events causes data loss. In-flight LLM responses vanish, partial results disappear, database transactions hang open.

Graceful shutdown is the difference between "data loss on every deploy" and "zero-downtime deployment." When a worker catches `CancelledError`, it can re-enqueue its current item, flush buffered writes, close WebSocket connections with proper close frames, and log its final state. The next worker picks up exactly where this one left off.

This is also what `asyncio.run()` does internally when the main coroutine finishes. It cancels all remaining tasks and waits for them to handle the cancellation. Understanding this pattern means understanding how every asyncio application shuts down.

## When to Use This Pattern

- Long-running background workers that must persist state on exit to avoid losing progress
- WebSocket connection handlers that need to send close frames before disconnecting
- Queue consumers that should re-enqueue unfinished items so another worker can pick them up
- Periodic polling tasks that maintain state between iterations and must save before stopping
- Any infinite-loop task in a production system that will eventually be stopped by external forces
- Deployment and scaling scenarios where containers receive `SIGTERM` and must exit within a deadline

## What Just Happened

Both workers ran two loop iterations each — processing an item, sleeping, processing another item, sleeping. At the 3-second mark, `main()` called `task.cancel()` on both workers. `CancelledError` was raised at their next `await asyncio.sleep(2)` point, interrupting the sleep.

Each worker caught the `CancelledError` in its `except` block and executed cleanup logic — a 0.5-second `await asyncio.sleep(0.5)` simulating a state save to disk or database. After cleanup, the workers exited their infinite loops and returned.

`gather(*workers, return_exceptions=True)` collected the results. Because `return_exceptions=True` was set, the `CancelledError` exceptions appeared as return values instead of propagating up and crashing `main()`. Both workers shut down cleanly with zero data loss.

## Keep in Mind

- `CancelledError` is raised at the NEXT `await` point after `task.cancel()` is called, not immediately at the cancel call
- Cleanup code inside the `except CancelledError` block CAN use `await` for saves, flushes, and connection closes
- `gather(return_exceptions=True)` prevents `CancelledError` from propagating to the caller and crashing the program
- This is what `asyncio.run()` does internally when the main coroutine finishes — it cancels all remaining tasks
- First Ctrl+C in `asyncio.run()` cancels the main task gracefully, second Ctrl+C raises `KeyboardInterrupt` immediately

## Common Pitfalls

- Not catching `CancelledError` at all, so the task dies silently with all in-flight state lost permanently
- Doing synchronous blocking cleanup in the except block, which freezes the entire event loop during shutdown
- Re-raising `CancelledError` after only partial cleanup, which triggers another round of cancellation on nested tasks
- Creating infinite cleanup loops where cleanup code itself gets cancelled or raises new exceptions
- Not testing the shutdown path in development, leading to failures that only manifest in production deployments

## Where to Incorporate This

- Chat agent shutdown that saves conversation history, context window, and pending tool call results
- Queue consumer shutdown that re-enqueues the current unfinished item back to the message queue for another worker
- WebSocket handler cleanup that sends a proper close frame to the client before dropping the connection
- Periodic sync agent shutdown that flushes all pending buffered writes to the database before exiting
- Connection pool shutdown that iterates all open connections and closes them gracefully with proper protocol

## Related Patterns

- Cancellation and `shield()` for protecting specific critical operations from being cancelled during shutdown
- Timeouts for setting deadlines on cleanup operations so shutdown does not hang indefinitely
- Signal handling with `loop.add_signal_handler(SIGTERM)` for container-aware shutdown in Docker and Kubernetes
- `asyncio.run()` shutdown sequence internals which follow this exact pattern automatically
- Container orchestration health checks where readiness probes drain traffic before shutdown begins
