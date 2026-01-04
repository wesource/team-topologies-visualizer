import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000';

test.describe.configure({ mode: 'serial' });

test.describe('API Validation', () => {
  test('should load organization hierarchy API', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.locator('input[value="current"]').click();
    
    const response = await page.waitForResponse(
      response => response.url().includes('/api/organization-hierarchy'),
      { timeout: 10000 }
    );
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('departments');
  });

  test('should load teams API for current view', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.locator('input[value="current"]').click();
    
    const response = await page.waitForResponse(
      response => response.url().includes('/api/teams?view=current'),
      { timeout: 10000 }
    );
    
    expect(response.status()).toBe(200);
    const teams = await response.json();
    expect(Array.isArray(teams)).toBe(true);
    expect(teams.length).toBeGreaterThan(0);
  });

  test('Teams API should return valid team data', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    const response = await page.waitForResponse(
      response => response.url().includes('/api/teams?view=tt'),
      { timeout: 10000 }
    );
    
    expect(response.status()).toBe(200);
    const teams = await response.json();
    expect(Array.isArray(teams)).toBe(true);
    expect(teams.length).toBeGreaterThan(0);
    
    // Validate team structure
    const firstTeam = teams[0];
    expect(firstTeam).toHaveProperty('name');
    expect(firstTeam).toHaveProperty('type');
    expect(['stream-aligned', 'enabling', 'complicated-subsystem', 'platform']).toContain(firstTeam.type);
  });

  test('API endpoints should return valid JSON', async ({ page }) => {
    const endpoints = [
      '/api/teams?view=tt',
      '/api/organization-hierarchy',
      '/api/current-team-types',
      '/api/company-leadership'
    ];

    for (const endpoint of endpoints) {
      const response = await page.request.get(`${BASE_URL}${endpoint}`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toBeTruthy();
    }
  });
});
