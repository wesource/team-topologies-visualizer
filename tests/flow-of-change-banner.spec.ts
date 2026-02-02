import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';

test.describe('Flow of Change Banner', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/static/index.html`);
        // Wait for TT Design teams to load (default view)
        await page.waitForResponse(response => response.url().includes('/api/tt/teams'));
        await page.waitForTimeout(500); // Allow rendering
    });

    test('should show Flow of Change checkbox in TT Design view', async ({ page }) => {
        // Verify checkbox is visible in TT Design view
        const checkbox = page.locator('#showFlowOfChangeBanner');
        await expect(checkbox).toBeVisible();
        
        // Verify label is visible
        const label = page.locator('#showFlowOfChangeBannerLabel');
        await expect(label).toBeVisible();
    });

    test('should hide Flow of Change checkbox in Baseline view', async ({ page }) => {
        // Switch to Baseline view
        await page.locator('input[value="baseline"]').click();
        await page.waitForResponse(response => response.url().includes('/api/baseline/teams'));
        await page.waitForTimeout(300);

        // Verify checkbox is hidden in Baseline view
        const label = page.locator('#showFlowOfChangeBannerLabel');
        await expect(label).not.toBeVisible();
    });

    test('should toggle Flow of Change checkbox', async ({ page }) => {
        const checkbox = page.locator('#showFlowOfChangeBanner');
        
        // Initially unchecked
        await expect(checkbox).not.toBeChecked();
        
        // Click to check
        await checkbox.click();
        await page.waitForTimeout(200); // Allow redraw
        await expect(checkbox).toBeChecked();
        
        // Click to uncheck
        await checkbox.click();
        await page.waitForTimeout(200);
        await expect(checkbox).not.toBeChecked();
    });

    test('should render Flow of Change banner when enabled', async ({ page }) => {
        const checkbox = page.locator('#showFlowOfChangeBanner');
        
        // Enable the banner
        await checkbox.click();
        await page.waitForTimeout(500); // Allow canvas redraw
        
        // The banner is drawn on canvas, so we can't directly inspect it
        // But we can verify the checkbox state persists
        await expect(checkbox).toBeChecked();
        
        // Verify canvas has been redrawn (no error indicators)
        const canvas = page.locator('#teamCanvas');
        await expect(canvas).toBeVisible();
    });

    test('should maintain Flow of Change state when switching between views', async ({ page }) => {
        const checkbox = page.locator('#showFlowOfChangeBanner');
        
        // Enable in TT Design view
        await checkbox.click();
        await expect(checkbox).toBeChecked();
        
        // Switch to Baseline view (checkbox hidden)
        await page.locator('input[value="baseline"]').click();
        await page.waitForResponse(response => response.url().includes('/api/baseline/teams'));
        await page.waitForTimeout(300);
        
        // Switch back to TT Design view
        await page.locator('input[value="tt"]').click();
        await page.waitForResponse(response => response.url().includes('/api/tt/teams'));
        await page.waitForTimeout(300);
        
        // Verify state was maintained
        await expect(checkbox).toBeChecked();
    });

    test('should include Flow of Change banner in SVG export when enabled', async ({ page }) => {
        const checkbox = page.locator('#showFlowOfChangeBanner');
        
        // Enable the banner
        await checkbox.click();
        await page.waitForTimeout(300);
        
        // Setup download listener
        const downloadPromise = page.waitForEvent('download');
        
        // Click export button
        await page.locator('#exportSVGBtn').click();
        
        // Wait for download
        const download = await downloadPromise;
        const suggestedFilename = download.suggestedFilename();
        
        // Verify it's an SVG file
        expect(suggestedFilename).toMatch(/\.svg$/);
        
        // Read SVG content
        const path = await download.path();
        if (path) {
            const fs = await import('fs/promises');
            const svgContent = await fs.readFile(path, 'utf-8');
            
            // Verify Flow of Change banner is in SVG
            expect(svgContent).toContain('flow-of-change-banner');
            expect(svgContent).toContain('Flow of Change');
        }
    });

    test('should NOT include Flow of Change banner in SVG export when disabled', async ({ page }) => {
        const checkbox = page.locator('#showFlowOfChangeBanner');
        
        // Ensure banner is disabled
        if (await checkbox.isChecked()) {
            await checkbox.click();
            await page.waitForTimeout(300);
        }
        
        // Setup download listener
        const downloadPromise = page.waitForEvent('download');
        
        // Click export button
        await page.locator('#exportSVGBtn').click();
        
        // Wait for download
        const download = await downloadPromise;
        
        // Read SVG content
        const path = await download.path();
        if (path) {
            const fs = await import('fs/promises');
            const svgContent = await fs.readFile(path, 'utf-8');
            
            // Verify Flow of Change banner is NOT in SVG
            expect(svgContent).not.toContain('flow-of-change-banner');
        }
    });

    test('should work with auto-align feature', async ({ page }) => {
        const checkbox = page.locator('#showFlowOfChangeBanner');
        const autoAlignBtn = page.locator('#autoAlignTTBtn');
        
        // Enable the banner
        await checkbox.click();
        await page.waitForTimeout(300);
        
        // Click auto-align
        await autoAlignBtn.click();
        await page.waitForTimeout(500); // Allow realignment and redraw
        
        // Verify banner is still enabled after auto-align
        await expect(checkbox).toBeChecked();
        
        // Verify canvas rendered without errors
        const canvas = page.locator('#teamCanvas');
        await expect(canvas).toBeVisible();
    });
});
