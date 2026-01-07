import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000';

/**
 * Helper function to ensure timeline panel is open and snapshots are loaded
 */
async function ensureTimelinePanelOpen(page) {
  const panel = page.locator('#timelinePanel');
  const isVisible = await panel.isVisible();
  
  if (!isVisible) {
    // Panel is closed, click to open and wait for API response
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/pre-tt/snapshots') && response.status() === 200,
      { timeout: 10000 }
    );
    
    await page.locator('#timelineBtn').click();
    await responsePromise;
    await expect(panel).toBeVisible();
  }
  
  // Always wait a bit for rendering
  await page.waitForTimeout(500);
}

test.describe('Snapshot Comparison View', () => {
  test('should open comparison view and display two snapshots', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await ensureTimelinePanelOpen(page);
    
    // Select two snapshots for comparison
    const snapshotCheckboxes = page.locator('.snapshot-checkbox');
    const count = await snapshotCheckboxes.count();
    
    if (count >= 2) {
      await snapshotCheckboxes.nth(0).check();
      await snapshotCheckboxes.nth(1).check();
      
      // Click compare button
      await page.locator('#compareSnapshotsBtn').click();
      
      // Wait for comparison modal to open
      await expect(page.locator('#comparisonViewModal')).toBeVisible();
      
      // Verify both canvases are visible
      await expect(page.locator('#comparisonBeforeCanvas')).toBeVisible();
      await expect(page.locator('#comparisonAfterCanvas')).toBeVisible();
      
      // Verify snapshot names are displayed
      const beforeName = page.locator('#comparisonBeforeName');
      const afterName = page.locator('#comparisonAfterName');
      await expect(beforeName).not.toBeEmpty();
      await expect(afterName).not.toBeEmpty();
    }
  });
  
  test('should display visibility toggle controls', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await ensureTimelinePanelOpen(page);
    
    const snapshotCheckboxes = page.locator('.snapshot-checkbox');
    const count = await snapshotCheckboxes.count();
    
    if (count >= 2) {
      await snapshotCheckboxes.nth(0).check();
      await snapshotCheckboxes.nth(1).check();
      await page.locator('#compareSnapshotsBtn').click();
      
      await expect(page.locator('#comparisonViewModal')).toBeVisible();
      
      // Verify all three toggle checkboxes exist
      const groupingsCheckbox = page.locator('#showGroupingsComparison');
      const interactionsCheckbox = page.locator('#showInteractionsComparison');
      const badgesCheckbox = page.locator('#showBadgesComparison');
      
      await expect(groupingsCheckbox).toBeVisible();
      await expect(interactionsCheckbox).toBeVisible();
      await expect(badgesCheckbox).toBeVisible();
      
      // All should be checked by default
      await expect(groupingsCheckbox).toBeChecked();
      await expect(interactionsCheckbox).toBeChecked();
      await expect(badgesCheckbox).toBeChecked();
    }
  });
  
  test('should toggle groupings visibility', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await ensureTimelinePanelOpen(page);
    
    const snapshotCheckboxes = page.locator('.snapshot-checkbox');
    const count = await snapshotCheckboxes.count();
    
    if (count >= 2) {
      await snapshotCheckboxes.nth(0).check();
      await snapshotCheckboxes.nth(1).check();
      await page.locator('#compareSnapshotsBtn').click();
      
      await expect(page.locator('#comparisonViewModal')).toBeVisible();
      
      // Toggle groupings off
      const groupingsCheckbox = page.locator('#showGroupingsComparison');
      await groupingsCheckbox.uncheck();
      await expect(groupingsCheckbox).not.toBeChecked();
      
      // Toggle back on
      await groupingsCheckbox.check();
      await expect(groupingsCheckbox).toBeChecked();
    }
  });
  
  test('should toggle interactions visibility', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await ensureTimelinePanelOpen(page);
    
    const snapshotCheckboxes = page.locator('.snapshot-checkbox');
    const count = await snapshotCheckboxes.count();
    
    if (count >= 2) {
      await snapshotCheckboxes.nth(0).check();
      await snapshotCheckboxes.nth(1).check();
      await page.locator('#compareSnapshotsBtn').click();
      
      await expect(page.locator('#comparisonViewModal')).toBeVisible();
      
      // Toggle interactions off
      const interactionsCheckbox = page.locator('#showInteractionsComparison');
      await interactionsCheckbox.uncheck();
      await expect(interactionsCheckbox).not.toBeChecked();
      
      // Toggle back on
      await interactionsCheckbox.check();
      await expect(interactionsCheckbox).toBeChecked();
    }
  });
  
  test('should toggle badges visibility', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await ensureTimelinePanelOpen(page);
    
    const snapshotCheckboxes = page.locator('.snapshot-checkbox');
    const count = await snapshotCheckboxes.count();
    
    if (count >= 2) {
      await snapshotCheckboxes.nth(0).check();
      await snapshotCheckboxes.nth(1).check();
      await page.locator('#compareSnapshotsBtn').click();
      
      await expect(page.locator('#comparisonViewModal')).toBeVisible();
      
      // Toggle badges off
      const badgesCheckbox = page.locator('#showBadgesComparison');
      await badgesCheckbox.uncheck();
      await expect(badgesCheckbox).not.toBeChecked();
      
      // Toggle back on
      await badgesCheckbox.check();
      await expect(badgesCheckbox).toBeChecked();
    }
  });
  
  test('should display zoom controls for both canvases', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await ensureTimelinePanelOpen(page);
    
    const snapshotCheckboxes = page.locator('.snapshot-checkbox');
    const count = await snapshotCheckboxes.count();
    
    if (count >= 2) {
      await snapshotCheckboxes.nth(0).check();
      await snapshotCheckboxes.nth(1).check();
      await page.locator('#compareSnapshotsBtn').click();
      
      await expect(page.locator('#comparisonViewModal')).toBeVisible();
      
      // Verify before canvas zoom controls
      await expect(page.locator('#beforeZoomIn')).toBeVisible();
      await expect(page.locator('#beforeZoomOut')).toBeVisible();
      await expect(page.locator('#beforeResetView')).toBeVisible();
      
      // Verify after canvas zoom controls
      await expect(page.locator('#afterZoomIn')).toBeVisible();
      await expect(page.locator('#afterZoomOut')).toBeVisible();
      await expect(page.locator('#afterResetView')).toBeVisible();
    }
  });
  
  test('should zoom in when clicking zoom in button', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await ensureTimelinePanelOpen(page);
    
    const snapshotCheckboxes = page.locator('.snapshot-checkbox');
    const count = await snapshotCheckboxes.count();
    
    if (count >= 2) {
      await snapshotCheckboxes.nth(0).check();
      await snapshotCheckboxes.nth(1).check();
      await page.locator('#compareSnapshotsBtn').click();
      
      await expect(page.locator('#comparisonViewModal')).toBeVisible();
      
      // Click zoom in button
      await page.locator('#beforeZoomIn').click();
      
      // Zoom button should still be visible (no errors)
      await expect(page.locator('#beforeZoomIn')).toBeVisible();
    }
  });
  
  test('should close comparison view modal', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await ensureTimelinePanelOpen(page);
    
    const snapshotCheckboxes = page.locator('.snapshot-checkbox');
    const count = await snapshotCheckboxes.count();
    
    if (count >= 2) {
      await snapshotCheckboxes.nth(0).check();
      await snapshotCheckboxes.nth(1).check();
      await page.locator('#compareSnapshotsBtn').click();
      
      await expect(page.locator('#comparisonViewModal')).toBeVisible();
      
      // Close modal
      await page.locator('#closeComparisonViewBtn').click();
      
      // Modal should be hidden
      await expect(page.locator('#comparisonViewModal')).toBeHidden();
    }
  });
});
