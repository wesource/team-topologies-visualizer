import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000';

test.describe('Team Topologies Visualizer', () => {
  
  test('should load the application', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Check title
    await expect(page).toHaveTitle(/Team Topologies Visualizer/);
    
    // Check main elements exist
    await expect(page.locator('h1')).toContainText('Team Topologies Visualizer');
    await expect(page.locator('#teamCanvas')).toBeVisible();
    await expect(page.locator('.legend')).toBeVisible();
  });

  test('should have both view radio buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    const currentStateRadio = page.locator('input[value="current"]');
    const ttVisionRadio = page.locator('input[value="tt"]');
    
    await expect(currentStateRadio).toBeVisible();
    await expect(ttVisionRadio).toBeVisible();
    
    // TT Design should be checked by default
    await expect(ttVisionRadio).toBeChecked();
  });

  test('should load organization hierarchy API', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Wait for API calls
    const hierarchyResponse = await page.waitForResponse(
      response => response.url().includes('/api/organization-hierarchy') && response.status() === 200
    );
    
    const hierarchyData = await hierarchyResponse.json();
    
    // Verify hierarchy structure
    expect(hierarchyData).toHaveProperty('company');
    expect(hierarchyData.company).toHaveProperty('children');
    expect(hierarchyData.company.children.length).toBeGreaterThan(0);
  });

  test('should load teams API for current view', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    const teamsResponse = await page.waitForResponse(
      response => response.url().includes('/api/teams?view=current') && response.status() === 200
    );
    
    const teams = await teamsResponse.json();
    
    // Verify teams are loaded
    expect(Array.isArray(teams)).toBe(true);
    expect(teams.length).toBeGreaterThan(0);
    
    // Check team structure
    if (teams.length > 0) {
      const firstTeam = teams[0];
      expect(firstTeam).toHaveProperty('name');
      expect(firstTeam).toHaveProperty('team_type');
      expect(firstTeam).toHaveProperty('position');
    }
  });

  test('should display teams in sidebar', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Wait for teams to load
    await page.waitForResponse(response => response.url().includes('/api/teams'));
    
    // Wait a bit for UI to update
    await page.waitForTimeout(500);
    
    const teamList = page.locator('#teamList');
    const teamItems = teamList.locator('.team-item');
    
    // Should have teams in the list
    await expect(teamItems.first()).toBeVisible();
    const count = await teamItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should switch between Pre-TT and TT Design', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Wait for initial load (TT Design is default)
    await page.waitForResponse(response => response.url().includes('/api/teams?view=tt'));
    
    // Click Pre-TT (current) radio button
    await page.locator('input[value="current"]').click();
    
    // Wait for current teams to load
    await page.waitForResponse(response => response.url().includes('/api/teams?view=current'));
    
    // Verify current is now checked
    await expect(page.locator('input[value="current"]')).toBeChecked();
  });

  test('should have canvas with proper dimensions', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    const canvas = page.locator('#teamCanvas');
    await expect(canvas).toBeVisible();
    
    // Check canvas has dimensions
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('should display legend with team types', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Wait for config to load
    await page.waitForResponse(response => response.url().includes('/api/team-types'));
    await page.waitForTimeout(500);
    
    const legend = page.locator('.legend');
    const legendItems = legend.locator('.legend-item');
    
    // Should have legend items
    const count = await legendItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should take screenshot of Pre-TT view for visual verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Switch to Pre-TT view (current)
    await page.locator('input[value="current"]').click();
    
    // Wait for all data to load
    await page.waitForResponse(response => response.url().includes('/api/organization-hierarchy'));
    await page.waitForResponse(response => response.url().includes('/api/teams?view=current'));
    await page.waitForTimeout(500); // Minimal wait for rendering
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/current-state-view.png', 
      fullPage: false // Only visible area for speed
    });
  });

  test('should take screenshot of TT Vision view for visual verification', async ({ page }) => {
    // Set larger viewport for better screenshot quality
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Wait for TT data to load (TT Design is default)
    await page.waitForResponse(response => response.url().includes('/api/teams?view=tt'));
    await page.waitForTimeout(500); // Minimal wait for rendering
    
    // Click auto-align button for TT Design view
    await page.locator('#autoAlignTTBtn').click();
    await page.waitForTimeout(1500); // Wait longer for alignment animation and API calls
    
    // Take high-quality screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/tt-vision-view.png', 
      fullPage: true, // Capture entire page including scrollable areas
      scale: 'device' // Use device pixel ratio for higher quality
    });
  });

  test('should handle refresh button', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Wait for initial load
    await page.waitForResponse(response => response.url().includes('/api/teams'));
    
    // Click refresh button
    await page.locator('#refreshBtn').click();
    
    // Wait for reload
    await page.waitForResponse(response => response.url().includes('/api/teams'));
    
    // Teams should still be visible
    const teamItems = page.locator('#teamList .team-item');
    await expect(teamItems.first()).toBeVisible();
  });

  test('API endpoints should return valid JSON', async ({ request }) => {
    // Test team types endpoint
    const teamTypesResponse = await request.get(`${BASE_URL}/api/team-types?view=current`);
    expect(teamTypesResponse.ok()).toBeTruthy();
    const teamTypes = await teamTypesResponse.json();
    expect(teamTypes).toHaveProperty('team_types');
    
    // Test organization hierarchy endpoint
    const hierarchyResponse = await request.get(`${BASE_URL}/api/organization-hierarchy`);
    expect(hierarchyResponse.ok()).toBeTruthy();
    const hierarchy = await hierarchyResponse.json();
    expect(hierarchy).toHaveProperty('company');
    
    // Test teams endpoint
    const teamsResponse = await request.get(`${BASE_URL}/api/teams?view=current`);
    expect(teamsResponse.ok()).toBeTruthy();
    const teams = await teamsResponse.json();
    expect(Array.isArray(teams)).toBe(true);
  });

  test('should verify Customer Solutions department has 4 regions', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    const hierarchyResponse = await page.waitForResponse(
      response => response.url().includes('/api/organization-hierarchy')
    );
    
    const hierarchyData = await hierarchyResponse.json();
    const customerSolutionsDept = hierarchyData.company.children.find(
      (dept: any) => dept.id === 'customer-solutions-dept'
    );
    
    expect(customerSolutionsDept).toBeDefined();
    expect(customerSolutionsDept.regions).toBeDefined();
    expect(customerSolutionsDept.regions.length).toBe(4);
    
    // Verify region names
    const regionNames = customerSolutionsDept.regions.map((r: any) => r.name);
    expect(regionNames).toContain('Asia Region');
    expect(regionNames).toContain('Africa Region');
    expect(regionNames).toContain('Europe Region');
    expect(regionNames).toContain('America Region');
  });

  test('should verify Engineering department has 5 line managers', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    const hierarchyResponse = await page.waitForResponse(
      response => response.url().includes('/api/organization-hierarchy')
    );
    
    const hierarchyData = await hierarchyResponse.json();
    const engineeringDept = hierarchyData.company.children.find(
      (dept: any) => dept.id === 'engineering-dept'
    );
    
    expect(engineeringDept).toBeDefined();
    expect(engineeringDept.line_managers).toBeDefined();
    expect(engineeringDept.line_managers.length).toBe(5);
  });

  test('should render markdown correctly in team detail modal', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Wait for teams to load (TT Design is default)
    await page.waitForResponse(response => response.url().includes('/api/teams?view=tt'));
    await page.waitForTimeout(1500); // Wait for canvas rendering and app initialization
    
    // Fetch team data and call showTeamDetails directly
    await page.evaluate(async () => {
      const response = await fetch('/api/teams/Cloud%20Development%20Platform%20Team?view=tt');
      const team = await response.json();
      
      // Use the exposed test helper
      // @ts-ignore
      if (window._testHelpers?.showTeamDetails) {
        // @ts-ignore
        window._testHelpers.showTeamDetails(team, 'tt');
      }
    });
    
    // Wait for modal to appear
    const modal = page.locator('#detailModal');
    await expect(modal).toBeVisible({ timeout: 3000 });
    
    const modalContent = modal.locator('.team-api-content');
    
    // Verify markdown headers are rendered as HTML headers with appropriate classes
    const h2Headers = modalContent.locator('h2');
    await expect(h2Headers.first()).toBeVisible();
    const h2Count = await h2Headers.count();
    expect(h2Count).toBeGreaterThan(0);
    
    const h3Headers = modalContent.locator('h3');
    const h3Count = await h3Headers.count();
    expect(h3Count).toBeGreaterThan(0);
    
    // Verify markdown tables are rendered as HTML tables
    const tables = modalContent.locator('table');
    await expect(tables.first()).toBeVisible();
    const tableCount = await tables.count();
    expect(tableCount).toBeGreaterThan(0);
    
    // Verify table structure (thead, tbody, th, td)
    const firstTable = tables.first();
    await expect(firstTable.locator('thead')).toBeVisible();
    await expect(firstTable.locator('tbody')).toBeVisible();
    await expect(firstTable.locator('th').first()).toBeVisible();
    await expect(firstTable.locator('td').first()).toBeVisible();
    
    // Verify markdown lists are rendered as HTML lists
    const lists = modalContent.locator('ul, ol');
    const listCount = await lists.count();
    expect(listCount).toBeGreaterThan(0);
    
    // Verify list items
    const listItems = modalContent.locator('li');
    const liCount = await listItems.count();
    expect(liCount).toBeGreaterThan(0);
    
    // Verify bold text is rendered as <strong>
    const boldText = modalContent.locator('strong');
    const boldCount = await boldText.count();
    expect(boldCount).toBeGreaterThan(0);
    
    // Verify links are rendered with target="_blank"
    const links = modalContent.locator('a[target="_blank"]');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
    
    // Verify code blocks exist
    const codeBlocks = modalContent.locator('code');
    const codeCount = await codeBlocks.count();
    expect(codeCount).toBeGreaterThan(0);
    
    // Take screenshot of rendered markdown for visual verification
    await page.screenshot({ 
      path: 'tests/screenshots/team-detail-markdown-rendering.png',
      fullPage: true
    });
    
    // Close modal
    await page.locator('#detailModalClose').click();
    await expect(modal).not.toBeVisible();
  });
});