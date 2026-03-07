## Introduction

Backpressure is the mechanism that prevents fast producers from overwhelming slow consumers. In Python generators, backpressure is automatic: the producer cannot advance until the consumer pulls the next value. This pull-based model naturally balances production and consumption rates.

This animation shows a fast producer and slow consumer connected through generators. The producer is blocked between items, waiting for the consumer to request the next value. When the consumer breaks early, items that were never needed are never produced.

## Why This Matters

Without backpressure, fast producers flood slow consumers with data. Memory fills with unprocessed items. Systems become unstable. Backpressure prevents this by making production wait for consumption.

Generators provide backpressure for free. The pull-based model means the consumer controls the pace. There is no buffer to overflow, no queue to manage, no explicit flow control code. The architecture itself enforces balance.

Understanding backpressure is essential for building robust streaming systems. Whether using generators, async queues, or distributed streaming platforms, the concept is the same: consumers must be able to slow down producers.

## When to Use This Pattern

- Connecting producers and consumers with different processing speeds
- Processing data from fast sources (network, file) with slow operations (ML, DB writes)
- Building pipelines where any stage might be the bottleneck
- Preventing memory exhaustion from unbounded buffering
- Implementing rate limiting based on downstream capacity
- Any streaming architecture where stages have different throughputs

## What Just Happened

The fast producer and slow consumer were connected. When the loop started, the consumer pulled from its input. This triggered the producer to yield one item. The producer then blocked, suspended at its yield point.

The consumer processed the item slowly (0.3s). Only then did it pull the next value, unblocking the producer for another iteration. Production and consumption were synchronized, with the consumer controlling the pace.

When we broke out after 4 items, the remaining 6 items were never produced. There was no wasted work, no discarded data, no buffer to drain.

## Keep in Mind

- Generators provide pull-based (consumer-controlled) flow
- The producer blocks at `yield` until the consumer calls `next()`
- There is no buffer between stages — one item at a time
- Early termination prevents computation of unneeded items
- The slowest stage determines overall pipeline throughput
- This is fundamentally different from push-based systems (callbacks, events)

## Common Pitfalls

- Using threads/async without proper backpressure (leads to unbounded queues)
- Building intermediate lists that buffer unboundedly
- Assuming all streaming patterns have automatic backpressure (they do not)
- Ignoring backpressure when connecting to external systems (databases, APIs)
- Making all stages async when synchronous generators would suffice

## Where to Incorporate This

- ETL pipelines with rate-limited destination APIs
- Log processing with expensive analysis stages
- Data ingestion with validation and transformation
- Machine learning pipelines with slow inference
- Any producer-consumer pattern with mismatched rates
- Streaming architectures that must not drop data

## Related Patterns

- Buffering strategies (animation 17) shows explicit buffering for throughput
- Async generators (animation 19) extend this to async with queues
- Chaining generators (animation 12) shows multi-stage pipelines
- File streaming (animation 14) shows backpressure with I/O
