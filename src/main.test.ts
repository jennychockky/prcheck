import * as core from '@actions/core';
import { run } from './main';
import * as context from './context';
import * as config from './config';
import * as template from './template';
import * as checks from './checks';
import * as reporter from './reporter';
import * as summary from './summary';

jest.mock('@actions/core');
jest.mock('./context');
jest.mock('./config');
jest.mock('./template');
jest.mock('./checks');
jest.mock('./reporter');
jest.mock('./summary');

const mockSummary = { addRaw: jest.fn().mockReturnThis(), write: jest.fn().mockResolvedValue(undefined) };

describe('run()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (core.summary as unknown) = mockSummary;
    (context.isPullRequestEvent as jest.Mock).mockReturnValue(true);
    (context.extractPRContext as jest.Mock).mockReturnValue({
      prNumber: 42,
      owner: 'acme',
      repo: 'myrepo',
      title: 'feat: add thing',
      description: '## Summary\nDid stuff',
      labels: ['bug'],
    });
    (config.loadConfig as jest.Mock).mockResolvedValue({ templatePath: '.github/pull_request_template.md', requiredLabels: [] });
    (template.loadTemplate as jest.Mock).mockResolvedValue('## Summary\n');
    (checks.runChecks as jest.Mock).mockReturnValue([{ name: 'title', passed: true, message: 'OK' }]);
    (summary.renderMarkdownSummary as jest.Mock).mockReturnValue('# Summary');
    (reporter.report as jest.Mock).mockImplementation(() => {});
  });

  it('skips when not a pull_request event', async () => {
    (context.isPullRequestEvent as jest.Mock).mockReturnValue(false);
    await run();
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('only runs on pull_request'));
    expect(checks.runChecks).not.toHaveBeenCalled();
  });

  it('runs checks and writes summary on success', async () => {
    await run();
    expect(checks.runChecks).toHaveBeenCalledTimes(1);
    expect(mockSummary.addRaw).toHaveBeenCalledWith('# Summary');
    expect(mockSummary.write).toHaveBeenCalled();
    expect(reporter.report).toHaveBeenCalled();
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  it('calls setFailed when a check does not pass', async () => {
    (checks.runChecks as jest.Mock).mockReturnValue([{ name: 'labels', passed: false, message: 'Missing labels' }]);
    await run();
    expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('One or more PR checks failed'));
  });

  it('warns but continues when template cannot be loaded', async () => {
    (template.loadTemplate as jest.Mock).mockRejectedValue(new Error('File not found'));
    await run();
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('Could not load template'));
    expect(checks.runChecks).toHaveBeenCalled();
  });

  it('calls setFailed on unexpected error', async () => {
    (config.loadConfig as jest.Mock).mockRejectedValue(new Error('boom'));
    await run();
    expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('boom'));
  });
});
