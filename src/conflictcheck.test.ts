import * as core from "@actions/core";

import { runConflictCheck, loadConflictConfig } from "./conflictcheck";
import { PRContext } from "./types";

jest.mock("@actions/core");

function makeContext(
  mergeable: boolean | null | undefined,
  mergeable_state?: string
): PRContext {
  return {
    pull_request: {
      number: 1,
      title: "Test PR",
      body: "",
      draft: false,
      mergeable,
      mergeable_state,
    },
  } as unknown as PRContext;
}

describe("runConflictCheck", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns true and skips when disabled", () => {
    const ctx = makeContext(false, "dirty");
    const result = runConflictCheck(ctx, { enabled: false, failOnUnknown: false });
    expect(result).toBe(true);
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  it("fails when PR has conflicts", () => {
    const ctx = makeContext(false, "dirty");
    const result = runConflictCheck(ctx, { enabled: true, failOnUnknown: false });
    expect(result).toBe(false);
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("merge conflicts")
    );
  });

  it("passes when PR is cleanly mergeable", () => {
    const ctx = makeContext(true, "clean");
    const result = runConflictCheck(ctx, { enabled: true, failOnUnknown: false });
    expect(result).toBe(true);
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  it("passes when mergeable is null and failOnUnknown is false", () => {
    const ctx = makeContext(null, "unknown");
    const result = runConflictCheck(ctx, { enabled: true, failOnUnknown: false });
    expect(result).toBe(true);
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  it("fails when mergeable is null and failOnUnknown is true", () => {
    const ctx = makeContext(null, "unknown");
    const result = runConflictCheck(ctx, { enabled: true, failOnUnknown: true });
    expect(result).toBe(false);
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("unknown")
    );
  });
});

describe("loadConflictConfig", () => {
  it("defaults to enabled and failOnUnknown false", () => {
    (core.getInput as jest.Mock).mockReturnValue("");
    const config = loadConflictConfig();
    expect(config.enabled).toBe(true);
    expect(config.failOnUnknown).toBe(false);
  });

  it("disables check when input is 'false'", () => {
    (core.getInput as jest.Mock).mockImplementation((key: string) =>
      key === "conflict_check" ? "false" : ""
    );
    const config = loadConflictConfig();
    expect(config.enabled).toBe(false);
  });
});
