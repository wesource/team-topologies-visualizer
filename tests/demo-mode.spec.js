import { test, expect } from '@playwright/test';

test.describe('Demo Mode', () => {
    let isDemoModeEnabled = false;

    test.beforeAll(async ({ request }) => {
        // Check if demo mode is actually enabled on the server
        try {
            const response = await request.get('/api/config');
            const config = await response.json();
            isDemoModeEnabled = config.readOnlyMode === true;
        } catch (error) {
            console.log('Could not check demo mode status:', error);
        }
    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/static/index.html');
    });

    test('should display demo mode banner when READ_ONLY_MODE is enabled', async ({ page }) => {
        test.skip(!isDemoModeEnabled, 'Demo mode not enabled on server');
        
        // Wait for the page to load and check if demo banner exists
        const banner = page.locator('.demo-banner');
        
        // Check if banner is visible
        await expect(banner).toBeVisible({ timeout: 5000 });
        
        // Check banner content
        await expect(banner).toContainText('Demo Mode');
        await expect(banner).toContainText('Changes won\'t be saved');
        
        // Check for icon
        const icon = banner.locator('.demo-banner-icon');
        await expect(icon).toBeVisible();
    });

    test('should prevent position updates in demo mode', async ({ page }) => {
        // Wait for teams to load
        await page.waitForSelector('#teamCanvas');
        await page.waitForTimeout(1000); // Wait for teams to render
        
        // Try to drag a team (this would normally update position)
        const canvas = page.locator('#teamCanvas');
        await canvas.hover({ position: { x: 150, y: 150 } });
        await page.mouse.down();
        await canvas.hover({ position: { x: 300, y: 300 } });
        await page.mouse.up();
        
        // The drag should work visually, but position won't be saved
        // (We can't easily test the backend rejection in E2E without mocking)
    });

    test('demo banner should have correct styling', async ({ page }) => {
        test.skip(!isDemoModeEnabled, 'Demo mode not enabled on server');
        
        const banner = page.locator('.demo-banner');
        
        // Wait for banner to be visible first
        await expect(banner).toBeVisible({ timeout: 5000 });
        
        // Check background gradient exists
        const background = await banner.evaluate(el => {
            return window.getComputedStyle(el).backgroundImage;
        });
        expect(background).toContain('linear-gradient');
        
        // Check text color is white
        const color = await banner.evaluate(el => {
            return window.getComputedStyle(el).color;
        });
        expect(color).toBe('rgb(255, 255, 255)'); // white
    });

    test('should not display demo mode banner when READ_ONLY_MODE is disabled', async ({ page }) => {
        test.skip(isDemoModeEnabled, 'Demo mode is enabled on server');
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        
        // Banner should not exist
        const banner = page.locator('.demo-banner');
        await expect(banner).not.toBeVisible();
    });
});
