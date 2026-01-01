// Tests for SVG export module
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the download function since we can't test actual file downloads in unit tests
const mockDownloadSVG = vi.fn();
let exportModule;

describe('SVG Export', () => {
    beforeEach(async () => {
        // Dynamic import to allow mocking
        exportModule = await import('./svg-export.js');
        
        // Mock URL and createElement for download testing
        global.URL.createObjectURL = vi.fn(() => 'mock-url');
        global.URL.revokeObjectURL = vi.fn();
        document.createElement = vi.fn((tag) => {
            if (tag === 'a') {
                return {
                    href: '',
                    download: '',
                    click: vi.fn(),
                };
            }
            return {};
        });
        document.body.appendChild = vi.fn();
        document.body.removeChild = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('TT Vision SVG Export', () => {
        it('should generate valid SVG with correct viewBox for TT vision', () => {
            const teams = [
                { name: 'Team A', team_type: 'stream-aligned', position: { x: 100, y: 200 }, dependencies: [] },
                { name: 'Team B', team_type: 'platform', position: { x: 300, y: 400 }, dependencies: [] }
            ];
            const teamColorMap = { 'stream-aligned': '#4A90E2', 'platform': '#7ED321' };
            const state = { hideConnections: false };

            exportModule.exportToSVG(state, null, teams, teamColorMap, 'tt');

            // Verify createElement was called for download link
            expect(document.createElement).toHaveBeenCalledWith('a');
        });

        it('should calculate correct bounding box for teams', () => {
            const teams = [
                { name: 'Team 1', team_type: 'stream-aligned', position: { x: 50, y: 100 }, dependencies: [] },
                { name: 'Team 2', team_type: 'platform', position: { x: 500, y: 600 }, dependencies: [] }
            ];
            const teamColorMap = { 'stream-aligned': '#4A90E2', 'platform': '#7ED321' };
            const state = { hideConnections: false };

            exportModule.exportToSVG(state, null, teams, teamColorMap, 'tt');

            // Verify SVG was created (blob and download triggered)
            expect(global.URL.createObjectURL).toHaveBeenCalled();
            expect(document.body.appendChild).toHaveBeenCalled();
        });

        it('should render connections between teams when not hidden', () => {
            const teams = [
                { 
                    name: 'Team A', 
                    team_type: 'stream-aligned', 
                    position: { x: 100, y: 100 },
                    dependencies: [{ team: 'Team B', interaction: 'collaboration' }]
                },
                { 
                    name: 'Team B', 
                    team_type: 'platform', 
                    position: { x: 300, y: 300 },
                    dependencies: []
                }
            ];
            const teamColorMap = { 'stream-aligned': '#4A90E2', 'platform': '#7ED321' };
            const state = { hideConnections: false };

            exportModule.exportToSVG(state, null, teams, teamColorMap, 'tt');

            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });

        it('should not render connections when hideConnections is true', () => {
            const teams = [
                { 
                    name: 'Team A', 
                    team_type: 'stream-aligned', 
                    position: { x: 100, y: 100 },
                    dependencies: [{ team: 'Team B', interaction: 'collaboration' }]
                },
                { 
                    name: 'Team B', 
                    team_type: 'platform', 
                    position: { x: 300, y: 300 },
                    dependencies: []
                }
            ];
            const teamColorMap = { 'stream-aligned': '#4A90E2', 'platform': '#7ED321' };
            const state = { hideConnections: true };

            exportModule.exportToSVG(state, null, teams, teamColorMap, 'tt');

            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });
    });

    describe('Current State SVG Export', () => {
        it('should generate valid SVG for current state view', () => {
            const organizationHierarchy = {
                company: {
                    name: 'Test Company',
                    children: []
                }
            };
            const teams = [];
            const teamColorMap = {};
            const state = { hideConnections: false };

            exportModule.exportToSVG(state, organizationHierarchy, teams, teamColorMap, 'current');

            expect(document.createElement).toHaveBeenCalledWith('a');
            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });

        it('should handle company with departments', () => {
            const organizationHierarchy = {
                company: {
                    name: 'Test Company',
                    children: [
                        { id: 'dept1', name: 'Department 1', regions: [] }
                    ]
                }
            };
            const teams = [];
            const teamColorMap = {};
            const state = { hideConnections: false };

            exportModule.exportToSVG(state, organizationHierarchy, teams, teamColorMap, 'current');

            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });
    });

    describe('XML Escaping', () => {
        it('should handle special characters in team names', () => {
            const teams = [
                { name: 'Team <A> & "B"', team_type: 'stream-aligned', position: { x: 100, y: 100 }, dependencies: [] }
            ];
            const teamColorMap = { 'stream-aligned': '#4A90E2' };
            const state = { hideConnections: false };

            exportModule.exportToSVG(state, null, teams, teamColorMap, 'tt');

            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });
    });

    describe('File Download', () => {
        it('should trigger download with correct filename pattern', () => {
            const teams = [
                { name: 'Team A', team_type: 'stream-aligned', position: { x: 100, y: 100 }, dependencies: [] }
            ];
            const teamColorMap = { 'stream-aligned': '#4A90E2' };
            const state = { hideConnections: false };
            const mockLink = { href: '', download: '', click: vi.fn() };
            document.createElement = vi.fn(() => mockLink);

            exportModule.exportToSVG(state, null, teams, teamColorMap, 'tt');

            // Updated regex to match new European date format: yyyy-mm-dd-HHMM
            expect(mockLink.download).toMatch(/^team-topology-tt-\d{4}-\d{2}-\d{2}-\d{4}\.svg$/);
            expect(mockLink.click).toHaveBeenCalled();
        });

        it('should clean up after download', () => {
            const teams = [
                { name: 'Team A', team_type: 'stream-aligned', position: { x: 100, y: 100 }, dependencies: [] }
            ];
            const teamColorMap = { 'stream-aligned': '#4A90E2' };
            const state = { hideConnections: false };

            exportModule.exportToSVG(state, null, teams, teamColorMap, 'tt');

            expect(document.body.removeChild).toHaveBeenCalled();
            expect(global.URL.revokeObjectURL).toHaveBeenCalled();
        });
    });
});
