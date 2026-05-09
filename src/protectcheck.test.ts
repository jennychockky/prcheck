import { loadProtectConfig, runProtectionCheck } from "./protectcheck";
import * as core from "@actions/core";

jest.mock("@actions/core");

describe("loadProtectConfig", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns defaults when inputs are empty", () => {
    (core.getInput as jest.Mock).mockReturnValue("");
    const config = loadProtectConfig();
    expect(config.enabled).toBe(true);
    expect(config.protectedBranches).toEqual(["main", "master"]);
    expect(config.requireSignedCommits).toBe(false);
    expect(config.requireLinearHistory).toBe(false);
    expect(config.allowForcePush).toBe(false);
  });

  it("parses custom protected branches", () => {
    (core.getInput as jest.Mock).mockImplementation((key: string) => {
      if (key === "protected_branches") return "main, develop, release/*";
      return "";
    });
    const config = loadProtectConfig();
    expect(config.protectedBranches).toEqual(["main", "develop", "release/*"]);
  });

  it("disables check when input is false", () => {
    (core.getInput as jest.Mock).mockImplementation((key: string) => {
      if (key === "check_branch_protection") return "false";
      return "";
    });
    const config = loadProtectConfig();
    expect(config.enabled).toBe(false);
  });
});

describe("runProtectionCheck", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns passing result for non-protected branch", () => {
    const result = runProtectionCheck("feature/xyz", {
      enabled: true,
      protectedBranches: ["main"],
      requireSignedCommits: false,
      requireLinearHistory: false,
      allowForcePush: false,
    });
    expect(result.passed).toBe(true);
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  it("calls setFailed on violation", () => {
    runProtectionCheck("main", {
      enabled: true,
      protectedBranches: ["main"],
      requireSignedCommits: false,
      requireLinearHistory: true,
      allowForcePush: true,
    });
    expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining("failed"));
  });
});
