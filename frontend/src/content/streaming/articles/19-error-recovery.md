# Introduction

When processing a stream, you often want to handle errors gracefully rather than crashing the entire pipeline. By putting try/except inside the generator's loop, you can recover from errors and continue processing.

# Why This Matters

In real systems, things fail. Network requests time out. Files are missing. Data is malformed. A robust generator can note the error, yield an error indicator, and keep going.

# What Just Happened

The animation processed 3 URLs:

1. **good1**: Success → yielded data
2. **bad**: Raised `ConnectionError` → caught → yielded error message
3. **good2**: Success → yielded data

One failure didn't stop the whole pipeline. We got results for all 3 URLs, with clear indication of which failed.

# Keep in Mind

- Put try/except INSIDE the loop to continue after errors
- Decide how to communicate errors (yield error objects, log, etc.)
- Some errors shouldn't be recovered — let critical ones propagate

# Common Pitfalls

- **try/except around the loop** — One error stops everything
- **Swallowing errors silently** — At least log them!
- **Recovering from unrecoverable errors** — Know when to fail fast

# Where to Incorporate This

Use error recovery patterns for:

- Network operations (retries, fallbacks)
- Data processing with malformed records
- Multi-source aggregation (some sources may fail)
- Long-running pipelines that shouldn't stop for transient errors

# Related Patterns

- **throw() and close()** (Animation 11) — Injecting errors from outside
- **@contextmanager** (Animation 17) — Guaranteed cleanup on errors
