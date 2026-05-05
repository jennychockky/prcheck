import * as fs from 'fs';
import * as core from '@actions/core';
import * as yaml from 'js-yaml';

export interface PrCheckConfig {
  templatePath: string;
  requiredLabels: string[];
  failOnMissingTemplate: boolean;
  failOnMissingLabels: boolean;
}

const DEFAULTS: PrCheckConfig = {
  templatePath: '.github/pull_request_template.md',
  requiredLabels: [],
  failOnMissingTemplate: true,
  failOnMissingLabels: true,
};

export function loadConfig(configPath?: string): PrCheckConfig {
  const resolvedPath = configPath ?? '.github/prcheck.yml';

  if (!fs.existsSync(resolvedPath)) {
    core.debug(`Config file not found at ${resolvedPath}, using defaults.`);
    return { ...DEFAULTS };
  }

  try {
    const raw = fs.readFileSync(resolvedPath, 'utf8');
    const parsed = yaml.load(raw) as Partial<PrCheckConfig>;

    return {
      templatePath: parsed.templatePath ?? DEFAULTS.templatePath,
      requiredLabels: parsed.requiredLabels ?? DEFAULTS.requiredLabels,
      failOnMissingTemplate:
        parsed.failOnMissingTemplate ?? DEFAULTS.failOnMissingTemplate,
      failOnMissingLabels:
        parsed.failOnMissingLabels ?? DEFAULTS.failOnMissingLabels,
    };
  } catch (err) {
    core.warning(`Failed to parse config at ${resolvedPath}: ${err}. Using defaults.`);
    return { ...DEFAULTS };
  }
}
