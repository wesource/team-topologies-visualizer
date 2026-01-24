/**
 * Unit tests for state-management.js
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { state, getFilteredTeams, zoomIn, zoomOut, fitToView, updateZoomDisplay } from './state-management.js';

describe('state-management.js', () => {
    describe('getFilteredTeams', () => {
        beforeEach(() => {
            // Reset state before each test
            state.teams = [];
            state.selectedFilters = {
                valueStreams: [],
                platformGroupings: [],
                showUngrouped: false
            };
        });

        it('should return all teams when no filters are active', () => {
            state.teams = [
                { name: 'Team A', value_stream: 'E-commerce' },
                { name: 'Team B', platform_grouping: 'Data' },
                { name: 'Team C' }
            ];

            const result = getFilteredTeams();
            expect(result).toEqual(state.teams);
            expect(result.length).toBe(3);
        });

        it('should filter teams by value stream', () => {
            state.teams = [
                { name: 'Team A', value_stream: 'E-commerce' },
                { name: 'Team B', value_stream: 'Analytics' },
                { name: 'Team C', value_stream: 'E-commerce' }
            ];
            state.selectedFilters.valueStreams = ['E-commerce'];

            const result = getFilteredTeams();
            expect(result.length).toBe(2);
            expect(result[0].name).toBe('Team A');
            expect(result[1].name).toBe('Team C');
        });

        it('should filter teams by platform grouping', () => {
            state.teams = [
                { name: 'Team A', platform_grouping: 'Data Platform' },
                { name: 'Team B', platform_grouping: 'Infrastructure' },
                { name: 'Team C', platform_grouping: 'Data Platform' }
            ];
            state.selectedFilters.platformGroupings = ['Data Platform'];

            const result = getFilteredTeams();
            expect(result.length).toBe(2);
            expect(result[0].name).toBe('Team A');
            expect(result[1].name).toBe('Team C');
        });

        it('should filter ungrouped teams', () => {
            state.teams = [
                { name: 'Team A', value_stream: 'E-commerce' },
                { name: 'Team B', platform_grouping: 'Data' },
                { name: 'Team C' }, // No grouping
                { name: 'Team D' }  // No grouping
            ];
            state.selectedFilters.showUngrouped = true;

            const result = getFilteredTeams();
            expect(result.length).toBe(2);
            expect(result[0].name).toBe('Team C');
            expect(result[1].name).toBe('Team D');
        });

        it('should use OR logic for multiple value streams', () => {
            state.teams = [
                { name: 'Team A', value_stream: 'E-commerce' },
                { name: 'Team B', value_stream: 'Analytics' },
                { name: 'Team C', value_stream: 'Payments' }
            ];
            state.selectedFilters.valueStreams = ['E-commerce', 'Analytics'];

            const result = getFilteredTeams();
            expect(result.length).toBe(2);
            expect(result.map(t => t.name)).toEqual(['Team A', 'Team B']);
        });

        it('should use OR logic for multiple platform groupings', () => {
            state.teams = [
                { name: 'Team A', platform_grouping: 'Data Platform' },
                { name: 'Team B', platform_grouping: 'Infrastructure' },
                { name: 'Team C', platform_grouping: 'Observability' }
            ];
            state.selectedFilters.platformGroupings = ['Data Platform', 'Infrastructure'];

            const result = getFilteredTeams();
            expect(result.length).toBe(2);
            expect(result.map(t => t.name)).toEqual(['Team A', 'Team B']);
        });

        it('should use OR logic across different filter types', () => {
            state.teams = [
                { name: 'Team A', value_stream: 'E-commerce' },
                { name: 'Team B', platform_grouping: 'Data Platform' },
                { name: 'Team C' },
                { name: 'Team D', value_stream: 'Analytics' }
            ];
            state.selectedFilters.valueStreams = ['E-commerce'];
            state.selectedFilters.platformGroupings = ['Data Platform'];

            const result = getFilteredTeams();
            expect(result.length).toBe(2);
            expect(result.map(t => t.name)).toEqual(['Team A', 'Team B']);
        });

        it('should combine value stream and ungrouped filters', () => {
            state.teams = [
                { name: 'Team A', value_stream: 'E-commerce' },
                { name: 'Team B', platform_grouping: 'Data' },
                { name: 'Team C' }
            ];
            state.selectedFilters.valueStreams = ['E-commerce'];
            state.selectedFilters.showUngrouped = true;

            const result = getFilteredTeams();
            expect(result.length).toBe(2);
            expect(result.map(t => t.name)).toEqual(['Team A', 'Team C']);
        });

        it('should handle teams with both value_stream and platform_grouping', () => {
            state.teams = [
                { name: 'Team A', value_stream: 'E-commerce', platform_grouping: 'Data' },
                { name: 'Team B', value_stream: 'Analytics' }
            ];
            state.selectedFilters.valueStreams = ['E-commerce'];

            const result = getFilteredTeams();
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Team A');
        });

        it('should not match ungrouped filter for teams with value_stream', () => {
            state.teams = [
                { name: 'Team A', value_stream: 'E-commerce' },
                { name: 'Team B' }
            ];
            state.selectedFilters.showUngrouped = true;

            const result = getFilteredTeams();
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Team B');
        });

        it('should not match ungrouped filter for teams with platform_grouping', () => {
            state.teams = [
                { name: 'Team A', platform_grouping: 'Data' },
                { name: 'Team B' }
            ];
            state.selectedFilters.showUngrouped = true;

            const result = getFilteredTeams();
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Team B');
        });

        it('should handle empty teams array', () => {
            state.teams = [];
            state.selectedFilters.valueStreams = ['E-commerce'];

            const result = getFilteredTeams();
            expect(result).toEqual([]);
        });

        it('should handle teams with null/undefined value_stream', () => {
            state.teams = [
                { name: 'Team A', value_stream: null },
                { name: 'Team B', value_stream: undefined },
                { name: 'Team C', value_stream: 'E-commerce' }
            ];
            state.selectedFilters.valueStreams = ['E-commerce'];

            const result = getFilteredTeams();
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Team C');
        });

        it('should handle teams with null/undefined platform_grouping', () => {
            state.teams = [
                { name: 'Team A', platform_grouping: null },
                { name: 'Team B', platform_grouping: undefined },
                { name: 'Team C', platform_grouping: 'Data Platform' }
            ];
            state.selectedFilters.platformGroupings = ['Data Platform'];

            const result = getFilteredTeams();
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Team C');
        });

        it('should return empty array when no teams match filters', () => {
            state.teams = [
                { name: 'Team A', value_stream: 'E-commerce' },
                { name: 'Team B', platform_grouping: 'Data' }
            ];
            state.selectedFilters.valueStreams = ['Nonexistent'];

            const result = getFilteredTeams();
            expect(result).toEqual([]);
        });

        it('should preserve original team objects in filtered results', () => {
            const teamA = { name: 'Team A', value_stream: 'E-commerce' };
            state.teams = [teamA];
            state.selectedFilters.valueStreams = ['E-commerce'];

            const result = getFilteredTeams();
            expect(result[0]).toBe(teamA); // Same object reference
        });
    });

    describe('zoomIn', () => {
        beforeEach(() => {
            state.scale = 1;
            document.body.innerHTML = '<span id="zoomLevel"></span>';
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        it('should increase scale by 20%', () => {
            zoomIn();
            expect(state.scale).toBeCloseTo(1.2, 2);
        });

        it('should call draw callback if provided', () => {
            const mockDraw = vi.fn();
            zoomIn(mockDraw);
            expect(mockDraw).toHaveBeenCalledTimes(1);
        });

        it('should not call draw callback if not provided', () => {
            expect(() => zoomIn()).not.toThrow();
        });

        it('should cap scale at 3.0 (max zoom)', () => {
            state.scale = 2.8;
            zoomIn();
            expect(state.scale).toBe(3);
        });

        it('should not exceed max zoom with multiple calls', () => {
            for (let i = 0; i < 20; i++) {
                zoomIn();
            }
            expect(state.scale).toBe(3);
        });

        it('should update zoom display', () => {
            zoomIn();
            const zoomLevel = document.getElementById('zoomLevel');
            expect(zoomLevel.textContent).toBe('120%');
        });

        it('should handle zoom from very small scale', () => {
            state.scale = 0.1;
            zoomIn();
            expect(state.scale).toBeCloseTo(0.12, 2);
        });
    });

    describe('zoomOut', () => {
        beforeEach(() => {
            state.scale = 1;
            document.body.innerHTML = '<span id="zoomLevel"></span>';
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        it('should decrease scale by dividing by 1.2', () => {
            zoomOut();
            expect(state.scale).toBeCloseTo(0.833, 2);
        });

        it('should call draw callback if provided', () => {
            const mockDraw = vi.fn();
            zoomOut(mockDraw);
            expect(mockDraw).toHaveBeenCalledTimes(1);
        });

        it('should not call draw callback if not provided', () => {
            expect(() => zoomOut()).not.toThrow();
        });

        it('should cap scale at 0.1 (min zoom)', () => {
            state.scale = 0.12;
            zoomOut();
            expect(state.scale).toBe(0.1);
        });

        it('should not go below min zoom with multiple calls', () => {
            for (let i = 0; i < 50; i++) {
                zoomOut();
            }
            expect(state.scale).toBe(0.1);
        });

        it('should update zoom display', () => {
            zoomOut();
            const zoomLevel = document.getElementById('zoomLevel');
            expect(zoomLevel.textContent).toBe('83%');
        });

        it('should handle zoom from very large scale', () => {
            state.scale = 3;
            zoomOut();
            expect(state.scale).toBeCloseTo(2.5, 2);
        });
    });

    describe('fitToView', () => {
        let mockCanvas;
        let mockSidebar;

        beforeEach(() => {
            state.scale = 1;
            state.viewOffset = { x: 0, y: 0 };

            mockCanvas = {
                width: 1200,
                height: 800,
                clientWidth: 1200,
                clientHeight: 800
            };
            mockSidebar = document.createElement('div');
            mockSidebar.className = 'sidebar';
            Object.defineProperty(mockSidebar, 'offsetWidth', { value: 250, configurable: true });
            document.body.appendChild(mockSidebar);
            document.body.innerHTML += '<span id="zoomLevel"></span>';
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        it('should handle empty teams array gracefully', () => {
            fitToView(mockCanvas, []);
            // Should not throw and state should remain unchanged
            expect(state.scale).toBe(1);
            expect(state.viewOffset).toEqual({ x: 0, y: 0 });
        });

        it('should handle null teams array', () => {
            fitToView(mockCanvas, null);
            expect(state.scale).toBe(1);
        });

        it('should calculate scale to fit teams in view', () => {
            const teams = [
                { position: { x: 100, y: 100 } },
                { position: { x: 500, y: 300 } }
            ];

            fitToView(mockCanvas, teams);

            expect(state.scale).toBeGreaterThan(0);
            expect(state.scale).toBeLessThanOrEqual(1.5); // Capped at 150%
        });

        it('should cap scale at 1.5 (150%)', () => {
            const teams = [
                { position: { x: 400, y: 300 } },
                { position: { x: 450, y: 320 } }
            ];

            fitToView(mockCanvas, teams);

            expect(state.scale).toBe(1.5);
        });

        it('should call draw callback if provided', () => {
            const teams = [{ position: { x: 100, y: 100 } }];
            const mockDraw = vi.fn();

            fitToView(mockCanvas, teams, mockDraw);

            expect(mockDraw).toHaveBeenCalledTimes(1);
        });

        it('should center content in visible canvas area', () => {
            const teams = [
                { position: { x: 100, y: 100 } },
                { position: { x: 300, y: 200 } }
            ];

            fitToView(mockCanvas, teams);

            // View offset should be calculated to center content
            expect(state.viewOffset.x).toBeDefined();
            expect(state.viewOffset.y).toBeDefined();
        });

        it('should account for sidebar width in calculations', () => {
            const teams = [{ position: { x: 100, y: 100 } }];

            fitToView(mockCanvas, teams);

            // viewOffset.x should account for 250px sidebar
            expect(state.viewOffset.x).toBeGreaterThan(250);
        });

        it('should handle teams with missing position', () => {
            const teams = [
                { position: { x: 100, y: 100 } },
                { position: null },
                { position: { x: 200, y: 150 } }
            ];

            fitToView(mockCanvas, teams);

            // Should treat missing position as 0,0 and not throw
            expect(state.scale).toBeGreaterThan(0);
        });

        it('should handle teams with undefined x/y coordinates', () => {
            const teams = [
                { position: { x: undefined, y: undefined } },
                { position: { x: 100, y: 100 } }
            ];

            fitToView(mockCanvas, teams);

            expect(state.scale).toBeGreaterThan(0);
        });

        it('should account for team dimensions (200x80)', () => {
            const teams = [{ position: { x: 100, y: 100 } }];

            fitToView(mockCanvas, teams);

            // Bounding box should include team width/height
            // This test verifies the calculation doesn't throw errors
            expect(state.scale).toBeGreaterThan(0);
        });

        it('should handle wide spread of teams', () => {
            const teams = [
                { position: { x: 0, y: 0 } },
                { position: { x: 2000, y: 1500 } }
            ];

            fitToView(mockCanvas, teams);

            expect(state.scale).toBeLessThan(1); // Should zoom out
        });

        it('should handle teams clustered closely together', () => {
            const teams = [
                { position: { x: 500, y: 400 } },
                { position: { x: 510, y: 410 } },
                { position: { x: 520, y: 405 } }
            ];

            fitToView(mockCanvas, teams);

            expect(state.scale).toBe(1.5); // Should be capped at max
        });

        it('should update zoom display after fitting', () => {
            const teams = [{ position: { x: 100, y: 100 } }];

            fitToView(mockCanvas, teams);

            const zoomLevel = document.getElementById('zoomLevel');
            expect(zoomLevel.textContent).toMatch(/\d+%/);
        });

        it('should handle missing sidebar element', () => {
            document.body.innerHTML = '<span id="zoomLevel"></span>'; // Remove sidebar
            const teams = [{ position: { x: 100, y: 100 } }];

            fitToView(mockCanvas, teams);

            // Should use default 250px sidebar width
            expect(state.viewOffset.x).toBeGreaterThan(0);
        });

        it('should apply padding around content', () => {
            const teams = [
                { position: { x: 0, y: 0 } },
                { position: { x: 100, y: 100 } }
            ];

            fitToView(mockCanvas, teams);

            // Should calculate scale (will be capped at 1.5 or lower based on content)
            expect(state.scale).toBeGreaterThan(0);
            expect(state.scale).toBeLessThanOrEqual(1.5);
        });
    });

    describe('updateZoomDisplay', () => {
        beforeEach(() => {
            document.body.innerHTML = '<span id="zoomLevel"></span>';
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        it('should update zoom level display element', () => {
            state.scale = 1.5;
            updateZoomDisplay();

            const zoomLevel = document.getElementById('zoomLevel');
            expect(zoomLevel.textContent).toBe('150%');
        });

        it('should round zoom percentage', () => {
            state.scale = 1.234;
            updateZoomDisplay();

            const zoomLevel = document.getElementById('zoomLevel');
            expect(zoomLevel.textContent).toBe('123%');
        });

        it('should handle scale less than 1', () => {
            state.scale = 0.75;
            updateZoomDisplay();

            const zoomLevel = document.getElementById('zoomLevel');
            expect(zoomLevel.textContent).toBe('75%');
        });

        it('should handle very small scale', () => {
            state.scale = 0.1;
            updateZoomDisplay();

            const zoomLevel = document.getElementById('zoomLevel');
            expect(zoomLevel.textContent).toBe('10%');
        });

        it('should handle very large scale', () => {
            state.scale = 3;
            updateZoomDisplay();

            const zoomLevel = document.getElementById('zoomLevel');
            expect(zoomLevel.textContent).toBe('300%');
        });

        it('should handle missing zoom level element gracefully', () => {
            document.body.innerHTML = ''; // Remove element

            expect(() => updateZoomDisplay()).not.toThrow();
        });

        it('should handle scale of exactly 1', () => {
            state.scale = 1;
            updateZoomDisplay();

            const zoomLevel = document.getElementById('zoomLevel');
            expect(zoomLevel.textContent).toBe('100%');
        });
    });
});
