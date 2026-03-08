## The Concept

The iterator protocol is Python's oldest and most pervasive abstraction for sequential access. Introduced in Python 2.2 via **PEP 234** (2001), it replaced the legacy sequence protocol — `__getitem__` with integer indices — with a cleaner two-method contract: `__iter__` returns an iterator, and `__next__` produces the next value or raises `StopIteration`. Every `for` loop, every list comprehension, every unpacking operation, every `*args` splat, and every call to `sum()`, `max()`, `sorted()`, and `''.join()` ultimately goes through this protocol. It is the **most called dunder method pair** in the language.

The key insight is the separation between **iterables** and **iterators**. An iterable is any object whose `__iter__` returns an iterator. An iterator is any object whose `__next__` returns successive values. A list is iterable — `iter([1,2,3])` produces a `list_iterator` that tracks position. You can create multiple independent iterators from one list. But a generator is both iterable and its own iterator — `iter(gen)` returns `gen` itself. This means generators are **single-pass**: once consumed, calling `iter()` again returns the same exhausted object, not a fresh one.

At the CPython level, `for x in obj` compiles to `GET_ITER` (invoking `obj.__iter__()`) followed by a loop of `FOR_ITER` opcodes (calling `iterator.__next__()` and catching `StopIteration`). The `FOR_ITER` opcode has a fast path specifically optimized for generators: it checks `gi_frame` and resumes the generator frame directly, bypassing the general `tp_iternext` slot lookup. This is why generators in `for` loops are faster than custom iterator classes with equivalent logic — CPython special-cases them in the eval loop.

## Introduction

This animation shows what Python actually does when you write `for x in generator`. It reveals the three-step mechanical process: `iter(gen)` calls `__iter__()` to obtain an iterator, `__next__()` is called repeatedly to pull values, and `StopIteration` is raised to signal completion. Generators implement this protocol automatically — the `yield` keyword causes Python to generate the `__iter__` and `__next__` methods, which is why you never write them yourself for generator functions.

Understanding the protocol demystifies every iteration construct in Python. When you see `for x in something`, you know exactly what bytecode Python emits and what methods get called. When you see a `StopIteration` traceback leak from a generator, you understand why — something consumed `__next__()` outside a `for` loop without catching the exception.

## Why This Matters

The iterator protocol is the contract that makes Python's entire iteration ecosystem **composable**. `itertools.chain()` works because it calls `__next__()` on each sub-iterator in sequence. `zip()` works because it calls `__next__()` on each argument in lockstep. `sorted()` works because it exhausts `__next__()` into a temporary list and sorts it. None of these functions know or care whether their input is a list, a generator, a file, or a custom class — they only care that `__next__()` produces values and `StopIteration` signals the end.

For generators specifically, the protocol is what makes them **drop-in replacements** for lists in any iteration context. You can refactor `return [x*x for x in range(n)]` into a generator that `yield`s `x*x`, and every consumer — `for` loops, `sum()`, `list()`, tuple unpacking — continues to work unchanged. The protocol is the interface boundary that enables this substitution without touching calling code.

At a deeper level, this is Python's implementation of the **external iterator pattern**. The consumer controls the pace of iteration by deciding when to call `__next__()`. The producer responds on demand. This inversion of control is what enables lazy evaluation, early termination, and memory-efficient pipelines — the consumer pulls exactly as many values as it needs, and the producer never computes more.

## What Just Happened

The animation decomposed `for x in gen` into its three mechanical steps. First, Python called `iter(gen)`, which invoked `gen.__iter__()`. Because generators are their own iterators, this returned the **same** generator object — not a copy. This is the critical difference from containers like lists, where `iter(my_list)` returns a new `list_iterator` each time, allowing multiple independent traversals.

Second, Python called `__next__()` on the iterator repeatedly. Each call resumed the generator from its last `yield` point, executed forward to the next `yield`, and returned the yielded value. The generator's local variables, instruction pointer, and exception state were all preserved between calls — they live on the heap in the generator's frame object, not on the C stack.

Third, when the generator function reached its end — fell off the bottom or hit an explicit `return` — Python raised `StopIteration`. The `for` loop caught this exception silently and exited. This is not error handling — it is **the protocol**. `StopIteration` is the iterator's way of saying "I have no more values." The `next()` built-in is shorthand for `iterator.__next__()`, with the added convenience of a default parameter: `next(iterator, None)` returns `None` instead of raising. The `iter()` built-in also has a two-argument form — `iter(callable, sentinel)` — that creates an iterator from any callable, stopping when the sentinel is returned.

## When to Use

- Implementing custom iterable classes that need to work with `for` loops and all built-in consumers
- Building adapter layers between data sources (databases, files, APIs) and Python's iteration ecosystem
- Creating reusable iterator wrappers that add logging, filtering, or transformation around any iterable
- Writing framework code that accepts arbitrary iterables and must handle generators, lists, and custom classes uniformly
- Implementing `__iter__` on container classes to make them work with `for`, `in`, unpacking, and comprehensions
- Understanding why generators work everywhere lists do — and diagnosing when they don't (single-pass limitation)

## When to Avoid

- When a simple generator function achieves the same result — prefer `yield` over writing `__iter__`/`__next__` by hand
- When you need indexed access (`obj[i]`) — the iterator protocol is forward-only with no random access
- When you need to know the length before iterating — iterators have no `__len__`, and computing length consumes them
- When thread safety matters — the protocol has no built-in locking, so concurrent `__next__()` calls race
- When you need multiple passes — write a full iterable class where `__iter__` returns a new iterator each time, rather than using a generator
- When the abstraction adds complexity your team won't maintain — a plain list is clearer when the data is small and finite
- When you confuse iterable with iterator — a list is iterable but not an iterator; `iter(list)` gives the iterator

## In Production

**SQLAlchemy's `Result` object** implements the iterator protocol — `for row in result` invokes `__next__()` on an internal cursor wrapper, streaming rows from the database one at a time without loading the entire result set into memory. This is how applications iterate over millions of rows without crashing. Django's `QuerySet` follows the same contract: its `__iter__` triggers SQL evaluation lazily and returns a row iterator, enabling deferred database access in `for` loops. Both ORMs rely on the protocol to let application code remain agnostic about whether it's iterating a cached list or a live database cursor.

**Apache Arrow's `RecordBatchReader`** implements `__next__()` to yield one `RecordBatch` at a time from IPC streams or Parquet files. DuckDB's Python API returns result objects that implement the same protocol, allowing `for batch in result.fetch_record_batch(1000)` to stream results in fixed-size chunks. Polars' `scan_csv().collect(streaming=True)` uses the protocol internally to process CSV files in batches. All three libraries — Arrow, DuckDB, Polars — converge on `__iter__`/`__next__` as the universal interface for streaming columnar data through Python.

**gRPC streaming RPCs** return iterators where each `__next__()` reads and deserializes the next protobuf message from the network. Server-streaming calls are consumed with `for response in stub.ServerStreamingMethod(request)`, and the `for` loop handles connection teardown when `StopIteration` signals end-of-stream. The `csv.reader` object is one of Python's oldest protocol implementations — each `__next__()` reads and parses one line. From `pathlib.Path.iterdir()` to `os.scandir()` to `re.finditer()`, every iterable in the standard library and ecosystem speaks this same two-method contract.

**The OpenAI and Anthropic SDKs** both return iterators from their streaming endpoints. `for chunk in client.chat.completions.create(stream=True)` yields `ChatCompletionChunk` objects, and `for event in client.messages.stream()` yields `MessageStreamEvent` objects. Under the hood, both SDKs manage HTTP connections, SSE parsing, and JSON deserialization behind `__next__()`. The consumer never touches networking code — it just calls `next()` through the `for` loop. HuggingFace's `pipeline()` with `return_iterator=True` follows the identical pattern for local model inference, yielding results one at a time through the protocol.
