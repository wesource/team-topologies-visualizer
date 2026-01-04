import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000';

test.describe.configure({ mode: 'serial' });

test.describe('Organization Hierarchy', () => {
  test('organization hierarchy should have exactly 6 departments', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.locator('input[value="current"]').click();
    
    const response = await page.waitForResponse(
      response => response.url().includes('/api/organization-hierarchy'),
      { timeout: 10000 }
    );
    
    const data = await response.json();
    expect(data.departments.length).toBe(6);
  });

  test('company leadership should be defined', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/company-leadership`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('ceo');
    expect(data.ceo).toBeTruthy();
  });

  test('organization hierarchy should match actual teams', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.locator('input[value="current"]').click();
    
    const [orgResponse, teamsResponse] = await Promise.all([
      page.waitForResponse(response => response.url().includes('/api/organization-hierarchy'), { timeout: 10000 }),
      page.waitForResponse(response => response.url().includes('/api/teams?view=current'), { timeout: 10000 })
    ]);
    
    const orgData = await orgResponse.json();
    const teams = await teamsResponse.json();
    
    // Count teams in org hierarchy
    let orgTeamCount = 0;
    for (const dept of orgData.departments) {
      for (const region of dept.regions) {
        for (const lineManager of region.lineManagers) {
          orgTeamCount += lineManager.teams.length;
        }
      }
    }
    
    // Should match teams returned by API
    expect(orgTeamCount).toBe(teams.length);
  });

  test('Customer Solutions department has 4 regions', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.locator('input[value="current"]').click();
    
    const response = await page.waitForResponse(
      response => response.url().includes('/api/organization-hierarchy'),
      { timeout: 10000 }
    );
    
    const data = await response.json();
    const customerSolutions = data.departments.find((d: any) => d.name === 'Customer Solutions');
    
    expect(customerSolutions).toBeTruthy();
    expect(customerSolutions.regions.length).toBe(4);
  });

  test('Engineering department has 5 line managers', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.locator('input[value="current"]').click();
    
    const response = await page.waitForResponse(
      response => response.url().includes('/api/organization-hierarchy'),
      { timeout: 10000 }
    );
    
    const data = await response.json();
    const engineering = data.departments.find((d: any) => d.name === 'Engineering');
    
    expect(engineering).toBeTruthy();
    
    let lineManagerCount = 0;
    for (const region of engineering.regions) {
      lineManagerCount += region.lineManagers.length;
    }
    
    expect(lineManagerCount).toBe(5);
  });

  test('all department names should be defined', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.locator('input[value="current"]').click();
    
    const response = await page.waitForResponse(
      response => response.url().includes('/api/organization-hierarchy'),
      { timeout: 10000 }
    );
    
    const data = await response.json();
    
    for (const dept of data.departments) {
      expect(dept.name).toBeTruthy();
      expect(dept.name.length).toBeGreaterThan(0);
    }
  });

  test('organization should not have duplicate departments', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.locator('input[value="current"]').click();
    
    const response = await page.waitForResponse(
      response => response.url().includes('/api/organization-hierarchy'),
      { timeout: 10000 }
    );
    
    const data = await response.json();
    const deptNames = data.departments.map((d: any) => d.name);
    const uniqueNames = new Set(deptNames);
    
    expect(deptNames.length).toBe(uniqueNames.size);
  });

  test('all regions should have names', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.locator('input[value="current"]').click();
    
    const response = await page.waitForResponse(
      response => response.url().includes('/api/organization-hierarchy'),
      { timeout: 10000 }
    );
    
    const data = await response.json();
    
    for (const dept of data.departments) {
      for (const region of dept.regions) {
        expect(region.name).toBeTruthy();
      }
    }
  });

  test('all line managers should have names', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    await page.locator('input[value="current"]').click();
    
    const response = await page.waitForResponse(
      response => response.url().includes('/api/organization-hierarchy'),
      { timeout: 10000 }
    );
    
    const data = await response.json();
    
    for (const dept of data.departments) {
      for (const region of dept.regions) {
        for (const lineManager of region.lineManagers) {
          expect(lineManager.name).toBeTruthy();
        }
      }
    }
  });

  test('current team types should have all required fields', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/current-team-types`);
    expect(response.status()).toBe(200);
    
    const types = await response.json();
    expect(types).toHaveProperty('stream-aligned');
    expect(types).toHaveProperty('enabling');
    expect(types).toHaveProperty('complicated-subsystem');
    expect(types).toHaveProperty('platform');
  });
});
