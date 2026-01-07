/**
 * Unit tests for Focus Mode functionality
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies that canvas-interactions.js needs
vi.mock('./renderer-common.js', () => ({
    getTeamAtPosition: vi.fn()
}));
vi.mock('./api.js', () => ({
    updateTeamPosition: vi.fn()
}));
vi.mock('./notifications.js', () => ({
    showInfo: vi.fn()
}));
vi.mock('./state-management.js', () => ({
    pushPositionSnapshot: vi.fn()
}));
vi.mock('./ui-handlers.js', () => ({
    updateUndoButtonState: vi.fn()
}));

import { getDirectRelationships } from './canvas-interactions.js';

describe('Focus Mode', () => {
    describe('getDirectRelationships', () => {
        let teams;

        beforeEach(() => {
            // Reset test data
            teams = [
                {
                    name: 'Team A',
                    dependencies: ['Team B', 'Team C']
                },
                {
                    name: 'Team B',
                    dependencies: []
                },
                {
                    name: 'Team C',
                    dependencies: ['Team D']
                },
                {
                    name: 'Team D',
                    dependencies: []
                },
                {
                    name: 'Team E',
                    dependencies: ['Team A']
                }
            ];
        });

        it('should include the team itself in focus network', () => {
            const teamA = teams[0];
            const result = getDirectRelationships(teamA, teams);

            expect(result.has('Team A')).toBe(true);
        });

        it('should include direct dependencies', () => {
            const teamA = teams[0];
            const result = getDirectRelationships(teamA, teams);

            expect(result.has('Team B')).toBe(true);
            expect(result.has('Team C')).toBe(true);
        });

        it('should include direct consumers (teams that depend on this team)', () => {
            const teamA = teams[0];
            const result = getDirectRelationships(teamA, teams);

            expect(result.has('Team E')).toBe(true);
        });

        it('should not include indirect relationships', () => {
            const teamA = teams[0];
            const result = getDirectRelationships(teamA, teams);

            // Team D is a dependency of Team C, but not a direct dependency of Team A
            expect(result.has('Team D')).toBe(false);
        });

        it('should handle teams with no dependencies', () => {
            const teamB = teams[1];
            const result = getDirectRelationships(teamB, teams);

            // Should include itself and Team A (which depends on Team B)
            expect(result.size).toBe(2);
            expect(result.has('Team B')).toBe(true);
            expect(result.has('Team A')).toBe(true); // Team A is a consumer
        });

        it('should handle teams with no consumers', () => {
            const teamD = teams[3];
            const result = getDirectRelationships(teamD, teams);

            // Should include itself and Team C (its consumer)
            expect(result.has('Team D')).toBe(true);
            expect(result.has('Team C')).toBe(true);
        });

        it('should handle circular dependencies correctly', () => {
            const circularTeams = [
                {
                    name: 'Team X',
                    dependencies: ['Team Y']
                },
                {
                    name: 'Team Y',
                    dependencies: ['Team X']
                }
            ];

            const teamX = circularTeams[0];
            const result = getDirectRelationships(teamX, circularTeams);

            // Should include both teams (they depend on each other)
            expect(result.size).toBe(2);
            expect(result.has('Team X')).toBe(true);
            expect(result.has('Team Y')).toBe(true);
        });

        it('should handle teams with interaction_modes (TT Design view)', () => {
            const ttTeams = [
                {
                    name: 'Stream Team',
                    interaction_modes: {
                        'Platform Team': 'x-as-a-service',
                        'Enabling Team': 'facilitating'
                    }
                },
                {
                    name: 'Platform Team',
                    interaction_modes: {
                        'Another Stream Team': 'x-as-a-service'
                    }
                },
                {
                    name: 'Enabling Team',
                    interaction_modes: {}
                },
                {
                    name: 'Another Stream Team',
                    interaction_modes: {}
                }
            ];

            const streamTeam = ttTeams[0];
            const result = getDirectRelationships(streamTeam, ttTeams);

            // Should include the team itself
            expect(result.has('Stream Team')).toBe(true);

            // Should include teams from interaction_modes
            expect(result.has('Platform Team')).toBe(true);
            expect(result.has('Enabling Team')).toBe(true);

            // Should not include unrelated teams
            expect(result.has('Another Stream Team')).toBe(false);
        });

        it('should include teams that have interaction modes with this team', () => {
            const ttTeams = [
                {
                    name: 'Platform Team',
                    interaction_modes: {}
                },
                {
                    name: 'Stream Team A',
                    interaction_modes: {
                        'Platform Team': 'x-as-a-service'
                    }
                },
                {
                    name: 'Stream Team B',
                    interaction_modes: {
                        'Platform Team': 'x-as-a-service'
                    }
                },
                {
                    name: 'Unrelated Team',
                    interaction_modes: {}
                }
            ];

            const platformTeam = ttTeams[0];
            const result = getDirectRelationships(platformTeam, ttTeams);

            // Should include the platform team itself
            expect(result.has('Platform Team')).toBe(true);

            // Should include consumers (teams that interact with this team)
            expect(result.has('Stream Team A')).toBe(true);
            expect(result.has('Stream Team B')).toBe(true);

            // Should not include unrelated teams
            expect(result.has('Unrelated Team')).toBe(false);
        });

        it('should handle teams with both dependencies and interaction_modes', () => {
            const mixedTeams = [
                {
                    name: 'Team Alpha',
                    dependencies: ['Team Beta'],
                    interaction_modes: {
                        'Team Gamma': 'collaboration'
                    }
                },
                {
                    name: 'Team Beta',
                    dependencies: []
                },
                {
                    name: 'Team Gamma',
                    dependencies: []
                },
                {
                    name: 'Team Delta',
                    dependencies: ['Team Alpha']
                }
            ];

            const teamAlpha = mixedTeams[0];
            const result = getDirectRelationships(teamAlpha, mixedTeams);

            // Should include all directly related teams
            expect(result.has('Team Alpha')).toBe(true);
            expect(result.has('Team Beta')).toBe(true); // dependency
            expect(result.has('Team Gamma')).toBe(true); // interaction mode
            expect(result.has('Team Delta')).toBe(true); // consumer
        });

        it('should handle empty dependencies array', () => {
            const teamWithEmptyDeps = {
                name: 'Solo Team',
                dependencies: []
            };

            const result = getDirectRelationships(teamWithEmptyDeps, [teamWithEmptyDeps]);

            expect(result.size).toBe(1);
            expect(result.has('Solo Team')).toBe(true);
        });

        it('should handle missing dependencies field', () => {
            const teamWithoutDepsField = {
                name: 'Isolated Team'
                // no dependencies field
            };

            const result = getDirectRelationships(teamWithoutDepsField, [teamWithoutDepsField]);

            expect(result.size).toBe(1);
            expect(result.has('Isolated Team')).toBe(true);
        });

        it('should return a Set (not an array)', () => {
            const teamA = teams[0];
            const result = getDirectRelationships(teamA, teams);

            expect(result).toBeInstanceOf(Set);
        });

        it('should not include duplicate team names', () => {
            // Edge case: Team depends on itself (should only appear once)
            const selfReferencingTeams = [
                {
                    name: 'Team Self',
                    dependencies: ['Team Self', 'Team Other']
                },
                {
                    name: 'Team Other',
                    dependencies: []
                }
            ];

            const teamSelf = selfReferencingTeams[0];
            const result = getDirectRelationships(teamSelf, selfReferencingTeams);

            // Count occurrences of 'Team Self' (should be 1)
            const selfCount = Array.from(result).filter(name => name === 'Team Self').length;
            expect(selfCount).toBe(1);

            // Set should contain both teams
            expect(result.size).toBe(2);
            expect(result.has('Team Self')).toBe(true);
            expect(result.has('Team Other')).toBe(true);
        });
    });
});
