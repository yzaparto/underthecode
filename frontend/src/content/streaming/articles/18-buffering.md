# Introduction

Sometimes you want to trade latency for throughput by processing items in batches instead of one at a time. A batching generator collects items until a batch is full, then yields the batch.

# Why This Matters

Processing overhead often has a fixed cost per operation. One database insert of 100 rows is much faster than 100 inserts of 1 row each. Batching amortizes that fixed cost across multiple items.

# What Just Happened

The animation showed:

1. Items arrived one at a time
2. The `batch()` generator collected them: `[item_0]` → `[item_0, item_1]` → `[item_0, item_1, item_2]`
3. When batch size (3) was reached, yield the batch and start fresh
4. Crucially: leftover items (`[item_9]`) were yielded at the end

10 items → 4 batches (3 + 3 + 3 + 1).

# Keep in Mind

- Always handle the last partial batch!
- Buffer size trades latency vs throughput
- The batch generator is itself lazy

# Common Pitfalls

- **Forgetting the final partial batch** — `if batch: yield batch` is essential
- **Fixed batch sizes when dynamic would be better** — Consider time-based batching too

# Where to Incorporate This

Use batching for:

- Database bulk inserts
- API calls with batch endpoints
- Network operations (send multiple items per packet)
- Any operation with per-call overhead

# Related Patterns

- **Backpressure** (Animation 16) — Flow control in streaming
- **Chaining Generators** (Animation 13) — Batching as a pipeline stage
