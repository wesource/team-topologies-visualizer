import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000';

test.describe('Backend Data Validation', () => {
  
  test('organization hierarchy should not have duplicate departments', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    const departments = data.company.children;
    
    // Check for duplicate department IDs
    const departmentIds = departments.map((dept: any) => dept.id);
    const uniqueIds = new Set(departmentIds);
    expect(uniqueIds.size).toBe(departmentIds.length);
    
    // Check for duplicate department names
    const departmentNames = departments.map((dept: any) => dept.name);
    const uniqueNames = new Set(departmentNames);
    expect(uniqueNames.size).toBe(departmentNames.length);
  });

  test('all department names should be defined', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    const departments = data.company.children;
    
    departments.forEach((dept: any) => {
      expect(dept.name).toBeTruthy();
      expect(dept.name).not.toBeUndefined();
      expect(dept.name).not.toBeNull();
      expect(typeof dept.name).toBe('string');
      expect(dept.name.length).toBeGreaterThan(0);
    });
  });

  test('all line managers should have names', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    const engineeringDept = data.company.children.find((d: any) => d.id === 'engineering-dept');
    
    if (engineeringDept && engineeringDept.line_managers) {
      engineeringDept.line_managers.forEach((lm: any) => {
        expect(lm.name).toBeTruthy();
        expect(lm.name).not.toBeUndefined();
        expect(lm.name).not.toBeNull();
        expect(typeof lm.name).toBe('string');
        expect(lm.name.length).toBeGreaterThan(0);
      });
    }
  });

  test('all regions should have names', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    const customerSolutionsDept = data.company.children.find((d: any) => d.id === 'customer-solutions-dept');
    
    if (customerSolutionsDept && customerSolutionsDept.regions) {
      customerSolutionsDept.regions.forEach((region: any) => {
        expect(region.name).toBeTruthy();
        expect(region.name).not.toBeUndefined();
        expect(region.name).not.toBeNull();
        expect(typeof region.name).toBe('string');
        expect(region.name.length).toBeGreaterThan(0);
      });
    }
  });

  test('team types should have all required fields', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/baseline/team-types`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('team_types');
    
    data.team_types.forEach((teamType: any) => {
      expect(teamType).toHaveProperty('name');
      expect(teamType).toHaveProperty('color');
      expect(teamType.name).toBeTruthy();
      expect(teamType.color).toBeTruthy();
      expect(teamType.color).toMatch(/^#[0-9A-Fa-f]{6}$/); // Valid hex color
    });
  });

  test('teams API should return valid team data', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/baseline/teams`);
    expect(response.ok()).toBeTruthy();
    
    const teams = await response.json();
    expect(Array.isArray(teams)).toBeTruthy();
    
    teams.forEach((team: any) => {
      expect(team).toHaveProperty('name');
      expect(team).toHaveProperty('team_type');
      expect(team).toHaveProperty('position');
      expect(team.name).toBeTruthy();
      expect(team.team_type).toBeTruthy();
      expect(team.position).toHaveProperty('x');
      expect(team.position).toHaveProperty('y');
      expect(typeof team.position.x).toBe('number');
      expect(typeof team.position.y).toBe('number');
    });
  });

  test('hierarchy structure should have exactly 6 departments', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    const departments = data.company.children;
    
    expect(departments.length).toBe(6);
    
    // Verify expected departments exist
    const expectedDepts = [
      'engineering-dept',
      'product-management-dept',
      'infrastructure-ops-dept',
      'customer-solutions-dept',
      'customer-support-dept',
      'sales-marketing-dept'
    ];
    
    expectedDepts.forEach(deptId => {
      const dept = departments.find((d: any) => d.id === deptId);
      expect(dept).toBeTruthy();
    });
  });

  test('company leadership should be defined', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.company).toBeTruthy();
    expect(data.company.name).toBeTruthy();
    expect(data.company.type).toBe('leadership');
    expect(data.company.children).toBeTruthy();
    expect(Array.isArray(data.company.children)).toBeTruthy();
  });

  test('team names in hierarchy should match actual teams', async ({ request }) => {
    const hierarchyResponse = await request.get(`${BASE_URL}/api/baseline/organization-hierarchy`);
    const teamsResponse = await request.get(`${BASE_URL}/api/baseline/teams`);
    
    expect(hierarchyResponse.ok()).toBeTruthy();
    expect(teamsResponse.ok()).toBeTruthy();
    
    const hierarchy = await hierarchyResponse.json();
    const teams = await teamsResponse.json();
    
    const teamNames = teams.map((t: any) => t.name);
    
    // Check Engineering teams
    const engineeringDept = hierarchy.company.children.find((d: any) => d.id === 'engineering-dept');
    if (engineeringDept && engineeringDept.line_managers) {
      engineeringDept.line_managers.forEach((lm: any) => {
        lm.teams.forEach((teamName: string) => {
          expect(teamNames).toContain(teamName);
        });
      });
    }
    
    // Check Customer Solutions teams
    const customerSolutionsDept = hierarchy.company.children.find((d: any) => d.id === 'customer-solutions-dept');
    if (customerSolutionsDept && customerSolutionsDept.regions) {
      customerSolutionsDept.regions.forEach((region: any) => {
        if (region.teams) {
          region.teams.forEach((teamName: string) => {
            expect(teamNames).toContain(teamName);
          });
        }
      });
    }
  });
});
