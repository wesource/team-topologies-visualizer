import { LAYOUT } from './constants.js';
import { getValueStreamGroupings } from './tt-value-stream-grouping.js';
import { getPlatformGroupings } from './tt-platform-grouping.js';
import { getTeamBoxHeight } from './renderer-common.js';

// TT Design view alignment utilities for auto-organizing teams within groupings

/**
 * Auto-align teams within value stream and platform groupings
 * Organizes groupings in a clean layout and positions teams within each grouping
 * @param {Array} teams - Array of team objects with positions
 * @returns {Array} Array of teams that were realigned
 */
export function autoAlignTTDesign(teams) {
    if (!teams || teams.length === 0) {
        return [];
    }

    const realignedTeams = [];

    // Get all groupings
    const valueStreamGroupings = getValueStreamGroupings(teams);
    const platformGroupings = getPlatformGroupings(teams);

    // Separate grouped and ungrouped teams
    const groupedTeamNames = new Set();

    // Track teams in value streams
    valueStreamGroupings.forEach(grouping => {
        if (grouping.name !== '(Ungrouped)') {
            grouping.teams.forEach(team => groupedTeamNames.add(team.name));
        }
    });

    // Track teams in platform groupings
    platformGroupings.forEach(grouping => {
        grouping.teams.forEach(team => groupedTeamNames.add(team.name));
    });

    const ungroupedTeams = teams.filter(team => !groupedTeamNames.has(team.name));

    // Layout configuration
    const startX = 100;
    const startY = 100;
    const groupingWidth = 800; // Standard grouping width (increased for wide teams)
    const groupingSpacingX = 850; // Horizontal space between groupings (grouping width + margin)
    const groupingSpacingY = 50; // Vertical space between rows of groupings (reduced since teams stack vertically)
    const groupingsPerRow = 2; // Max groupings per row
    const paddingInGrouping = 30; // Padding inside grouping rectangles
    const labelHeight = 35; // Height reserved for grouping label

    // Team dimensions and spacing based on Team Topologies book visualization
    const wideTeamVerticalSpacing = 60; // Vertical spacing between wide teams (stacked) - 75% of team box height
    const narrowTeamSpacingY = 120; // Vertical spacing between rows of narrow teams
    const narrowTeamsPerRow = 3; // Max narrow teams per row

    let currentX = startX;
    let currentY = startY;
    let groupingsInCurrentRow = 0;
    let maxHeightInRow = 0;

    /**
     * Check if team type should be rendered wide (horizontal flow)
     * Stream-aligned and Platform teams span the flow of change
     */
    function isWideTeamType(teamType) {
        // Wide teams: stream-aligned and platform
        // Narrow teams: enabling, complicated-subsystem, undefined
        return teamType === 'stream-aligned' || teamType === 'platform';
    }

    // Helper function to position teams within a grouping
    function positionTeamsInGrouping(groupingTeams, groupingStartX, groupingStartY) {
        // Separate wide teams (stream-aligned, platform) from narrow teams (enabling, complicated subsystem)
        const wideTeams = groupingTeams.filter(team => isWideTeamType(team.team_type));
        const narrowTeams = groupingTeams.filter(team => !isWideTeamType(team.team_type));

        let currentYPos = groupingStartY + paddingInGrouping + labelHeight;

        // Calculate horizontal positions based on team type and hints
        function getHorizontalPosition(team) {
            const groupingContentWidth = groupingWidth - 2 * paddingInGrouping;

            // Check for explicit hint first
            const hintX = team.metadata?.align_hint_x;

            if (hintX === 'left') {
                return groupingStartX + paddingInGrouping;
            } else if (hintX === 'center') {
                const pos = groupingStartX + paddingInGrouping + groupingContentWidth * 0.35;
                return pos;
            } else if (hintX === 'right') {
                const pos = groupingStartX + paddingInGrouping + groupingContentWidth * 0.7;
                return pos;
            }

            // Default positioning based on team type
            if (team.team_type === 'platform') {
                // Platform teams default to left (provide capabilities)
                return groupingStartX + paddingInGrouping;
            } else if (team.team_type === 'stream-aligned') {
                // Stream-aligned teams default to right (deliver to customers)
                const pos = groupingStartX + paddingInGrouping + groupingContentWidth * 0.7;
                return pos;
            } else if (team.team_type === 'enabling') {
                // Enabling teams default to center (facilitate)
                const pos = groupingStartX + paddingInGrouping + groupingContentWidth * 0.35;
                return pos;
            } else {
                // Complicated-subsystem and undefined default to center-left
                const pos = groupingStartX + paddingInGrouping + groupingContentWidth * 0.2;
                return pos;
            }
        }

        // Position wide teams first - stacked vertically, positioned horizontally by type/hint
        wideTeams.forEach((team, _index) => {
            const newX = getHorizontalPosition(team);
            const newY = currentYPos;

            // Only update if position changed significantly
            if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                team.position.x = newX;
                team.position.y = newY;
                realignedTeams.push(team);
            }

            // Move to next team position (but we'll adjust after the loop if this is the last team)
            currentYPos += LAYOUT.TEAM_BOX_HEIGHT + wideTeamVerticalSpacing;
        });

        // After wide teams, currentYPos is spacing pixels below the last team
        // Adjust back: we want currentYPos at the BOTTOM of the last team, not beyond it
        if (wideTeams.length > 0) {
            currentYPos -= wideTeamVerticalSpacing; // Remove the extra spacing after last team
        }

        // Position narrow teams below wide teams - in a grid layout
        if (narrowTeams.length > 0) {
            // Add some spacing between wide teams and narrow teams
            if (wideTeams.length > 0) {
                currentYPos += 20;
            }

            // Position narrow teams (enabling, complicated-subsystem)
            narrowTeams.forEach((team, index) => {
                const row = Math.floor(index / narrowTeamsPerRow);

                // Calculate Y position by summing heights of all previous rows
                let rowYPos = currentYPos;
                for (let r = 0; r < row; r++) {
                    const rowStartIdx = r * narrowTeamsPerRow;
                    const rowEndIdx = Math.min((r + 1) * narrowTeamsPerRow, narrowTeams.length);
                    const teamsInRow = narrowTeams.slice(rowStartIdx, rowEndIdx);
                    // Find the tallest team in this row
                    const maxHeightInRow = Math.max(...teamsInRow.map(t => getTeamBoxHeight(t, 'tt')));
                    // Add this row's max height plus the fixed gap between rows (40px)
                    const gapBetweenRows = 40; // Fixed gap between rows
                    rowYPos += maxHeightInRow + gapBetweenRows;
                }

                // Use horizontal positioning function for narrow teams too
                const newX = getHorizontalPosition(team);
                const newY = rowYPos;

                // Only update if position changed significantly
                if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                    team.position.x = newX;
                    team.position.y = newY;
                    realignedTeams.push(team);
                }
            });

            // Update currentYPos to bottom of narrow teams
            // Need to account for the ACTUAL height of teams, not just LAYOUT.TEAM_BOX_HEIGHT
            // Find the tallest team in the last row
            const narrowRows = Math.ceil(narrowTeams.length / narrowTeamsPerRow);
            const lastRowStartIndex = (narrowRows - 1) * narrowTeamsPerRow;
            const lastRowTeams = narrowTeams.slice(lastRowStartIndex);
            const maxHeightInLastRow = Math.max(...lastRowTeams.map(t => getTeamBoxHeight(t, 'tt')));

            currentYPos += (narrowRows - 1) * narrowTeamSpacingY + maxHeightInLastRow;
        }

        // Calculate total grouping height
        // currentYPos is now at the bottom of the last team
        // Add extra spacing after last team to ensure padding below all teams
        const bottomSpacing = 40; // Extra space after last team for visual padding
        return currentYPos - groupingStartY + bottomSpacing + paddingInGrouping;
    }

    // Position value stream groupings first (excluding ungrouped)
    const actualValueStreamGroupings = valueStreamGroupings.filter(g => g.name !== '(Ungrouped)');

    // Separate groupings with vertical hints
    const topGroupings = [];
    const bottomGroupings = [];

    actualValueStreamGroupings.forEach(grouping => {
        // Check if any team in grouping has align_hint_y
        const hintY = grouping.teams.find(t => t.metadata?.align_hint_y)?.metadata?.align_hint_y;

        if (hintY === 'top') {
            topGroupings.push(grouping);
        } else if (hintY === 'bottom') {
            bottomGroupings.push(grouping);
        } else {
            // Value streams default to top (customer-facing)
            topGroupings.push(grouping);
        }
    });

    // Position top groupings first (value streams default here)
    topGroupings.forEach((grouping, _index) => {
        const groupingHeight = positionTeamsInGrouping(grouping.teams, currentX, currentY);
        maxHeightInRow = Math.max(maxHeightInRow, groupingHeight);

        groupingsInCurrentRow++;

        if (groupingsInCurrentRow >= groupingsPerRow) {
            // Move to next row
            currentX = startX;
            currentY += maxHeightInRow + groupingSpacingY;
            groupingsInCurrentRow = 0;
            maxHeightInRow = 0;
        } else {
            // Move to next column
            currentX += groupingSpacingX;
        }
    });

    // Start new row for platform groupings if needed
    if (groupingsInCurrentRow > 0) {
        currentX = startX;
        currentY += maxHeightInRow + groupingSpacingY;
        groupingsInCurrentRow = 0;
        maxHeightInRow = 0;
    }

    // Position platform groupings
    platformGroupings.forEach((grouping, _index) => {
        // Check if any team in grouping has align_hint_y
        const hintY = grouping.teams.find(t => t.metadata?.align_hint_y)?.metadata?.align_hint_y;

        // Platform groupings can override default bottom position with hint
        if (hintY === 'top') {
            // Add to bottom groupings list to be positioned later
            bottomGroupings.push(grouping);
            return; // Skip positioning for now, will be handled below
        }

        // Default: position platform groupings at bottom (foundational)
        const groupingHeight = positionTeamsInGrouping(grouping.teams, currentX, currentY);
        maxHeightInRow = Math.max(maxHeightInRow, groupingHeight);

        groupingsInCurrentRow++;

        if (groupingsInCurrentRow >= groupingsPerRow) {
            // Move to next row
            currentX = startX;
            currentY += maxHeightInRow + groupingSpacingY;
            groupingsInCurrentRow = 0;
            maxHeightInRow = 0;
        } else {
            // Move to next column
            currentX += groupingSpacingX;
        }
    });

    // Position bottom groupings (value streams with bottom hint)
    if (bottomGroupings.length > 0) {
        // Start new row if needed
        if (groupingsInCurrentRow > 0) {
            currentX = startX;
            currentY += maxHeightInRow + groupingSpacingY;
            groupingsInCurrentRow = 0;
            maxHeightInRow = 0;
        }

        bottomGroupings.forEach((grouping, _index) => {
            const groupingHeight = positionTeamsInGrouping(grouping.teams, currentX, currentY);
            maxHeightInRow = Math.max(maxHeightInRow, groupingHeight);

            groupingsInCurrentRow++;

            if (groupingsInCurrentRow >= groupingsPerRow) {
                // Move to next row
                currentX = startX;
                currentY += maxHeightInRow + groupingSpacingY;
                groupingsInCurrentRow = 0;
                maxHeightInRow = 0;
            } else {
                // Move to next column
                currentX += groupingSpacingX;
            }
        });
    }

    // Position ungrouped teams in a separate area (bottom right)
    if (ungroupedTeams.length > 0) {
        const ungroupedStartX = startX + (groupingsPerRow * groupingSpacingX);

        // Helper to calculate horizontal position for ungrouped teams
        // Similar to grouped teams but using canvas-relative positioning
        function getUngroupedHorizontalPosition(team) {
            const hintX = team.metadata?.align_hint_x;

            if (hintX === 'left') {
                // Position on left side of canvas
                const pos = startX;
                return pos;
            } else if (hintX === 'center') {
                // Position in center of canvas (between groupings and ungrouped area)
                const pos = startX + groupingSpacingX;
                return pos;
            } else if (hintX === 'right') {
                // Position in ungrouped area (right side)
                return ungroupedStartX;
            }

            // Default positioning based on team type for ungrouped teams
            if (team.team_type === 'platform') {
                // Platform teams default to left (foundational)
                return startX;
            } else if (team.team_type === 'stream-aligned') {
                // Stream-aligned teams default to ungrouped area (right, customer-facing)
                return ungroupedStartX;
            } else if (team.team_type === 'enabling') {
                // Enabling teams default to left (supporting role)
                return startX;
            } else {
                // Complicated-subsystem and undefined default to left (supporting/foundational)
                return startX;
            }
        }

        // Separate ungrouped teams by vertical positioning hint
        const topUngrouped = ungroupedTeams.filter(team => {
            const hintY = team.metadata?.align_hint_y;
            // Default to top for ungrouped teams unless explicitly set to bottom
            return hintY !== 'bottom';
        });
        const bottomUngrouped = ungroupedTeams.filter(team => {
            const hintY = team.metadata?.align_hint_y;
            return hintY === 'bottom';
        });

        // Position top ungrouped teams
        let currentYPos = startY;

        // Separate wide and narrow ungrouped teams in top section
        const wideTopUngrouped = topUngrouped.filter(team => isWideTeamType(team.team_type));
        const narrowTopUngrouped = topUngrouped.filter(team => !isWideTeamType(team.team_type));

        // Position wide top ungrouped teams stacked vertically
        wideTopUngrouped.forEach((team, _index) => {
            const newX = getUngroupedHorizontalPosition(team);
            const newY = currentYPos;

            if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                team.position.x = newX;
                team.position.y = newY;
                realignedTeams.push(team);
            }

            currentYPos += LAYOUT.TEAM_BOX_HEIGHT + wideTeamVerticalSpacing;
        });

        // Position narrow top ungrouped teams in grid below wide teams
        if (narrowTopUngrouped.length > 0) {
            if (wideTopUngrouped.length > 0) {
                currentYPos += 20; // Spacing between wide and narrow
            }

            narrowTopUngrouped.forEach((team, _index) => {
                const row = Math.floor(_index / narrowTeamsPerRow);
                let rowYPos = currentYPos;
                for (let r = 0; r < row; r++) {
                    const rowStartIdx = r * narrowTeamsPerRow;
                    const rowEndIdx = Math.min((r + 1) * narrowTeamsPerRow, narrowTopUngrouped.length);
                    const teamsInRow = narrowTopUngrouped.slice(rowStartIdx, rowEndIdx);
                    const maxHeightInRow = Math.max(...teamsInRow.map(t => getTeamBoxHeight(t, 'tt')));
                    const gapBetweenRows = 40;
                    rowYPos += maxHeightInRow + gapBetweenRows;
                }

                const newX = getUngroupedHorizontalPosition(team);
                const newY = rowYPos;

                if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                    team.position.x = newX;
                    team.position.y = newY;
                    realignedTeams.push(team);
                }
            });
        }

        // Position bottom ungrouped teams
        if (bottomUngrouped.length > 0) {
            // Start bottom section lower on canvas
            // Use currentY (which tracks the bottom of all groupings) plus some spacing
            const bottomStartY = Math.max(currentY, 600); // Position at least at y=600 or below groupings
            currentYPos = bottomStartY;

            // Separate wide and narrow in bottom section
            const wideBottomUngrouped = bottomUngrouped.filter(team => isWideTeamType(team.team_type));
            const narrowBottomUngrouped = bottomUngrouped.filter(team => !isWideTeamType(team.team_type));

            // Position wide bottom ungrouped teams
            wideBottomUngrouped.forEach((team, _index) => {
                const newX = getUngroupedHorizontalPosition(team);
                const newY = currentYPos;

                if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                    team.position.x = newX;
                    team.position.y = newY;
                    realignedTeams.push(team);
                }

                currentYPos += LAYOUT.TEAM_BOX_HEIGHT + wideTeamVerticalSpacing;
            });

            // Position narrow bottom ungrouped teams
            if (narrowBottomUngrouped.length > 0) {
                if (wideBottomUngrouped.length > 0) {
                    currentYPos += 20; // Spacing between wide and narrow
                }

                narrowBottomUngrouped.forEach((team, _index) => {
                    const row = Math.floor(_index / narrowTeamsPerRow);
                    let rowYPos = currentYPos;
                    for (let r = 0; r < row; r++) {
                        const rowStartIdx = r * narrowTeamsPerRow;
                        const rowEndIdx = Math.min((r + 1) * narrowTeamsPerRow, narrowBottomUngrouped.length);
                        const teamsInRow = narrowBottomUngrouped.slice(rowStartIdx, rowEndIdx);
                        const maxHeightInRow = Math.max(...teamsInRow.map(t => getTeamBoxHeight(t, 'tt')));
                        const gapBetweenRows = 40;
                        rowYPos += maxHeightInRow + gapBetweenRows;
                    }

                    const newX = getUngroupedHorizontalPosition(team);
                    const newY = rowYPos;

                    if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                        team.position.x = newX;
                        team.position.y = newY;
                        realignedTeams.push(team);
                    }
                });
            }
        }
    }

    return realignedTeams;
}
