## Introduction

The fundamental choice in Python data processing is between eager and lazy evaluation. When you build a list, Python computes and stores every element immediately. When you create an iterator (or generator), Python computes each element only when requested. This single difference has profound implications for memory usage, performance, and program design.

This animation contrasts two approaches to producing a sequence of users. The list approach allocates memory for all 1 million strings at once. The generator approach yields strings one at a time, with memory holding only the current value. When the consumer breaks early, the generator has produced only 6 values — the remaining 999,994 were never computed.

## Why This Matters

Memory is finite. When processing large datasets, building complete lists can exhaust available RAM or trigger expensive swapping. A generator producing the same logical sequence uses constant memory regardless of size. This is not a micro-optimization — it is the difference between a program that runs and one that crashes.

Lazy evaluation also enables working with infinite sequences. You cannot build a list of all prime numbers, but you can write a generator that yields them forever. The consumer decides when to stop. This inverts control: instead of the producer deciding how much to compute, the consumer pulls exactly what it needs.

Early termination is free with generators. If you search a million records and find your answer at position 6, a list approach has already computed all million. A generator approach has computed only 7 (including the match). For search, filtering, and validation tasks, this can be a 1000x+ speedup.

## When to Use This Pattern

- Processing datasets too large to fit in memory
- Streaming data from files, databases, or network sources
- Search operations where you might find the answer early
- Pipeline processing where each stage transforms items one at a time
- Infinite sequences like event streams or mathematical series
- Any situation where you might not need all the values

## What Just Happened

The list approach built all 1 million strings immediately, consuming roughly 50MB of memory. Only after the entire list was constructed did execution return to the caller. The memory remained allocated for the list's entire lifetime.

The generator approach created a tiny generator object — about 200 bytes. When the `for` loop started pulling values, the generator computed strings one at a time. After 6 iterations, we hit the `break`, and the loop exited. The remaining 999,994 strings were never created.

This demonstrates the core trade-off: lists give random access and multiple iterations at the cost of memory. Generators give memory efficiency and early termination at the cost of single-pass, forward-only access.

## Keep in Mind

- Generators are single-use — once exhausted, they cannot be restarted
- You cannot index into a generator or check its length without consuming it
- If you need to iterate multiple times, either build a list or create a new generator
- Generator memory usage is constant regardless of how many values it can produce
- Breaking out of a generator loop does not "waste" the remaining values — they were never computed

## Common Pitfalls

- Converting a generator to a list unnecessarily, losing all memory benefits
- Calling `len()` on a generator, which raises TypeError
- Trying to iterate a generator twice without recreating it
- Assuming generators are slower — they are often faster due to reduced memory pressure
- Building intermediate lists in a pipeline when generators would chain cleanly

## Where to Incorporate This

- Log file processing where you filter and transform lines
- Database result iteration for large query results
- File system traversal with `os.walk()` or `pathlib.glob()`
- API pagination where you fetch pages on demand
- Data validation pipelines that can short-circuit on first error
- ETL jobs processing records from source to destination

## Related Patterns

- Generator basics (animation 2) shows the mechanics of `yield`
- Generator expressions (animation 8) provide compact syntax for simple generators
- `itertools` (animation 15) offers powerful iterator combinators
- File streaming (animation 14) applies this pattern to file I/O
