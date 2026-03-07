## Introduction

The iterator protocol is Python's contract for sequential traversal. Any object implementing `__iter__()` and `__next__()` is an iterator. `__iter__()` returns the iterator (often self), and `__next__()` returns the next value or raises `StopIteration`. This protocol is what `for` loops, comprehensions, and many built-ins depend on.

This animation shows a manual `CountDown` iterator class. Unlike a generator (which provides the protocol automatically), this class explicitly implements both methods. Understanding the protocol clarifies what generators do for you behind the scenes.

## Why This Matters

Generators are syntactic sugar over the iterator protocol. When you write `yield`, Python generates `__iter__()` and `__next__()` methods for you. Understanding the underlying protocol helps you debug iteration issues and implement custom iterators when generators are not sufficient.

The protocol is universal. Everything that iterates in Python — `for` loops, `list()`, `sum()`, `max()`, `"".join()`, unpacking — uses this protocol. When you implement it, your objects become first-class citizens in Python's iteration ecosystem.

Custom iterators are necessary when you need behavior generators cannot provide: reusable iterators, parameterized iteration strategies, or complex state management that does not fit the generator model.

## When to Use This Pattern

- When you need an iterator that can be restarted or cloned
- Complex iteration logic that does not map well to yield statements
- Implementing iteration for existing classes without modifying them
- When you need fine-grained control over state between iterations
- Building library code that must work with Python 2 (which had different generator syntax)
- Educational purposes to understand what generators do automatically

## What Just Happened

The `CountDown` class stored its start value in `__init__`. When `iter()` was called, `__iter__()` returned `self`, making the instance its own iterator.

Each `next()` call invoked `__next__()`. The method checked if `current` was still positive, decremented it, and returned the old value. When `current` hit zero, `StopIteration` was raised.

This is exactly what `for x in CountDown(3)` would do internally: call `iter()` to get an iterator, then call `next()` repeatedly until `StopIteration`.

## Keep in Mind

- `__iter__()` should return an iterator (often self for simple cases)
- `__next__()` returns the next value or raises `StopIteration`
- `StopIteration` is the signal to stop — not an error to handle differently
- Iterators are typically single-use; iterables can create fresh iterators
- `for` loops catch `StopIteration` automatically
- `next(iterator, default)` returns the default instead of raising `StopIteration`

## Common Pitfalls

- Forgetting to raise `StopIteration` when exhausted (infinite loop)
- Returning `None` instead of raising `StopIteration` (confuses consumers)
- Making `__iter__()` return a new iterator when you want state preserved
- Not handling the case where `__next__()` is called after `StopIteration`
- Confusing iterable (has `__iter__()`) with iterator (has both methods)

## Where to Incorporate This

- Custom collection classes that need specialized iteration
- Lazy loading patterns for database or file records
- Parameterized iteration strategies (e.g., different sort orders)
- Iterator decorators that add behavior (logging, timing, filtering)
- Framework code that needs to handle arbitrary iterables
- Concurrent or parallel iteration patterns

## Related Patterns

- Generator basics (animation 2) shows the simplified syntax
- `yield from` (animation 11) delegates to other iterators
- Async generators (animation 19) implement the async iterator protocol
- `itertools` (animation 15) provides iterator building blocks
