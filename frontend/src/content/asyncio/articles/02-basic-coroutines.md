## The Concept

PEP 492 introduced `async def` and `await` as first-class syntax in Python 3.5, creating a clear distinction between regular functions and coroutines. A coroutine function declared with `async def` does not execute its body when called — it returns a **coroutine object**, a lazy handle that must be driven by an event loop or an `await` expression. This is analogous to how calling a generator function returns a generator iterator rather than running the function body.

The critical misconception is that `async` and `await` keywords automatically produce concurrency. They do not. These keywords are a **capability** — they allow a function to yield control back to the event loop at `await` points. But if you only ever have one coroutine in flight at a time, yielding control is meaningless because there is nothing else for the event loop to run. Concurrency requires multiple tasks scheduled simultaneously, which is what `create_task()` provides in the next animation.

## Introduction

This animation uses `async def` and `await asyncio.sleep()` to simulate two LLM calls, but awaits them one at a time. First it awaits GPT-4 for 1 second, waits for it to complete, then awaits Claude for 2 seconds. The event loop is running, but it only ever has one coroutine to work with at any given moment. Total execution time is still 3 seconds — identical to the synchronous version. The code looks async but behaves synchronously.

## Why This Matters

The number one asyncio mistake is rewriting synchronous code with `async def` and `await`, seeing no performance improvement, and concluding that asyncio does not work. The problem is not asyncio — it is that sequential awaits produce sequential execution. The event loop can only multiplex when it has multiple tasks scheduled simultaneously, and a bare `await coroutine()` both starts the coroutine and blocks until it completes.

Understanding the coroutine object model prevents this mistake. When you write `result = await call_llm("gpt-4")`, Python creates the coroutine object, hands it to the event loop, and suspends the calling coroutine until the awaited one finishes. Only then does execution continue to the next line. The event loop had the ability to run other work during that `await`, but you gave it nothing else to run.

This distinction between **capability** and **utilization** is fundamental. `async def` gives a function the capability to cooperate with the event loop. `await` gives the event loop an opportunity to switch tasks. But opportunity without alternatives is just sequential execution with extra syntax. The fix — `create_task()` — comes in the next animation, and it works precisely because it registers multiple coroutines with the event loop before any of them are awaited.

## What Just Happened

The code awaited `call_llm("gpt-4")` first. The event loop ran that single coroutine, which called `await asyncio.sleep(1)`. At that `await` point, the coroutine yielded control back to the loop — but the loop had no other tasks to run. It simply waited for the 1-second timer to expire, then resumed the coroutine.

After GPT-4 completed, the code moved to the next line and awaited `call_llm("claude")`. Again, the event loop ran a single coroutine for 2 seconds with nothing else to interleave. The total time was `1 + 2 = 3` seconds — the sum, not the max. The event loop was present but idle, like having a highway with only one car on it.

## When to Use

- Ordered LLM chains where you must summarize before translating the summary
- Database migration steps that must execute in a specific DDL sequence
- Authentication flows where you verify a token before loading the user profile
- Sequential data pipelines where each transformation consumes the previous result
- Step-by-step validation chains where early failure should prevent later operations
- Any workflow where operation B genuinely depends on the result of operation A
- Prototyping async code before adding concurrency with `create_task()`

## When to Avoid

- Independent LLM calls that can run concurrently — use `create_task()` or `gather()`
- Parallel API requests to different services with no data dependency between them
- Fan-out operations like sending notifications to multiple channels simultaneously
- Fetching data from multiple microservices to build a composite response
- Any set of I/O operations where none depends on the result of another
- Bulk database reads from independent tables that can be queried concurrently
- Health checks across multiple services that should not wait on each other

## In Production

The OpenAI Python SDK provides both synchronous (`openai.OpenAI`) and async (`openai.AsyncOpenAI`) clients. The async client uses `httpx.AsyncClient` internally, but if you call `await client.chat.completions.create()` for model A and then `await client.chat.completions.create()` for model B sequentially, you get exactly the pattern this animation shows — two round-trips to the OpenAI API serialized end-to-end. The async client only delivers its concurrency benefit when multiple requests are in flight via `create_task()` or `gather()`.

SQLAlchemy's async engine (`create_async_engine`) demonstrates this distinction clearly. A single `await session.execute(query)` yields control to the event loop, but if you have no other tasks scheduled, you are just awaiting one query at a time with extra syntax overhead compared to the synchronous `Session.execute()`. SQLAlchemy's async mode only pays off when multiple database operations are overlapped — for instance, querying a user's profile and their permissions in parallel via `asyncio.gather()`.

LangChain's async interface (`achain.ainvoke()`) hits this pattern constantly. A typical LangChain pipeline calls an LLM, then a retriever, then another LLM — each step depends on the previous result. These sequential awaits are correct and necessary because the data flows linearly. The async syntax is still valuable here because it allows the web server's event loop to handle other HTTP requests while this particular chain awaits its LLM calls, even though the chain itself is internally sequential.

gRPC's async Python client (`grpc.aio`) generates async stubs where each RPC call returns an awaitable. Developers migrating from synchronous gRPC often rewrite `stub.GetUser(request)` as `await stub.GetUser(request)` and expect a speedup. Without concurrent tasks, they get the same sequential behavior. The gRPC async channel's advantage only materializes when multiple RPCs are in flight simultaneously — for example, fetching user data from the user service while concurrently fetching orders from the order service.
