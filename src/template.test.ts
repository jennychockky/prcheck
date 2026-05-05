import * as fs from 'fs';
import * as path from 'path';
import {
  extractRequiredSections,
  checkDescriptionAgainstTemplate,
  loadTemplate,
} from './template';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

const TEMPLATE_CONTENT = `## Summary\n\nDescribe your changes.\n\n## Testing\n\nHow was this tested?\n\n## Checklist\n\n- [ ] Tests added\n`;

beforeEach(() => {
  jest.resetAllMocks();
});

describe('loadTemplate', () => {
  it('returns file content when file exists', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(TEMPLATE_CONTENT as any);
    const result = loadTemplate('.github/pull_request_template.md');
    expect(result).toBe(TEMPLATE_CONTENT);
  });

  it('throws when template file does not exist', () => {
    mockFs.existsSync.mockReturnValue(false);
    expect(() => loadTemplate('missing.md')).toThrow('Template file not found');
  });
});

describe('extractRequiredSections', () => {
  it('extracts all markdown headings as required sections', () => {
    const sections = extractRequiredSections(TEMPLATE_CONTENT);
    expect(sections).toEqual(['Summary', 'Testing', 'Checklist']);
  });

  it('returns empty array when no headings found', () => {
    expect(extractRequiredSections('No headings here')).toEqual([]);
  });
});

describe('checkDescriptionAgainstTemplate', () => {
  beforeEach(() => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(TEMPLATE_CONTENT as any);
  });

  it('returns valid when description contains all required sections', () => {
    const desc = '## Summary\nFixed bug.\n## Testing\nManual.\n## Checklist\n- [x] Tests added';
    const result = checkDescriptionAgainstTemplate(desc, 'template.md');
    expect(result.valid).toBe(true);
  });

  it('returns invalid when description is empty', () => {
    const result = checkDescriptionAgainstTemplate('', 'template.md');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/empty/);
  });

  it('returns invalid with missing section name when a section is absent', () => {
    const desc = '## Summary\nFixed bug.\n## Testing\nManual.';
    const result = checkDescriptionAgainstTemplate(desc, 'template.md');
    expect(result.valid).toBe(false);
    expect(result.missingSection).toBe('Checklist');
  });

  it('returns invalid when template file is missing', () => {
    mockFs.existsSync.mockReturnValue(false);
    const result = checkDescriptionAgainstTemplate('Some description', 'missing.md');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/not found/);
  });
});
