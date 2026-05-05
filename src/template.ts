import * as fs from 'fs';
import * as path from 'path';

export interface TemplateCheckResult {
  valid: boolean;
  missingSection?: string;
  message: string;
}

export function loadTemplate(templatePath: string): string {
  const resolved = path.resolve(templatePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Template file not found: ${resolved}`);
  }
  return fs.readFileSync(resolved, 'utf-8');
}

export function extractRequiredSections(template: string): string[] {
  const sectionRegex = /^#{1,3}\s+(.+)$/gm;
  const sections: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(template)) !== null) {
    sections.push(match[1].trim());
  }
  return sections;
}

export function checkDescriptionAgainstTemplate(
  description: string,
  templatePath: string
): TemplateCheckResult {
  if (!description || description.trim().length === 0) {
    return {
      valid: false,
      message: 'PR description is empty. Please fill out the PR template.',
    };
  }

  let template: string;
  try {
    template = loadTemplate(templatePath);
  } catch (err) {
    return {
      valid: false,
      message: (err as Error).message,
    };
  }

  const requiredSections = extractRequiredSections(template);

  for (const section of requiredSections) {
    const sectionRegex = new RegExp(`#{1,3}\\s+${escapeRegex(section)}`, 'i');
    if (!sectionRegex.test(description)) {
      return {
        valid: false,
        missingSection: section,
        message: `PR description is missing required section: "${section}"`,
      };
    }
  }

  return {
    valid: true,
    message: 'PR description matches the required template.',
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
