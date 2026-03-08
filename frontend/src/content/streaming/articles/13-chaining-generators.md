## Introduction

This animation builds a three-stage generator pipeline: `read_data()` yields raw strings, `clean()` strips whitespace, and `lowercase()` converts to lowercase. Data flows element by element — each item enters at the top, passes through every stage, and exits at the bottom before the next item enters. No intermediate lists are created. The entire pipeline is driven lazily by the final consumer's `next()` call propagating backward through the chain, exactly like a Unix pipe where `grep | sort | uniq` processes a 100GB file in constant memory.

## Why This Matters

Generator pipelines decompose monolithic data processing into **single-responsibility stages** that are independently testable, reusable, and composable. A function that reads, cleans, lowercases, filters, and aggregates is five concerns tangled together. A pipeline of five generators is five units you can test with a plain list, swap, reorder, or remove without touching siblings. This is the same decomposition principle behind Unix pipes, Spark's RDD lineage, and every modern query engine's operator tree.

The execution model is **demand-driven**. When the consumer calls `next()` on the final stage, that call cascades backward — each stage pulls exactly one item from the stage before it, transforms it, and yields it forward. If the consumer breaks after 10 items from a billion-row source, only 10 items flow through every stage. Combined with `itertools.islice()` or a `for`/`break` loop, this makes pipelines efficient for top-N searches, exploratory queries, and any case where you may not need all results.

Memory stays **O(1)** regardless of data size because only one item exists in each stage at any time. The pipeline processes a 50GB CSV the same way it processes a 3-element test list — one record at a time, with each record garbage-collected before the next enters the chain. This is not an optimization you add; it is the default behavior of connected generators.

## What Just Happened

The animation constructed the pipeline in three steps. `read_data()` yielded three raw strings with leading and trailing whitespace. `clean()` accepted an iterable, called `.strip()` on each item, and yielded the result. `lowercase()` did the same with `.lower()`. The pipeline was assembled as `result = lowercase(clean(read_data()))` — three generator objects linked together, all suspended, zero code executed.

When the consumer iterated with `for item in result`, the first `next()` on `lowercase` triggered `next()` on `clean`, which triggered `next()` on `read_data`. The string `"  HELLO  "` was yielded from `read_data`, stripped to `"HELLO"` by `clean`, lowered to `"hello"` by `lowercase`, and delivered to the consumer. Each item flowed through the entire chain before the next item entered. After the consumer broke or the source exhausted, `close()` propagated backward through every stage, releasing resources.

## When to Use

- ETL processes where data flows through extraction, cleaning, validation, transformation, and loading stages in constant memory
- Log processing pipelines that read lines, parse structured fields, filter by severity, and aggregate metrics without buffering
- Data cleaning workflows chaining sequential transformations — strip, normalize Unicode, validate schema, deduplicate
- Stream processing where data arrives continuously and must be transformed on the fly before downstream consumption
- CSV or JSON-lines record processing where each record passes through enrichment, validation, and formatting stages
- Any multi-step transformation where intermediate results do not need to be stored or revisited

## When to Avoid

- When stages need the entire dataset before producing output — sorting, global deduplication, and percentile calculations require buffering all data, defeating O(1) memory
- When you need random access to intermediate results — pipelines are forward-only; use materialized lists if you need indexing or slicing between stages
- When a single `map()` call suffices — wrapping one transformation in a multi-stage pipeline is unnecessary ceremony
- When debugging requires inspecting intermediate state — pipeline data flows invisibly through stages, making print-debugging harder than inspecting a list
- When performance is CPU-bound on tight numerical loops — NumPy vectorized operations and Polars expressions are orders of magnitude faster than per-element Python generator overhead
- When stages must run in parallel — generator pipelines are single-threaded and cooperative; use `concurrent.futures` or multiprocessing for true parallelism
- When the total dataset is tiny — building a pipeline for 20 items in memory adds complexity with zero benefit

## In Production

**DuckDB's query execution engine** operates as a pull-based pipeline of operators — scan, filter, project, aggregate — where each operator pulls a vector of rows from its child only when it needs the next batch. The Python API's `fetchone()` and `fetchmany()` drive this pipeline lazily, pulling exactly as many rows through the operator tree as the consumer requests. When you wrap DuckDB results in a Python generator pipeline for post-processing, you get end-to-end demand-driven execution from disk scan to application logic, with memory proportional to batch size rather than result set size.

**Spark's RDD transformation chains** are the distributed equivalent. `rdd.map(clean).filter(valid).take(10)` builds a lineage of lazy stages that only execute when an action like `take()` propagates demand backward. Each partition processes elements through the stage chain sequentially — the same pull-based model as a generator pipeline, distributed across a cluster. PySpark's `toLocalIterator()` makes this explicit by returning a Python iterator that lazily pulls elements through the entire Spark pipeline into the driver.

**Polars' lazy API** builds a computation graph of chained operations that mirrors generator pipeline composition. `lf = df.lazy().filter(...).with_columns(...).select(...)` constructs a plan where each method adds a stage. The `collect()` call drives execution, analogous to iterating a generator pipeline. Polars then optimizes the graph — predicate pushdown, projection pushdown, common subexpression elimination — fusing stages in ways that would be equivalent to a compiler inlining generator frames. The `streaming=True` flag in `collect` processes data in batches through the pipeline, achieving constant memory on datasets larger than RAM.

**Apache Arrow's RecordBatchReader** implements the same pull-based pipeline at the C++ level. When DuckDB or Polars exports results through Arrow's PyCapsule interface, each `read_next_batch()` call pulls one batch through the pipeline — a C-level `next()`. Libraries consuming Arrow streams (Pandas via `read_feather`, Polars via `from_arrow`, DuckDB via direct ingestion) all drive this pipeline lazily, processing one batch at a time rather than materializing the entire transfer.
