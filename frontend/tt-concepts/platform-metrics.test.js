import { describe, it, expect } from 'vitest';
import { calculatePlatformConsumers, calculateDependencyMetrics } from './platform-metrics.js';

describe('calculatePlatformConsumers', () => {
    describe('basic functionality', () => {
        it('should return empty metrics for null/undefined inputs', () => {
            const result = calculatePlatformConsumers(null, null);
            expect(result.totalCount).toBe(0);
            expect(result.consumers).toEqual([]);
            expect(result.adoptionLevel).toBe('light');
            expect(result.isOverloaded).toBe(false);
        });

        it('should return empty metrics when no teams consume the platform', () => {
            const teams = [
                { name: 'Platform Team', team_type: 'platform', interaction_modes: {} },
                { name: 'Team A', team_type: 'stream-aligned', interaction_modes: {} }
            ];

            const result = calculatePlatformConsumers('Platform Team', teams);
            expect(result.totalCount).toBe(0);
            expect(result.consumers).toEqual([]);
        });

        it('should identify single consumer', () => {
            const teams = [
                { name: 'API Platform', team_type: 'platform', interaction_modes: {} },
                {
                    name: 'Mobile Team',
                    team_type: 'stream-aligned',
                    value_stream: 'E-commerce',
                    interaction_modes: { 'API Platform': 'x-as-a-service' }
                }
            ];

            const result = calculatePlatformConsumers('API Platform', teams);
            expect(result.totalCount).toBe(1);
            expect(result.consumers).toHaveLength(1);
            expect(result.consumers[0].name).toBe('Mobile Team');
            expect(result.consumers[0].mode).toBe('x-as-a-service');
            expect(result.consumers[0].valueStream).toBe('E-commerce');
        });

        it('should identify multiple consumers', () => {
            const teams = [
                { name: 'Data Platform', team_type: 'platform', interaction_modes: {} },
                {
                    name: 'Analytics Team',
                    team_type: 'stream-aligned',
                    value_stream: 'Data Products',
                    interaction_modes: { 'Data Platform': 'x-as-a-service' }
                },
                {
                    name: 'Reporting Team',
                    team_type: 'stream-aligned',
                    value_stream: 'Data Products',
                    interaction_modes: { 'Data Platform': 'collaboration' }
                },
                {
                    name: 'ML Team',
                    team_type: 'stream-aligned',
                    value_stream: 'AI/ML',
                    interaction_modes: { 'Data Platform': 'x-as-a-service' }
                }
            ];

            const result = calculatePlatformConsumers('Data Platform', teams);
            expect(result.totalCount).toBe(3);
            expect(result.consumers).toHaveLength(3);
        });

        it('should not count the platform team itself as a consumer', () => {
            const teams = [
                {
                    name: 'Cloud Platform',
                    team_type: 'platform',
                    interaction_modes: { 'Cloud Platform': 'x-as-a-service' } // Self-reference
                },
                {
                    name: 'Web Team',
                    team_type: 'stream-aligned',
                    interaction_modes: { 'Cloud Platform': 'x-as-a-service' }
                }
            ];

            const result = calculatePlatformConsumers('Cloud Platform', teams);
            expect(result.totalCount).toBe(1);
            expect(result.consumers[0].name).toBe('Web Team');
        });
    });

    describe('value stream grouping', () => {
        it('should group consumers by value stream', () => {
            const teams = [
                { name: 'Observability Platform', team_type: 'platform', interaction_modes: {} },
                {
                    name: 'Checkout Team',
                    team_type: 'stream-aligned',
                    value_stream: 'E-commerce',
                    interaction_modes: { 'Observability Platform': 'x-as-a-service' }
                },
                {
                    name: 'Product Team',
                    team_type: 'stream-aligned',
                    value_stream: 'E-commerce',
                    interaction_modes: { 'Observability Platform': 'x-as-a-service' }
                },
                {
                    name: 'Mobile Team',
                    team_type: 'stream-aligned',
                    value_stream: 'Mobile Experience',
                    interaction_modes: { 'Observability Platform': 'x-as-a-service' }
                }
            ];

            const result = calculatePlatformConsumers('Observability Platform', teams);
            expect(result.byValueStream).toEqual({
                'E-commerce': 2,
                'Mobile Experience': 1
            });
        });

        it('should handle teams without value_stream as "Unassigned"', () => {
            const teams = [
                { name: 'Auth Platform', team_type: 'platform', interaction_modes: {} },
                {
                    name: 'Legacy Team',
                    team_type: 'stream-aligned',
                    interaction_modes: { 'Auth Platform': 'x-as-a-service' }
                }
            ];

            const result = calculatePlatformConsumers('Auth Platform', teams);
            expect(result.byValueStream).toEqual({
                'Unassigned': 1
            });
        });
    });

    describe('adoption level classification', () => {
        it('should classify 0-10 consumers as "light"', () => {
            const teams = [
                { name: 'Platform', team_type: 'platform', interaction_modes: {} }
            ];

            // Add 5 consumers
            for (let i = 1; i <= 5; i++) {
                teams.push({
                    name: `Team ${i}`,
                    team_type: 'stream-aligned',
                    interaction_modes: { 'Platform': 'x-as-a-service' }
                });
            }

            const result = calculatePlatformConsumers('Platform', teams);
            expect(result.totalCount).toBe(5);
            expect(result.adoptionLevel).toBe('light');
            expect(result.isOverloaded).toBe(false);
        });

        it('should classify 11-15 consumers as "moderate"', () => {
            const teams = [
                { name: 'Platform', team_type: 'platform', interaction_modes: {} }
            ];

            // Add 12 consumers
            for (let i = 1; i <= 12; i++) {
                teams.push({
                    name: `Team ${i}`,
                    team_type: 'stream-aligned',
                    interaction_modes: { 'Platform': 'x-as-a-service' }
                });
            }

            const result = calculatePlatformConsumers('Platform', teams);
            expect(result.totalCount).toBe(12);
            expect(result.adoptionLevel).toBe('moderate');
            expect(result.isOverloaded).toBe(false);
        });

        it('should classify 16+ consumers as "heavy" and mark as overloaded', () => {
            const teams = [
                { name: 'Platform', team_type: 'platform', interaction_modes: {} }
            ];

            // Add 18 consumers
            for (let i = 1; i <= 18; i++) {
                teams.push({
                    name: `Team ${i}`,
                    team_type: 'stream-aligned',
                    interaction_modes: { 'Platform': 'x-as-a-service' }
                });
            }

            const result = calculatePlatformConsumers('Platform', teams);
            expect(result.totalCount).toBe(18);
            expect(result.adoptionLevel).toBe('heavy');
            expect(result.isOverloaded).toBe(true);
        });

        it('should mark exactly 15 consumers as moderate, not overloaded', () => {
            const teams = [
                { name: 'Platform', team_type: 'platform', interaction_modes: {} }
            ];

            // Add exactly 15 consumers
            for (let i = 1; i <= 15; i++) {
                teams.push({
                    name: `Team ${i}`,
                    team_type: 'stream-aligned',
                    interaction_modes: { 'Platform': 'x-as-a-service' }
                });
            }

            const result = calculatePlatformConsumers('Platform', teams);
            expect(result.totalCount).toBe(15);
            expect(result.adoptionLevel).toBe('moderate');
            expect(result.isOverloaded).toBe(false);
        });
    });

    describe('interaction modes', () => {
        it('should capture different interaction modes', () => {
            const teams = [
                { name: 'Platform', team_type: 'platform', interaction_modes: {} },
                {
                    name: 'Team A',
                    team_type: 'stream-aligned',
                    interaction_modes: { 'Platform': 'x-as-a-service' }
                },
                {
                    name: 'Team B',
                    team_type: 'stream-aligned',
                    interaction_modes: { 'Platform': 'collaboration' }
                },
                {
                    name: 'Team C',
                    team_type: 'enabling',
                    interaction_modes: { 'Platform': 'facilitating' }
                }
            ];

            const result = calculatePlatformConsumers('Platform', teams);
            expect(result.consumers).toHaveLength(3);
            expect(result.consumers[0].mode).toBe('x-as-a-service');
            expect(result.consumers[1].mode).toBe('collaboration');
            expect(result.consumers[2].mode).toBe('facilitating');
        });
    });
});

describe('calculateDependencyMetrics', () => {
    it('should return empty metrics for null/undefined inputs', () => {
        const result = calculateDependencyMetrics(null, null);
        expect(result.consumerCount).toBe(0);
        expect(result.dependencyCount).toBe(0);
        expect(result.consumers).toEqual([]);
        expect(result.dependencies).toEqual([]);
    });

    it('should return empty metrics for non-existent team', () => {
        const teams = [
            { name: 'Team A', team_type: 'stream-aligned', interaction_modes: {} }
        ];

        const result = calculateDependencyMetrics('Non-existent Team', teams);
        expect(result.consumerCount).toBe(0);
        expect(result.dependencyCount).toBe(0);
    });

    it('should calculate both consumers and dependencies', () => {
        const teams = [
            {
                name: 'API Platform',
                team_type: 'platform',
                interaction_modes: {
                    'Data Platform': 'x-as-a-service'
                }
            },
            {
                name: 'Data Platform',
                team_type: 'platform',
                interaction_modes: {}
            },
            {
                name: 'Web Team',
                team_type: 'stream-aligned',
                interaction_modes: {
                    'API Platform': 'x-as-a-service'
                }
            },
            {
                name: 'Mobile Team',
                team_type: 'stream-aligned',
                interaction_modes: {
                    'API Platform': 'x-as-a-service'
                }
            }
        ];

        const result = calculateDependencyMetrics('API Platform', teams);

        // Should have 2 consumers (Web Team, Mobile Team)
        expect(result.consumerCount).toBe(2);
        expect(result.consumers).toHaveLength(2);
        expect(result.consumers.map(c => c.name)).toContain('Web Team');
        expect(result.consumers.map(c => c.name)).toContain('Mobile Team');

        // Should have 1 dependency (Data Platform)
        expect(result.dependencyCount).toBe(1);
        expect(result.dependencies).toHaveLength(1);
        expect(result.dependencies[0].name).toBe('Data Platform');
    });

    it('should handle team with no interactions', () => {
        const teams = [
            {
                name: 'Isolated Team',
                team_type: 'stream-aligned',
                interaction_modes: {}
            }
        ];

        const result = calculateDependencyMetrics('Isolated Team', teams);
        expect(result.consumerCount).toBe(0);
        expect(result.dependencyCount).toBe(0);
    });
});
