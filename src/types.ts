export interface PRContext {
  title: string;
  body: string;
  labels: string[];
  number: number;
  owner: string;
  repo: string;
}

export interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface Config {
  templatePath?: string;
  requireLabels?: boolean;
  requiredLabels?: string[];
  titlePattern?: string;
  failFast?: boolean;
}

export interface ReportOptions {
  writeSummary?: boolean;
  failOnError?: boolean;
}
