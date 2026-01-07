import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000';

test.describe('UI Interactions', () => {
  test('should filter teams by value stream', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
    await page.waitForTimeout(500);
    
    // Get initial state from hidden test element
    const testState = page.locator('#canvasTestState');
    const initialTotal = await testState.getAttribute('data-total-teams');
    const initialFiltered = await testState.getAttribute('data-filtered-teams');
    expect(initialTotal).toBe(initialFiltered); // No filters initially
    
    // Open filter panel
    await page.locator('#filterToggleBtn').click();
    const dropdown = page.locator('#filterDropdown');
    await expect(dropdown).toBeVisible();
    
    // Verify filter options exist
    const vsFilters = page.locator('#valueStreamFilters input[type="checkbox"]');
    expect(await vsFilters.count()).toBeGreaterThan(0);
    
    // Select first value stream filter and apply
    await vsFilters.first().check();
    await page.locator('#applyFiltersBtn').click();
    await page.waitForTimeout(300);
    
    // Verify filter is active in test state
    const activeFilters = await testState.getAttribute('data-active-filters');
    const filters = JSON.parse(activeFilters || '{}');
    expect(filters.valueStreams.length).toBeGreaterThan(0);
    
    // Verify filter badge shows
    await expect(page.locator('#filterCount')).toBeVisible();
    
    // Verify filtered count changed (may be same or less)
    const filteredCount = await testState.getAttribute('data-filtered-teams');
    expect(parseInt(filteredCount || '0')).toBeGreaterThan(0);
    
    // Clear filters
    await page.locator('#filterToggleBtn').click();
    await page.locator('#clearAllFiltersBtn').click();
    await page.locator('#applyFiltersBtn').click();
    await page.waitForTimeout(200);
    
    // Verify filters cleared
    const clearedFilters = await testState.getAttribute('data-active-filters');
    const clearedParsed = JSON.parse(clearedFilters || '{}');
    expect(clearedParsed.valueStreams.length).toBe(0);
  });

  test('should search teams in sidebar', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
    await page.waitForTimeout(500);
    
    const searchBox = page.locator('#teamSearch');
    await expect(searchBox).toBeVisible();
    
    // Type search term
    await searchBox.fill('Cloud');
    await page.waitForTimeout(300);
    
    // Verify teams still visible
    const teamItems = page.locator('#teamList .team-item');
    expect(await teamItems.count()).toBeGreaterThan(0);
    
    // Clear with Escape
    await searchBox.press('Escape');
    await page.waitForTimeout(200);
    expect(await searchBox.inputValue()).toBe('');
  });

  test('should use zoom controls', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
    await page.waitForTimeout(500);
    
    const zoomInBtn = page.locator('#zoomInBtn');
    const zoomOutBtn = page.locator('#zoomOutBtn');
    
    await expect(zoomInBtn).toBeVisible();
    await expect(zoomOutBtn).toBeVisible();
    
    await zoomInBtn.click();
    await page.waitForTimeout(200);
    
    await zoomOutBtn.click();
    await page.waitForTimeout(200);
  });

  test('should open validation modal', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
    await page.waitForTimeout(500);
    
    const validateBtn = page.locator('#validateBtn');
    await expect(validateBtn).toBeVisible();
    
    await validateBtn.click();
    await page.waitForTimeout(300);
    
    const modal = page.locator('#validationModal');
    await expect(modal).toBeVisible();
    
    const report = page.locator('#validationReport');
    await expect(report).toBeVisible();
    
    const closeBtn = modal.locator('.close');
    await closeBtn.click();
    await page.waitForTimeout(200);
  });

  test('should toggle interaction modes visibility', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
    await page.waitForTimeout(500);
    
    const toggleBtn = page.locator('#toggleInteractionModes');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(200);
      
      await toggleBtn.click();
      await page.waitForTimeout(200);
    }
  });

  test('should toggle cognitive load indicators', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
    await page.waitForTimeout(500);
    
    const toggleBtn = page.locator('#toggleCognitiveLoad');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(200);
      
      await toggleBtn.click();
      await page.waitForTimeout(200);
    }
  });

  test('should open team details from sidebar double-click', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
    await page.waitForTimeout(500);
    
    const firstTeam = page.locator('#teamList .team-item').first();
    await expect(firstTeam).toBeVisible();
    
    await firstTeam.dblclick();
    await page.waitForTimeout(300);
    
    // Modal should be visible (any modal with display: block or .show class)
    const modals = await page.locator('.modal[style*="display: block"], .modal.show').count();
    expect(modals).toBeGreaterThan(0);
    
    // Close modal
    const closeBtn = page.locator('.modal[style*="display: block"] .close, .modal.show .close');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(200);
    }
  });

  test('should use auto-align button', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
    await page.waitForTimeout(500);
    
    const autoAlignBtn = page.locator('#autoAlignBtn');
    // Auto-align visibility depends on view
    if (await autoAlignBtn.isVisible()) {
      await autoAlignBtn.click();
      await page.waitForTimeout(500);
    }
  });
});
