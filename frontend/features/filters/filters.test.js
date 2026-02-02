/**
 * Unit tests for filters.js
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFilteredTeams } from './filters.js';
import * as valueStreamGrouping from '../../tt-concepts/tt-value-stream-grouping.js';
import * as platformGrouping from '../../tt-concepts/tt-platform-grouping.js';

describe('filters.js', () => {
    describe('getFilteredTeams', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });
        const mockTeams = [
            { name: 'Team A', value_stream: 'E-commerce', team_type: 'stream-aligned' },
            { name: 'Team B', value_stream: 'Analytics', team_type: 'stream-aligned' },
            { name: 'Team C', platform_grouping: 'Data Platform', team_type: 'platform' },
            { name: 'Team D', platform_grouping: 'Infrastructure', team_type: 'platform' },
            { name: 'Team E', team_type: 'enabling' }
        ];

        it('should return all teams when currentView is "current"', () => {
            const result = getFilteredTeams(mockTeams, 'baseline', 'vs:E-commerce');
            expect(result).toEqual(mockTeams);
            expect(result.length).toBe(5);
        });

        it('should return all teams when selectedGrouping is "all"', () => {
            const result = getFilteredTeams(mockTeams, 'tt', 'all');
            expect(result).toEqual(mockTeams);
            expect(result.length).toBe(5);
        });

        it('should filter by value stream when selectedGrouping starts with "vs:"', () => {
            const mockFilteredTeams = [mockTeams[0]]; // Team A
            vi.spyOn(valueStreamGrouping, 'filterTeamsByValueStream').mockReturnValue(mockFilteredTeams);

            const result = getFilteredTeams(mockTeams, 'tt', 'vs:E-commerce');

            expect(valueStreamGrouping.filterTeamsByValueStream).toHaveBeenCalledWith(mockTeams, 'E-commerce');
            expect(result).toEqual(mockFilteredTeams);
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Team A');
        });

        it('should extract value stream name correctly from "vs:" prefix', () => {
            vi.spyOn(valueStreamGrouping, 'filterTeamsByValueStream').mockReturnValue([]);

            getFilteredTeams(mockTeams, 'tt', 'vs:Analytics Dashboard');

            expect(valueStreamGrouping.filterTeamsByValueStream).toHaveBeenCalledWith(
                mockTeams,
                'Analytics Dashboard'
            );
        });

        it('should filter by platform grouping when selectedGrouping starts with "pg:"', () => {
            const mockFilteredTeams = [mockTeams[2]]; // Team C
            vi.spyOn(platformGrouping, 'filterTeamsByPlatformGrouping').mockReturnValue(mockFilteredTeams);

            const result = getFilteredTeams(mockTeams, 'tt', 'pg:Data Platform');

            expect(platformGrouping.filterTeamsByPlatformGrouping).toHaveBeenCalledWith(mockTeams, 'Data Platform');
            expect(result).toEqual(mockFilteredTeams);
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Team C');
        });

        it('should extract platform grouping name correctly from "pg:" prefix', () => {
            vi.spyOn(platformGrouping, 'filterTeamsByPlatformGrouping').mockReturnValue([]);

            getFilteredTeams(mockTeams, 'tt', 'pg:Cloud Infrastructure');

            expect(platformGrouping.filterTeamsByPlatformGrouping).toHaveBeenCalledWith(
                mockTeams,
                'Cloud Infrastructure'
            );
        });

        it('should return all teams when selectedGrouping has unknown format', () => {
            const result = getFilteredTeams(mockTeams, 'tt', 'unknown:format');
            expect(result).toEqual(mockTeams);
            expect(result.length).toBe(5);
        });

        it('should handle empty teams array', () => {
            const result = getFilteredTeams([], 'tt', 'vs:E-commerce');
            expect(result).toEqual([]);
        });

        it('should handle empty string selectedGrouping', () => {
            const result = getFilteredTeams(mockTeams, 'tt', '');
            expect(result).toEqual(mockTeams);
        });

        it('should handle value stream with special characters', () => {
            vi.spyOn(valueStreamGrouping, 'filterTeamsByValueStream').mockReturnValue([]);

            getFilteredTeams(mockTeams, 'tt', 'vs:Customer Service & Support');

            expect(valueStreamGrouping.filterTeamsByValueStream).toHaveBeenCalledWith(
                mockTeams,
                'Customer Service & Support'
            );
        });

        it('should handle platform grouping with special characters', () => {
            vi.spyOn(platformGrouping, 'filterTeamsByPlatformGrouping').mockReturnValue([]);

            getFilteredTeams(mockTeams, 'tt', 'pg:CI/CD Pipeline');

            expect(platformGrouping.filterTeamsByPlatformGrouping).toHaveBeenCalledWith(
                mockTeams,
                'CI/CD Pipeline'
            );
        });

        it('should work in TT view with multiple value streams', () => {
            const mockFiltered1 = [mockTeams[0]];
            vi.spyOn(valueStreamGrouping, 'filterTeamsByValueStream').mockReturnValue(mockFiltered1);

            const result1 = getFilteredTeams(mockTeams, 'tt', 'vs:E-commerce');
            expect(result1.length).toBe(1);

            const mockFiltered2 = [mockTeams[1]];
            vi.mocked(valueStreamGrouping.filterTeamsByValueStream).mockReturnValue(mockFiltered2);

            const result2 = getFilteredTeams(mockTeams, 'tt', 'vs:Analytics');
            expect(result2.length).toBe(1);
        });

        it('should work in TT view with multiple platform groupings', () => {
            const mockFiltered1 = [mockTeams[2]];
            vi.spyOn(platformGrouping, 'filterTeamsByPlatformGrouping').mockReturnValue(mockFiltered1);

            const result1 = getFilteredTeams(mockTeams, 'tt', 'pg:Data Platform');
            expect(result1.length).toBe(1);

            const mockFiltered2 = [mockTeams[3]];
            vi.mocked(platformGrouping.filterTeamsByPlatformGrouping).mockReturnValue(mockFiltered2);

            const result2 = getFilteredTeams(mockTeams, 'tt', 'pg:Infrastructure');
            expect(result2.length).toBe(1);
        });

        it('should not call filter functions when in current view', () => {
            const vsFilter = vi.spyOn(valueStreamGrouping, 'filterTeamsByValueStream');
            const pgFilter = vi.spyOn(platformGrouping, 'filterTeamsByPlatformGrouping');

            getFilteredTeams(mockTeams, 'baseline', 'vs:E-commerce');

            expect(vsFilter).not.toHaveBeenCalled();
            expect(pgFilter).not.toHaveBeenCalled();
        });

        it('should not call filter functions when selectedGrouping is "all"', () => {
            const vsFilter = vi.spyOn(valueStreamGrouping, 'filterTeamsByValueStream');
            const pgFilter = vi.spyOn(platformGrouping, 'filterTeamsByPlatformGrouping');

            getFilteredTeams(mockTeams, 'tt', 'all');

            expect(vsFilter).not.toHaveBeenCalled();
            expect(pgFilter).not.toHaveBeenCalled();
        });

        it('should handle case where filter functions return empty array', () => {
            vi.spyOn(valueStreamGrouping, 'filterTeamsByValueStream').mockReturnValue([]);

            const result = getFilteredTeams(mockTeams, 'tt', 'vs:Nonexistent');

            expect(result).toEqual([]);
            expect(result.length).toBe(0);
        });

        it('should preserve original team objects when filtering', () => {
            const mockFilteredTeams = [mockTeams[0]];
            vi.spyOn(valueStreamGrouping, 'filterTeamsByValueStream').mockReturnValue(mockFilteredTeams);

            const result = getFilteredTeams(mockTeams, 'tt', 'vs:E-commerce');

            expect(result[0]).toBe(mockTeams[0]); // Same object reference
        });
    });
});
