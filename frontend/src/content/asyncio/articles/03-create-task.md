## Introduction

`asyncio.create_task()` is the single most important function for achieving concurrency in asyncio. It takes a coroutine and schedules it on the event loop as an independent Task. The task begins running on the next iteration of the event loop — it does not wait for you to `await` it.

This animation wraps both LLM calls with `create_task()`. Both coroutines are registered with the event loop before either one is awaited. When the first coroutine hits its `await asyncio.sleep()`, the loop sees the second task waiting and starts it immediately. Both network requests are now in flight at the same time.

The total execution time drops from 3 seconds to 2 seconds. The time is now determined by the slowest call (`max(1, 2) = 2`) instead of the sum (`1 + 2 = 3`). That 1-second savings came from overlapping GPT-4's wait with Claude's wait.

## Why This Matters

This is the unlock. Everything in the previous animations was setup for this moment. `create_task()` tells the event loop to run coroutines concurrently, and the event loop does the rest. Five independent 2-second LLM calls go from 10 seconds to 2 seconds.

Every async web framework — FastAPI, Starlette, aiohttp — uses `create_task()` or equivalent mechanisms under the hood to handle multiple requests simultaneously. Understanding this function is understanding how modern async Python applications achieve their throughput.

The mental model is simple: `create_task()` is how you say "start this now, I will collect the result later." Without it, you are just doing sequential awaits with extra syntax. With it, independent I/O operations overlap and your total time collapses to the duration of the slowest one.

## When to Use This Pattern

- Independent LLM calls such as comparing GPT-4 output against Claude output
- Parallel API requests to different services that do not depend on each other
- Concurrent data fetching from multiple sources like databases, caches, and third-party APIs
- Pre-fetching resources while processing the current batch of data
- Fan-out notifications where you send email, SMS, and push simultaneously
- Any set of independent I/O operations where you can tolerate them running at the same time

## What Just Happened

The total time dropped from 3 seconds to 2 seconds. Both `create_task()` calls registered their coroutines with the event loop immediately, before any `await` was reached.

When GPT-4's coroutine hit `await asyncio.sleep(1)`, it yielded control back to the event loop. The loop checked its queue, found Claude's task ready to run, and started it. Now both sleep timers were counting down simultaneously — the network requests overlapped.

GPT-4 finished at the 1-second mark. Claude finished at the 2-second mark. The total time was `max(1, 2) = 2` seconds. The 1 second that GPT-4 would have wasted waiting was filled by Claude's concurrent execution.

## Keep in Mind

- `create_task()` returns a Task object immediately — the coroutine starts running on the next loop iteration
- You still need to `await` the Task to retrieve its return value or propagate exceptions
- Total time becomes `max(all durations)` instead of `sum(all durations)` for independent operations
- Tasks run on the same thread using cooperative multitasking, not parallel execution on multiple cores
- `create_task()` requires a running event loop — it cannot be called from synchronous code
- Always keep a reference to tasks you care about so they are not garbage collected prematurely

## Common Pitfalls

- Forgetting to `await` the task, which causes errors to be silently lost and work to be abandoned on program exit
- Creating thousands of tasks without concurrency limits, which overwhelms APIs — use `asyncio.Semaphore` to throttle
- Not handling task exceptions, which triggers Python's "exception was never retrieved" warning
- Assuming `create_task()` means parallel CPU execution — it is concurrent I/O on a single thread
- Creating tasks for operations that depend on each other, which introduces race conditions

## Where to Incorporate This

- Parallel LLM model comparison where you send the same prompt to multiple providers
- Fetching user data from multiple microservices concurrently to build a composite response
- Sending concurrent webhook notifications to multiple endpoints
- Pre-fetching and caching data that will be needed by upcoming operations
- Batch API requests with `asyncio.Semaphore` limiting to respect rate limits
- Running health checks across multiple dependent services simultaneously

## Related Patterns

- `asyncio.gather()` is a cleaner one-liner for creating multiple tasks and awaiting all of them
- `asyncio.TaskGroup` (Python 3.11+) adds automatic cancellation of sibling tasks on failure
- `asyncio.as_completed()` yields results in completion order instead of creation order
- `asyncio.Semaphore` pairs with `create_task()` to limit how many tasks run concurrently
- `asyncio.wait()` with `FIRST_COMPLETED` lets you react as soon as any task finishes
