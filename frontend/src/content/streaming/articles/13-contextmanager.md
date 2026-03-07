## Introduction

The `@contextmanager` decorator transforms a generator into a context manager. Code before `yield` is setup (`__enter__`), the yielded value is the `as` target, and code after `yield` (typically in finally) is cleanup (`__exit__`). This is far simpler than writing a class with both methods.

This animation shows a generator-based context manager for resource management. The setup acquires a resource, the yield provides it to the `with` block, and the finally releases it. Cleanup happens even if the `with` block raises an exception.

## Why This Matters

Context managers are Python's pattern for resource management. Files, locks, connections, transactions — anything that needs cleanup should use a context manager. `@contextmanager` makes writing them trivial, encouraging their use.

The generator form is more readable than the class form. Setup and cleanup are adjacent in the code, not split across methods. The control flow is obvious: setup, yield, cleanup. This clarity reduces bugs.

The pattern ensures cleanup runs regardless of how the block exits — normal completion, exception, or early return. This reliability is essential for correct resource handling.

## When to Use This Pattern

- Managing resources that require cleanup (files, connections, locks)
- Temporarily modifying global state and restoring it
- Timing blocks of code (start timer, yield, stop timer)
- Setting up and tearing down test fixtures
- Temporarily changing working directory, environment variables, etc.
- Any setup/teardown pair that should be atomic

## What Just Happened

`@contextmanager` wrapped the generator function. When `with managed_resource("database")` executed, the generator started running. Setup code printed "Acquiring database" and created the resource dict.

The `yield resource` statement paused the generator and provided the dict as `db` to the `with` block. Code inside `with` executed while the generator was suspended.

When the `with` block ended, the generator resumed. The finally block ran, deactivating the resource and printing "Releasing database". Cleanup completed even though the block exited normally.

## Keep in Mind

- Code before yield is `__enter__`, code after (in finally) is `__exit__`
- The yielded value becomes the `as` target (can be None if not needed)
- You should yield exactly once — more yields cause `RuntimeError`
- Use `try/finally` to ensure cleanup runs even on exceptions
- Exceptions from the `with` block appear at the yield point
- You can re-raise, suppress, or transform exceptions in the generator

## Common Pitfalls

- Yielding more than once (context managers yield exactly once)
- Forgetting `try/finally`, causing cleanup to skip on exceptions
- Catching exceptions too broadly and suppressing errors accidentally
- Not re-raising exceptions when you should propagate them
- Using `@contextmanager` when a simple class would be clearer

## Where to Incorporate This

- Database transaction managers (begin, yield, commit/rollback)
- File handling with guaranteed close
- Locking and synchronization primitives
- Timing and profiling decorators
- Temporary state modification (environment, config, etc.)
- Test fixtures with setup and teardown

## Related Patterns

- `throw()` and `close()` (animation 10) show related generator control
- Error handling (animation 18) shows exception management in generators
- File streaming (animation 14) often uses context managers for files
- Async context managers use `async with` and `@asynccontextmanager`
