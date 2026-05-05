export interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface Config {
  templatePath: string;
  requiredLabels: string[];
  titlePattern?: string;
  failOnMissingTemplate: boolean;
}

export interface PRContext {
  title: string;
  description: string;
  labels: string[];
  author: string;
  number: number;
  repo: string;
  owner: string;
}
