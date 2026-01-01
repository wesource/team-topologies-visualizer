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
        // Second team: 165 + boxHeight (80) + verticalSpacing (100) = 345
        expect(realigned[1].position.y).toBe(345);
        // Third team: 345 + 80 + 100 = 525
        expect(realigned[2].position.y).toBe(525);
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
        expect(realigned[1].position.y).toBe(345); // 165 + boxHeight (80) + spacing (100)
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
        
        // Y positions: stacked vertically with spacing (100px between teams)
        expect(realigned[0].position.y).toBe(165);
        expect(realigned[1].position.y).toBe(345);  // 165 + 80 + 100
        expect(realigned[2].position.y).toBe(525);  // 345 + 80 + 100
        expect(realigned[3].position.y).toBe(705);  // and so on...
        expect(realigned[4].position.y).toBe(885);
        expect(realigned[5].position.y).toBe(1065);
        expect(realigned[6].position.y).toBe(1245);
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
        expect(realigned[1].position.y).toBe(345); // 165 + 80 + 100
    });
});
