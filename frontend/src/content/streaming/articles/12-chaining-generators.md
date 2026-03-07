## Introduction

Generator pipelines chain multiple generators where each stage consumes from the previous one. The pattern is simple: each generator takes an iterable as input and yields transformed items. Connecting them creates a lazy pipeline where data flows through all stages on demand.

This animation chains three generators: `read_lines()` produces raw data, `normalize()` transforms it, and `add_prefix()` adds formatting. Items flow through the entire chain one at a time, with no intermediate lists.

## Why This Matters

Pipelines decompose complex transformations into simple, testable stages. Each stage does one thing. You can test stages independently, reorder them, or swap implementations. This modularity makes code maintainable and reasoning tractable.

The lazy evaluation is preserved through the entire chain. No intermediate lists are built. Memory usage is constant regardless of input size. You can process terabytes of data through a multi-stage pipeline without exhausting memory.

Pipeline composition is how professional data processing is done. Tools like Unix pipes, Spark, and Kafka Streams all use this pattern. Understanding it in Python generators prepares you for these systems.

## When to Use This Pattern

- Multi-stage data transformation (clean → filter → format → output)
- Building reusable transformation components
- Processing data too large to fit in memory
- Implementing map-filter-reduce style operations
- ETL (Extract-Transform-Load) workflows
- Any processing that naturally decomposes into stages

## What Just Happened

Three generators were created and chained: `raw → cleaned → prefixed`. Creation was instant — no iteration happened yet. The pipeline was set up but dormant.

The `for` loop pulled from `prefixed`. This triggered a cascade: `prefixed` pulled from `cleaned`, which pulled from `raw`. The first raw value flowed through all stages and reached the output.

Each subsequent iteration repeated this cascade. Items flowed through one at a time. When `raw` exhausted, the exhaustion propagated through the chain.

## Keep in Mind

- Each stage is a generator that takes an iterable and yields values
- Stages are connected by passing one generator to the next
- No intermediate storage — items flow through on demand
- The chain is pulled from the end, triggering cascading pulls
- All stages can have different rates (filter drops items, flat-map expands them)
- Errors propagate through the chain and can be caught at any stage

## Common Pitfalls

- Building intermediate lists between stages, losing memory efficiency
- Creating stages that eagerly consume their input
- Not handling errors at appropriate points in the pipeline
- Making stages stateful in ways that prevent reuse
- Forgetting that generators are single-use (the pipeline is too)

## Where to Incorporate This

- Log processing pipelines (parse → filter → aggregate)
- Data cleaning workflows (normalize → validate → transform)
- File format conversion (read → transform → write)
- API data processing (fetch → parse → filter → store)
- Compiler passes (lex → parse → optimize → generate)
- Machine learning data pipelines (load → augment → batch)

## Related Patterns

- Generator expressions (animation 8) provide compact stage syntax
- `itertools` (animation 15) offers reusable pipeline components
- File streaming (animation 14) shows file I/O as a pipeline source
- Backpressure (animation 16) shows consumer-controlled pacing
