# Enforce Module

The `enforce` module provides a flexible rule-enforcement layer that validates PR metadata against configurable policy rules before merge.

## Rules

| Rule | Input Key | Description |
|---|---|---|
| `require-milestone` | `require_milestone` | PR must have a milestone assigned |
| `require-assignee` | `require_assignee` | PR must have at least one assignee |
| `block-draft` | `block_draft_merge` | Prevents merging draft PRs |

## Usage

Add inputs to your workflow:

```yaml
- uses: your-org/prcheck@v1
  with:
    require_milestone: "true"
    require_assignee: "true"
    block_draft_merge: "true"
```

## API

### `runEnforceChecks(context, config)`

Runs all enabled enforcement rules and returns an array of `EnforceResult` objects.

### `runEnforceCheck(context, config?)`

High-level entry point. Returns `{ passed: boolean, failures: string[] }`.

### `loadEnforceConfig()`

Reads configuration from GitHub Actions inputs via `@actions/core`.
