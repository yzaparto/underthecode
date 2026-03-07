## Introduction

Four ways to schedule concurrent tasks, all achieving the same result but with different trade-offs. Manual `create_task` plus individual `await` gives fine-grained control over each task's lifecycle. `gather(*coroutines)` is a clean one-liner that creates tasks internally. `gather(*tasks)` gives you task handles for inspection or cancellation. `TaskGroup` (Python 3.11+) adds structured concurrency with automatic cancellation on failure.

Choosing the right scheduling pattern depends on your error handling needs, your Python version, and how much control you need over individual task lifecycles. All four patterns achieve concurrency — the difference is in ergonomics, error semantics, and what happens when things go wrong.

This animation runs the same pair of coroutines through all four patterns. Each produces the same 2-second total time, proving that the concurrency behavior is identical. The differences only surface when you need to cancel tasks, handle errors, or inspect intermediate state.

## Why This Matters

Knowing all four patterns prevents lock-in to one approach. Developers who only know `gather()` struggle when they need to cancel individual tasks or handle partial failures gracefully. Developers who only know `create_task` write verbose boilerplate when a one-liner would suffice.

Each pattern has different error handling behavior that can silently cause bugs. `gather()` swallows exceptions by default — if one task fails, the others keep running and you might never notice the failure. `TaskGroup` takes the opposite approach and cancels everything on the first failure, which prevents silent corruption but can surprise you if partial success is acceptable.

Choosing wrong means either silent bugs or unexpected crashes in production. Understanding all four patterns lets you pick the right tool for each situation and recognize when a teammate has chosen the wrong one in code review.

## When to Use This Pattern

- Manual `create_task` when you need fine-grained control over task lifecycle, cancellation, or inspection
- `gather(*coroutines)` for simple fan-out where you need all results and don't need task handles
- `gather(*tasks)` when you want both concurrency and the ability to cancel or check individual tasks
- `TaskGroup` for Python 3.11+ when any failure should cancel all sibling tasks immediately
- `gather(return_exceptions=True)` when partial success is acceptable and you want to inspect each result individually
- `TaskGroup` when you want guaranteed cleanup — all tasks either complete or are cancelled when the block exits

## What Just Happened

All four patterns produced the same 2-second total execution time. Two coroutines that each sleep for different durations ran concurrently under every pattern, proving that the scheduling behavior is identical regardless of which API you use.

The difference is entirely in ergonomics and error semantics. `gather()` returned results in input order — the first coroutine's result is always at index 0 regardless of which finished first. `TaskGroup` would have cancelled all tasks if any single one had raised an exception, providing fail-fast behavior.

The manual approach gave the most control — you could inspect `task.done()`, call `task.cancel()`, or add callbacks — but required the most code. `gather()` and `TaskGroup` are higher-level abstractions that handle the common cases with less boilerplate.

## Keep in Mind

- `gather()` swallows exceptions by default — failed tasks return their exception object only if you pass `return_exceptions=True`
- `TaskGroup` raises `ExceptionGroup` on failure, which requires `except*` syntax (Python 3.11+) to handle selectively
- `TaskGroup` guarantees all tasks complete or are cancelled when the `async with` block exits — no orphaned tasks
- `gather()` returns results in creation order, not completion order — the slowest task's result still appears at its original index
- `TaskGroup` is Python 3.11+ only — use `gather()` or manual `create_task` for older Python versions
- Mixing scheduling patterns in one function makes code harder to read and reason about

## Common Pitfalls

- Using `gather()` without `return_exceptions=True` and losing error information silently when one task fails
- Forgetting that `TaskGroup` cancels ALL sibling tasks if one fails — this may not be what you want if partial results are valuable
- Mixing scheduling patterns in the same function, making it confusing to understand the concurrency and error semantics
- Not understanding that `gather()` creates tasks internally from bare coroutines — passing a coroutine is fine
- Assuming `TaskGroup` results are accessible like `gather()` results — you need to store results via task references or shared state
- Ignoring `ExceptionGroup` handling with `TaskGroup` and letting unhandled exception groups crash the application

## Where to Incorporate This

- Parallel model comparison using `gather` to call multiple LLMs and collect all responses
- Multi-agent orchestration with `TaskGroup` where one agent failure should abort the entire pipeline
- Background task spawning with `create_task` for fire-and-forget operations like logging or metrics
- Batch API calls with `gather` to send many requests concurrently and collect results in order
- Any concurrent fan-out where error handling requirements determine which pattern to choose

## Related Patterns

- `as_completed()` for processing results in completion order instead of creation order (animation 10)
- `wait()` with `return_when` flags for fine-grained control over when to stop waiting (animation 20)
- Structured concurrency principles that `TaskGroup` implements — no task outlives its parent scope
- Error handling with `ExceptionGroup` and `except*` syntax for selective exception matching (animation 14)
