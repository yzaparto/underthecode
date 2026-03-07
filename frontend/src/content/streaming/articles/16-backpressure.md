# Introduction

**Backpressure** is automatic flow control where the consumer controls the pace of production. With generators, the producer can't outrun the consumer — it only produces when asked.

# Why This Matters

Without backpressure, a fast producer can overwhelm a slow consumer, causing memory to grow unboundedly (buffering) or data to be lost (dropping). Generator-based pipelines get backpressure for free.

# What Just Happened

The animation showed:

1. **Fast producer**: Could yield instantly
2. **Slow consumer**: Took 0.5s per item
3. **Result**: Producer was automatically throttled to consumer's pace

The consumer pulled one item, processed it slowly, then pulled the next. The producer couldn't run ahead — it was blocked at `yield` until the consumer asked for more.

# Keep in Mind

- Generators are **pull-based**: consumer requests values
- Producer is paused at `yield` until consumer calls `next()`
- No explicit buffering or rate limiting needed

# Common Pitfalls

- **Building push-based systems when pull would work** — Generators give you backpressure automatically
- **Adding buffering when you don't need it** — Can mask the natural flow control

# Where to Incorporate This

Backpressure matters for:

- Processing streams of data
- Producer/consumer patterns
- ETL pipelines
- Any system where production and consumption rates differ

# Related Patterns

- **Chaining Generators** (Animation 13) — Pipelines with natural backpressure
- **Buffering & Batching** (Animation 18) — When you DO want some buffering
