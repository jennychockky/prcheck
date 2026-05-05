import { validatePR, ValidationSummary } from './validator';
import { PRContext } from './types';
import * as checks from './checks';
import * as template from './template';
import * as config from './config';

jest.mock('./checks');
jest.mock('./template');
jest.mock('./config');
jest.mock('./reporter', () => ({ report: jest.fn() }));

const mockContext: PRContext = {
  title: 'feat: add new feature',
  description: '## Summary\nThis adds a new feature.\n## Testing\nUnit tested.',
  labels: ['enhancement'],
  author: 'octocat',
};

const mockConfig = {
  titlePattern: '^(feat|fix|chore):',
  requiredLabels: ['enhancement'],
  templatePath: '.github/pull_request_template.md',
};

beforeEach(() => {
  jest.clearAllMocks();
  (config.loadConfig as jest.Mock).mockResolvedValue(mockConfig);
  (checks.runChecks as jest.Mock).mockResolvedValue([
    { name: 'title', passed: true, message: 'Title is valid' },
    { name: 'labels', passed: true, message: 'Labels are valid' },
  ]);
  (template.loadTemplate as jest.Mock).mockResolvedValue(
    '## Summary\n## Testing'
  );
  (template.extractRequiredSections as jest.Mock).mockReturnValue(['Summary', 'Testing']);
  (template.checkDescriptionAgainstTemplate as jest.Mock).mockReturnValue({
    name: 'template',
    passed: true,
    message: 'All required sections present',
  });
});

describe('validatePR', () => {
  it('returns passed summary when all checks pass', async () => {
    const summary: ValidationSummary = await validatePR(mockContext);
    expect(summary.passed).toBe(true);
    expect(summary.failedChecks).toBe(0);
    expect(summary.totalChecks).toBe(3);
  });

  it('returns failed summary when a check fails', async () => {
    (checks.runChecks as jest.Mock).mockResolvedValue([
      { name: 'title', passed: false, message: 'Title does not match pattern' },
    ]);
    const summary = await validatePR(mockContext);
    expect(summary.passed).toBe(false);
    expect(summary.failedChecks).toBe(1);
  });

  it('skips template check when no templatePath in config', async () => {
    (config.loadConfig as jest.Mock).mockResolvedValue({ titlePattern: '^feat:' });
    const summary = await validatePR(mockContext);
    expect(template.loadTemplate).not.toHaveBeenCalled();
    expect(summary.totalChecks).toBe(2);
  });

  it('skips template check when no required sections found', async () => {
    (template.extractRequiredSections as jest.Mock).mockReturnValue([]);
    const summary = await validatePR(mockContext);
    expect(template.checkDescriptionAgainstTemplate).not.toHaveBeenCalled();
  });
});
