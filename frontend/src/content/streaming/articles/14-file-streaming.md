# Introduction

Files are the classic use case for generators. Instead of `file.readlines()` which loads the entire file into memory, iterate line by line:

```python
with open(filename) as f:
    for line in f:  # Lazy iteration!
        yield process(line)
```

# Why This Matters

A 10GB log file would need 10GB+ of RAM to load entirely. With generators, you need memory for just one line at a time — maybe a few kilobytes. This is the difference between "impossible" and "runs on any machine."

# What Just Happened

The animation showed:

1. Building a pipeline: `read_lines()` → `filter_errors()`
2. Processing a large log file line by line
3. Finding 3 errors, then using `break` to stop early
4. The remaining 99.9% of the file was **never even read**

Memory usage stayed constant at roughly "one line" throughout.

# Keep in Mind

- `open(file)` itself is iterable — no need to wrap it
- `with` ensures the file closes even if you break early
- Generators compose naturally with file iteration

# Common Pitfalls

- **Using readlines() on large files** — Memory explosion!
- **Not using `with` for file handling** — Resource leaks

# Where to Incorporate This

Essential for:

- Log file analysis
- CSV/JSON streaming processing
- Any file too large to fit in memory
- Processing files of unknown size

# Related Patterns

- **Memory Efficiency** (Animation 7) — Why O(1) memory matters
- **Early Exit** (Animation 4) — Stopping when you have enough
