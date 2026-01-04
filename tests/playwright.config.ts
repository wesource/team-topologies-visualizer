import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: true, // Tests are now stable - safe to run in parallel
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry once locally, twice in CI
  workers: process.env.CI ? 1 : undefined, // Auto-detect workers locally, serial in CI
  reporter: 'html',
  timeout: 60000, // 60 second timeout per test
  
  use: {
    baseURL: 'http://127.0.0.1:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15000, // Increased to 15 seconds for actions
    navigationTimeout: 45000, // Increased to 45 seconds for navigation and API waits
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
      ? 'cd .. && .\\venv\\Scripts\\python.exe -m uvicorn main:app --port 8000'
      : 'python -m uvicorn main:app --port 8000',
    url: 'http://127.0.0.1:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes timeout
  },
});
