## Introduction

This animation puts numbers to the claim that generators save memory. It compares two approaches to computing squares: a list comprehension that allocates **O(n)** memory to store every result simultaneously, and a generator that uses **O(1)** memory by computing and yielding one value at a time, discarding it before producing the next. The visual makes the difference visceral — you see the list growing while the generator's footprint stays flat.

The distinction is not theoretical. A list of 10 million integers consumes roughly 80 MB on a 64-bit CPython build — each `int` object is 28 bytes plus 8 bytes for the list pointer. A generator producing the same 10 million integers uses approximately **200 bytes** total: the generator frame object, a few local variables, and the bytecode instruction pointer. The ratio is not 2x or 10x — it is **400,000x**. This is why generators are the default choice for any data pipeline that touches more data than fits comfortably in RAM.

## Why This Matters

Memory efficiency is the difference between a program that runs and one that gets killed by the OOM killer. A data pipeline processing a 50GB CSV cannot load it into a list — the process would be terminated long before it finishes. A generator that yields one row at a time processes the same file in constant memory, bounded only by the size of a single row.

Beyond avoiding crashes, memory efficiency directly affects **throughput**. Modern CPUs have 32KB–64KB L1 caches. When your working set fits in cache, operations run at nanosecond speeds. When it spills to L2 or L3, latency increases 3–10x. When it spills to main memory, 50–100x. A generator that processes one item at a time keeps the working set tiny and cache-friendly. A list that materializes millions of items forces the CPU to chase pointers across megabytes of heap, thrashing every cache level.

Garbage collection is the hidden cost of large lists. CPython's reference-counting collector handles most objects immediately, but the cyclic garbage collector must periodically scan the entire heap for reference cycles. A list of 10 million objects means 10 million objects to scan. A generator that processes and discards items one at a time keeps the live object count low, reducing GC pause times from seconds to microseconds. In latency-sensitive services, this difference determines whether you meet your P99 SLA.

## What Just Happened

The animation ran two computations side by side. On the list side, `[x*x for x in range(5)]` evaluated **eagerly**: Python computed all five squares — 0, 1, 4, 9, 16 — and stored them in a contiguous list object before any consumer could touch them. The list allocated memory proportional to the number of elements. Every value existed simultaneously in memory.

On the generator side, the generator object was created instantly with zero computation. Each call to `__next__()` computed exactly one square, yielded it, and suspended. The previously yielded value was not retained — once the consumer moved on, the old value's reference count dropped and it became eligible for collection. At no point did more than one computed value exist inside the generator.

The key visual was the memory footprint. The list's memory grew with each element. The generator's memory stayed **flat** — a constant-size frame object regardless of how many values had been produced. After yielding 5 values or 5 billion values, the generator's own memory consumption is identical. The O(1) guarantee comes from the CPython implementation: a generator object contains a `PyFrameObject` pointer to a fixed-size heap allocation that stores frozen execution state but never grows with output volume.

## When to Use

- Processing files larger than available RAM — CSV, JSON Lines, log files, database exports
- Streaming data from network sources where total size is unknown or unbounded
- ETL pipelines where each stage transforms one record at a time without needing the full dataset
- Any pipeline feeding into aggregation functions like `sum()`, `max()`, `min()` that consume one value at a time
- Memory-constrained environments — containers with 256MB limits, serverless functions with tight memory caps, edge devices
- Replacing `fetchall()` with cursor iteration when querying databases with millions of rows

## When to Avoid

- When the consumer needs random access — `result[500]` requires a list; generators have no indexing
- When the consumer will iterate multiple times — generators are single-pass, so you need to recreate or just use a list
- When the dataset is small enough that O(n) memory is trivial — a list of 100 items is fine; do not over-optimize
- When downstream code calls `len()` on the result — generators have no length and computing it consumes them
- When you need to sort the full dataset — sorting requires materializing all elements regardless of source
- When debugging requires inspecting all values at once — a list in a debugger is easier to examine than a consumed generator
- When per-item generator overhead matters more than memory — for tiny datasets, list comprehensions are faster due to C-level optimization and memory locality

## In Production

**Apache Arrow's `RecordBatchReader.from_batches(generator)`** accepts a Python generator of `RecordBatch` objects, streaming them into Arrow's columnar format without ever holding the entire dataset in memory. This is how PyArrow processes multi-gigabyte Parquet files on machines with limited RAM — each batch is a fixed-size chunk, typically 64K–1M rows, processed and released before the next batch is read. The generator protocol lets Arrow's reader pull batches on demand, and the O(1) memory guarantee means the Python side never becomes the bottleneck regardless of total dataset size.

**DuckDB's Python API** uses the same pattern for result streaming. Calling `result.fetch_record_batch(batch_size)` in a loop yields fixed-size Arrow batches from queries over datasets far larger than memory. DuckDB can query a 50-million-row CSV file on a laptop with 8GB RAM because it streams batches through the query engine rather than materializing the full result. Internally, DuckDB's streaming execution engine produces one morsel (a partition of rows) at a time, and the Python-side generator consumes and releases each morsel before the next is produced — O(1) memory on both sides of the language boundary.

**Pandas' `read_csv(chunksize=10000)`** returns a `TextFileReader` that acts as a generator of DataFrames, each containing 10,000 rows. This lets you process a 100GB CSV on a machine with 4GB RAM by handling one chunk at a time: filter, transform, aggregate, discard. Polars takes this further with its lazy API — `scan_csv()` builds a query plan that streams data in batches, never materializing the full dataset. Both libraries demonstrate the same principle: the generator's O(1) memory footprint is what makes processing-larger-than-RAM datasets possible in Python without reaching for Spark or distributed systems.

**Kafka consumers** in `confluent-kafka-python` follow the identical pattern. `consumer.poll()` in a loop yields one message at a time from a topic — a potentially infinite stream of events processed in constant memory. The consumer never needs to know the total message count. **boto3's S3 paginators** work the same way: `paginator.paginate(Bucket='data')` yields one page of object listings at a time, allowing you to enumerate buckets with billions of objects without loading the full listing. In both cases, the O(1) memory guarantee of the pull-based generator model is what makes unbounded data tractable.
