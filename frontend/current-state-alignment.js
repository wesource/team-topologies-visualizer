import { LAYOUT } from './constants.js';

// Team alignment utilities for auto-organizing teams by line manager

/**
 * Auto-align teams vertically under their line managers
 * @param {Array} teams - Array of team objects with positions
 * @param {Object} organizationHierarchy - The organization hierarchy structure
 * @returns {Array} Array of teams that were realigned
 */
export function autoAlignTeamsByManager(teams, organizationHierarchy) {
    if (!organizationHierarchy || !organizationHierarchy.company) {
        console.warn('No organization hierarchy available');
        return [];
    }

    const realignedTeams = [];
    const company = organizationHierarchy.company;

    // Process engineering department with line managers
    const engineeringDept = company.children.find(d => d.id === 'engineering-dept');
    if (engineeringDept && engineeringDept.line_managers) {
        engineeringDept.line_managers.forEach((lineManager, lmIndex) => {
            if (!lineManager.teams || lineManager.teams.length === 0) return;

            // Calculate line manager's X position (same logic as renderer)
            const deptStartX = LAYOUT.DEPT_START_X;
            const deptIndex = company.children.findIndex(d => d.id === 'engineering-dept');
            const deptX = deptStartX + deptIndex * LAYOUT.DEPT_SPACING;

            const lmCount = engineeringDept.line_managers.length;
            const lmSpacing = LAYOUT.LINE_MANAGER_SPACING;
            const lmStartX = deptX - ((lmCount - 1) * lmSpacing) / 2;
            const lineManagerX = lmStartX + lmIndex * lmSpacing;

            // Get teams for this line manager
            const managerTeams = lineManager.teams
                .map(teamName => teams.find(t => t.name === teamName))
                .filter(t => t !== undefined);

            // Align teams vertically under line manager
            const baseY = LAYOUT.COMPANY_Y + LAYOUT.LEVEL_HEIGHT * 3; // Company level + 3 levels
            const verticalSpacing = LAYOUT.VERTICAL_SPACING;
            const boxWidth = LAYOUT.DEPT_BOX_WIDTH;

            // Position teams at 2/5 offset from line manager box (org-chart style)
            const alignedX = lineManagerX + (boxWidth * LAYOUT.ORG_CHART_TEAM_X_OFFSET);

            managerTeams.forEach((team, teamIndex) => {
                const newX = alignedX;
                const newY = baseY + (teamIndex * verticalSpacing);

                // Only update if position changed significantly (more than 5px)
                if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                    team.position.x = newX;
                    team.position.y = newY;
                    realignedTeams.push(team);
                }
            });
        });
    }

    // Process customer solutions department with regions
    const customerSolutionsDept = company.children.find(d => d.id === 'customer-solutions-dept');
    if (customerSolutionsDept && customerSolutionsDept.regions) {
        customerSolutionsDept.regions.forEach((region, regionIndex) => {
            if (!region.teams || region.teams.length === 0) return;

            // Calculate region's X position (same logic as renderer)
            const deptStartX = LAYOUT.DEPT_START_X;
            const deptIndex = company.children.findIndex(d => d.id === 'customer-solutions-dept');
            const deptX = deptStartX + deptIndex * LAYOUT.DEPT_SPACING;

            const regionCount = customerSolutionsDept.regions.length;
            const regionSpacing = LAYOUT.LINE_MANAGER_SPACING;
            const regionStartX = deptX - ((regionCount - 1) * regionSpacing) / 2;
            const regionX = regionStartX + regionIndex * regionSpacing;

            // Get teams for this region
            const regionTeams = region.teams
                .map(teamName => teams.find(t => t.name === teamName))
                .filter(t => t !== undefined);

            // Align teams vertically under region
            const baseY = LAYOUT.COMPANY_Y + LAYOUT.LEVEL_HEIGHT * 3; // Company level + 3 levels
            const verticalSpacing = LAYOUT.VERTICAL_SPACING;
            const boxWidth = LAYOUT.DEPT_BOX_WIDTH;

            // Position teams at 2/5 offset from region box (org-chart style)
            const alignedX = regionX + (boxWidth * LAYOUT.ORG_CHART_TEAM_X_OFFSET);

            regionTeams.forEach((team, teamIndex) => {
                const newX = alignedX;
                const newY = baseY + (teamIndex * verticalSpacing);

                // Only update if position changed significantly (more than 5px)
                if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                    team.position.x = newX;
                    team.position.y = newY;
                    realignedTeams.push(team);
                }
            });
        });
    }

    return realignedTeams;
}
