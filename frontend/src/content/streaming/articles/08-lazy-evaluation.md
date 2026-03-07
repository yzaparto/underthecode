# Introduction

**Lazy evaluation** means computing values only when they're actually needed. Generators are lazy by nature — they don't compute anything until you ask for the next value.

The opposite is **eager evaluation**, where you compute everything upfront.

# Why This Matters

If you might not need all the values, lazy evaluation saves computation. If each value is expensive to compute (database query, API call, complex calculation), you don't want to compute them until you're sure you need them.

# What Just Happened

The animation compared:

1. **Eager** (list comprehension): Called `expensive_task()` for ALL items immediately, before returning
2. **Lazy** (generator): Created instantly with zero computation. Each `next()` computed one item

With lazy evaluation, if you only needed the first item, you'd only compute the first item.

# Keep in Mind

- Generator creation is instant — no computation happens
- Computation happens when you pull values (via `next()` or `for`)
- If you never consume a value, it's never computed

# Common Pitfalls

- **Expecting generators to compute eagerly** — They don't! Values are computed on demand.
- **Using eager evaluation when lazy would be better** — If you might break early, use a generator.

# Where to Incorporate This

Lazy evaluation shines when:

- You might not need all values
- Values are expensive to compute
- You want to defer computation until necessary
- Working with potentially infinite sequences

# Related Patterns

- **Memory Efficiency** (Animation 7) — O(1) memory through laziness
- **Early Exit** (Animation 4) — Stopping computation when you have what you need
