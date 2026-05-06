import * as fs from 'fs';
import * as path from 'path';

export interface ChangelogEntry {
  version: string;
  date: string;
  sections: Record<string, string[]>;
}

export function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const versionRegex = /^## \[(.+?)\](?: - (\d{4}-\d{2}-\d{2}))?/m;
  const sectionRegex = /^### (.+)/m;

  const blocks = content.split(/(?=^## \[)/m).filter(Boolean);

  for (const block of blocks) {
    const versionMatch = block.match(versionRegex);
    if (!versionMatch) continue;

    const version = versionMatch[1];
    const date = versionMatch[2] ?? 'Unreleased';
    const sections: Record<string, string[]> = {};

    const sectionBlocks = block.split(/(?=^### )/m).slice(1);
    for (const sectionBlock of sectionBlocks) {
      const titleMatch = sectionBlock.match(sectionRegex);
      if (!titleMatch) continue;
      const title = titleMatch[1].trim();
      const items = sectionBlock
        .split('\n')
        .slice(1)
        .map(line => line.replace(/^- /, '').trim())
        .filter(Boolean);
      sections[title] = items;
    }

    entries.push({ version, date, sections });
  }

  return entries;
}

export function loadChangelog(filePath: string = 'CHANGELOG.md'): ChangelogEntry[] {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    return [];
  }
  const content = fs.readFileSync(resolved, 'utf-8');
  return parseChangelog(content);
}

export function getLatestEntry(entries: ChangelogEntry[]): ChangelogEntry | null {
  return entries.length > 0 ? entries[0] : null;
}

export function hasUnreleasedChanges(entries: ChangelogEntry[]): boolean {
  return entries.some(e => e.version.toLowerCase() === 'unreleased');
}
