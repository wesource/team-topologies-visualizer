// Tests for team alignment functionality
import { describe, it, expect } from 'vitest';
import { autoAlignTeamsByManager } from './team-alignment.js';

describe('autoAlignTeamsByManager', () => {
    it('should align teams vertically under the same line manager', () => {
        const organizationHierarchy = {
            company: {
                id: 'company-leadership',
                name: 'Test Company',
                children: [
                    {
                        id: 'engineering-dept',
                        name: 'Engineering',
                        line_managers: [
                            {
                                id: 'lm-1',
                                name: 'Manager 1',
                                teams: ['Team A', 'Team B', 'Team C']
                            }
                        ]
                    }
                ]
            }
        };

        const teams = [
            { name: 'Team A', team_type: 'stream-aligned', position: { x: 100, y: 100 }, dependencies: [] },
            { name: 'Team B', team_type: 'platform', position: { x: 200, y: 150 }, dependencies: [] },
            { name: 'Team C', team_type: 'enabling', position: { x: 300, y: 200 }, dependencies: [] }
        ];

        const realigned = autoAlignTeamsByManager(teams, organizationHierarchy);

        // All three teams should be realigned
        expect(realigned.length).toBe(3);
        
        // Check that all teams have the same X coordinate
        const xPositions = realigned.map(t => t.position.x);
        expect(new Set(xPositions).size).toBe(1);
        
        // Check that Y positions are spaced correctly (120px apart)
        const yPositions = realigned.map(t => t.position.y).sort((a, b) => a - b);
        expect(yPositions[1] - yPositions[0]).toBe(120);
        expect(yPositions[2] - yPositions[1]).toBe(120);
    });

    it('should handle multiple line managers', () => {
        const organizationHierarchy = {
            company: {
                id: 'company-leadership',
                name: 'Test Company',
                children: [
                    {
                        id: 'engineering-dept',
                        name: 'Engineering',
                        line_managers: [
                            {
                                id: 'lm-1',
                                name: 'Manager 1',
                                teams: ['Team A', 'Team B']
                            },
                            {
                                id: 'lm-2',
                                name: 'Manager 2',
                                teams: ['Team C', 'Team D']
                            }
                        ]
                    }
                ]
            }
        };

        const teams = [
            { name: 'Team A', team_type: 'stream-aligned', position: { x: 100, y: 100 }, dependencies: [] },
            { name: 'Team B', team_type: 'platform', position: { x: 200, y: 150 }, dependencies: [] },
            { name: 'Team C', team_type: 'enabling', position: { x: 300, y: 200 }, dependencies: [] },
            { name: 'Team D', team_type: 'stream-aligned', position: { x: 400, y: 250 }, dependencies: [] }
        ];

        const realigned = autoAlignTeamsByManager(teams, organizationHierarchy);

        // All four teams should be realigned
        expect(realigned.length).toBe(4);
        
        // Teams under manager 1 should have the same X
        const teamA = teams.find(t => t.name === 'Team A');
        const teamB = teams.find(t => t.name === 'Team B');
        expect(teamA.position.x).toBe(teamB.position.x);
        
        // Teams under manager 2 should have the same X (different from manager 1)
        const teamC = teams.find(t => t.name === 'Team C');
        const teamD = teams.find(t => t.name === 'Team D');
        expect(teamC.position.x).toBe(teamD.position.x);
        expect(teamC.position.x).not.toBe(teamA.position.x);
    });

    it('should handle regions in customer solutions department', () => {
        const organizationHierarchy = {
            company: {
                id: 'company-leadership',
                name: 'Test Company',
                children: [
                    {
                        id: 'customer-solutions-dept',
                        name: 'Customer Solutions',
                        regions: [
                            {
                                id: 'region-europe',
                                name: 'Europe',
                                teams: ['Europe Team 1', 'Europe Team 2']
                            }
                        ]
                    }
                ]
            }
        };

        const teams = [
            { name: 'Europe Team 1', team_type: 'stream-aligned', position: { x: 100, y: 100 }, dependencies: [] },
            { name: 'Europe Team 2', team_type: 'platform', position: { x: 200, y: 150 }, dependencies: [] }
        ];

        const realigned = autoAlignTeamsByManager(teams, organizationHierarchy);

        // Both teams should be realigned
        expect(realigned.length).toBe(2);
        
        // Teams should have the same X coordinate
        expect(teams[0].position.x).toBe(teams[1].position.x);
        
        // Teams should be vertically spaced
        expect(teams[1].position.y - teams[0].position.y).toBe(120);
    });

    it('should not realign teams that are already aligned', () => {
        const organizationHierarchy = {
            company: {
                id: 'company-leadership',
                name: 'Test Company',
                children: [
                    {
                        id: 'engineering-dept',
                        name: 'Engineering',
                        line_managers: [
                            {
                                id: 'lm-1',
                                name: 'Manager 1',
                                teams: ['Team A', 'Team B']
                            }
                        ]
                    }
                ]
            }
        };

        // Calculate expected alignment positions (2/5 offset for org-chart style)
        const deptStartX = 500 + 50;
        const deptX = deptStartX; // engineering is first department
        const boxWidth = 200;
        const alignedX = deptX + (boxWidth * 2 / 5); // Changed to 2/5 offset
        const baseY = 50 + 120 * 3;

        // Teams are already properly aligned
        const teams = [
            { name: 'Team A', team_type: 'stream-aligned', position: { x: alignedX, y: baseY }, dependencies: [] },
            { name: 'Team B', team_type: 'platform', position: { x: alignedX, y: baseY + 120 }, dependencies: [] }
        ];

        const realigned = autoAlignTeamsByManager(teams, organizationHierarchy);

        // No teams should be realigned (within 5px tolerance)
        expect(realigned.length).toBe(0);
    });

    it('should skip teams not found in the teams array', () => {
        const organizationHierarchy = {
            company: {
                id: 'company-leadership',
                name: 'Test Company',
                children: [
                    {
                        id: 'engineering-dept',
                        name: 'Engineering',
                        line_managers: [
                            {
                                id: 'lm-1',
                                name: 'Manager 1',
                                teams: ['Team A', 'Non-existent Team', 'Team B']
                            }
                        ]
                    }
                ]
            }
        };

        const teams = [
            { name: 'Team A', team_type: 'stream-aligned', position: { x: 100, y: 100 }, dependencies: [] },
            { name: 'Team B', team_type: 'platform', position: { x: 200, y: 150 }, dependencies: [] }
        ];

        const realigned = autoAlignTeamsByManager(teams, organizationHierarchy);

        // Only the two existing teams should be realigned
        expect(realigned.length).toBe(2);
    });

    it('should return empty array for missing organization hierarchy', () => {
        const teams = [
            { name: 'Team A', team_type: 'stream-aligned', position: { x: 100, y: 100 }, dependencies: [] }
        ];

        const realigned1 = autoAlignTeamsByManager(teams, null);
        expect(realigned1.length).toBe(0);

        const realigned2 = autoAlignTeamsByManager(teams, {});
        expect(realigned2.length).toBe(0);
    });

    it('should handle empty line managers array', () => {
        const organizationHierarchy = {
            company: {
                id: 'company-leadership',
                name: 'Test Company',
                children: [
                    {
                        id: 'engineering-dept',
                        name: 'Engineering',
                        line_managers: []
                    }
                ]
            }
        };

        const teams = [
            { name: 'Team A', team_type: 'stream-aligned', position: { x: 100, y: 100 }, dependencies: [] }
        ];

        const realigned = autoAlignTeamsByManager(teams, organizationHierarchy);
        expect(realigned.length).toBe(0);
    });
});
