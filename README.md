# prcheck

> Lightweight GitHub Action that enforces PR description templates and labels before merge

## Installation

```bash
npm install prcheck
npx prcheck init
```

## Usage

Add the following workflow to `.github/workflows/prcheck.yml`:

```yaml
name: PR Check

on:
  pull_request:
    types: [opened, edited, labeled, unlabeled]

jobs:
  prcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run prcheck
        uses: your-org/prcheck@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          template: .github/PULL_REQUEST_TEMPLATE.md
          required-labels: "ready-for-review"
          fail-on-missing-label: true
```

Configure rules in `.prcheck.yml` at the root of your repository:

```yaml
template:
  required-sections:
    - "## Description"
    - "## Testing"
labels:
  required:
    - "bug"
    - "feature"
  min-count: 1
```

### Options

| Input | Description | Default |
|---|---|---|
| `token` | GitHub token for API access | `${{ secrets.GITHUB_TOKEN }}` |
| `template` | Path to PR template file | `.github/PULL_REQUEST_TEMPLATE.md` |
| `required-labels` | Comma-separated list of required labels | `""` |
| `fail-on-missing-label` | Fail the check if labels are missing | `false` |

## License

MIT © [your-org](https://github.com/your-org)