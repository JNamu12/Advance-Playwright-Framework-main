import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    testDir: './src/tests',
    timeout: process.env.CI ? 90000 : 60000,
    expect: { timeout: 10000 },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : 3,

    reporter: [
        ['./src/utils/CustomTTAReporter.ts'],
        ['html', { open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['list'],
        ['junit', { outputFile: 'results/junit.xml' }]
    ],

    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
        navigationTimeout: 30000,
    },

    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        //    ? { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        // { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    ],
});

