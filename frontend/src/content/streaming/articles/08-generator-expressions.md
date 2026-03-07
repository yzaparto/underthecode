## Introduction

Generator expressions are the generator equivalent of list comprehensions. Where `[x*x for x in range(5)]` builds a list, `(x*x for x in range(5))` creates a generator. The syntax difference is just brackets versus parentheses, but the behavior difference is eager versus lazy evaluation.

This animation shows both forms and their different behaviors. The list comprehension evaluates immediately, storing all values. The generator expression creates a generator object that computes values on demand. After iteration, the generator is exhausted.

## Why This Matters

Generator expressions are the simplest way to get lazy evaluation. For many common patterns — filtering, mapping, transforming — you do not need a full generator function. A one-liner generator expression suffices and clearly signals lazy evaluation to readers.

The memory and performance benefits of generators apply equally to generator expressions. When you write `sum(x*x for x in range(1000000))`, Python never builds a million-element list. Each squared value is computed, added, and discarded.

Generator expressions compose naturally. You can nest them, pass them to functions, and chain them in pipelines. They are the building blocks of efficient data processing in idiomatic Python.

## When to Use This Pattern

- Simple transformations that do not need a full generator function
- Passing lazy sequences directly to consuming functions like `sum()`, `max()`, `any()`
- One-off lazy sequences that you will iterate once
- Filtering or mapping operations in a single expression
- When a list comprehension would work but you want lazy evaluation
- Building blocks in larger lazy pipelines

## What Just Happened

The list comprehension `[x*x for x in range(5)]` ran immediately, computing and storing all five squares. The resulting list occupied memory proportional to its size and could be iterated multiple times.

The generator expression `(x*x for x in range(5))` returned a generator object instantly without computing anything. The `for` loop then pulled values one at a time, each computed on demand.

After the loop, `list(squares_gen)` returned empty — the generator was exhausted. Unlike lists, generators are single-use; the values are gone once consumed.

## Keep in Mind

- Parentheses create generators; brackets create lists
- Generator expressions are single-use and cannot be restarted
- When passing to a function, you can omit the outer parentheses: `sum(x for x in items)`
- Generator expressions can include `if` clauses: `(x for x in items if x > 0)`
- They can have multiple `for` clauses: `(x*y for x in xs for y in ys)`
- Once exhausted, iterating again yields nothing (not an error, just empty)

## Common Pitfalls

- Using `[...]` when `(...)` would avoid unnecessary memory allocation
- Trying to use a generator expression multiple times (it is exhausted after one pass)
- Forgetting that `len()` does not work on generator expressions
- Not realizing that errors occur lazily during iteration, not at creation
- Accidentally creating a tuple with `(expr,)` instead of a generator with `(expr for ...)`

## Where to Incorporate This

- Data processing pipelines with map/filter operations
- Arguments to aggregating functions (`sum`, `min`, `max`, `any`, `all`)
- Lazy validation where you might short-circuit early
- Building lazy sequences to pass to other lazy consumers
- One-liner transformations in scripts and data analysis
- Replacing list comprehensions where you iterate only once

## Related Patterns

- List vs iterator (animation 1) explains the fundamental trade-off
- Memory efficiency (animation 5) quantifies the memory savings
- Chaining generators (animation 12) shows how to compose generators
- `itertools` (animation 15) provides more powerful lazy operations
