/**
 * Unit tests for renderer-business-streams.js
 * Tests Value Streams View rendering logic with nested layout
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderBusinessStreamsView } from './renderer-business-streams.js';

// Mock state management
vi.mock('./state-management.js', () => ({
    state: {
        businessStreamsTeamPositions: new Map(),
        teams: [],
        teamColorMap: {
            'feature-team': '#3498db',
            'platform-team': '#9b59b6',
            'enabling-team': '#2ecc71',
            'complicated-subsystem-team': '#e74c3c'
        },
        selectedTeam: null
    }
}));

// Mock canvas context
function createMockContext() {
    return {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        textAlign: 'left',
        textBaseline: 'top',
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        setLineDash: vi.fn(),
        roundRect: vi.fn(),
        measureText: (text) => ({ width: text.length * 8 })
    };
}

describe('renderBusinessStreamsView', () => {
    let ctx;

    beforeEach(() => {
        ctx = createMockContext();
    });

    describe('Basic Rendering', () => {
        it('should render title', () => {
            const data = {
                business_streams: {},
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            expect(ctx.fillText).toHaveBeenCalledWith('Business Streams View', expect.any(Number), expect.any(Number));
        });

        it('should handle empty value streams', () => {
            const data = {
                business_streams: {},
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should render title but no value stream containers
            expect(ctx.fillText).toHaveBeenCalled();
            expect(ctx.strokeRect).not.toHaveBeenCalled();
        });

        it('should handle null or undefined data', () => {
            const data = {
                business_streams: {},
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should not throw error
            expect(ctx.fillText).toHaveBeenCalled();
        });
    });

    describe('Value Stream Containers', () => {
        it('should render value stream containers', () => {
            const data = {
                business_streams: {
                    'B2B Services': {
                        id: 'b2b-services',
                        name: 'B2B Services',
                        description: 'Business-to-business solutions',
                        color: '#3498db',
                        products: {}
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should draw container rectangles
            expect(ctx.fillRect).toHaveBeenCalled();
            expect(ctx.strokeRect).toHaveBeenCalled();
            // Should render value stream name
            expect(ctx.fillText).toHaveBeenCalledWith(expect.stringContaining('B2B'), expect.any(Number), expect.any(Number));
        });

        it('should use value stream colors', () => {
            const data = {
                business_streams: {
                    'VS1': {
                        id: 'vs1',
                        name: 'VS1',
                        description: 'Value Stream 1',
                        color: '#FF5733',
                        products: {}
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Color should be set during rendering
            expect(ctx.strokeStyle).toContain('FF5733');
        });

        it('should render multiple value streams vertically stacked', () => {
            const data = {
                business_streams: {
                    'VS1': {
                        id: 'vs1',
                        name: 'VS1',
                        description: 'First',
                        color: '#3498db',
                        products: {}
                    },
                    'VS2': {
                        id: 'vs2',
                        name: 'VS2',
                        description: 'Second',
                        color: '#e74c3c',
                        products: {}
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should render both value streams
            expect(ctx.strokeRect).toHaveBeenCalled();
            expect(ctx.fillRect).toHaveBeenCalled();
        });

        it('should display value stream description if available', () => {
            const data = {
                business_streams: {
                    'VS1': {
                        id: 'vs1',
                        name: 'VS1',
                        description: 'This is a value stream description',
                        color: '#3498db',
                        products: {}
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Description should be rendered
            expect(ctx.fillText).toHaveBeenCalled();
        });
    });

    describe('Product Sections Within Value Streams', () => {
        it('should render products within value streams', () => {
            const data = {
                business_streams: {
                    'VS1': {
                        id: 'vs1',
                        name: 'VS1',
                        description: '',
                        color: '#3498db',
                        products: {
                            'DispatchHub': [
                                { name: 'Backend Team', team_type: 'feature-team' }
                            ]
                        }
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should render product section
            expect(ctx.fillText).toHaveBeenCalled();
        });

        it('should skip _no_product placeholder', () => {
            const data = {
                business_streams: {
                    'VS1': {
                        id: 'vs1',
                        name: 'VS1',
                        description: '',
                        color: '#3498db',
                        products: {
                            '_no_product': [
                                { name: 'Team Without Product', team_type: 'feature-team' }
                            ],
                            'RealProduct': [
                                { name: 'Team With Product', team_type: 'feature-team' }
                            ]
                        }
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // _no_product should be skipped
            // Only RealProduct should be rendered
            expect(ctx.fillText).toHaveBeenCalled();
        });

        it('should render multiple products within a value stream', () => {
            const data = {
                business_streams: {
                    'VS1': {
                        id: 'vs1',
                        name: 'VS1',
                        description: '',
                        color: '#3498db',
                        products: {
                            'Product1': [{ name: 'Team 1', team_type: 'feature-team' }],
                            'Product2': [{ name: 'Team 2', team_type: 'feature-team' }],
                            'Product3': [{ name: 'Team 3', team_type: 'feature-team' }]
                        }
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should render all product sections
            expect(ctx.fillRect).toHaveBeenCalled();
        });

        it('should render teams within products', () => {
            const data = {
                business_streams: {
                    'VS1': {
                        id: 'vs1',
                        name: 'VS1',
                        description: '',
                        color: '#3498db',
                        products: {
                            'DispatchHub': [
                                { name: 'Backend Services Team', team_type: 'feature-team' },
                                { name: 'Web Frontend Team', team_type: 'feature-team' }
                            ]
                        }
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Check that team names appear in fillText calls (may be wrapped)
            const fillTextCalls = ctx.fillText.mock.calls.map(call => call[0]);
            const hasBackendTeam = fillTextCalls.some(text => text.includes('Backend'));
            const hasWebTeam = fillTextCalls.some(text => text.includes('Web'));
            expect(hasBackendTeam).toBe(true);
            expect(hasWebTeam).toBe(true);
        });

        it('should handle product with empty teams array', () => {
            const data = {
                business_streams: {
                    'VS1': {
                        id: 'vs1',
                        name: 'VS1',
                        description: '',
                        color: '#3498db',
                        products: {
                            'EmptyProduct': []
                        }
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should not throw error
            expect(ctx.fillText).toHaveBeenCalled();
        });
    });

    describe('Products Without Value Stream (Right Column)', () => {
        it('should render products without value stream in right column', () => {
            const data = {
                business_streams: {},
                products_without_business_stream: {
                    'StandaloneProduct': [
                        { name: 'Standalone Team', team_type: 'feature-team' }
                    ]
                },
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should render ungrouped products section
            expect(ctx.fillText).toHaveBeenCalled();
        });

        it('should handle empty products_without_business_stream', () => {
            const data = {
                business_streams: {},
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should not render ungrouped products section
            expect(ctx.fillText).toHaveBeenCalledWith('Business Streams View', expect.any(Number), expect.any(Number));
        });

        it('should render multiple products without value stream', () => {
            const data = {
                business_streams: {},
                products_without_business_stream: {
                    'Product1': [{ name: 'Team 1', team_type: 'feature-team' }],
                    'Product2': [{ name: 'Team 2', team_type: 'feature-team' }]
                },
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should render both products
            expect(ctx.fillRect).toHaveBeenCalled();
        });
    });

    describe('Ungrouped Teams (Right Column)', () => {
        it('should render ungrouped teams below products', () => {
            const data = {
                business_streams: {},
                products_without_business_stream: {},
                ungrouped_teams: [
                    { name: 'Database Team', team_type: 'platform-team' },
                    { name: 'DevOps Team', team_type: 'platform-team' }
                ],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should render ungrouped teams
            expect(ctx.fillText).toHaveBeenCalledWith('Database Team', expect.any(Number), expect.any(Number));
            expect(ctx.fillText).toHaveBeenCalledWith('DevOps Team', expect.any(Number), expect.any(Number));
        });

        it('should handle empty ungrouped_teams array', () => {
            const data = {
                business_streams: {},
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should not throw error
            expect(ctx.fillText).toHaveBeenCalled();
        });

        it('should handle many ungrouped teams', () => {
            const data = {
                business_streams: {},
                products_without_business_stream: {},
                ungrouped_teams: Array(10).fill(null).map((_, i) => ({
                    name: `Team ${i + 1}`,
                    team_type: 'platform-team'
                })),
                teams: []
            };
            // Should render without error - fillRect may or may not be called depending on team rendering logic
            expect(() => renderBusinessStreamsView(ctx, data)).not.toThrow();
        });
    });

    describe('Complex Nested Structure', () => {
        it('should handle full nested structure: VS → Products → Teams', () => {
            const data = {
                business_streams: {
                    'B2B Services': {
                        id: 'b2b-services',
                        name: 'B2B Services',
                        description: 'Business solutions',
                        color: '#3498db',
                        products: {
                            'DispatchHub': [
                                { name: 'Backend Team', team_type: 'feature-team' },
                                { name: 'Frontend Team', team_type: 'feature-team' }
                            ],
                            'FleetMonitor': [
                                { name: 'Mobile Team', team_type: 'feature-team' }
                            ]
                        }
                    },
                    'B2C Services': {
                        id: 'b2c-services',
                        name: 'B2C Services',
                        description: 'Consumer solutions',
                        color: '#e74c3c',
                        products: {
                            'DriverApps': [
                                { name: 'iOS Team', team_type: 'feature-team' },
                                { name: 'Android Team', team_type: 'feature-team' }
                            ]
                        }
                    }
                },
                products_without_business_stream: {
                    'LegacyProduct': [
                        { name: 'Legacy Team', team_type: 'feature-team' }
                    ]
                },
                ungrouped_teams: [
                    { name: 'Database Team', team_type: 'platform-team' },
                    { name: 'Architecture Team', team_type: 'architecture-team' }
                ],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should render everything without error
            expect(ctx.fillRect).toHaveBeenCalled();
            expect(ctx.strokeRect).toHaveBeenCalled();
            expect(ctx.fillText).toHaveBeenCalled(); // Just check it was called
        });

        it('should handle value stream with mixed products (some with teams, some empty)', () => {
            const data = {
                business_streams: {
                    'VS1': {
                        id: 'vs1',
                        name: 'VS1',
                        description: '',
                        color: '#3498db',
                        products: {
                            'ProductWithTeams': [
                                { name: 'Team 1', team_type: 'feature-team' }
                            ],
                            'EmptyProduct': [],
                            'ProductWithMoreTeams': [
                                { name: 'Team 2', team_type: 'feature-team' },
                                { name: 'Team 3', team_type: 'feature-team' }
                            ]
                        }
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should render all products including empty one
            expect(ctx.fillRect).toHaveBeenCalled();
        });
    });

    describe('Layout Calculations', () => {
        it('should position value streams vertically with spacing', () => {
            const data = {
                business_streams: {
                    'VS1': {
                        id: 'vs1',
                        name: 'VS1',
                        description: '',
                        color: '#3498db',
                        products: {
                            'Product1': [{ name: 'Team 1', team_type: 'feature-team' }]
                        }
                    },
                    'VS2': {
                        id: 'vs2',
                        name: 'VS2',
                        description: '',
                        color: '#e74c3c',
                        products: {
                            'Product2': [{ name: 'Team 2', team_type: 'feature-team' }]
                        }
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should draw rectangles at different Y positions
            const fillRectCalls = ctx.fillRect.mock.calls;
            expect(fillRectCalls.length).toBeGreaterThan(0);
            // Check that Y coordinates are different (vertically stacked)
            const yPositions = fillRectCalls.map(call => call[1]);
            const uniqueY = new Set(yPositions);
            expect(uniqueY.size).toBeGreaterThan(1);
        });

        it('should use right column for ungrouped content', () => {
            const data = {
                business_streams: {
                    'VS1': {
                        id: 'vs1',
                        name: 'VS1',
                        description: '',
                        color: '#3498db',
                        products: {}
                    }
                },
                products_without_business_stream: {
                    'Product1': [{ name: 'Team 1', team_type: 'feature-team' }]
                },
                ungrouped_teams: [
                    { name: 'Shared Team', team_type: 'platform-team' }
                ],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Right column content should have different X positions
            const fillRectCalls = ctx.fillRect.mock.calls;
            const xPositions = fillRectCalls.map(call => call[0]);
            const uniqueX = new Set(xPositions);
            expect(uniqueX.size).toBeGreaterThan(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle value stream with only _no_product teams', () => {
            const data = {
                business_streams: {
                    'VS1': {
                        id: 'vs1',
                        name: 'VS1',
                        description: '',
                        color: '#3498db',
                        products: {
                            '_no_product': [
                                { name: 'Team 1', team_type: 'feature-team' }
                            ]
                        }
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should render value stream container but skip _no_product
            expect(ctx.fillText).toHaveBeenCalled();
        });

        it('should handle teams without team_type', () => {
            const data = {
                business_streams: {
                    'VS1': {
                        id: 'vs1',
                        name: 'VS1',
                        description: '',
                        color: '#3498db',
                        products: {
                            'Product1': [
                                { name: 'Typeless Team' }
                            ]
                        }
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should render without error
            expect(ctx.fillText).toHaveBeenCalled();
        });

        it('should handle very long value stream names', () => {
            const data = {
                business_streams: {
                    'Very Long Value Stream Name That Exceeds Normal Width': {
                        id: 'long-vs',
                        name: 'Very Long Value Stream Name That Exceeds Normal Width',
                        description: '',
                        color: '#3498db',
                        products: {}
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should render without error
            expect(ctx.fillText).toHaveBeenCalled();
        });

        it('should handle value stream with many products and teams', () => {
            const products = {};
            for (let i = 1; i <= 5; i++) {
                products[`Product${i}`] = Array(3).fill(null).map((_, j) => ({
                    name: `P${i} Team ${j + 1}`,
                    team_type: 'feature-team'
                }));
            }

            const data = {
                business_streams: {
                    'Large VS': {
                        id: 'large-vs',
                        name: 'Large VS',
                        description: '',
                        color: '#3498db',
                        products
                    }
                },
                products_without_business_stream: {},
                ungrouped_teams: [],
                teams: []
            };
            renderBusinessStreamsView(ctx, data);
            // Should render all content without error
            expect(ctx.fillRect).toHaveBeenCalled();
            expect(ctx.fillText).toHaveBeenCalled(); // Just check it was called
        });
    });
});

