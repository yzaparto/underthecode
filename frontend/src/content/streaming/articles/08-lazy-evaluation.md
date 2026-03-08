## Introduction

This animation contrasts two evaluation strategies: eager and lazy. The eager path uses a list comprehension to compute every result upfront — all values are calculated and stored before the consumer sees any of them. The lazy path uses a generator to defer computation entirely — nothing runs until the consumer explicitly pulls a value with `next()` or `for`. The generator function body does not execute at creation time. It sits dormant, waiting for demand. If the consumer stops asking after three items, the remaining computations never happen.

## Why This Matters

Lazy evaluation transforms expensive operations from "pay for everything upfront" to "pay per item consumed." Consider a pipeline that fetches pages from a REST API, parses each response, filters for relevant records, and transforms the results. With eager evaluation, every page is fetched before any filtering happens. With lazy evaluation, each page is fetched, parsed, filtered, and transformed before the next page is even requested. If the first page contains enough results, the remaining API calls are never made.

This pay-per-use model is especially powerful when combined with early termination. Python's `any()`, `all()`, `next()`, `itertools.takewhile()`, and `for`-with-`break` all stop consuming the moment they have their answer. A lazy generator combined with `any()` can short-circuit after the first truthy value, regardless of whether the generator could produce a million more. An eager list would compute all million values before `any()` even begins.

At a deeper level, lazy evaluation is the foundation of Python's composition model for data pipelines. When you chain generators — `filtered = (x for x in transformed if x > 0)` feeding into `batched = itertools.batched(filtered, 100)` — no intermediate lists are created. Each value flows through the entire pipeline one at a time, on demand. This composability without materialization is what makes generator pipelines scale to datasets far larger than memory.

Haskell takes laziness to the extreme — every expression is lazy by default. Python is eager by default, which makes reasoning about side effects easier, but provides laziness opt-in through generators, `itertools`, and `map()`/`filter()`. This pragmatic middle ground gives you lazy evaluation exactly where you need it without the debugging complexity of pervasive laziness.

## What Just Happened

The animation ran both evaluation strategies on the same computation. The eager path — a list comprehension calling `expensive_task()` — immediately invoked the function for every item in the input. All five function calls happened in rapid succession, each result stored in the growing list. The consumer received the complete list only after all computation finished. Time-to-first-result was the time to compute **all** results.

The lazy path — a generator expression — created the generator object instantly with zero computation. The function body was suspended before its first line. When the consumer called `next()`, the generator woke up, executed `expensive_task()` for one item, yielded the result, and suspended again. Time-to-first-result was the time to compute **one** result.

The critical visual was the timing difference. With eager evaluation, the consumer waited for all five computations before seeing anything. With lazy evaluation, the consumer received the first result almost immediately, while the remaining four were computed incrementally as demanded. If the consumer had stopped after the second value via `break`, the lazy path would have skipped three computations entirely. The eager path would have already wasted the work.

## When to Use

- Pipelines where each stage is expensive (API calls, database queries, file I/O) and the consumer may not need all results
- Search operations where you need the first match from a large candidate space — `next(x for x in candidates if predicate(x))`
- Infinite or unbounded sequences like sensor streams, log tails, or event feeds that have no natural end
- Multi-stage data transformations where eager evaluation would create large intermediate lists at every stage
- Computations with side effects that should only execute when the result is actually needed, such as honoring API rate limits
- Building query-like interfaces where the user constructs a pipeline declaratively and execution is deferred until iteration
- Chained generators where composability without materialization keeps memory usage constant regardless of data volume

## When to Avoid

- When the consumer always needs every element — laziness adds per-item overhead from frame suspension without any benefit
- When you need to reuse the results — lazy generators are single-pass, so a second iteration produces nothing
- When the computation has time-sensitive side effects that must happen immediately regardless of consumption
- When debugging requires seeing all values at once — lazy pipelines are harder to inspect because values do not exist until requested
- When the producer is faster than the consumer and you want to pre-compute ahead — eager evaluation with buffering may reduce end-to-end latency
- When the total dataset is small — the overhead of generator frame creation and suspension exceeds the savings for tiny sequences
- When exceptions need to surface eagerly — errors inside lazy generators are deferred until the failing item is requested, potentially after partial results have been processed

## In Production

**Polars' lazy API** is built entirely around deferred evaluation. `lf = pl.scan_csv("big.csv").filter(pl.col("x") > 0).select("x", "y")` constructs a query plan without touching the file. Only when you call `.collect()` does Polars optimize the plan with predicate pushdown, projection pushdown, and common subexpression elimination before executing it. This lazy-then-optimize pattern is directly analogous to how generator pipelines defer computation, but Polars applies it at the query planner level with whole-program optimization that no eager system can match.

Python 3's own built-in `map()`, `filter()`, `zip()`, `range()`, and `enumerate()` are all lazy — they return iterators, not lists. This was a deliberate design change from Python 2, where `map()` returned a list. The standard library's `re.finditer()` is the lazy counterpart of `re.findall()`, yielding match objects one at a time instead of materializing a list of all matches. When scanning a 500 MB log file with millions of regex hits, the difference between `findall` and `finditer` is the difference between a multi-gigabyte allocation and constant memory.

**SQLAlchemy's Query object** is lazy — constructing `session.query(User).filter(User.active == True)` generates no SQL and makes no database call. SQL is emitted only when you iterate the query or call `.all()`. Django QuerySets follow the same deferred execution pattern: `User.objects.filter(active=True).order_by('name')` builds a query description lazily, executing only when results are consumed. The OpenAI Python SDK's streaming mode takes the same approach for network I/O — `client.chat.completions.create(stream=True)` returns immediately with a lazy iterator, and tokens are fetched from the network only as you iterate, keeping memory usage proportional to a single chunk rather than the full response.
