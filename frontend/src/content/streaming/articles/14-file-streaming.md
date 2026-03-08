## Introduction

This animation demonstrates **O(1) memory file processing** — the single most common real-world use case for generators. A 10GB log file is processed line by line: `read_lines()` yields each line lazily, `filter_errors()` passes through only lines containing `"ERROR"`, and the consumer iterates until it finds 3 matches, then breaks. The remaining 99.9% of the file is never read from disk. Memory usage stays constant at roughly one line — a few kilobytes — throughout the entire operation, regardless of file size.

## Why This Matters

Files are the most common data source that **exceeds available memory**. A single day of application logs can be tens of gigabytes. Database exports, scientific datasets, and ML training corpora routinely exceed available RAM. If your strategy requires `data = file.readlines()` or `data = file.read()`, you are limited to files that fit in memory. Generator-based streaming removes that limitation entirely — Python file objects are themselves iterators, and `for line in file` reads one line from the OS buffer per iteration, not the entire file.

**Early termination** is equally significant. When searching for the first N matches in a large file, a generator pipeline stops reading the moment the consumer breaks. If the first 3 errors are in the first 1000 lines of a 10-million-line file, only 1000 lines are read from disk. The `with` statement's `__exit__` closes the file handle, `close()` propagates through the generator chain, and no I/O is wasted on the remaining 9.999 million lines. This is structurally impossible with eager approaches like `readlines()`, which must read every byte before returning.

Generator file streaming **composes naturally** with the pipeline pattern. You can chain `read_lines()` → `parse_json()` → `filter()` → `transform()` → `write_output()`, and the entire pipeline operates in O(1) memory regardless of file size. Each line flows through all stages before the next line is read. This is how production ETL systems process terabyte-scale datasets on machines with gigabytes of RAM — and it is the same principle behind every streaming database cursor and cloud storage SDK.

## What Just Happened

The animation constructed a two-stage pipeline. `read_lines(filename)` opened the file inside a `with` statement and used `for line in file` to yield each line lazily — Python's file iterator calls `file.__next__()`, which reads one line from the OS read buffer, not the entire file. Each line was yielded after stripping the trailing newline.

`filter_errors(lines)` accepted the iterable from `read_lines()` and yielded only lines containing `"ERROR"`. Non-matching lines were consumed by `next()` inside the filter but never yielded onward — they were discarded immediately, keeping memory constant.

The consumer iterated with a `for` loop, counting matches. After finding the third error, it executed `break`. This triggered a cascade: `break` caused the `for` loop to call `close()` on `filter_errors`, which called `close()` on `read_lines`, which raised `GeneratorExit` inside the generator. The `with` statement's `__exit__` closed the file handle. The entire cleanup chain executed synchronously — no file handle leaked, no disk I/O was wasted.

## When to Use

- Processing log files of any size for error analysis, metric extraction, or audit trail queries
- Reading CSV or JSON-lines files where each line is an independent record processable in isolation
- ETL jobs that read file exports, transform records, and load into databases or output files
- Searching large files for patterns where early termination can skip the majority of the file
- Streaming files from cloud storage (S3, GCS, Azure Blob) where you want to avoid downloading the entire object before processing
- Processing files of unknown or unbounded size — streaming logs, growing files, pipe inputs from `stdin`

## When to Avoid

- When the file fits in memory and you need random access — loading into a list or DataFrame gives O(1) indexing that generators cannot provide
- When processing requires multiple passes — generators are single-pass and forward-only; use `readlines()` or a database for repeated iteration
- When the file format requires cross-line context — multi-line JSON objects, XML documents, or protocol buffers need a stateful parser, not line-by-line generators
- When you need sorted or grouped output requiring all data before producing results — sorting by a field demands buffering every record
- When using columnar formats like Parquet or ORC — these are designed for batch columnar access and libraries like PyArrow and Polars handle them more efficiently than line-by-line streaming
- When the file is binary — images, compressed archives, and serialized formats need `read(n)` with byte-level parsing, not line iteration
- When total file size is under 100MB and your machine has plenty of RAM — the simplicity of `readlines()` outweighs generator machinery for small files

## In Production

**boto3's S3 `StreamingBody`** returns a streaming HTTP response when you call `s3.get_object(Bucket, Key)['Body']`. The object is not downloaded entirely — bytes stream from S3 as you read. Wrapping `StreamingBody.iter_lines()` in a generator that yields decoded strings gives you O(1) memory processing of arbitrarily large S3 objects without touching local disk. This is how production data pipelines at companies running on AWS process multi-gigabyte log files, CSV exports, and JSON-lines dumps stored in S3 — the generator pulls lines on demand, and the HTTP connection streams bytes just-in-time.

**clickhouse-connect's streaming query interface** returns results as a generator of row blocks rather than materializing the full result set. `client.query_row_block_stream()` yields blocks of rows lazily, each block containing a configurable number of rows (typically a few thousand). The generator pulls the next block from the ClickHouse server over HTTP only when the consumer calls `next()`. This enables processing billions of analytical rows in constant memory — the Python client never holds more than one block, and the ClickHouse server streams result chunks on demand through its HTTP chunked transfer encoding.

**Apache Arrow's IPC streaming format** is purpose-built for this pattern. `pyarrow.ipc.open_stream(source).iter_batches()` returns an iterator that reads and deserializes one `RecordBatch` per `next()` call, keeping memory proportional to batch size rather than total file size. DuckDB uses Arrow IPC to stream results to Python, Polars reads Arrow streams via `pl.read_ipc_stream()`, and Pandas accepts Arrow batches through `pa.RecordBatch.to_pandas()`. The entire Arrow ecosystem is designed around incremental batch-level I/O — the exact same pull-based streaming that Python generators provide at the line level.

**Pandas `read_csv(chunksize=N)`** returns a `TextFileReader` that yields DataFrames of N rows each. Processing a 50GB CSV with `for chunk in pd.read_csv("huge.csv", chunksize=10_000)` uses memory proportional to 10,000 rows, not the file. This is the most common entry point for Python developers encountering generator-style file streaming. The OpenAI and Anthropic Python SDKs apply the identical pattern to LLM responses — `client.chat.completions.create(stream=True)` returns an iterator that yields token chunks as they arrive over the wire, and `break` from the loop closes the HTTP connection immediately.
