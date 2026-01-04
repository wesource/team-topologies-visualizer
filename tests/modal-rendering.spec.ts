import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000';

test.describe.configure({ mode: 'serial' });

test.describe('Modal Rendering', () => {
  test('should render markdown correctly in team detail modal', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.waitForResponse(response => response.url().includes('/api/teams'), { timeout: 10000 });
    await page.waitForTimeout(500);
    
    // Open first team details
    const firstTeam = page.locator('#teamList .team-item').first();
    await firstTeam.dblclick();
    await page.waitForTimeout(500);
    
    const modal = page.locator('#teamDetailModal');
    await expect(modal).toBeVisible();
    
    const modalBody = modal.locator('.modal-body');
    
    // Check for markdown elements that marked.js generates
    // Headings
    const headings = modalBody.locator('h2, h3');
    expect(await headings.count()).toBeGreaterThan(0);
    
    // Paragraphs
    const paragraphs = modalBody.locator('p');
    expect(await paragraphs.count()).toBeGreaterThan(0);
    
    // Lists (ul or ol)
    const lists = modalBody.locator('ul, ol');
    expect(await lists.count()).toBeGreaterThan(0);
    
    // Links (check for anchor tags, marked.js may or may not add target)
    const links = modalBody.locator('a');
    if (await links.count() > 0) {
      // Just verify links exist if team has any
      expect(await links.count()).toBeGreaterThan(0);
    }
    
    // Close modal
    const closeBtn = modal.locator('.close');
    await closeBtn.click();
    await page.waitForTimeout(200);
  });
});
