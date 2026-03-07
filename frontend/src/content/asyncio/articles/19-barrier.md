## Introduction

In a multi-agent pipeline, sometimes all agents must finish phase 1 before ANY of them starts phase 2. A checkpoint before the next stage. `asyncio.Barrier(N)` blocks each arriving task until all N have arrived, then releases them all simultaneously. It is the "ready, set, GO" of async coordination — no one moves until everyone is ready.

Three research agents work at different speeds: Agent-A takes 1 second, Agent-B takes 2 seconds, and Agent-C takes 3 seconds. After each finishes its research phase, it calls `barrier.wait()`. The faster agents must wait for the slowest one. When all 3 arrive, they all proceed to the synthesis phase together.

Watch the barrier counter increment: 1/3, then 2/3, then 3/3 — and on the third arrival, all three agents are released simultaneously. The barrier enforces that no agent reads incomplete research data from another agent because synthesis cannot begin until every agent has finished researching.

## Why This Matters

Without barriers, fast agents start phase 2 while slow agents are still in phase 1. Agent-A finishes research in 1 second and immediately begins synthesis — but Agent-C has not finished researching yet. Agent-A reads Agent-C's incomplete data and produces a flawed summary. The pipeline produces wrong results silently.

Barriers enforce "everyone ready? GO." synchronization. Every agent has exactly the same view of the world when phase 2 begins. There is no partial state, no stale reads, no inconsistency. This guarantee is essential for any pipeline where phases depend on the complete output of the previous phase.

This pattern appears everywhere in parallel computing: MapReduce uses it between map and reduce phases, game engines use it to synchronize physics, AI, and rendering ticks, and distributed ML training uses it between forward pass, backward pass, and parameter averaging. The async version brings this coordination primitive to single-process concurrent code.

## When to Use This Pattern

- Multi-agent pipeline phase gates where all research must complete before any synthesis starts
- MapReduce synchronization where all mapper tasks must finish before the reduce phase begins
- Game simulation tick synchronization across physics, AI, and rendering subsystems
- Batch processing checkpoints where all items in a batch must be processed before the batch commits
- Training epoch boundaries in distributed ML where all workers must finish the batch before parameter averaging
- Collaborative document editing synchronization points where all editors must save before a snapshot is taken

## What Just Happened

Agent-A (1s research), Agent-B (2s research), and Agent-C (3s research) all started their research phase concurrently. Agent-A finished first at the 1-second mark and called `barrier.wait()` — it was now blocked, waiting for the others. Agent-B arrived at the 2-second mark — also blocked, 2/3 arrived.

When Agent-C finally arrived at the 3-second mark (3/3), the barrier released all three simultaneously. All agents entered the synthesis phase at the exact same moment, each running their 1-second synthesis in parallel and completing at the 4-second mark.

The barrier ensured that no agent started synthesis before all research was complete. Without it, Agent-A would have started synthesis at 1 second, reading empty or partial data from Agent-B and Agent-C. The total pipeline time was 4 seconds: 3 seconds for the slowest researcher plus 1 second for parallel synthesis.

## Keep in Mind

- `Barrier(N)` is cyclic — it automatically resets after N arrivals and can be reused for the next synchronization round
- `abort()` permanently breaks the barrier and all current and future waiters receive `BrokenBarrierError`
- `reset()` breaks the current wait cycle but allows the barrier to be reused for a new round
- There is no built-in timeout on `barrier.wait()` — wrap it with `asyncio.wait_for()` to add a deadline
- `asyncio.Barrier` requires Python 3.11 or later and is not available in earlier versions

## Common Pitfalls

- Setting N higher than the actual number of tasks that will arrive, which means the barrier never releases and all tasks deadlock
- Not handling `BrokenBarrierError` when another task calls `abort()` or `reset()` while others are waiting
- Forgetting that barriers are cyclic, so tasks looping back hit the barrier again for the next synchronization round
- Using barriers for tasks with unequal phase counts where some tasks skip phases, causing a count mismatch and deadlock
- Not adding timeouts to `barrier.wait()` calls, which means a single crashed task deadlocks all other tasks forever

## Where to Incorporate This

- Multi-agent research-then-synthesis pipelines where incomplete research produces incorrect or hallucinated summaries
- Distributed training epoch synchronization where all workers must finish the current batch before parameter averaging
- Batch ETL pipelines with strict phase ordering: extract all records, then transform all, then load all
- Game loop tick synchronization across multiple systems that must all complete the current frame before advancing
- Parallel test setup followed by test execution where all fixtures and test data must be ready before any test runs

## Related Patterns

- `Event` for one-to-many signaling without requiring all parties to arrive at the same point
- `TaskGroup` for structured task lifecycle management and automatic cleanup on failure
- `gather()` for collecting all results when you need final values but not a mid-pipeline sync point
- `Condition` for complex synchronization predicates beyond simple arrival counting
- MapReduce pattern where barriers implement the boundary between the map phase and the reduce phase
