import { LAYOUT } from '../../core/constants.js';

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

    // Process all departments - works with line_managers, regions, or any sub-structure
    company.children.forEach((dept, deptIndex) => {
        // Check if department has line_managers or regions (or any similar sub-structure)
        const subManagers = dept.line_managers || dept.regions;
        
        if (!subManagers || subManagers.length === 0) {
            return; // Skip departments without sub-managers
        }

        // Calculate department's X position (same logic as renderer)
        const deptStartX = LAYOUT.DEPT_START_X;
        const deptX = deptStartX + deptIndex * LAYOUT.DEPT_SPACING;

        const subManagerCount = subManagers.length;
        const subManagerSpacing = LAYOUT.LINE_MANAGER_SPACING;
        const subManagerStartX = deptX - ((subManagerCount - 1) * subManagerSpacing) / 2;

        // Process each line manager/region
        subManagers.forEach((subManager, subManagerIndex) => {
            if (!subManager.teams || subManager.teams.length === 0) return;

            // Calculate sub-manager's X position
            const subManagerX = subManagerStartX + subManagerIndex * subManagerSpacing;

            // Get teams for this sub-manager
            const managerTeams = subManager.teams
                .map(teamName => teams.find(t => t.name === teamName))
                .filter(t => t !== undefined);

            // Align teams vertically under sub-manager
            const baseY = LAYOUT.COMPANY_Y + LAYOUT.LEVEL_HEIGHT * 3; // Company level + 3 levels
            const verticalSpacing = LAYOUT.VERTICAL_SPACING;
            const boxWidth = LAYOUT.DEPT_BOX_WIDTH;

            // Position teams at 2/5 offset from sub-manager box (org-chart style)
            const alignedX = subManagerX + (boxWidth * LAYOUT.ORG_CHART_TEAM_X_OFFSET);

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
    });

    return realignedTeams;
}
