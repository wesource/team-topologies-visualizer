/**
 * Unit tests for canvas-interactions.js
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDirectRelationships } from './canvas-interactions';
import { state } from './state-management';

// Note: Most canvas-interactions.js functions are tightly coupled to DOM/Canvas
// and are better tested with E2E tests. We test the pure utility functions here.

describe('getDirectRelationships', () => {
    beforeEach(() => {
        // Reset state
        state.teams = [];
        state.currentView = 'tt';
    });

    it('should return empty set when team has no relationships', () => {
        const team = {
            name: 'Isolated Team',
            dependencies: [],
            interaction_modes: {}
        };
        const allTeams = [team];

        const relationships = getDirectRelationships(team, allTeams);

        expect(relationships).toBeInstanceOf(Set);
        expect(relationships.size).toBe(1); // Only the team itself
        expect(relationships.has('Isolated Team')).toBe(true);
    });

    it('should include the team itself in relationships', () => {
        const team = { name: 'Team A', dependencies: [], interaction_modes: {} };
        const allTeams = [team];

        const relationships = getDirectRelationships(team, allTeams);

        expect(relationships.has('Team A')).toBe(true);
    });

    it('should include direct dependencies', () => {
        const team = {
            name: 'Team A',
            dependencies: ['Team B', 'Team C'],
            interaction_modes: {}
        };
        const allTeams = [
            team,
            { name: 'Team B', dependencies: [], interaction_modes: {} },
            { name: 'Team C', dependencies: [], interaction_modes: {} }
        ];

        const relationships = getDirectRelationships(team, allTeams);

        expect(relationships.has('Team B')).toBe(true);
        expect(relationships.has('Team C')).toBe(true);
    });

    it('should include direct consumers (teams that depend on this team)', () => {
        const team = {
            name: 'Team A',
            dependencies: [],
            interaction_modes: {}
        };
        const allTeams = [
            team,
            { name: 'Team B', dependencies: ['Team A'], interaction_modes: {} },
            { name: 'Team C', dependencies: ['Team A'], interaction_modes: {} }
        ];

        const relationships = getDirectRelationships(team, allTeams);

        expect(relationships.has('Team B')).toBe(true);
        expect(relationships.has('Team C')).toBe(true);
    });

    it('should include teams in interaction_modes', () => {
        const team = {
            name: 'Team A',
            dependencies: [],
            interaction_modes: {
                'Team B': 'collaboration',
                'Team C': 'x-as-a-service'
            }
        };
        const allTeams = [
            team,
            { name: 'Team B', dependencies: [], interaction_modes: {} },
            { name: 'Team C', dependencies: [], interaction_modes: {} }
        ];

        const relationships = getDirectRelationships(team, allTeams);

        expect(relationships.has('Team B')).toBe(true);
        expect(relationships.has('Team C')).toBe(true);
    });

    it('should not include indirect dependencies', () => {
        const team = {
            name: 'Team A',
            dependencies: ['Team B'],
            interaction_modes: {}
        };
        const allTeams = [
            team,
            { name: 'Team B', dependencies: ['Team C'], interaction_modes: {} },
            { name: 'Team C', dependencies: [], interaction_modes: {} }
        ];

        const relationships = getDirectRelationships(team, allTeams);

        expect(relationships.has('Team B')).toBe(true);
        expect(relationships.has('Team C')).toBe(false); // Indirect, not included
    });

    it('should handle circular dependencies', () => {
        const team = {
            name: 'Team A',
            dependencies: ['Team B'],
            interaction_modes: {}
        };
        const allTeams = [
            team,
            { name: 'Team B', dependencies: ['Team A'], interaction_modes: {} }
        ];

        const relationships = getDirectRelationships(team, allTeams);

        expect(relationships.has('Team A')).toBe(true);
        expect(relationships.has('Team B')).toBe(true);
        expect(relationships.size).toBe(2);
    });

    it('should deduplicate teams (dependency and consumer)', () => {
        const team = {
            name: 'Team A',
            dependencies: ['Team B'],
            interaction_modes: {}
        };
        const allTeams = [
            team,
            { name: 'Team B', dependencies: ['Team A'], interaction_modes: {} }
        ];

        const relationships = getDirectRelationships(team, allTeams);

        // Team B is both a dependency and consumer, but should only appear once
        expect(relationships.size).toBe(2); // Team A and Team B
    });

    it('should handle empty teams array', () => {
        const team = {
            name: 'Team A',
            dependencies: ['Team B'],
            interaction_modes: {}
        };
        const allTeams = [];

        const relationships = getDirectRelationships(team, allTeams);

        expect(relationships.size).toBe(1); // Only Team A itself
    });

    it('should handle null or undefined dependencies', () => {
        const team = {
            name: 'Team A',
            dependencies: null,
            interaction_modes: {}
        };
        const allTeams = [team];

        const relationships = getDirectRelationships(team, allTeams);

        expect(relationships.size).toBe(1);
        expect(relationships.has('Team A')).toBe(true);
    });

    it('should handle null or undefined interaction_modes', () => {
        const team = {
            name: 'Team A',
            dependencies: [],
            interaction_modes: null
        };
        const allTeams = [team];

        const relationships = getDirectRelationships(team, allTeams);

        expect(relationships.size).toBe(1);
        expect(relationships.has('Team A')).toBe(true);
    });
});
