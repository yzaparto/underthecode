## The Concept

**Communicating Sequential Processes** (CSP) is the idea that concurrent tasks should coordinate by passing messages through channels, not by sharing memory. Go's goroutines and channels are the most famous implementation, but Python's `asyncio.Queue` follows the same principle. Each task is an independent sequential process. The queue is the channel. Data flows in one direction: producer puts, consumer gets. Neither side knows or cares about the other's existence. This decoupling is what makes the pattern composable — you can swap producers, add consumers, or insert transformation stages without touching existing code. The CSP model eliminates an entire class of concurrency bugs because there is no shared mutable state to protect with locks.

## Introduction

In a chatbot, user messages arrive faster than the agent can process them. An **async queue** buffers messages — the producer adds them, the consumer processes them independently. `asyncio.Queue` decouples these two sides, letting each run at its own pace. The animation shows three user messages enqueued at 0.5-second intervals while a slower consumer processes each one in 1 second. A sentinel value (`None`) signals graceful shutdown.

## Why This Matters

Without queues, you either drop messages or block the producer until the consumer catches up. Both are unacceptable in production. Queues provide **backpressure** (bounded `maxsize`), **buffering**, and clean separation of concerns.

Producers and consumers almost never run at the same speed. API requests arrive in bursts, database writes take variable time, and network latency is unpredictable. A queue smooths out these speed differences, letting each side operate at its natural pace. When the queue has a `maxsize`, a fast producer is forced to `await put()` when full — this prevents memory exhaustion and creates natural flow control. An unbounded queue (`maxsize=0`) grows indefinitely under sustained load until your process is OOM-killed.

The real power is **fan-out and fan-in**. Multiple producers can feed one queue. Multiple consumers can drain it. You scale each side independently. Add three consumers and throughput triples with zero code changes to the producer. This is why every serious message-driven system — from webhook processors to job schedulers to chat backends — is built on queues.

## What Just Happened

The producer enqueued 3 messages at 0.5-second intervals while the consumer processed each one in 1 second. The queue absorbed the speed mismatch — by the time the consumer finished message 1, messages 2 and 3 were already waiting. When the producer sent `None` as a sentinel, the consumer knew to stop. Both tasks ran concurrently via `gather()`, each operating independently. The queue was the only shared state between them. After the sentinel, the consumer exited its loop and both coroutines completed cleanly.

## When to Use

- Chat message buffering where user input arrives faster than LLM processing
- Webhook event pipelines receiving events from Stripe, GitHub, or Slack at unpredictable rates
- Job scheduling systems that decouple submission from execution across worker pools
- Log aggregation collecting entries from multiple async sources into a single writer
- Rate-controlled batch processing where items must flow at a steady pace
- Multi-agent message passing where agents communicate through shared channels
- ETL pipeline stages that transform and forward records between independent steps

## When to Avoid

- Simple scatter-gather where `asyncio.gather()` collects all results at once — no buffering needed
- Single-item request-response flows where a `Future` or direct `await` is simpler
- Purely CPU-bound work that should use `multiprocessing.Queue` or `concurrent.futures`
- When ordering does not matter and you just need concurrency limiting — use a `Semaphore` instead
- Situations where every message must be acknowledged persistently — use RabbitMQ or Redis Streams
- Fire-and-forget patterns where you genuinely do not care if items are lost
- When the producer and consumer are in different threads — `asyncio.Queue` is not thread-safe, use `janus`

## In Production

**Celery** uses an internal task queue (backed by RabbitMQ or Redis) to decouple task submission from execution. When you call `task.delay()`, the task is serialized and pushed onto a broker queue. Worker processes pull tasks off the queue at their own pace. The queue absorbs bursts of submissions and provides backpressure through broker-level flow control. Celery's prefetch multiplier controls how many tasks each worker pre-fetches — this is the `maxsize` equivalent at the distributed level.

**FastAPI** with Uvicorn handles HTTP request buffering through an implicit queue. Uvicorn accepts connections into a backlog queue while worker coroutines process them. When combined with background tasks via `BackgroundTasks` or Starlette's `BackgroundTask`, the pattern becomes explicit: the request handler enqueues work and returns immediately, while a background consumer processes it. This is how FastAPI-based webhook receivers handle bursty Stripe or GitHub event traffic without dropping requests.

**LangChain's** `AsyncCallbackHandler` uses an internal queue to stream LLM tokens from the model to the output handler. The model produces tokens asynchronously, the callback handler consumes them. This decoupling allows LangChain to support multiple simultaneous streaming chains without blocking. The queue also enables middleware-style token processing — logging, filtering, or transforming tokens before they reach the final consumer.

**RabbitMQ** client libraries like `aio-pika` expose the AMQP protocol through `asyncio.Queue`-compatible interfaces. Producers publish messages to exchanges, consumers bind queues and iterate with `async for`. The local `asyncio.Queue` inside the consumer prefetches messages from the broker, giving you the same producer-consumer pattern at both the local and distributed level.
