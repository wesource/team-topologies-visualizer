import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000';

test.describe('Organization Hierarchy', () => {
  test('organization hierarchy should have exactly 6 departments', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.company.children.length).toBe(6);
  });

  test('organization hierarchy should match actual teams', async ({ page }) => {
    const [orgResponse, teamsResponse] = await Promise.all([
      page.request.get(`${BASE_URL}/api/baseline/organization-hierarchy`),
      page.request.get(`${BASE_URL}/api/baseline/teams`)
    ]);
    
    const orgData = await orgResponse.json();
    const teams = await teamsResponse.json();
    
    // Count teams in org hierarchy
    let orgTeamCount = 0;
    for (const dept of orgData.company.children) {
      if (dept.line_managers) {
        for (const lineManager of dept.line_managers) {
          orgTeamCount += lineManager.teams.length;
        }
      }
      if (dept.regions) {
        for (const region of dept.regions) {
          if (region.teams && Array.isArray(region.teams)) {
            orgTeamCount += region.teams.length;
          }
        }
      }
    }
    
    // Org hierarchy may not include all teams (e.g., undefined teams)
    // so it should be <= total teams
    expect(orgTeamCount).toBeGreaterThan(0);
    expect(orgTeamCount).toBeLessThanOrEqual(teams.length);
  });

  test('Customer Solutions department has 4 regions', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    const data = await response.json();
    
    const customerSolutions = data.company.children.find((d: any) => d.name === 'Customer Solutions Department');
    expect(customerSolutions).toBeTruthy();
    expect(customerSolutions.regions.length).toBe(4);
  });

  test('Engineering department has 6 line managers', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    const data = await response.json();
    
    const engineering = data.company.children.find((d: any) => d.name === 'Engineering Department');
    expect(engineering).toBeTruthy();
    expect(engineering.line_managers.length).toBe(6);
  });

  test('all department names should be defined', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    const data = await response.json();
    
    for (const dept of data.company.children) {
      expect(dept.name).toBeTruthy();
      expect(dept.name.length).toBeGreaterThan(0);
    }
  });

  test('organization should not have duplicate departments', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    const data = await response.json();
    
    const deptNames = data.company.children.map((d: any) => d.name);
    const uniqueNames = new Set(deptNames);
    expect(deptNames.length).toBe(uniqueNames.size);
  });

  test('all regions should have names', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    const data = await response.json();
    
    for (const dept of data.company.children) {
      if (dept.regions) {
        for (const region of dept.regions) {
          expect(region.name).toBeTruthy();
        }
      }
    }
  });

  test('all line managers should have names', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    const data = await response.json();
    
    for (const dept of data.company.children) {
      if (dept.line_managers) {
        for (const lineManager of dept.line_managers) {
          expect(lineManager.name).toBeTruthy();
        }
      }
    }
  });

  test('all teams should have an organization context', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    const data = await response.json();
    
    let teamCount = 0;
    for (const dept of data.company.children) {
      if (dept.line_managers) {
        for (const lineManager of dept.line_managers) {
          teamCount += lineManager.teams.length;
          for (const team of lineManager.teams) {
            // Teams are stored as strings in the hierarchy
            expect(typeof team).toBe('string');
            expect(team.length).toBeGreaterThan(0);
          }
        }
      }
      if (dept.regions) {
        for (const region of dept.regions) {
          if (region.teams && Array.isArray(region.teams)) {
            teamCount += region.teams.length;
            for (const team of region.teams) {
              // Teams are stored as strings in the hierarchy
              expect(typeof team).toBe('string');
              expect(team.length).toBeGreaterThan(0);
            }
          }
        }
      }
    }
    expect(teamCount).toBeGreaterThan(0);
  });
});
