## Introduction

Lazy evaluation defers computation until the result is actually needed. In Python, generators provide lazy evaluation by default. An eager approach computes all results upfront; a lazy approach computes each result on demand. The difference is not just about memory — it fundamentally changes when work happens.

This animation compares eager and lazy approaches to computing expensive results. The eager version computes all 5 results before returning. The lazy version creates a generator instantly, then computes each result only when the caller requests it.

## Why This Matters

Lazy evaluation is about control. With eager evaluation, the producer decides how much work to do. With lazy evaluation, the consumer controls the pace. This inversion is powerful: the consumer can pause between items, process items as they arrive, or stop early without wasting computation.

For expensive operations — database queries, API calls, complex calculations — lazy evaluation can dramatically reduce latency. The first result is available immediately, not after all results are computed. Users see progress instead of waiting.

Lazy evaluation also enables composition. You can chain multiple lazy operations (map, filter, transform) without any intermediate work. The entire pipeline executes only when you finally pull values. This is the foundation of efficient data processing pipelines.

## When to Use This Pattern

- Operations with expensive per-item computation
- Scenarios where consumers might not need all items
- Building data processing pipelines with multiple stages
- Situations where time-to-first-result matters
- Working with potentially infinite or very large sequences
- Any computation that can be deferred without changing correctness

## What Just Happened

The eager approach called `expensive_computation()` five times immediately. All "Computing..." messages appeared before the function returned. The caller received a complete list but had to wait for all computations.

The lazy approach created a generator instantly — zero computations happened. Only when we called `next()` did the first computation occur. We printed "Pausing..." between values, demonstrating that the caller controls the pace. The second computation happened only when explicitly requested.

This shows lazy evaluation in action: work happens when values are pulled, not when the generator is created.

## Keep in Mind

- Generator creation is instant — no iteration happens until you pull values
- Each `next()` or loop iteration triggers computation for one item
- Work is interleaved with consumption — pull, process, pull, process
- You can do arbitrary work between pulls (unlike with a precomputed list)
- Errors in computation are raised when that item is pulled, not at creation
- Lazy evaluation is the default for generators, `map()`, `filter()`, and comprehensions

## Common Pitfalls

- Forcing eager evaluation by wrapping in `list()` when you do not need to
- Assuming the generator has "pre-computed" values after creation
- Not realizing that errors occur lazily (might surprise you later in iteration)
- Expecting random access to a lazy sequence (must iterate sequentially)
- Building intermediate lists in pipelines instead of chaining generators

## Where to Incorporate This

- API response processing where you act on each item immediately
- Machine learning data pipelines with expensive preprocessing
- Database cursors that fetch rows on demand
- Image processing pipelines with heavy transformations
- Any "extract-transform-load" workflow
- Interactive applications where responsiveness matters

## Related Patterns

- Memory efficiency (animation 5) shows the memory impact
- Chaining generators (animation 12) shows lazy pipeline composition
- `itertools` (animation 15) provides lazy standard library utilities
- Backpressure (animation 16) shows consumer-controlled pacing
