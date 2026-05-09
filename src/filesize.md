# File Size Check

The `filesize` module enforces per-file size limits and blocks specific file extensions from being included in a pull request.

## Inputs

| Input | Description | Default |
|---|---|---|
| `max_file_size_kb` | Maximum allowed file size in KB | `500` |
| `warn_file_size_kb` | File size threshold that triggers a warning | `200` |
| `blocked_extensions` | Comma-separated list of blocked extensions (e.g. `.mp4,.exe`) | `` |

## Behavior

- Files exceeding `max_file_size_kb` cause the check to **fail**.
- Files between `warn_file_size_kb` and `max_file_size_kb` produce a **warning** but do not fail.
- Files with a blocked extension always cause the check to **fail**, regardless of size.
- If the GitHub API does not return a `size` field for a file, the size check is skipped for that file.

## Example Configuration

```yaml
- uses: your-org/prcheck@v1
  with:
    max_file_size_kb: "300"
    warn_file_size_kb: "100"
    blocked_extensions: ".mp4,.exe,.zip"
```

## Exports

- `checkFileSizes(files, config)` — core logic, returns a `FileSizeResult`.
- `logFileSizeResult(result)` — logs result using `@actions/core`.
- `loadFileSizeConfig()` — reads action inputs and returns a `FileSizeConfig`.
- `runFileSizeCheck(files)` — orchestrates load + check + log, returns `boolean`.
