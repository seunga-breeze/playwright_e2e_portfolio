import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { saveTestResult, disconnectDatabase } from './connection';

interface TestMetadata {
  siteCode?: string;
}

type TestStatus = 'Pass' | 'Fail' | 'N/A' | 'Exception';

interface TestResultData {
  status: TestStatus;
  reason: string;
}

class DatabaseReporter implements Reporter {
  name = 'database-reporter';

  async onTestEnd(test: TestCase, result: TestResult) {
    try {
      const metadata = await this.extractTestMetadata(test);
      const { status, reason } = this.mapTestStatus(result);

      await saveTestResult({
        assignee: '',
        site: metadata.siteCode || '',
        tcId: test.title,
        result: status,
        reason,
        releaseName: '',
        type: 'E2E',
      });

    } catch (error) {
      console.error(`Database Reporter test result save failed: ${test.title}`, error);
    }
  }

  async onEnd() {
    try {
      await disconnectDatabase();
    } catch (error) {
      console.error('Database Reporter connection close failed:', error);
    }
  }

  private async extractTestMetadata(test: TestCase): Promise<TestMetadata> {
    const metadata: TestMetadata = {};
    try {
      const project = test.parent?.project();
      if (project?.metadata?.siteCode) {
        metadata.siteCode = project.metadata.siteCode.toUpperCase();
      }
    } catch (error) {
      console.warn(`Database Reporter metadata extraction failed: ${error}`);
    }
    return metadata;
  }

  private mapTestStatus(result: TestResult): TestResultData {
    const statusMap: Record<string, TestStatus> = {
      passed: 'Pass',
      skipped: 'N/A',
      failed: 'Fail',
      timedOut: 'Fail',
    };

    return {
      status: statusMap[result.status] || 'Exception',
      reason: this.getErrorMessage(result),
    };
  }

  private getErrorMessage(result: TestResult): string {
    const stripAnsi = (str: string) =>
      str.replace(/\x1B\[[0-9;]*[mGKHF]/g, '');

    if (result.errors && result.errors.length > 0) {
      return result.errors
        .map(e => stripAnsi(e.message || '').split('\n')[0])
        .join('\n');
    }

    if (!result.error?.message) {
      return result.status === 'skipped' ? 'Test skipped' : '';
    }

    const message = stripAnsi(result.error.message).split('\n')[0];
    return message.includes('Timeout') ? 'Test timeout' : message;
  }
}

export default DatabaseReporter;
