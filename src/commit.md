# Commit Check Module

The `commit.ts` module validates individual commit messages within a pull request against configurable rules.

## Functions

### `parseCommitMessage(message)`
Splits a raw commit message into `subject` (first line) and `body` (everything after the blank line).

### `checkConventionalCommit(message, pattern?)`
Returns `true` if the commit subject matches the [Conventional Commits](https://www.conventionalcommits.org/) specification.
An optional custom `RegExp` can be supplied to override the default pattern.

### `checkCommitMessages(commits, options)`
Runs all enabled checks across a list of `CommitInfo` objects and returns a `CommitCheckResult`.

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `requireConventional` | `boolean` | `false` | Enforce conventional commit format |
| `maxSubjectLength` | `number` | `72` | Maximum allowed subject line length |
| `requireSigned` | `boolean` | `false` | Require GPG-verified commits |

## Example Config

```yaml
commits:
  requireConventional: true
  maxSubjectLength: 72
  requireSigned: false
```

## Result Shape

```ts
{
  passed: boolean;
  totalCommits: number;
  violations: string[];
  commits: CommitInfo[];
}
```
