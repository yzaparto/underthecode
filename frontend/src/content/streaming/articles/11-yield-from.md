## Introduction

`yield from` delegates to another iterator, passing through all its values as if the outer generator yielded them directly. It is more than syntactic sugar for a loop — it handles `send()`, `throw()`, and `close()` properly, and captures the sub-generator's return value. This makes generator composition seamless.

This animation shows `yield from inner()` delegating to a sub-generator. Values from inner pass through to the caller transparently. When inner returns, its return value becomes the value of the `yield from` expression in outer.

## Why This Matters

Without `yield from`, composing generators requires manual iteration and careful handling of send/throw/close. `yield from` handles all of this automatically. It is the foundation for writing generators that delegate to other generators without boilerplate.

The return value capture is particularly powerful. Sub-generators can return final results that the parent generator uses. This enables patterns where you "run" a sub-generator to completion and use its result.

For async code, `yield from` was the original way to await coroutines before `await` existed. Understanding it explains async's heritage and helps debug older async code.

## When to Use This Pattern

- Composing multiple generators into one
- Flattening nested iteration without explicit loops
- Delegating to a sub-generator that might use send/throw/close
- Capturing the return value of a sub-generator
- Refactoring complex generators into smaller, reusable pieces
- Implementing recursive generators (like tree traversals)

## What Just Happened

The outer generator hit `yield from inner()`. This created the inner generator and delegated to it completely. The caller's `next()` calls went directly to inner — outer was just passing through.

Inner yielded "a" and "b", which the caller received as if outer had yielded them. When inner executed `return "inner done"`, it raised `StopIteration("inner done")`. `yield from` caught this and assigned the value to `result`.

The outer generator then printed the result and continued with its own yield of "c". The delegation was complete.

## Keep in Mind

- `yield from iterable` yields all values from iterable
- For generators, it also forwards `send()`, `throw()`, and `close()`
- The sub-generator's return value becomes the `yield from` expression's value
- The outer generator is suspended while delegation is active
- `yield from` works with any iterable, not just generators
- It is equivalent to a loop only for simple cases (no send/throw/close)

## Common Pitfalls

- Using a manual loop when `yield from` would handle edge cases correctly
- Forgetting that `yield from` can capture return values from sub-generators
- Not realizing that `send()` and `throw()` pass through to the sub-generator
- Using `yield from` on a non-iterable (raises TypeError)
- Confusing `yield from gen()` (delegate) with `yield gen()` (yield the generator object)

## Where to Incorporate This

- Recursive generators for tree or graph traversal
- Composing pipeline stages that are themselves generators
- Refactoring large generators into smaller, tested pieces
- Implementing generators that conditionally delegate to sub-generators
- Building generator libraries with reusable components
- Legacy async code using `yield from` for coroutine awaiting

## Related Patterns

- Chaining generators (animation 12) shows sequential composition
- Generator basics (animation 2) covers simple yield
- Async generators (animation 19) uses similar delegation patterns
- `send()` method (animation 9) shows what gets forwarded through
