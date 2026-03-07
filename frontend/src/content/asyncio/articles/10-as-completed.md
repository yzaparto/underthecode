## Introduction

`gather()` waits for everything and returns results together — you get nothing until the slowest task finishes. `as_completed()` flips this model entirely: it yields results one by one as they finish, fastest first. For user-facing applications, this means showing partial results immediately instead of forcing users to wait for the slowest operation.

This animation sends the same prompt to three agents with different response times. Instead of waiting 3 seconds for all three, the first result appears after just 1 second. Each subsequent result is displayed the moment it arrives, giving users progressive feedback that something is happening.

The difference is not about speed — all three agents run concurrently under both `gather()` and `as_completed()`. The total wall-clock time is identical. The difference is about perceived performance and the ability to act on early results while later ones are still in flight.

## Why This Matters

Users do not want to wait for the slowest agent. Showing the first model's response in 1 second while others are still thinking dramatically improves perceived performance. Studies consistently show that progressive loading feels faster than a single delayed load, even when the total time is the same.

This is how search engines show results progressively — the first page appears while deeper results are still being ranked. It is how streaming dashboards update in real time — each data source populates its widget independently. The pattern is universal anywhere you have multiple concurrent data sources with variable latency.

For LLM applications specifically, `as_completed()` enables patterns like showing the fastest model's response while waiting for a more capable but slower model. Users get immediate feedback and can start reading while the system continues working in the background.

## When to Use This Pattern

- Multi-model comparison where showing the fastest response first improves user experience
- Web scraping across multiple URLs where pages load at different speeds and results can be processed independently
- Parallel search across multiple backends where displaying results as they arrive is more useful than waiting for all backends
- Progressive UI rendering where each section of a dashboard can populate independently
- Any scenario where partial results are valuable before all results are ready
- Batch processing with progress reporting where you want to show completion percentage as tasks finish

## What Just Happened

All three agents started concurrently at the same moment. Coder finished first at 1 second, then reviewer at 2 seconds, then researcher at 3 seconds. Each result was printed immediately when it arrived — no waiting for the others.

Compared to `gather()`, which would have returned all three results together after 3 seconds, `as_completed()` gave us the first result after just 1 second. The user saw useful output 2 seconds earlier, even though the total operation still took 3 seconds to fully complete.

The iterator yielded awaitables in completion order, not creation order. This means the first item yielded was the coder's result (fastest), not whichever coroutine was passed first to `as_completed()`. Each awaitable needed an explicit `await` to retrieve the actual result value.

## Keep in Mind

- `as_completed()` returns an iterator of awaitables — you still need to `await` each one to get the result
- Results come in completion order, not creation order — you cannot assume the first result corresponds to the first input
- All tasks still run to completion even after you process the first result — nothing is cancelled automatically
- You cannot easily map results back to their original task without extra bookkeeping like wrapping results in tagged tuples
- It works with both bare coroutines and `Task` objects — coroutines are internally wrapped in tasks
- The iterator is asynchronous — use `for coro in asyncio.as_completed(tasks)` with `await` inside the loop body

## Common Pitfalls

- Assuming results come in creation order — use `gather()` if you need ordered results that match your input list
- Forgetting to `await` each item from the iterator — the iterator yields coroutines, not raw values
- Not cancelling remaining tasks if you only need the first result — use `wait(FIRST_COMPLETED)` for that pattern instead
- Losing track of which result belongs to which task — wrap your coroutines to include identifying information in the return value
- Treating `as_completed()` as faster than `gather()` — the total time is the same, only the order of result delivery changes
- Using `as_completed()` when you actually need all results before proceeding — `gather()` is simpler for that case

## Where to Incorporate This

- Multi-LLM response comparison where showing the fastest answer while others load improves user experience
- Progressive search result rendering across multiple backends like web search, vector database, and knowledge graph
- Parallel health checks where reporting the first failure immediately is more useful than waiting for all checks
- Streaming dashboard updates from multiple data sources where each widget populates as its data arrives
- Batch processing with progress reporting where a progress bar updates as each task in a large batch completes

## Related Patterns

- `gather()` for ordered results when you need everything before proceeding (animation 7)
- `wait(FIRST_COMPLETED)` for a "first wins" pattern with automatic cancellation of remaining tasks (animation 20)
- Streaming with async generators for token-level progressive output within a single response (animation 13)
- Cancellation to stop remaining tasks after getting enough results from `as_completed()` (animation 8)
