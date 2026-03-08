## The Concept

**PEP 343** (Python 2.5, 2006) introduced the `with` statement and the context manager protocol (`__enter__` / `__exit__`), but the real breakthrough was `contextlib.contextmanager` — a decorator that turns a generator with a single `yield` into a fully compliant context manager using the `try`/`yield`/`finally` pattern. Before this, writing a context manager required a class with two dunder methods, which was verbose enough that developers routinely skipped resource cleanup.

The insight was that generators already had exactly the right structure. Code before `yield` is setup (`__enter__`). The yielded value becomes the `as` target. Code after `yield` is teardown (`__exit__`). Wrapping the `yield` in `try`/`finally` guarantees teardown runs even if the `with` block raises. The `@contextmanager` decorator bridges the iterator protocol and the context manager protocol, translating `yield` suspension into `__enter__`/`__exit__` lifecycle automatically.

This pattern became foundational. SQLAlchemy sessions, FastAPI request-scoped dependencies, pytest `yield` fixtures, database transactions, lock acquisition, temporary file management — all built on generators-as-context-managers. **PEP 3156** later introduced `@asynccontextmanager` for the async equivalent. The mental model: a generator with one `yield` is a function with a pause button. Press play — setup runs. Pause at `yield` — your code runs with the resource. Press play again — cleanup runs. `finally` guarantees the second press always happens.

## Introduction

This animation shows the `@contextmanager` decorator transforming a generator into a context manager. The generator opens a database connection, yields it to the `with` block, and closes it in the `finally` clause. The animation walks through each phase: setup code executes and the generator suspends at `yield`, the `with` block body runs using the yielded resource, and cleanup runs unconditionally — whether the block completed normally or raised an exception. This is the pattern that eliminates an entire category of resource leak bugs by making correct cleanup structurally unavoidable.

## Why This Matters

Resource leaks are among the most common production bugs and the hardest to reproduce. A database connection not returned to the pool works fine with 5 concurrent users in development and causes **connection pool exhaustion** under production load with 500. A file handle not closed works fine on Linux with a default 1024 `ulimit` and fails in a containerized deployment with lower limits. These bugs pass every test and only manifest under load.

`@contextmanager` makes correct resource management the **path of least resistance**. Setup and cleanup live in the same function, separated only by `yield`, so the developer sees both halves in one glance. The `try`/`finally` guarantees cleanup runs on normal exit, on exception, on `break` from a loop, on `return` from the enclosing function — there is no code path that skips it. And because the generator is a regular function, you can parameterize it, pass arguments, and reuse it across your entire codebase.

The pattern also **composes cleanly**. Nested `with` statements run each context manager's cleanup in reverse order. `contextlib.ExitStack` manages a dynamic number of context managers. `@asynccontextmanager` provides the async equivalent for `async with` blocks. The generator's single-`yield` constraint is what makes this safe — the decorator enforces exactly one yield and raises `RuntimeError` otherwise, preventing the ambiguity of multi-yield context managers.

## What Just Happened

The animation walked through three phases. First, the `with` statement called `__enter__()` on the decorated context manager, which internally called `next()` on the generator. This advanced execution from the top of the function to the `yield` statement, running all setup code — opening the database connection. The yielded value (the connection) was bound to the `as` variable.

Second, the `with` block body executed. The generator was suspended at `yield`, parked on the heap exactly like any paused generator. The connection was alive and usable. The generator did not know or care what the `with` block did with it.

Third, the `with` block completed and `__exit__()` was called. This resumed the generator past `yield`. Because the code used `try`/`finally`, the `finally` block executed unconditionally, closing the connection. If an exception had occurred in the `with` block, it would have been thrown into the generator at the `yield` point via `throw()`, caught by the `try`/`finally`, and cleanup would have run before the exception propagated to the caller.

## When to Use

- Database connection and session management where connections must be returned to the pool regardless of success or failure
- File handle lifecycle ensuring files are closed after operations complete, even on exceptions
- Lock acquisition and release where holding a lock beyond its needed scope causes deadlocks or starvation
- Transaction management that commits on success and rolls back on exception within a single scope
- Temporary state changes — environment variables, working directories, global configuration — that must be restored after the block
- Test fixture setup and teardown where resources created for a test must be cleaned up unconditionally
- Timing and profiling contexts that record start time before `yield` and compute elapsed time after

## When to Avoid

- When the resource needs no cleanup — not everything benefits from context management, and wrapping pure computations adds ceremony
- When setup and teardown live in different scopes or different functions — the generator must yield exactly once, so split lifecycles do not fit
- When you need to yield multiple times — that is a regular generator, not a context manager; the decorator raises `RuntimeError` on a second yield
- When the resource lifecycle spans multiple `with` blocks — use explicit open/close or `ExitStack` for resources outliving a single scope
- When async cleanup is needed in sync code — use `@asynccontextmanager` inside `async def` functions, not the sync version which blocks the event loop
- When the class-based protocol is clearer — resources with complex state machines or reentrant usage may be better served by explicit `__enter__`/`__exit__` methods
- When the context manager will be subclassed — generators cannot be meaningfully subclassed; use a class-based context manager for inheritance hierarchies

## In Production

**FastAPI's dependency injection system** uses `@contextmanager` and `@asynccontextmanager` as its primary mechanism for request-scoped resources. A dependency function that `yield`s a database session gives FastAPI the session for the request handler's lifetime, and cleanup runs automatically after the response is sent — even if the handler raises an HTTP exception or an unhandled error. This is how FastAPI achieves zero-boilerplate connection management across hundreds of endpoints: each dependency is a generator context manager, and the framework's dependency resolver calls `next()` during request setup and `close()` (or `throw()`) during teardown. The entire request lifecycle — session creation, handler execution, commit-or-rollback, session close — is orchestrated by the generator protocol.

**SQLAlchemy's `Session.begin()` and `sessionmaker` context managers** use the same `try`/`yield`/`finally` structure internally. Entering the context creates a transaction, the yielded session is used for queries and mutations, and exiting either commits (on success) or rolls back (on exception). The `scoped_session` registry adds thread-local scoping on top. When FastAPI or Flask-SQLAlchemy provides a session dependency, it is a `@contextmanager` generator that wraps `Session.begin()` — two layers of generator-based context management composing cleanly. This pattern ensures that no request ever leaks a database transaction, even under concurrent load with hundreds of in-flight requests.

**pytest's `yield` fixtures** are context managers in disguise. A fixture function that yields provides the resource to the test, and all code after `yield` runs as teardown — regardless of whether the test passed, failed, or raised an unexpected exception. pytest's fixture system internally treats `yield` fixtures identically to `@contextmanager` generators: it calls `next()` to get the fixture value, runs the test, then calls `close()` (propagating any test exception via `throw()`). This is how pytest manages test databases, temporary directories, mock HTTP servers, Docker containers, and any other test infrastructure requiring deterministic cleanup. The `autouse=True` and scope parameters (`session`, `module`, `function`) control when the generator's setup and teardown phases execute, but the underlying mechanism is always generator suspension and resumption.

**Python's standard library** is built on this pattern far beyond `open()`. `tempfile.TemporaryDirectory()`, `unittest.mock.patch()`, `decimal.localcontext()`, `warnings.catch_warnings()`, and `contextlib.suppress()` are all context managers — many implemented as `@contextmanager` generators internally. The `contextlib.ExitStack` class extends the pattern to dynamic resource management, where you register an arbitrary number of context managers at runtime and they all clean up in LIFO order. Kubernetes client libraries, boto3's session management, and SQLAlchemy's engine disposal all use `ExitStack` for managing pools of resources whose count is not known at code-writing time.
