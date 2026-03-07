#!/usr/bin/env python3
"""
Test script to verify all 20 asyncio animation examples are factually correct.
Each test prints timing and output to verify the animation matches actual Python behavior.
"""
import asyncio
import time
from concurrent.futures import ProcessPoolExecutor

def timestamp():
    """Returns elapsed time since test start."""
    return f"{time.time() - START_TIME:.1f}s"

# ============================================================================
# Animation 1: Synchronous Execution
# ============================================================================
def test_01_sync_execution():
    """Verify sync execution takes 3s total (1s + 2s sequential)."""
    print("\n" + "="*60)
    print("TEST 01: Synchronous Execution")
    print("="*60)
    
    import time as sync_time
    
    def call_llm(model):
        print(f"[{timestamp()}] Calling {model}...")
        sync_time.sleep(2 if model == "claude" else 1)
        print(f"[{timestamp()}] {model} responded")
        return f"Response from {model}"
    
    def main():
        result1 = call_llm("gpt-4")
        print(f"[{timestamp()}] GPT-4 done")
        result2 = call_llm("claude")
        print(f"[{timestamp()}] Claude done")
        return [result1, result2]
    
    results = main()
    print(f"[{timestamp()}] Results: {results}")
    print("EXPECTED: Total ~3s (1s gpt-4 + 2s claude sequential)")

# ============================================================================
# Animation 2: Basic Coroutines (Sequential await - NO concurrency)
# ============================================================================
def test_02_basic_coroutines():
    """
    CRITICAL: This animation shows that just using async/await WITHOUT create_task
    results in sequential execution, NOT concurrent execution.
    
    The animation correctly shows this takes 3s total.
    """
    print("\n" + "="*60)
    print("TEST 02: Basic Coroutines with await (Sequential - No Concurrency)")
    print("="*60)
    
    async def call_llm(model):
        print(f"[{timestamp()}] Calling {model}...")
        await asyncio.sleep(2 if model == "claude" else 1)
        print(f"[{timestamp()}] {model} responded")
        return f"Response from {model}"
    
    async def main():
        # NOTE: This creates coroutine objects but doesn't schedule them
        task1 = call_llm("gpt-4")  # NOT started yet!
        task2 = call_llm("claude")  # NOT started yet!
        
        # await task1 starts task1 and waits for it to complete
        result1 = await task1
        print(f"[{timestamp()}] GPT-4 done")
        
        # Only after task1 completes, await task2 starts task2
        result2 = await task2
        print(f"[{timestamp()}] Claude done")
        
        return [result1, result2]
    
    results = asyncio.run(main())
    print(f"[{timestamp()}] Results: {results}")
    print("EXPECTED: Total ~3s (sequential, NOT concurrent)")
    print("NOTE: Coroutine objects are created but NOT running until awaited")

# ============================================================================
# Animation 3: Concurrent Tasks with create_task
# ============================================================================
def test_03_create_task():
    """
    With create_task, both tasks are scheduled immediately and run concurrently.
    Total time should be max(1s, 2s) = 2s, not 1s + 2s = 3s.
    """
    print("\n" + "="*60)
    print("TEST 03: Concurrent Tasks with create_task")
    print("="*60)
    
    async def call_llm(model):
        print(f"[{timestamp()}] Calling {model}...")
        await asyncio.sleep(2 if model == "claude" else 1)
        print(f"[{timestamp()}] {model} responded")
        return f"Response from {model}"
    
    async def main():
        # create_task schedules tasks immediately on the event loop
        task1 = asyncio.create_task(call_llm("gpt-4"))
        task2 = asyncio.create_task(call_llm("claude"))
        
        # Both are running! await just waits for result
        result1 = await task1
        print(f"[{timestamp()}] GPT-4 done")
        result2 = await task2
        print(f"[{timestamp()}] Claude done")
        return [result1, result2]
    
    results = asyncio.run(main())
    print(f"[{timestamp()}] Results: {results}")
    print("EXPECTED: Total ~2s (concurrent, max of 1s and 2s)")

# ============================================================================
# Animation 4: Awaiting in Different Orders
# ============================================================================
def test_04_await_ordering():
    """
    Await order doesn't affect when tasks run - both run concurrently.
    Even if we await task2 first (2s), task1 (1s) still finishes first.
    But main() doesn't get task1's result until it awaits task1.
    """
    print("\n" + "="*60)
    print("TEST 04: Awaiting in Different Orders")
    print("="*60)
    
    async def call_llm(model):
        print(f"[{timestamp()}] Calling {model}...")
        await asyncio.sleep(2 if model == "claude" else 1)
        print(f"[{timestamp()}] {model} responded")
        return f"Response from {model}"
    
    async def main():
        task1 = asyncio.create_task(call_llm("gpt-4"))
        task2 = asyncio.create_task(call_llm("claude"))
        
        # Await task2 FIRST (even though it takes longer)
        result2 = await task2
        print(f"[{timestamp()}] Claude done")
        
        # task1 already finished 1s ago! await returns immediately
        result1 = await task1
        print(f"[{timestamp()}] GPT-4 done")
        
        return [result1, result2]
    
    results = asyncio.run(main())
    print(f"[{timestamp()}] Results: {results}")
    print("EXPECTED: Total ~2s. task1 finishes at 1s but main gets result at 2s")
    print("NOTE: gpt-4 responded at 1s, but 'GPT-4 done' prints at 2s")

# ============================================================================
# Animation 5: Blocking the Event Loop
# ============================================================================
def test_05_blocking_loop():
    """
    Using time.sleep() (blocking) instead of asyncio.sleep() (non-blocking)
    blocks the entire event loop, preventing concurrency.
    """
    print("\n" + "="*60)
    print("TEST 05: Blocking the Event Loop")
    print("="*60)
    
    import time as sync_time
    
    async def call_llm(model):
        print(f"[{timestamp()}] Calling {model}...")
        sync_time.sleep(2 if model == "claude" else 1)  # BLOCKING!
        print(f"[{timestamp()}] {model} responded")
        return f"Response from {model}"
    
    async def main():
        task1 = asyncio.create_task(call_llm("gpt-4"))
        task2 = asyncio.create_task(call_llm("claude"))
        result1 = await task1
        print(f"[{timestamp()}] GPT-4 done")
        result2 = await task2
        print(f"[{timestamp()}] Claude done")
        return [result1, result2]
    
    results = asyncio.run(main())
    print(f"[{timestamp()}] Results: {results}")
    print("EXPECTED: Total ~3s (sequential due to blocking)")
    print("NOTE: time.sleep() blocks the thread - no concurrency!")

# ============================================================================
# Animation 6: Threads and Processes
# ============================================================================
def test_06_threads_processes():
    """
    Using to_thread() or ProcessPoolExecutor to run blocking code
    without blocking the event loop.
    """
    print("\n" + "="*60)
    print("TEST 06: Running Threads and Processes")
    print("="*60)
    
    import time as sync_time
    
    def call_llm_sync(model):
        print(f"[{timestamp()}] Calling {model}...")
        sync_time.sleep(2 if model == "claude" else 1)
        print(f"[{timestamp()}] {model} responded")
        return f"Response from {model}"
    
    async def main():
        # Run in Threads (using asyncio.to_thread)
        task1 = asyncio.create_task(asyncio.to_thread(call_llm_sync, "gpt-4"))
        task2 = asyncio.create_task(asyncio.to_thread(call_llm_sync, "claude"))
        result1 = await task1
        print(f"[{timestamp()}] Thread: GPT-4 done")
        result2 = await task2
        print(f"[{timestamp()}] Thread: Claude done")
        
        # Note: ProcessPoolExecutor test omitted as it requires __main__ guard
        # and picklable functions, but the concept is the same
        
        return [result1, result2]
    
    results = asyncio.run(main())
    print(f"[{timestamp()}] Results: {results}")
    print("EXPECTED: Total ~2s (threads run concurrently)")

# ============================================================================
# Animation 7: Scheduling Patterns
# ============================================================================
def test_07_scheduling_patterns():
    """Test different ways to schedule concurrent tasks."""
    print("\n" + "="*60)
    print("TEST 07: Different Ways to Schedule and Run Tasks")
    print("="*60)
    
    async def call_llm(model):
        await asyncio.sleep(2 if model == "claude" else 1)
        return f"Response from {model}"
    
    async def main():
        # Pattern 1: Manual create_task
        t0 = time.time()
        task1 = asyncio.create_task(call_llm("gpt-4"))
        task2 = asyncio.create_task(call_llm("claude"))
        result1 = await task1
        result2 = await task2
        print(f"[{timestamp()}] Manual: {[result1, result2]} ({time.time()-t0:.1f}s)")
        
        # Pattern 2: gather with coroutines
        t0 = time.time()
        results = await asyncio.gather(call_llm("gpt-4"), call_llm("claude"))
        print(f"[{timestamp()}] Gather coroutines: {results} ({time.time()-t0:.1f}s)")
        
        # Pattern 3: gather with tasks
        t0 = time.time()
        tasks = [asyncio.create_task(call_llm(m)) for m in ("gpt-4", "claude")]
        results = await asyncio.gather(*tasks)
        print(f"[{timestamp()}] Gather tasks: {results} ({time.time()-t0:.1f}s)")
        
        # Pattern 4: TaskGroup (Python 3.11+)
        t0 = time.time()
        async with asyncio.TaskGroup() as tg:
            t1 = tg.create_task(call_llm("gpt-4"))
            t2 = tg.create_task(call_llm("claude"))
        print(f"[{timestamp()}] TaskGroup: {[t1.result(), t2.result()]} ({time.time()-t0:.1f}s)")
    
    asyncio.run(main())
    print("EXPECTED: Each pattern should take ~2s")

# ============================================================================
# Animation 8: Cancellation and shield
# ============================================================================
def test_08_cancellation():
    """Test task cancellation and asyncio.shield."""
    print("\n" + "="*60)
    print("TEST 08: Cancellation and shield")
    print("="*60)
    
    async def call_llm(model):
        print(f"[{timestamp()}] Calling {model}...")
        await asyncio.sleep(3)
        print(f"[{timestamp()}] {model} responded")
        return f"Response from {model}"
    
    async def save_history(text):
        print(f"[{timestamp()}] Saving chat history...")
        await asyncio.sleep(1)
        print(f"[{timestamp()}] Saved!")
    
    async def main():
        # Test cancellation
        task = asyncio.create_task(call_llm("claude"))
        await asyncio.sleep(1)
        task.cancel()
        try:
            result = await task
        except asyncio.CancelledError:
            print(f"[{timestamp()}] Claude was too slow — cancelled!")
        
        # Test shield
        save = asyncio.create_task(save_history("log"))
        protected = asyncio.shield(save)
        protected.cancel()
        try:
            await protected
        except asyncio.CancelledError:
            print(f"[{timestamp()}] Shield blocked the cancel")
        await save  # The actual task is still running!
        print(f"[{timestamp()}] History saved safely!")
    
    asyncio.run(main())
    print("EXPECTED: Cancellation works; shield protects underlying task")

# ============================================================================
# Animation 9: Timeouts
# ============================================================================
def test_09_timeouts():
    """Test asyncio.timeout and asyncio.wait_for."""
    print("\n" + "="*60)
    print("TEST 09: Timeouts")
    print("="*60)
    
    async def call_llm(model):
        print(f"[{timestamp()}] Calling {model}...")
        await asyncio.sleep(3)
        print(f"[{timestamp()}] {model} responded")
        return f"Response from {model}"
    
    async def main():
        # Test asyncio.timeout (Python 3.11+)
        try:
            async with asyncio.timeout(1.0):
                result = await call_llm("claude")
                print(result)
        except TimeoutError:
            print(f"[{timestamp()}] Claude timed out — using cache")
        
        # Test asyncio.wait_for
        try:
            result = await asyncio.wait_for(call_llm("gpt-4"), timeout=2.0)
            print(result)
        except TimeoutError:
            print(f"[{timestamp()}] GPT-4 timed out!")
    
    asyncio.run(main())
    print("EXPECTED: Both timeout after ~1s and ~2s respectively")

# ============================================================================
# Animation 10: as_completed
# ============================================================================
def test_10_as_completed():
    """Test asyncio.as_completed for processing results as they arrive."""
    print("\n" + "="*60)
    print("TEST 10: Processing Results as They Arrive")
    print("="*60)
    
    async def call_agent(name, delay):
        print(f"[{timestamp()}] Agent {name} thinking...")
        await asyncio.sleep(delay)
        print(f"[{timestamp()}] Agent {name} done")
        return f"{name}'s answer"
    
    async def main():
        tasks = [
            asyncio.create_task(call_agent("researcher", 3)),
            asyncio.create_task(call_agent("coder", 1)),
            asyncio.create_task(call_agent("reviewer", 2)),
        ]
        for coro in asyncio.as_completed(tasks):
            result = await coro
            print(f"[{timestamp()}] Received: {result}")
        print(f"[{timestamp()}] All agents finished")
    
    asyncio.run(main())
    print("EXPECTED: Results in order: coder(1s), reviewer(2s), researcher(3s)")

# ============================================================================
# Animation 11: Queues
# ============================================================================
def test_11_queues():
    """Test asyncio.Queue for producer/consumer pattern."""
    print("\n" + "="*60)
    print("TEST 11: Async Queues: Producer/Consumer")
    print("="*60)
    
    async def user_requests(queue):
        for msg in ["Summarize doc", "Write code", "Review PR"]:
            print(f"[{timestamp()}] User: {msg}")
            await queue.put(msg)
            await asyncio.sleep(0.5)
        await queue.put(None)  # Sentinel
    
    async def agent_worker(queue):
        while True:
            msg = await queue.get()
            if msg is None:
                break
            print(f"[{timestamp()}] Processing: {msg}...")
            await asyncio.sleep(1)
            print(f"[{timestamp()}] Done: {msg}")
            queue.task_done()
    
    async def main():
        queue = asyncio.Queue(maxsize=2)
        await asyncio.gather(
            user_requests(queue),
            agent_worker(queue),
        )
        print(f"[{timestamp()}] All messages processed")
    
    asyncio.run(main())

# ============================================================================
# Animation 12: Semaphore
# ============================================================================
def test_12_semaphore():
    """Test asyncio.Semaphore for rate limiting."""
    print("\n" + "="*60)
    print("TEST 12: Rate Limiting with Semaphore")
    print("="*60)
    
    async def main():
        sem = asyncio.Semaphore(2)
        
        async def call_llm(model):
            async with sem:
                print(f"[{timestamp()}] Calling {model}...")
                await asyncio.sleep(2)
                print(f"[{timestamp()}] {model} responded")
                return f"Response from {model}"
        
        tasks = [
            asyncio.create_task(call_llm("gpt-4")),
            asyncio.create_task(call_llm("claude")),
            asyncio.create_task(call_llm("gemini")),
            asyncio.create_task(call_llm("llama")),
        ]
        results = await asyncio.gather(*tasks)
        print(f"[{timestamp()}] Results: {results}")
    
    asyncio.run(main())
    print("EXPECTED: 2 at a time, total ~4s (2 batches of 2s each)")

# ============================================================================
# Animation 13: Streaming with async for
# ============================================================================
def test_13_streaming():
    """Test async generators with async for."""
    print("\n" + "="*60)
    print("TEST 13: Streaming with async for")
    print("="*60)
    
    async def stream_llm(prompt):
        print(f"[{timestamp()}] Streaming: {prompt}")
        for token in ["Hello", " world", "!", " How", " can"]:
            await asyncio.sleep(0.5)
            yield token
    
    async def main():
        tokens = []
        async for token in stream_llm("Hi"):
            print(f"[{timestamp()}] Token: {token}")
            tokens.append(token)
        print(f"[{timestamp()}] Full: {''.join(tokens)}")
    
    asyncio.run(main())
    print("EXPECTED: Tokens arrive every 0.5s")

# ============================================================================
# Animation 14: Exception Group
# ============================================================================
def test_14_exception_group():
    """Test TaskGroup exception handling with except*."""
    print("\n" + "="*60)
    print("TEST 14: Error Handling with ExceptionGroup")
    print("="*60)
    
    async def call_agent(name, should_fail=False):
        print(f"[{timestamp()}] Agent {name} working...")
        await asyncio.sleep(1)
        if should_fail:
            raise ValueError(f"{name} failed!")
        print(f"[{timestamp()}] Agent {name} done")
        return f"{name}'s result"
    
    async def main():
        try:
            async with asyncio.TaskGroup() as tg:
                tg.create_task(call_agent("researcher"))
                tg.create_task(call_agent("coder", True))
                tg.create_task(call_agent("reviewer"))
        except* ValueError as eg:
            print(f"[{timestamp()}] Caught: {eg.exceptions}")
        print(f"[{timestamp()}] Continuing after error")
    
    asyncio.run(main())
    print("EXPECTED: TaskGroup cancels other tasks when one fails")

# ============================================================================
# Animation 15: Event
# ============================================================================
def test_15_event():
    """Test asyncio.Event for coordination."""
    print("\n" + "="*60)
    print("TEST 15: Event: Coordinating Agents")
    print("="*60)
    
    async def prepare_context(event):
        print(f"[{timestamp()}] Loading knowledge base...")
        await asyncio.sleep(2)
        print(f"[{timestamp()}] Context ready!")
        event.set()
    
    async def agent(name, event):
        print(f"[{timestamp()}] {name}: waiting for context...")
        await event.wait()
        print(f"[{timestamp()}] {name}: processing with context")
        await asyncio.sleep(1)
        print(f"[{timestamp()}] {name}: done")
    
    async def main():
        event = asyncio.Event()
        async with asyncio.TaskGroup() as tg:
            tg.create_task(prepare_context(event))
            tg.create_task(agent("summarizer", event))
            tg.create_task(agent("translator", event))
        print(f"[{timestamp()}] All agents finished")
    
    asyncio.run(main())
    print("EXPECTED: Agents wait until context ready (2s), then all process")

# ============================================================================
# Animation 16: Lock
# ============================================================================
def test_16_lock():
    """Test asyncio.Lock for protecting shared state."""
    print("\n" + "="*60)
    print("TEST 16: Lock: Protecting Shared State")
    print("="*60)
    
    async def main():
        lock = asyncio.Lock()
        counter = {"tokens": 0}
        
        async def agent(name, amount):
            print(f"[{timestamp()}] {name}: wants to add {amount}")
            async with lock:
                current = counter["tokens"]
                print(f"[{timestamp()}] {name}: read {current}")
                await asyncio.sleep(1)
                counter["tokens"] = current + amount
                print(f"[{timestamp()}] {name}: wrote {current + amount}")
        
        await asyncio.gather(
            agent("gpt-4", 100),
            agent("claude", 200),
        )
        print(f"[{timestamp()}] Total: {counter['tokens']}")
    
    asyncio.run(main())
    print("EXPECTED: Total should be 300 (lock prevents race condition)")

# ============================================================================
# Animation 17: Graceful Shutdown
# ============================================================================
def test_17_graceful_shutdown():
    """Test graceful shutdown with CancelledError handling."""
    print("\n" + "="*60)
    print("TEST 17: Graceful Shutdown")
    print("="*60)
    
    async def llm_worker(name):
        try:
            while True:
                print(f"[{timestamp()}] {name}: processing...")
                await asyncio.sleep(2)
        except asyncio.CancelledError:
            print(f"[{timestamp()}] {name}: saving state...")
            await asyncio.sleep(0.5)
            print(f"[{timestamp()}] {name}: cleanup done")
    
    async def main():
        workers = [
            asyncio.create_task(llm_worker("agent-1")),
            asyncio.create_task(llm_worker("agent-2")),
        ]
        await asyncio.sleep(3)
        print(f"[{timestamp()}] Shutting down...")
        for w in workers:
            w.cancel()
        results = await asyncio.gather(*workers, return_exceptions=True)
        print(f"[{timestamp()}] All workers stopped")
    
    asyncio.run(main())
    print("EXPECTED: Workers get 3s to run, then graceful cleanup")

# ============================================================================
# Animation 18: Retry with Exponential Backoff
# ============================================================================
def test_18_retry():
    """Test retry pattern with exponential backoff."""
    print("\n" + "="*60)
    print("TEST 18: Retry with Exponential Backoff")
    print("="*60)
    
    async def call_llm(model):
        print(f"[{timestamp()}] Calling {model}...")
        await asyncio.sleep(1)
        raise ConnectionError(f"{model} API error")
    
    async def retry(coro_fn, retries=3):
        for attempt in range(retries):
            try:
                return await coro_fn()
            except Exception as e:
                delay = 2 ** attempt
                print(f"[{timestamp()}] Attempt {attempt+1} failed: {e}")
                if attempt < retries - 1:
                    print(f"[{timestamp()}] Retrying in {delay}s...")
                    await asyncio.sleep(delay)
        print(f"[{timestamp()}] All retries exhausted")
    
    async def main():
        await retry(lambda: call_llm("claude"))
    
    asyncio.run(main())
    print("EXPECTED: 3 attempts with delays of 1s, 2s (exponential backoff)")

# ============================================================================
# Animation 19: Barrier
# ============================================================================
def test_19_barrier():
    """Test asyncio.Barrier for synchronizing tasks."""
    print("\n" + "="*60)
    print("TEST 19: Barrier: Synchronizing Agents")
    print("="*60)
    
    async def main():
        barrier = asyncio.Barrier(3)
        
        async def research_agent(name, delay):
            print(f"[{timestamp()}] {name}: researching...")
            await asyncio.sleep(delay)
            print(f"[{timestamp()}] {name}: research done")
            await barrier.wait()
            print(f"[{timestamp()}] {name}: synthesizing...")
            await asyncio.sleep(1)
            print(f"[{timestamp()}] {name}: complete")
        
        async with asyncio.TaskGroup() as tg:
            tg.create_task(research_agent("agent-A", 1))
            tg.create_task(research_agent("agent-B", 2))
            tg.create_task(research_agent("agent-C", 3))
        print(f"[{timestamp()}] All agents done")
    
    asyncio.run(main())
    print("EXPECTED: All start synthesizing at 3s (when C finishes research)")

# ============================================================================
# Animation 20: Wait First (Race Pattern)
# ============================================================================
def test_20_wait_first():
    """Test asyncio.wait with FIRST_COMPLETED."""
    print("\n" + "="*60)
    print("TEST 20: Race: Fastest LLM Wins")
    print("="*60)
    
    async def call_llm(model, delay):
        print(f"[{timestamp()}] Calling {model}...")
        await asyncio.sleep(delay)
        print(f"[{timestamp()}] {model} responded!")
        return f"Response from {model}"
    
    async def main():
        tasks = {
            asyncio.create_task(call_llm("gpt-4", 3)),
            asyncio.create_task(call_llm("claude", 1)),
            asyncio.create_task(call_llm("gemini", 2)),
        }
        done, pending = await asyncio.wait(
            tasks, return_when=asyncio.FIRST_COMPLETED
        )
        winner = done.pop()
        print(f"[{timestamp()}] Winner: {winner.result()}")
        for task in pending:
            task.cancel()
        print(f"[{timestamp()}] Cancelled {len(pending)} remaining")
    
    asyncio.run(main())
    print("EXPECTED: Claude wins at 1s, others cancelled")


# ============================================================================
# Run all tests
# ============================================================================
if __name__ == "__main__":
    START_TIME = time.time()
    
    print("\n" + "="*70)
    print("ASYNCIO ANIMATION ACCURACY VERIFICATION")
    print("="*70)
    
    tests = [
        test_01_sync_execution,
        test_02_basic_coroutines,
        test_03_create_task,
        test_04_await_ordering,
        test_05_blocking_loop,
        test_06_threads_processes,
        test_07_scheduling_patterns,
        test_08_cancellation,
        test_09_timeouts,
        test_10_as_completed,
        test_11_queues,
        test_12_semaphore,
        test_13_streaming,
        test_14_exception_group,
        test_15_event,
        test_16_lock,
        test_17_graceful_shutdown,
        test_18_retry,
        test_19_barrier,
        test_20_wait_first,
    ]
    
    for test in tests:
        START_TIME = time.time()  # Reset for each test
        try:
            test()
        except Exception as e:
            print(f"ERROR in {test.__name__}: {e}")
        print()
