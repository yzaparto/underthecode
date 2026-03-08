## Introduction

This is the number one asyncio bug. The code looks identical to the `create_task()` animation — it uses `async def`, wraps both calls with `create_task()`, and awaits both tasks. Everything appears correct. But inside `call_llm`, it uses `time.sleep()` instead of `await asyncio.sleep()`. That single change breaks all concurrency. The event loop can only switch tasks at `await` points, and `time.sleep()` is a C-level block that freezes the entire thread. Total time: 3 seconds, identical to fully synchronous execution.

## Why This Matters

This mistake costs hours of debugging in real-world projects. Everything looks correct — `async def`, `create_task()`, proper `await` calls. There are no error messages, no warnings, no exceptions. The only symptom is that the code is slower than expected. In production, this manifests as an async web server that freezes for all connected users when one request makes a blocking call.

The root cause is Python's cooperative scheduling model. The event loop runs on a single OS thread. When a coroutine is executing Python bytecode between `await` points, it has exclusive control of that thread. If it calls `time.sleep(1)`, the entire thread suspends at the C level — the event loop's scheduling code cannot run, the I/O selector cannot poll for ready sockets, and no other task can advance. The loop is not "busy" — it is genuinely frozen, unable to execute a single instruction.

The insidious part is that blocking calls are everywhere in the Python ecosystem. `requests.post()`, `open().read()`, `psycopg2.connect()`, `json.load()` on large files, `subprocess.run()`, even `print()` if the output buffer is full — all of these block the calling thread. Most Python libraries were written long before asyncio existed and use synchronous I/O internally. You must consciously choose async-compatible alternatives or wrap blocking calls with `asyncio.to_thread()` to keep the event loop responsive.

## What Just Happened

`time.sleep(1)` inside GPT-4's coroutine froze the event loop thread for 1 full second. The event loop was suspended at the OS level — it could not check its task queue, could not start Claude's coroutine, and could not respond to any other events. Claude's task sat in the Ready state the entire time.

After GPT-4's `time.sleep(1)` returned, the event loop regained control and gave Claude's task a turn. Claude's coroutine immediately called `time.sleep(2)`, freezing the loop for another 2 seconds. The total was `1 + 2 = 3` seconds — the sum, not the max. All the concurrency primitives were in place, but one blocking function call inside the coroutine body nullified every one of them. The event loop never got the `await`-point handoff it needed to interleave the tasks.

## When to Use

- Intentionally never — this is an anti-pattern to recognize and avoid
- As a diagnostic tool: if your async code runs at `sum` speed instead of `max`, you likely have a blocking call
- In debugging sessions to confirm that a suspected blocking call is indeed the bottleneck
- In educational settings to demonstrate why cooperative scheduling requires cooperation
- As a code review checklist item: search for `time.sleep`, `requests.`, `open(`, `subprocess.run` in async code
- When writing linter rules or static analysis checks for blocking calls inside `async def`
- In load tests to verify that your async server degrades gracefully under blocking-call pressure

## When to Avoid

- Every production `async def` function — never use `time.sleep()` in async code
- Any coroutine that runs on a shared event loop serving multiple clients
- FastAPI/Starlette/aiohttp route handlers where blocking stalls all concurrent connections
- Background tasks on the event loop that should not interfere with request handling
- WebSocket handlers where blocking causes message delivery delays to all connected clients
- Async worker loops that process items from queues and must remain responsive
- Any code path where the event loop's responsiveness matters to other concurrent tasks

## In Production

FastAPI and Uvicorn expose this bug brutally. Uvicorn runs one asyncio event loop per worker process. When a developer writes `async def get_user()` and calls `requests.get(auth_service_url)` inside it, that single blocking HTTP call freezes the entire worker. Every other in-flight request — potentially hundreds of concurrent WebSocket connections and HTTP handlers — stalls until `requests.get()` returns. The fix is `httpx.AsyncClient` for HTTP or `asyncio.to_thread(requests.get, url)` as a bridge. Uvicorn's `--loop uvloop` option makes the event loop faster but cannot fix blocking calls — it just makes the non-blocked portions run faster.

The `requests` library is the most common offender because it is the most popular Python HTTP client. Teams migrating to async often rewrite `def handler()` to `async def handler()` without replacing `requests` with `httpx` or `aiohttp`. The `requests` library uses `urllib3` under the hood, which calls `socket.recv()` — a blocking syscall. Even `requests.Session` with connection pooling blocks during each individual request. The Anthropic and OpenAI SDKs ship async clients specifically to avoid this: `anthropic.AsyncAnthropic` uses `httpx.AsyncClient` internally, ensuring that LLM API calls yield to the event loop during network I/O.

PostgreSQL access in async applications hits this pattern through driver choice. `psycopg2` uses libpq's synchronous API — every `cursor.execute()` blocks until the query result arrives. In an async FastAPI handler, this freezes the event loop for the entire query duration. `asyncpg` solves this by using libpq's asynchronous protocol, registering the socket with the event loop's I/O selector and yielding until data arrives. The performance difference is not just latency — it is the difference between serving one request at a time and serving thousands concurrently. SQLAlchemy's `create_async_engine()` uses `asyncpg` or `asyncmy` under the hood for exactly this reason.

Celery workers that spawn asyncio event loops internally can hit a subtle variant of this bug. A Celery task might use `asyncio.run()` to execute async code, but if any dependency in the call chain — a logging handler, a metrics reporter, a configuration loader — makes a synchronous HTTP call, the event loop inside that Celery task blocks. The `loop.slow_callback_duration` diagnostic (default 0.1 seconds) logs warnings when any callback takes too long, making it the primary tool for detecting blocking calls in production. Setting this threshold and monitoring the logs is the first step in any asyncio performance investigation.
