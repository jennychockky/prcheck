import { computeMetrics, logMetrics, exportMetricOutputs } from './metrics';
import { CheckResult } from './types';
import * as core from '@actions/core';

jest.mock('@actions/core');

const mockResults: CheckResult[] = [
  { name: 'title', status: 'pass', message: 'Title looks good' },
  { name: 'labels', status: 'fail', message: 'Missing required label' },
  { name: 'template', status: 'pass', message: 'All sections present' },
  { name: 'description', status: 'skip', message: 'Skipped: no template configured' },
];

describe('computeMetrics', () => {
  it('counts checks by status correctly', () => {
    const metrics = computeMetrics(mockResults);
    expect(metrics.totalChecks).toBe(4);
    expect(metrics.passedChecks).toBe(2);
    expect(metrics.failedChecks).toBe(1);
    expect(metrics.skippedChecks).toBe(1);
  });

  it('calculates pass rate as a percentage', () => {
    const metrics = computeMetrics(mockResults);
    expect(metrics.passRate).toBe(50);
  });

  it('returns 0 pass rate for empty results', () => {
    const metrics = computeMetrics([]);
    expect(metrics.passRate).toBe(0);
    expect(metrics.totalChecks).toBe(0);
  });

  it('collects all check names', () => {
    const metrics = computeMetrics(mockResults);
    expect(metrics.checkNames).toEqual(['title', 'labels', 'template', 'description']);
  });

  it('collects only failed check names', () => {
    const metrics = computeMetrics(mockResults);
    expect(metrics.failedCheckNames).toEqual(['labels']);
  });

  it('handles all passing checks', () => {
    const allPass: CheckResult[] = [
      { name: 'title', status: 'pass', message: 'ok' },
      { name: 'labels', status: 'pass', message: 'ok' },
    ];
    const metrics = computeMetrics(allPass);
    expect(metrics.passRate).toBe(100);
    expect(metrics.failedCheckNames).toHaveLength(0);
  });
});

describe('logMetrics', () => {
  it('logs metrics info to core', () => {
    const metrics = computeMetrics(mockResults);
    logMetrics(metrics);
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining('Total checks'));
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining('Pass rate'));
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('labels'));
  });
});

describe('exportMetricOutputs', () => {
  it('sets github action outputs for metrics', () => {
    const metrics = computeMetrics(mockResults);
    exportMetricOutputs(metrics);
    expect(core.setOutput).toHaveBeenCalledWith('total_checks', '4');
    expect(core.setOutput).toHaveBeenCalledWith('passed_checks', '2');
    expect(core.setOutput).toHaveBeenCalledWith('failed_checks', '1');
    expect(core.setOutput).toHaveBeenCalledWith('pass_rate', '50');
  });
});
