import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000';

test.describe('API Validation', () => {
  test('should load organization hierarchy API', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/pre-tt/organization-hierarchy`);
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    // API structure is: { company: { children: [...departments] } }
    expect(data).toHaveProperty('company');
    expect(data.company).toHaveProperty('children');
    expect(Array.isArray(data.company.children)).toBe(true);
    expect(data.company.children.length).toBe(6);
  });

  test('should load teams API for current view', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/pre-tt/teams`);
    
    expect(response.status()).toBe(200);
    const teams = await response.json();
    expect(Array.isArray(teams)).toBe(true);
    expect(teams.length).toBeGreaterThan(0);
  });

  test('should load teams API for TT Design view', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/tt/teams`);
    
    expect(response.status()).toBe(200);
    const teams = await response.json();
    expect(Array.isArray(teams)).toBe(true);
    expect(teams.length).toBeGreaterThan(0);
    
    // Validate team structure
    const firstTeam = teams[0];
    expect(firstTeam).toHaveProperty('name');
    expect(firstTeam).toHaveProperty('team_type');
    expect(['stream-aligned', 'enabling', 'complicated-subsystem', 'platform']).toContain(firstTeam.team_type);
  });

  test('API endpoints should return valid JSON', async ({ page }) => {
    const endpoints = [
      '/api/tt/teams',
      '/api/pre-tt/organization-hierarchy'
    ];

    for (const endpoint of endpoints) {
      const response = await page.request.get(`${BASE_URL}${endpoint}`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toBeTruthy();
    }
  });
});
