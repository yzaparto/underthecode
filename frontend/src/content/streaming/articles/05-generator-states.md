# Introduction

A generator is actually a **state machine** with four possible states:

1. **CREATED** — Generator exists but hasn't started running
2. **RUNNING** — Generator is currently executing code
3. **PAUSED** — Generator is suspended at a `yield`
4. **DONE** — Generator has finished (exhausted or returned)

# Why This Matters

Understanding states helps you debug generators. If a generator isn't producing values, is it because it was never started? Is it paused waiting for `next()`? Has it already finished?

# What Just Happened

The animation walked through all four states:

1. `gen = simple()` → State: **CREATED** (no code has run yet)
2. `next(gen)` called → State: **RUNNING** → hits yield → **PAUSED**
3. Second `next(gen)` → **RUNNING** → hits yield → **PAUSED**
4. Third `next(gen)` → **RUNNING** → function ends → **DONE** (StopIteration raised)

# Keep in Mind

- You can inspect a generator's state with `gen.gi_frame` (None if done)
- A generator can only move forward through states — no going back
- Once DONE, the generator is exhausted forever

# Common Pitfalls

- **Expecting code to run at creation time** — Generators start in CREATED state
- **Calling next() on an exhausted generator** — You'll get StopIteration

# Where to Incorporate This

Understanding states is crucial when:

- Debugging why a generator isn't producing values
- Implementing coroutines or cooperative multitasking
- Building generator-based state machines

# Related Patterns

- **Your First Generator** (Animation 1) — Basic yield and next()
- **throw() and close()** (Animation 11) — Controlling generator state from outside
