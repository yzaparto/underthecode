## Introduction

In a multi-agent system, agents often depend on shared resources — a knowledge base must be loaded, an index built, a connection established. `asyncio.Event` is the simplest coordination primitive: one task signals "ready" and ALL waiting tasks wake up simultaneously. No polling, no races, no wasted cycles.

The Event pattern solves a fundamental coordination problem: how do you make multiple tasks wait for a condition without busy-looping? The answer is `event.wait()`, which suspends the caller until another task calls `event.set()`. The waiting tasks consume zero CPU while suspended — they are parked in the event loop until the signal arrives.

This animation shows two agents (summarizer and translator) waiting for a knowledge base to be prepared. The `prepare_context` task loads the knowledge base over 2 seconds, then sets the event. Both agents wake up simultaneously and process in parallel. The event is the starting gun that coordinates their launch.

## Why This Matters

Without coordination, agents either poll repeatedly (wasting cycles and adding latency) or start before the resource is ready (crashing or producing garbage). `Event` gives you a clean, efficient signal: "the thing you need is ready, go." It is the async equivalent of a starting gun.

Polling is the naive alternative — check a flag in a loop with a small sleep between checks. This wastes CPU, adds latency equal to the sleep interval, and creates a tradeoff between responsiveness and resource usage. `Event.wait()` eliminates this tradeoff entirely. The wake-up is instant and costs nothing while waiting.

The one-to-many nature of `Event` is particularly powerful. A single `set()` call wakes up every waiter simultaneously. This is ideal for initialization gates where multiple consumers all depend on the same resource being ready. You do not need to notify each waiter individually.

## When to Use This Pattern

- Waiting for initialization to complete before processing begins
- Signaling that a shared resource like a database, model, or index is loaded and ready
- Coordinating agent startup sequences where some agents depend on others
- Implementing ready-checks for dependent services in a microservice architecture
- One-time setup gates that block all consumers until configuration is loaded
- Notification that configuration has been hot-reloaded and consumers should refresh

## What Just Happened

Both agents (summarizer and translator) called `event.wait()` and suspended — they could not proceed without the context. Meanwhile, `prepare_context` loaded the knowledge base for 2 seconds, then called `event.set()`. Both agents woke up simultaneously and processed in parallel for 1 second each.

Total execution time was 3 seconds: 2 seconds for preparation plus 1 second for parallel processing. Without the event, you would either process sequentially (4 seconds) or risk agents starting before the knowledge base is ready (crash or garbage output).

The event acted as a gate. Before `set()`, the gate was closed and all waiters were suspended. After `set()`, the gate opened and all waiters resumed. The event stayed set — any future call to `wait()` would return immediately without blocking.

## Keep in Mind

- `Event` is "sticky" — once set, all future `wait()` calls return immediately until you call `clear()`
- There is no built-in timeout — wrap with `asyncio.wait_for(event.wait(), timeout=5)` for deadlines
- It is one-to-many: one setter wakes all waiters simultaneously
- `asyncio.Event` is NOT the same as `threading.Event` — they are not interchangeable
- Setting the event before any waiters are registered is fine — they will see it when they call `wait()`
- `clear()` resets the event so it can be used again for a second signal cycle

## Common Pitfalls

- Forgetting `clear()` if you need to reuse the event for a second signal
- Using Event for one-to-one signaling when Queue or Future is more appropriate
- Not adding a timeout to `event.wait()`, which hangs forever if the setter crashes
- Confusing `asyncio.Event` with `threading.Event`, which causes bugs in async code
- Creating multiple events when a single shared event would be simpler and clearer
- Setting the event from a thread without using `loop.call_soon_threadsafe()`

## Where to Incorporate This

- Database connection pool ready signal before accepting queries
- ML model loading gate that blocks inference requests until the model is loaded
- Configuration hot-reload notification that tells consumers to refresh their state
- Multi-agent "all dependencies loaded" gate before starting the processing pipeline
- Health check readiness probes for Kubernetes-style orchestration
- Cache warming completion signal before routing traffic to a new instance
- Service discovery registration signal after all endpoints are bound and listening

## Related Patterns

- `Condition` for complex wait predicates beyond simple set/unset logic (animation 19)
- `Barrier` for mutual synchronization where all parties must arrive before any proceed
- `Queue` for one-to-one message passing between producer and consumer (animation 11)
- `Lock` for mutual exclusion where only one task can access a resource at a time (animation 16)
- `asyncio.Future` for one-shot result delivery where the waiter also receives a value
