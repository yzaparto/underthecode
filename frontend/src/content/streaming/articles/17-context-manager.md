# Introduction

The `@contextmanager` decorator turns a generator into a context manager. The pattern:

```python
@contextmanager
def my_context():
    # Setup (like __enter__)
    yield resource
    # Cleanup (like __exit__)
```

Use with `with` statements for automatic resource management.

# Why This Matters

Writing a class-based context manager requires `__enter__` and `__exit__` methods — boilerplate! With `@contextmanager`, you write a simple generator and get the same functionality in less code.

The `finally` block guarantees cleanup even if an exception occurs inside the `with` block.

# What Just Happened

The animation showed:

1. **Enter**: Code before `yield` ran — opened the "database"
2. **Yield**: The connection was given to the `with` block
3. **Exit**: Code after `yield` ran — closed the connection

The `finally` block ensured cleanup happened even though we were inside a generator.

# Keep in Mind

- Code before `yield` = setup (__enter__)
- The yielded value = the `as` target
- Code after `yield` = cleanup (__exit__)
- Use `try/finally` to guarantee cleanup on exceptions

# Common Pitfalls

- **Forgetting try/finally** — Cleanup might not happen on exceptions!
- **Yielding more than once** — Context managers should yield exactly once

# Where to Incorporate This

Use `@contextmanager` for:

- Database connections
- File handles
- Locks and synchronization
- Temporary state changes
- Any setup/cleanup pattern

# Related Patterns

- **throw() and close()** (Animation 11) — Generator cleanup mechanics
- **Error Recovery** (Animation 19) — Handling exceptions gracefully
