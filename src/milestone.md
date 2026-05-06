# Milestone Check

The milestone module enforces that pull requests have a milestone assigned before merging.

## Configuration

Add the following to your `.prcheck.yml`:

```yaml
milestone:
  required: true
  pattern: '^v\d+\.\d+\.\d+$'
```

### Options

| Option    | Type    | Default | Description                                          |
|-----------|---------|---------|------------------------------------------------------|
| `required`| boolean | `false` | Fail the check if no milestone is assigned           |
| `pattern` | string  | —       | Regex pattern the milestone title must match         |

## Outputs

| Output               | Description                                  |
|----------------------|----------------------------------------------|
| `milestone_passed`   | `"true"` or `"false"`                        |
| `milestone_failures` | Semicolon-separated list of failure messages |

## Example

To require milestones following semantic versioning:

```yaml
milestone:
  required: true
  pattern: '^v\d+\.\d+\.\d+$'
```

This will fail PRs that have no milestone or a milestone like `sprint-12` that does not match the version pattern.
