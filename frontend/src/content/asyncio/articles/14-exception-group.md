## Introduction

In a multi-agent system, what happens when one agent crashes? With `TaskGroup`, if any task raises an exception, all sibling tasks are automatically cancelled. The errors are collected into an `ExceptionGroup`. Python 3.11's `except*` syntax lets you match and handle specific exception types from within the group — catching `ValueError` while letting `TypeError` propagate.

This is structured error handling for concurrent code. Just as try/except handles errors in sequential code, `TaskGroup` + `except*` handles errors when multiple tasks are running simultaneously. The key difference is that multiple errors can occur at the same time, so you need a container (`ExceptionGroup`) and a matching syntax (`except*`).

This animation demonstrates three agents starting concurrently inside a `TaskGroup`. One agent raises a `ValueError` after 1 second. The `TaskGroup` immediately cancels the other two agents, collects the error into an `ExceptionGroup`, and the `except* ValueError` clause handles it cleanly. Execution continues normally after the handler.

## Why This Matters

Without structured error handling, a failed agent leaves siblings running as zombies, leaking resources and producing stale results. `TaskGroup` + `ExceptionGroup` gives you deterministic cleanup: every task is either completed or cancelled when the block exits. No orphans, no leaks, no ambiguity.

This matters enormously for production systems. Leaked tasks consume memory, hold open connections, and can produce results that arrive after the caller has moved on. In a multi-agent LLM pipeline, a zombie agent might continue generating tokens that are never read, wasting API credits and compute.

The `except*` syntax is Python's answer to a fundamental problem: when you run things concurrently, you need a way to handle multiple simultaneous failures. Traditional try/except handles one exception at a time. `except*` lets you pattern-match against a collection of exceptions, handling each type differently within the same handler block.

## When to Use This Pattern

- Multi-agent orchestration where one failure should stop all agents immediately
- Microservice fan-out calls where partial results are meaningless without the full set
- Parallel data processing with partial failure handling and deterministic cleanup
- Any structured concurrency scenario where tasks should succeed or fail as a group
- Pipeline stages where downstream stages depend on all upstream stages completing
- Validation checks that run concurrently and must all pass for the operation to proceed

## What Just Happened

Three agents started concurrently inside the `TaskGroup`. After 1 second, the coder agent raised `ValueError`. The `TaskGroup` immediately cancelled researcher and reviewer — they never printed "done." The cancellation was automatic and deterministic.

The `except* ValueError` clause caught the specific error from the `ExceptionGroup`. This is different from `except ExceptionGroup` — the `except*` syntax matches types inside the group, not the group itself. Only the `ValueError` was handled; if there had been a `TypeError` too, it would have propagated.

Execution continued normally after the handler. The `TaskGroup` guaranteed that all three tasks were either completed or cancelled before the `async with` block exited. No tasks were left running in the background.

## Keep in Mind

- `except*` matches types INSIDE the group, not the `ExceptionGroup` itself
- Multiple `except*` clauses can handle different exception types from the same group
- `SystemExit` and `KeyboardInterrupt` are NOT wrapped in the group — they propagate directly
- All tasks are guaranteed completed or cancelled when `async with` exits the `TaskGroup`
- The `ExceptionGroup` preserves full tracebacks for every exception in the group
- You can nest `TaskGroup` blocks for hierarchical error handling across task subtrees

## Common Pitfalls

- Using `except ExceptionGroup` when you mean `except*` for matching inner exception types
- Assuming task completion order matters for error handling — cancellation is non-deterministic
- Re-raising inside `except*` without understanding that it creates a new `ExceptionGroup`
- Not logging information about cancelled tasks, losing visibility into what was in progress
- Using `TaskGroup` when partial success is acceptable — use `gather(return_exceptions=True)` instead
- Catching too broadly with `except* Exception`, which swallows errors you should propagate

## Where to Incorporate This

- Multi-agent LLM pipelines where critical agent failure should stop all agents
- Parallel API calls to multiple services with graceful degradation on failure
- Batch processing with error isolation where one bad batch should not poison others
- Microservice orchestration with rollback on failure of any dependent service
- Data validation pipelines where one invalid record should halt processing
- Concurrent test execution where infrastructure failure should abort remaining tests
- Financial transaction processing where partial completion is worse than total failure

## Related Patterns

- `gather(return_exceptions=True)` for non-cancelling error collection (animation 7)
- Cancellation and shield for protecting critical operations from cancellation (animation 8)
- Graceful shutdown for cleanup during cancellation of long-running services (animation 17)
- `TaskGroup` scheduling patterns for structured task lifecycle management (animation 7)
- Retry with backoff for recovering from transient errors before giving up (animation 18)
