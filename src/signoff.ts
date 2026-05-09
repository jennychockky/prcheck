import * as core from "@actions/core";

export interface SignoffResult {
  signed: boolean;
  missingSignoffs: string[];
  foundSignoffs: string[];
}

export interface SignoffConfig {
  required: boolean;
  patterns: string[];
  minCount: number;
}

const DEFAULT_PATTERNS = [
  /Signed-off-by:\s+.+<.+@.+>/i,
  /Co-authored-by:\s+.+<.+@.+>/i,
];

export function checkSignoffs(
  commitMessages: string[],
  config: SignoffConfig
): SignoffResult {
  if (!config.required) {
    return { signed: true, missingSignoffs: [], foundSignoffs: [] };
  }

  const patterns =
    config.patterns.length > 0
      ? config.patterns.map((p) => new RegExp(p, "i"))
      : DEFAULT_PATTERNS;

  const foundSignoffs: string[] = [];

  for (const message of commitMessages) {
    for (const pattern of patterns) {
      const matches = message.match(new RegExp(pattern.source, "gim"));
      if (matches) {
        foundSignoffs.push(...matches.map((m) => m.trim()));
      }
    }
  }

  const unique = [...new Set(foundSignoffs)];
  const signed = unique.length >= config.minCount;

  const missingSignoffs =
    signed
      ? []
      : [`Requires at least ${config.minCount} signoff(s), found ${unique.length}`];

  return { signed, missingSignoffs, foundSignoffs: unique };
}

export function logSignoffResult(result: SignoffResult): void {
  if (result.signed) {
    core.info(`✅ Signoff check passed. Found: ${result.foundSignoffs.join(", ") || "none required"}`);
  } else {
    for (const msg of result.missingSignoffs) {
      core.warning(`❌ Signoff check failed: ${msg}`);
    }
  }
}
