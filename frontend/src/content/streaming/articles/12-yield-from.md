## The Concept

PEP 380 (2009, accepted for Python 3.3) introduced `yield from` — a single syntactic construct that fundamentally changed what generators could do. Before PEP 380, delegating to a sub-generator required tedious boilerplate: a loop calling `next()`, forwarding `send()` values, re-raising `throw()` exceptions, handling `close()`, and capturing the sub-generator's return value from `StopIteration`. PEP 380 replaced all of that with two words. The delegating generator becomes transparent — the caller communicates directly with the sub-generator as if the middle layer did not exist.

Greg Ewing designed `yield from` specifically to enable coroutine delegation — the ability for one coroutine to call another and get back a result, exactly like a function call but with suspension points. Without `yield from`, composing coroutines required manually threading `send()` and `throw()` through every layer, which was error-prone and unreadable. With `yield from`, you could write `result = yield from sub_coroutine()` and it worked exactly like a function call, except the sub-coroutine could suspend and resume.

This is the direct ancestor of `await`. When Guido van Rossum created `asyncio` (PEP 3156, Python 3.4), the entire framework was built on `yield from`-based coroutines. You wrote `result = yield from asyncio.sleep(1)` to suspend for one second. PEP 492 (Python 3.5) introduced `async def` and `await` as dedicated syntax, but `await` is semantically identical to `yield from` — it delegates to a sub-coroutine, forwarding all protocol methods, and returns the sub-coroutine's result. The CPython implementation of `await` literally reuses the `yield from` opcode (`GET_YIELD_FROM_ITER` and `YIELD_FROM` bytecodes). Understanding `yield from` is understanding how `await` works under the hood. The mental model is a function call that can pause: regular function calls block until `f()` returns, while `result = yield from gen()` also "calls" `gen()` and gets its return value, but `gen()` can yield intermediate values through the outer generator while it runs.

## Introduction

This animation contrasts manual delegation with `yield from` delegation. In the manual version, the outer generator loops over the inner generator and yields each value — but this approach breaks `send()`, `throw()`, and `close()` forwarding, and cannot capture the inner generator's return value. In the `yield from` version, a single line replaces the loop and handles all protocol methods transparently. The inner generator yields A and B, the outer generator yields them through to the caller, and when the inner generator returns a result, it becomes the value of the `yield from` expression.

The key visual is the transparency: during `yield from`, the caller's `send()` and `throw()` calls pass directly through the outer generator to the inner generator. The outer generator is suspended at the `yield from` expression for the entire duration of the inner generator's execution. It only resumes when the inner generator is exhausted and returns.

## Why This Matters

Without `yield from`, generator composition is broken for bidirectional communication. A manual forwarding loop `for item in inner: yield item` only handles the forward direction — values yielded out. It silently drops `send()` values (the inner generator always receives `None`), does not forward `throw()` exceptions, and cannot capture the inner generator's `return` value. PEP 380 specifies exactly 11 edge cases that `yield from` handles correctly, including `close()` forwarding, `throw()` forwarding with fallback to `close()` if the inner generator does not handle the exception, and `StopIteration` value capture.

The composition guarantee matters for building layered abstractions. A middleware generator that wraps another generator — adding logging, retry logic, or transformation — must be transparent to the protocol. If the middleware breaks `send()` forwarding, every downstream generator that relies on `send()` silently fails. `yield from` makes middleware safe by delegating the entire protocol.

This is also why `asyncio` was possible. The event loop `send()`s I/O results to the outermost coroutine, and `yield from` chains ensure those results reach the innermost coroutine that is actually waiting for them. Without transparent forwarding through arbitrary nesting depth, the event loop would need to know the entire coroutine call stack — a fundamental scalability problem. `yield from` makes coroutine composition as transparent as function composition.

## What Just Happened

The animation showed two implementations side by side. The manual version defined `outer()` with a `for item in inner(): yield item` loop. This loop yielded A and B from `inner()`, but when the caller tried `gen.send(value)`, the sent value went to `outer()`'s `yield`, not to `inner()`'s `yield`. The inner generator always received `None`. The inner generator's `return "done"` was silently lost — `StopIteration("done")` was raised and consumed by the for loop without the outer generator ever seeing it.

The `yield from` version defined `outer()` with `result = yield from inner()`. During iteration, every `next()` and `send()` call passed through `outer()` directly to `inner()`. When the caller called `gen.send(value)`, the value arrived at `inner()`'s `yield` expression. When `inner()` returned `"done"`, `StopIteration("done")` was caught by the `yield from` machinery, and `"done"` became the value of `result` in `outer()`. The outer generator then continued with the captured result.

The critical difference is protocol transparency. `yield from` implements the full two-way communication channel between the caller and the innermost active generator, regardless of how many delegation layers exist between them.

## When to Use

- Decomposing large generators into sub-generators for modularity without breaking `send()`/`throw()`/`close()` protocol forwarding
- Recursive generators for tree traversals, filesystem walks, and nested structure flattening where each node delegates to its children
- Building generator middleware that wraps inner generators with logging, metrics, or transformation while preserving bidirectional communication
- Capturing the return value of a sub-generator when the computed result is meaningful beyond the yielded stream
- Coroutine delegation in legacy `asyncio` code (pre-3.5) where `yield from` serves as the `await` keyword
- Implementing generator-based state machines where sub-generators handle individual states and return transition signals
- Flattening nested iterables of arbitrary depth using recursive `yield from` on sub-iterables

## When to Avoid

- When the sub-iterable is not a generator and you do not need `send()`/`throw()` forwarding — `yield from list` works but offers no protocol benefit over a manual loop
- When you need to transform values between the inner and outer generator — `yield from` is transparent by design and cannot modify values in transit
- When you need to interleave values from multiple sub-generators — `yield from` fully exhausts one before moving to the next
- When using async generators in Python 3.5+ — use `await` instead; it is semantically identical but with better tooling and clearer intent
- When the delegation depth causes debugging confusion — deeply nested `yield from` chains can obscure tracebacks since intermediate generators are invisible
- When mixing `yield from` with regular `yield` in confusing ways — the full-exhaustion semantics can surprise readers expecting interleaved behavior
- When delegating to non-generator iterables and expecting `send()` to work — sending to `yield from [1, 2, 3]` raises `AttributeError` because lists lack `send()`

## In Production

**CPython's `asyncio` event loop** was built entirely on `yield from` coroutines in Python 3.4. Every `yield from asyncio.sleep(1)` suspended the coroutine and returned a `Future` to the event loop, which later called `future.set_result()` to resume the coroutine via `send()`. The `await` keyword in Python 3.5+ compiles to identical bytecode — `GET_YIELD_FROM_ITER` followed by `YIELD_FROM`. Every `await` call in modern Python is a `yield from` at the bytecode level, making this construct the invisible backbone of all async Python code.

The Python standard library and ecosystem use `yield from` extensively for recursive iteration. `pathlib.Path.rglob()` uses recursive `yield from` to walk directory trees. The `ast` module's tree walkers, `lxml`'s element iterators, and DuckDB's Python client all rely on `yield from` for recursive traversal of nested structures. The `itertools` recipes in the official documentation are built on `yield from` — `chain.from_iterable()` is conceptually `for it in iterables: yield from it`, delegating transparently to each sub-iterable in sequence. The `more-itertools` library uses `yield from` in over 40 functions including `flatten()`, `collapse()`, and `interleave_longest()`.

**FastAPI's dependency injection** resolves nested dependency chains using a generator-based system where `yield from` (via `contextlib` machinery) threads cleanup through multiple dependency layers. When a request handler depends on a database session that depends on a connection pool, each `yield`-based dependency delegates cleanup through the chain, ensuring connections are released in the correct reverse order. SQLAlchemy's session-scoped generators similarly rely on this delegation pattern — the transparent forwarding of `close()` through `yield from` chains is what guarantees database connections return to the pool even when multiple middleware layers sit between the request handler and the connection.
