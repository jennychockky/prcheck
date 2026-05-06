# Approvals Module

The `approvals` module checks whether a pull request has received the required number of approving reviews before merge.

## Functions

### `getApprovals(client, repo, prNumber)`

Fetches all reviews for a pull request and computes the current approval state.

- Deduplicates reviews per reviewer, keeping only the **latest** review state.
- Returns an `ApprovalResult` with counts and reviewer lists.

```ts
const result = await getApprovals(octokit, { owner: 'org', repo: 'repo' }, 42);
console.log(result.approvalCount); // e.g. 2
```

### `checkApprovalCount(result, required)`

Compares the current approval count against a required threshold.

```ts
const { passed, message } = checkApprovalCount(result, 2);
if (!passed) core.setFailed(message);
```

## ApprovalResult Shape

| Field               | Type       | Description                          |
|---------------------|------------|--------------------------------------|
| `approved`          | `boolean`  | True if at least one approval exists |
| `approvalCount`     | `number`   | Number of current approvals          |
| `requiredApprovals` | `number`   | Minimum required (default: 1)        |
| `reviewers`         | `string[]` | Logins of approving reviewers        |
| `dismissedReviewers`| `string[]` | Logins with dismissed reviews        |

## Integration

Call `getApprovals` inside `runChecks` (see `src/checks.ts`) and pass the result to `checkApprovalCount` with the configured minimum from `src/config.ts`.
