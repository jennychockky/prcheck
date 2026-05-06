# Reviewer Checks

The `reviewers` module enforces reviewer assignment policies on pull requests.

## Features

- **Required Reviewers** — Ensure specific GitHub users are requested as reviewers.
- **Minimum Reviewer Count** — Enforce a minimum number of requested reviewers.

## Configuration

```yaml
reviewer_config:
  required_reviewers:
    - alice
    - bob
  min_reviewers: 1
```

## Exported Functions

### `checkRequiredReviewers(context, config)`

Verifies that all usernames listed in `requiredReviewers` are present in the PR's requested reviewers.

Returns a `ReviewerResult` with `passed`, `missing`, and a human-readable `message`.

### `checkMinReviewers(context, config)`

Ensures the total number of requested reviewers meets or exceeds `minReviewers`.

### `runReviewerChecks(context, config)`

Orchestrates all configured reviewer checks and returns a `ReviewerCheckSummary`.

## Types

```ts
interface ReviewerConfig {
  requiredReviewers?: string[];
  minReviewers?: number;
}

interface ReviewerResult {
  passed: boolean;
  requested: string[];
  missing: string[];
  message: string;
}
```
