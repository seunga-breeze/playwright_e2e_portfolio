export interface TestResultData {
  assignee: string;
  site: string;
  tcId: string;
  result: string;
  reason?: string;
  releaseName?: string;
  type?: string;
}

export async function saveTestResult(data: TestResultData): Promise<void> {
  // Inserts the test result into the configured database
}

export async function disconnectDatabase(): Promise<void> {
  // Closes the database connection
}
