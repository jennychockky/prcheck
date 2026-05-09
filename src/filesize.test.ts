import { checkFileSizes, ChangedFile, FileSizeConfig } from "./filesize";

function makeFile(overrides: Partial<ChangedFile> = {}): ChangedFile {
  return {
    filename: "src/index.ts",
    additions: 10,
    deletions: 2,
    changes: 12,
    status: "modified",
    size: 1024,
    ...overrides,
  };
}

describe("checkFileSizes", () => {
  const baseConfig: FileSizeConfig = {
    maxFileSizeKb: 500,
    warnFileSizeKb: 200,
    blockedExtensions: [],
  };

  it("passes when all files are within limits", () => {
    const files = [makeFile({ size: 100 * 1024 })];
    const result = checkFileSizes(files, baseConfig);
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("warns when file exceeds warn threshold", () => {
    const files = [makeFile({ size: 250 * 1024 })];
    const result = checkFileSizes(files, baseConfig);
    expect(result.passed).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("large");
  });

  it("errors when file exceeds max size", () => {
    const files = [makeFile({ size: 600 * 1024 })];
    const result = checkFileSizes(files, baseConfig);
    expect(result.passed).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("exceeds max size");
  });

  it("errors on blocked extension", () => {
    const files = [makeFile({ filename: "assets/video.mp4", size: 10 * 1024 })];
    const config = { ...baseConfig, blockedExtensions: ["mp4", "exe"] };
    const result = checkFileSizes(files, config);
    expect(result.passed).toBe(false);
    expect(result.errors[0]).toContain(".mp4");
  });

  it("reports correct checkedFiles count", () => {
    const files = [makeFile(), makeFile({ filename: "src/utils.ts" })];
    const result = checkFileSizes(files, baseConfig);
    expect(result.checkedFiles).toBe(2);
  });

  it("skips size check when size is undefined", () => {
    const files = [makeFile({ size: undefined })];
    const result = checkFileSizes(files, baseConfig);
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
