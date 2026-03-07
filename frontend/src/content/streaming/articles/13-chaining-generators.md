# Introduction

Generator pipelines connect multiple generators in a chain, where each stage transforms data and passes it to the next:

```
read_data() → clean() → lowercase() → consumer
```

Data flows through, transformed at each step, without storing intermediate results.

# Why This Matters

Pipelines let you decompose complex processing into simple, reusable stages. Each stage does one thing. You can mix and match stages to build different processing flows. And the whole pipeline is lazy — no intermediate lists!

# What Just Happened

The animation built a text processing pipeline:

1. `read_data()`: Yields raw strings with whitespace
2. `clean()`: Strips whitespace from each string
3. `lowercase()`: Converts to lowercase

When we iterated over `final`, each item flowed through all stages: "  HELLO  " → "HELLO" → "hello"

# Keep in Mind

- Each stage takes an iterable as input and yields transformed items
- Nothing runs until you iterate the final result
- Memory stays constant regardless of data size

# Common Pitfalls

- **Creating intermediate lists** — Defeats the lazy evaluation benefit
- **Building overly complex single generators** — Break them into pipeline stages

# Where to Incorporate This

Pipeline pattern is perfect for:

- ETL (Extract, Transform, Load) processes
- Log processing
- Data cleaning and transformation
- Any multi-step data processing

# Related Patterns

- **File Streaming** (Animation 14) — Real file processing pipeline
- **itertools** (Animation 15) — Standard library pipeline tools
