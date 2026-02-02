/**
 * Unit tests for baseline-hierarchy.js (Hierarchy View rendering)
 * Tests organization hierarchy rendering with line_managers and regions
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { drawBaselineHierarchyView } from './baseline-hierarchy.js';

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
        setLineDash: vi.fn(),
        measureText: (text) => ({ width: text.length * 8 })
    };
}

// Simple wrapText mock
function mockWrapText(text, maxWidth) {
    if (!text || typeof text !== 'string') return [''];
    // Simple mock: just return the text as-is
    return [text];
}

describe('drawBaselineHierarchyView', () => {
    let ctx;

    beforeEach(() => {
        ctx = createMockContext();
    });

    it('should handle null organization hierarchy', () => {
        drawBaselineHierarchyView(ctx, null, [], mockWrapText);
        // Should not crash and should not draw anything
        expect(ctx.fillText).not.toHaveBeenCalled();
    });

    it('should draw company leadership box', () => {
        const orgHierarchy = {
            company: {
                name: 'Company Leadership',
                children: []
            }
        };
        drawBaselineHierarchyView(ctx, orgHierarchy, [], mockWrapText);
        
        // Should draw title and company box
        const fillTextCalls = ctx.fillText.mock.calls.map(call => call[0]);
        expect(fillTextCalls).toContain('Hierarchy View');
        expect(fillTextCalls).toContain('Company Leadership');
    });

    it('should draw departments', () => {
        const orgHierarchy = {
            company: {
                name: 'Company Leadership',
                children: [
                    { id: 'dept1', name: 'Engineering Department' },
                    { id: 'dept2', name: 'Product Department' }
                ]
            }
        };
        drawBaselineHierarchyView(ctx, orgHierarchy, [], mockWrapText);
        
        const fillTextCalls = ctx.fillText.mock.calls.map(call => call[0]);
        expect(fillTextCalls).toContain('Engineering Department');
        expect(fillTextCalls).toContain('Product Department');
    });

    it('should draw line_managers under departments', () => {
        const orgHierarchy = {
            company: {
                name: 'Company Leadership',
                children: [
                    {
                        id: 'engineering-dept',
                        name: 'Engineering Department',
                        line_managers: [
                            { name: 'Backend Team Manager', teams: [] },
                            { name: 'Frontend Team Manager', teams: [] }
                        ]
                    }
                ]
            }
        };
        drawBaselineHierarchyView(ctx, orgHierarchy, [], mockWrapText);
        
        const fillTextCalls = ctx.fillText.mock.calls.map(call => call[0]);
        expect(fillTextCalls).toContain('Backend Team Manager');
        expect(fillTextCalls).toContain('Frontend Team Manager');
    });

    it('should draw regions under departments', () => {
        const orgHierarchy = {
            company: {
                name: 'Company Leadership',
                children: [
                    {
                        id: 'customer-solutions-dept',
                        name: 'Customer Solutions Department',
                        regions: [
                            { name: 'EMEA Region', teams: [] },
                            { name: 'APAC Region', teams: [] }
                        ]
                    }
                ]
            }
        };
        drawBaselineHierarchyView(ctx, orgHierarchy, [], mockWrapText);
        
        const fillTextCalls = ctx.fillText.mock.calls.map(call => call[0]);
        expect(fillTextCalls).toContain('EMEA Region');
        expect(fillTextCalls).toContain('APAC Region');
    });

    it('should draw lines from department to line_managers', () => {
        const orgHierarchy = {
            company: {
                name: 'Company Leadership',
                children: [
                    {
                        id: 'engineering-dept',
                        name: 'Engineering Department',
                        line_managers: [
                            { name: 'Team Manager', teams: [] }
                        ]
                    }
                ]
            }
        };
        drawBaselineHierarchyView(ctx, orgHierarchy, [], mockWrapText);
        
        // Should have called lineTo multiple times (for connecting lines)
        expect(ctx.lineTo.mock.calls.length).toBeGreaterThan(0);
    });

    it('should draw org-chart lines to teams under line_managers', () => {
        const teams = [
            { name: 'Backend Team', position: { x: 100, y: 200 } }
        ];
        const orgHierarchy = {
            company: {
                name: 'Company Leadership',
                children: [
                    {
                        id: 'engineering-dept',
                        name: 'Engineering Department',
                        line_managers: [
                            { name: 'Team Manager', teams: ['Backend Team'] }
                        ]
                    }
                ]
            }
        };
        drawBaselineHierarchyView(ctx, orgHierarchy, teams, mockWrapText);
        
        // Should draw vertical and horizontal connector lines
        expect(ctx.lineTo.mock.calls.length).toBeGreaterThan(4); // Multiple lines for connections
    });

    it('should draw org-chart lines to teams under regions', () => {
        const teams = [
            { name: 'Support Team EMEA', position: { x: 150, y: 250 } }
        ];
        const orgHierarchy = {
            company: {
                name: 'Company Leadership',
                children: [
                    {
                        id: 'customer-solutions-dept',
                        name: 'Customer Solutions Department',
                        regions: [
                            { name: 'EMEA Region', teams: ['Support Team EMEA'] }
                        ]
                    }
                ]
            }
        };
        drawBaselineHierarchyView(ctx, orgHierarchy, teams, mockWrapText);
        
        // Should draw vertical and horizontal connector lines
        expect(ctx.lineTo.mock.calls.length).toBeGreaterThan(4);
    });

    it('should handle departments with both line_managers and regions (any department ID)', () => {
        // AFTER REFACTORING: Works with ANY department ID
        const orgHierarchy = {
            company: {
                name: 'Company Leadership',
                children: [
                    {
                        id: 'engineering-dept',
                        name: 'Engineering Department',
                        line_managers: [
                            { name: 'Team Manager', teams: [] }
                        ]
                    },
                    {
                        id: 'customer-solutions-dept',
                        name: 'Customer Solutions Department',
                        regions: [
                            { name: 'EMEA Region', teams: [] }
                        ]
                    }
                ]
            }
        };
        drawBaselineHierarchyView(ctx, orgHierarchy, [], mockWrapText);
        
        const fillTextCalls = ctx.fillText.mock.calls.map(call => call[0]);
        expect(fillTextCalls).toContain('Team Manager');
        expect(fillTextCalls).toContain('EMEA Region');
    });

    it('should draw line_managers with ANY department ID (generic support)', () => {
        // AFTER REFACTORING: This now works with any department ID!
        const orgHierarchy = {
            company: {
                name: 'Company Leadership',
                children: [
                    {
                        id: 'custom-dept-id', // Generic ID - now works!
                        name: 'Custom Department',
                        line_managers: [
                            { name: 'Team Manager', teams: [] }
                        ]
                    }
                ]
            }
        };
        drawBaselineHierarchyView(ctx, orgHierarchy, [], mockWrapText);
        
        const fillTextCalls = ctx.fillText.mock.calls.map(call => call[0]);
        // This now passes after refactoring!
        expect(fillTextCalls).toContain('Team Manager');
    });

    it('should handle multiple teams under line_manager', () => {
        const teams = [
            { name: 'Backend Team', position: { x: 100, y: 200 } },
            { name: 'Frontend Team', position: { x: 150, y: 250 } },
            { name: 'Mobile Team', position: { x: 200, y: 300 } }
        ];
        const orgHierarchy = {
            company: {
                name: 'Company Leadership',
                children: [
                    {
                        id: 'engineering-dept',
                        name: 'Engineering Department',
                        line_managers: [
                            { name: 'Team Manager', teams: ['Backend Team', 'Frontend Team', 'Mobile Team'] }
                        ]
                    }
                ]
            }
        };
        drawBaselineHierarchyView(ctx, orgHierarchy, teams, mockWrapText);
        
        // Should draw main vertical line and 3 horizontal connectors
        expect(ctx.lineTo.mock.calls.length).toBeGreaterThan(10); // Many connection lines
    });

    it('should handle multiple teams under region', () => {
        const teams = [
            { name: 'Support Team EMEA 1', position: { x: 100, y: 200 } },
            { name: 'Support Team EMEA 2', position: { x: 150, y: 250 } }
        ];
        const orgHierarchy = {
            company: {
                name: 'Company Leadership',
                children: [
                    {
                        id: 'customer-solutions-dept',
                        name: 'Customer Solutions Department',
                        regions: [
                            { name: 'EMEA Region', teams: ['Support Team EMEA 1', 'Support Team EMEA 2'] }
                        ]
                    }
                ]
            }
        };
        drawBaselineHierarchyView(ctx, orgHierarchy, teams, mockWrapText);
        
        // Should draw main vertical line and 2 horizontal connectors
        expect(ctx.lineTo.mock.calls.length).toBeGreaterThan(8);
    });

    it('should filter out undefined teams', () => {
        const teams = [
            { name: 'Backend Team', position: { x: 100, y: 200 } }
            // 'Nonexistent Team' is not in the teams array
        ];
        const orgHierarchy = {
            company: {
                name: 'Company Leadership',
                children: [
                    {
                        id: 'engineering-dept',
                        name: 'Engineering Department',
                        line_managers: [
                            { name: 'Team Manager', teams: ['Backend Team', 'Nonexistent Team'] }
                        ]
                    }
                ]
            }
        };
        drawBaselineHierarchyView(ctx, orgHierarchy, teams, mockWrapText);
        
        // Should not crash, should only draw lines for the one team that exists
        expect(ctx.lineTo.mock.calls.length).toBeGreaterThan(0);
    });

    it('should handle empty line_managers teams array', () => {
        const orgHierarchy = {
            company: {
                name: 'Company Leadership',
                children: [
                    {
                        id: 'engineering-dept',
                        name: 'Engineering Department',
                        line_managers: [
                            { name: 'Team Manager', teams: [] }
                        ]
                    }
                ]
            }
        };
        drawBaselineHierarchyView(ctx, orgHierarchy, [], mockWrapText);
        
        // Should draw line manager box but no team connections
        const fillTextCalls = ctx.fillText.mock.calls.map(call => call[0]);
        expect(fillTextCalls).toContain('Team Manager');
    });

    it('should handle empty regions teams array', () => {
        const orgHierarchy = {
            company: {
                name: 'Company Leadership',
                children: [
                    {
                        id: 'customer-solutions-dept',
                        name: 'Customer Solutions Department',
                        regions: [
                            { name: 'EMEA Region', teams: [] }
                        ]
                    }
                ]
            }
        };
        drawBaselineHierarchyView(ctx, orgHierarchy, [], mockWrapText);
        
        // Should draw region box but no team connections
        const fillTextCalls = ctx.fillText.mock.calls.map(call => call[0]);
        expect(fillTextCalls).toContain('EMEA Region');
    });
});
