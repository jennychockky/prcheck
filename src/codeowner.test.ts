import {
  parseCodeowners,
  resolveRequiredOwners,
  checkCodeOwnerApprovals,
} from "./codeowner";
import { PRContext } from "./types";

const baseCtx = { number: 1, title: "test", description: "", labels: [], author: "dev" } as unknown as PRContext;

describe("parseCodeowners", () => {
  it("parses basic entries", () => {
    const content = "*.ts @alice @bob\nsrc/ @carol";
    const map = parseCodeowners(content);
    expect(map.get("*.ts")).toEqual(["alice", "bob"]);
    expect(map.get("src/")).toEqual(["carol"]);
  });

  it("ignores comments and blank lines", () => {
    const content = "# comment\n\n*.md @dave";
    const map = parseCodeowners(content);
    expect(map.size).toBe(1);
    expect(map.get("*.md")).toEqual(["dave"]);
  });

  it("strips @ prefix from owners", () => {
    const map = parseCodeowners("*.json @eve");
    expect(map.get("*.json")).toEqual(["eve"]);
  });
});

describe("resolveRequiredOwners", () => {
  it("returns owners matching changed files", () => {
    const map = new Map([["*.ts", ["alice"]], ["docs/", ["bob"]]]);
    const owners = resolveRequiredOwners(["src/index.ts", "docs/readme.md"], map);
    expect(owners).toContain("alice");
    expect(owners).toContain("bob");
  });

  it("deduplicates owners across files", () => {
    const map = new Map([["*.ts", ["alice"]]]);
    const owners = resolveRequiredOwners(["a.ts", "b.ts"], map);
    expect(owners.filter((o) => o === "alice").length).toBe(1);
  });

  it("returns empty array when no patterns match", () => {
    const map = new Map([["*.go", ["gopher"]]]);
    const owners = resolveRequiredOwners(["src/index.ts"], map);
    expect(owners).toHaveLength(0);
  });
});

describe("checkCodeOwnerApprovals", () => {
  const codeowners = "*.ts @alice\nsrc/ @bob";

  it("passes when all required owners approved", () => {
    const result = checkCodeOwnerApprovals(baseCtx, ["index.ts"], codeowners, ["alice"]);
    expect(result.pass).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it("fails when an owner has not approved", () => {
    const result = checkCodeOwnerApprovals(baseCtx, ["index.ts"], codeowners, ["bob"]);
    expect(result.pass).toBe(false);
    expect(result.missing).toContain("alice");
  });

  it("is case-insensitive for approvals", () => {
    const result = checkCodeOwnerApprovals(baseCtx, ["index.ts"], codeowners, ["ALICE"]);
    expect(result.pass).toBe(true);
  });

  it("passes with no changed files matching patterns", () => {
    const result = checkCodeOwnerApprovals(baseCtx, ["README.md"], codeowners, []);
    expect(result.pass).toBe(true);
  });
});
