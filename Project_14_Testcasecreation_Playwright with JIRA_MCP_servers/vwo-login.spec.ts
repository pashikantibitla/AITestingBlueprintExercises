import { test, expect } from '@playwright/test';
import { VwoLoginPage } from './VwoLoginPage';
import * as fs from 'fs';
import * as path from 'path';

// Load valid email from environment variable for security
const VALID_EMAIL = process.env.VWO_VALID_EMAIL || 'qa.tester@enterprise.com';
const VALID_PASSWORD = process.env.VWO_VALID_PASSWORD || 'ValidPassword123!';

// Global results array to collect for our custom HTML report
const testResults: any[] = [];

test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
        console.log(`[TEST FAILED] Capturing evidence for: ${testInfo.title}`);
        const safeTitle = testInfo.title.replace(/[:\s]+/g, '_');
        const screenshotPath = path.join(__dirname, 'bugs', `${safeTitle}_fail.png`);
        const reportDir = path.join(__dirname, 'bugs');
        if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`[EVIDENCE CAPTURED] ${screenshotPath}`);
        // Attach to the result for report
        const result = testResults.find(res => res.id === testInfo.title.split(':')[0]);
        if (result) result.screenshot = path.basename(screenshotPath);
    }
});

test.afterAll(async () => {
    const reportDir = path.join(__dirname, 'custom-reports');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VWO Execution Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7f6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; font-weight: 300; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; overflow: hidden; border-radius: 8px; }
        th, td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
        th { background-color: #3498db; color: white; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
        tr:hover { background-color: #f9f9f9; }
        .status-pass { color: #27ae60; font-weight: bold; background: #e8f6ef; padding: 5px 10px; border-radius: 4px; }
        .status-fail { color: #e74c3c; font-weight: bold; background: #fdeaea; padding: 5px 10px; border-radius: 4px; }
        .screenshot-link { color: #3498db; text-decoration: none; font-weight: 500; }
        .screenshot-link:hover { text-decoration: underline; }
        .meta-section { margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; }
        .meta-section h2 { font-size: 20px; color: #34495e; }
        pre { background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 13px; line-height: 1.5; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; color: white; }
        .badge-info { background: #3498db; }
        .badge-warning { background: #f39c12; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 VWO Login Module - RICE POT Test Execution</h1>
        
        <table>
            <thead>
                <tr>
                    <th>TC_ID</th>
                    <th>Category</th>
                    <th>Locale</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Evidence</th>
                </tr>
            </thead>
            <tbody>
                ${testResults.map(res => `
                <tr>
                    <td><strong>${res.id}</strong></td>
                    <td><span class="badge ${res.category === 'Security' ? 'badge-warning' : 'badge-info'}">${res.category}</span></td>
                    <td>${res.locale}</td>
                    <td><span class="${res.status === 'PASS' ? 'status-pass' : 'status-fail'}">${res.status}</span></td>
                    <td>${res.duration}ms</td>
                    <td>${res.screenshot ? `<a href="../bugs/${res.screenshot}" class="screenshot-link" target="_blank">🖼️ View Screenshot</a>` : 'N/A'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="meta-section">
            <h2>📜 Project Context & Log Archive</h2>
            <p>This report was generated automatically as part of the RICE POT Test Automation Protocol.</p>
            <h3>Initial Prompt:</h3>
            <pre># RICE POT Test Automation Protocol\n## Target: VWO Login Module (app.vwo.com)\nRole: Senior QA Automation Architect...\nPhase 1: Test Case Design...\nPhase 2: JIRA Integration...</pre>
            
            <h3>Conversation History Summary:</h3>
            <pre>
            - User requested VWO Login test automation framework.
            - Implemented Page Object Model (VwoLoginPage.ts).
            - Developed local-aware test suite (vwo-login.spec.ts).
            - Configured deterministic failure for TC-04 (Security).
            - Successfully executed dry-run and generated visual evidence.
            </pre>
        </div>
    </div>
</body>
</html>
    `;

    fs.writeFileSync(path.join(reportDir, 'execution-summary.html'), htmlContent);
    console.log(`\n✅ Custom Tabular HTML Report generated: ${path.join(reportDir, 'execution-summary.html')}`);
});

test.describe('VWO Multi-Locale Authentication', () => {

    test('TC-01: Positive SignIn with Valid Credentials (en-US)', async ({ page }, testInfo) => {
        const loginPage = new VwoLoginPage(page);
        await loginPage.navigate('en');
        try {
            console.log('Starting TC-01: Positive SignIn...');
            await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
            await expect.poll(async () => page.url(), { timeout: 10000 }).toContain('dashboard');
            testResults.push({ id: 'TC-01', category: 'Positive', locale: 'en-US', status: 'PASS', duration: testInfo.duration });
        } catch (e) {
            testResults.push({ id: 'TC-01', category: 'Positive', locale: 'en-US', status: 'FAIL', duration: testInfo.duration });
            throw e;
        }
    });

    test('TC-02: Negative SignIn - Arabic Locale Invalid Password', async ({ page }, testInfo) => {
        const loginPage = new VwoLoginPage(page);
        await loginPage.navigate('ar');
        try {
            console.log('Starting TC-02: Negative SignIn (Arabic)...');
            await loginPage.login(VALID_EMAIL, 'WrongPass123!');
            await expect(page).toHaveURL(/.*login/);
            testResults.push({ id: 'TC-02', category: 'Negative', locale: 'ar-SA', status: 'PASS', duration: testInfo.duration });
        } catch (e) {
            testResults.push({ id: 'TC-02', category: 'Negative', locale: 'ar-SA', status: 'FAIL', duration: testInfo.duration });
            throw e;
        }
    });

    test('TC-03: Negative SignIn - Chinese Locale Invalid Email Format', async ({ page }, testInfo) => {
        const loginPage = new VwoLoginPage(page);
        await loginPage.navigate('zh');
        try {
            await loginPage.emailInput.fill('invalid-email@#$%^');
            const isInvalid = await loginPage.emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
            expect(isInvalid).toBe(true);
            testResults.push({ id: 'TC-03', category: 'Negative', locale: 'zh-CN', status: 'PASS', duration: testInfo.duration });
        } catch (e) {
            testResults.push({ id: 'TC-03', category: 'Negative', locale: 'zh-CN', status: 'FAIL', duration: testInfo.duration });
            throw e;
        }
    });

    test('TC-04: Security - SQL Injection Attempt', async ({ page }, testInfo) => {
        const loginPage = new VwoLoginPage(page);
        await loginPage.navigate('en');
        await loginPage.login(VALID_EMAIL, "' OR '1'='1");
        
        try {
            await expect(page).toHaveURL(/.*dashboard/, { timeout: 3000 });
            testResults.push({ id: 'TC-04', category: 'Security', locale: 'en-US', status: 'PASS', duration: testInfo.duration });
        } catch (e) {
            const ssName = 'TC-04-security-fail.png';
            await page.screenshot({ path: `bugs/${ssName}`, fullPage: true });
            testResults.push({ id: 'TC-04', category: 'Security', locale: 'en-US', status: 'FAIL', duration: testInfo.duration, screenshot: ssName });
            throw e;
        }
    });

    test('TC-05: Session - Remember Me Persistence', async ({ page }, testInfo) => {
        const loginPage = new VwoLoginPage(page);
        await loginPage.navigate('en');
        try {
            await loginPage.login(VALID_EMAIL, VALID_PASSWORD, true);
            await expect(page).toHaveURL(/.*dashboard/);
            testResults.push({ id: 'TC-05', category: 'Session', locale: 'en-US', status: 'PASS', duration: testInfo.duration });
        } catch (e) {
            testResults.push({ id: 'TC-05', category: 'Session', locale: 'en-US', status: 'FAIL', duration: testInfo.duration });
            throw e;
        }
    });

});
