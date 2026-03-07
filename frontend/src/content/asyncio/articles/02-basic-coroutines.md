## Introduction

Coroutines are functions defined with `async def`. Calling a coroutine function does not execute its body — it returns a coroutine object. You must `await` that object to actually run the code inside. This is a fundamental distinction that trips up every beginner.

This animation uses `async def` and `await asyncio.sleep()` to simulate two LLM calls, but it awaits them one at a time. First it awaits GPT-4 (1 second), waits for it to complete, then awaits Claude (2 seconds). The event loop is running, but it only ever has one task to work with at any given moment.

The total execution time is still 3 seconds. The code looks async, uses async keywords, and runs inside an event loop — but the behavior is identical to the synchronous version. This is the single most common asyncio misconception: `async`/`await` alone does not give you concurrency.

## Why This Matters

The number one misconception about asyncio is that `async` and `await` keywords automatically make code concurrent. They do not. If you await coroutines one at a time, they execute one at a time. The event loop can only multiplex when it has multiple tasks scheduled simultaneously.

Understanding this prevents the most common beginner mistake. Developers rewrite their synchronous code with `async def` and `await`, see no performance improvement, and conclude that asyncio does not work. The problem is not asyncio — it is that sequential awaits produce sequential execution.

This animation exists to make that lesson visceral. You see the timeline, you see the gaps, and you understand that the event loop needs multiple tasks to provide any benefit. The fix comes in the next animation with `create_task()`.

## When to Use This Pattern

- Ordered LLM chains where you must summarize before translating the summary
- Database migration steps that must execute in a specific sequence
- Authentication flows where you verify a token before loading the user profile
- Step-by-step data pipelines where each step consumes the output of the previous step
- Sequential validation chains where early failure should prevent later operations
- Any workflow where operation B genuinely depends on the result of operation A

## What Just Happened

Both LLM calls still ran sequentially. The code awaited task1 (GPT-4) first, which had to fully complete before task2 (Claude) could even begin. The event loop had only one active task at any point in time.

The event loop was running but had nothing to multiplex. With only one awaitable in flight at a time, the loop simply waited for it to finish, then moved to the next one. There was no opportunity to interleave work.

The total time was unchanged at 3 seconds. The async syntax added zero performance benefit because the execution pattern was still sequential. The event loop needs multiple concurrent tasks to provide any speedup.

## Keep in Mind

- Calling an `async def` function returns a coroutine object, not the result of executing the function
- `await` both starts execution of the coroutine and waits for it to complete
- Awaiting coroutines one at a time produces sequential execution identical to synchronous code
- The event loop can only help if it has multiple tasks to switch between at `await` points
- Coroutines only yield control back to the event loop when they hit an `await` expression

## Common Pitfalls

- Thinking that `async def` and `await` automatically make code concurrent
- Awaiting independent operations in a loop when they could run concurrently: `for model in models: await call(model)`
- Not wrapping independent coroutines with `create_task()` to enable concurrent scheduling
- Confusing coroutine creation (calling `async def`) with coroutine execution (using `await`)
- Rewriting sync code with async keywords and expecting automatic speedup

## Where to Incorporate This

- Ordered LLM chains where the output of one model feeds into the next prompt
- Database migrations with sequential DDL steps that must execute in order
- Authentication flows where you verify the token, then load user data, then check permissions
- Data pipelines where each transformation depends on the previous result

## Related Patterns

- `asyncio.create_task()` in the next animation is the fix for running independent operations concurrently
- `asyncio.gather()` provides concise syntax for creating and awaiting multiple tasks at once
- `asyncio.TaskGroup` (Python 3.11+) adds structured concurrency with automatic error handling
- Understanding the coroutine vs Task distinction is essential for effective asyncio usage
