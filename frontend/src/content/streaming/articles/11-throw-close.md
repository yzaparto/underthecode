## Introduction

This animation shows the two remaining methods from PEP 342's coroutine toolkit: `throw()` and `close()`. Where `send()` injects values, `throw()` injects exceptions and `close()` triggers graceful termination. The animation demonstrates a worker generator processing tasks inside a `try`/`except`/`finally` structure. First, tasks flow normally via `send()`. Then `throw(ValueError)` injects an exception at the yield point — the generator catches it, logs recovery, and continues. Finally, `close()` raises `GeneratorExit`, triggering the `finally` block for resource cleanup. This three-phase lifecycle — operate, handle errors, clean up — is the pattern behind every robust generator-based system.

## Why This Matters

Without `throw()`, there is no way to notify a suspended generator of external failures. Consider a generator reading from a network socket — if the socket errors on the caller's side, the generator sits frozen at `yield` with no idea anything went wrong. `throw()` solves this by raising an exception at the exact suspension point, giving the generator a chance to handle it with standard `try`/`except` and full access to its local state.

Without `close()`, generators holding resources leak them. A generator that opens a database connection and yields rows cannot release that connection unless it is exhausted or explicitly closed. If the consumer `break`s early, the generator is abandoned while still holding the connection. `close()` raises `GeneratorExit` (which inherits from `BaseException`, not `Exception`), triggering `finally` blocks and context manager `__exit__` methods. Python calls `close()` during GC, but relying on GC for cleanup is fragile — especially in PyPy where timing is non-deterministic.

These methods are essential because `@contextmanager` depends on them entirely. When a `with` block exits normally, `contextmanager` calls `next()` to resume past the `yield`. When the block exits with an exception, it calls `throw()` to inject that exception into the generator. The entire context manager protocol for generators is built on these two primitives.

## What Just Happened

The animation walked through the complete lifecycle of a worker generator. Phase one showed normal operation: `next(gen)` advanced to the first `yield`, returning "Ready." Then `gen.send("task_1")` delivered a task — the value became the result of the `yield` expression, the generator processed it, looped back to `yield`, and produced its next status.

Phase two demonstrated `throw()`. The caller invoked `gen.throw(ValueError, "bad input")`, raising `ValueError("bad input")` at the exact suspension point. Because the generator had `try`/`except ValueError` wrapping the yield, it caught the exception, logged recovery, and continued to the next `yield`. The generator was not destroyed — it recovered and was ready for more work. If the generator had **not** caught the exception, it would have propagated back to the caller as if `throw()` itself raised it.

Phase three demonstrated `close()`. Calling `gen.close()` raised `GeneratorExit` inside the generator at the yield point. The `finally` block executed, performing cleanup. Critically, if the generator catches `GeneratorExit` and tries to `yield` again instead of returning, Python raises `RuntimeError` — a closed generator must not produce more values.

## When to Use

- Resource cleanup in generators holding file handles, database connections, or network sockets
- Error injection from external monitoring systems detecting failures the generator cannot see
- Testing generators by injecting specific exceptions to verify error handling paths
- Cancellation of long-running generator pipelines that need to release resources before stopping
- Implementing `@contextmanager` where `throw()` forwards with-block exceptions into the generator
- Building supervision trees where a parent generator signals errors to child generators via `throw()`
- Forwarding external cancellation signals through `yield from` delegation chains

## When to Avoid

- When the generator holds no resources and can be safely abandoned — GC will eventually call `close()` but there is nothing to clean up
- When a simple sentinel value via `send(None)` is sufficient to signal shutdown — `close()` is more forceful than necessary
- When you need the generator to return a final result on shutdown — `close()` raises `GeneratorExit` which prevents normal return values
- When the generator should not be able to suppress the error — `throw()` allows the generator to catch and recover, which may not be desired
- When working with `async def` generators — use `athrow()` and `aclose()` instead; the synchronous versions do not work on async generators
- When a bare `except Exception` in the generator accidentally catches `GeneratorExit` — this prevents `close()` from working and causes `RuntimeError`
- When the `finally` block itself performs I/O that could fail — an exception in `finally` propagates from the `close()` call, surprising callers

## In Production

SQLAlchemy's session management relies on `close()` to ensure database connections are returned to the pool when generator-based result streaming ends early. When you iterate a `Result` object with `yield_per()` and break out of the loop, Python calls `close()` on the generator, which triggers `finally` blocks that call `session.close()`, returning the connection to the pool. Without this mechanism, every early exit from a query result loop would leak a database connection — and under production load with hundreds of concurrent requests, pool exhaustion would crash the application within minutes.

The `contextlib.contextmanager` decorator is the most visible consumer of `throw()` and `close()` in the standard library. When a `with` block exits with an exception, `contextmanager.__exit__` calls `throw()` to inject that exception into the generator, allowing its except/finally blocks to handle cleanup. FastAPI's dependency injection system chains these — when a request handler depends on a database session that depends on a connection pool, each `yield`-based dependency's cleanup is triggered through `throw()`/`close()` in reverse order, ensuring connections are released even when handlers raise `HTTPException`.

gRPC Python server interceptors use `throw()` to inject cancellation exceptions into streaming response generators when clients disconnect. The server-side generator receives a `grpc.RpcError` via `throw()`, giving it a chance to clean up server-side resources — database cursors, temporary files, GPU allocations — before the RPC handler exits. The Anthropic Python SDK uses the same pattern internally: when a streaming connection drops during `client.messages.stream()`, the SDK's async generator receives a thrown `APIConnectionError` and performs reconnection logic transparently.

pytest fixtures with `yield` use the same `close()`/`throw()` mechanism under the hood. A fixture that yields a database connection has its post-yield cleanup code executed via `close()` on normal completion or `throw()` when the test fails. The fixture's `finally` block runs in both cases, ensuring connections, temporary files, and mock servers are torn down regardless of test outcome. Celery worker pools similarly use `close()` to clean up task generators during graceful shutdown — workers receive SIGTERM, which triggers `close()` on active task generators, running their cleanup before the process exits.
