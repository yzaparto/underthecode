## Introduction

When you send the same prompt to multiple LLM providers, you do not want to wait for all of them. You want the fastest response and you want to cancel the rest. `asyncio.wait()` with `return_when=asyncio.FIRST_COMPLETED` returns as soon as ANY task finishes, giving you two sets: `done` (completed tasks) and `pending` (still running). Grab the winner, cancel the rest.

This animation schedules three concurrent LLM calls: GPT-4 (3s), Claude (1s), and Gemini (2s). Claude responds first while the others are still mid-call. We take Claude's response as the winner and cancel GPT-4 and Gemini — their IO cards disappear as cancellation takes effect.

The total latency is 1 second — the fastest model's response time — instead of 3 seconds if we had waited for all of them. The cancelled tasks release their resources immediately, and no API credits are wasted on responses we will never use.

## Why This Matters

Different LLM providers have wildly different latencies that vary by the minute. GPT-4 might respond in 500ms one moment and 5 seconds the next depending on load, region, and prompt complexity. Racing them guarantees you always get the fastest available response regardless of which provider happens to be quickest right now.

This pattern also implements fallback without added latency. The traditional approach is sequential: try GPT-4 first, wait for it to fail or timeout, then try Claude, wait again, then try Gemini. Each failure adds its full timeout to the total latency. Racing starts all three simultaneously and takes whichever responds first — turning a 15-second sequential fallback chain into a 1-second parallel race.

In production systems serving real users, this latency difference is enormous. A chatbot that responds in 1 second feels instant. The same chatbot responding in 5 seconds feels broken. Racing providers is the simplest way to guarantee consistently low latency without depending on any single provider's reliability.

## When to Use This Pattern

- Multi-model LLM racing where you send the same prompt to GPT-4, Claude, and Gemini and take the fastest response
- Parallel health checks that report the first failure immediately using `FIRST_EXCEPTION` instead of waiting for all
- Redundant requests to multiple backend servers for reliability where any single response is sufficient
- Search federation querying Google, Bing, and a vector database simultaneously and displaying the first results
- Speculative execution trying multiple algorithmic approaches concurrently and using the first result
- Failover without latency penalty where backup providers run simultaneously instead of sequentially

## What Just Happened

All three calls — GPT-4 (3s), Claude (1s), Gemini (2s) — started concurrently at time zero. After 1 second, Claude's call completed. `asyncio.wait()` returned immediately with Claude's task in the `done` set and GPT-4 and Gemini in the `pending` set, still running their 3s and 2s sleeps.

We extracted Claude's result as the winner. Then we iterated over the `pending` set and called `task.cancel()` on both GPT-4 and Gemini. Their IO cards disappeared from the animation as cancellation interrupted their `await` points.

Total elapsed time: 1 second — the latency of the fastest model. Without racing, waiting for all three with `gather()` would have taken 3 seconds. Without concurrency, calling them sequentially would have taken 6 seconds. The race saved 2 to 5 seconds depending on the alternative approach.

## Keep in Mind

- `asyncio.wait()` requires Task objects, not bare coroutines — wrap coroutines with `asyncio.create_task()` first
- The `done` set may contain more than one task if multiple tasks finish in the same event loop iteration
- `return_when` has three options: `FIRST_COMPLETED`, `FIRST_EXCEPTION`, and `ALL_COMPLETED` for different use cases
- Cancelled tasks raise `CancelledError` if you `await` them after cancellation — handle this in cleanup
- `wait()` does NOT cancel pending tasks automatically — you must iterate and cancel them yourself
- Unlike `gather()`, results are returned as sets which are unordered — do not rely on position

## Common Pitfalls

- Forgetting to cancel pending tasks after getting the winner, which leaves them running and wasting API credits and compute
- Not awaiting cancelled tasks after cancellation — best practice is `await asyncio.gather(*pending, return_exceptions=True)`
- Using bare coroutines instead of wrapping them in Tasks first, which is deprecated since Python 3.11
- Assuming the same model always wins the race, when in reality latencies vary constantly — build model-agnostic code
- Racing non-idempotent operations where all models might create side effects before the losers are cancelled

## Where to Incorporate This

- Multi-provider LLM routing for lowest latency in the style of OpenRouter or custom API gateways
- Redundant API gateways across geographic regions where you use whichever region responds fastest
- Search federation across multiple backends with progressive result display showing the first available results
- DNS-style resolution querying multiple upstream servers and using the first valid response
- Health monitoring with immediate first-failure alerting using `FIRST_EXCEPTION` to catch problems early
- Speculative ML inference trying multiple model sizes or strategies and returning the first acceptable result

## Related Patterns

- `as_completed()` processes ALL results in completion order without stopping after the first one
- `gather()` waits for everything and returns results in input order regardless of completion order
- Cancellation and `shield()` for protecting critical tasks from the cancel wave after the race ends
- `asyncio.timeout()` to add a deadline to the entire race so it fails fast if no provider responds in time
- `TaskGroup` which cancels all remaining tasks on ANY failure rather than on first success
