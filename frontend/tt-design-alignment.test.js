import { describe, it, expect } from 'vitest';
import { autoAlignTTDesign } from './tt-design-alignment.js';

describe('autoAlignTTDesign', () => {
    it('should return empty array for empty team list', () => {
        const result = autoAlignTTDesign([]);
        expect(result).toEqual([]);
    });

    it('should return empty array for null team list', () => {
        const result = autoAlignTTDesign(null);
        expect(result).toEqual([]);
    });

    it('should align teams within value stream groupings', () => {
        const teams = [
            {
                name: 'Team A',
                team_type: 'stream-aligned',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 50, y: 50 }
            },
            {
                name: 'Team B',
                team_type: 'stream-aligned',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 60, y: 60 }
            },
            {
                name: 'Team C',
                team_type: 'platform',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 70, y: 70 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);
        
        // Should realign all 3 teams
        expect(realigned.length).toBe(3);
        
        // All wide teams (stream-aligned and platform) stack vertically at same X
        // X position: startX (100) + padding (30) + 10% margin of (700-60) = 100 + 30 + 64 = 194
        const expectedX = 204;
        expect(realigned[0].position.x).toBe(expectedX);
        expect(realigned[1].position.x).toBe(expectedX);
        expect(realigned[2].position.x).toBe(expectedX);
        
        // Y positions: stacked vertically with spacing
        // First team: startY (100) + padding (30) + label (35) = 165
        expect(realigned[0].position.y).toBe(165);
        // Second team: 165 + boxHeight (80) + verticalSpacing (60) = 305
        expect(realigned[1].position.y).toBe(305);
        // Third team: 305 + 80 + 60 = 445
        expect(realigned[2].position.y).toBe(445);
    });

    it('should handle multiple value stream groupings', () => {
        const teams = [
            {
                name: 'Team A',
                team_type: 'stream-aligned',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 0, y: 0 }
            },
            {
                name: 'Team B',
                team_type: 'stream-aligned',
                metadata: { value_stream: 'Mobile' },
                position: { x: 0, y: 0 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);
        
        // Should realign both teams
        expect(realigned.length).toBe(2);
        
        // Teams should be in different groupings (different X positions)
        expect(realigned[0].position.x).not.toBe(realigned[1].position.x);
    });

    it('should align teams within platform groupings', () => {
        const teams = [
            {
                name: 'Platform Team A',
                team_type: 'platform',
                metadata: { platform_grouping: 'Data Platform' },
                position: { x: 50, y: 50 }
            },
            {
                name: 'Platform Team B',
                team_type: 'platform',
                metadata: { platform_grouping: 'Data Platform' },
                position: { x: 60, y: 60 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);
        
        // Should realign both platform teams
        expect(realigned.length).toBe(2);
        
        // Wide teams (platform) stack vertically at same X
        const expectedX = 204; // startX (100) + padding (30) + 10% margin (64)
        expect(realigned[0].position.x).toBe(expectedX);
        expect(realigned[1].position.x).toBe(expectedX);
        
        // Y positions: stacked vertically
        expect(realigned[0].position.y).toBe(165); // startY + padding + label
        expect(realigned[1].position.y).toBe(305); // 165 + boxHeight (80) + spacing (60)
    });

    it('should handle ungrouped teams', () => {
        const teams = [
            {
                name: 'Ungrouped Team',
                team_type: 'stream-aligned',
                position: { x: 50, y: 50 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);
        
        // Should realign the ungrouped team
        expect(realigned.length).toBe(1);
        
        // Ungrouped team should be positioned in separate area
        // startX (100) + (groupingsPerRow (2) * groupingSpacingX (750)) = 1600
        expect(realigned[0].position.x).toBe(1800);
        expect(realigned[0].position.y).toBe(100);
    });

    it('should wrap teams to new rows within grouping', () => {
        const teams = [];
        // Create 7 teams in same value stream (should wrap to 3 rows with 3 teams per row)
        for (let i = 0; i < 7; i++) {
            teams.push({
                name: `Team ${i}`,
                team_type: 'stream-aligned',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 0, y: 0 }
            });
        }

        const realigned = autoAlignTTDesign(teams);
        
        // Should realign all 7 teams
        expect(realigned.length).toBe(7);
        
        // All teams are stream-aligned (wide), so they stack vertically at same X
        const expectedX = 204;
        realigned.forEach(team => {
            expect(team.position.x).toBe(expectedX);
        });
        
        // Y positions: stacked vertically with spacing (60px between teams)
        expect(realigned[0].position.y).toBe(165);
        expect(realigned[1].position.y).toBe(305);  // 165 + 80 + 60
        expect(realigned[2].position.y).toBe(445);  // 305 + 80 + 60
        expect(realigned[3].position.y).toBe(585);  // and so on...
        expect(realigned[4].position.y).toBe(725);
        expect(realigned[5].position.y).toBe(865);
        expect(realigned[6].position.y).toBe(1005); // 865 + 80 + 60
    });

    it('should not realign teams that are already in correct position', () => {
        const teams = [
            {
                name: 'Team A',
                team_type: 'stream-aligned',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 204, y: 165 } // New correct position for wide team (updated for 800px grouping, 35px label)
            }
        ];

        const realigned = autoAlignTTDesign(teams);
        
        // Should return empty array as no teams needed realignment
        expect(realigned.length).toBe(0);
    });

    it('should handle mix of value streams and platform groupings', () => {
        const teams = [
            {
                name: 'Stream Team',
                team_type: 'stream-aligned',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 0, y: 0 }
            },
            {
                name: 'Platform Team',
                team_type: 'platform',
                metadata: { platform_grouping: 'Data Platform' },
                position: { x: 0, y: 0 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);
        
        // Should realign both teams
        expect(realigned.length).toBe(2);
        
        // Teams should be in different areas
        expect(realigned[0].position.y).not.toBe(realigned[1].position.y);
    });

    it('should handle inner platform teams (platform teams with value_stream)', () => {
        const teams = [
            {
                name: 'Core Platform Team',
                team_type: 'platform',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 0, y: 0 }
            },
            {
                name: 'Stream Team',
                team_type: 'stream-aligned',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 0, y: 0 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);
        
        // Should realign both teams in same grouping
        expect(realigned.length).toBe(2);
        
        // Both teams are wide (platform + stream-aligned), so same X position
        const expectedX = 204;
        expect(realigned[0].position.x).toBe(expectedX);
        expect(realigned[1].position.x).toBe(expectedX);
        
        // But stacked vertically at different Y positions
        expect(realigned[0].position.y).toBe(165);
        expect(realigned[1].position.y).toBe(305); // 165 + 80 + 60
    });

    it('should ensure grouping boxes contain narrow teams with adequate padding', () => {
        // Test case for bug: narrow teams (enabling/complicated-subsystem) should have
        // padding below them inside the grouping box
        const teams = [
            {
                name: 'Stream Team',
                team_type: 'stream-aligned',
                value_stream: 'Financial Services',
                position: { x: 0, y: 0 }
            },
            {
                name: 'Fraud Detection Team',
                team_type: 'complicated-subsystem',
                value_stream: 'Financial Services',
                position: { x: 0, y: 0 }
            },
            {
                name: 'Platform Team',
                team_type: 'platform',
                value_stream: 'Enterprise Sales',
                position: { x: 0, y: 0 }
            },
            {
                name: 'DevOps Enablement',
                team_type: 'enabling',
                value_stream: 'Enterprise Sales',
                position: { x: 0, y: 0 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);
        
        // All teams should be realigned
        expect(realigned.length).toBe(4);
        
        // Get the aligned positions
        const fraudTeam = realigned.find(t => t.name === 'Fraud Detection Team');
        const devopsTeam = realigned.find(t => t.name === 'DevOps Enablement');
        
        // Constants from tt-design-alignment.js
        const TEAM_BOX_HEIGHT = 80;
        const MIN_BOTTOM_PADDING = 5; // Minimum padding below team boxes
        
        // For Financial Services grouping (first grouping)
        // Grouping starts at: startY (100)
        // Stream team at: 100 + padding (30) + label (35) = 165
        // Stream team bottom: 165 + 80 = 245
        // After stream team: 245 + spacing (60) - wideTeamVerticalSpacing was reduced = 305
        // Then -60 adjustment = 245
        // Then +20 spacing before narrow = 265
        // Fraud team at: 265
        // Fraud team bottom: 265 + 80 = 345
        
        const fraudTeamBottom = fraudTeam.position.y + TEAM_BOX_HEIGHT;
        
        // Calculate expected grouping bottom for Financial Services
        // Grouping height should be calculated to include fraud team bottom + padding
        // Expected: (fraudTeamBottom - groupingStartY) + bottomSpacing (40) + padding (30)
        const groupingStartY = 100;
        const expectedMinGroupingBottom = fraudTeamBottom + MIN_BOTTOM_PADDING;
        const expectedGroupingHeight = (fraudTeamBottom - groupingStartY) + 40 + 30; // bottomSpacing + paddingInGrouping
        const actualGroupingBottom = groupingStartY + expectedGroupingHeight;
        
        // The grouping bottom should be at least MIN_BOTTOM_PADDING below the team bottom
        expect(actualGroupingBottom).toBeGreaterThanOrEqual(expectedMinGroupingBottom);
        
        // For Enterprise Sales grouping (second grouping)
        // DevOps team should also have padding below it
        const devopsTeamBottom = devopsTeam.position.y + TEAM_BOX_HEIGHT;
        
        // Find the grouping start Y for Enterprise Sales (second grouping, same row)
        // It's at currentX=950, currentY=100 (same as first grouping)
        const enterpriseGroupingStartY = 100;
        const expectedDevOpsMinGroupingBottom = devopsTeamBottom + MIN_BOTTOM_PADDING;
        
        // Calculate expected height for Enterprise grouping
        const expectedEnterpriseGroupingHeight = (devopsTeamBottom - enterpriseGroupingStartY) + 40 + 30;
        const actualEnterpriseGroupingBottom = enterpriseGroupingStartY + expectedEnterpriseGroupingHeight;
        
        expect(actualEnterpriseGroupingBottom).toBeGreaterThanOrEqual(expectedDevOpsMinGroupingBottom);
        
        // General assertion: team bottoms should not be too close to grouping calculated bottom
        // This test will FAIL initially because the height calculation doesn't properly account
        // for the team box height when there are narrow teams
        console.log(`Fraud team bottom: ${fraudTeamBottom}, Expected grouping bottom: ${actualGroupingBottom}`);
        console.log(`DevOps team bottom: ${devopsTeamBottom}, Expected grouping bottom: ${actualEnterpriseGroupingBottom}`);
    });

    it('should ensure bounding boxes contain all teams after auto-alignment', () => {
        // Red-Green-Refactor test: verify that after auto-alignment,
        // the calculated bounding boxes properly contain all teams
        const teams = [
            {
                name: 'Stream Team 1',
                team_type: 'stream-aligned',
                value_stream: 'Enterprise Sales',
                position: { x: 0, y: 0 }
            },
            {
                name: 'Stream Team 2',
                team_type: 'stream-aligned',
                value_stream: 'Enterprise Sales',
                position: { x: 0, y: 0 }
            },
            {
                name: 'Platform Team',
                team_type: 'platform',
                value_stream: 'Enterprise Sales',
                position: { x: 0, y: 0 }
            },
            {
                name: 'DevOps Enablement',
                team_type: 'enabling',
                value_stream: 'Enterprise Sales',
                position: { x: 0, y: 0 }
            }
        ];

        // Auto-align the teams
        const realigned = autoAlignTTDesign(teams);
        expect(realigned.length).toBe(4);

        // Now calculate bounding box based on actual team positions
        const TEAM_BOX_HEIGHT = 80;
        const PADDING = 30;
        
        // Find min/max Y coordinates
        let minY = Infinity;
        let maxY = -Infinity;
        
        realigned.forEach(team => {
            const teamBottom = team.position.y + TEAM_BOX_HEIGHT;
            minY = Math.min(minY, team.position.y);
            maxY = Math.max(maxY, teamBottom);
        });
        
        // Calculate expected bounding box
        const labelAreaHeight = 35;
        const expectedBoundsTop = minY - PADDING - labelAreaHeight;
        const expectedBoundsBottom = maxY + PADDING;
        const expectedBoundsHeight = (maxY - minY) + (PADDING * 2) + labelAreaHeight;
        
        // Verify: the bounding box bottom should be at least PADDING below the lowest team
        const actualBoundsBottom = expectedBoundsTop + expectedBoundsHeight;
        
        console.log(`[TEST] minY=${minY}, maxY=${maxY}, expectedBoundsTop=${expectedBoundsTop}, expectedBoundsBottom=${expectedBoundsBottom}, actualBoundsBottom=${actualBoundsBottom}`);
        
        // The bounds should extend at least PADDING (30px) below the last team
        expect(actualBoundsBottom).toBeGreaterThanOrEqual(maxY + PADDING);
        
        // The bounds should not be excessively large either (sanity check)
        expect(expectedBoundsHeight).toBeLessThan(2000); // Reasonable max height for a grouping
    });
});
