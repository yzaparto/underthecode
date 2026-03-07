# Introduction

A generator is a special function that can pause itself using `yield`. Instead of computing everything at once and returning a complete result, it produces values one at a time, pausing between each one.

When you call a generator function, it doesn't run the code inside — it returns a generator object. The code only runs when you call `next()` on it.

# Why This Matters

Generators let you work with sequences that would be impossible or impractical to store entirely in memory. Want to process a billion numbers? With a list, you'd need gigabytes of RAM. With a generator, you need almost nothing — it produces one number at a time.

# What Just Happened

In the animation, you saw:

1. **Creating** — `gen = count_to_three()` creates the generator but doesn't run any code yet
2. **Running** — `next(gen)` runs until it hits `yield`, then pauses
3. **Yielding** — The value after `yield` is returned to the caller
4. **Resuming** — Calling `next()` again picks up right where it left off

# Keep in Mind

- The generator **remembers its position** between `next()` calls
- Each `next()` runs until the next `yield` (or the function ends)
- When there are no more yields, `StopIteration` is raised

# Common Pitfalls

- **Thinking generators run immediately** — They don't! Creating a generator doesn't execute any code inside it.
- **Forgetting generators are single-use** — Once exhausted, you can't restart them. Create a new one instead.

# Where to Incorporate This

Use generators when you need to:

- Process large or infinite sequences
- Read data from files or network streams
- Create lazy sequences that compute values on demand

# Related Patterns

- **Iterator Protocol** (Animation 6) — The mechanism that makes `for` loops work
- **Lazy Evaluation** (Animation 8) — Computing values only when needed
