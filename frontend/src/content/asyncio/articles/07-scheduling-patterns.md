## Introduction

Four ways to schedule concurrent tasks, all achieving the same wall-clock time but with fundamentally different trade-offs. Manual `create_task` plus individual `await` gives fine-grained lifecycle control. `gather(*coroutines)` is a clean one-liner that creates tasks internally. `gather(*tasks)` gives you task handles for cancellation and inspection. `TaskGroup` (Python 3.11+) enforces structured concurrency with automatic cancellation on failure.

This animation runs the same pair of coroutines through all four patterns. Each produces the same 2-second total time, proving that concurrency behavior is identical. The differences surface only when you need to cancel tasks, handle errors, or inspect intermediate state.

## Why This Matters

Developers who only know `gather()` struggle when they need to cancel individual tasks mid-flight or handle partial failures without losing completed results. Developers who only know `create_task` write verbose boilerplate when a one-liner would suffice. Knowing all four patterns lets you match the scheduling API to the error-handling requirements of each call site.

`gather()` has dangerous default behavior: without `return_exceptions=True`, if one task raises, the exception propagates and the remaining tasks keep running as orphans. You get an exception in your code but leaked coroutines consuming resources in the background. `TaskGroup` takes the opposite stance — one failure cancels all siblings immediately and raises an `ExceptionGroup`. This fail-fast model prevents silent corruption but surprises teams that expect partial success.

Choosing wrong means either **silent bugs** (gather swallowing failures) or **unexpected cancellations** (TaskGroup aborting work you wanted to keep). The scheduling pattern is an error-handling decision disguised as a concurrency API.

## What Just Happened

All four patterns produced identical 2-second wall-clock time. Two coroutines sleeping for different durations ran concurrently under every pattern, proving the scheduling behavior is the same regardless of API choice.

`gather()` returned results in **input order** — the first coroutine's result is always at index 0 regardless of which finished first. The manual `create_task` approach required explicit `await` for each task but allowed inspecting `task.done()`, calling `task.cancel()`, or attaching `add_done_callback()` between creation and awaiting. `TaskGroup` guaranteed that when the `async with` block exited, every task was either completed or cancelled — no orphaned coroutines possible.

The ergonomic difference is real: `gather()` needed 1 line, manual `create_task` needed 4+, and `TaskGroup` needed an `async with` block with explicit `create_task` calls on the group. `TaskGroup` does not return results directly like `gather()` — you store results via task references or shared mutable state.

## When to Use

- Manual `create_task` when you need to cancel, inspect, or add callbacks to individual tasks during execution
- `gather(*coroutines)` for simple fan-out where you need all results returned in input order with minimal boilerplate
- `gather(*tasks)` when you want both concurrency and the ability to cancel specific tasks by reference
- `gather(return_exceptions=True)` when partial success is acceptable and you want to inspect each result individually
- `TaskGroup` (Python 3.11+) when any failure should cancel all sibling tasks immediately with no orphan risk
- `TaskGroup` when you need guaranteed cleanup — every task completes or is cancelled when the block exits

## When to Avoid

- Using `gather()` without `return_exceptions=True` when task failures need to be observed — exceptions are silently swallowed for non-failing tasks while orphans run
- Using `TaskGroup` when partial results are valuable — one failure cancels everything including successfully-running siblings
- Mixing scheduling patterns in the same function, making concurrency and error semantics impossible to reason about
- Using manual `create_task` for simple parallel calls where `gather()` is clearer and less error-prone
- `TaskGroup` on Python < 3.11 where it does not exist — fall back to `gather()` or the `anyio` backport
- Relying on `gather()` result ordering when you actually need completion-order processing — use `as_completed()` instead
- Using `TaskGroup` without understanding `ExceptionGroup` and `except*` syntax, causing unhandled exception groups to crash the application

## In Production

**FastAPI** dependency injection resolves independent dependencies concurrently using `gather()`. When a route handler declares multiple `Depends()` parameters with no inter-dependency, Starlette's dependency solver groups them and runs them in parallel via `asyncio.gather()`. This is why adding a second independent database query to a FastAPI endpoint does not double the response time — both queries execute concurrently and results are collected in declaration order. Teams that understand this can restructure slow endpoints by breaking serial dependency chains into parallel-eligible groups.

**LangChain** uses `gather()` extensively in its `RunnableParallel` primitive. When you define a chain like `RunnableParallel(summary=summarize_chain, sentiment=sentiment_chain)`, LangChain schedules both sub-chains concurrently with `gather()` and collects results into a dict. The `return_exceptions=True` flag is not set by default, which means one failing sub-chain crashes the entire parallel step — a known pain point that drives teams toward custom `TaskGroup`-based orchestrators for fault-tolerant multi-agent pipelines.

**Anthropic's SDK** and **OpenAI's SDK** both recommend `gather()` for parallel API calls in their async documentation. The pattern `results = await asyncio.gather(client.messages.create(...), client.messages.create(...))` is idiomatic for comparing multiple model responses or running prompt variants concurrently. Production teams wrap this in `gather(return_exceptions=True)` to handle per-call rate limiting gracefully — a 429 on one call should not abort the others.

**Kubernetes operators** written with `kopf` (Kubernetes Operator Pythonic Framework) use `TaskGroup` for reconciliation loops where one sub-resource failure should abort the entire reconciliation cycle. If creating a ConfigMap succeeds but creating the associated Deployment fails, the operator needs to roll back — `TaskGroup`'s automatic sibling cancellation prevents the operator from leaving the cluster in a half-configured state. The `ExceptionGroup` propagation lets the operator log exactly which sub-resources failed and which were cancelled.
