// Value Stream Grouping Utilities
// Handles grouping teams by value stream and calculating bounding boxes

import { LAYOUT } from '../core/constants.js';
import { getTeamBoxWidth, getTeamBoxHeight } from '../rendering/renderer-common.js';

/**
 * Groups teams by their value stream
 * @param {Array} teams - Array of team objects
 * @returns {Array} Array of grouping objects with name, teams, and bounds
 */
export function getValueStreamGroupings(teams) {
    if (!teams || teams.length === 0) {
        return [];
    }

    // Group teams by value stream
    const groupMap = new Map();

    teams.forEach(team => {
        // Check top-level first (from YAML root), then metadata (for backwards compatibility)
        const valueStream = team.value_stream || team.metadata?.value_stream || '(Ungrouped)';

        if (!groupMap.has(valueStream)) {
            groupMap.set(valueStream, []);
        }
        groupMap.get(valueStream).push(team);
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
 * Gets unique value stream names from teams
 * @param {Array} teams - Array of team objects
 * @returns {Array} Sorted array of unique value stream names (excluding ungrouped)
 */
export function getValueStreamNames(teams) {
    if (!teams || teams.length === 0) {
        return [];
    }

    const valueStreams = new Set();

    teams.forEach(team => {
        // Check top-level first (from YAML root), then metadata (for backwards compatibility)
        const valueStream = team.value_stream || team.metadata?.value_stream;
        if (valueStream) {
            valueStreams.add(valueStream);
        }
    });

    return Array.from(valueStreams).sort();
}

/**
 * Gets inner groupings within value streams (nested boxes)
 * @param {Array} teams - Array of team objects
 * @returns {Array} Array of inner grouping objects with name, parentValueStream, teams, and bounds
 */
export function getValueStreamInnerGroupings(teams) {
    if (!teams || teams.length === 0) {
        return [];
    }

    // Group teams by value_stream + value_stream_inner combination
    const groupMap = new Map();

    teams.forEach(team => {
        const valueStream = team.value_stream || team.metadata?.value_stream;
        const innerGrouping = team.value_stream_inner || team.metadata?.value_stream_inner;
        const platformGrouping = team.platform_grouping || team.metadata?.platform_grouping;

        // Fractal pattern: value_stream_inner can exist within value_stream OR platform_grouping
        if (innerGrouping && (valueStream || platformGrouping)) {
            const outerGrouping = valueStream || platformGrouping;
            const key = `${outerGrouping}::${innerGrouping}`;
            if (!groupMap.has(key)) {
                groupMap.set(key, {
                    parentGrouping: outerGrouping,
                    innerName: innerGrouping,
                    teams: []
                });
            }
            groupMap.get(key).teams.push(team);
        }
    });

    // Convert to array and calculate bounding boxes
    const groupings = [];
    const padding = 15; // Smaller padding for inner boxes

    groupMap.forEach((groupData, key) => {
        const bounds = calculateGroupingBoundingBox(
            groupData.teams,
            LAYOUT.TEAM_BOX_HEIGHT,
            padding,
            'tt', // View context for dynamic width calculation
            10    // Small labelAreaHeight for inner groupings
        );

        groupings.push({
            name: groupData.innerName,
            parentGrouping: groupData.parentGrouping,
            teams: groupData.teams,
            bounds
        });
    });

    return groupings;
}

/**
 * Filters teams by selected value stream
 * @param {Array} teams - Array of team objects
 * @param {string} selectedValueStream - Value stream to filter by, or "all"
 * @returns {Array} Filtered teams array
 */
export function filterTeamsByValueStream(teams, selectedValueStream) {
    if (!teams || teams.length === 0 || !selectedValueStream || selectedValueStream === 'all') {
        return teams;
    }

    return teams.filter(team => {
        const valueStream = team.value_stream || team.metadata?.value_stream;
        return valueStream === selectedValueStream;
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
export function calculateGroupingBoundingBox(teams, teamBoxHeight, padding, currentView = 'tt', labelAreaHeight = 35) {
    if (!teams || teams.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    // Find min/max coordinates
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    teams.forEach(team => {
        const { x, y } = team.position;
        const teamWidth = getTeamBoxWidth(team, currentView);
        const teamHeight = getTeamBoxHeight(team, currentView);

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + teamWidth);
        maxY = Math.max(maxY, y + teamHeight);
    });

    return {
        x: minX - padding,
        y: minY - padding - labelAreaHeight, // Extra space for label at top
        width: (maxX - minX) + (padding * 2),
        height: (maxY - minY) + (padding * 2) + labelAreaHeight // Include label area in height
    };

}
