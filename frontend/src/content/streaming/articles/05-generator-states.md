## The Concept

A generator is a **state machine** with exactly four states: **CREATED**, **RUNNING**, **PAUSED**, and **DONE**. Every generator object occupies one of these states at every moment of its existence, and the transitions between them are deterministic and irreversible in one direction. You can inspect the current state at runtime with `inspect.getgeneratorstate(gen)`, which returns one of `GEN_CREATED`, `GEN_RUNNING`, `GEN_SUSPENDED`, or `GEN_CLOSED`.

This model was formalized in **PEP 255** and extended by **PEP 342**, which added `send()`, `throw()`, and `close()` as explicit state-transition triggers. The state maps directly to the generator's frame object: in CREATED, `gi_frame` exists but `f_lasti` is -1 — no instruction has executed. In PAUSED, `gi_frame` exists and `f_lasti` points to the last `yield` bytecode offset. In RUNNING, the frame is on the call stack. In DONE, `gi_frame` is `None` — the frame has been deallocated and all locals destroyed.

This same state machine underlies asyncio coroutines. When you `await` a coroutine, it transitions from RUNNING to PAUSED at the suspension point. When the event loop resumes it, it transitions back to RUNNING. The event loop is a scheduler managing thousands of coroutines through these four states. Understanding generator states is understanding the scheduling model of modern async Python.

## Introduction

This animation visualizes the four states of a generator's lifecycle. A generator object is created (**CREATED**), advanced with `next()` into execution (**RUNNING**), suspended at a `yield` point (**PAUSED**), advanced again (**RUNNING**), suspended again (**PAUSED**), and finally exhausted when the function body ends (**DONE**). The transitions form a one-directional sequence: CREATED → RUNNING → PAUSED → RUNNING → PAUSED → ... → DONE. A generator that reaches DONE can never return to any earlier state.

The animation traces a generator that yields two values. You see the state badge update at each transition: CREATED when the generator is first assigned, RUNNING when `next()` pushes execution forward, PAUSED when `yield` freezes the frame, and DONE when `StopIteration` signals exhaustion. Each state has distinct properties governing what operations are legal on the generator object.

## Why This Matters

Knowing a generator's state answers the three most common debugging questions. "Why is nothing happening?" — the generator is in **CREATED** state; no one has called `next()` yet. "Why did it raise `StopIteration`?" — it is in **DONE** state; it has been fully exhausted. "Why is it holding resources open?" — it is in **PAUSED** state; its frame is alive on the heap, and any open file handles, database connections, or locks inside that frame are still active.

The state machine also governs what operations are legal. Calling `send(value)` on a CREATED generator — before the first `next()` — raises `TypeError` because there is no `yield` expression to receive the value. Calling `next()` on a DONE generator raises `StopIteration`. Calling `throw()` on a PAUSED generator injects an exception at the yield point. Calling `close()` on any non-DONE generator throws `GeneratorExit` into the frame and transitions it to DONE. Attempting `next()` on a RUNNING generator from within that generator's own execution raises `ValueError: generator already executing` — re-entrancy is forbidden.

In production systems, generators in PAUSED state are the ones that hold resources. A generator paused inside a `with open(file)` block keeps that file handle open. A generator paused while holding a SQLAlchemy session keeps that connection checked out from the pool. Understanding that PAUSED means "alive and holding state" is the key to preventing resource leaks in long-lived applications.

## What Just Happened

The animation walked through every legal state transition. The generator started in **CREATED** state when `gen = simple()` assigned the generator object. No code inside `simple()` had executed — not even the first line. The frame existed but was pre-execution, with `gi_frame.f_lasti` set to -1.

The first `next(gen)` transitioned the generator to **RUNNING**. The interpreter pushed the generator's frame onto the call stack and began executing bytecodes from the top of the function body. When execution reached the first `yield`, the frame was popped off the call stack and stored on the generator object. The state transitioned to **PAUSED**. The yielded value was returned to the caller.

The second `next(gen)` repeated the cycle: PAUSED → RUNNING (frame pushed, execution resumes from the yield point) → PAUSED (next yield reached, frame saved). This **RUNNING ↔ PAUSED oscillation** is the heartbeat of every generator — and every asyncio coroutine.

The third `next(gen)` transitioned to RUNNING, but this time the function body ended without hitting another `yield`. Python raised `StopIteration`, and the generator transitioned to **DONE**. The frame was deallocated (`gi_frame` became `None`), all local variables were destroyed, and no further transitions were possible. The generator was permanently exhausted.

## When to Use

- Debugging generator-based pipelines where values are not being produced as expected
- Managing resource lifecycles in generators that hold file handles, connections, or locks across yield points
- Implementing coroutine schedulers that need to track which generators are ready to run versus waiting
- Building monitoring and introspection tools that report on generator pipeline health using `inspect.getgeneratorstate()`
- Designing cleanup logic that behaves differently based on whether a generator was partially consumed (PAUSED) or fully exhausted (DONE)
- Writing unit tests that assert generator state at each step to verify lifecycle correctness

## When to Avoid

- When writing simple generators consumed by a `for` loop — the state machine is handled automatically and you do not need to inspect it
- When the generator produces a short finite sequence with no resource management concerns
- When you are not debugging and the generator is behaving correctly — state inspection is a diagnostic tool, not a runtime necessity
- When using generator expressions that are created and consumed in a single expression and rarely need state tracking
- When the added complexity of state-aware code outweighs its diagnostic value for your team
- When running on alternative Python implementations where `gi_frame` internals may differ from CPython

## In Production

**Pytest fixtures** that use `yield` are generators managed by pytest's fixture system. Pytest calls `next()` to get the fixture value — transitioning the generator to PAUSED after yield — runs the test, then calls `next()` again to trigger teardown code after the yield, transitioning to DONE. The fixture's state determines whether setup or teardown is the next legal operation. If a test crashes before teardown, pytest calls `close()` on the PAUSED generator to ensure cleanup runs, using `GeneratorExit` to trigger `finally` blocks inside the fixture.

**Asyncio's event loop** maintains collections of coroutines — which are generator-based — in various states. The `_ready` deque holds coroutines ready to resume. The `_scheduled` heap holds coroutines waiting on timers. The selector manages coroutines waiting on I/O. The loop's job is to transition coroutines from PAUSED to RUNNING by calling `send(None)` — the exact same operation as `next()`. The entire event loop is a state-machine scheduler, and the four generator states are the scheduling primitives it operates on.

**Celery** and **Dramatiq** task workers use generator-based middleware pipelines where each middleware generator's state determines whether the task is still being processed (RUNNING), waiting for the next pipeline stage (PAUSED), or completed (DONE). Middleware that yields passes control to the next layer. Its PAUSED state guarantees that cleanup code after the yield will run when control returns — the framework calls `next()` or `close()` depending on whether the task succeeded or failed.

**SQLAlchemy's** `Session.execute()` returns result objects that internally track cursor state analogous to generator states. A fresh result is "created" but unfetched. Iterating fetches rows (running/paused cycle). Calling `result.close()` transitions to done and releases the database cursor back to the connection pool. Forgetting to close — leaving the result in its "paused" equivalent — holds the cursor open, starving the pool. This is the same resource-leak pattern that generators exhibit when stuck in PAUSED state with open resources.
