## Introduction

This animation shows a generator that fetches multiple URLs and handles failures gracefully. The generator processes three URLs: `good1` succeeds, `bad` raises a `ConnectionError`, and `good2` succeeds. Instead of crashing the entire pipeline on the failed URL, the generator catches the exception, yields an error indicator, and continues to the next URL. The consumer receives results for all three — two successes and one clearly marked failure.

The key structural decision is where the `try`/`except` goes. Placing it **inside** the `for` loop means each iteration is independently protected — a failure on one item does not affect subsequent items. Placing it outside the loop would mean one failure terminates the entire generator. This distinction is the difference between a resilient production pipeline and a fragile one.

## Why This Matters

In production systems, partial failure is the norm, not the exception. Network requests time out. DNS resolution fails intermittently. Third-party APIs return 500 errors. Data contains malformed records. Disks experience transient I/O errors. A pipeline that crashes on the first error and discards all remaining work is unacceptable when processing millions of items.

The error recovery pattern transforms a generator from a fragile all-or-nothing function into a **resilient stream processor**. The consumer receives a mix of successes and failures, and can decide how to handle each — retry failures, log them, route them to a dead-letter queue, or skip them. The critical property is that the generator keeps producing. One bad record does not poison the entire stream.

This maps directly to the "let it crash, but not the whole system" philosophy from Erlang's supervision trees. Individual items can fail. The pipeline itself must not. In distributed systems, this principle is applied at the service level with circuit breakers and bulkheads. In generator pipelines, it is applied at the item level with `try`/`except` inside the loop. The generator's execution frame survives the caught exception because the exception never propagates past the `except` block — it is handled locally, the error is yielded as a value, and the loop continues to the next iteration.

There is a critical design decision in **what** you yield on failure. Yielding a plain string like `"error"` is dangerous because the consumer cannot distinguish it from valid data. Production code uses typed error objects, `Result`/`Either` types, or tagged tuples like `("error", url, exception)` so the consumer can branch cleanly. The generator's job is to **surface** errors, not to decide policy — that belongs to the consumer.

Not all errors deserve recovery. A `ConnectionError` on one URL is transient — the next URL will likely work. But an `AuthenticationError` means every subsequent request will also fail. A generator that catches `AuthenticationError` and continues is wasting time and hiding a systemic failure. The rule of thumb: recover from **item-scoped** errors (bad data, transient network issues, malformed input), but propagate **session-scoped** errors (auth failures, schema mismatches, disk full) by re-raising them. The `except` block should be selective, not a blanket `except Exception`.

## What Just Happened

The animation processed three URLs through a generator with `try`/`except` inside its `for` loop. For the first URL (`good1`), the `fetch()` call succeeded, the generator yielded the data, and the consumer received it. No exception handling was triggered.

For the second URL (`bad`), the `fetch()` call raised a `ConnectionError`. The `except` block caught it. Instead of crashing, the generator yielded an error message — a string like `"Error fetching bad: ConnectionError"` — and the loop's next iteration began immediately. The generator's internal state was intact: local variables, loop counter, and try/except context all survived.

For the third URL (`good2`), the `fetch()` call succeeded normally. The generator yielded the data. The consumer received all three results: success, error, success. The pipeline processed every item despite one failure. The structural insight is that `try`/`except` inside the loop creates an **error boundary per iteration**. Each iteration is independently protected. This is fundamentally different from `try`/`except` around the entire loop, which would give you one chance to catch one error and then the generator would stop.

Notice that the generator's local variables — the loop variable, any accumulators, the URL list index — were completely unaffected by the caught exception. The `except` block ran, the `yield` delivered the error to the consumer, and the `for` loop advanced to the next iteration with all state intact. This is because a caught exception in Python unwinds the stack only to the `except` block, not to the generator's caller. The generator frame stays on the heap, and `next()` resumes it at the top of the loop as if nothing went wrong.

One subtle detail: logging inside the `except` block is essential. A generator that catches errors and yields them without logging creates invisible failure modes. When the consumer discards error results or processes them silently, the only record of the failure is in the yielded value — which may itself be discarded downstream. Always log caught exceptions with context (the input item, the exception type, the traceback) before yielding the error result. Production systems also track the **error rate** — if more than a configurable threshold of items fail (say 10%), the generator should raise rather than continue, because mass failures typically indicate a systemic issue that per-item recovery cannot fix.

## When to Use

- Web scraping pipelines that fetch hundreds of pages where individual pages may be 404, rate-limited, or malformed
- ETL jobs extracting from flaky upstream systems where transient network errors should not abort the entire job
- Data validation pipelines processing records from untrusted sources containing a mix of valid and invalid entries
- Multi-source data aggregation where some sources may be temporarily unavailable but others are fine
- API migration scripts moving records between systems where individual record failures should not block the batch
- Log processing where malformed log lines should be flagged but not halt processing of the remaining file
- File batch processing reading multiple files where some may be corrupted or have unexpected encodings

## When to Avoid

- When any single failure indicates a systemic problem — recovering from a database authentication failure is pointless if every subsequent query will also fail
- When item ordering and completeness guarantees are strict and recovering may violate transactional consistency
- When the error rate is expected to be very high — catching and continuing through thousands of errors is slower than fixing the root cause
- When the consumer cannot distinguish success from failure and silently yielded error markers look like valid data
- When the error should propagate to trigger retry logic at a higher level — catching it inside the generator hides it from orchestrators
- When debugging is the priority — error recovery can mask the root cause by continuing past the failure point
- When you would be catching `KeyboardInterrupt`, `SystemExit`, or `MemoryError` — these indicate the process should stop, not recover

## In Production

**Pandas' `read_csv(on_bad_lines='warn')`** implements exactly this pattern at the C parser level. Malformed CSV lines are logged and skipped rather than aborting the entire file parse. A 10GB CSV with 3 bad lines out of 100 million should not fail — it should process 99,999,997 lines and report the 3 problems. The `on_bad_lines` parameter was introduced in pandas 1.3 to replace the older `error_bad_lines` flag, giving three explicit modes: `'error'` (propagate), `'warn'` (log and skip), and `'skip'` (silent). This maps directly to the generator pattern where the `except` block chooses between raising, yielding-with-log, or silently continuing.

**FastAPI's exception handlers** implement this pattern at the request level. One request that raises `ValueError` returns a 422 to that client but does not crash the server or affect other concurrent requests. Each request is an independent error boundary — the same per-iteration protection as `try`/`except` inside a generator's loop. Custom exception handlers registered with `@app.exception_handler(CustomError)` let the application define recovery policy per error type, while the framework ensures one bad request never poisons the pipeline of other requests being served.

**Kafka consumers** with `enable.auto.commit=false` process each message in a try/except, committing the offset on success and sending failed messages to a dead-letter topic on failure. One poisonous message does not halt consumption of the entire partition. The dead-letter topic acts as the consumer's error channel — analogous to the generator yielding an error object instead of crashing. Operators can later inspect the dead-letter topic, fix the root cause, and replay the failed messages.

**The Anthropic Python SDK** handles transient `APIConnectionError` and `RateLimitError` with built-in retry logic during streaming. When a streaming connection drops mid-response, the SDK catches the error and reconnects transparently using the last received event ID. The consumer sees a continuous token stream even though the underlying HTTP connection failed and was re-established. This is per-chunk error recovery inside the SDK's internal iteration loop — the exact `try`/`except`-inside-the-loop pattern, applied to server-sent event parsing.

**Apache Arrow's CSV reader** provides `ConvertOptions` with null fallback for handling type conversion errors per cell. When a cell cannot be converted to the expected type, it is replaced with null instead of failing the entire batch. This is per-item error recovery at the columnar level — each cell is its own error boundary, and a malformed value in row 5,000 does not prevent the other 99,999 rows from loading cleanly.
