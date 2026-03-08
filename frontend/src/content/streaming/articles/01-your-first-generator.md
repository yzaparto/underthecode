## The Concept

Generators were introduced in Python 2.2 via **PEP 255** (2001), inspired by CLU's iterators and Icon's generators from the 1970s–80s. The core idea was radical: a function that **suspends** its execution midway, yields a value, and later resumes exactly where it left off with all local variables intact. Before generators, producing a sequence meant building an entire list in memory first. **PEP 234** defined the iterator protocol (`__iter__` / `__next__`) that generators automatically implement. **PEP 342** (Python 2.5) added `send()`, `throw()`, and `close()`, turning generators into full coroutines. **PEP 380** (Python 3.3) introduced `yield from` for transparent delegation. Most critically, **PEP 3156** and **PEP 492** built asyncio's coroutine model directly on top of generators — `async def` and `await` are syntactic sugar over `yield`-based coroutines. Every `await` in modern Python traces its lineage back to `yield`.

The mental model: a generator is a **function with a bookmark**. Each `yield` marks a page. Each `next()` resumes reading from the last bookmark. The function's locals, instruction pointer, and execution context survive between calls. This is cooperative multitasking at the language level — the generator voluntarily yields control, and the caller decides when to resume it.

## Introduction

This animation shows the simplest possible generator: a function that yields 1, 2, and 3. Calling the generator function does **not** execute the body — you get a generator object in suspended state. Each `next()` call runs forward to the next `yield`, produces a value, and freezes the function. After the last value, the function ends and raises `StopIteration`. This create → advance → receive → repeat rhythm is the foundation of everything in this series, from file streaming to asyncio coroutines.

## Why This Matters

Generators invert the producer-consumer relationship. A normal function controls flow: it builds all data, hands it over, and is gone. With a generator, the **consumer** controls flow — pulling values one at a time, on its own schedule. The producer only does work when asked.

This inversion is the foundation of lazy evaluation in Python. You can represent infinite sequences, stream a 50GB file, or process a real-time event feed — all with constant memory. At the systems level, `yield` saves the function's entire execution frame — locals, instruction pointer, try/except context — onto the heap instead of discarding it when the stack unwinds. This is dramatically cheaper than spawning a thread or process for the same producer-consumer decoupling, and it is the reason asyncio was architecturally possible at all.

## What Just Happened

The animation walked through three fundamental phases. First, calling `count_to_three()` created a generator object without executing any function body — the function was suspended before its first line. This is the distinction that trips every beginner: calling a generator function does **not** run it.

Second, each `next()` advanced the generator. The first `next()` ran from the top to the first `yield`, produced 1, and froze. The second `next()` resumed from that exact point, produced 2, and froze again. The third `next()` resumed, produced 3, and froze once more.

Third, a final `next()` would resume the generator, but there is no more code. The function reaches its implicit `return None`, which Python translates into `StopIteration`. This exception is the iterator protocol's "end of sequence" signal — `for` loops, `list()`, and every other iterable consumer catch it silently.

## When to Use

- When producing sequences where you don't know how many values the consumer needs
- When processing datasets too large for memory — files, database cursors, API pages
- When building data pipelines where each stage transforms one item at a time
- When implementing custom iterators without writing a full `__iter__`/`__next__` class
- When creating infinite sequences like counters, sensor readings, or event streams
- When you need cooperative concurrency semantics without threading overhead

## When to Avoid

- When you need random access — generators only move forward, never backward
- When the consumer always needs every element at once and will call `list()` anyway
- When the sequence is small enough that memory savings are irrelevant — 10 items in a list is fine
- When you need to iterate the same data multiple times — generators are single-use and exhausted after one pass
- When debugging requires seeing all values simultaneously — a list in a debugger is easier to inspect
- When you need `len()`, slicing, or indexing — generators support none of these

## In Production

**Apache Arrow's RecordBatchReader** uses exactly this pattern — calling `next()` on the reader yields one `RecordBatch` at a time from a Parquet file or IPC stream, allowing terabytes of columnar data to be processed without loading the entire dataset. Arrow's zero-copy memory model means each yielded batch is a lightweight view into the underlying buffer, and the generator protocol lets consumers pull batches at their own pace without the reader needing to know whether downstream processing is fast or slow.

**Pandas' `read_csv(chunksize=N)`** returns a `TextFileReader` that behaves as a generator of DataFrames, each containing N rows. This enables memory-bounded ETL over CSV files larger than available RAM. Internally, the reader maintains a file position pointer and parser state across iterations, reading and parsing only the next chunk when `next()` is called — the exact freeze-and-resume semantics that generators provide.

**Hugging Face Datasets** uses generator-based loading via `GeneratorBasedBuilder`, where each `yield` produces one example from arbitrarily large datasets stored on disk or streamed from the Hub. The `datasets.load_dataset(streaming=True)` path returns an `IterableDataset` that wraps a generator chain — download, decompress, parse, and yield happen incrementally per example rather than materializing the full dataset.

**The OpenAI Python SDK** returns a generator from `client.chat.completions.create(stream=True)`, where each `next()` produces one `ChatCompletionChunk` containing a token delta. The SDK internally manages the HTTP connection, parses server-sent events, and deserializes JSON — all hidden behind the simple `next()` call. Anthropic's SDK follows the same pattern with `client.messages.stream()`, where each iteration yields a `MessageStreamEvent`. This is the generator protocol powering modern LLM-based applications.
