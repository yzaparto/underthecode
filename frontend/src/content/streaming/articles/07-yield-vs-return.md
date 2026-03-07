## Introduction

`return` and `yield` both produce values, but their execution semantics are opposite. `return` exits the function permanently — the function is done. `yield` pauses the function temporarily — it will resume on the next iteration. This fundamental difference determines whether you get one value or a stream.

This animation demonstrates both behaviors side by side. `with_return()` executes until return and exits. `with_yield()` executes until yield, pauses, and can resume multiple times. Code after `return` never runs; code after `yield` runs on the next `next()`.

## Why This Matters

Choosing between return and yield determines your function's nature. Return produces a value; yield produces a sequence. This choice affects how callers use your function, how memory is managed, and whether early termination is possible.

The execution model difference is profound. A returning function runs to completion atomically. A yielding function is a state machine that advances incrementally. Understanding this helps you design APIs that give callers appropriate control.

Many algorithms naturally produce sequences: traversals, searches, transformations. Using yield makes the streaming nature explicit and enables callers to consume results incrementally.

## When to Use This Pattern

- Use `return` for functions that compute a single result
- Use `yield` for functions that produce a sequence of results
- Use `yield` when callers might not need all results
- Use `yield` when producing all results at once is expensive
- Use `return` when you need to exit early with a value
- Use `yield` when you want to interleave production and consumption

## What Just Happened

`with_return()` printed "Before return", then executed `return 1`, exiting the function immediately. "After return" is dead code — it can never execute. The function is complete; the returned value is all you get.

`with_yield()` behaved differently. The first `next()` ran code until `yield 1`, printed "Before first yield", then paused. The second `next()` resumed, printed "Between yields", and paused at `yield 2`. The third `next()` printed "After last yield" and exhausted the generator.

The key: `return` is a one-way exit, `yield` is a two-way pause point.

## Keep in Mind

- `return` in a generator still creates `StopIteration`, ending iteration
- `return value` in a generator sets `StopIteration.value` (advanced usage)
- Code after `yield` executes on the NEXT `next()` call, not the current one
- Multiple yields create multiple pause points in sequence
- You can mix `yield` and `return` (return ends the generator early)
- `yield` expressions can also receive values via `send()` (two-way)

## Common Pitfalls

- Expecting code after return to execute (it never will)
- Forgetting that yield pauses AT the yield, not after it
- Not realizing that return in a generator ends it (raises StopIteration)
- Using return where yield is appropriate, losing streaming benefits
- Thinking yield is just "return but continue" (state preservation is key)

## Where to Incorporate This

- Refactoring list-building functions to generators
- Implementing streaming APIs where consumers control pace
- Building pipelines where each stage yields to the next
- Converting batch operations to incremental ones
- Implementing lazy property patterns
- Creating state machines with yield as state transitions

## Related Patterns

- Generator basics (animation 2) introduces yield mechanics
- Generator states (animation 3) shows what happens at each pause
- `send()` method (animation 9) shows yield receiving values
- Error handling (animation 18) shows how exceptions interact with yield
