import * as core from '@actions/core';
import { PRCheckOutput } from './checks';
import { CheckResult } from './types';

function formatResult(result: CheckResult): string {
  const icon = result.passed ? '✅' : '❌';
  return `${icon} **${result.name}**: ${result.message}`;
}

export function reportToConsole(output: PRCheckOutput): void {
  core.info(`PR Check Summary: ${output.summary}`);
  for (const result of output.results) {
    if (result.passed) {
      core.info(formatResult(result));
    } else {
      core.warning(formatResult(result));
    }
  }
}

export function reportFailure(output: PRCheckOutput): void {
  const failedChecks = output.results.filter((r) => !r.passed);
  const details = failedChecks.map(formatResult).join('\n');
  core.setFailed(`PR checks failed:\n${details}`);
}

export function setOutputs(output: PRCheckOutput): void {
  core.setOutput('passed', String(output.passed));
  core.setOutput('summary', output.summary);
  core.setOutput(
    'failed_checks',
    output.results
      .filter((r) => !r.passed)
      .map((r) => r.name)
      .join(',')
  );
}

export function report(output: PRCheckOutput): void {
  reportToConsole(output);
  setOutputs(output);
  if (!output.passed) {
    reportFailure(output);
  }
}
