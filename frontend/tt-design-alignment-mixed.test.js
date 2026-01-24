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

        // Wide teams positioned based on type:
        // Stream-aligned x2 default to right (648)
        expect(realigned[0].position.x).toBe(648);
        expect(realigned[1].position.x).toBe(648);
        // Platform defaults to left (130)
        expect(realigned[2].position.x).toBe(130);

        // Wide teams Y positions: stacked vertically
        expect(realigned[0].position.y).toBe(165);  // First wide team
        expect(realigned[1].position.y).toBe(305);  // Second wide team (165 + 80 + 60 spacing)
        expect(realigned[2].position.y).toBe(445);  // Third wide team (305 + 80 + 60 spacing)

        // Narrow teams positioned based on their types:
        // Enabling teams default to center (35% = 389)
        expect(realigned[3].position.x).toBe(389);
        expect(realigned[4].position.x).toBe(389);
        // Complicated-subsystem defaults to center-left (20% = 278)
        expect(realigned[5].position.x).toBe(278);

        // All narrow teams start below wide teams
        const narrowStartY = 545; // 445 + 80 + 20
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

        // Stream-aligned teams positioned right (delivering to customers)
        expect(realigned[0].position.x).toBe(648);
        expect(realigned[1].position.x).toBe(648);

        // Platform team positioned left (providing capabilities)
        expect(realigned[2].position.x).toBe(130);

        // They stack vertically showing the flow from top to bottom
        expect(realigned[0].position.y).toBeLessThan(realigned[1].position.y);
        expect(realigned[1].position.y).toBeLessThan(realigned[2].position.y);

        // Enabling team (narrow) is positioned in center and below the flow
        expect(realigned[3].position.x).toBe(389); // Center position (35%)
        expect(realigned[3].position.y).toBeGreaterThan(realigned[2].position.y);
    });
});
