import * as core from "@actions/core";

export interface WordCountConfig {
  minWords?: number;
  maxWords?: number;
  countTitle?: boolean;
}

export interface WordCountResult {
  passed: boolean;
  wordCount: number;
  minWords?: number;
  maxWords?: number;
  message: string;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function checkWordCount(
  description: string,
  config: WordCountConfig,
  title?: string
): WordCountResult {
  let text = description;
  if (config.countTitle && title) {
    text = `${title} ${description}`;
  }

  const wordCount = countWords(text);
  const { minWords, maxWords } = config;

  if (minWords !== undefined && wordCount < minWords) {
    return {
      passed: false,
      wordCount,
      minWords,
      maxWords,
      message: `PR description has ${wordCount} word(s), but at least ${minWords} are required.`,
    };
  }

  if (maxWords !== undefined && wordCount > maxWords) {
    return {
      passed: false,
      wordCount,
      minWords,
      maxWords,
      message: `PR description has ${wordCount} word(s), but no more than ${maxWords} are allowed.`,
    };
  }

  return {
    passed: true,
    wordCount,
    minWords,
    maxWords,
    message: `PR description word count (${wordCount}) is within acceptable range.`,
  };
}

export function logWordCountResult(result: WordCountResult): void {
  if (result.passed) {
    core.info(`[wordcount] ${result.message}`);
  } else {
    core.warning(`[wordcount] ${result.message}`);
  }
}
