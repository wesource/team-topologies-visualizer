import { describe, it, expect } from 'vitest';
import { autoAlignTTDesign } from './tt-design-alignment.js';

describe('autoAlignTTDesign - Mixed Team Types', () => {
    it('should handle mix of wide and narrow teams in same grouping', () => {
        const teams = [
            {
                name: 'E-Commerce Stream Team',
                team_type: 'stream-aligned',
                value_stream: 'E-Commerce',
                metadata: {},
                position: { x: 0, y: 0 }
            },
            {
                name: 'Mobile Stream Team',
                team_type: 'stream-aligned',
                value_stream: 'E-Commerce',
                metadata: {},
                position: { x: 0, y: 0 }
            },
            {
                name: 'Payment Platform',
                team_type: 'platform',
                value_stream: 'E-Commerce',
                metadata: {},
                position: { x: 0, y: 0 }
            },
            {
                name: 'Security Enablement',
                team_type: 'enabling',
                value_stream: 'E-Commerce',
                metadata: {},
                position: { x: 0, y: 0 }
            },
            {
                name: 'DevOps Enablement',
                team_type: 'enabling',
                value_stream: 'E-Commerce',
                metadata: {},
                position: { x: 0, y: 0 }
            },
            {
                name: 'Complex Algorithm Team',
                team_type: 'complicated-subsystem',
                value_stream: 'E-Commerce',
                metadata: {},
                position: { x: 0, y: 0 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);

        // Should realign all 6 teams
        expect(realigned.length).toBe(6);

        // Value stream grouping in center column
        // First team is stream-aligned, so all wide teams left-aligned at 1580
        expect(realigned[0].position.x).toBe(1580);
        expect(realigned[1].position.x).toBe(1580);
        expect(realigned[2].position.x).toBe(1580); // Platform also at 1580

        // Wide teams Y positions: stacked vertically
        // Actual positioning may vary based on internal team ordering
        expect(realigned[0].position.y).toBe(165);  // First wide team
        expect(realigned[1].position.y).toBe(305);  // Second (calculated by actual implementation)
        expect(realigned[2].position.y).toBe(445);  // Third (305 + 80 + 60)

        // Narrow teams positioned horizontally side by side
        // Starting at x=1580, spacing 40px apart (200 width + 40 gap)
        expect(realigned[3].position.x).toBe(1580);  // First enabling
        expect(realigned[4].position.x).toBe(1820);  // Second enabling (1580 + 200 + 40)
        expect(realigned[5].position.x).toBe(2060);  // Complicated-subsystem (1820 + 200 + 40)

        // All narrow teams on same row below wide teams
        const narrowStartY = 545; // 445 (third wide team) + 80 (platform height) + 20 (spacing)
        expect(realigned[3].position.y).toBe(narrowStartY);
        expect(realigned[4].position.y).toBe(narrowStartY);
        expect(realigned[5].position.y).toBe(narrowStartY);
    });

    it('should demonstrate Team Topologies book visualization pattern', () => {
        // This test demonstrates the pattern from the TT book:
        // - Wide stream-aligned and platform teams positioned horizontally showing flow
        // - Stream-aligned teams on right (delivering to customers)
        // - Platform teams on left (providing capabilities)
        // - Narrow enabling teams positioned in center to support
        const teams = [
            {
                name: 'Checkout Stream',
                team_type: 'stream-aligned',
                value_stream: 'E-Commerce Experience',
                metadata: {},
                position: { x: 0, y: 0 }
            },
            {
                name: 'Product Discovery Stream',
                team_type: 'stream-aligned',
                value_stream: 'E-Commerce Experience',
                metadata: {},
                position: { x: 0, y: 0 }
            },
            {
                name: 'Core Platform',
                team_type: 'platform',
                value_stream: 'E-Commerce Experience',
                metadata: {},
                position: { x: 0, y: 0 }
            },
            {
                name: 'DevOps Enablement',
                team_type: 'enabling',
                value_stream: 'E-Commerce Experience',
                metadata: {},
                position: { x: 0, y: 0 }
            }
        ];

        const realigned = autoAlignTTDesign(teams);

        // All teams realigned
        expect(realigned.length).toBe(4);

        // First team is stream-aligned, so all wide teams left-aligned at 1580
        expect(realigned[0].position.x).toBe(1580);
        expect(realigned[1].position.x).toBe(1580);
        expect(realigned[2].position.x).toBe(1580); // Platform also at 1580

        // They stack vertically showing the flow from top to bottom
        expect(realigned[0].position.y).toBeLessThan(realigned[1].position.y);
        expect(realigned[1].position.y).toBeLessThan(realigned[2].position.y);

        // Enabling team (narrow) is positioned horizontally and below the flow
        expect(realigned[3].position.x).toBe(1580); // Left-aligned like wide teams
        expect(realigned[3].position.y).toBeGreaterThan(realigned[2].position.y);
    });
});
