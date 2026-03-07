## Introduction

This is the number one asyncio bug. The code looks identical to Animation 3 — it uses `async def`, wraps both calls with `create_task()`, and awaits both tasks. Everything appears correct. But inside `call_llm`, it uses `time.sleep()` instead of `await asyncio.sleep()`. That single change breaks all concurrency.

The event loop can only switch between tasks at `await` points. `time.sleep()` is a C-level function that freezes the entire thread. When GPT-4 calls `time.sleep(1)`, the event loop is frozen for that entire second. It cannot check on other tasks, cannot start Claude's request, cannot do anything at all.

The result is that both calls run sequentially despite all the correct async scaffolding being in place. Total time: 3 seconds. The concurrency primitives were set up perfectly, but one blocking call inside a coroutine nullified everything.

## Why This Matters

This mistake costs hours of debugging in real-world projects. Everything looks correct — the function is `async def`, `create_task()` is used, tasks are awaited. There are no error messages, no warnings, no exceptions. The only symptom is that the code is slower than expected.

In production, this manifests as an async web server that freezes for all connected users when one request makes a blocking call. A single `requests.post()` inside an `async def` handler can stall every concurrent connection because the event loop thread is frozen.

The insidious part is that blocking calls are everywhere in the Python ecosystem. Most HTTP libraries, database drivers, file operations, and third-party SDKs are synchronous by default. You must consciously choose async-compatible alternatives or wrap blocking calls with `asyncio.to_thread()`.

## When to Use This Pattern

- Invert this lesson — these are the patterns to watch out for and avoid
- `requests.post()` or `requests.get()` inside async code blocks the event loop
- `time.sleep()` in `async def` functions freezes the entire thread
- Synchronous file operations like `open()`, `read()`, and `write()` block during disk I/O
- Synchronous database drivers like `psycopg2` and `sqlite3` freeze the loop during queries
- CPU-heavy computation in async functions starves other tasks of execution time
- Any third-party SDK that does not natively support async will block when called

## What Just Happened

`time.sleep()` froze the event loop thread during GPT-4's call. For that entire second, the event loop was suspended at the C level. It could not check its task queue, could not start Claude's coroutine, and could not respond to any other events.

Claude's task sat in the Ready state the entire time GPT-4 was sleeping. After GPT-4's `time.sleep(1)` returned, Claude's coroutine finally got a chance to run — and immediately called `time.sleep(2)`, freezing the loop again for another 2 seconds.

The total time was 3 seconds — identical to the fully synchronous version. All the concurrency primitives were in place: `async def`, `create_task()`, proper `await` calls. But one blocking function call inside the coroutine body nullified every one of them.

## Keep in Mind

- The event loop runs on a single thread — any blocking call freezes everything including all other tasks
- `time.sleep()` is invisible to the event loop because it is a C-level block, not a Python-level `await`
- The event loop can only switch between tasks at `await` points — blocking calls have no `await` points
- This bug produces no errors, no warnings, and no exceptions — the only symptom is slowness
- Even `print()` can technically block if the output buffer is full
- Detect blocking calls in production by setting `loop.slow_callback_duration` to a threshold like 0.1 seconds

## Common Pitfalls

- Using the `requests` library instead of `aiohttp` or `httpx` for HTTP calls inside async code
- Synchronous file I/O with `open()` and `json.load()` — use `aiofiles` or wrap with `asyncio.to_thread()`
- Synchronous database drivers like `psycopg2` and `pymysql` — use `asyncpg` or `aiomysql` instead
- CPU-intensive computation in async functions that starves the event loop — use `asyncio.to_thread()` or `ProcessPoolExecutor`
- Third-party SDKs that internally use `requests` or other synchronous I/O without documenting it

## Where to Incorporate This

- Set `loop.slow_callback_duration = 0.1` in production to detect and log blocking calls
- Wrap legacy synchronous SDKs with `asyncio.to_thread()` to run them without blocking the loop
- Use `httpx.AsyncClient` or `aiohttp.ClientSession` for all HTTP requests in async code
- Use `ProcessPoolExecutor` via `loop.run_in_executor()` for CPU-bound work
- Use `aiosqlite` or `asyncpg` for all database access in async applications
- Audit your dependency tree for libraries that make blocking I/O calls internally

## Related Patterns

- `asyncio.to_thread()` is the direct fix for wrapping blocking calls in a background thread
- `loop.run_in_executor()` with `ProcessPoolExecutor` handles CPU-heavy work on separate processes
- Async HTTP libraries like `aiohttp` and `httpx` provide event-loop-friendly HTTP clients
- `loop.slow_callback_duration` is the diagnostic tool for finding blocking calls in production
- The concept of "async-safe" libraries means they never call blocking I/O on the event loop thread
