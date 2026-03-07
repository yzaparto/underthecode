## Introduction

Sometimes you MUST call blocking code — a synchronous LLM SDK, CPU-heavy embedding computation, legacy libraries that never got an async rewrite. The event loop cannot wait for these without freezing entirely. You need an escape hatch that lets blocking work happen somewhere else while the loop stays responsive.

This animation shows two escape hatches: `asyncio.to_thread()` wraps blocking calls in a thread so the event loop stays free, and `loop.run_in_executor()` with `ProcessPoolExecutor` runs work in a separate process that bypasses the GIL entirely. Both allow blocking operations to run concurrently with async code.

The key insight is that threads and processes serve different purposes. Threads share memory and the GIL, making them ideal for I/O-bound blocking calls. Processes get their own GIL and memory space, making them the right choice for CPU-bound work like embedding computation or tokenization.

## Why This Matters

Real code mixes sync and async. Not every library has an async version, and rewriting a synchronous SDK to be async is rarely worth the effort. `to_thread()` handles I/O-bound blocking like synchronous HTTP clients, file operations, and legacy database drivers. `ProcessPoolExecutor` handles CPU-bound work like embeddings, tokenization, and numerical computation.

Knowing which to use prevents both blocking and over-engineering. Using `ProcessPoolExecutor` for a simple file read is overkill — the overhead of spawning a process and serializing data dwarfs the I/O wait. Using `to_thread()` for CPU-heavy embedding computation gains nothing because the GIL still serializes CPU work across threads.

The event loop is single-threaded. Any blocking call on the main thread stalls everything — timers, other coroutines, incoming connections. `to_thread()` and `run_in_executor()` move the blocking call off the main thread so the loop can keep serving other work while it completes.

## When to Use This Pattern

- Wrapping synchronous LLM SDKs like OpenAI's sync client that lack native async support
- CPU-heavy embedding or tokenization work that would block the event loop for hundreds of milliseconds
- Legacy library calls that were written before asyncio existed and have no async equivalent
- File system operations like reading large files or writing logs synchronously
- Database drivers without async versions where the only option is a blocking cursor
- Subprocess commands and shell calls that need to run without freezing the loop

## What Just Happened

Both blocking calls ran concurrently because they happened outside the main thread. The event loop stayed responsive throughout, able to handle other coroutines while the blocking work completed in the background.

`to_thread()` used a thread pool worker from the default `ThreadPoolExecutor`. The blocking function ran in a separate OS thread, sharing memory with the main thread but releasing the GIL during I/O wait. The event loop polled for the thread's completion without blocking.

`ProcessPoolExecutor` spawned an OS process with its own Python interpreter and its own GIL. The function arguments were serialized with `pickle`, sent to the child process, executed there, and the result was pickled back. This is heavier than threading but provides true CPU parallelism.

## Keep in Mind

- `to_thread()` uses `ThreadPoolExecutor` under the hood — threads share the GIL, which is fine for I/O but limits CPU parallelism
- `ProcessPoolExecutor` spawns real OS processes with separate memory spaces and separate GILs
- `ProcessPoolExecutor` arguments and return values must be picklable — no lambdas, no open file handles, no database connections
- `to_thread()` is Python 3.9+ and is the recommended replacement for `loop.run_in_executor(None, func)`
- The default thread pool has `min(32, os.cpu_count() + 4)` workers — enough for most I/O-bound workloads
- Processes bypass the GIL for true CPU parallelism but have significant startup and communication overhead

## Common Pitfalls

- Using `ProcessPoolExecutor` for I/O-bound work when `to_thread()` would be simpler and faster
- Sharing mutable state across threads without locks — the GIL protects bytecode operations, not your application logic
- Forgetting the GIL limits CPU parallelism in threads — two CPU-bound threads do not run twice as fast
- Not limiting thread pool size in high-concurrency scenarios, which can exhaust system resources and file descriptors
- Passing unpicklable objects like database connections or open sockets to `ProcessPoolExecutor`
- Calling `to_thread()` on a function that itself uses asyncio — nested event loops will crash

## Where to Incorporate This

- Wrapping OpenAI's synchronous SDK when the async version is unavailable or unstable
- Computing sentence embeddings locally with libraries like `sentence-transformers` that are CPU-bound
- Reading and writing large files where synchronous I/O is the only option
- Calling subprocess commands like `ffmpeg` or `pandoc` that block until completion
- Legacy database queries using synchronous drivers like `psycopg2` before migrating to `asyncpg`
- Any blocking third-party API client that does not offer an async interface

## Related Patterns

- Animation 5 shows the blocking problem this solves — what happens when you call `time.sleep()` inside an async function
- `concurrent.futures` is the underlying thread and process pool API that asyncio builds on
- `asyncio.to_thread()` (Python 3.9+) is the recommended approach over `loop.run_in_executor(None, func)`
- Thread safety and asyncio locks are needed when threads share mutable state with coroutines
