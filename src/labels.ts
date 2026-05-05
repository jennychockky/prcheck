import * as core from '@actions/core';
import * as github from '@actions/github';

export interface LabelCheckResult {
  passed: boolean;
  missing: string[];
  present: string[];
}

export async function checkRequiredLabels(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  prNumber: number,
  requiredLabels: string[]
): Promise<LabelCheckResult> {
  if (!requiredLabels || requiredLabels.length === 0) {
    core.debug('No required labels configured, skipping label check.');
    return { passed: true, missing: [], present: [] };
  }

  const { data: labels } = await octokit.rest.issues.listLabelsOnIssue({
    owner,
    repo,
    issue_number: prNumber,
  });

  const presentLabels = labels.map((l) => l.name);
  const missingLabels = requiredLabels.filter(
    (required) => !presentLabels.includes(required)
  );

  const passed = missingLabels.length === 0;

  if (!passed) {
    core.warning(
      `PR is missing required labels: ${missingLabels.join(', ')}`
    );
  } else {
    core.info('All required labels are present.');
  }

  return {
    passed,
    missing: missingLabels,
    present: presentLabels,
  };
}
