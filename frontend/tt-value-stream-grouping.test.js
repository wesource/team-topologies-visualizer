// Tests for value stream grouping utilities
import { describe, it, expect } from 'vitest';
import { getValueStreamGroupings, calculateGroupingBoundingBox, getValueStreamNames, filterTeamsByValueStream } from './tt-value-stream-grouping.js';

describe('Value Stream Grouping', () => {
    describe('getValueStreamGroupings', () => {
        it('should group teams by value stream', () => {
            const teams = [
                { name: 'Team A', metadata: { value_stream: 'E-commerce' }, position: { x: 100, y: 100 } },
                { name: 'Team B', metadata: { value_stream: 'E-commerce' }, position: { x: 200, y: 100 } },
                { name: 'Team C', metadata: { value_stream: 'Mobile' }, position: { x: 400, y: 100 } },
            ];

            const groupings = getValueStreamGroupings(teams);

            expect(groupings).toHaveLength(2);
            expect(groupings[0].name).toBe('E-commerce');
            expect(groupings[0].teams).toHaveLength(2);
            expect(groupings[1].name).toBe('Mobile');
            expect(groupings[1].teams).toHaveLength(1);
        });

        it('should handle teams without value stream metadata', () => {
            const teams = [
                { name: 'Team A', metadata: { value_stream: 'E-commerce' }, position: { x: 100, y: 100 } },
                { name: 'Team B', metadata: {}, position: { x: 200, y: 100 } },
                { name: 'Team C', position: { x: 300, y: 100 } },
            ];

            const groupings = getValueStreamGroupings(teams);

            expect(groupings).toHaveLength(2);
            expect(groupings[0].name).toBe('E-commerce');
            expect(groupings[0].teams).toHaveLength(1);
            expect(groupings[1].name).toBe('(Ungrouped)');
            expect(groupings[1].teams).toHaveLength(2);
        });

        it('should return empty array for empty teams', () => {
            const groupings = getValueStreamGroupings([]);
            expect(groupings).toEqual([]);
        });

        it('should handle null or undefined teams', () => {
            expect(getValueStreamGroupings(null)).toEqual([]);
            expect(getValueStreamGroupings(undefined)).toEqual([]);
        });
    });

    describe('calculateGroupingBoundingBox', () => {
        it('should calculate bounding box for teams in grouping', () => {
            const teams = [
                { name: 'Team A', team_type: 'stream-aligned', metadata: { value_stream: 'Test' }, position: { x: 100, y: 100 } },
                { name: 'Team B', team_type: 'stream-aligned', metadata: { value_stream: 'Test' }, position: { x: 400, y: 200 } },
            ];
            const teamBoxHeight = 120;
            const padding = 20;

            const bbox = calculateGroupingBoundingBox(teams, teamBoxHeight, padding, 'tt');

            expect(bbox.x).toBe(80); // 100 - 20
            expect(bbox.y).toBe(45); // 100 - 20 - 35 (label area)
            // Width: (400 + 560) - 100 + 40 = 900 (using 560px for wide teams)
            expect(bbox.width).toBe(900);
            expect(bbox.height).toBe(255); // Now uses actual heights: both teams 80px, (200+80)-100+40+35=255
        });

        it('should handle single team', () => {
            const teams = [
                { name: 'Team A', team_type: 'stream-aligned', metadata: { value_stream: 'Test' }, position: { x: 100, y: 100 } },
            ];
            const teamBoxHeight = 120;
            const padding = 20;

            const bbox = calculateGroupingBoundingBox(teams, teamBoxHeight, padding, 'tt');

            expect(bbox.x).toBe(80); // 100 - 20
            expect(bbox.y).toBe(45); // 100 - 20 - 35 (label area)
            // Width: 560 + 40 = 600 (wide team width + padding*2)
            expect(bbox.width).toBe(600);
            expect(bbox.height).toBe(155); // Now uses actual height: 80 + 40 + 35 = 155
        });

        it('should handle empty teams array', () => {
            const bbox = calculateGroupingBoundingBox([], 120, 20, 'tt');
            
            expect(bbox.x).toBe(0);
            expect(bbox.y).toBe(0);
            expect(bbox.width).toBe(0);
            expect(bbox.height).toBe(0);
        });

        it('should handle teams with negative positions', () => {
            const teams = [
                { name: 'Team A', team_type: 'stream-aligned', metadata: { value_stream: 'Test' }, position: { x: -100, y: -50 } },
                { name: 'Team B', team_type: 'stream-aligned', metadata: { value_stream: 'Test' }, position: { x: 100, y: 50 } },
            ];
            const teamBoxHeight = 120;
            const padding = 20;

            const bbox = calculateGroupingBoundingBox(teams, teamBoxHeight, padding, 'tt');

            expect(bbox.x).toBe(-120); // -100 - 20
            expect(bbox.y).toBe(-105); // -50 - 20 - 35 (label area)
            // Width: (100 + 560) - (-100) + 40 = 800
            expect(bbox.width).toBe(800);
            expect(bbox.height).toBe(255); // Now uses actual heights: (50+80)-(-50)+40+35=255
        });
    });

    describe('getValueStreamNames', () => {
        it('should return unique value stream names sorted', () => {
            const teams = [
                { name: 'Team A', metadata: { value_stream: 'E-commerce Experience' } },
                { name: 'Team B', metadata: { value_stream: 'Mobile Experience' } },
                { name: 'Team C', metadata: { value_stream: 'E-commerce Experience' } },
                { name: 'Team D', metadata: { value_stream: 'Enterprise Sales' } },
            ];

            const names = getValueStreamNames(teams);

            expect(names).toEqual(['E-commerce Experience', 'Enterprise Sales', 'Mobile Experience']);
        });

        it('should exclude teams without value stream metadata', () => {
            const teams = [
                { name: 'Team A', metadata: { value_stream: 'E-commerce Experience' } },
                { name: 'Team B', metadata: {} },
                { name: 'Team C' },
            ];

            const names = getValueStreamNames(teams);

            expect(names).toEqual(['E-commerce Experience']);
        });

        it('should return empty array for empty teams', () => {
            expect(getValueStreamNames([])).toEqual([]);
            expect(getValueStreamNames(null)).toEqual([]);
            expect(getValueStreamNames(undefined)).toEqual([]);
        });

        it('should return empty array when no teams have value streams', () => {
            const teams = [
                { name: 'Team A', metadata: {} },
                { name: 'Team B' },
            ];

            const names = getValueStreamNames(teams);

            expect(names).toEqual([]);
        });
    });

    describe('filterTeamsByValueStream', () => {
        const teams = [
            { name: 'Team A', metadata: { value_stream: 'E-commerce Experience' } },
            { name: 'Team B', metadata: { value_stream: 'Mobile Experience' } },
            { name: 'Team C', metadata: { value_stream: 'E-commerce Experience' } },
            { name: 'Team D', metadata: {} },
        ];

        it('should filter teams by value stream', () => {
            const filtered = filterTeamsByValueStream(teams, 'E-commerce Experience');

            expect(filtered).toHaveLength(2);
            expect(filtered[0].name).toBe('Team A');
            expect(filtered[1].name).toBe('Team C');
        });

        it('should return all teams when filter is "all"', () => {
            const filtered = filterTeamsByValueStream(teams, 'all');

            expect(filtered).toHaveLength(4);
            expect(filtered).toBe(teams);
        });

        it('should return all teams when filter is null or undefined', () => {
            expect(filterTeamsByValueStream(teams, null)).toBe(teams);
            expect(filterTeamsByValueStream(teams, undefined)).toBe(teams);
        });

        it('should return empty array when no teams match', () => {
            const filtered = filterTeamsByValueStream(teams, 'Non-existent Stream');

            expect(filtered).toHaveLength(0);
        });

        it('should handle empty teams array', () => {
            expect(filterTeamsByValueStream([], 'E-commerce Experience')).toEqual([]);
            expect(filterTeamsByValueStream(null, 'E-commerce Experience')).toBeNull();
        });
    });
});
