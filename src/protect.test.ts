import { checkBranchProtection, logProtectionResult } from "./protect";
import type { ProtectedBranchConfig } from "./protect";
import * as core from "@actions/core";

jest.mock("@actions/core");

const baseConfig: ProtectedBranchConfig = {
  enabled: true,
  protectedBranches: ["main", "release/*"],
  requireSignedCommits: false,
  requireLinearHistory: false,
  allowForcePush: false,
};

describe("checkBranchProtection", () => {
  it("passes when disabled", () => {
    const result = checkBranchProtection("main", { ...baseConfig, enabled: false });
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("passes for non-protected branch", () => {
    const result = checkBranchProtection("feature/foo", baseConfig);
    expect(result.passed).toBe(true);
  });

  it("passes for protected branch with no violations", () => {
    const result = checkBranchProtection("main", baseConfig);
    expect(result.passed).toBe(true);
  });

  it("matches wildcard protected branch pattern", () => {
    const result = checkBranchProtection("release/1.0", baseConfig);
    expect(result.passed).toBe(true);
    expect(result.branch).toBe("release/1.0");
  });

  it("detects conflict between requireLinearHistory and allowForcePush", () => {
    const result = checkBranchProtection("main", {
      ...baseConfig,
      requireLinearHistory: true,
      allowForcePush: true,
    });
    expect(result.passed).toBe(false);
    expect(result.violations[0]).toMatch(/conflict/);
  });
});

describe("logProtectionResult", () => {
  it("logs success with core.info", () => {
    logProtectionResult({ passed: true, branch: "main", violations: [] });
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("passed"));
  });

  it("logs warnings for violations", () => {
    logProtectionResult({
      passed: false,
      branch: "main",
      violations: ["some violation"],
    });
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining("issues"));
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining("some violation"));
  });
});
