import * as core from "@actions/core";
import { loadFileSizeConfig, runFileSizeCheck } from "./filesizecheck";
import { ChangedFile } from "./filesize";

jest.mock("@actions/core");

const mockGetInput = core.getInput as jest.Mock;

function makeFile(overrides: Partial<ChangedFile> = {}): ChangedFile {
  return {
    filename: "src/index.ts",
    additions: 5,
    deletions: 1,
    changes: 6,
    status: "modified",
    size: 50 * 1024,
    ...overrides,
  };
}

describe("loadFileSizeConfig", () => {
  it("returns defaults when inputs are empty", () => {
    mockGetInput.mockReturnValue("");
    const config = loadFileSizeConfig();
    expect(config.maxFileSizeKb).toBe(500);
    expect(config.warnFileSizeKb).toBe(200);
    expect(config.blockedExtensions).toEqual([]);
  });

  it("parses blocked extensions correctly", () => {
    mockGetInput.mockImplementation((key: string) => {
      if (key === "blocked_extensions") return ".mp4, .exe, zip";
      return "";
    });
    const config = loadFileSizeConfig();
    expect(config.blockedExtensions).toEqual(["mp4", "exe", "zip"]);
  });
});

describe("runFileSizeCheck", () => {
  beforeEach(() => {
    mockGetInput.mockReturnValue("");
    jest.clearAllMocks();
  });

  it("returns true when all files pass", () => {
    const files = [makeFile()];
    const result = runFileSizeCheck(files);
    expect(result).toBe(true);
  });

  it("returns false when a file is too large", () => {
    const files = [makeFile({ size: 600 * 1024 })];
    const result = runFileSizeCheck(files);
    expect(result).toBe(false);
    expect(core.setFailed).toHaveBeenCalled();
  });
});
