## Introduction

API calls fail — network errors, rate limits, server overloads, transient bugs. A retry wrapper with exponential backoff automatically retries failed operations with increasing delays, giving the remote service time to recover. The delay doubles each attempt: 1s, 2s, 4s, 8s. This is the standard approach used by AWS, Google Cloud, and every major API provider in their client libraries.

This animation shows a `retry()` function wrapping a `call_llm("claude")` call that always fails with a `ConnectionError`. Three attempts are made with growing backoff delays between them. The IO cards are labeled to make the exponential growth visible — 1 second after the first failure, 2 seconds after the second.

Exponential backoff is not just politeness toward the remote service. When a service is overloaded, immediate retries from thousands of clients make the problem worse. Backing off gives the service breathing room to recover, and adding jitter prevents all clients from retrying at the same instant.

## Why This Matters

Without retry, a single transient error fails the entire operation — even if the very next attempt would have succeeded. A 1-second network blip at 3 AM becomes a failed batch job, a lost customer request, or a broken pipeline. Retry turns transient failures into invisible hiccups.

Without backoff, rapid retries can overwhelm the service you depend on, making the problem worse. If an LLM provider returns 429 (rate limit), immediately retrying hammers it harder. Exponential backoff is the industry standard because it is respectful to the provider and resilient for your users.

The combination of retry count, backoff multiplier, maximum delay cap, and jitter gives you fine-grained control over the tradeoff between responsiveness (how fast you recover) and politeness (how much load you add during an outage). Getting this right is the difference between a system that self-heals and one that amplifies failures.

## When to Use This Pattern

- LLM API calls that may hit rate limits (429) or server errors (500, 502, 503)
- Database connection retries after transient failures like connection pool exhaustion
- Webhook delivery to potentially unavailable endpoints that may come back online
- File uploads to cloud storage with intermittent network issues causing partial failures
- Any idempotent operation against a remote service that experiences transient errors
- Network operations in unreliable environments like mobile networks or cross-region calls

## What Just Happened

Three attempts were made, each taking 1 second for the API call itself, and all three failed with `ConnectionError`. Between attempts, backoff delays grew exponentially: 1 second after attempt 1 (2^0), 2 seconds after attempt 2 (2^1).

After attempt 3, all retries were exhausted and the original exception was re-raised to the caller. Total elapsed time: 1s (call) + 1s (backoff) + 1s (call) + 2s (backoff) + 1s (call) = 6 seconds.

In a real scenario, the service would likely recover after 1 or 2 retries. The exponential growth means early retries happen quickly (1 second) while later retries back off significantly (4s, 8s, 16s), giving increasingly troubled services more time to recover.

## Keep in Mind

- Always re-raise `CancelledError` by using `except Exception` not `except BaseException` to avoid retrying cancellation
- Add jitter with `random.uniform(0, delay)` to prevent thundering herd when many clients retry at the exact same time
- Set a maximum backoff cap like 60 seconds so delays do not grow absurdly large after many failures
- Make sure the operation being retried is idempotent — safe to repeat without creating duplicate side effects
- Set a maximum retry count to avoid infinite retry loops that consume resources forever without resolution

## Common Pitfalls

- Retrying non-idempotent operations like creating database records or sending emails, which produces duplicates
- Catching `CancelledError` and retrying it, so the task never actually cancels when the system requests shutdown
- Having no maximum retry limit, which creates an infinite retry loop consuming resources and log space forever
- Omitting jitter so all clients retry at the exact same time after an outage, creating a thundering herd that re-crashes the service
- Retrying 4xx client errors like 400 Bad Request or 401 Unauthorized that will never self-resolve no matter how many times you retry

## Where to Incorporate This

- LLM API calls with provider-specific error handling for 429 rate limits and 500+ server errors
- Database reconnection logic after connection pool exhaustion or transient network partitions
- Webhook delivery systems with retry queues that back off per-endpoint based on failure history
- Distributed task queues implementing Celery-style retry with configurable backoff per task type
- Health check recovery after transient failures where the monitored service may need seconds to restart
- Cloud storage upload with resumable retry that continues from the last successful byte offset

## Related Patterns

- Timeouts per individual attempt to prevent a single hung call from consuming the entire retry budget
- Circuit breaker pattern that stops retrying entirely after N consecutive failures to avoid wasting resources
- `tenacity` library for production-grade retry with decorators, full configuration, and callback hooks
- Semaphore for rate limiting outbound calls to prevent needing retries in the first place
- Graceful degradation with cached fallback responses when all retries are exhausted and the service is down
