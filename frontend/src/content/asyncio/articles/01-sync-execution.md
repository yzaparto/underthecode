## Introduction

This animation shows two sequential `call_llm()` functions using `time.sleep()` to simulate network requests. The first call hits GPT-4 and takes 1 second. The second call hits Claude and takes 2 seconds. During each sleep the thread is completely frozen — the CPU sits idle, unable to do any other work. Total execution time is 3 seconds: the sum of both waits. This is the baseline that every subsequent animation improves upon.

## Why This Matters

Synchronous execution is how every Python script behaves unless you explicitly opt into concurrency. Code runs line by line, and the thread blocks on every I/O call until it completes. There is no mechanism to start a second operation while the first one is in progress.

During `time.sleep()`, CPU utilization is effectively zero. The operating system suspends the thread at the C level via a syscall like `nanosleep()` on Linux or `Sleep()` on Windows. No Python bytecode executes, no callbacks fire, and no amount of clever architecture can reclaim that idle time within the same thread. The GIL is irrelevant here because the bottleneck is I/O wait, not CPU contention — even a GIL-free Python would still block for 3 seconds.

This 3-second baseline is the number we chip away at in later animations. When `create_task()` drops total time to 2 seconds, you will understand exactly where that saved second went. The insight is that GPT-4's 1-second wait and Claude's 2-second wait are completely independent — neither needs the other's result. They were serialized by accident, not by necessity. Every optimization in asyncio is measured against this synchronous starting point, and recognizing which operations are truly independent is the first step toward concurrency.

Most real-world applications spend the vast majority of their time waiting — on network requests, database queries, DNS resolution, TLS handshakes, file operations. A typical web request handler might spend 95% of its wallclock time in I/O wait. Synchronous code forces you to pay the full sum of all those waits even when they have no data dependency between them.

## What Just Happened

Two `call_llm()` calls ran back-to-back on a single thread. The first call invoked `time.sleep(1)`, which suspended the thread at the OS level for 1 second. Only after it returned did the second call begin, invoking `time.sleep(2)` for another 2 seconds. There was zero overlap between the two operations.

The total time was `1 + 2 = 3` seconds — the arithmetic sum. The thread was idle during each sleep, but because synchronous Python provides no mechanism to schedule other work during that idle time, it was simply wasted. The CPU could have started Claude's request while waiting for GPT-4's response, but `time.sleep()` gave it no opportunity to do so.

## When to Use

- Simple CLI scripts where execution speed is not a concern and clarity matters most
- Operations with strict sequential dependencies where step N requires the output of step N-1
- Prototyping and exploring APIs before optimizing for performance
- One-off batch jobs and cron tasks that run infrequently
- Single-user desktop tools where only one person is waiting for the result
- Pipeline stages like summarize-then-translate where ordering is semantically required
- Test scripts and debugging sessions where deterministic execution simplifies reasoning

## When to Avoid

- Web servers handling multiple concurrent users — each blocked thread stalls everyone
- Calling multiple independent LLM providers where responses can overlap
- Fan-out operations like sending notifications to email, SMS, and push simultaneously
- High-throughput data ingestion pipelines where I/O wait dominates wallclock time
- Any scenario where independent network calls can be overlapped for latency savings
- Interactive applications where blocking the main thread freezes the UI
- Microservice orchestrators that aggregate data from multiple downstream services

## In Production

FastAPI and Uvicorn expose the cost of synchronous code directly. Uvicorn runs a single-threaded asyncio event loop per worker. If a route handler calls `requests.get()` synchronously, that entire worker is blocked — every other in-flight request on that worker stalls until the blocking call returns. FastAPI explicitly warns against this in its documentation and provides `async def` handlers precisely to avoid it. The synchronous baseline you see in this animation is what happens inside every blocking route handler, multiplied by every concurrent user hitting that endpoint.

The OpenAI Python SDK and the Anthropic Python SDK both ship synchronous clients by default (`openai.OpenAI()` and `anthropic.Anthropic()`). When you call `client.chat.completions.create()` synchronously, the thread blocks for the entire LLM inference time — often 2-10 seconds for a single completion. In a web application serving 50 concurrent users, this means 50 threads all sitting idle waiting on network I/O, which is exactly the pattern this animation demonstrates at a small scale.

Celery task workers are a production-scale example of where synchronous execution is actually the correct choice. Each Celery worker process runs one task at a time, and the concurrency model is process-based rather than coroutine-based. A Celery task that calls `time.sleep()` or `requests.post()` blocks only its own worker process while other workers handle other tasks. The synchronous model works here because Celery achieves concurrency through multiple OS processes, not through an event loop — trading memory for simplicity.

Redis client libraries like `redis-py` operate synchronously by default with connection pooling. Each call to `r.get(key)` blocks until the response arrives, typically under 1ms on a local network. For simple caching patterns, the synchronous overhead is negligible and the code clarity benefit is substantial. It is only when you chain multiple independent Redis calls — or mix Redis calls with slower network I/O — that the synchronous cost becomes measurable and async alternatives like `redis.asyncio` become worthwhile.
