# Introduction

The `itertools` module is Python's standard library for iterator operations. It provides battle-tested, efficient tools for common iterator patterns — all lazy and composable.

# Why This Matters

Don't reinvent the wheel! `itertools` functions handle edge cases, are optimized for performance, and make your code more readable. They're the building blocks for sophisticated iterator pipelines.

# What Just Happened

The animation demonstrated three essential tools:

1. **islice(iterator, n)**: Take first n items from ANY iterator, even infinite ones
2. **chain(iter1, iter2, ...)**: Concatenate iterables lazily
3. **takewhile(predicate, iterator)**: Yield while condition is True, then stop

Each works lazily — no intermediate lists created.

# Keep in Mind

- All itertools functions return iterators (lazy)
- They handle edge cases (empty iterables, etc.)
- Many functions accept infinite iterators safely

# Common Pitfalls

- **Not knowing itertools exists** — Check before writing your own!
- **takewhile vs filter** — `takewhile` STOPS at first False; `filter` skips False values

# Key Functions to Know

- `islice()` — Slice iterators
- `chain()` — Concatenate
- `takewhile()`, `dropwhile()` — Conditional taking/skipping
- `groupby()` — Group consecutive items
- `zip_longest()` — Zip with fill value
- `count()`, `cycle()`, `repeat()` — Infinite iterators

# Where to Incorporate This

Use itertools for:

- Any iterator transformation
- Working with infinite sequences
- Combining multiple iterables
- Efficient iterator operations

# Related Patterns

- **Chaining Generators** (Animation 13) — Building custom pipelines
- **Generator Expressions** (Animation 9) — Another way to create iterators
