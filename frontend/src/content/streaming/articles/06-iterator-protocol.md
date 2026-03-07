# Introduction

The **Iterator Protocol** is Python's contract for iteration. Any object that implements two methods can be used in a `for` loop:

- `__iter__()` — Return an iterator (often `self`)
- `__next__()` — Return the next value, or raise `StopIteration`

Generators automatically implement this protocol.

# Why This Matters

This is why `for` loops "just work" with generators, lists, files, dictionaries, and more. They all speak the same protocol. Understanding it helps you create your own iterables and understand how Python's iteration works under the hood.

# What Just Happened

The animation showed what `for x in gen` really does:

1. `iter(gen)` calls `gen.__iter__()` — gets an iterator (for generators, this returns itself)
2. `iterator.__next__()` is called repeatedly to get values
3. When `__next__()` raises `StopIteration`, iteration stops

The `next()` built-in function is just shorthand for calling `.__next__()`.

# Keep in Mind

- Generators ARE iterators — they implement the protocol automatically
- `iter()` on a generator returns the same object (not a copy)
- Each `__next__()` call advances the iterator's state

# Common Pitfalls

- **Confusing iterable vs iterator** — An iterable can give you an iterator; an iterator gives you values
- **Implementing __iter__ without __next__** — You need both for a complete iterator

# Where to Incorporate This

Understanding the protocol helps when:

- Creating custom iterable classes
- Debugging iteration issues
- Building adapters between different iteration styles

# Related Patterns

- **The for Loop Magic** (Animation 3) — Using iterators in practice
- **Generator Expressions** (Animation 9) — Compact iterator syntax
