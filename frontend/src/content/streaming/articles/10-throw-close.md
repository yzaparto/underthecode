## Introduction

Generators can be externally controlled through `throw()` and `close()`. `throw(exception)` injects an exception at the current yield point, allowing the generator to catch and handle it. `close()` raises `GeneratorExit` inside the generator, triggering cleanup code in finally blocks. These methods provide graceful error injection and termination.

This animation shows a resilient generator with try/except/finally. We inject a `ValueError` with `throw()`, which the generator catches and recovers from. Then we call `close()`, triggering the finally block for cleanup.

## Why This Matters

Resource management requires cleanup. When a generator holds resources (files, connections, locks), you need a way to release them even if iteration ends early. `close()` triggers finally blocks, ensuring cleanup runs. This is essential for correct resource handling.

`throw()` enables sophisticated error handling patterns. The caller can signal exceptional conditions to the generator, which can handle them in context. This is useful for cancellation, timeouts, or recoverable errors where the generator has information the caller lacks.

Understanding these methods is crucial for async programming, where cancellation via exception injection is a core pattern.

## When to Use This Pattern

- Generators that manage resources needing cleanup
- Implementing cancellation or timeout mechanisms
- Error recovery where the generator can handle exceptions in context
- Ensuring cleanup runs even when iteration is interrupted
- Testing generator error handling paths
- Building robust pipelines that handle partial failures

## What Just Happened

The generator yielded values normally at first. Then `gen.throw(ValueError("Invalid!"))` injected an exception at the yield point. The except block caught it, logged the error, and yielded a recovery value (-1).

`gen.close()` raised `GeneratorExit` inside the generator. This special exception triggers finally blocks but does not need to be caught. "Cleanup executed!" printed, demonstrating that cleanup runs regardless of how the generator ends.

The generator entered `GEN_CLOSED` state and could not produce more values.

## Keep in Mind

- `throw()` injects an exception AT the current yield point
- The generator can catch thrown exceptions and continue or recover
- `close()` raises `GeneratorExit`, which triggers finally blocks
- `GeneratorExit` should not be caught (or if caught, re-raised)
- Finally blocks run whether the generator exhausts normally, throws, or closes
- A closed generator raises `StopIteration` on any subsequent `next()` call

## Common Pitfalls

- Catching `GeneratorExit` and not re-raising it (breaks close semantics)
- Forgetting that `throw()` might cause the generator to raise (if not caught)
- Not using try/finally for resource cleanup in generators
- Assuming close() is only needed at the end (call it to release resources early)
- Not testing error paths in generators (they are often forgotten)

## Where to Incorporate This

- File-processing generators that need to close handles
- Database cursor generators that need to release connections
- Network streaming generators that need to close sockets
- Generators that acquire locks and must release them
- Pipeline stages that need graceful cancellation
- Any generator with resources in finally blocks

## Related Patterns

- `@contextmanager` (animation 13) uses this pattern for context managers
- Error handling (animation 18) shows broader error recovery patterns
- `send()` method (animation 9) shows another form of generator interaction
- Async generators (animation 19) have athrow() and aclose() methods
