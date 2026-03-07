## Introduction

Generators are not just output-only. The `send()` method allows the caller to inject values INTO a running generator. When you write `value = yield output`, the generator yields `output` to the caller and receives whatever the caller `send()`s back as `value`. This creates a bidirectional communication channel.

This animation shows an accumulator generator that receives values via `send()`. Each `send(n)` injects `n` into the generator, which adds it to a running total and yields the new total back. The generator maintains state while the caller controls what to accumulate.

## Why This Matters

`send()` enables coroutine-style programming. The generator becomes a stateful computation that responds to inputs. This pattern predates and inspired Python's async/await syntax. Understanding `send()` helps you understand how async works under the hood.

Practical uses include pipeline stages that need configuration mid-stream, generators that adapt based on feedback, and implementing simple state machines where the caller drives transitions.

The pattern inverts traditional control flow. Instead of the caller calling multiple functions, one generator handles multiple interactions. State lives in one place (the generator), making reasoning about correctness easier.

## When to Use This Pattern

- Building coroutines that respond to caller input
- Implementing state machines with caller-driven transitions
- Creating accumulators or reducers that process a stream of inputs
- Pipeline stages that need runtime configuration
- Generators that adapt behavior based on previous results
- Pre-async cooperative multitasking patterns

## What Just Happened

The accumulator generator was created and "primed" with `next(gen)`. Priming advances to the first yield, making the generator ready to receive `send()` values. The initial yield returned `total = 0`.

Each `gen.send(n)` injected `n` as the value of the `yield` expression. The generator added `n` to `total` and looped back to yield the new total. The caller received each updated total as the return value of `send()`.

Finally, `send(None)` triggered the `if value is None: break` condition, terminating the generator cleanly. This is a common pattern for signaling "end of input."

## Keep in Mind

- Generators must be "primed" with `next()` before the first `send(value)`
- `send(None)` is equivalent to `next()` for advancing the generator
- The sent value becomes the result of the `yield` expression inside the generator
- The generator yields a value OUT and receives a value IN at the same `yield`
- You cannot `send()` to a just-created generator (it has not reached a yield yet)
- `StopIteration` is raised if you `send()` to an exhausted generator

## Common Pitfalls

- Forgetting to prime the generator before `send()`ing a non-None value
- Confusing which direction data flows (yield OUT, send IN)
- Not handling the case where `send()` causes the generator to exhaust
- Overcomplicating simple pipelines that do not need two-way communication
- Using `send()` when simple iteration would be clearer

## Where to Incorporate This

- Implementing reducers (fold/accumulate operations)
- State machines where the caller provides input for each transition
- Coroutine-based async patterns (historical, pre-asyncio)
- Interactive generators that adapt to feedback
- Pipeline stages with side-channel control inputs
- Testing generators by injecting controlled values

## Related Patterns

- `throw()` and `close()` (animation 10) show other ways to interact with generators
- Async generators (animation 19) have analogous asend() method
- Generator states (animation 3) explains when send() is valid
- Error handling (animation 18) shows handling errors with injection
