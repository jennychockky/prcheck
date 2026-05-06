import * as github from '@actions/github';

export interface FileDiff {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface DiffSummary {
  totalFiles: number;
  totalAdditions: number;
  totalDeletions: number;
  files: FileDiff[];
}

export async function fetchPRDiff(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<FileDiff[]> {
  const { data } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  });

  return data.map((f) => ({
    filename: f.filename,
    status: f.status as FileDiff['status'],
    additions: f.additions,
    deletions: f.deletions,
    changes: f.changes,
    patch: f.patch,
  }));
}

export function summarizeDiff(files: FileDiff[]): DiffSummary {
  return {
    totalFiles: files.length,
    totalAdditions: files.reduce((sum, f) => sum + f.additions, 0),
    totalDeletions: files.reduce((sum, f) => sum + f.deletions, 0),
    files,
  };
}

export function filterDiffByPattern(files: FileDiff[], pattern: RegExp): FileDiff[] {
  return files.filter((f) => pattern.test(f.filename));
}
