import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000';

test.describe('Baseline Business Streams View', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/static/index.html`);
        // Wait for initial TT teams load
        await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 10000 });
        await page.waitForTimeout(500);

        // Switch to Baseline view
        const baselineRadio = page.locator('input[type="radio"][value="current"]');
        await baselineRadio.check();
        // Wait for Baseline data to load
        await page.waitForResponse(response => response.url().includes('/api/baseline/'), { timeout: 10000 });
        await page.waitForTimeout(500);
    });

    test('should switch to Business Streams perspective', async ({ page }) => {
        // Switch to Business Streams perspective
        const businessStreamsRadio = page.locator('input[type="radio"][value="business-streams"]');
        await businessStreamsRadio.check();
        await page.waitForTimeout(1000);

        // Verify canvas is visible
        const canvas = page.locator('#teamCanvas');
        await expect(canvas).toBeVisible();

        // Verify the perspective is active
        await expect(businessStreamsRadio).toBeChecked();
    });

    test('should load Business Streams data', async ({ page }) => {
        // Listen for the API call
        const responsePromise = page.waitForResponse(
            response => response.url().includes('/api/baseline/business-streams') && response.status() === 200
        );

        // Switch to Business Streams perspective
        const businessStreamsRadio = page.locator('input[type="radio"][value="business-streams"]');
        await businessStreamsRadio.check();

        // Wait for API response
        const response = await responsePromise;
        const data = await response.json();

        // Verify data structure
        expect(data).toHaveProperty('business_streams');
        expect(data).toHaveProperty('products_without_business_stream');
        expect(data).toHaveProperty('ungrouped_teams');
        expect(typeof data.business_streams).toBe('object');
        expect(Array.isArray(data.ungrouped_teams)).toBeTruthy();
    });

    test('should render Business Stream swimlanes', async ({ page }) => {
        // Switch to Business Streams perspective
        const businessStreamsRadio = page.locator('input[type="radio"][value="business-streams"]');
        await businessStreamsRadio.check();
        await page.waitForTimeout(1500);

        // Take screenshot for visual verification
        await page.screenshot({
            path: 'screenshots/baseline-business-streams-view.png',
            fullPage: false
        });

        // Canvas should be visible and have content
        const canvas = page.locator('#teamCanvas');
        await expect(canvas).toBeVisible();

        // Check canvas has non-zero dimensions
        const box = await canvas.boundingBox();
        expect(box).not.toBeNull();
        if (box) {
            expect(box.width).toBeGreaterThan(0);
            expect(box.height).toBeGreaterThan(0);
        }
    });

    test('should show Business Stream metadata', async ({ page }) => {
        // Switch to Business Streams perspective
        const businessStreamsRadio = page.locator('input[type="radio"][value="business-streams"]');
        await businessStreamsRadio.check();
        await page.waitForTimeout(1500);

        // Get the API response to verify Business Streams have proper structure
        const response = await page.request.get('/api/baseline/business-streams');
        const data = await response.json();

        // Each Business Stream should have metadata
        const vsNames = Object.keys(data.business_streams);
        if (vsNames.length > 0) {
            const firstVS = data.business_streams[vsNames[0]];
            expect(firstVS).toHaveProperty('id');
            expect(firstVS).toHaveProperty('name');
            expect(firstVS).toHaveProperty('description');
            expect(firstVS).toHaveProperty('color');
            expect(firstVS).toHaveProperty('products');
        }
    });

    test('should handle teams grouped by product within Business Stream', async ({ page }) => {
        // Switch to Business Streams perspective
        const businessStreamsRadio = page.locator('input[type="radio"][value="business-streams"]');
        await businessStreamsRadio.check();
        await page.waitForTimeout(1500);

        // Get the API response
        const response = await page.request.get('/api/baseline/business-streams');
        const data = await response.json();

        // Verify nested structure: value_stream -> products -> teams
        const vsNames = Object.keys(data.business_streams);
        if (vsNames.length > 0) {
            const firstVS = data.business_streams[vsNames[0]];
            const products = firstVS.products;
            expect(typeof products).toBe('object');

            // Each product should have an array of teams
            for (const [productName, teams] of Object.entries(products)) {
                expect(Array.isArray(teams)).toBeTruthy();
            }
        }
    });

    test('should support switching between all three Baseline perspectives', async ({ page }) => {
        // Test full perspective switching workflow

        // Start with Hierarchy (default)
        const hierarchyRadio = page.locator('input[type="radio"][value="hierarchy"]');
        await expect(hierarchyRadio).toBeChecked();

        // Switch to Product Lines
        const productLinesRadio = page.locator('input[type="radio"][value="product-lines"]');
        await productLinesRadio.check();
        await page.waitForTimeout(1000);
        await expect(productLinesRadio).toBeChecked();

        // Switch to Business Streams
        const businessStreamsRadio = page.locator('input[type="radio"][value="business-streams"]');
        await businessStreamsRadio.check();
        await page.waitForTimeout(1000);
        await expect(businessStreamsRadio).toBeChecked();

        // Switch back to Hierarchy
        await hierarchyRadio.check();
        await page.waitForTimeout(1000);
        await expect(hierarchyRadio).toBeChecked();

        // Canvas should still be visible throughout
        const canvas = page.locator('#teamCanvas');
        await expect(canvas).toBeVisible();
    });
});

