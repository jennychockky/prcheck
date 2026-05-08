import * as core from "@actions/core";
import { runLinkedIssueCheck } from "./linkedcheck";

jest.mock("@actions/core");

const mockSetFailed = core.setFailed as jest.Mock;
const mockSetOutput = core.setOutput as jest.Mock;
const mockInfo = core.info as jest.Mock;
const mockWarning = core.warning as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("runLinkedIssueCheck", () => {
  it("passes and sets outputs when issue found and required", () => {
    const output = runLinkedIssueCheck("Closes #10", { required: true });
    expect(output.passed).toBe(true);
    expect(mockSetOutput).toHaveBeenCalledWith("linked_issues", "10");
    expect(mockSetOutput).toHaveBeenCalledWith("linked_issue_count", "1");
    expect(mockSetOutput).toHaveBeenCalledWith("linked_issue_check_passed", "true");
    expect(mockSetFailed).not.toHaveBeenCalled();
  });

  it("fails and calls setFailed when required but no issues", () => {
    const output = runLinkedIssueCheck("no issue here", { required: true });
    expect(output.passed).toBe(false);
    expect(mockSetFailed).toHaveBeenCalledTimes(1);
    expect(mockSetOutput).toHaveBeenCalledWith("linked_issue_count", "0");
    expect(mockSetOutput).toHaveBeenCalledWith("linked_issue_check_passed", "false");
  });

  it("passes when not required and no issues", () => {
    const output = runLinkedIssueCheck("no issue", { required: false });
    expect(output.passed).toBe(true);
    expect(mockSetFailed).not.toHaveBeenCalled();
  });

  it("sets linked_issues as comma-separated when multiple", () => {
    const output = runLinkedIssueCheck("Closes #3\nFixes #7", { required: true, minCount: 2 });
    expect(output.passed).toBe(true);
    expect(mockSetOutput).toHaveBeenCalledWith("linked_issues", "3,7");
    expect(mockSetOutput).toHaveBeenCalledWith("linked_issue_count", "2");
  });

  it("fails when minCount not met", () => {
    const output = runLinkedIssueCheck("Closes #1", { required: true, minCount: 3 });
    expect(output.passed).toBe(false);
    expect(mockSetFailed).toHaveBeenCalled();
  });
});
