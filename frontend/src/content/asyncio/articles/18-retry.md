## Introduction

This animation shows a `retry()` wrapper around a `call_llm("claude")` call that fails with `ConnectionError` on every attempt. Three attempts are made with exponential backoff between them: 1 second after attempt 1 (2^0), 2 seconds after attempt 2 (2^1). The IO cards show each attempt and the growing delay between them. After attempt 3, all retries are exhausted and the original exception is re-raised.

In a real scenario, the service would recover after 1 or 2 retries. The exponential growth ensures early retries happen quickly while later retries give increasingly troubled services more breathing room. The total elapsed time is 6 seconds: three 1-second calls plus 1-second and 2-second backoff delays.

## Why This Matters

Without retry, a single transient error fails the entire operation — even if the very next attempt would succeed. A 500ms network blip at 3 AM becomes a failed batch job, a lost customer request, or a broken pipeline. Retry turns transient failures into invisible hiccups that users never notice.

Without **backoff**, rapid retries overwhelm the service you depend on, making the problem worse. If an LLM provider returns 429 (rate limit), immediately retrying hammers it harder. Thousands of clients retrying simultaneously after an outage create a **thundering herd** that re-crashes the service the moment it recovers. Exponential backoff with **jitter** (`random.uniform(0, delay)`) spreads retry attempts across time, giving the service a gradual ramp-up instead of an instant spike.

The combination of retry count, backoff multiplier, maximum delay cap, and jitter gives fine-grained control over the tradeoff between **responsiveness** (how fast you recover from a transient error) and **politeness** (how much additional load you generate during an outage). Getting these parameters right is the difference between a system that self-heals and one that amplifies failures. A common production configuration is 3 retries, 1-second base delay, 2x multiplier, 60-second cap, and full jitter — this recovers from transient blips in 1-3 seconds while backing off to 60 seconds maximum during sustained outages.

## What Just Happened

Three attempts were made, each taking 1 second for the API call itself, and all three failed with `ConnectionError`. Between attempts, backoff delays grew exponentially: 1 second after attempt 1 (2^0), 2 seconds after attempt 2 (2^1). If there had been a fourth attempt, the delay would have been 4 seconds (2^2).

After attempt 3, all retries were exhausted and the original `ConnectionError` was re-raised to the caller. Total elapsed time: 1s (call) + 1s (backoff) + 1s (call) + 2s (backoff) + 1s (call) = 6 seconds. The caller received the final exception and could decide whether to surface it to the user, fall back to a cached response, or escalate to a circuit breaker.

The retry function used `except Exception` (not `except BaseException`) to avoid catching `CancelledError`. This is critical — if `CancelledError` is caught and retried, the task never actually cancels when the system requests shutdown, creating a zombie coroutine that ignores cancellation signals.

## When to Use

- LLM API calls that hit rate limits (429), server errors (500, 502, 503), or transient timeouts
- Database connection retries after transient failures like connection pool exhaustion or brief network partitions
- HTTP webhook delivery to endpoints that may be temporarily unreachable during deployments
- File uploads to cloud storage with intermittent network issues causing partial transfer failures
- Any **idempotent** operation against a remote service that experiences transient errors
- gRPC calls with `UNAVAILABLE` or `DEADLINE_EXCEEDED` status codes that indicate retriable conditions
- DNS resolution retries when upstream resolvers are briefly unreachable

## When to Avoid

- Non-idempotent operations like creating database records, sending emails, or charging credit cards — retrying creates duplicates
- Client errors (400, 401, 403, 404) that indicate bad input and will never self-resolve regardless of retry count
- Operations where the delay budget is exhausted — if the user is waiting and 3 retries take 15 seconds, they have already left
- Calls inside a tight loop where even a 1-second backoff per item makes batch processing take hours
- When a circuit breaker should trip instead — after N consecutive failures, stop retrying and fail fast for all callers
- Cancellation signals (`CancelledError`) which must propagate immediately for graceful shutdown to work
- Operations with side effects that partially completed — retry may create an inconsistent state

## In Production

**The AWS SDK (boto3)** implements retry with exponential backoff as a core feature. The default retry mode uses a base delay of 1 second, a maximum of 5 retries for most services, and full jitter (`random.uniform(0, base * 2^attempt)`). boto3 classifies errors into retriable (throttling, transient, server errors) and non-retriable (validation, access denied) categories. The `Adaptive` retry mode goes further — it tracks a token bucket per service endpoint and adjusts retry rates based on observed throttling, effectively implementing client-side rate limiting that adapts to the server's capacity in real time. This is the most sophisticated retry implementation in any major SDK and handles burst traffic patterns that simpler retry strategies cannot.

**The tenacity library** is the standard Python retry library, used by LangChain, Airflow, and hundreds of production systems. It provides decorator-based retry with composable stop conditions (`stop_after_attempt`, `stop_after_delay`), wait strategies (`wait_exponential`, `wait_random_exponential`), and retry predicates (`retry_if_exception_type`, `retry_if_result`). The key design insight is that retry configuration is separated from business logic — `@retry(wait=wait_exponential(multiplier=1, max=60), stop=stop_after_attempt(5))` wraps any function without modifying its internals. tenacity also supports async natively with `@retry` on `async def` functions, integrating with the event loop's sleep instead of blocking.

**httpx's transport-level retry** operates below the application layer. The `httpx.AsyncHTTPTransport(retries=3)` parameter retries on connection-level failures (TCP reset, DNS timeout, TLS handshake failure) without retrying on HTTP-level errors. This separation is deliberate — connection failures are always safe to retry because no request body was sent, while HTTP 500 errors may indicate a request that was received and partially processed. The OpenAI Python SDK builds on httpx and adds its own application-level retry on top, retrying 429 and 500+ responses with exponential backoff. This two-layer retry — transport retries for connection failures, application retries for server errors — is the standard architecture for resilient HTTP clients.

**Celery task retries** use `self.retry(countdown=2**self.request.retries, max_retries=5)` to re-enqueue failed tasks with exponential backoff. Unlike in-process retry which blocks a worker, Celery retry puts the task back in the broker queue with a visibility delay, freeing the worker to process other tasks during the backoff period. This is a fundamentally different retry architecture — the retry state lives in the message broker (Redis or RabbitMQ), not in process memory, so it survives worker crashes and restarts. The backoff delay is enforced by the broker's delayed-delivery mechanism, not by sleeping in the worker.
