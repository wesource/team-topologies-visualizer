import { LAYOUT } from './constants.js';
import { getValueStreamGroupings } from './tt-value-stream-grouping.js';
import { getPlatformGroupings } from './tt-platform-grouping.js';

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
    const wideTeamVerticalSpacing = 100; // Vertical spacing between wide teams (stacked)
    const narrowTeamSpacingX = 160; // Horizontal spacing between narrow teams
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
        return teamType === 'stream-aligned' || teamType === 'platform';
    }
    
    /**
     * Calculate wide team width (~80% of grouping width, leaving 10% margin on each side)
     */
    function getWideTeamWidth() {
        return (groupingWidth - 2 * paddingInGrouping) * 0.8;
    }
    
    // Helper function to position teams within a grouping
    function positionTeamsInGrouping(groupingTeams, groupingStartX, groupingStartY) {
        // Separate wide teams (stream-aligned, platform) from narrow teams (enabling, complicated subsystem)
        const wideTeams = groupingTeams.filter(team => isWideTeamType(team.team_type));
        const narrowTeams = groupingTeams.filter(team => !isWideTeamType(team.team_type));
        
        let currentYPos = groupingStartY + paddingInGrouping + labelHeight;
        
        // Position wide teams first - stacked vertically, centered horizontally
        const wideTeamWidth = getWideTeamWidth();
        const wideTeamCenterX = groupingStartX + paddingInGrouping + (groupingWidth - 2 * paddingInGrouping) * 0.1; // 10% from left
        
        wideTeams.forEach((team, index) => {
            const newX = wideTeamCenterX;
            const newY = currentYPos;
            
            // Only update if position changed significantly
            if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                team.position.x = newX;
                team.position.y = newY;
                realignedTeams.push(team);
            }
            
            currentYPos += LAYOUT.TEAM_BOX_HEIGHT + wideTeamVerticalSpacing;
        });
        
        // Position narrow teams below wide teams - in a grid layout
        if (narrowTeams.length > 0) {
            // Add some spacing between wide teams and narrow teams
            if (wideTeams.length > 0) {
                currentYPos += 20;
            }
            
            narrowTeams.forEach((team, index) => {
                const row = Math.floor(index / narrowTeamsPerRow);
                const col = index % narrowTeamsPerRow;
                
                const newX = groupingStartX + paddingInGrouping + (col * narrowTeamSpacingX);
                const newY = currentYPos + (row * narrowTeamSpacingY);
                
                // Only update if position changed significantly
                if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                    team.position.x = newX;
                    team.position.y = newY;
                    realignedTeams.push(team);
                }
            });
            
            // Update currentYPos to after narrow teams
            const narrowRows = Math.ceil(narrowTeams.length / narrowTeamsPerRow);
            currentYPos += narrowRows * narrowTeamSpacingY;
        }
        
        // Calculate total grouping height
        return currentYPos - groupingStartY + paddingInGrouping;
    }
    
    // Position value stream groupings first (excluding ungrouped)
    const actualValueStreamGroupings = valueStreamGroupings.filter(g => g.name !== '(Ungrouped)');
    
    actualValueStreamGroupings.forEach((grouping, index) => {
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
    platformGroupings.forEach((grouping, index) => {
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
    
    // Position ungrouped teams in a separate area (bottom right)
    if (ungroupedTeams.length > 0) {
        const ungroupedStartX = startX + (groupingsPerRow * groupingSpacingX);
        const ungroupedStartY = startY;
        
        // Separate wide and narrow ungrouped teams
        const wideUngrouped = ungroupedTeams.filter(team => isWideTeamType(team.team_type));
        const narrowUngrouped = ungroupedTeams.filter(team => !isWideTeamType(team.team_type));
        
        let currentYPos = ungroupedStartY;
        
        // Position wide ungrouped teams stacked vertically
        wideUngrouped.forEach((team, index) => {
            const newX = ungroupedStartX;
            const newY = currentYPos;
            
            if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                team.position.x = newX;
                team.position.y = newY;
                realignedTeams.push(team);
            }
            
            currentYPos += LAYOUT.TEAM_BOX_HEIGHT + wideTeamVerticalSpacing;
        });
        
        // Position narrow ungrouped teams in grid below wide teams
        if (narrowUngrouped.length > 0) {
            if (wideUngrouped.length > 0) {
                currentYPos += 20; // Spacing between wide and narrow
            }
            
            narrowUngrouped.forEach((team, index) => {
                const row = Math.floor(index / narrowTeamsPerRow);
                const col = index % narrowTeamsPerRow;
                
                const newX = ungroupedStartX + (col * narrowTeamSpacingX);
                const newY = currentYPos + (row * narrowTeamSpacingY);
                
                if (Math.abs(team.position.x - newX) > 5 || Math.abs(team.position.y - newY) > 5) {
                    team.position.x = newX;
                    team.position.y = newY;
                    realignedTeams.push(team);
                }
            });
        }
    }
    
    return realignedTeams;
}
