import { describe, it, expect } from 'vitest';
import { autoAlignTTDesign } from './tt-design-alignment.js';

describe('autoAlignTTDesign - Mixed Team Types', () => {
    it('should handle mix of wide and narrow teams in same grouping', () => {
        const teams = [
            {
                name: 'E-Commerce Stream Team',
                team_type: 'stream-aligned',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 0, y: 0 }
            },
            {
                name: 'Mobile Stream Team',
                team_type: 'stream-aligned',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 0, y: 0 }
            },
            {
                name: 'Payment Platform',
                team_type: 'platform',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 0, y: 0 }
            },
            {
                name: 'Security Enablement',
                team_type: 'enabling',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 0, y: 0 }
            },
            {
                name: 'DevOps Enablement',
                team_type: 'enabling',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 0, y: 0 }
            },
            {
                name: 'Complex Algorithm Team',
                team_type: 'complicated-subsystem',
                metadata: { value_stream: 'E-Commerce' },
                position: { x: 0, y: 0 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);
        
        // Should realign all 6 teams
        expect(realigned.length).toBe(6);
        
        // First 3 teams (wide: stream-aligned x2, platform x1) stack vertically at same X
        const wideTeamX = 204;
        expect(realigned[0].position.x).toBe(wideTeamX);
        expect(realigned[1].position.x).toBe(wideTeamX);
        expect(realigned[2].position.x).toBe(wideTeamX);
        
        // Wide teams Y positions: stacked vertically
        expect(realigned[0].position.y).toBe(165);  // First wide team
        expect(realigned[1].position.y).toBe(345);  // Second wide team
        expect(realigned[2].position.y).toBe(525);  // Third wide team
        
        // Last 3 teams (narrow: enabling x2, complicated-subsystem x1) in grid below
        // Grid starts after wide teams with some spacing
        const narrowStartY = 525 + 80 + 100 + 20; // Last wide team Y + height + spacing + gap = 725
        
        // Narrow teams in grid: 3 per row
        expect(realigned[3].position.x).toBe(130); // First column
        expect(realigned[3].position.y).toBe(narrowStartY);
        
        expect(realigned[4].position.x).toBe(290); // Second column (130 + 160)
        expect(realigned[4].position.y).toBe(narrowStartY);
        
        expect(realigned[5].position.x).toBe(450); // Third column (290 + 160)
        expect(realigned[5].position.y).toBe(narrowStartY);
    });

    it('should demonstrate Team Topologies book visualization pattern', () => {
        // This test demonstrates the pattern from the TT book:
        // - Wide stream-aligned and platform teams span horizontally showing flow
        // - Narrow enabling teams are positioned below/around to support
        const teams = [
            {
                name: 'Checkout Stream',
                team_type: 'stream-aligned',
                metadata: { value_stream: 'E-Commerce Experience' },
                position: { x: 0, y: 0 }
            },
            {
                name: 'Product Discovery Stream',
                team_type: 'stream-aligned',
                metadata: { value_stream: 'E-Commerce Experience' },
                position: { x: 0, y: 0 }
            },
            {
                name: 'Core Platform',
                team_type: 'platform',
                metadata: { value_stream: 'E-Commerce Experience' },
                position: { x: 0, y: 0 }
            },
            {
                name: 'DevOps Enablement',
                team_type: 'enabling',
                metadata: { value_stream: 'E-Commerce Experience' },
                position: { x: 0, y: 0 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);
        
        // All teams realigned
        expect(realigned.length).toBe(4);
        
        // Wide teams (stream x2, platform x1) all have same X coordinate
        // This visually shows they span the "whole flow of change"
        const flowX = 204;
        expect(realigned[0].position.x).toBe(flowX);
        expect(realigned[1].position.x).toBe(flowX);
        expect(realigned[2].position.x).toBe(flowX);
        
        // They stack vertically showing the flow from top to bottom
        expect(realigned[0].position.y).toBeLessThan(realigned[1].position.y);
        expect(realigned[1].position.y).toBeLessThan(realigned[2].position.y);
        
        // Enabling team (narrow) is positioned in grid below the flow
        expect(realigned[3].position.y).toBeGreaterThan(realigned[2].position.y);
    });
});
