# Introduction

Generator expressions are the lazy cousin of list comprehensions. The only syntax difference is brackets:

```python
[x*x for x in range(5)]  # List — eager, stores all
(x*x for x in range(5))  # Generator — lazy, computes on demand
```

# Why This Matters

Generator expressions give you the conciseness of comprehensions with the memory efficiency of generators. They're perfect for one-off lazy sequences that you don't need to define as full functions.

# What Just Happened

The animation showed:

1. **List comprehension** `[x*x for x in range(5)]`: Computed all 5 squares immediately
2. **Generator expression** `(x*x for x in range(5))`: Created generator instantly, computed values only when iterated

Also demonstrated that generators are **single-use** — iterating again got an empty list.

# Keep in Mind

- Generator expressions are anonymous generators
- They follow the same rules as generators (lazy, single-use, etc.)
- Parentheses are optional when the expression is the only argument: `sum(x*x for x in range(5))`

# Common Pitfalls

- **Forgetting generators are single-use** — If you need to iterate twice, use a list or recreate the generator
- **Using list comprehension when generator would suffice** — If you're just passing to another function that iterates, use a generator

# Where to Incorporate This

Use generator expressions for:

- Quick, one-off lazy sequences
- Passing to functions like `sum()`, `max()`, `''.join()`
- Anywhere a list comprehension works but you don't need to store results

# Related Patterns

- **Memory Efficiency** (Animation 7) — Why lazy is often better
- **itertools** (Animation 15) — More iterator utilities
