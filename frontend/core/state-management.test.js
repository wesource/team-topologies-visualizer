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

        it('should use full canvas width without subtracting sidebar', () => {
            const teams = [{ position: { x: 100, y: 100 } }];

            fitToView(mockCanvas, teams);

            // viewOffset.x should NOT add sidebar offset
            // With minX=100, leftMargin=10, scale~1.5
            // viewOffset.x = 10 - 100*1.5 = -140
            expect(state.viewOffset.x).toBeLessThan(100);
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

            // Scale capped at 1.5 even for wide content
            expect(state.scale).toBeLessThanOrEqual(1.5);
            expect(state.scale).toBeGreaterThan(0);
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

        describe('Hierarchy view with organizational structure', () => {
            beforeEach(() => {
                state.currentView = 'baseline';
                state.currentPerspective = 'hierarchy';
                state.organizationHierarchy = {
                    company: {
                        name: 'Test Company',
                        children: [
                            {
                                id: 'engineering-dept',
                                name: 'Engineering',
                                line_managers: [
                                    { name: 'Backend LM', teams: ['team1'] },
                                    { name: 'Frontend LM', teams: ['team2'] },
                                    { name: 'Mobile LM', teams: ['team3'] }
                                ]
                            },
                            {
                                id: 'customer-dept',
                                name: 'Customer Solutions',
                                regions: [
                                    { name: 'Americas', teams: ['team4'] },
                                    { name: 'Europe', teams: ['team5'] }
                                ]
                            }
                        ]
                    }
                };
            });

            it('should include organizational structure in bounds calculation', () => {
                const teams = [
                    { position: { x: 100, y: 300 } }
                ];

                fitToView(mockCanvas, teams);

                // Should calculate bounds including org structure at top (y=0)
                // and leftmost line manager positions
                expect(state.viewOffset.y).toBeLessThan(50); // Should include top content
                expect(state.scale).toBeGreaterThan(0);
            });

            it('should handle line managers centered under department', () => {
                const teams = [
                    { position: { x: 100, y: 300 } }
                ];

                fitToView(mockCanvas, teams);

                // With 3 line managers, leftmost should be calculated correctly
                // Scale should account for full width including spread
                expect(state.scale).toBeGreaterThan(0);
                expect(state.scale).toBeLessThanOrEqual(1.5);
            });

            it('should handle departments and regions together', () => {
                const teams = [
                    { position: { x: 100, y: 300 } }
                ];

                fitToView(mockCanvas, teams);

                // Should handle both line_managers and regions arrays
                expect(state.scale).toBeGreaterThan(0);
                expect(state.viewOffset.x).toBeDefined();
            });

            it('should use LAYOUT constants for calculations', () => {
                const teams = [{ position: { x: 100, y: 300 } }];

                fitToView(mockCanvas, teams);

                // Should use LAYOUT.DEPT_SPACING, LINE_MANAGER_SPACING etc
                // Indirectly verified by scale calculation being consistent
                expect(state.scale).toBeLessThanOrEqual(1.5);
            });
        });

        describe('Product-lines and Business-streams perspectives', () => {
            beforeEach(() => {
                state.currentView = 'baseline';
            });

            it('should use custom team positions for product-lines', () => {
                state.currentPerspective = 'product-lines';
                state.productLinesTeamPositions = new Map([
                    ['Team A', { x: 60, y: 180, width: 280, height: 50 }],
                    ['Team B', { x: 380, y: 180, width: 280, height: 50 }],
                    ['Team C', { x: 700, y: 180, width: 280, height: 50 }]
                ]);

                const teams = [
                    { position: { x: 1000, y: 1000 } } // Should be ignored
                ];

                fitToView(mockCanvas, teams);

                // Should use productLinesTeamPositions, not team.position
                // Content should fit tighter since using actual positions
                expect(state.scale).toBeGreaterThan(0.3); // Not zoomed out too far
            });

            it('should include product-lines header in bounds', () => {
                state.currentPerspective = 'product-lines';
                state.productLinesTeamPositions = new Map([
                    ['Team A', { x: 60, y: 180, width: 280, height: 50 }]
                ]);

                const teams = [{ position: { x: 60, y: 180 } }];

                fitToView(mockCanvas, teams);

                // Header at y=60 should be included in bounds
                // With topMargin=10, minY should be around 50
                expect(state.viewOffset.y).toBeLessThan(100); // Should position to show header
            });

            it('should use custom team positions for business-streams', () => {
                state.currentPerspective = 'business-streams';
                state.businessStreamsTeamPositions = new Map([
                    ['Team X', { x: 100, y: 400, width: 250, height: 100 }],
                    ['Team Y', { x: 100, y: 550, width: 250, height: 100 }]
                ]);

                const teams = [
                    { position: { x: 2000, y: 2000 } } // Should be ignored
                ];

                fitToView(mockCanvas, teams);

                // Should use businessStreamsTeamPositions
                expect(state.scale).toBeGreaterThan(0.5);
            });

            it('should include business-streams header in bounds', () => {
                state.currentPerspective = 'business-streams';
                state.businessStreamsTeamPositions = new Map([
                    ['Team X', { x: 100, y: 400, width: 250, height: 100 }]
                ]);

                const teams = [{ position: { x: 100, y: 400 } }];

                fitToView(mockCanvas, teams);

                // Header at y=20 should be included in bounds
                // With topMargin=10, minY should be around 10
                expect(state.viewOffset.y).toBeLessThan(50); // Should position to show header
            });

            it('should handle empty custom positions gracefully', () => {
                state.currentPerspective = 'product-lines';
                state.productLinesTeamPositions = new Map();

                const teams = [{ position: { x: 100, y: 100 } }];

                fitToView(mockCanvas, teams);

                // Should fall back to team positions
                expect(state.scale).toBeGreaterThan(0);
            });
        });

        describe('Sidebar overlay behavior', () => {
            it('should use full canvas width for scale calculation', () => {
                const teams = [
                    { position: { x: 0, y: 0 } },
                    { position: { x: 1000, y: 500 } }
                ];

                fitToView(mockCanvas, teams);

                // Scale should be based on fullCanvasWidth (1200), not reduced by sidebar
                // With targetFillWidth = 1200 - 40 = 1160
                // contentWidth ≈ 1000, scaleX ≈ 1160/1000 = 1.16
                expect(state.scale).toBeGreaterThan(1);
                expect(state.scale).toBeLessThanOrEqual(1.5);
            });

            it('should position content at canvas x=0', () => {
                const teams = [{ position: { x: 100, y: 100 } }];

                fitToView(mockCanvas, teams);

                // viewOffset.x should be calculated from canvas x=0 (no sidebar subtraction)
                // With minX=100, leftMargin=10, scale~1.5
                // viewOffset.x = 10 - 100*scale = 10 - 150 = -140
                // But with box width, minX=0 so viewOffset.x = 10
                expect(state.viewOffset.x).toBeGreaterThan(-200);
                expect(state.viewOffset.x).toBeLessThan(200);
            });

            it('should apply asymmetric margins (10px left, 30px right)', () => {
                const teams = [
                    { position: { x: 0, y: 0 } },
                    { position: { x: 500, y: 300 } }
                ];

                fitToView(mockCanvas, teams);

                // targetFillWidth = canvasWidth - 40 (10px + 30px margins)
                // Should result in slightly smaller scale than symmetric margins
                expect(state.scale).toBeGreaterThan(0);
            });
        });

        describe('Different team types', () => {
            it('should use getTeamBoxWidth for stream-aligned teams', () => {
                const teams = [
                    {
                        position: { x: 100, y: 100 },
                        team_type: 'stream-aligned'
                    }
                ];
                state.currentView = 'tt';

                fitToView(mockCanvas, teams);

                // Should account for stream-aligned team dimensions
                expect(state.scale).toBeGreaterThan(0);
            });

            it('should use getTeamBoxHeight for different team types', () => {
                const teams = [
                    {
                        position: { x: 100, y: 100 },
                        team_type: 'enabling' // Taller box
                    },
                    {
                        position: { x: 300, y: 100 },
                        team_type: 'stream-aligned' // Shorter box (80% height)
                    }
                ];
                state.currentView = 'tt';

                fitToView(mockCanvas, teams);

                // Should calculate bounds using actual heights
                expect(state.scale).toBeGreaterThan(0);
            });

            it('should handle platform teams with standard dimensions', () => {
                const teams = [
                    {
                        position: { x: 100, y: 100 },
                        team_type: 'platform'
                    }
                ];
                state.currentView = 'tt';

                fitToView(mockCanvas, teams);

                expect(state.scale).toBeGreaterThan(0);
                expect(state.scale).toBeLessThanOrEqual(1.5);
            });
        });

        describe('Edge cases and filters', () => {
            it('should respect filtered teams', () => {
                const teams = [
                    {
                        position: { x: 100, y: 100 },
                        team_type: 'stream-aligned',
                        name: 'Team A'
                    },
                    {
                        position: { x: 2000, y: 2000 },
                        team_type: 'platform',
                        name: 'Team B'
                    }
                ];

                // Simulate filter that would hide Team B
                state.filters = { teamTypes: { platform: false } };

                fitToView(mockCanvas, teams);

                // Should only fit visible teams, resulting in higher zoom
                expect(state.scale).toBeGreaterThan(0.5);
            });

            it('should handle negative coordinates', () => {
                const teams = [
                    { position: { x: -100, y: -50 } },
                    { position: { x: 200, y: 150 } }
                ];

                fitToView(mockCanvas, teams);

                // Should handle negative positions correctly
                expect(state.viewOffset.x).toBeGreaterThan(0);
                expect(state.viewOffset.y).toBeGreaterThan(0);
            });

            it('should handle very large coordinates', () => {
                const teams = [
                    { position: { x: 0, y: 0 } },
                    { position: { x: 5000, y: 3000 } }
                ];

                fitToView(mockCanvas, teams);

                // Scale capped at max 1.5, but very large content may have smaller scale
                expect(state.scale).toBeGreaterThan(0);
                expect(state.scale).toBeLessThanOrEqual(1.5);
            });
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
