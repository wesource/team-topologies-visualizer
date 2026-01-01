// Shared layout calculation utilities
// Used by both canvas renderer and SVG export to ensure consistency

import { LAYOUT } from './constants.js';

/**
 * Calculate department position
 * @param {number} deptIndex - Index of the department
 * @param {number} startX - Starting X position
 * @returns {{x: number, y: number}}
 */
export function calculateDepartmentPosition(deptIndex, startX = 500) {
    const deptStartX = startX + 50;
    return {
        x: deptStartX + deptIndex * LAYOUT.DEPT_SPACING,
        y: LAYOUT.COMPANY_Y + LAYOUT.LEVEL_HEIGHT
    };
}

/**
 * Calculate line manager position within a department
 * @param {number} lmIndex - Index of the line manager
 * @param {number} lmCount - Total number of line managers
 * @param {number} deptX - X position of the department
 * @returns {{x: number, y: number}}
 */
export function calculateLineManagerPosition(lmIndex, lmCount, deptX) {
    const lmStartX = deptX - ((lmCount - 1) * LAYOUT.LINE_MANAGER_SPACING) / 2;
    return {
        x: lmStartX + lmIndex * LAYOUT.LINE_MANAGER_SPACING,
        y: LAYOUT.COMPANY_Y + LAYOUT.LEVEL_HEIGHT * 2
    };
}

/**
 * Calculate region position within a department
 * @param {number} regionIndex - Index of the region
 * @param {number} regionCount - Total number of regions
 * @param {number} deptX - X position of the department
 * @returns {{x: number, y: number}}
 */
export function calculateRegionPosition(regionIndex, regionCount, deptX) {
    const regionStartX = deptX - ((regionCount - 1) * LAYOUT.LINE_MANAGER_SPACING) / 2;
    return {
        x: regionStartX + regionIndex * LAYOUT.LINE_MANAGER_SPACING,
        y: LAYOUT.COMPANY_Y + LAYOUT.LEVEL_HEIGHT * 2
    };
}

/**
 * Calculate org-chart vertical line X position for a manager/region box
 * @param {number} managerX - X position of the manager/region box
 * @returns {number}
 */
export function calculateVerticalLineX(managerX) {
    return managerX + (LAYOUT.DEPT_BOX_WIDTH * LAYOUT.ORG_CHART_VERTICAL_LINE_OFFSET);
}

/**
 * Calculate the aligned X position for teams under a manager/region
 * @param {number} managerX - X position of the manager/region box
 * @returns {number}
 */
export function calculateTeamAlignedX(managerX) {
    return managerX + (LAYOUT.DEPT_BOX_WIDTH * LAYOUT.ORG_CHART_TEAM_X_OFFSET);
}

/**
 * Get the hierarchy level Y positions
 * @returns {{company: number, department: number, lineManager: number, team: number}}
 */
export function getHierarchyLevels() {
    return {
        company: LAYOUT.COMPANY_Y,
        department: LAYOUT.COMPANY_Y + LAYOUT.LEVEL_HEIGHT,
        lineManager: LAYOUT.COMPANY_Y + LAYOUT.LEVEL_HEIGHT * 2,
        team: LAYOUT.COMPANY_Y + LAYOUT.LEVEL_HEIGHT * 3
    };
}
