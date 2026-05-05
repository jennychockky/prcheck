import { CheckResult, PRContext, Config } from './types';
import { runChecks } from './checks';
import { checkDescriptionAgainstTemplate, loadTemplate, extractRequiredSections } from './template';
import { loadConfig } from './config';
import { report } from './reporter';

export interface ValidationSummary {
  passed: boolean;
  results: CheckResult[];
  totalChecks: number;
  failedChecks: number;
}

export async function validatePR(context: PRContext, configPath?: string): Promise<ValidationSummary> {
  const config: Config = await loadConfig(configPath);
  const results: CheckResult[] = [];

  const checkResults = await runChecks(context, config);
  results.push(...checkResults);

  if (config.templatePath) {
    const template = await loadTemplate(config.templatePath);
    const requiredSections = extractRequiredSections(template);
    if (requiredSections.length > 0) {
      const templateResult = checkDescriptionAgainstTemplate(
        context.description ?? '',
        template
      );
      results.push(templateResult);
    }
  }

  const failedChecks = results.filter((r) => !r.passed).length;
  const passed = failedChecks === 0;

  return {
    passed,
    results,
    totalChecks: results.length,
    failedChecks,
  };
}

export async function validateAndReport(
  context: PRContext,
  configPath?: string
): Promise<ValidationSummary> {
  const summary = await validatePR(context, configPath);
  report(summary.results);
  return summary;
}
