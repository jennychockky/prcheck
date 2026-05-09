import { runSignoffCheck } from "./signoffcheck";
import { SignoffConfig } from "./signoff";
import * as core from "@actions/core";

jest.mock("@actions/core");

const mockedCore = core as jest.Mocked<typeof core>;

const enabledConfig: SignoffConfig = {
  required: true,
  patterns: [],
  minCount: 1,
};

const disabledConfig: SignoffConfig = {
  required: false,
  patterns: [],
  minCount: 1,
};

describe("runSignoffCheck", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true and logs info when signoff is disabled", () => {
    const result = runSignoffCheck(["any commit"], disabledConfig);
    expect(result).toBe(true);
    expect(mockedCore.info).toHaveBeenCalledWith(expect.stringContaining("disabled"));
  });

  it("returns true when commits have valid signoff", () => {
    const messages = ["Fix\n\nSigned-off-by: Dev <dev@example.com>"];
    const result = runSignoffCheck(messages, enabledConfig);
    expect(result).toBe(true);
    expect(mockedCore.setFailed).not.toHaveBeenCalled();
  });

  it("returns false and calls setFailed when signoff is missing", () => {
    const messages = ["No signoff here"];
    const result = runSignoffCheck(messages, enabledConfig);
    expect(result).toBe(false);
    expect(mockedCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("Signoff check failed")
    );
  });

  it("returns true when minCount signoffs are present across commits", () => {
    const messages = [
      "Commit A\n\nSigned-off-by: Alice <alice@example.com>",
      "Commit B\n\nSigned-off-by: Bob <bob@example.com>",
    ];
    const result = runSignoffCheck(messages, { ...enabledConfig, minCount: 2 });
    expect(result).toBe(true);
  });

  it("returns false when fewer signoffs than minCount", () => {
    const messages = ["Commit A\n\nSigned-off-by: Alice <alice@example.com>"];
    const result = runSignoffCheck(messages, { ...enabledConfig, minCount: 2 });
    expect(result).toBe(false);
    expect(mockedCore.setFailed).toHaveBeenCalled();
  });
});
