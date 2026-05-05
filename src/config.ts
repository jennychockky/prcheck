import * as core from '@actions/core';

export interface PRCheckConfig {
  requiredLabels: string[];
  labelMatchMode: 'all' | 'any';
  templatePath: string;
  requiredSections: string[];
  failOnMissingTemplate: boolean;
}

export function loadConfig(): PRCheckConfig {
  const requiredLabelsInput = core.getInput('required_labels');
  const requiredLabels = requiredLabelsInput
    ? requiredLabelsInput.split(',').map((l) => l.trim()).filter(Boolean)
    : [];

  const labelMatchMode = core.getInput('label_match_mode') || 'any';
  if (labelMatchMode !== 'all' && labelMatchMode !== 'any') {
    throw new Error(`Invalid label_match_mode: "${labelMatchMode}". Must be "all" or "any".`);
  }

  const templatePath = core.getInput('template_path') || '.github/PULL_REQUEST_TEMPLATE.md';

  const requiredSectionsInput = core.getInput('required_sections');
  const requiredSections = requiredSectionsInput
    ? requiredSectionsInput.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const failOnMissingTemplate = core.getInput('fail_on_missing_template') !== 'false';

  return {
    requiredLabels,
    labelMatchMode: labelMatchMode as 'all' | 'any',
    templatePath,
    requiredSections,
    failOnMissingTemplate,
  };
}
