## The Concept

PEP 342 (2005, Python 2.5) is the moment generators transcended simple iteration and became coroutines. Before PEP 342, generators were one-way channels: they could yield values out, but the caller had no way to send values back in. The generator was a producer; the consumer could only pull. PEP 342 added `send()`, `throw()`, and `close()` — turning generators into bidirectional communication channels capable of receiving input, handling exceptions, and performing cleanup.

The `send()` method is the centerpiece of this transformation. It resumes the generator and simultaneously injects a value that becomes the result of the `yield` expression inside the generator. Where `next(gen)` resumes and ignores the `yield` expression's value (implicitly sending `None`), `gen.send(value)` resumes and delivers `value` to the point where the generator is suspended. The `yield` keyword now serves dual duty: it both produces a value out and receives a value in. This duality — `received = yield produced` — is the syntactic foundation of coroutines.

This matters historically because Python's entire async ecosystem grew from this root. Guido van Rossum's `asyncio` was built on `yield from`-based coroutines, which were themselves built on PEP 342's `send()`. When you write `result = await some_coroutine()` in modern Python, the `await` keyword is syntactic sugar over `yield from`, which is syntactic sugar over repeated `send()` calls through a chain of generators. PEP 492 (Python 3.5) introduced `async def` and `await` as dedicated syntax, but the underlying machinery remained: coroutines are generators that receive values via `send()`. The mental model is a telephone call, not a one-way broadcast — either side can speak, and the `yield` point is where the two parties take turns.

## Introduction

This animation shows a generator that implements a running accumulator using two-way communication. The generator yields the current total, and the caller sends in the next number to add. Each `send()` both delivers a value into the generator (the number to accumulate) and receives a value back (the updated total). The first call must be `next(gen)` — the "priming" step — because the generator needs to advance to its first `yield` before it can receive a sent value.

The accumulator pattern demonstrates that generators with `send()` are stateful coroutines. They maintain internal state (the running total) across multiple interactions, accepting new input and producing updated output at each step. This is fundamentally different from calling a regular function repeatedly — the generator preserves its entire execution context between interactions, including local variables, loop counters, and try/except blocks.

## Why This Matters

The `send()` method transforms generators from data sources into interactive computational agents. A generator with `send()` can implement running averages, finite state machines, parsers, accumulators, and feedback loops — any computation that needs to maintain state across a series of inputs and outputs. Each interaction is a single `send()`/`yield` round-trip, with the generator preserving all context between rounds.

This bidirectional capability is what made generators the foundation of Python's coroutine model. In `asyncio`, when a coroutine `await`s an I/O operation, the event loop receives a future object from the coroutine's `yield` and later `send()`s the I/O result back when it is ready. The coroutine's `await` suspends it (yield), and the event loop's `send()` resumes it with the result. The entire async/await machinery is `send()` calls orchestrated by an event loop.

Beyond async, `send()` enables patterns that are impossible with regular functions. A streaming parser can `yield` partial results while the caller `send()`s more input data. A state machine can `yield` its current state while the caller `send()`s events that trigger transitions. A feedback controller can `yield` control signals while the environment `send()`s sensor readings. These are all instances of the same pattern: a long-lived computation that interacts with its environment through `yield`/`send()` round-trips.

## What Just Happened

The animation walked through four interactions with the accumulator generator. First, `next(gen)` primed the generator — it advanced execution from the top of the function to the first `yield`, which yielded the initial total of 0. At this point the generator was suspended at the `yield` expression, waiting for a value to be sent in. The priming step is mandatory because `send()` can only deliver a value to a `yield` expression, and the generator must first reach one.

Second, `gen.send(10)` resumed the generator. The value `10` became the result of the `yield` expression — assigned to the variable on the left side of `value = yield total`. The generator added 10 to the running total, looped back to `yield total`, and yielded the updated total of 10. It suspended again, waiting for the next `send()`.

Third, `gen.send(5)` repeated the cycle. The value `5` was delivered to `yield`, added to the total (now 15), and the new total was yielded back. Each round-trip was atomic from the caller's perspective: one `send()` call both delivered input and received output.

Fourth, `gen.send(None)` demonstrated the shutdown signal. The generator's loop checked for `None`, broke out, and the function returned. This raised `StopIteration` on the caller's side, signaling that the generator was exhausted. The `StopIteration` exception's `.value` attribute holds the generator's return value, if any.

## When to Use

- Running aggregations (sum, average, min, max) over a stream of values that arrive incrementally
- Finite state machines where external events drive state transitions and the machine reports its current state
- Interactive parsers that accept chunks of input and yield parsed tokens or AST nodes as they become available
- Feedback loops where the generator's output influences the caller's next input — PID controllers, adaptive algorithms
- Implementing coroutine-based concurrency frameworks or custom event loops that dispatch via `send()`
- Building accumulator patterns where you need to inject values into an ongoing computation
- Prototyping ReAct-style agent loops where the generator yields tool-call requests and receives tool results

## When to Avoid

- When a simple class or closure with state would be clearer — `send()` adds cognitive overhead that must be justified by the pattern
- When the computation is purely one-directional — if you never inject values, regular `yield` without `send()` is simpler
- When multiple consumers need to interact with the same generator — `send()` is not thread-safe and concurrent sends corrupt state
- When `async def`/`await` is available — modern asyncio code should use native coroutines, not `send()`-based generators, for async I/O
- When the interaction pattern is stateless request-response — a regular function is simpler and more testable
- When debugging simplicity matters — `send()`-based coroutines have non-obvious control flow harder to trace than class-based equivalents
- When the priming step adds confusion to the API — every consumer must remember `next(gen)` before `send()`, which is an easy source of `TypeError`

## In Production

**The `contextlib` module** uses PEP 342's coroutine machinery internally. `@contextmanager` wraps a generator that yields once — the code before `yield` is `__enter__`, the code after is `__exit__`. While `contextmanager` primarily uses `next()` and `throw()` rather than `send()` directly, the underlying infrastructure is the same PEP 342 protocol that `send()` introduced. Every `with` statement backed by a generator decorator exercises this machinery.

**Prompt engineering frameworks** like LangChain use coroutine patterns where an agent yields a tool-call request, the framework executes the tool and sends the result back, and the agent continues reasoning with the new information. This yield-send loop is the core interaction pattern for ReAct-style agents. The OpenAI Assistants API follows a conceptually identical pattern — the assistant yields a function call, the client executes it and submits the result, and the assistant resumes with the new context. The bidirectional nature of `send()` maps perfectly to this conversational agent architecture.

**CPython's own `asyncio` event loop** dispatches I/O results to coroutines via `send()`. When a socket becomes readable, the loop calls `coroutine.send(data)` to resume the awaiting coroutine with the received bytes. Trio, the structured concurrency library, was heavily influenced by PEP 342's coroutine model — its cancellation and checkpoint mechanisms trace directly back to `throw()` and `send()` on generator coroutines. NetworkX's graph algorithms use coroutine-style generators internally for depth-first search where the caller can influence traversal by sending pruning decisions back into the generator.
