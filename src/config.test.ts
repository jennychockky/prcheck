import * as core from '@actions/core';
import { loadConfig } from './config';

jest.mock('@actions/core');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;

describe('loadConfig', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetInput.mockReturnValue('');
  });

  it('returns defaults when no inputs are provided', () => {
    const config = loadConfig();
    expect(config.requiredLabels).toEqual([]);
    expect(config.labelMatchMode).toBe('any');
    expect(config.templatePath).toBe('.github/PULL_REQUEST_TEMPLATE.md');
    expect(config.requiredSections).toEqual([]);
    expect(config.failOnMissingTemplate).toBe(true);
  });

  it('parses required_labels correctly', () => {
    mockGetInput.mockImplementation((key) =>
      key === 'required_labels' ? 'bug, enhancement, ready' : ''
    );
    const config = loadConfig();
    expect(config.requiredLabels).toEqual(['bug', 'enhancement', 'ready']);
  });

  it('trims whitespace from required_labels entries', () => {
    mockGetInput.mockImplementation((key) =>
      key === 'required_labels' ? '  bug  ,  enhancement  ' : ''
    );
    const config = loadConfig();
    expect(config.requiredLabels).toEqual(['bug', 'enhancement']);
  });

  it('sets labelMatchMode to all when specified', () => {
    mockGetInput.mockImplementation((key) =>
      key === 'label_match_mode' ? 'all' : ''
    );
    const config = loadConfig();
    expect(config.labelMatchMode).toBe('all');
  });

  it('throws on invalid label_match_mode', () => {
    mockGetInput.mockImplementation((key) =>
      key === 'label_match_mode' ? 'none' : ''
    );
    expect(() => loadConfig()).toThrow('Invalid label_match_mode');
  });

  it('sets failOnMissingTemplate to false when input is "false"', () => {
    mockGetInput.mockImplementation((key) =>
      key === 'fail_on_missing_template' ? 'false' : ''
    );
    const config = loadConfig();
    expect(config.failOnMissingTemplate).toBe(false);
  });

  it('parses required_sections correctly', () => {
    mockGetInput.mockImplementation((key) =>
      key === 'required_sections' ? '## Description, ## Testing' : ''
    );
    const config = loadConfig();
    expect(config.requiredSections).toEqual(['## Description', '## Testing']);
  });

  it('uses custom template_path when provided', () => {
    mockGetInput.mockImplementation((key) =>
      key === 'template_path' ? '.github/MY_TEMPLATE.md' : ''
    );
    const config = loadConfig();
    expect(config.templatePath).toBe('.github/MY_TEMPLATE.md');
  });
});
