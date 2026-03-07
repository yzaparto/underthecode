## Introduction

Buffering groups items into batches before processing. Instead of processing items one at a time, you collect N items and process them together. This trades latency for throughput — you wait longer for the first result, but total processing time decreases due to batching efficiency.

This animation shows a batching generator that collects items into fixed-size groups. Individual items are buffered until a batch is complete, then the batch is yielded. The final batch may be smaller if items do not divide evenly.

## Why This Matters

Many operations are more efficient in batches. Database inserts, API calls, and network operations often have per-operation overhead. Processing 100 items in one batch is faster than processing 100 items individually. Batching amortizes that overhead.

The trade-off is latency. Unbatched streaming gives you the first result immediately. Batched streaming makes you wait until the batch is full. Choose based on whether throughput or latency matters more for your use case.

Buffering is also necessary when downstream systems require batches. Bulk insert APIs, batch inference endpoints, and vectorized operations all expect multiple items at once. A batching generator adapts stream-oriented code to batch-oriented APIs.

## When to Use This Pattern

- Bulk database operations (insert, update, delete)
- API calls with batch endpoints
- Machine learning batch inference
- Network operations where per-request overhead dominates
- Vectorized computations (NumPy, Pandas)
- Any operation more efficient with multiple items at once

## What Just Happened

The `batch()` generator collected items from its input into a list. When the list reached the target size (3), it yielded the batch and started a new list. Buffering happened inside the generator, hidden from both producer and consumer.

After all input items were consumed, a partial batch remained (1 item). The generator yielded this final batch, ensuring no items were lost.

The consumer received batches of items instead of individual items. Processing could now use batch-optimized operations.

## Keep in Mind

- Batch size is a trade-off: larger batches = more throughput, higher latency
- The final batch may be smaller than the batch size
- Buffering uses memory proportional to batch size
- Consider time-based batching too (flush after N seconds even if batch is not full)
- Some systems have optimal batch sizes — benchmark to find them
- Batching breaks the pure streaming model (introduces buffering)

## Common Pitfalls

- Setting batch sizes too large, causing memory issues or excessive latency
- Forgetting to yield the final partial batch
- Not handling the case where input is empty (should yield nothing, not empty batch)
- Batching before filtering (batch after filter to avoid small batches)
- Ignoring downstream batch size limits (APIs often have maximum batch sizes)

## Where to Incorporate This

- Database bulk insert pipelines
- API integration with batch endpoints
- ML model serving with batch inference
- File writing with buffered I/O
- Network protocols with message batching
- Any high-throughput data pipeline

## Related Patterns

- Backpressure (animation 16) for flow control without buffering
- Chaining generators (animation 12) for pipeline composition
- `itertools` (animation 15) has recipes for batching
- Async generators (animation 19) for async batching patterns
