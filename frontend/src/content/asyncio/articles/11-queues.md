## Introduction

In a chatbot, user messages arrive faster than the agent can process them. An async queue buffers messages — the producer adds them, the consumer processes them independently. `asyncio.Queue` decouples these two sides, letting each run at its own pace. This is fundamental to scalable async architecture.

The producer-consumer pattern is one of the most important concurrency patterns in software engineering. The producer generates work items without caring how or when they are processed. The consumer pulls items from the queue and handles them without caring where they came from. The queue is the bridge between these two independent workflows.

This animation demonstrates the pattern with a chatbot scenario: three user messages are enqueued at 0.5-second intervals while a slower consumer processes each one in 1 second. The queue absorbs the speed mismatch, preventing dropped messages and blocking. A sentinel value (`None`) signals the consumer to shut down gracefully.

## Why This Matters

Without queues, you either drop messages (bad UX) or block the producer until the consumer catches up (slow UX). Queues provide backpressure (bounded `maxsize`), buffering, and clean separation of concerns. They are the backbone of every message-driven system — from chat applications to webhook processors to job schedulers.

In real-world systems, producers and consumers almost never run at the same speed. API requests arrive in bursts, database writes take variable time, and network latency is unpredictable. A queue smooths out these speed differences, letting each side operate at its natural pace without coupling them together.

Backpressure is the key concept here. When the queue has a `maxsize`, a fast producer is forced to slow down when the queue is full. This prevents memory exhaustion and creates a natural flow control mechanism. Without backpressure, an unbounded queue grows indefinitely under sustained load until your process runs out of memory.

## When to Use This Pattern

- Chat message buffering where user input arrives faster than processing can handle
- Webhook event processing where external services push events at unpredictable rates
- Job scheduling systems that need to decouple job submission from job execution
- Log aggregation pipelines collecting entries from multiple sources into a single processor
- Rate-controlled batch processing where items must be processed at a steady pace
- Multi-agent message passing where agents communicate through shared queues

## What Just Happened

The producer enqueued 3 messages at 0.5-second intervals while the consumer processed each one in 1 second. The queue buffered the speed difference — by the time the consumer finished message 1, messages 2 and 3 were already waiting in the queue.

When the producer sent `None` as a sentinel, the consumer knew to stop. Both the producer and consumer ran concurrently via `gather()`, each operating independently without direct coordination. The queue was the only shared state between them.

This pattern scales naturally. You can add more producers without changing the consumer, add more consumers without changing the producer, or adjust the queue size to tune backpressure — all without modifying any task logic.

## Keep in Mind

- `asyncio.Queue` is NOT thread-safe — use `janus` for mixed thread and async contexts
- `maxsize=0` means unlimited capacity with no backpressure, so memory can grow without bound
- `task_done()` must be called after each processed item for `join()` to work correctly
- `put()` blocks if the queue is full, which is the backpressure mechanism in action
- `get()` blocks if the queue is empty, suspending the consumer until work arrives
- The sentinel pattern (`None` to signal shutdown) is the standard way to stop consumers

## Common Pitfalls

- Unbounded queues (`maxsize=0`) causing memory exhaustion under sustained load
- Forgetting the sentinel or shutdown signal, causing the consumer to hang forever
- Using `queue.get()` without a timeout, which hangs indefinitely if the producer dies
- Mixing `asyncio.Queue` with `threading.Queue`, which are not compatible with each other
- Not calling `task_done()` when using `join()`, causing `join()` to block forever
- Putting the sentinel before all real messages are enqueued, causing premature shutdown

## Where to Incorporate This

- Chat message queues in chatbot backends to buffer user input during processing
- Webhook event processing pipelines that receive events from external services
- Multi-agent message passing systems where agents communicate asynchronously
- Log aggregation pipelines collecting entries from multiple async sources
- Rate-limited API call queues that throttle outbound requests to stay under quotas
- Background job scheduling where tasks are submitted and executed independently
- Email and notification queues that batch and send messages at controlled rates

## Related Patterns

- Semaphore for rate limiting without queuing, controlling concurrent access to resources (animation 12)
- Producer-consumer with `TaskGroup` for structured lifecycle management of workers
- `queue.shutdown()` in Python 3.13+ replaces the sentinel pattern with a cleaner API
- `asyncio.PriorityQueue` for priority-based processing where some items are more urgent
- Event-driven architecture patterns that use queues as the central message bus
