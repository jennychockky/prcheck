import * as core from '@actions/core';
import { extractPRContext, isPullRequestEvent } from './context';
import { loadConfig } from './config';
import { loadTemplate } from './template';
import { runChecks } from './checks';
import { report } from './reporter';
import { renderMarkdownSummary } from './summary';

export async function run(): Promise<void> {
  try {
    if (!isPullRequestEvent()) {
      core.warning('prcheck: This action only runs on pull_request events. Skipping.');
      return;
    }

    const context = extractPRContext();
    core.info(`prcheck: Running checks for PR #${context.prNumber} in ${context.owner}/${context.repo}`);

    const config = await loadConfig();
    core.debug(`prcheck: Loaded config: ${JSON.stringify(config)}`);

    let template: string | null = null;
    if (config.templatePath) {
      try {
        template = await loadTemplate(config.templatePath);
        core.debug(`prcheck: Loaded template from ${config.templatePath}`);
      } catch (err) {
        core.warning(`prcheck: Could not load template at ${config.templatePath}: ${(err as Error).message}`);
      }
    }

    const results = runChecks(context, config, template);

    const summary = renderMarkdownSummary(results);
    await core.summary.addRaw(summary).write();

    report(results);

    const failed = results.some((r) => !r.passed);
    if (failed) {
      core.setFailed('prcheck: One or more PR checks failed. See summary for details.');
    } else {
      core.info('prcheck: All checks passed!');
    }
  } catch (error) {
    core.setFailed(`prcheck: Unexpected error — ${(error as Error).message}`);
  }
}

run();
