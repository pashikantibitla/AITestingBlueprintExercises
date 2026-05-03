import { Reporter, TestCase, TestResult, FullResult, FullConfig } from '@playwright/test/reporter';

class CustomReporter implements Reporter {
    onBegin(config: FullConfig, suite: any) {
        console.log(`🚀 Starting the suite with ${suite.allTests().length} tests`);
    }

    onTestBegin(test: TestCase) {
        console.log(`\n👉 Running test: ${test.title}`);
    }

    onTestEnd(test: TestCase, result: TestResult) {
        const duration = result.duration;
        if (result.status === 'passed') {
            console.log(`✅ Passed: ${test.title} (${duration}ms)`);
        } else {
            console.log(`❌ Failed: ${test.title} (${duration}ms)`);
            console.log(`   Error: ${result.error?.message}`);
        }
    }

    async onEnd(result: FullResult) {
        console.log(`\n🏁 Finished the suite with status: ${result.status}`);
    }
}

export default CustomReporter;
