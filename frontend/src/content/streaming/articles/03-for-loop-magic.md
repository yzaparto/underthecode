# Introduction

Python's `for` loop is actually calling `next()` behind the scenes! When you write:

```python
for item in generator:
    process(item)
```

Python automatically:
1. Gets an iterator from the generator
2. Calls `next()` repeatedly to get values
3. Catches `StopIteration` to know when to stop

# Why This Matters

You don't have to manually call `next()` and handle `StopIteration`. The `for` loop does all that work for you. This is why generators integrate so seamlessly with Python's looping constructs.

# What Just Happened

The animation showed two ways to consume a generator:

1. **Manual way**: Calling `next()` three times, each time getting one color
2. **Easy way**: Using `for color in colors()` — same result, much cleaner

The `for` loop did exactly what our manual code did, but automatically handled the iteration and termination.

# Keep in Mind

- `for` loops work with **any iterable**, not just generators
- The loop variable (`color`) gets each yielded value in turn
- When `StopIteration` is raised, the loop ends cleanly — no exception visible

# Common Pitfalls

- **Manually calling next() when for loop would work** — Use `for` unless you need precise control
- **Not realizing generators work directly with for** — No need to convert to list first!

# Where to Incorporate This

Whenever you use a generator, prefer `for` loops unless you need:

- To get just the first few items (use `itertools.islice`)
- Fine-grained control over when to pull values
- To handle values differently based on position

# Related Patterns

- **Iterator Protocol** (Animation 6) — The __iter__ and __next__ methods behind for loops
- **Early Exit** (Animation 4) — Using break to stop iteration early
