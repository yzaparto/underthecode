# Introduction

So far, data has flowed one way: generator → consumer. But with `send()`, you can also send data back into a generator!

```python
value = yield output   # yields 'output', receives 'value' from send()
```

This makes generators capable of two-way communication.

# Why This Matters

With `send()`, generators can be **coroutines** — they can receive input, process it, and produce output. This pattern is foundational to Python's async/await system and can implement things like running averages, state machines, and more.

# What Just Happened

The animation showed an accumulator generator:

1. First `next(gen)` started it — yielded the initial total (0)
2. `gen.send(10)` resumed with 10 as the value of `yield` — added to total, yielded 10
3. `gen.send(5)` resumed with 5 — added to total, yielded 15
4. `gen.send(None)` signaled stop

Each `send()` both injected a value IN and received a value OUT.

# Keep in Mind

- Must call `next()` first to "prime" the generator (advance to first yield)
- `send(None)` is equivalent to `next()`
- The value you send becomes the result of the `yield` expression inside the generator

# Common Pitfalls

- **Forgetting to prime with next()** — You'll get a TypeError
- **Sending to an exhausted generator** — StopIteration raised

# Where to Incorporate This

Use `send()` when you need:

- Generators that accept input (coroutines)
- Running computations (averages, filters with thresholds)
- State machines where external events affect behavior

# Related Patterns

- **throw() and close()** (Animation 11) — More ways to control generators
- **Async Generators** (Animation 20) — Modern async with similar patterns
