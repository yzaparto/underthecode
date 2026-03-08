## The Concept

**PEP 654** introduced `ExceptionGroup` and the `except*` syntax in Python 3.11, directly inspired by **Trio's structured concurrency** model. The core insight is that concurrent code can produce **multiple simultaneous failures**, and traditional `try/except` only handles one exception at a time. An `ExceptionGroup` is a container that holds multiple exceptions from concurrent tasks. `except*` pattern-matches against the types inside the group — catching `ValueError` while letting `TypeError` propagate untouched. This completes Python's structured concurrency story: `TaskGroup` manages task lifecycles, `ExceptionGroup` collects their failures, and `except*` gives you surgical control over which failures to handle. The design mirrors Trio's nursery model, where a scope owns its child tasks and is responsible for all their outcomes.

## Introduction

In a multi-agent system, what happens when one agent crashes? With `TaskGroup`, if any task raises an exception, all sibling tasks are **automatically cancelled**. The errors are collected into an `ExceptionGroup`. The animation shows three agents starting concurrently inside a `TaskGroup`. After 1 second, the coder agent raises `ValueError`. The `TaskGroup` cancels the other two agents, collects the error, and the `except* ValueError` clause handles it cleanly. Execution continues normally after the handler.

## Why This Matters

Without structured error handling, a failed task leaves siblings running as **zombies** — leaking memory, holding connections, producing stale results nobody reads. In a multi-agent LLM pipeline, a zombie agent continues generating tokens that are never consumed, wasting API credits. `TaskGroup` + `ExceptionGroup` gives you deterministic cleanup: every task is either completed or cancelled when the block exits.

The `except*` syntax solves a problem that was previously impossible in Python. When `gather(return_exceptions=True)` collects errors, you get a flat list and must manually iterate to find and handle each type. With `except*`, you write handlers that look like normal exception handling but operate on collections. Multiple `except*` clauses can each handle different types from the same group. Unhandled types propagate automatically in a new `ExceptionGroup`. This is pattern matching for concurrent errors.

The guarantees are strong. `SystemExit` and `KeyboardInterrupt` are never wrapped — they propagate directly. All tasks are guaranteed finished (completed or cancelled) before the `async with` block exits. Full tracebacks are preserved for every exception in the group. You can nest `TaskGroup` blocks for hierarchical error handling across task subtrees.

## What Just Happened

Three agents started concurrently inside the `TaskGroup`. After 1 second, the coder agent raised `ValueError`. The `TaskGroup` immediately cancelled researcher and reviewer — they never printed "done." The `except* ValueError` clause caught the specific error from inside the `ExceptionGroup`. This is different from `except ExceptionGroup` — `except*` matches types **inside** the group. If there had been a `TypeError` too, it would have propagated in a separate `ExceptionGroup`. Execution continued normally after the handler, with all tasks guaranteed finished.

## When to Use

- Multi-agent orchestration where one agent failure should cancel and clean up all siblings
- Microservice fan-out where partial results are meaningless without the complete set
- Parallel validation checks that must all pass before an operation proceeds
- Pipeline stages where downstream depends on all upstream completing successfully
- Financial transaction processing where partial completion is worse than total rollback
- Batch API calls where you need to distinguish transient errors from permanent failures
- Test infrastructure where environment failure should abort all remaining test cases

## When to Avoid

- When partial success is acceptable — use `gather(return_exceptions=True)` and handle individually
- Simple sequential error handling where standard `try/except` is sufficient
- When you need to continue despite failures — `TaskGroup` cancels all siblings on first error
- Python versions before 3.11 where `ExceptionGroup` and `except*` do not exist
- When error types are not distinguishable — `except*` is most useful with typed exception hierarchies
- Single-task scenarios where there is no concurrency to structure
- When you want best-effort results from as many tasks as possible, not all-or-nothing

## In Production

**FastAPI** with background task groups uses `TaskGroup` to manage concurrent request processing. When a request handler spawns multiple sub-tasks — fetching from a cache, querying a database, calling an LLM — a `TaskGroup` ensures all are cancelled if any fails. Without this, a failed database query leaves the LLM call running and its result is discarded. In practice, FastAPI middleware wraps request handling in a `TaskGroup` scope, and Starlette's `anyio` backend propagates cancellation through the task tree.

**Kubernetes operators** written with `kopf` (Kubernetes Operator Pythonic Framework) use structured concurrency internally. When an operator reconciles a resource, it may spawn concurrent tasks to update multiple dependent resources. If any update fails, the operator must cancel in-progress updates and report a coherent error status. `TaskGroup` provides exactly this guarantee — all updates succeed or all are rolled back, with the `ExceptionGroup` containing every failure for the status report.

**Anthropic's SDK** uses structured error handling internally for streaming connections. When a `MessageStream` encounters a connection error mid-stream, it must cancel any pending response parsing and clean up the HTTP connection. The SDK wraps its internal tasks in structured scopes so that a network error during streaming does not leave orphaned parsing coroutines consuming CPU. The resulting exception preserves the original network error plus any cleanup failures in an `ExceptionGroup`.

**Celery** canvas workflows (chains, groups, chords) face the same multi-task error problem at the distributed level. When a `group` of tasks runs in parallel and one fails, Celery must decide whether to cancel siblings or let them complete. The `link_error` callback receives the equivalent of an `ExceptionGroup` — all failures from the group. Modern Celery patterns map directly to `TaskGroup` semantics: the chord callback only fires if all group tasks succeed, mirroring the all-or-nothing guarantee.
