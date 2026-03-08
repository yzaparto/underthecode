## Introduction

This animation schedules three concurrent LLM calls — GPT-4 (3s), Claude (1s), and Gemini (2s) — and uses `asyncio.wait(tasks, return_when=FIRST_COMPLETED)` to grab the fastest response. Claude finishes at 1 second. `wait()` returns immediately with two sets: `done` containing Claude's completed task and `pending` containing GPT-4 and Gemini, still running. We extract Claude's result as the winner, then iterate over `pending` and call `task.cancel()` on both losers. Their IO cards disappear as cancellation takes effect.

Total latency: 1 second — the fastest provider's response time. Without racing, `gather()` would have waited 3 seconds for GPT-4. Sequential fallback (try GPT-4, timeout, try Claude, timeout, try Gemini) could have taken 15+ seconds. The race eliminates provider latency variance entirely — you always get the fastest available response.

## Why This Matters

LLM provider latencies are wildly unpredictable. GPT-4 might respond in 500ms one moment and 5 seconds the next depending on load, region, prompt complexity, and whether the provider is experiencing a partial degradation. Hardcoding a single provider means your application inherits all of that variance. Racing multiple providers simultaneously guarantees you always get the fastest response available right now, regardless of which provider happens to be quickest.

This pattern also implements **fallback without added latency**. The traditional approach is sequential: try GPT-4, wait for it to fail or timeout (5 seconds), then try Claude, wait again (5 seconds), then try Gemini. Each failure adds its full timeout to the total latency. With `FIRST_COMPLETED`, all three start simultaneously — if GPT-4 is down, Claude's 1-second response arrives while GPT-4 is still timing out. The failure is invisible to the user because a healthy provider already responded.

The `done`/`pending` set decomposition is the key API design. Unlike `gather()` which returns results in input order, `wait()` separates completed from still-running tasks, giving you explicit control over what to do with the losers. Cancelling pending tasks is essential — without it, GPT-4 and Gemini continue running, consuming API credits and holding connections for responses you will never use.

## What Just Happened

All three calls started concurrently at time 0. After 1 second, Claude's call completed. The event loop detected a completed future in the wait set and returned control to the caller with Claude's task in the `done` set. GPT-4 (2 seconds remaining) and Gemini (1 second remaining) were placed in the `pending` set, still running.

We extracted Claude's result from the `done` set using `done.pop().result()`. Then we iterated over the `pending` set and called `task.cancel()` on both GPT-4 and Gemini. `CancelledError` was injected at their next `await` point, interrupting their simulated API calls. To ensure clean cancellation, we ran `await asyncio.gather(*pending, return_exceptions=True)`, which collected the `CancelledError` exceptions without propagating them.

Total elapsed time: 1 second. The cancelled tasks released their HTTP connections and memory immediately. No API credits were spent on GPT-4 or Gemini responses that would have been discarded. The race saved 2 seconds compared to `gather()` and up to 14 seconds compared to sequential fallback with 5-second timeouts.

## When to Use

- Multi-provider LLM racing where you send the same prompt to GPT-4, Claude, and Gemini and take the fastest
- Redundant requests to multiple backend replicas for latency hedging where any single response suffices
- Health check racing that reports the first failure immediately using `FIRST_EXCEPTION` mode
- Search federation querying multiple backends simultaneously and displaying the first available results
- CDN origin selection trying multiple origin servers and routing through whichever responds fastest
- DNS resolution against multiple upstream resolvers where the first valid response wins
- Speculative execution trying multiple algorithmic approaches and returning the first acceptable result

## When to Avoid

- When you need results from all providers — use `gather()` for consensus, voting, or aggregation patterns
- When the operation has side effects — cancelled tasks may have already triggered non-reversible actions
- When API billing charges per-request regardless of completion — racing 3 providers triples your cost
- When providers return meaningfully different results and the "fastest" is not equivalent to the "best"
- When the overhead of starting multiple requests exceeds the latency savings for short-lived operations
- When you need ordered results — `wait()` returns unordered sets, not indexed lists like `gather()`
- When a single provider is consistently fastest and racing adds complexity without measurable latency benefit

## In Production

**LLM routing services like OpenRouter and Martian** implement provider racing as a core feature. When a request comes in, the router dispatches it to multiple providers simultaneously and returns the first successful response. The router maintains per-provider latency histograms (P50, P95, P99) and uses them to decide which providers to include in each race. Providers with recent high error rates or latency spikes are excluded from the race set entirely. The `done`/`pending` decomposition maps directly to this architecture — `done.pop()` is the winning provider's response, and cancelling `pending` tasks is closing HTTP connections to the losing providers mid-stream. OpenRouter also implements **cost-aware racing** where cheaper providers are given a head start (started a few hundred milliseconds earlier) so they have a latency advantage, reducing cost while maintaining the latency guarantee.

**Cloudflare's Argo Smart Routing** and **AWS Global Accelerator** use a similar first-response-wins pattern at the network layer. When a client request arrives, it is forwarded simultaneously to multiple origin servers or edge locations. The first response to arrive is served to the client, and the other in-flight requests are dropped. This is `wait(FIRST_COMPLETED)` implemented in network infrastructure — the done set is the first origin to respond, and cancelling pending is dropping the TCP connections to slower origins. The latency savings compound with geographic distance, where a multi-origin race can shave hundreds of milliseconds by automatically selecting the geographically closest healthy origin.

**The httpx library's async transport** combined with `asyncio.wait()` is the standard building block for implementing provider racing in Python. Each provider call is wrapped in `asyncio.create_task()` with an `httpx.AsyncClient`, and `wait(return_when=FIRST_COMPLETED)` selects the winner. Cancelling pending tasks triggers httpx's connection cleanup — the HTTP/2 stream is reset with a RST_STREAM frame, the connection returns to the pool, and no further bytes are read from the socket. This clean cancellation is what makes the pattern practical — without it, cancelled requests would leak connections and exhaust the pool within minutes under load.

**Kubernetes readiness probe racing** uses a first-failure pattern with `FIRST_EXCEPTION`. The kubelet probes multiple endpoints (HTTP, TCP, gRPC) and if any probe fails, the pod is marked not-ready and removed from the Service's endpoint list. This is `wait(return_when=FIRST_EXCEPTION)` — the first failure immediately triggers action without waiting for all probes to complete. Production health check systems at companies like Netflix (Eureka) and HashiCorp (Consul) implement similar racing patterns where multiple health signals are evaluated concurrently and the first definitive signal — healthy or unhealthy — determines the instance's status.
