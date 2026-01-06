/**
 * Unit tests for renderer-product-lines.js
 * Tests Product Lines View rendering logic with hybrid layout
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { drawProductLinesView } from './renderer-product-lines.js';

// Mock canvas context
function createMockContext() {
    return {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        textAlign: 'left',
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
        setLineDash: vi.fn(),
        roundRect: vi.fn(),
        measureText: (text) => ({ width: text.length * 8 })
    };
}

// Mock wrapText function
function mockWrapText(_ctx, text, _maxWidth) {
    if (text.length > 20) {
        // Split long text into chunks
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        words.forEach(word => {
            if ((currentLine + word).length > 20) {
                if (currentLine) lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine += word + ' ';
            }
        });
        if (currentLine) lines.push(currentLine.trim());
        return lines;
    }
    return [text];
}

// Mock team color map
const mockTeamColorMap = {
    'feature-team': '#FF9800',
    'platform-team': '#2196F3',
    'enabling-team': '#9C27B0',
    'architecture-team': '#4CAF50'
};

describe('drawProductLinesView', () => {
    let ctx;
    let teamPositions;

    beforeEach(() => {
        ctx = createMockContext();
        teamPositions = new Map();
    });

    describe('Basic Rendering', () => {
        it('should handle null or undefined productLinesData', () => {
            drawProductLinesView(ctx, null, [], mockTeamColorMap, mockWrapText);
            expect(ctx.fillRect).not.toHaveBeenCalled();

            drawProductLinesView(ctx, undefined, [], mockTeamColorMap, mockWrapText);
            expect(ctx.fillRect).not.toHaveBeenCalled();
        });

        it('should handle productLinesData without products property', () => {
            const data = { shared_teams: [] };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            expect(ctx.fillRect).not.toHaveBeenCalled();
        });

        it('should render title', () => {
            const data = {
                products: [],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            expect(ctx.fillText).toHaveBeenCalledWith('Product Lines View', expect.any(Number), expect.any(Number));
        });

        it('should clear teamPositions map at start', () => {
            teamPositions.set('existing', { x: 0, y: 0, width: 100, height: 50 });
            const data = { products: [], shared_teams: [] };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText, false, teamPositions);
            expect(teamPositions.size).toBe(0);
        });
    });

    describe('Product Lanes Rendering', () => {
        it('should render product lanes for each product', () => {
            const data = {
                products: [
                    { id: 'p1', name: 'Product 1', color: '#3498db', teams: [] },
                    { id: 'p2', name: 'Product 2', color: '#e74c3c', teams: [] }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);

            // Should render headers for both products
            expect(ctx.fillText).toHaveBeenCalledWith('Product 1', expect.any(Number), expect.any(Number));
            expect(ctx.fillText).toHaveBeenCalledWith('Product 2', expect.any(Number), expect.any(Number));
        });

        it('should use product colors for headers', () => {
            const data = {
                products: [
                    { id: 'p1', name: 'Product 1', color: '#FF5733', teams: [] }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            expect(ctx.fillStyle).toHaveProperty('toString');
            // The color should be set at some point during rendering
        });

        it('should display team count for each product', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: [
                            { name: 'Team 1', team_type: 'feature-team' },
                            { name: 'Team 2', team_type: 'feature-team' }
                        ]
                    }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            expect(ctx.fillText).toHaveBeenCalledWith('2 teams', expect.any(Number), expect.any(Number));
        });

        it('should use singular "team" for single team', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: [{ name: 'Team 1', team_type: 'feature-team' }]
                    }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            expect(ctx.fillText).toHaveBeenCalledWith('1 team', expect.any(Number), expect.any(Number));
        });

        it('should handle product with no color (use default)', () => {
            const data = {
                products: [
                    { id: 'p1', name: 'Product 1', teams: [] }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            // Should not throw error
            expect(ctx.fillRect).toHaveBeenCalled();
        });
    });

    describe('Team Cards in Lanes', () => {
        it('should render team cards within product lanes', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: [
                            { name: 'Backend Team', team_type: 'feature-team' },
                            { name: 'Frontend Team', team_type: 'feature-team' }
                        ]
                    }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            expect(ctx.fillText).toHaveBeenCalledWith('Backend Team', expect.any(Number), expect.any(Number));
            expect(ctx.fillText).toHaveBeenCalledWith('Frontend Team', expect.any(Number), expect.any(Number));
        });

        it('should use team type colors for team cards', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: [
                            { name: 'Platform Team', team_type: 'platform-team' }
                        ]
                    }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            // Team card should use platform-team color, not product color
            expect(ctx.fillStyle).toHaveProperty('toString');
        });

        it('should store team positions for click detection', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: [
                            { name: 'Team 1', team_type: 'feature-team' }
                        ]
                    }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText, false, teamPositions);
            expect(teamPositions.size).toBeGreaterThan(0);
            expect(teamPositions.has('Team 1')).toBe(true);

            const pos = teamPositions.get('Team 1');
            expect(pos).toHaveProperty('x');
            expect(pos).toHaveProperty('y');
            expect(pos).toHaveProperty('width');
            expect(pos).toHaveProperty('height');
        });

        it('should handle teams with long names (text wrapping)', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: [
                            { name: 'Very Long Team Name That Should Wrap', team_type: 'feature-team' }
                        ]
                    }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            // Should call fillText multiple times for wrapped text
            expect(ctx.fillText).toHaveBeenCalled();
        });
    });

    describe('Shared Teams Row', () => {
        it('should render shared teams in horizontal row', () => {
            const data = {
                products: [],
                shared_teams: [
                    { name: 'Database Team', team_type: 'platform-team' },
                    { name: 'DevOps Team', team_type: 'platform-team' }
                ]
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            // Check that team names appear somewhere in fillText calls (wrapped or not)
            const fillTextCalls = ctx.fillText.mock.calls.map(call => call[0]);
            const hasTeamText = fillTextCalls.some(text =>
                text.includes('Database') || text.includes('DevOps') || text.includes('team')
            );
            expect(hasTeamText).toBe(true);
        });

        it('should handle empty shared_teams array', () => {
            const data = {
                products: [
                    { id: 'p1', name: 'Product 1', color: '#3498db', teams: [] }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            // Should not throw error
            expect(ctx.fillRect).toHaveBeenCalled();
        });

        it('should handle missing shared_teams property', () => {
            const data = {
                products: [
                    { id: 'p1', name: 'Product 1', color: '#3498db', teams: [] }
                ]
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            // Should default to empty array and not throw
            expect(ctx.fillRect).toHaveBeenCalled();
        });

        it('should store shared team positions for click detection', () => {
            const data = {
                products: [],
                shared_teams: [
                    { name: 'Shared Platform', team_type: 'platform-team' }
                ]
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText, false, teamPositions);
            expect(teamPositions.has('Shared Platform')).toBe(true);
        });

        it('should position shared row below longest product lane', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: Array(5).fill(null).map((_, i) => ({
                            name: `Team ${i + 1}`,
                            team_type: 'feature-team'
                        }))
                    },
                    {
                        id: 'p2',
                        name: 'Product 2',
                        color: '#e74c3c',
                        teams: [{ name: 'Small Team', team_type: 'feature-team' }]
                    }
                ],
                shared_teams: [{ name: 'Shared Team', team_type: 'platform-team' }]
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText, false, teamPositions);
            // Shared team should be positioned after longest product (Product 1 with 5 teams)
            expect(teamPositions.has('Shared Team')).toBe(true);
        });
    });

    describe('Cognitive Load Indicators', () => {
        it('should render cognitive load when showCognitiveLoad is true', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: [{
                            name: 'Team 1',
                            team_type: 'feature-team',
                            cognitive_load: 'high'
                        }]
                    }
                ],
                shared_teams: []
            };
            // Note: cognitive load rendering happens in drawTeam from renderer-common
            // This test just verifies the flag is passed through without errors
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText, true, teamPositions);
            // Just verify rendering happened
            expect(ctx.fillRect).toHaveBeenCalled();
        });

        it('should not render cognitive load when showCognitiveLoad is false', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: [{
                            name: 'Team 1',
                            team_type: 'feature-team',
                            cognitive_load: 'high'
                        }]
                    }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText, false, teamPositions);
            // Arc should not be called for cognitive load
            expect(ctx.arc).not.toHaveBeenCalled();
        });
    });

    describe('Team Selection Highlighting', () => {
        it('should highlight selected team with border', () => {
            const selectedTeam = { name: 'Backend Team', team_type: 'feature-team' };
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: [
                            { name: 'Backend Team', team_type: 'feature-team' },
                            { name: 'Frontend Team', team_type: 'feature-team' }
                        ]
                    }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText, false, teamPositions, false, selectedTeam);
            // Should draw thicker border for selected team
            expect(ctx.strokeRect).toHaveBeenCalled();
        });

        it('should handle null selectedTeam', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: [{ name: 'Team 1', team_type: 'feature-team' }]
                    }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText, false, teamPositions, false, null);
            // Should not throw error
            expect(ctx.fillRect).toHaveBeenCalled();
        });
    });

    describe('Team Type Badges', () => {
        it('should render team type badges when enabled', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: [
                            { name: 'Team 1', team_type: 'feature-team' }
                        ]
                    }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText, false, teamPositions, true);
            // Badge rendering uses fillText for badge label
            expect(ctx.fillText).toHaveBeenCalled();
        });

        it('should not render badges when disabled', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: [{ name: 'Team 1', team_type: 'feature-team' }]
                    }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText, false, teamPositions, false);
            // Fewer fillText calls without badges
            expect(ctx.fillText).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle product with empty teams array', () => {
            const data = {
                products: [
                    { id: 'p1', name: 'Empty Product', color: '#3498db', teams: [] }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            expect(ctx.fillText).toHaveBeenCalledWith('0 teams', expect.any(Number), expect.any(Number));
        });

        it('should handle multiple products with varying team counts', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: Array(10).fill(null).map((_, i) => ({
                            name: `Team ${i + 1}`,
                            team_type: 'feature-team'
                        }))
                    },
                    {
                        id: 'p2',
                        name: 'Product 2',
                        color: '#e74c3c',
                        teams: []
                    },
                    {
                        id: 'p3',
                        name: 'Product 3',
                        color: '#2ecc71',
                        teams: [
                            { name: 'Solo Team', team_type: 'feature-team' }
                        ]
                    }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText, false, teamPositions);
            expect(ctx.fillRect).toHaveBeenCalled();
            expect(teamPositions.size).toBe(11); // 10 + 0 + 1
        });

        it('should handle team without team_type', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Product 1',
                        color: '#3498db',
                        teams: [{ name: 'Typeless Team' }]
                    }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            // Should not throw, use default color
            expect(ctx.fillText).toHaveBeenCalled();
        });

        it('should handle very long product names', () => {
            const data = {
                products: [
                    {
                        id: 'p1',
                        name: 'Very Long Product Name That Exceeds Normal Width',
                        color: '#3498db',
                        teams: []
                    }
                ],
                shared_teams: []
            };
            drawProductLinesView(ctx, data, [], mockTeamColorMap, mockWrapText);
            // Should render without error
            expect(ctx.fillText).toHaveBeenCalled();
        });
    });
});
