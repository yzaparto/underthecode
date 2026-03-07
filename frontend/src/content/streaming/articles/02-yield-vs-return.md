# Introduction

`return` and `yield` both send values out of a function, but they behave completely differently:

- `return` **exits** the function permanently — it's done
- `yield` **pauses** the function temporarily — it can resume later

This distinction is fundamental to understanding generators.

# Why This Matters

With `return`, anything after the return statement never runs. The function is finished. With `yield`, the function remembers exactly where it paused, and code after the `yield` will run when you resume.

This makes generators perfect for multi-step processes where you need to maintain state between steps.

# What Just Happened

The animation showed two functions:

1. `get_one()` with **return**: printed "Before return", then exited. "After return" never printed.
2. `yield_one()` with **yield**: printed "Before yield", paused, and when resumed, printed "After yield".

The key insight: code after `yield` **will execute** when the generator resumes.

# Keep in Mind

- A function with `yield` is automatically a generator function
- You can have both `yield` and `return` in a generator — `return` ends it early
- `return value` in a generator becomes `StopIteration(value)`

# Common Pitfalls

- **Using return when you want yield** — If you want to produce multiple values, use `yield`
- **Forgetting return exits immediately** — Code after return never runs

# Where to Incorporate This

Use `yield` when you need to:

- Produce a sequence of values from a function
- Maintain state between values (generators remember local variables)
- Create pausable computations

# Related Patterns

- **Your First Generator** (Animation 1) — Introduction to yield and next()
- **Generator States** (Animation 5) — Understanding the state machine
