## Introduction

Streams encounter errors: network failures, malformed data, resource exhaustion. Error handling in generators requires wrapping iteration with try/except. A safe wrapper can catch errors from an inner generator, log them, and continue with fallback values, making the stream resilient.

This animation shows a risky generator that raises an error mid-stream and a safe wrapper that catches exceptions and substitutes fallback values. The stream continues despite the error, demonstrating graceful degradation.

## Why This Matters

Real-world streams are messy. Logs have corrupt lines, APIs return errors, data has invalid entries. Crashing on the first error is rarely acceptable. Streams need to handle errors gracefully: skip, log, retry, or substitute.

Error handling in generators is different from regular functions. The error occurs during iteration, potentially long after the generator was created. The wrapper pattern lets you add error handling without modifying the original generator.

Choosing between fail-fast and fail-safe is a design decision. Sometimes one bad item should stop everything (data integrity). Sometimes it should be skipped (best-effort processing). The wrapper pattern supports both.

## When to Use This Pattern

- Processing data with potential corrupt or malformed entries
- Network streams that might have transient errors
- Pipelines where partial results are better than no results
- Log processing where some lines might be unparseable
- API integrations where individual calls might fail
- Any stream that should continue despite occasional errors

## What Just Happened

The risky generator yielded items 0 and 1 successfully. On item 2, it raised `ValueError`. Without the wrapper, this would have crashed the entire iteration.

The safe wrapper caught the exception. Instead of propagating it, the wrapper logged the error and yielded "SKIPPED" as a fallback. The consumer received "SKIPPED" and could continue processing.

When the wrapper tried to get the next value, the inner generator was exhausted (errors in generators typically end them). `StopIteration` was raised and caught, ending the stream cleanly.

## Keep in Mind

- Errors in generators are raised during iteration, not at creation
- A wrapper generator can catch errors from an inner generator
- `StopIteration` means normal completion; other exceptions are errors
- The inner generator typically cannot continue after raising (it is exhausted)
- You can implement retry logic in the wrapper for transient errors
- Logging errors is essential for debugging production issues

## Common Pitfalls

- Catching too broadly and suppressing errors that should propagate
- Not logging caught errors, making debugging impossible
- Expecting generators to continue after raising (they usually cannot)
- Mixing error handling with business logic (keep them separate)
- Not considering whether fail-fast or fail-safe is appropriate

## Where to Incorporate This

- Data import pipelines with potentially invalid records
- Log processing with varied line formats
- API integration with retry logic
- File processing with encoding or format errors
- Network streams with transient failures
- Any production pipeline that must be robust

## Related Patterns

- `throw()` and `close()` (animation 10) for injecting errors
- `@contextmanager` (animation 13) for error handling in context managers
- Backpressure (animation 16) for handling overload errors
- Retry patterns with exponential backoff (not shown)
