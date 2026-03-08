## Introduction

This animation shows a batching generator that collects individual items into fixed-size groups before yielding them downstream. Items arrive one at a time: `item_0`, `item_1`, `item_2`, and so on. The generator buffers them into batches of 3. When the buffer reaches capacity, it yields the entire batch as a list and starts fresh. When the input is exhausted, any remaining items in the buffer are yielded as a final partial batch.

Ten items produce four batches: `[item_0, item_1, item_2]`, `[item_3, item_4, item_5]`, `[item_6, item_7, item_8]`, and `[item_9]`. The last batch has only one item. The animation highlights the buffer filling up, the yield point, the buffer clearing, and the critical final flush of leftovers.

## Why This Matters

Almost every I/O operation has a fixed overhead per call — network round trips, system calls, transaction commits, index updates. Issuing one database INSERT for 1,000 rows is dramatically faster than issuing 1,000 individual INSERTs because you pay the per-call overhead once instead of a thousand times. Batching amortizes that fixed cost across multiple items, often improving throughput by **10x to 100x**.

The tradeoff is latency. Strict one-at-a-time processing delivers each result immediately but pays the full per-item overhead. Batching delays each item until the batch is full but processes the batch much faster per item. This is the fundamental **latency-throughput tradeoff** in systems engineering, and the batch generator pattern gives you a clean, composable abstraction for tuning it.

A batching generator is also a natural pipeline stage. It sits between a producer that emits individual items and a consumer that operates on groups. Because it is a generator, it preserves backpressure — the upstream producer only advances when the batch generator calls `next()` on it, and the batch generator only advances when the downstream consumer calls `next()` on it. No data is lost, no unbounded queues grow, and the pipeline self-regulates.

The final flush is the implementation detail that separates working code from production bugs. After the upstream source is exhausted and the `for` loop ends, the buffer may still contain items — up to `batch_size - 1` of them. The line `if buffer: yield buffer` flushes those leftovers. Without it, the last partial batch is **silently lost**: the trailing rows of a CSV, the final records of an ETL job, the last events of a session. This is one of the most common data-loss bugs in streaming pipelines.

There is also the question of **time-based flushing** versus size-based flushing. A pure size-based batcher waits until the buffer is full, which works for high-throughput streams where items arrive quickly. But for streams with variable arrival rates — user events, sensor readings, API responses — a half-full batch that waits forever is worse than a partial flush on a timer. Production batchers typically combine both: flush when the buffer is full **or** when a deadline expires, whichever comes first. The generator pattern supports this by checking a timer condition alongside the buffer length before deciding to yield.

## What Just Happened

The animation processed 10 items through a batch generator with a batch size of 3. Items arrived one at a time from the upstream source. The batch generator consumed them via its own internal `next()` calls and appended each to an internal buffer list.

When the buffer reached 3 items, the generator yielded the entire list `[item_0, item_1, item_2]` and reset the buffer to empty. This happened three times for the first 9 items, producing three full batches. On the tenth item, the upstream source was exhausted — the internal `for` loop ended. The generator's code then reached the critical `if buffer: yield buffer` line, flushing the final partial batch `[item_9]` containing just one item.

The batch generator itself was lazy. It did not start consuming items until the downstream consumer called `next()` on it. And it only consumed enough items to fill one batch before yielding. This means backpressure propagated correctly through the batching stage — the upstream producer only ran as fast as the downstream consumer could process batches. The batch list was a **new list per yield**, not a cleared-and-reused reference, which prevents aliasing bugs when the consumer holds references to previous batches.

The memory profile during execution was bounded at O(`batch_size`), not O(n) where n is the total number of items. At any point, only the current batch's items were in memory — previous batches had already been yielded and (assuming the consumer processed them) garbage collected. This is the key difference between batching with a generator and batching by slicing a list: the generator never materializes the full input.

Batch size itself is a tuning parameter that should match the downstream system's optimal chunk size. A batch of 10 sent to a database that handles 10,000 efficiently wastes the opportunity. A batch of 100,000 sent to an API with a 1MB payload limit will be rejected. The right batch size is determined by profiling the downstream system, not by picking a round number. There is also an aliasing subtlety: the yielded batch must be a **new list**, not the same buffer cleared with `buffer.clear()`. If the consumer holds a reference to a previously yielded batch and the generator mutates that same list object, the consumer's reference silently changes — one of Python's most insidious mutable-default-style bugs.

## When to Use

- Database bulk inserts where per-statement overhead (parsing, planning, WAL writes) dominates over per-row cost
- API calls to batch endpoints that accept arrays of items — bulk create, bulk update, bulk delete
- Kafka and message queue producers where batching reduces produce requests and improves compression ratios
- ML inference batching where GPU utilization improves dramatically with larger batch sizes
- File writes where buffering reduces the number of `write()` system calls and `fsync` operations
- Metrics and telemetry pipelines where flushing counters in batches reduces load on the aggregation backend
- Network operations where per-packet overhead makes sending many small payloads expensive

## When to Avoid

- When latency matters more than throughput — batching delays every item by up to `batch_size - 1` items of wait time
- When the downstream consumer processes items individually anyway — batching adds an unnecessary unwrapping step
- When items arrive slowly enough that batches rarely fill and most items sit in the buffer until the stream ends
- When the input stream is infinite with no natural pauses — the final partial batch may never flush
- When ordering constraints require immediate per-item processing and batching may delay items past their deadlines
- When error handling needs per-item granularity — a batch failure loses the entire batch unless you implement per-item retry
- When each item is large (images, documents) and a batch of thousands may not fit in RAM

## In Production

**Kafka producers** use `batch.size` and `linger.ms` configuration to accumulate records into batches before sending to the broker. The default batch size is 16KB. The producer appends each record to a per-partition buffer, and when the buffer reaches `batch.size` or `linger.ms` elapses, it flushes the entire batch in a single produce request. This allows the producer to compress multiple records together with Snappy, LZ4, or Zstd, and reduces the number of produce requests from one-per-record to one-per-batch, often improving throughput by 10x or more. The `linger.ms` parameter is the time-based complement to size-based batching — it ensures batches flush even when records arrive slowly.

**DuckDB's vectorized execution engine** processes data in batches of 2,048 values called vectors instead of one row at a time. This batch size is tuned to fit in L1 cache, enabling SIMD operations and branch prediction to work efficiently. The entire performance advantage of DuckDB over traditional row-at-a-time databases derives from this batching strategy. Operators like filter, project, and aggregate process a full vector in a tight loop, amortizing function-call overhead and enabling compiler auto-vectorization.

**Polars' `sink_parquet()` and streaming `collect()`** batch rows into row groups before writing to Parquet files. Each row group is a self-contained columnar chunk, typically 64K to 1M rows. This batching is what enables Parquet's columnar compression — encoding a batch of similar values together achieves far better compression ratios than encoding individual values. The row group boundary is the buffer-fill-yield boundary: accumulate rows, compress and write the group, reset the buffer, repeat.

**SQLAlchemy's `session.execute(insert().values(batch))`** and `bulk_insert_mappings()` accept batches of rows and issue a single multi-row INSERT instead of individual statements. This reduces round trips to the database, allows PostgreSQL to process the batch in a single transaction with one WAL flush, and dramatically reduces parse/plan overhead. The same pattern appears in `psycopg`'s `executemany()` with `execute_batch()`, which rewrites individual INSERTs into batched multi-row statements.

**The OpenAI Batch API** accepts arrays of requests for offline processing at 50% reduced cost. The client batches individual completion requests into a single JSONL upload, and results are returned as a batch. This is the same buffer-fill-yield-flush pattern elevated to the API level — accumulate requests, flush the batch to the endpoint, receive batched results.
