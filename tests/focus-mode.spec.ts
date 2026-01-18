import { test, expect } from '@playwright/test';

/**
 * Focus Mode E2E Tests
 * 
 * Tests the focus mode state tracking in the canvasTestState hidden element.
 * Tests verify that focus mode information is correctly exposed for E2E testing.
 * 
 * Uses the hidden canvasTestState element for testing (same pattern as other E2E tests).
 */

test.describe('Focus Mode - State Tracking', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000/static/index.html');
        // Wait for teams to load
        await page.waitForTimeout(1500);
    });

    test('should have focus mode attributes in canvasTestState element', async ({ page }) => {
        // Verify the test state element exists and has the required attributes
        const testState = await page.locator('#canvasTestState');
        await expect(testState).toBeAttached();
        
        // Check that focus mode attributes exist (even if empty initially)
        const focusedTeam = await testState.getAttribute('data-focused-team');
        const focusedConnections = await testState.getAttribute('data-focused-connections');
        
        // Attributes should exist (even if empty string)
        expect(focusedTeam).toBeDefined();
        expect(focusedConnections).toBeDefined();
        
        // Initially should be empty (no focus mode active)
        expect(focusedTeam).toBe('');
        expect(focusedConnections).toBe('');
        
        console.log('✅ Focus mode attributes present in canvasTestState');
    });

    test('canvasTestState should update when rendering occurs', async ({ page }) => {
        // Wait for initial render
        await page.waitForTimeout(500);
        
        const testState = await page.locator('#canvasTestState');
        
        // Check that basic state is populated
        const totalTeams = await testState.getAttribute('data-total-teams');
        const currentView = await testState.getAttribute('data-current-view');
        
        // Should have teams loaded
        expect(parseInt(totalTeams || '0')).toBeGreaterThan(0);
        
        // Should be on TT view by default
        expect(currentView).toBe('tt');
        
        console.log(`✅ canvasTestState tracking ${totalTeams} teams in ${currentView} view`);
    });

    test('focus mode state structure should be valid JSON when present', async ({ page }) => {
        // This test verifies that if focus mode IS active, the JSON structure is valid
        const testState = await page.locator('#canvasTestState');
        const focusedConnectionsStr = await testState.getAttribute('data-focused-connections');
        
        if (focusedConnectionsStr && focusedConnectionsStr !== '') {
            // If there are focused connections, it should be valid JSON
            expect(() => JSON.parse(focusedConnectionsStr)).not.toThrow();
            const focusedConnections = JSON.parse(focusedConnectionsStr);
            expect(Array.isArray(focusedConnections)).toBe(true);
            
            console.log('✅ Focus connections JSON is valid:', focusedConnections);
        } else {
            // No focus mode active, which is fine
            console.log('✅ No focus mode active (expected for initial state)');
        }
    });
});
