import * as core from '@actions/core';
import { CheckResult } from './types';

export interface SummarySection {
  label: string;
  passed: boolean;
  details?: string;
}

export function buildSummarySections(results: CheckResult[]): SummarySection[] {
  return results.map((result) => ({
    label: result.name,
    passed: result.passed,
    details: result.message,
  }));
}

export function renderMarkdownSummary(sections: SummarySection[]): string {
  const rows = sections.map((s) => {
    const icon = s.passed ? '✅' : '❌';
    const detail = s.details ? s.details : '';
    return `| ${icon} | **${s.label}** | ${detail} |`;
  });

  const header = '| Status | Check | Details |\n|--------|-------|---------|';
  return `## PR Check Results\n\n${header}\n${rows.join('\n')}`;
}

export async function writeSummary(results: CheckResult[]): Promise<void> {
  const sections = buildSummarySections(results);
  const allPassed = sections.every((s) => s.passed);
  const overallIcon = allPassed ? '✅' : '❌';
  const overallStatus = allPassed ? 'All checks passed' : 'Some checks failed';

  await core.summary
    .addHeading('PR Check Results')
    .addRaw(`\n${overallIcon} **${overallStatus}**\n\n`)
    .addTable([
      [
        { data: 'Status', header: true },
        { data: 'Check', header: true },
        { data: 'Details', header: true },
      ],
      ...sections.map((s) => [
        s.passed ? '✅' : '❌',
        s.label,
        s.details ?? '',
      ]),
    ])
    .write();
}
