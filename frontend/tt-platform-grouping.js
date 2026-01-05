// Platform Grouping Utilities
// Handles grouping platform teams by platform_grouping metadata

import { LAYOUT } from './constants.js';
import { getTeamBoxWidth, getTeamBoxHeight } from './renderer-common.js';

/**
 * Groups platform teams by their platform grouping
 * @param {Array} teams - Array of team objects
 * @returns {Array} Array of grouping objects with name, teams, and bounds
 */
export function getPlatformGroupings(teams) {
    if (!teams || teams.length === 0) {
        return [];
    }

    // Group teams by platform grouping
    const groupMap = new Map();
    
    teams.forEach(team => {
        // Check top-level first (from YAML root), then metadata (for backwards compatibility)
        const platformGrouping = team.platform_grouping || team.metadata?.platform_grouping;
        
        // Only group teams that have a platform_grouping value
        if (platformGrouping) {
            if (!groupMap.has(platformGrouping)) {
                groupMap.set(platformGrouping, []);
            }
            groupMap.get(platformGrouping).push(team);
        }
    });

    // Convert to array and calculate bounding boxes
    const groupings = [];
    const padding = 30; // Increased from 20 to provide more visual padding around teams

    groupMap.forEach((teamsInGroup, name) => {
        const bounds = calculateGroupingBoundingBox(
            teamsInGroup,
            LAYOUT.TEAM_BOX_HEIGHT,
            padding,
            'tt' // View context for dynamic width calculation
        );

        groupings.push({
            name,
            teams: teamsInGroup,
            bounds
        });
    });

    return groupings;
}

/**
 * Gets unique platform grouping names from teams
 * @param {Array} teams - Array of team objects
 * @returns {Array} Sorted array of unique platform grouping names
 */
export function getPlatformGroupingNames(teams) {
    if (!teams || teams.length === 0) {
        return [];
    }

    const platformGroupings = new Set();
    
    teams.forEach(team => {
        // Check top-level first (from YAML root), then metadata (for backwards compatibility)
        const platformGrouping = team.platform_grouping || team.metadata?.platform_grouping;
        if (platformGrouping) {
            platformGroupings.add(platformGrouping);
        }
    });

    return Array.from(platformGroupings).sort();
}

/**
 * Filters teams by selected platform grouping
 * @param {Array} teams - Array of team objects
 * @param {string} selectedPlatformGrouping - Platform grouping to filter by, or "all"
 * @returns {Array} Filtered teams array
 */
export function filterTeamsByPlatformGrouping(teams, selectedPlatformGrouping) {
    if (!teams || teams.length === 0 || !selectedPlatformGrouping || selectedPlatformGrouping === 'all') {
        return teams;
    }

    return teams.filter(team => {
        const platformGrouping = team.platform_grouping || team.metadata?.platform_grouping;
        return platformGrouping === selectedPlatformGrouping;
    });
}

/**
 * Calculates bounding box for a group of teams
 * @param {Array} teams - Teams in the grouping
 * @param {number} teamBoxHeight - Height of a team box
 * @param {number} padding - Padding around the grouping
 * @param {string} currentView - Current view ('current' or 'tt') for dynamic width calculation
 * @returns {Object} Bounding box {x, y, width, height}
 */
export function calculateGroupingBoundingBox(teams, teamBoxHeight, padding, currentView = 'tt') {
    if (!teams || teams.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    // Reserve space for label at top (labelHeight from tt-design-alignment.js)
    const labelAreaHeight = 35; // Space for grouping label above teams

    // Find min/max coordinates
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const teamDetails = []; // For debugging

    teams.forEach(team => {
        const x = team.position?.x || 0;
        const y = team.position?.y || 0;
        const teamWidth = getTeamBoxWidth(team, currentView);
        const teamHeight = getTeamBoxHeight(team, currentView); // Use actual team height

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + teamWidth);
        maxY = Math.max(maxY, y + teamHeight); // Use actual height

        // Collect details for debugging
        teamDetails.push({
            name: team.name,
            x, y,
            teamWidth,
            teamHeight,
            rightEdge: x + teamWidth,
            bottomEdge: y + teamHeight
        });
    });

    // Always render grouping boxes, even if teams are spread out after manual dragging
    const verticalSpread = maxY - minY;

    const result = {
        x: minX - padding,
        y: minY - padding - labelAreaHeight, // Extra space for label at top
        width: (maxX - minX) + (padding * 2),
        height: (maxY - minY) + (padding * 2) + labelAreaHeight // Include label area in height
    };

    // Debug logging for specific groupings
    const groupingName = teams[0]?.metadata?.platform_grouping;
    if (groupingName === 'Cloud Infrastructure Platform Grouping') {
        console.log('📐 Bounding Box Calculation:', {
            groupingName,
            teamCount: teams.length,
            minX, minY, maxX, maxY,
            verticalSpread,
            result,
            teamDetails
        });
    }

    return result;
}
