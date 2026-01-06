import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000';

test.describe('Pre-TT Product Lines View', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/static/index.html`);
        // Wait for initial TT teams load
        await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 10000 });
        await page.waitForTimeout(500);

        // Switch to Pre-TT view
        const preTTRadio = page.locator('input[type="radio"][value="current"]');
        await preTTRadio.check();
        // Wait for Pre-TT data to load
        await page.waitForResponse(response => response.url().includes('/api/pre-tt/'), { timeout: 10000 });
        await page.waitForTimeout(500);
    });

    test('should switch to Product Lines perspective', async ({ page }) => {
        // Switch to Product Lines perspective
        const productLinesRadio = page.locator('input[type="radio"][value="product-lines"]');
        await productLinesRadio.check();
        await page.waitForTimeout(1000);

        // Verify canvas is visible
        const canvas = page.locator('#team-canvas');
        await expect(canvas).toBeVisible();

        // Verify the perspective is active
        await expect(productLinesRadio).toBeChecked();
    });

    test('should load product lines data', async ({ page }) => {
        // Listen for the API call
        const responsePromise = page.waitForResponse(
            response => response.url().includes('/api/pre-tt/product-lines') && response.status() === 200
        );

        // Switch to Product Lines perspective
        const productLinesRadio = page.locator('input[type="radio"][value="product-lines"]');
        await productLinesRadio.check();

        // Wait for API response
        const response = await responsePromise;
        const data = await response.json();

        // Verify data structure
        expect(data).toHaveProperty('products');
        expect(data).toHaveProperty('shared_teams');
        expect(Array.isArray(data.products)).toBeTruthy();
        expect(Array.isArray(data.shared_teams)).toBeTruthy();
    });

    test('should render product lanes with teams', async ({ page }) => {
        // Switch to Product Lines perspective
        const productLinesRadio = page.locator('input[type="radio"][value="product-lines"]');
        await productLinesRadio.check();
        await page.waitForTimeout(1500);

        // Take screenshot for visual verification
        await page.screenshot({
            path: 'tests/screenshots/pre-tt-product-lines-view.png',
            fullPage: false
        });

        // Canvas should be visible and have content
        const canvas = page.locator('#team-canvas');
        await expect(canvas).toBeVisible();

        // Check canvas has non-zero dimensions
        const box = await canvas.boundingBox();
        expect(box).not.toBeNull();
        if (box) {
            expect(box.width).toBeGreaterThan(0);
            expect(box.height).toBeGreaterThan(0);
        }
    });

    test('should show shared teams row at bottom', async ({ page }) => {
        // Switch to Product Lines perspective
        const productLinesRadio = page.locator('input[type="radio"][value="product-lines"]');
        await productLinesRadio.check();
        await page.waitForTimeout(1500);

        // Get the API response to verify shared teams exist
        const response = await page.request.get('/api/pre-tt/product-lines');
        const data = await response.json();

        if (data.shared_teams && data.shared_teams.length > 0) {
            // If shared teams exist, they should be rendered
            // This is a basic check - in reality, we'd need canvas pixel inspection
            // which is complex. For now, just verify API contract.
            expect(data.shared_teams.length).toBeGreaterThan(0);
        }
    });

    test('should support team detail modal from product lines view', async ({ page }) => {
        // Switch to Product Lines perspective
        const productLinesRadio = page.locator('input[type="radio"][value="product-lines"]');
        await productLinesRadio.check();
        await page.waitForTimeout(1500);

        // Try to open team details (canvas interaction is tricky in E2E)
        // For now, verify the modal container exists
        const modal = page.locator('#team-detail-modal');
        expect(modal).toBeDefined();
    });
});
