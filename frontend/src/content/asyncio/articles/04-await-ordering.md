## Introduction

This animation uses the same `create_task()` pattern as the previous one, but with a twist: we await the slower task first. Claude (2 seconds) is awaited before GPT-4 (1 second). GPT-4 finishes while we are still waiting for Claude. Does this matter?

The question this animation answers is whether await order affects total execution time. Developers often worry about which task to await first, assuming it changes performance. This animation shows definitively that it does not.

Both tasks were created with `create_task()` and both started running immediately. The order in which you collect results has no effect on when the tasks themselves complete. Await order controls when your code sees results, not when the work finishes.

## Why This Matters

This clears up one of the most persistent misconceptions about asyncio. Await order controls when your code receives results, not when tasks complete their work. Tasks run independently on the event loop regardless of which one you happen to await first.

Developers waste time rearranging await statements trying to optimize performance. They assume awaiting the faster task first will somehow make things quicker. In reality, all tasks created with `create_task()` are already running — your await just picks up the result.

Understanding this distinction is critical for writing correct async code. It means you can await tasks in whatever order makes your code clearest without worrying about performance implications. The event loop handles scheduling; your job is to express the logic.

## When to Use This Pattern

- When you need results in a specific order regardless of which task completes first
- When building response objects that require data fields in a particular structure
- When the first result you need happens to come from the slower operation
- When you want to deeply understand the async execution model and prove await order is irrelevant to performance

## What Just Happened

GPT-4 finished at the 1-second mark, but the main coroutine was blocked on `await task2` (Claude). The result from GPT-4 was stored in the Task object, waiting to be collected. No work was lost — it was just not yet observed by the main code.

When Claude finished at the 2-second mark, the main coroutine resumed from `await task2` and received Claude's result. It then immediately hit `await task1`. Since GPT-4 had already finished 1 second ago, `await task1` returned instantly with zero additional wait.

The total time was still 2 seconds — identical to the previous animation where we awaited the faster task first. Await order did not change execution speed because both tasks were running concurrently the entire time.

## Keep in Mind

- Await order does not affect total execution time for tasks created with `create_task()`
- A task that completes before you await it simply holds its result until you collect it
- Awaiting an already-completed task returns instantly with zero wait
- Tasks run independently on the event loop regardless of which one you await first
- The event loop schedules tasks based on readiness, not on the order of your await statements

## Common Pitfalls

- Thinking await order changes execution speed and spending time rearranging await statements
- Overthinking which task to await first for performance reasons when it has no effect
- Forgetting that tasks run regardless of whether or when you await them
- Confusing the moment `await` returns with the moment the task actually completes its work

## Where to Incorporate This

- Building structured API responses where different fields come from different async sources
- Collecting model outputs for voting or ensemble comparisons across multiple LLM providers
- Waiting for the slowest model in a comparison setup where all models must finish
- Any scenario where you process results in a specific logical order regardless of completion order

## Related Patterns

- `asyncio.gather()` returns results in creation order automatically, abstracting away await ordering
- `asyncio.as_completed()` returns results in completion order, yielding the fastest result first
- `asyncio.wait()` with `FIRST_COMPLETED` returns as soon as any single task finishes
- Understanding this await-order distinction is key to choosing the right task coordination method
