import { countWords, checkWordCount } from "./wordcount";

describe("countWords", () => {
  it("returns 0 for empty string", () => {
    expect(countWords("")).toBe(0);
  });

  it("returns 0 for whitespace-only string", () => {
    expect(countWords("   ")).toBe(0);
  });

  it("counts single word", () => {
    expect(countWords("hello")).toBe(1);
  });

  it("counts multiple words", () => {
    expect(countWords("fix the broken tests")).toBe(4);
  });

  it("handles extra whitespace between words", () => {
    expect(countWords("word1   word2\tword3")).toBe(3);
  });

  it("handles newlines as whitespace", () => {
    expect(countWords("line one\nline two\nline three")).toBe(6);
  });
});

describe("checkWordCount", () => {
  it("passes when no min or max is set", () => {
    const result = checkWordCount("some description text", {});
    expect(result.passed).toBe(true);
    expect(result.wordCount).toBe(3);
  });

  it("fails when below minWords", () => {
    const result = checkWordCount("short", { minWords: 10 });
    expect(result.passed).toBe(false);
    expect(result.message).toContain("at least 10");
  });

  it("passes when at exactly minWords", () => {
    const result = checkWordCount("one two three", { minWords: 3 });
    expect(result.passed).toBe(true);
  });

  it("fails when above maxWords", () => {
    const result = checkWordCount("one two three four five", { maxWords: 3 });
    expect(result.passed).toBe(false);
    expect(result.message).toContain("no more than 3");
  });

  it("passes when at exactly maxWords", () => {
    const result = checkWordCount("one two three", { maxWords: 3 });
    expect(result.passed).toBe(true);
  });

  it("includes title in word count when countTitle is true", () => {
    const result = checkWordCount("body text", { minWords: 4, countTitle: true }, "title words");
    expect(result.passed).toBe(true);
    expect(result.wordCount).toBe(4);
  });

  it("does not include title when countTitle is false", () => {
    const result = checkWordCount("body", { minWords: 3, countTitle: false }, "title words here");
    expect(result.passed).toBe(false);
    expect(result.wordCount).toBe(1);
  });

  it("passes with both min and max satisfied", () => {
    const result = checkWordCount("a valid description here", { minWords: 2, maxWords: 10 });
    expect(result.passed).toBe(true);
  });
});
