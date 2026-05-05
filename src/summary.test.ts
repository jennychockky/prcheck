import { buildSummarySections, renderMarkdownSummary, SummarySection } from './summary';
import { CheckResult } from './types';

describe('buildSummarySections', () => {
  it('maps passing CheckResult to SummarySection with passed=true', () => {
    const results: CheckResult[] = [
      { name: 'Title Check', passed: true, message: 'Title is valid' },
    ];
    const sections = buildSummarySections(results);
    expect(sections).toHaveLength(1);
    expect(sections[0]).toEqual({
      label: 'Title Check',
      passed: true,
      details: 'Title is valid',
    });
  });

  it('maps failing CheckResult to SummarySection with passed=false', () => {
    const results: CheckResult[] = [
      { name: 'Label Check', passed: false, message: 'No labels applied' },
    ];
    const sections = buildSummarySections(results);
    expect(sections[0].passed).toBe(false);
    expect(sections[0].details).toBe('No labels applied');
  });

  it('handles multiple results', () => {
    const results: CheckResult[] = [
      { name: 'Title Check', passed: true, message: 'OK' },
      { name: 'Label Check', passed: false, message: 'Missing label' },
      { name: 'Template Check', passed: true, message: 'All sections present' },
    ];
    const sections = buildSummarySections(results);
    expect(sections).toHaveLength(3);
    expect(sections.map((s) => s.passed)).toEqual([true, false, true]);
  });

  it('handles empty results array', () => {
    const sections = buildSummarySections([]);
    expect(sections).toEqual([]);
  });
});

describe('renderMarkdownSummary', () => {
  it('renders a markdown table with passed and failed checks', () => {
    const sections: SummarySection[] = [
      { label: 'Title Check', passed: true, details: 'Title is valid' },
      { label: 'Label Check', passed: false, details: 'No labels applied' },
    ];
    const md = renderMarkdownSummary(sections);
    expect(md).toContain('## PR Check Results');
    expect(md).toContain('✅');
    expect(md).toContain('❌');
    expect(md).toContain('Title Check');
    expect(md).toContain('Label Check');
  });

  it('renders empty table for no sections', () => {
    const md = renderMarkdownSummary([]);
    expect(md).toContain('## PR Check Results');
    expect(md).toContain('| Status | Check | Details |');
  });

  it('handles sections without details', () => {
    const sections: SummarySection[] = [
      { label: 'Template Check', passed: true },
    ];
    const md = renderMarkdownSummary(sections);
    expect(md).toContain('Template Check');
    expect(md).not.toContain('undefined');
  });
});
