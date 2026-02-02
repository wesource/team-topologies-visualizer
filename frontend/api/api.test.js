/**
 * Unit tests for API module
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch before importing api module
globalThis.fetch = vi.fn();

// Mock config module
vi.mock('../core/config.js', () => ({
    getApiUrl: (path) => `http://localhost:8000/api${path}`
}));

// Import actual API functions after mocking
import * as api from './api.js';
describe('API functions - Success cases', () => {
    beforeEach(() => {
        vi.mocked(fetch).mockClear();
    });

    describe('loadTeamTypes', () => {
        it('should fetch team types for current view', async () => {
            const mockData = { team_types: [{ name: 'platform', color: '#123456' }] };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const result = await api.loadTeamTypes('current');

            expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/baseline/team-types');
            expect(result).toEqual(mockData);
        });

        it('should fetch team types for tt view', async () => {
            const mockData = { team_types: [{ name: 'stream-aligned', color: '#654321' }] };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const result = await api.loadTeamTypes('tt');

            expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/tt/team-types');
            expect(result).toEqual(mockData);
        });
    });

    describe('loadOrganizationHierarchy', () => {
        it('should fetch organization hierarchy', async () => {
            const mockData = {
                company: {
                    name: 'Test Company',
                    children: []
                }
            };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const result = await api.loadOrganizationHierarchy();

            expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/baseline/organization-hierarchy');
            expect(result).toEqual(mockData);
        });
    });

    describe('loadProductLines', () => {
        it('should fetch product lines', async () => {
            const mockData = {
                products: [{ name: 'Product A', teams: [] }]
            };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const result = await api.loadProductLines();

            expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/baseline/product-lines');
            expect(result).toEqual(mockData);
        });
    });

    describe('loadBusinessStreams', () => {
        it('should fetch business streams', async () => {
            const mockData = {
                streams: [{ name: 'Stream A', teams: [] }]
            };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const result = await api.loadBusinessStreams();

            expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/baseline/business-streams');
            expect(result).toEqual(mockData);
        });
    });

    describe('loadTeams', () => {
        it('should fetch teams for given view', async () => {
            const mockTeams = [
                { name: 'Team A', team_type: 'platform', position: { x: 100, y: 100 } },
                { name: 'Team B', team_type: 'stream-aligned', position: { x: 200, y: 200 } }
            ];
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockTeams
            });

            const result = await api.loadTeams('current');

            expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/baseline/teams');
            expect(result).toEqual(mockTeams);
            expect(result.length).toBe(2);
        });
    });

    describe('loadTeamDetails', () => {
        it('should fetch team details by ID', async () => {
            const mockTeam = { team_id: 'platform-team', name: 'Platform Team', team_type: 'platform' };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockTeam
            });

            const result = await api.loadTeamDetails('platform-team', 'tt');

            expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/tt/teams/platform-team');
            expect(result).toEqual(mockTeam);
        });
    });

    describe('updateTeamPosition', () => {
        it('should update team position', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ x: 150, y: 250 })
            });

            const result = await api.updateTeamPosition('team-a', 150, 250, 'current');

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/baseline/teams/team-a/position',
                expect.objectContaining({
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ x: 150, y: 250 })
                })
            );
            expect(result).toBe(true);
        });
    });

    describe('loadSnapshots', () => {
        it('should fetch all snapshots', async () => {
            const mockSnapshots = [
                { id: 'snap1', name: 'Snapshot 1' },
                { id: 'snap2', name: 'Snapshot 2' }
            ];
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockSnapshots
            });

            const result = await api.loadSnapshots();

            expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/tt/snapshots');
            expect(result).toEqual(mockSnapshots);
        });
    });
});

describe('API functions - Error handling', () => {
    beforeEach(() => {
        vi.mocked(fetch).mockClear();
    });

    describe('loadTeamTypes error handling', () => {
        it('should throw error when response is not ok', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            });

            await expect(api.loadTeamTypes('current'))
                .rejects.toThrow('Failed to load team types: 404 Not Found');
        });
    });

    describe('loadOrganizationHierarchy error handling', () => {
        it('should throw error when response is not ok', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            await expect(api.loadOrganizationHierarchy())
                .rejects.toThrow('Failed to load organization hierarchy: 500 Internal Server Error');
        });
    });

    describe('loadProductLines error handling', () => {
        it('should throw error when response is not ok', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 403,
                statusText: 'Forbidden'
            });

            await expect(api.loadProductLines())
                .rejects.toThrow('Failed to load product lines: 403 Forbidden');
        });
    });

    describe('loadBusinessStreams error handling', () => {
        it('should throw error when response is not ok', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            });

            await expect(api.loadBusinessStreams())
                .rejects.toThrow('Failed to load business streams: 404 Not Found');
        });
    });

    describe('loadTeams error handling', () => {
        it('should throw error when response is not ok', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Server Error'
            });

            await expect(api.loadTeams('current'))
                .rejects.toThrow('Failed to load teams: 500 Server Error');
        });

        it('should handle network errors', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

            await expect(api.loadTeams('current')).rejects.toThrow('Network error');
        });
    });

    describe('loadTeamDetails error handling', () => {
        it('should throw error when team not found', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            });

            await expect(api.loadTeamDetails('nonexistent', 'tt'))
                .rejects.toThrow('Failed to load team details: 404 Not Found');
        });
    });

    describe('updateTeamPosition error handling', () => {
        it('should throw error when update fails', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request'
            });

            await expect(api.updateTeamPosition('team-a', 150, 250, 'current'))
                .rejects.toThrow('Failed to update team position: 400 Bad Request');
        });
    });

    describe('loadSnapshots error handling', () => {
        it('should throw error when response is not ok', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            await expect(api.loadSnapshots())
                .rejects.toThrow('Failed to load snapshots: 500 Internal Server Error');
        });
    });
});
describe('API URL construction', () => {
    beforeEach(() => {
        vi.mocked(fetch).mockClear();
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({})
        });
    });

    it('should construct correct URLs with view parameter for baseline', async () => {
        await api.loadTeamTypes('current');
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/baseline/team-types'));
    });

    it('should construct correct URLs with view parameter for tt', async () => {
        await api.loadTeamTypes('tt');
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/tt/team-types'));
    });

    it('should use correct base URL', async () => {
        await api.loadTeams('current');
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('localhost:8000/api/baseline/teams'));
    });
});
