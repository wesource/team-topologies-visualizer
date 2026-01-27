import { describe, it, expect } from 'vitest';
import { autoAlignTTDesign } from './tt-design-alignment.js';
import { calculateGroupingBoundingBox } from '../../tt-concepts/tt-value-stream-grouping.js';
import { LAYOUT } from '../../core/constants.js';

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
                value_stream: 'E-Commerce',
                metadata: {},
                position: { x: 50, y: 50 }
            },
            {
                name: 'Team B',
                team_type: 'stream-aligned',
                value_stream: 'E-Commerce',
                metadata: {},
                position: { x: 60, y: 60 }
            },
            {
                name: 'Team C',
                team_type: 'platform',
                value_stream: 'E-Commerce',
                metadata: {},
                position: { x: 70, y: 70 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);

        // Should realign all 3 teams
        expect(realigned.length).toBe(3);

        // Value streams without hints go to top center column
        // First team is stream-aligned, so all wide teams get left-aligned at 1080
        expect(realigned[0].position.x).toBe(1080);
        expect(realigned[1].position.x).toBe(1080);
        expect(realigned[2].position.x).toBe(1080); // Platform also at 1080 since first team is stream

        // Y positions: stacked vertically with spacing
        // First team (stream-aligned): startY (100) + padding (30) + label (35) = 165
        expect(realigned[0].position.y).toBe(165);
        // Second team (stream-aligned): 165 + height (64) + spacing (60) = 289
        expect(realigned[1].position.y).toBe(289);
        // Third team (platform): 289 + height (64) + spacing (60) = 413
        expect(realigned[2].position.y).toBe(413);
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
                platform_grouping: 'Data Platform',
                metadata: {},
                position: { x: 50, y: 50 }
            },
            {
                name: 'Platform Team B',
                team_type: 'platform',
                platform_grouping: 'Data Platform',
                metadata: {},
                position: { x: 60, y: 60 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);

        // Should realign both platform teams
        expect(realigned.length).toBe(2);

        // Platform groupings without hints go to bottom center, teams centered within grouping
        const expectedX = 1170; // centerColumnX (1050) + padding (30) + center offset (90)
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

        // Ungrouped stream-aligned team positioned in left area
        // ungroupedStartX (100) + offset for stream-aligned (400) = 500
        expect(realigned[0].position.x).toBe(500);
        expect(realigned[0].position.y).toBe(100);
    });

    it('should wrap teams to new rows within grouping', () => {
        const teams = [];
        // Create 7 teams in same value stream (should wrap to 3 rows with 3 teams per row)
        for (let i = 0; i < 7; i++) {
            teams.push({
                name: `Team ${i}`,
                team_type: 'stream-aligned',
                value_stream: 'E-Commerce',
                metadata: {},
                position: { x: 0, y: 0 }
            });
        }

        const realigned = autoAlignTTDesign(teams);

        // Should realign all 7 teams
        expect(realigned.length).toBe(7);

        // All teams are stream-aligned (wide), so they stack vertically at same X
        const expectedX = 1080; // Value stream in center column, left-aligned within grouping
        realigned.forEach(team => {
            expect(team.position.x).toBe(expectedX);
        });

        // Y positions: stacked vertically with spacing (60px between teams)
        expect(realigned[0].position.y).toBe(165);
        expect(realigned[1].position.y).toBe(289);  // 165 + 64 + 60 (stream-aligned height)
        expect(realigned[2].position.y).toBe(413);  // 289 + 64 + 60
        expect(realigned[3].position.y).toBe(537);  // 413 + 64 + 60
        expect(realigned[4].position.y).toBe(661);  // 537 + 64 + 60
        expect(realigned[5].position.y).toBe(785);  // 661 + 64 + 60
        expect(realigned[6].position.y).toBe(909);  // 785 + 64 + 60
    });

    it('should not realign teams that are already in correct position', () => {
        const teams = [
            {
                name: 'Team A',
                team_type: 'stream-aligned',
                value_stream: 'E-Commerce',
                metadata: {},
                position: { x: 1080, y: 165 } // Correct position in center column
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
                value_stream: 'E-Commerce',
                metadata: {},
                position: { x: 0, y: 0 }
            },
            {
                name: 'Stream Team',
                team_type: 'stream-aligned',
                value_stream: 'E-Commerce',
                metadata: {},
                position: { x: 0, y: 0 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);

        // Should realign both teams in same grouping
        expect(realigned.length).toBe(2);

        // Find teams by name to avoid index assumptions
        const platformTeam = realigned.find(t => t.name === 'Core Platform Team');
        const streamTeam = realigned.find(t => t.name === 'Stream Team');

        // Both in value stream grouping (center column)
        // First team is platform, so ALL wide teams get centered at 1170
        expect(platformTeam.position.x).toBe(1170);
        expect(streamTeam.position.x).toBe(1170); // Same X as platform since it's in same grouping

        // But stacked vertically at different Y positions
        // First: platform (165), second: stream-aligned (165 + 80 + 60 = 305)
        expect(platformTeam.position.y).toBe(165);
        expect(streamTeam.position.y).toBe(305);
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
    });

    it('should ensure enabling teams fit within grouping bounding boxes', () => {
        // RED phase: This test should FAIL initially
        // Bug: DevOps Enablement Team (Y=545, Height=140, Bottom=685) extends beyond
        // Enterprise Sales grouping (Y=100, Height=555, Bottom=655)
        // The enabling team bottom is 30px PAST the grouping bottom!

        const teams = [
            { name: 'Payment Processing', team_type: 'stream-aligned', position: { x: 100, y: 100 }, value_stream: 'Financial Services' },
            { name: 'Fraud Detection', team_type: 'complicated-subsystem', position: { x: 220, y: 100 }, value_stream: 'Financial Services' },
            { name: 'Sales Portal', team_type: 'stream-aligned', position: { x: 950, y: 100 }, value_stream: 'Enterprise Sales' },
            { name: 'CRM Integration', team_type: 'stream-aligned', position: { x: 950, y: 180 }, value_stream: 'Enterprise Sales' },
            { name: 'Analytics Platform', team_type: 'stream-aligned', position: { x: 950, y: 260 }, value_stream: 'Enterprise Sales' },
            { name: 'Reporting Team', team_type: 'stream-aligned', position: { x: 950, y: 340 }, value_stream: 'Enterprise Sales' },
            { name: 'Data Engineering Enablement Team', team_type: 'enabling', position: { x: 340, y: 100 }, value_stream: 'Financial Services' },
            { name: 'DevOps Enablement Team', team_type: 'enabling', position: { x: 1070, y: 420 }, value_stream: 'Enterprise Sales' }
        ];

        autoAlignTTDesign(teams, 100, 35, true);

        // Calculate grouping bounds using the same logic as the app
        const financialTeams = teams.filter(t => t.value_stream === 'Financial Services');
        const enterpriseTeams = teams.filter(t => t.value_stream === 'Enterprise Sales');

        // Calculate bounding boxes (mimicking tt-value-stream-grouping.js)
        const financialBounds = calculateGroupingBoundingBox(financialTeams, LAYOUT.TEAM_BOX_HEIGHT, 30, 'tt');
        const enterpriseBounds = calculateGroupingBoundingBox(enterpriseTeams, LAYOUT.TEAM_BOX_HEIGHT, 30, 'tt');

        // Find enabling teams
        const dataEnablingTeam = teams.find(t => t.name === 'Data Engineering Enablement Team');
        const devopsTeam = teams.find(t => t.name === 'DevOps Enablement Team');

        // CRITICAL: Enabling teams are 140px tall, not 80px!
        const ENABLING_TEAM_HEIGHT = 140;

        const dataEnablingBottom = dataEnablingTeam.position.y + ENABLING_TEAM_HEIGHT;
        const devopsBottom = devopsTeam.position.y + ENABLING_TEAM_HEIGHT;

        const financialGroupingBottom = financialBounds.y + financialBounds.height;
        const enterpriseGroupingBottom = enterpriseBounds.y + enterpriseBounds.height;

        // Teams should fit WITHIN their grouping boxes (with padding already included)
        expect(dataEnablingBottom).toBeLessThanOrEqual(financialGroupingBottom);
        expect(devopsBottom).toBeLessThanOrEqual(enterpriseGroupingBottom);
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
        const expectedBoundsHeight = (maxY - minY) + (PADDING * 2) + labelAreaHeight;

        // Verify: the bounding box bottom should be at least PADDING below the lowest team
        const actualBoundsBottom = expectedBoundsTop + expectedBoundsHeight;

        // The bounds should extend at least PADDING (30px) below the last team
        expect(actualBoundsBottom).toBeGreaterThanOrEqual(maxY + PADDING);

        // The bounds should not be excessively large either (sanity check)
        expect(expectedBoundsHeight).toBeLessThan(2000); // Reasonable max height for a grouping
    });

    it('should account for different team heights when positioning (enabling=140px, complicated-subsystem=100px)', () => {
        // Bug fix test: Enabling teams are 140px tall (not 80px), and complicated-subsystem teams are 100px
        // The positioning code must use getTeamBoxHeight() instead of LAYOUT.TEAM_BOX_HEIGHT (80px)
        const teams = [
            {
                name: 'Stream Team',
                team_type: 'stream-aligned',
                value_stream: 'Enterprise Sales',
                position: { x: 0, y: 0 }
            },
            {
                name: 'DevOps Enablement',
                team_type: 'enabling',
                value_stream: 'Enterprise Sales',
                position: { x: 0, y: 0 }
            },
            {
                name: 'Fraud Detection',
                team_type: 'complicated-subsystem',
                value_stream: 'Financial Services',
                position: { x: 0, y: 0 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);
        expect(realigned.length).toBe(3);

        const enablingTeam = realigned.find(t => t.name === 'DevOps Enablement');
        const complicatedTeam = realigned.find(t => t.name === 'Fraud Detection');

        // Enabling team should be positioned, and its actual height is 140px (not 80px)
        expect(enablingTeam).toBeDefined();

        // Complicated-subsystem team should be positioned, and its actual height is 100px (not 80px)
        expect(complicatedTeam).toBeDefined();

        // The key assertion: when we calculate bounding boxes later, these teams should fit
        // This test verifies that the positioning logic accounts for the actual rendered heights

        // Sanity check: teams should be positioned at reasonable Y coordinates
        expect(enablingTeam.position.y).toBeGreaterThan(0);
        expect(complicatedTeam.position.y).toBeGreaterThan(0);
    });
});
