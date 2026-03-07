# Introduction

`yield from` lets a generator delegate to another generator. Instead of manually looping and yielding each item, you can write:

```python
yield from other_generator()
```

This passes through all values from the sub-generator transparently.

# Why This Matters

Without `yield from`, composing generators requires boilerplate. With it, you can build layered generators that delegate to each other cleanly. It also properly handles `send()`, `throw()`, and `close()` — all calls are forwarded to the sub-generator.

# What Just Happened

The animation showed:

1. **Manual delegation**: Looping over `inner()` and yielding each item — verbose
2. **yield from**: One line does the same thing
3. **Bonus**: The return value of `inner()` became available as `result = yield from inner()`

The outer generator yielded A and B from inner, then yielded C itself.

# Keep in Mind

- All values from the sub-generator pass through
- `send()`, `throw()`, and `close()` are forwarded to the sub-generator
- The sub-generator's return value becomes the value of the `yield from` expression

# Common Pitfalls

- **Using a loop when yield from would work** — More verbose and doesn't forward send/throw
- **Forgetting yield from can capture return values** — Useful for composition

# Where to Incorporate This

Use `yield from` when:

- Splitting a generator into sub-generators
- Building recursive generators (e.g., tree traversal)
- Composing generator pipelines
- Creating generator "middleware"

# Related Patterns

- **Chaining Generators** (Animation 13) — Building pipelines
- **Your First Generator** (Animation 1) — Basic yield mechanics
