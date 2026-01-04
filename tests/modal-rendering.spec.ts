import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000';

test.describe('Modal Rendering', () => {
  test('should render validation modal with content', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.waitForResponse(response => response.url().includes('/api/teams'), { timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Open validation modal
    const validateBtn = page.locator('#validateBtn');
    await validateBtn.click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#validationModal');
    await expect(modal).toBeVisible();
    
    const report = page.locator('#validationReport');
    await expect(report).toBeVisible();
    
    // Check report has content
    const reportText = await report.textContent();
    expect(reportText).toBeTruthy();
    expect(reportText.length).toBeGreaterThan(0);
    
    // Close modal
    const closeBtn = modal.locator('.close');
    await closeBtn.click();
    await page.waitForTimeout(200);
  });
});
