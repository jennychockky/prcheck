import { checkSignoffs, SignoffConfig } from "./signoff";

const baseConfig: SignoffConfig = {
  required: true,
  patterns: [],
  minCount: 1,
};

describe("checkSignoffs", () => {
  it("returns signed=true when not required", () => {
    const result = checkSignoffs(["some commit"], { ...baseConfig, required: false });
    expect(result.signed).toBe(true);
    expect(result.missingSignoffs).toHaveLength(0);
  });

  it("detects Signed-off-by in commit message", () => {
    const messages = ["Fix bug\n\nSigned-off-by: Jane Doe <jane@example.com>"];
    const result = checkSignoffs(messages, baseConfig);
    expect(result.signed).toBe(true);
    expect(result.foundSignoffs).toHaveLength(1);
    expect(result.foundSignoffs[0]).toMatch(/Signed-off-by/i);
  });

  it("detects Co-authored-by in commit message", () => {
    const messages = ["Add feature\n\nCo-authored-by: John Smith <john@example.com>"];
    const result = checkSignoffs(messages, baseConfig);
    expect(result.signed).toBe(true);
  });

  it("fails when no signoff found and required", () => {
    const messages = ["Just a commit with no signoff"];
    const result = checkSignoffs(messages, baseConfig);
    expect(result.signed).toBe(false);
    expect(result.missingSignoffs).toHaveLength(1);
    expect(result.missingSignoffs[0]).toMatch(/Requires at least 1/);
  });

  it("respects minCount", () => {
    const messages = [
      "Commit 1\n\nSigned-off-by: Alice <alice@example.com>",
      "Commit 2\n\nSigned-off-by: Bob <bob@example.com>",
    ];
    const result = checkSignoffs(messages, { ...baseConfig, minCount: 2 });
    expect(result.signed).toBe(true);
    expect(result.foundSignoffs).toHaveLength(2);
  });

  it("deduplicates identical signoffs", () => {
    const messages = [
      "Commit 1\n\nSigned-off-by: Alice <alice@example.com>",
      "Commit 2\n\nSigned-off-by: Alice <alice@example.com>",
    ];
    const result = checkSignoffs(messages, { ...baseConfig, minCount: 1 });
    expect(result.foundSignoffs).toHaveLength(1);
  });

  it("uses custom patterns when provided", () => {
    const messages = ["Approved-by: manager"];
    const result = checkSignoffs(messages, {
      ...baseConfig,
      patterns: ["Approved-by:\\s+.+"],
    });
    expect(result.signed).toBe(true);
  });
});
