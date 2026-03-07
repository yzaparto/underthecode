## Introduction

File streaming processes files line by line without loading them entirely into memory. A generator that yields lines maintains constant memory regardless of file size. This pattern handles log files, CSV data, and any line-based format efficiently.

This animation shows a file-processing pipeline: read lines, filter for errors, extract messages. The generator chain processes a 10GB log file using only enough memory for one line at a time. Early termination with `break` avoids reading the entire file.

## Why This Matters

Files are often larger than available memory. A 10GB log file cannot be loaded into RAM on most machines, but you can process it line by line. Generator-based streaming makes this natural and efficient.

The pipeline pattern applies directly to file processing. Read, filter, transform, write — each stage is a generator. Data flows through without intermediate storage. You process terabytes with gigabytes of RAM.

Early termination is a superpower. If you are searching for a specific log entry, you stop when you find it. The remaining gigabytes are never read. This can turn a minutes-long search into a sub-second one.

## When to Use This Pattern

- Processing log files too large to fit in memory
- Streaming CSV or JSON-lines data
- ETL from large source files
- Real-time log tailing and analysis
- Any file processing where you might not need all data
- Pipeline processing with file I/O stages

## What Just Happened

`process_logs()` created a chain of generators. No file I/O happened yet — the file was not even opened. The generators were set up but dormant.

The `for` loop started pulling values. This triggered the cascade: read a line, check for "ERROR", extract the message. Lines without "ERROR" were read and discarded; only matching lines reached the output.

After three errors, we broke out of the loop. The file was not fully read — we stopped early. The remaining gigabytes (in the simulated example) were never processed.

## Keep in Mind

- `for line in file` already iterates line by line (file objects are iterators)
- Wrap in a generator to add cleanup with `with open()` or error handling
- Each line is a string including the newline; strip as needed
- Generators chain naturally for multi-stage file processing
- Early termination with `break` stops reading the file
- The file stays open while iterating; use `with` to ensure closure

## Common Pitfalls

- Calling `file.read()` or `file.readlines()` which loads everything into memory
- Forgetting to close files (use `with` or ensure generator cleanup)
- Not handling encoding errors for non-UTF-8 files
- Building intermediate lists between processing stages
- Processing the entire file when early termination is possible

## Where to Incorporate This

- Log analysis tools searching for specific patterns
- Data ingestion pipelines from large files
- File format conversion (CSV to JSON, etc.)
- Real-time monitoring of growing log files
- ETL jobs reading from file-based sources
- Any batch processing of file-based data

## Related Patterns

- Memory efficiency (animation 5) explains the memory benefits
- Chaining generators (animation 12) shows pipeline composition
- Error handling (animation 18) shows handling file read errors
- `itertools` (animation 15) provides useful file-processing utilities
