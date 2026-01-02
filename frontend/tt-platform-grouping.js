// Platform Grouping Utilities
// Handles grouping platform teams by platform_grouping metadata

import { LAYOUT } from './constants.js';
import { getTeamBoxWidth } from './renderer-common.js';

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
        const platformGrouping = team.metadata?.platform_grouping;
        
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
    const padding = 20;

    groupMap.forEach((teamsInGroup, name) => {
        const bounds = calculateGroupingBoundingBox(
            teamsInGroup,
            LAYOUT.TEAM_BOX_HEIGHT,
            padding,
            'tt' // View context for dynamic width calculation
        );

        // Debug logging for Cloud Infrastructure Platform Grouping
        if (name === 'Cloud Infrastructure Platform Grouping') {
            console.log('🔍 Platform Grouping Debug:', {
                name,
                teamCount: teamsInGroup.length,
                teams: teamsInGroup.map(t => ({ 
                    name: t.name, 
                    x: t.position?.x, 
                    y: t.position?.y,
                    teamType: t.team_type 
                })),
                bounds
            });
        }

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
        const platformGrouping = team.metadata?.platform_grouping;
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

    return teams.filter(team => team.metadata?.platform_grouping === selectedPlatformGrouping);
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

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + teamWidth);
        maxY = Math.max(maxY, y + teamBoxHeight);

        // Collect details for debugging
        teamDetails.push({
            name: team.name,
            x, y,
            teamWidth,
            rightEdge: x + teamWidth,
            bottomEdge: y + teamBoxHeight
        });
    });

    // Check if teams are too spread out vertically (likely stale positions)
    const verticalSpread = maxY - minY;
    const maxReasonableSpread = 800; // If teams span more than this vertically, positions are likely stale
    
    if (verticalSpread > maxReasonableSpread) {
        // Teams are too spread out - likely have stale positions from before auto-align
        // Return a minimal bounding box around just the first team to avoid huge boxes
        console.warn(`⚠️ Platform grouping "${teams[0]?.metadata?.platform_grouping}" has stale positions (spread: ${verticalSpread}px). Skipping bounding box until auto-align.`);
        return { x: 0, y: 0, width: 0, height: 0, stale: true };
    }

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
