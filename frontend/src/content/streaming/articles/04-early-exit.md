# Introduction

One of generators' superpowers is that you can stop consuming them at any time. If you only need the first item that matches a condition, you can `break` out of the loop — and the generator never computes the items you didn't need.

# Why This Matters

Imagine searching through a database of a million users. With a list, you'd have to fetch all million before checking them. With a generator, you fetch and check one at a time, and stop as soon as you find what you're looking for.

This can turn an O(n) operation into O(1) in the best case.

# What Just Happened

The animation simulated searching for "bob" in a stream of users:

1. Generator searched for "alice" — not what we want, continue
2. Generator searched for "bob" — found! We break out
3. "charlie" and "diana" were **never searched** — we saved the work

The generator stopped running as soon as we stopped consuming it.

# Keep in Mind

- `break` in a `for` loop immediately stops the generator
- The generator doesn't know you stopped — it just never gets another `next()` call
- Any setup/cleanup in the generator's `finally` block will still run

# Common Pitfalls

- **Building a list first, then searching** — You lose the ability to exit early!
- **Not using generators for search operations** — If you might not need everything, use a generator

# Where to Incorporate This

Perfect for:

- Searching through large datasets
- Finding the first match in a stream
- Processing until a condition is met
- Any "find first" operations

# Related Patterns

- **File Streaming** (Animation 14) — Process files without loading them entirely
- **Backpressure** (Animation 16) — Consumer controls the pace
