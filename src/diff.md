# Diff Module

The `diff` module fetches and analyzes the file changes in a pull request.

## Exports

### `fetchPRDiff(octokit, owner, repo, pullNumber)`
Fetches the list of changed files for a given PR using the GitHub API.
Returns an array of `FileDiff` objects.

### `summarizeDiff(files)`
Aggregates a list of `FileDiff` entries into a `DiffSummary` with totals
for files changed, lines added, and lines deleted.

### `filterDiffByPattern(files, pattern)`
Filters a list of `FileDiff` entries by a filename regex pattern.
Useful for scoping checks to specific directories or file types.

## Diff Checks (`diffcheck.ts`)

### `checkDiffSize(summary, config)`
Validates that the PR does not exceed configured size thresholds:
- `maxChangedFiles` — maximum number of files allowed to change
- `maxAdditions` — maximum number of added lines
- `maxDeletions` — maximum number of deleted lines

### `checkBlockedFiles(files, blockedPatterns)`
Rejects PRs that include files matching any of the provided regex patterns.
Useful for preventing accidental commits of secrets or generated files.

## Configuration

Add diff limits to your `prcheck` config:

```yaml
diff:
  max_changed_files: 50
  max_additions: 1000
  blocked_patterns:
    - "\\.env$"
    - "\\.pem$"
```
