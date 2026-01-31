import { getValueStreamGroupings } from '../../tt-concepts/tt-value-stream-grouping.js';
import { getPlatformGroupings } from '../../tt-concepts/tt-platform-grouping.js';
import { getTeamBoxHeight } from '../../rendering/renderer-common.js';

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
    const ungroupedStartX = 100; // Ungrouped teams on the left
    const groupingsStartX = 400; // Groupings start position (closer to ungrouped teams for compact layout)
    const startY = 100;
    const groupingWidth = 800; // Standard grouping width (increased for wide teams)
    const groupingSpacingX = 650; // Horizontal space between groupings (reduced for compact layout)
    const groupingSpacingY = 50; // Vertical space between rows of groupings (reduced since teams stack vertically)
    const groupingsPerRow = 2; // Max groupings per row
    const paddingInGrouping = 30; // Padding inside grouping rectangles
    const labelHeight = 35; // Height reserved for grouping label

    // Team dimensions and spacing based on Team Topologies book visualization
    const wideTeamVerticalSpacing = 60; // Vertical spacing between wide teams (stacked) - 75% of team box height
    const narrowTeamSpacingY = 120; // Vertical spacing between rows of narrow teams
    const narrowTeamsPerRow = 3; // Max narrow teams per row

    let currentY = startY;

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
        // Sort teams so those with the same inner grouping are adjacent (clustered)
        const sortedTeams = [...groupingTeams].sort((a, b) => {
            const innerA = a.value_stream_inner || a.platform_grouping_inner || a.metadata?.value_stream_inner || a.metadata?.platform_grouping_inner || '';
            const innerB = b.value_stream_inner || b.platform_grouping_inner || b.metadata?.value_stream_inner || b.metadata?.platform_grouping_inner || '';
            
            // Sort by inner grouping name (teams with no inner grouping come last)
            if (innerA && !innerB) return -1;
            if (!innerA && innerB) return 1;
            return innerA.localeCompare(innerB);
        });

        // Separate wide teams (stream-aligned, platform) from narrow teams (enabling, complicated subsystem)
        const wideTeams = sortedTeams.filter(team => isWideTeamType(team.team_type));
        const narrowTeams = sortedTeams.filter(team => !isWideTeamType(team.team_type));

        let currentYPos = groupingStartY + paddingInGrouping + labelHeight;

        // All teams within a grouping should have the same X position
        // Use the first team's alignment hint if available, otherwise center the grouping
        const groupingContentWidth = groupingWidth - 2 * paddingInGrouping;
        const firstTeamHintX = groupingTeams[0]?.metadata?.align_hint_x;

        let groupingX;
        if (firstTeamHintX === 'left') {
            groupingX = groupingStartX + paddingInGrouping;
        } else if (firstTeamHintX === 'right') {
            // Position towards the right side of the grouping
            groupingX = groupingStartX + paddingInGrouping + groupingContentWidth - 560; // 560px = wide team width
        } else if (firstTeamHintX === 'center') {
            // Center within the grouping
            groupingX = groupingStartX + paddingInGrouping + (groupingContentWidth - 560) / 2;
        } else {
            // Default to center for platform teams, left for others
            const firstTeamType = groupingTeams[0]?.team_type;
            if (firstTeamType === 'platform') {
                groupingX = groupingStartX + paddingInGrouping + (groupingContentWidth - 560) / 2;
            } else {
                groupingX = groupingStartX + paddingInGrouping;
            }
        }

        // Position wide teams first - stacked vertically at the same X position
        wideTeams.forEach((team, _index) => {
            const newX = groupingX;
            const newY = currentYPos;

            // Only update if position changed significantly
            if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                team.position.x = newX;
                team.position.y = newY;
                realignedTeams.push(team);
            }

            // Move to next team position (use actual team height for proper spacing)
            const teamHeight = getTeamBoxHeight(team, 'tt');
            currentYPos += teamHeight + wideTeamVerticalSpacing;
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
                const col = index % narrowTeamsPerRow;

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

                // Position narrow teams horizontally side by side
                const narrowTeamWidth = 200;
                const narrowTeamHorizontalSpacing = 40;
                const newX = groupingX + col * (narrowTeamWidth + narrowTeamHorizontalSpacing);
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

    // Separate groupings with vertical and horizontal hints
    const topLeftGroupings = [];
    const topCenterGroupings = [];
    const topRightGroupings = [];
    const bottomLeftGroupings = [];
    const bottomCenterGroupings = [];
    const bottomRightGroupings = [];

    actualValueStreamGroupings.forEach(grouping => {
        // Check if any team in grouping has align_hint_y and align_hint_x
        const hintY = grouping.teams.find(t => t.metadata?.align_hint_y)?.metadata?.align_hint_y;
        const hintX = grouping.teams.find(t => t.metadata?.align_hint_x)?.metadata?.align_hint_x;

        // Determine vertical position (value streams default to top)
        const isTop = !hintY || hintY === 'top';

        // Determine horizontal position (default to center/left)
        if (hintX === 'left') {
            if (isTop) topLeftGroupings.push(grouping);
            else bottomLeftGroupings.push(grouping);
        } else if (hintX === 'right') {
            if (isTop) topRightGroupings.push(grouping);
            else bottomRightGroupings.push(grouping);
        } else {
            // Default: center
            if (isTop) topCenterGroupings.push(grouping);
            else bottomCenterGroupings.push(grouping);
        }
    });

    // Helper function to position a list of groupings
    function positionGroupingsList(groupingsList, startX) {
        let localX = startX;
        let localY = currentY;
        let localGroupingsInRow = 0;
        let localMaxHeight = 0;

        groupingsList.forEach((grouping, _index) => {
            const groupingHeight = positionTeamsInGrouping(grouping.teams, localX, localY);
            localMaxHeight = Math.max(localMaxHeight, groupingHeight);

            localGroupingsInRow++;

            if (localGroupingsInRow >= groupingsPerRow) {
                // Move to next row
                localX = startX;
                localY += localMaxHeight + groupingSpacingY;
                localGroupingsInRow = 0;
                localMaxHeight = 0;
            } else {
                // Move to next column
                localX += groupingSpacingX;
            }
        });

        // Update global current position for next section
        if (localGroupingsInRow > 0) {
            currentY = localY + localMaxHeight + groupingSpacingY;
        } else {
            currentY = localY;
        }
    }

    // Position top row: left, center, right
    const topRowStartY = currentY;

    // Top-left groupings
    if (topLeftGroupings.length > 0) {
        currentY = topRowStartY;
        positionGroupingsList(topLeftGroupings, groupingsStartX);
    }

    // Top-center groupings
    if (topCenterGroupings.length > 0) {
        currentY = topRowStartY;
        positionGroupingsList(topCenterGroupings, groupingsStartX + groupingSpacingX);
    }

    // Top-right groupings
    if (topRightGroupings.length > 0) {
        currentY = topRowStartY;
        positionGroupingsList(topRightGroupings, groupingsStartX + groupingSpacingX * 2);
    }

    // Find the maximum Y after top row
    currentY = Math.max(
        topLeftGroupings.length > 0 ? currentY : topRowStartY,
        topCenterGroupings.length > 0 ? currentY : topRowStartY,
        topRightGroupings.length > 0 ? currentY : topRowStartY
    );

    // Start new row for platform groupings if needed
    const bottomRowStartY = currentY;

    // Separate platform groupings by horizontal hints and add to appropriate arrays
    platformGroupings.forEach(grouping => {
        const hintX = grouping.teams.find(t => t.metadata?.align_hint_x)?.metadata?.align_hint_x;
        const hintY = grouping.teams.find(t => t.metadata?.align_hint_y)?.metadata?.align_hint_y;

        // Platform groupings default to bottom (foundational), but can be overridden
        const isBottom = !hintY || hintY === 'bottom';

        if (!isBottom) {
            // If platform wants to be at top, add to top groupings instead
            if (hintX === 'left') {
                topLeftGroupings.push(grouping);
            } else if (hintX === 'right') {
                topRightGroupings.push(grouping);
            } else {
                topCenterGroupings.push(grouping);
            }
            return;
        }

        // Position at bottom based on horizontal hint
        if (hintX === 'left') {
            bottomLeftGroupings.push(grouping);
        } else if (hintX === 'right') {
            bottomRightGroupings.push(grouping);
        } else {
            // Platform groupings default to center
            bottomCenterGroupings.push(grouping);
        }
    });

    // Position bottom row: left, center, right
    // Bottom-left groupings
    if (bottomLeftGroupings.length > 0) {
        currentY = bottomRowStartY;
        positionGroupingsList(bottomLeftGroupings, groupingsStartX);
    }

    // Bottom-center groupings
    if (bottomCenterGroupings.length > 0) {
        currentY = bottomRowStartY;
        positionGroupingsList(bottomCenterGroupings, groupingsStartX + groupingSpacingX);
    }

    // Bottom-right groupings
    if (bottomRightGroupings.length > 0) {
        currentY = bottomRowStartY;
        positionGroupingsList(bottomRightGroupings, groupingsStartX + groupingSpacingX * 2);
    }

    // Position ungrouped teams on the left side of canvas
    if (ungroupedTeams.length > 0) {
        // Helper to calculate horizontal position for ungrouped teams
        function getUngroupedHorizontalPosition(team) {
            const hintX = team.metadata?.align_hint_x;

            if (hintX === 'left') {
                // Position on left side of canvas
                return ungroupedStartX;
            } else if (hintX === 'center') {
                // Position in center area
                return ungroupedStartX + 200;
            } else if (hintX === 'right') {
                // Position further right
                return ungroupedStartX + 400;
            }

            // Default positioning based on team type for ungrouped teams
            if (team.team_type === 'platform') {
                // Platform teams default to left (foundational)
                return ungroupedStartX;
            } else if (team.team_type === 'stream-aligned') {
                // Stream-aligned teams default to right (customer-facing)
                return ungroupedStartX + 400;
            } else if (team.team_type === 'enabling') {
                // Enabling teams default to left (supporting role)
                return ungroupedStartX;
            } else {
                // Complicated-subsystem and undefined default to left (supporting/foundational)
                return ungroupedStartX;
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

        // Position all top ungrouped teams stacked vertically (simple stack)
        topUngrouped.forEach((team) => {
            const newX = getUngroupedHorizontalPosition(team);
            const newY = currentYPos;

            if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                team.position.x = newX;
                team.position.y = newY;
                realignedTeams.push(team);
            }

            // Use actual team height for proper spacing
            const teamHeight = getTeamBoxHeight(team, 'tt');
            const verticalSpacing = 40;
            currentYPos += teamHeight + verticalSpacing;
        });

        // Position bottom ungrouped teams
        if (bottomUngrouped.length > 0) {
            // Start bottom section lower on canvas
            // Use currentY (which tracks the bottom of all groupings) plus some spacing
            const bottomStartY = Math.max(currentY, 600); // Position at least at y=600 or below groupings
            currentYPos = bottomStartY;

            // Position all bottom ungrouped teams stacked vertically (simple stack)
            bottomUngrouped.forEach((team) => {
                const newX = getUngroupedHorizontalPosition(team);
                const newY = currentYPos;

                if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                    team.position.x = newX;
                    team.position.y = newY;
                    realignedTeams.push(team);
                }

                // Use actual team height for proper spacing
                const teamHeight = getTeamBoxHeight(team, 'tt');
                const verticalSpacing = 40;
                currentYPos += teamHeight + verticalSpacing;
            });
        }
    }

    return realignedTeams;
}
