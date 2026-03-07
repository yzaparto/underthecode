# Introduction

The killer feature of generators is **O(1) memory usage**. No matter how many items you're processing, a generator only holds one item at a time. Compare:

- **List**: Memory = O(n) — stores all n items
- **Generator**: Memory = O(1) — stores just current state

# Why This Matters

Want to process a file with 10 million lines? A list needs enough RAM for all 10 million strings. A generator needs enough RAM for... one line. This is the difference between "crashes my laptop" and "runs forever on a Raspberry Pi."

# What Just Happened

The animation compared computing squares two ways:

1. **List comprehension**: Built `[0, 1, 4, 9, 16]` — all 5 values in memory at once
2. **Generator**: Computed and yielded one square at a time, each forgotten after use

Same output, but the generator would scale to billions while the list would crash.

# Keep in Mind

- Memory is constant regardless of input size
- Each value is computed just-in-time
- Once yielded, the value isn't stored by the generator

# Common Pitfalls

- **Converting generators to lists unnecessarily** — `list(generator)` defeats the purpose!
- **Using list comprehensions by default** — Use generator expressions when you don't need all values at once

# Where to Incorporate This

Essential for:

- Processing large files
- Streaming data from networks
- Infinite sequences
- Memory-constrained environments

# Related Patterns

- **Lazy Evaluation** (Animation 8) — Computing on demand
- **File Streaming** (Animation 14) — Practical O(1) memory file processing
