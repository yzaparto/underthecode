## Introduction

Every generator exists in one of four states: `GEN_CREATED`, `GEN_RUNNING`, `GEN_SUSPENDED`, or `GEN_CLOSED`. Understanding these states clarifies what happens at each point in a generator's lifecycle. The `inspect` module lets you observe these states directly.

This animation creates a simple generator and tracks its state through all four phases. You will see exactly when each transition happens: creation → first `next()` → running → yield → suspended → exhaustion → closed.

## Why This Matters

Debugging generators requires understanding their state model. When a generator is not producing values as expected, knowing whether it is suspended (waiting for `next()`) or closed (exhausted) determines your fix. State awareness prevents common bugs like trying to resume a closed generator.

The state model also explains why certain operations fail. You cannot `send()` a non-None value to a generator in `GEN_CREATED` state — it has not advanced to a yield point yet. You cannot get values from a `GEN_CLOSED` generator — it will always raise `StopIteration`.

For async code, understanding generator states is essential. The event loop schedules coroutines based on their state. A suspended coroutine is waiting for I/O; a running one is executing. The same mental model applies.

## When to Use This Pattern

- Debugging generators that are not behaving as expected
- Implementing custom generator management or scheduling
- Building tools that introspect generator state
- Understanding when `send()` and `throw()` are valid
- Writing tests that verify generator behavior
- Learning how async/await works under the hood

## What Just Happened

The generator started in `GEN_CREATED` state — created but never started. No code inside the generator had executed yet.

The first `next()` transitioned it through `GEN_RUNNING` (briefly, while executing) to `GEN_SUSPENDED` (paused at the first yield). You can only observe `GEN_RUNNING` from inside the generator itself.

After exhausting all yields, the final `next()` caused the generator to fall through its function body. `StopIteration` was raised, and the generator entered `GEN_CLOSED` state permanently.

## Keep in Mind

- `GEN_CREATED`: Never started, waiting for first `next()`
- `GEN_RUNNING`: Currently executing inside the generator (rare to observe)
- `GEN_SUSPENDED`: Paused at a yield, waiting for next `next()` or `send()`
- `GEN_CLOSED`: Exhausted or explicitly closed, cannot produce more values
- `inspect.getgeneratorstate(gen)` returns the current state as a string
- Transitions are: CREATED → RUNNING ↔ SUSPENDED → CLOSED

## Common Pitfalls

- Calling `send(value)` on a `GEN_CREATED` generator (must prime with `next()` first)
- Expecting values from a `GEN_CLOSED` generator (always raises `StopIteration`)
- Not realizing that `close()` transitions to `GEN_CLOSED` even if not exhausted
- Trying to observe `GEN_RUNNING` from outside (only visible from within)
- Confusing `GEN_SUSPENDED` with "paused forever" — it is waiting for the next pull

## Where to Incorporate This

- Generator debugging and introspection tools
- Custom schedulers that manage multiple generators
- Testing frameworks that verify generator behavior
- Educational tools demonstrating generator mechanics
- Advanced coroutine management code
- Framework code that needs to handle generators generically

## Related Patterns

- Generator basics (animation 2) shows normal yield/next flow
- `throw()` and `close()` (animation 10) shows explicit state transitions
- `send()` method (animation 9) shows how to interact with suspended generators
- Async generators (animation 19) have analogous states
