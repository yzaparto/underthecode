## Introduction

Synchronous execution is the default mode of Python. Code runs line by line, and the thread blocks on every I/O call until it completes. There is no mechanism to do anything else while waiting. This is how every Python script behaves unless you explicitly opt into concurrency.

This animation shows two `call_llm()` functions, each using `time.sleep()` to simulate a network request. The first call hits GPT-4 and takes 1 second. The second call hits Claude and takes 2 seconds. During each sleep, the thread is completely frozen — the CPU sits idle, unable to do any other work.

The total execution time is 3 seconds — the sum of both waits. This is the baseline that every subsequent animation improves upon. Understanding why it takes 3 seconds instead of 2 is the foundation for understanding asyncio.

## Why This Matters

Understanding blocking I/O is the prerequisite for understanding asyncio. You cannot appreciate what the event loop solves until you see what happens without it. Most real-world applications spend the vast majority of their time waiting on network requests, database queries, and file operations — not computing.

During `time.sleep()`, CPU utilization is effectively zero. The operating system has put the thread to sleep at the C level. No Python code can run, no other work can be scheduled, and no amount of clever architecture can reclaim that idle time within the same thread.

This 3-second baseline is the number we chip away at in later animations. When you see `create_task()` drop the total to 2 seconds, you will understand exactly where that 1 second went. Every optimization in asyncio is measured against this synchronous starting point.

## When to Use This Pattern

- Simple CLI scripts where execution speed is not a concern
- Operations with sequential dependencies where step N requires the output of step N-1
- Prototyping and exploring APIs before optimizing for performance
- One-off batch jobs that run infrequently and do not need to be fast
- Single-user desktop tools where only one person is waiting
- Pipeline stages where each step must complete before the next begins

## What Just Happened

Two `call_llm()` calls ran back-to-back. The first call blocked the thread for 1 second, then the second call blocked it for another 2 seconds. There was zero overlap between the two operations.

The total time was the sum of both calls: 1 + 2 = 3 seconds. The thread was idle during each `time.sleep()`, but because there was no mechanism to use that idle time, it was simply wasted.

The CPU could have started Claude's request while waiting for GPT-4's response. These two operations are completely independent — neither needs the other's result. They were serialized by accident, not by necessity.

## Keep in Mind

- `time.sleep()` is a C-level block that completely freezes the thread — Python cannot interrupt it
- CPU utilization during blocking I/O is effectively zero
- Synchronous code is the simplest to write, read, and debug
- Total execution time is always the SUM of all blocking operations
- Every I/O-bound program starts here — async is an optimization you add later
- The GIL is irrelevant in this scenario because the bottleneck is I/O wait, not CPU contention

## Common Pitfalls

- Using `time.sleep()` inside an `async def` function, which blocks the entire event loop
- Assuming synchronous code is always wrong — it is often the right choice for simple tasks
- Optimizing for concurrency before measuring whether the sequential version is too slow
- Writing sequential loops over independent API calls when they could run concurrently
- Confusing I/O wait time with CPU processing time — they are fundamentally different problems

## Where to Incorporate This

- Simple CLI scripts that call one API endpoint and print the result
- Batch data pipelines where each record is processed independently and speed is not critical
- Prototyping LLM prompts where you are iterating on the prompt, not the infrastructure
- Single-user desktop tools where the user expects to wait a moment for results
- Sequential data pipelines like summarize, then translate, then extract
- Test scripts where clarity and simplicity matter more than execution speed

## Related Patterns

- The next animation introduces `async def` and `await asyncio.sleep()` as the async equivalent
- `asyncio.create_task()` is what actually unlocks concurrent execution of independent operations
- `asyncio.to_thread()` bridges synchronous blocking code into the async world
- The `threading` module is the older pre-asyncio approach to concurrent I/O
