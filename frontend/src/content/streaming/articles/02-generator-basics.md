## Introduction

A generator is a function that can pause and resume execution. The `yield` keyword is what makes this possible. When Python encounters `yield`, it suspends the function, saves its entire state, and returns the yielded value to the caller. The next time the caller requests a value, execution resumes exactly where it left off.

This animation shows a simple `count_up_to(n)` generator. Each `next()` call advances execution to the next `yield`, prints messages along the way, and returns the yielded value. The generator remembers its position, local variables, and execution state between calls.

## Why This Matters

Generators solve the fundamental problem of producing a sequence without building it all at once. Without generators, you would need to either build complete lists (memory-intensive) or manually track state between calls (complex and error-prone). Generators give you both memory efficiency and clean code.

The pause-resume mechanism is what enables streaming. A generator can yield one database row, one file line, or one API response at a time. The caller processes each item immediately. Memory usage stays constant regardless of how many items the generator can produce.

Understanding generators is prerequisite to understanding Python's async/await. Async functions are built on the same pause-resume mechanism. The event loop is essentially calling `next()` on coroutines, which are special generators. Master generators first, and async becomes intuitive.

## When to Use This Pattern

- Any function that would return a list but could yield items instead
- Processing items one at a time in a pipeline
- Implementing custom iterators without writing a class
- Producing values that depend on expensive computation
- Creating sequences where each item depends on the previous one
- Replacing callbacks with a pull-based iteration model

## What Just Happened

The generator function was defined but not executed. Calling `count_up_to(3)` created a generator object — the function body had not run yet. "Generator started" had not printed.

The first `next(gen)` call started execution from the beginning. Code ran until the first `yield`, printing "Generator started" and "About to yield 1". The generator paused AT the yield, returned 1, and saved its state.

The second `next(gen)` resumed execution AFTER the previous yield. "Resumed after yielding 1" printed, then the loop continued. The generator paused at `yield 2`. Each subsequent `next()` followed the same pattern.

## Keep in Mind

- Calling a generator function does not execute it — it returns a generator object
- Execution starts on the first `next()` call, not at creation
- `yield` pauses execution and returns a value; `next()` resumes execution
- Local variables are preserved between yields — the generator remembers everything
- When the function ends (falls through or returns), `StopIteration` is raised
- `return value` in a generator sets `StopIteration.value` (rarely used directly)

## Common Pitfalls

- Expecting the generator body to run when you call the function
- Forgetting that `yield` both sends a value OUT and receives resumption IN
- Not handling `StopIteration` when manually calling `next()` outside a `for` loop
- Trying to restart a generator — you must create a new one instead
- Confusing generator functions (defined with `yield`) with generator objects (created by calling them)

## Where to Incorporate This

- Custom iterators for domain objects (yielding orders, events, records)
- Data transformation pipelines with multiple stages
- Lazy computation of expensive values
- Pagination implementations that fetch pages on demand
- State machines where each yield represents a state transition
- Cooperative multitasking in pre-asyncio code

## Related Patterns

- Generator state machine (animation 3) shows the four possible states
- `yield` vs `return` (animation 7) clarifies the execution flow difference
- `send()` method (animation 9) enables two-way communication
- Async generators (animation 19) extend this to async/await
