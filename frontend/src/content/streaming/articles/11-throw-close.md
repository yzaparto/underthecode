# Introduction

Beyond `next()` and `send()`, you can control generators with:

- `throw(exception)` — Inject an exception at the yield point
- `close()` — Gracefully shut down the generator

These let you handle errors and cleanup from outside the generator.

# Why This Matters

When a generator manages resources (files, connections, locks), you need a way to trigger cleanup even if something goes wrong outside. `close()` ensures the generator's `finally` blocks run. `throw()` lets you inject errors for the generator to handle.

# What Just Happened

The animation showed:

1. **Normal operation**: Started generator, sent a task
2. **throw()**: Injected a `ValueError` — the generator's `except` block caught it and recovered
3. **close()**: Called close — the `finally` block ran, performing cleanup

The generator handled the thrown exception and continued, then cleaned up on close.

# Keep in Mind

- `close()` raises `GeneratorExit` inside the generator
- `finally` blocks ALWAYS run when closing (that's why they exist!)
- A generator can catch `GeneratorExit` but should reraise or return

# Common Pitfalls

- **Not using finally for cleanup** — If you open a file, use `finally` to close it
- **Catching GeneratorExit and not reraising** — This prevents proper cleanup

# Where to Incorporate This

Essential for:

- Generators that manage resources
- Error injection for testing
- Cancellation of long-running generators
- Clean shutdown of generator pipelines

# Related Patterns

- **@contextmanager** (Animation 17) — Generators as resource managers
- **send()** (Animation 10) — Two-way communication
