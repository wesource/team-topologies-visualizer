import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000';

test.describe('UI Basic Features', () => {
  test('should load the application', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Check title
    await expect(page).toHaveTitle(/Team Topologies Visualizer/);
    
    // Check main elements exist
    await expect(page.locator('h1')).toContainText('Team Topologies Visualizer');
    await expect(page.locator('#teamCanvas')).toBeVisible();
    await expect(page.locator('.legend')).toBeVisible();
  });

  test('should have both view radio buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    const currentStateRadio = page.locator('input[value="current"]');
    const ttVisionRadio = page.locator('input[value="tt"]');
    
    await expect(currentStateRadio).toBeVisible();
    await expect(ttVisionRadio).toBeVisible();
    
    // TT Design should be checked by default
    await expect(ttVisionRadio).toBeChecked();
  });

  test('should switch between Pre-TT and TT Design', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.waitForResponse(response => response.url().includes('/api/teams'), { timeout: 10000 });
    
    const currentStateRadio = page.locator('input[value="current"]');
    const ttVisionRadio = page.locator('input[value="tt"]');
    
    // Switch to Pre-TT view
    await currentStateRadio.click();
    await page.waitForTimeout(500);
    
    // Verify Pre-TT is selected
    await expect(currentStateRadio).toBeChecked();
    
    // Switch back to TT Design
    await ttVisionRadio.click();
    await page.waitForTimeout(500);
    
    // Verify TT Design is selected
    await expect(ttVisionRadio).toBeChecked();
  });

  test('should display teams in sidebar', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.waitForResponse(response => response.url().includes('/api/teams'), { timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Check team list exists
    const teamList = page.locator('#teamList');
    await expect(teamList).toBeVisible();
    
    // Check we have team items
    const teamItems = page.locator('#teamList .team-item');
    expect(await teamItems.count()).toBeGreaterThan(0);
    
    // Check first team has a name
    const firstTeam = teamItems.first();
    const teamName = await firstTeam.textContent();
    expect(teamName).toBeTruthy();
  });

  test('should have canvas with proper dimensions', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    const canvas = page.locator('#teamCanvas');
    await expect(canvas).toBeVisible();
    
    // Check canvas has dimensions set
    const width = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    const height = await canvas.evaluate((el: HTMLCanvasElement) => el.height);
    
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test('should display legend with team types', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.waitForResponse(response => response.url().includes('/api/teams'), { timeout: 10000 });
    
    const legend = page.locator('.legend');
    await expect(legend).toBeVisible();
    
    // Check for team type labels
    await expect(legend).toContainText('Stream-aligned');
    await expect(legend).toContainText('Enabling');
    await expect(legend).toContainText('Complicated Subsystem');
    await expect(legend).toContainText('Platform');
  });

  test('should render Pre-TT view for visual verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Switch to Pre-TT view
    const currentStateRadio = page.locator('input[value="current"]');
    await currentStateRadio.click();
    
    // Wait for org hierarchy to load
    await page.waitForResponse(
      response => response.url().includes('/api/organization-hierarchy'),
      { timeout: 10000 }
    );
    
    await page.waitForTimeout(1000);
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'tests/screenshots/pre-tt-view.png', fullPage: true });
  });

  test('should render TT Vision view for visual verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Wait for teams to load (TT Design is default)
    await page.waitForResponse(
      response => response.url().includes('/api/teams?view=tt'),
      { timeout: 10000 }
    );
    
    await page.waitForTimeout(1000);
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'tests/screenshots/tt-design-view.png', fullPage: true });
  });

  test('should handle refresh button', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.waitForResponse(response => response.url().includes('/api/teams'), { timeout: 10000 });
    
    const refreshBtn = page.locator('#refreshBtn');
    await expect(refreshBtn).toBeVisible();
    
    // Click refresh
    await refreshBtn.click();
    
    // Wait for API to be called again
    await page.waitForResponse(response => response.url().includes('/api/teams'), { timeout: 10000 });
    await page.waitForTimeout(500);
  });
});
