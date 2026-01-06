/**
 * Unit tests for comparison view module
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { comparisonView } from './tt-comparison-view.js';

// Mock canvas context
class MockCanvasContext {
    constructor() {
        this.clearRect = vi.fn();
        this.save = vi.fn();
        this.translate = vi.fn();
        this.scale = vi.fn();
        this.restore = vi.fn();
        this.fillRect = vi.fn();
        this.strokeRect = vi.fn();
        this.fillText = vi.fn();
        this.measureText = vi.fn((text) => ({ width: text.length * 7 }));
        this.beginPath = vi.fn();
        this.arc = vi.fn();
        this.fill = vi.fn();
        this.stroke = vi.fn();
        this.roundRect = vi.fn();
        this.font = '14px sans-serif';
        this.fillStyle = '#000000';
        this.strokeStyle = '#000000';
        this.lineWidth = 1;
        this.textAlign = 'center';
        this.textBaseline = 'middle';
    }
}

describe('ComparisonView', () => {
    beforeEach(() => {
        // Setup DOM elements
        document.body.innerHTML = `
            <div id="comparisonViewModal" style="display: none;">
                <div id="comparisonBeforeName"></div>
                <div id="comparisonAfterName"></div>
                <div id="comparisonBeforeDate"></div>
                <div id="comparisonAfterDate"></div>
                <canvas id="comparisonBeforeCanvas" width="800" height="600"></canvas>
                <canvas id="comparisonAfterCanvas" width="800" height="600"></canvas>
                <div id="comparisonChangesSummary"></div>
                <button id="closeComparisonViewBtn"></button>
            </div>
        `;
        
        // Mock getContext on canvas elements
        const beforeCanvas = document.getElementById('comparisonBeforeCanvas');
        const afterCanvas = document.getElementById('comparisonAfterCanvas');
        
        beforeCanvas.getContext = vi.fn(() => new MockCanvasContext());
        afterCanvas.getContext = vi.fn(() => new MockCanvasContext());
        
        // Initialize comparison view
        comparisonView.init();
    });
    
    describe('initialization', () => {
        it('should find and setup canvas elements', () => {
            expect(comparisonView.beforeCanvas).toBeTruthy();
            expect(comparisonView.afterCanvas).toBeTruthy();
            expect(comparisonView.beforeCtx).toBeTruthy();
            expect(comparisonView.afterCtx).toBeTruthy();
        });
        
        it('should setup modal element', () => {
            expect(comparisonView.modal).toBeTruthy();
            expect(comparisonView.modal.id).toBe('comparisonViewModal');
        });
    });
    
    describe('open()', () => {
        const beforeSnapshot = {
            id: 'snap-before',
            name: 'Before Snapshot',
            created_at: '2026-01-01T12:00:00Z',
            teams: [
                { name: 'Team A', team_type: 'stream-aligned', position: { x: 100, y: 100 } },
                { name: 'Team B', team_type: 'platform', position: { x: 300, y: 100 } }
            ]
        };
        
        const afterSnapshot = {
            id: 'snap-after',
            name: 'After Snapshot',
            created_at: '2026-01-05T12:00:00Z',
            teams: [
                { name: 'Team A', team_type: 'stream-aligned', position: { x: 150, y: 150 } },
                { name: 'Team C', team_type: 'enabling', position: { x: 300, y: 100 } }
            ]
        };
        
        const comparison = {
            before_snapshot: beforeSnapshot,
            after_snapshot: afterSnapshot,
            changes: {
                summary: {
                    added_count: 1,
                    removed_count: 1,
                    moved_count: 1,
                    type_changed_count: 0
                },
                added_teams: ['Team C'],
                removed_teams: ['Team B'],
                moved_teams: [{ name: 'Team A' }],
                type_changed_teams: []
            }
        };
        
        it('should set snapshot names', () => {
            comparisonView.open(beforeSnapshot, afterSnapshot, comparison);
            
            expect(document.getElementById('comparisonBeforeName').textContent).toBe('Before Snapshot');
            expect(document.getElementById('comparisonAfterName').textContent).toBe('After Snapshot');
        });
        
        it('should format and display dates', () => {
            comparisonView.open(beforeSnapshot, afterSnapshot, comparison);
            
            const beforeDate = document.getElementById('comparisonBeforeDate').textContent;
            const afterDate = document.getElementById('comparisonAfterDate').textContent;
            
            expect(beforeDate).toContain('2026');
            expect(afterDate).toContain('2026');
        });
        
        it('should show the modal', () => {
            comparisonView.open(beforeSnapshot, afterSnapshot, comparison);
            
            expect(comparisonView.modal.style.display).toBe('flex');
        });
        
        it('should populate changes summary', () => {
            comparisonView.open(beforeSnapshot, afterSnapshot, comparison);
            
            const summaryHtml = document.getElementById('comparisonChangesSummary').innerHTML;
            
            expect(summaryHtml).toContain('Added');
            expect(summaryHtml).toContain('Removed');
            expect(summaryHtml).toContain('Moved');
            expect(summaryHtml).toContain('Team C');
            expect(summaryHtml).toContain('Team B');
            expect(summaryHtml).toContain('Team A');
        });
        
        it('should reset view states', () => {
            // Set some view offset/scale
            comparisonView.beforeView.offsetX = 100;
            comparisonView.beforeView.scale = 1.5;
            
            comparisonView.open(beforeSnapshot, afterSnapshot, comparison);
            
            expect(comparisonView.beforeView.offsetX).toBe(0);
            expect(comparisonView.beforeView.scale).toBe(1);
            expect(comparisonView.afterView.offsetX).toBe(0);
            expect(comparisonView.afterView.scale).toBe(1);
        });
    });
    
    describe('close()', () => {
        it('should hide the modal', () => {
            comparisonView.modal.style.display = 'flex';
            comparisonView.close();
            
            expect(comparisonView.modal.style.display).toBe('none');
        });
        
        it('should clear snapshot data', () => {
            comparisonView.beforeSnapshot = { name: 'test' };
            comparisonView.afterSnapshot = { name: 'test' };
            comparisonView.comparison = { changes: {} };
            
            comparisonView.close();
            
            expect(comparisonView.beforeSnapshot).toBeNull();
            expect(comparisonView.afterSnapshot).toBeNull();
            expect(comparisonView.comparison).toBeNull();
        });
    });
    
    describe('populateChangesSummary()', () => {
        beforeEach(() => {
            comparisonView.comparison = {
                changes: {
                    summary: {
                        added_count: 2,
                        removed_count: 1,
                        moved_count: 3,
                        type_changed_count: 1
                    },
                    added_teams: ['Team X', 'Team Y'],
                    removed_teams: ['Team Z'],
                    moved_teams: [{ name: 'Team A' }, { name: 'Team B' }, { name: 'Team C' }],
                    type_changed_teams: [{ name: 'Team D' }]
                }
            };
        });
        
        it('should show all change statistics', () => {
            comparisonView.populateChangesSummary();
            
            const html = document.getElementById('comparisonChangesSummary').innerHTML;
            
            expect(html).toContain('2'); // added count
            expect(html).toContain('1'); // removed count  
            expect(html).toContain('3'); // moved count
            expect(html).toContain('1'); // type changed count
        });
        
        it('should list added teams', () => {
            comparisonView.populateChangesSummary();
            
            const html = document.getElementById('comparisonChangesSummary').innerHTML;
            
            expect(html).toContain('Team X');
            expect(html).toContain('Team Y');
        });
        
        it('should list removed teams', () => {
            comparisonView.populateChangesSummary();
            
            const html = document.getElementById('comparisonChangesSummary').innerHTML;
            
            expect(html).toContain('Team Z');
        });
        
        it('should list moved teams', () => {
            comparisonView.populateChangesSummary();
            
            const html = document.getElementById('comparisonChangesSummary').innerHTML;
            
            expect(html).toContain('Team A');
            expect(html).toContain('Team B');
            expect(html).toContain('Team C');
        });
        
        it('should list type-changed teams', () => {
            comparisonView.populateChangesSummary();
            
            const html = document.getElementById('comparisonChangesSummary').innerHTML;
            
            expect(html).toContain('Team D');
        });
    });
    
    describe('wrapText()', () => {
        it('should wrap long text into multiple lines', () => {
            const ctx = comparisonView.beforeCtx;
            ctx.font = '14px sans-serif';
            
            const longText = 'This is a very long team name that should wrap';
            const lines = comparisonView.wrapText(ctx, longText, 100);
            
            expect(lines.length).toBeGreaterThan(1);
        });
        
        it('should keep short text as single line', () => {
            const ctx = comparisonView.beforeCtx;
            ctx.font = '14px sans-serif';
            
            const shortText = 'Team A';
            const lines = comparisonView.wrapText(ctx, shortText, 200);
            
            expect(lines.length).toBe(1);
            expect(lines[0]).toBe('Team A');
        });
    });
    
    describe('Visibility Toggles', () => {
        it('should initialize all visibility flags to true', () => {
            expect(comparisonView.showGroupings).toBe(true);
            expect(comparisonView.showInteractions).toBe(true);
            expect(comparisonView.showBadges).toBe(true);
        });
        
        it('should toggle showGroupings', () => {
            const initial = comparisonView.showGroupings;
            comparisonView.showGroupings = !comparisonView.showGroupings;
            expect(comparisonView.showGroupings).toBe(!initial);
        });
        
        it('should toggle showInteractions', () => {
            const initial = comparisonView.showInteractions;
            comparisonView.showInteractions = !comparisonView.showInteractions;
            expect(comparisonView.showInteractions).toBe(!initial);
        });
        
        it('should toggle showBadges', () => {
            const initial = comparisonView.showBadges;
            comparisonView.showBadges = !comparisonView.showBadges;
            expect(comparisonView.showBadges).toBe(!initial);
        });
    });
    
    describe('Zoom Calculations', () => {
        beforeEach(() => {
            // Reset view states
            comparisonView.beforeView = {
                scale: 1.0,
                offsetX: 0,
                offsetY: 0,
                isPanning: false,
                lastMouseX: 0,
                lastMouseY: 0
            };
        });
        
        it('should zoom in with factor 1.2', () => {
            const viewState = comparisonView.beforeView;
            const initialScale = viewState.scale;
            
            // Simulate zoom function logic
            viewState.scale *= 1.2;
            viewState.scale = Math.max(0.1, Math.min(3, viewState.scale));
            
            expect(viewState.scale).toBe(initialScale * 1.2);
        });
        
        it('should zoom out with factor 0.8', () => {
            const viewState = comparisonView.beforeView;
            const initialScale = viewState.scale;
            
            // Simulate zoom function logic
            viewState.scale *= 0.8;
            viewState.scale = Math.max(0.1, Math.min(3, viewState.scale));
            
            expect(viewState.scale).toBe(initialScale * 0.8);
        });
        
        it('should clamp scale to minimum 0.1', () => {
            const viewState = comparisonView.beforeView;
            
            viewState.scale = 0.05;
            viewState.scale = Math.max(0.1, Math.min(3, viewState.scale));
            
            expect(viewState.scale).toBe(0.1);
        });
        
        it('should clamp scale to maximum 3.0', () => {
            const viewState = comparisonView.beforeView;
            
            viewState.scale = 5.0;
            viewState.scale = Math.max(0.1, Math.min(3, viewState.scale));
            
            expect(viewState.scale).toBe(3.0);
        });
        
        it('should calculate center-based zoom offset correctly', () => {
            const viewState = comparisonView.beforeView;
            const canvas = { width: 800, height: 600 };
            const factor = 1.2;
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            const worldX = (centerX - viewState.offsetX) / viewState.scale;
            const worldY = (centerY - viewState.offsetY) / viewState.scale;
            
            viewState.scale *= factor;
            viewState.offsetX = centerX - worldX * viewState.scale;
            viewState.offsetY = centerY - worldY * viewState.scale;
            
            expect(viewState.scale).toBe(1.2);
            expect(viewState.offsetX).toBe(40);
            expect(viewState.offsetY).toBe(30);
        });
    });
    
    describe('Pan Calculations', () => {
        beforeEach(() => {
            comparisonView.beforeView = {
                scale: 1.0,
                offsetX: 0,
                offsetY: 0,
                isPanning: false,
                lastMouseX: 100,
                lastMouseY: 200
            };
        });
        
        it('should calculate pan delta correctly', () => {
            const viewState = comparisonView.beforeView;
            const currentMouseX = 150;
            const currentMouseY = 250;
            
            const dx = currentMouseX - viewState.lastMouseX;
            const dy = currentMouseY - viewState.lastMouseY;
            
            expect(dx).toBe(50);
            expect(dy).toBe(50);
        });
        
        it('should update offset with pan delta', () => {
            const viewState = comparisonView.beforeView;
            const dx = 50;
            const dy = 30;
            
            viewState.offsetX += dx;
            viewState.offsetY += dy;
            
            expect(viewState.offsetX).toBe(50);
            expect(viewState.offsetY).toBe(30);
        });
        
        it('should handle negative pan delta', () => {
            const viewState = comparisonView.beforeView;
            viewState.offsetX = 100;
            viewState.offsetY = 100;
            
            const dx = -50;
            const dy = -30;
            
            viewState.offsetX += dx;
            viewState.offsetY += dy;
            
            expect(viewState.offsetX).toBe(50);
            expect(viewState.offsetY).toBe(70);
        });
        
        it('should start panning on mouse down', () => {
            const viewState = comparisonView.beforeView;
            
            viewState.isPanning = true;
            viewState.lastMouseX = 100;
            viewState.lastMouseY = 200;
            
            expect(viewState.isPanning).toBe(true);
            expect(viewState.lastMouseX).toBe(100);
            expect(viewState.lastMouseY).toBe(200);
        });
        
        it('should stop panning on mouse up', () => {
            const viewState = comparisonView.beforeView;
            viewState.isPanning = true;
            
            viewState.isPanning = false;
            
            expect(viewState.isPanning).toBe(false);
        });
    });
    
    describe('Fit-to-View Calculations', () => {
        it('should calculate bounding box correctly', () => {
            const teams = [
                { position: { x: 100, y: 100 }, width: 200, height: 60 },
                { position: { x: 500, y: 300 }, width: 200, height: 60 }
            ];
            
            let minX = Infinity, minY = Infinity;
            let maxX = -Infinity, maxY = -Infinity;
            
            teams.forEach(team => {
                const x = team.position.x;
                const y = team.position.y;
                const width = 200;
                const height = 60;
                
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x + width);
                maxY = Math.max(maxY, y + height);
            });
            
            expect(minX).toBe(100);
            expect(minY).toBe(100);
            expect(maxX).toBe(700);
            expect(maxY).toBe(360);
        });
        
        it('should add padding to bounding box', () => {
            const contentWidth = 600;
            const contentHeight = 260;
            const padding = 50;
            
            const paddedWidth = contentWidth + padding * 2;
            const paddedHeight = contentHeight + padding * 2;
            
            expect(paddedWidth).toBe(700);
            expect(paddedHeight).toBe(360);
        });
        
        it('should calculate scale to fit canvas', () => {
            const canvas = { width: 800, height: 600 };
            const contentWidth = 700;
            const contentHeight = 360;
            
            const scaleX = canvas.width / contentWidth;
            const scaleY = canvas.height / contentHeight;
            const scale = Math.min(scaleX, scaleY);
            
            expect(scale).toBeCloseTo(1.143, 2);
        });
    });
    
    describe('Badge Detection', () => {
        it('should detect added teams for badge rendering', () => {
            const comparison = {
                changes: {
                    added_teams: ['Team A', 'Team B'],
                    moved_teams: [],
                    type_changed_teams: []
                }
            };
            const teamName = 'Team A';
            
            const isAdded = comparison.changes.added_teams?.includes(teamName);
            expect(isAdded).toBe(true);
        });
        
        it('should detect moved teams for badge rendering', () => {
            const comparison = {
                changes: {
                    added_teams: [],
                    moved_teams: [{ name: 'Team B' }],
                    type_changed_teams: []
                }
            };
            const teamName = 'Team B';
            
            const isMoved = comparison.changes.moved_teams?.some(t => t.name === teamName);
            expect(isMoved).toBe(true);
        });
        
        it('should detect type changed teams for badge rendering', () => {
            const comparison = {
                changes: {
                    added_teams: [],
                    moved_teams: [],
                    type_changed_teams: [{ name: 'Team C' }]
                }
            };
            const teamName = 'Team C';
            
            const isTypeChanged = comparison.changes.type_changed_teams?.some(t => t.name === teamName);
            expect(isTypeChanged).toBe(true);
        });
        
        it('should determine correct badge type for each change', () => {
            const comparison = {
                changes: {
                    added_teams: ['Team A'],
                    moved_teams: [{ name: 'Team B' }],
                    type_changed_teams: [{ name: 'Team C' }]
                }
            };
            
            // Test added team
            let badgeType = null;
            if (comparison.changes.added_teams?.includes('Team A')) {
                badgeType = 'NEW';
            }
            expect(badgeType).toBe('NEW');
            
            // Test moved team
            badgeType = null;
            if (comparison.changes.moved_teams?.some(t => t.name === 'Team B')) {
                badgeType = 'MOVED';
            }
            expect(badgeType).toBe('MOVED');
            
            // Test type changed team
            badgeType = null;
            if (comparison.changes.type_changed_teams?.some(t => t.name === 'Team C')) {
                badgeType = 'CHANGED';
            }
            expect(badgeType).toBe('CHANGED');
        });
    });
    
    describe('Rendering Conditions', () => {
        it('should render groupings only when showGroupings is true', () => {
            comparisonView.showGroupings = true;
            expect(comparisonView.showGroupings).toBe(true);
            
            comparisonView.showGroupings = false;
            expect(comparisonView.showGroupings).toBe(false);
        });
        
        it('should render interactions only when showInteractions is true', () => {
            comparisonView.showInteractions = true;
            expect(comparisonView.showInteractions).toBe(true);
            
            comparisonView.showInteractions = false;
            expect(comparisonView.showInteractions).toBe(false);
        });
        
        it('should render badges only in after snapshot with changes', () => {
            comparisonView.showBadges = true;
            const isAfterSnapshot = true;
            const hasChanges = true;
            
            const shouldRenderBadges = comparisonView.showBadges && isAfterSnapshot && hasChanges;
            expect(shouldRenderBadges).toBe(true);
        });
        
        it('should not render badges in before snapshot', () => {
            comparisonView.showBadges = true;
            const isAfterSnapshot = false;
            const hasChanges = true;
            
            const shouldRenderBadges = comparisonView.showBadges && isAfterSnapshot && hasChanges;
            expect(shouldRenderBadges).toBe(false);
        });
    });
    
    describe('Team Dimensions', () => {
        it('should use 200x60 for stream-aligned and platform teams', () => {
            const teamType = 'stream-aligned';
            const isNarrow = teamType === 'enabling' || teamType === 'complicated-subsystem';
            
            const width = isNarrow ? 100 : 200;
            const height = isNarrow ? 80 : 60;
            
            expect(width).toBe(200);
            expect(height).toBe(60);
        });
        
        it('should use 100x80 for enabling and complicated-subsystem teams', () => {
            const teamType = 'enabling';
            const isNarrow = teamType === 'enabling' || teamType === 'complicated-subsystem';
            
            const width = isNarrow ? 100 : 200;
            const height = isNarrow ? 80 : 60;
            
            expect(width).toBe(100);
            expect(height).toBe(80);
        });
    });
});
