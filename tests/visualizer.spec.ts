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

  // API-dependent tests run serially to avoid resource contention and timeouts
  test.describe.serial('API Loading Tests', () => {
    test('should load organization hierarchy API', async ({ page }) => {
      await page.goto(`${BASE_URL}/static/index.html`);
      
      // Switch to current view (Pre-TT) to trigger organization hierarchy load
      await page.locator('input[value="current"]').click();
      
      // Wait for API calls
      const hierarchyResponse = await page.waitForResponse(
        response => response.url().includes('/api/pre-tt/organization-hierarchy') && response.status() === 200
      );
      
      const hierarchyData = await hierarchyResponse.json();
      
      // Verify hierarchy structure
      expect(hierarchyData).toHaveProperty('company');
      expect(hierarchyData.company).toHaveProperty('children');
      expect(hierarchyData.company.children.length).toBeGreaterThan(0);
    });

    test('should load teams API for current view', async ({ page }) => {
      await page.goto(`${BASE_URL}/static/index.html`);
      
      // Switch to current view to trigger teams API call
      await page.locator('input[value="current"]').click();
      
      const teamsResponse = await page.waitForResponse(
        response => response.url().includes('/api/pre-tt/teams') && response.status() === 200
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
  });

  test('should display teams in sidebar', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Wait for teams to load
    await page.waitForResponse(response => response.url().includes('/api/tt/teams'));
    
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
    await page.waitForResponse(response => response.url().includes('/api/tt/teams'));
    
    // Click Pre-TT (current) radio button
    await page.locator('input[value="current"]').click();
    
    // Wait for current teams to load
    await page.waitForResponse(response => response.url().includes('/api/pre-tt/teams'));
    
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
    await page.waitForResponse(response => response.url().includes('/api/tt/team-types'));
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
    await page.waitForResponse(response => response.url().includes('/api/pre-tt/organization-hierarchy'));
    await page.waitForResponse(response => response.url().includes('/api/pre-tt/teams'));
    await page.waitForTimeout(500); // Minimal wait for rendering
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/current-state-view.png', 
      fullPage: false // Only visible area for speed
    });
  });

  test('should take screenshot of TT Vision view for visual verification', async ({ page }) => {
    // Set larger viewport for better screenshot quality
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Wait for TT data to load (TT Design is default)
    await page.waitForResponse(response => response.url().includes('/api/tt/teams'));
    await page.waitForTimeout(500); // Minimal wait for rendering
    
    // Click auto-align button for TT Design view
    await page.locator('#autoAlignTTBtn').click();
    await page.waitForTimeout(1500); // Wait longer for alignment animation and API calls
    
    // Take high-quality screenshot
    await page.screenshot({ 
      path: 'screenshots/tt-vision-view.png', 
      fullPage: true, // Capture entire page including scrollable areas
      scale: 'device' // Use device pixel ratio for higher quality
    });
  });

  test('should handle refresh button', async ({ page }) => {
    await page.goto(`${BASE_URL}/static/index.html`);
    
    // Wait for initial load
    await page.waitForResponse(response => response.url().includes('/api/tt/teams'));
    
    // Click refresh button
    await page.locator('#refreshBtn').click();
    
    // Wait for reload
    await page.waitForResponse(response => response.url().includes('/api/tt/teams'));
    
    // Teams should still be visible
    const teamItems = page.locator('#teamList .team-item');
    await expect(teamItems.first()).toBeVisible();
  });

  test('API endpoints should return valid JSON', async ({ request }) => {
    // Test team types endpoint
    const teamTypesResponse = await request.get(`${BASE_URL}/api/pre-tt/team-types`);
    expect(teamTypesResponse.ok()).toBeTruthy();
    const teamTypes = await teamTypesResponse.json();
    expect(teamTypes).toHaveProperty('team_types');
    
    // Test organization hierarchy endpoint
    const hierarchyResponse = await request.get(`${BASE_URL}/api/pre-tt/organization-hierarchy`);
    expect(hierarchyResponse.ok()).toBeTruthy();
    const hierarchy = await hierarchyResponse.json();
    expect(hierarchy).toHaveProperty('company');
    
    // Test teams endpoint
    const teamsResponse = await request.get(`${BASE_URL}/api/pre-tt/teams`);
    expect(teamsResponse.ok()).toBeTruthy();
    const teams = await teamsResponse.json();
    expect(Array.isArray(teams)).toBe(true);
  });

  // Hierarchy structure tests run serially to avoid timeout issues
  test.describe.serial('Organization Hierarchy Tests', () => {
    test('should verify Customer Solutions department has 4 regions', async ({ page }) => {
      await page.goto(`${BASE_URL}/static/index.html`);
      
      // Switch to current view to trigger organization hierarchy load
      await page.locator('input[value="current"]').click();
      
      const hierarchyResponse = await page.waitForResponse(
        response => response.url().includes('/api/pre-tt/organization-hierarchy')
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

    test('should verify Engineering department has 6 line managers', async ({ page }) => {
      await page.goto(`${BASE_URL}/static/index.html`);
      
      // Switch to current view to trigger organization hierarchy load
      await page.locator('input[value="current"]').click();
      
      const hierarchyResponse = await page.waitForResponse(
        response => response.url().includes('/api/pre-tt/organization-hierarchy')
      );
      
      const hierarchyData = await hierarchyResponse.json();
      const engineeringDept = hierarchyData.company.children.find(
        (dept: any) => dept.id === 'engineering-dept'
      );
      
      expect(engineeringDept).toBeDefined();
      expect(engineeringDept.line_managers).toBeDefined();
      expect(engineeringDept.line_managers.length).toBe(6);
    });
  });

  // Modal rendering test runs separately with longer waits
  test.describe.serial('Modal Rendering Tests', () => {
    test('should render markdown correctly in team detail modal', async ({ page }) => {
      await page.goto(`${BASE_URL}/static/index.html`);
      
      // Wait for teams to load (TT Design is default)
      await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
      await page.waitForTimeout(1000); // Allow teams to populate sidebar
      
      // Double-click first team in sidebar to open modal (most reliable approach)
      const firstTeam = page.locator('#teamList .team-item').first();
      await firstTeam.dblclick();
      
      // Wait for modal to appear
      const modal = page.locator('#detailModal');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      const modalContent = modal.locator('.team-api-content');
      await expect(modalContent).toBeVisible();
    
      // Verify markdown headers are rendered as HTML headers
      const headers = modalContent.locator('h2, h3');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);
    
      // Verify some markdown formatting is rendered (tables, lists, bold, or links)
      const formattedElements = modalContent.locator('table, ul, ol, strong, em, a');
      const formattedCount = await formattedElements.count();
      expect(formattedCount).toBeGreaterThan(0);
    
      // Take screenshot for visual verification
      await page.screenshot({ 
        path: 'screenshots/team-detail-markdown-rendering.png',
        fullPage: true
      });
    
      // Close modal
      await page.locator('#detailModalClose').click();
      await expect(modal).not.toBeVisible();
    });
  });

  // UI Interaction Tests
  test.describe('UI Interactions', () => {
    test('should filter teams by value stream', async ({ page }) => {
      await page.goto(`${BASE_URL}/static/index.html`);
      await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
      await page.waitForTimeout(500);
      
      // Get initial state from hidden test element
      const testState = page.locator('#canvasTestState');
      const initialTotal = await testState.getAttribute('data-total-teams');
      const initialFiltered = await testState.getAttribute('data-filtered-teams');
      expect(initialTotal).toBe(initialFiltered); // No filters initially
      
      // Open filter panel
      await page.locator('#filterToggleBtn').click();
      const dropdown = page.locator('#filterDropdown');
      await expect(dropdown).toBeVisible();
      
      // Verify filter options exist
      const vsFilters = page.locator('#valueStreamFilters input[type="checkbox"]');
      expect(await vsFilters.count()).toBeGreaterThan(0);
      
      // Select first value stream filter and apply
      await vsFilters.first().check();
      await page.locator('#applyFiltersBtn').click();
      await page.waitForTimeout(300);
      
      // Verify filter is active in test state
      const activeFilters = await testState.getAttribute('data-active-filters');
      const filters = JSON.parse(activeFilters || '{}');
      expect(filters.valueStreams.length).toBeGreaterThan(0);
      
      // Verify filter badge shows
      await expect(page.locator('#filterCount')).toBeVisible();
      
      // Verify filtered count changed (may be same or less)
      const filteredCount = await testState.getAttribute('data-filtered-teams');
      expect(parseInt(filteredCount || '0')).toBeGreaterThan(0);
      
      // Clear filters
      await page.locator('#filterToggleBtn').click();
      await page.locator('#clearAllFiltersBtn').click();
      await page.locator('#applyFiltersBtn').click();
      await page.waitForTimeout(200);
      
      // Verify filters cleared
      const clearedFilters = await testState.getAttribute('data-active-filters');
      const clearedParsed = JSON.parse(clearedFilters || '{}');
      expect(clearedParsed.valueStreams.length).toBe(0);
    });

    test('should search teams in sidebar', async ({ page }) => {
      await page.goto(`${BASE_URL}/static/index.html`);
      await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
      await page.waitForTimeout(500);
      
      const searchBox = page.locator('#teamSearch');
      await expect(searchBox).toBeVisible();
      
      // Type search term
      await searchBox.fill('Cloud');
      await page.waitForTimeout(300);
      
      // Verify teams still visible
      const teamItems = page.locator('#teamList .team-item');
      expect(await teamItems.count()).toBeGreaterThan(0);
      
      // Clear with Escape
      await searchBox.press('Escape');
      await page.waitForTimeout(200);
      expect(await searchBox.inputValue()).toBe('');
    });

    test('should use zoom controls', async ({ page }) => {
      await page.goto(`${BASE_URL}/static/index.html`);
      await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
      
      const zoomLevel = page.locator('#zoomLevel');
      await expect(zoomLevel).toContainText('100%');
      
      // Zoom in
      await page.locator('#zoomInBtn').click();
      await page.waitForTimeout(100);
      await expect(zoomLevel).not.toContainText('100%');
      
      // Zoom out
      await page.locator('#zoomOutBtn').click();
      await page.waitForTimeout(100);
      
      // Fit to view
      await page.locator('#fitViewBtn').click();
      await page.waitForTimeout(100);
      await expect(zoomLevel).toBeVisible();
    });

    test('should open validation modal', async ({ page }) => {
      await page.goto(`${BASE_URL}/static/index.html`);
      await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
      
      await page.locator('#validateBtn').click();
      
      // Wait for validation API call
      await page.waitForResponse(response => response.url().includes('/api/tt/validate'), { timeout: 10000 });
      
      const modal = page.locator('#validationModal');
      await expect(modal).toBeVisible({ timeout: 3000 });
      
      const report = page.locator('#validationReport');
      await expect(report).toBeVisible();
      
      // Close modal
      await page.locator('#validationModalClose').click();
      await expect(modal).not.toBeVisible();
    });

    test('should toggle interaction modes visibility', async ({ page }) => {
      await page.goto(`${BASE_URL}/static/index.html`);
      await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
      await page.waitForTimeout(500);
      
      const checkbox = page.locator('#showInteractionModes');
      await expect(checkbox).toBeVisible();
      await expect(checkbox).toBeChecked();
      
      // Uncheck
      await checkbox.uncheck();
      await page.waitForTimeout(200);
      await expect(checkbox).not.toBeChecked();
      
      // Check again
      await checkbox.check();
      await page.waitForTimeout(200);
      await expect(checkbox).toBeChecked();
    });

    test('should toggle cognitive load indicators', async ({ page }) => {
      await page.goto(`${BASE_URL}/static/index.html`);
      await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
      await page.waitForTimeout(500);
      
      const checkbox = page.locator('#showCognitiveLoad');
      await expect(checkbox).toBeVisible();
      await expect(checkbox).not.toBeChecked();
      
      // Check
      await checkbox.check();
      await page.waitForTimeout(200);
      await expect(checkbox).toBeChecked();
      
      // Uncheck
      await checkbox.uncheck();
      await page.waitForTimeout(200);
      await expect(checkbox).not.toBeChecked();
    });

    test('should open team details from sidebar double-click', async ({ page }) => {
      await page.goto(`${BASE_URL}/static/index.html`);
      await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
      await page.waitForTimeout(500);
      
      const firstTeam = page.locator('#teamList .team-item').first();
      await firstTeam.dblclick();
      
      // Wait for modal
      const modal = page.locator('#detailModal');
      await expect(modal).toBeVisible({ timeout: 3000 });
      
      // Verify content loaded
      const content = page.locator('.team-api-content');
      await expect(content).toBeVisible();
      
      // Close modal
      await page.locator('#detailModalClose').click();
    });

    test('should use auto-align button', async ({ page }) => {
      await page.goto(`${BASE_URL}/static/index.html`);
      await page.waitForResponse(response => response.url().includes('/api/tt/teams'), { timeout: 5000 });
      await page.waitForTimeout(500);
      
      const autoAlignBtn = page.locator('#autoAlignTTBtn');
      await expect(autoAlignBtn).toBeVisible();
      
      await autoAlignBtn.click();
      
      // Wait for alignment to complete (it triggers API calls)
      await page.waitForTimeout(1000);
      
      // Button should still be visible (no errors)
      await expect(autoAlignBtn).toBeVisible();
    });
  });
});
