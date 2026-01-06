import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: true, // Tests are now stable - safe to run in parallel
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry once locally, twice in CI
  workers: process.env.CI ? 1 : undefined, // Auto-detect workers locally, serial in CI
  reporter: 'html',
  timeout: process.env.CI ? 30000 : 60000, // 30s in CI, 60s locally
  
  use: {
    baseURL: 'http://127.0.0.1:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000, // 10 seconds for actions
    navigationTimeout: 30000, // 30 seconds for navigation
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: process.platform === 'win32' 
      ? '.\\venv\\Scripts\\python.exe -m uvicorn main:app --port 8000'
      : 'python -m uvicorn main:app --port 8000',
    cwd: '..',
    url: 'http://127.0.0.1:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000, // 1 minute timeout for server startup
    stdout: 'pipe', // Show server output
    stderr: 'pipe',
  },
});
