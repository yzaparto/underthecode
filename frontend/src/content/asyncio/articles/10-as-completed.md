## Introduction

`gather()` waits for everything and returns results together — you get nothing until the slowest task finishes. `as_completed()` flips this model entirely: it yields results one by one as they finish, **fastest first**. For user-facing applications, this means showing partial results immediately instead of forcing users to wait for the slowest operation.

This animation sends the same prompt to three agents with different response times. Instead of waiting 3 seconds for all three, the first result appears after just 1 second. Each subsequent result is displayed the moment it arrives, giving users progressive feedback while slower agents are still working.

The total wall-clock time is identical to `gather()` — all three agents run concurrently under both approaches. The difference is **perceived performance**: progressive delivery feels dramatically faster than a single delayed load, even when the total time is the same.

## Why This Matters

Users do not want to wait for the slowest agent. Showing the first model's response in 1 second while others are still thinking is the difference between an app that feels responsive and one that feels broken. Research on perceived performance consistently shows that progressive loading reduces user abandonment even when total completion time is unchanged.

`as_completed()` enables **streaming aggregation** — processing results as they arrive rather than batching them at the end. This matters beyond UI: in data pipelines, processing the first available result while others are in flight increases throughput. In health monitoring, the first failure detected is more actionable than waiting for all checks to complete. In search, the first relevant result from any backend can be displayed while deeper results are still being ranked.

The pattern also enables **early termination** strategies. If the first result from `as_completed()` is good enough, you can cancel the remaining tasks and return immediately. Combined with cancellation, `as_completed()` turns "run all, return all" into "run all, return first acceptable."

## What Just Happened

All three agents started concurrently at the same moment. Coder finished first at 1 second, then Reviewer at 2 seconds, then Researcher at 3 seconds. Each result was printed the moment it arrived — no waiting for the others.

Compared to `gather()`, which would have returned all three results together after 3 seconds, `as_completed()` gave us the first result after just 1 second. The user saw useful output **2 seconds earlier**, even though the total operation still took 3 seconds to fully complete.

The iterator yielded awaitables in **completion order**, not creation order. The first item yielded was the coder's result (fastest), not whichever coroutine was passed first to `as_completed()`. Each awaitable required an explicit `await` to retrieve the actual result value — the iterator yields futures, not raw results.

## When to Use

- Multi-model comparison UIs where showing the fastest LLM response first while slower models continue generating
- Parallel search across multiple backends — vector database, keyword search, knowledge graph — displaying results as each backend responds
- Progressive dashboard rendering where each widget populates independently as its data source returns
- Health check aggregation where reporting the first failure immediately is more useful than waiting for all checks
- Batch processing with live progress reporting where a progress bar updates as each task in a large batch completes
- Web scraping across multiple URLs where pages load at different speeds and results can be processed independently
- Fan-out API calls with early termination where the first acceptable result lets you cancel remaining in-flight requests

## When to Avoid

- When you need results in **input order** matching your coroutine list — use `gather()` which preserves creation order
- When you need **all** results before proceeding to the next step — `gather()` is simpler and communicates the intent more clearly
- When you only need the **single fastest** result — `asyncio.wait(FIRST_COMPLETED)` is purpose-built for that and cancels losers automatically
- Forgetting to `await` each item from the iterator — the iterator yields awaitables, not raw values, and skipping the await produces coroutine objects
- Losing track of which result belongs to which task — wrap coroutines to include identifying metadata in the return value
- Assuming `as_completed()` is **faster** than `gather()` — total wall-clock time is identical, only delivery order changes
- Using `as_completed()` without cancelling remaining tasks after getting a sufficient result, leaving unnecessary work running

## In Production

**LangChain**'s `RunnableParallel` with streaming uses `as_completed()` semantics to deliver sub-chain outputs progressively. When you stream from a parallel chain, each branch's output is yielded to the caller as it finishes rather than waiting for all branches. This powers comparison UIs where a user sees GPT-4's response streaming in while Claude's response is still generating — the frontend renders each response panel independently. Under the hood, LangChain wraps each branch in a task and iterates completions, emitting `on_chain_end` callbacks in completion order.

**httpx** uses `as_completed()` semantics internally for concurrent request dispatching in its `AsyncClient`. When making parallel requests with a connection pool, responses that complete earlier are available to the caller immediately without waiting for slower requests on the same pool. Production systems that fan out to multiple microservices — authentication, user profile, feature flags — use this pattern to begin rendering the page shell from the first response while slower services are still responding, reducing time-to-first-byte below the P99 of the slowest dependency.

**Prometheus** and **Grafana**'s data source proxy layers use completion-order processing when querying multiple backends. A single Grafana dashboard panel might query Prometheus, InfluxDB, and Elasticsearch simultaneously. The proxy returns partial results as each backend responds, allowing the frontend to begin rendering time-series data from the fastest backend. Panels with multiple data sources show partial data with loading indicators on pending sources — a direct application of the `as_completed()` pattern at the infrastructure level.

**Anthropic's batch API** processing tools use `as_completed()` for progress tracking on large batch jobs. When submitting thousands of classification or extraction prompts, the client library tracks completions as they arrive, updating progress metrics and writing results to storage incrementally. This prevents the failure mode where a 10,000-prompt batch completes 9,999 items and then a single timeout causes the entire result set to be delayed. Each completion is persisted independently, and the final aggregation step only needs to handle the stragglers.
