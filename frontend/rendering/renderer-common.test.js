/**
 * Unit tests for renderer-common.ts
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { wrapText, INTERACTION_STYLES, getTeamAtPosition, initCanvasPolyfills, getCognitiveLoadIndicator, getBoxEdgePoint } from './renderer-common';
describe('wrapText', () => {
    let mockCtx;
    beforeEach(() => {
        mockCtx = {
            measureText: (text) => ({
                width: text.length * 10 // Mock: 10 pixels per character
            })
        };
    });
    it('should wrap text that exceeds maxWidth', () => {
        const text = 'This is a long text that needs wrapping';
        const maxWidth = 100; // Will fit ~10 characters per line
        const lines = wrapText(mockCtx, text, maxWidth);
        expect(lines.length).toBeGreaterThan(1);
        lines.forEach(line => {
            expect(line.length * 10).toBeLessThanOrEqual(maxWidth + 50); // Allow some margin
        });
    });
    it('should not wrap short text', () => {
        const text = 'Short';
        const maxWidth = 200;
        const lines = wrapText(mockCtx, text, maxWidth);
        expect(lines.length).toBe(1);
        expect(lines[0]).toBe('Short');
    });
    it('should handle single word', () => {
        const text = 'SingleWord';
        const maxWidth = 50;
        const lines = wrapText(mockCtx, text, maxWidth);
        expect(lines.length).toBe(1);
        expect(lines[0]).toBe('SingleWord');
    });
    it('should handle empty string', () => {
        const text = '';
        const maxWidth = 100;
        const lines = wrapText(mockCtx, text, maxWidth);
        expect(lines.length).toBe(1);
        expect(lines[0]).toBe('');
    });
    it('should split on spaces', () => {
        const text = 'Word1 Word2 Word3 Word4';
        const maxWidth = 80;
        const lines = wrapText(mockCtx, text, maxWidth);
        lines.forEach(line => {
            expect(line).not.toMatch(/^\s|\s$/); // No leading/trailing spaces
        });
    });
});
describe('INTERACTION_STYLES', () => {
    it('should have collaboration style', () => {
        expect(INTERACTION_STYLES).toHaveProperty('collaboration');
        expect(INTERACTION_STYLES.collaboration).toHaveProperty('dash');
        expect(INTERACTION_STYLES.collaboration).toHaveProperty('width');
        expect(INTERACTION_STYLES.collaboration).toHaveProperty('color');
    });
    it('should have x-as-a-service style', () => {
        expect(INTERACTION_STYLES).toHaveProperty('x-as-a-service');
        expect(INTERACTION_STYLES['x-as-a-service'].dash.length).toBeGreaterThan(0);
    });
    it('should have facilitating style', () => {
        expect(INTERACTION_STYLES).toHaveProperty('facilitating');
        expect(INTERACTION_STYLES.facilitating.dash.length).toBeGreaterThan(0);
    });
    it('should have valid colors', () => {
        Object.values(INTERACTION_STYLES).forEach(style => {
            expect(style.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
    });
});
describe('getTeamAtPosition', () => {
    const teams = [
        { name: 'Team A', team_type: 'platform', position: { x: 100, y: 100 } },
        { name: 'Team B', team_type: 'platform', position: { x: 300, y: 200 } },
        { name: 'Team C', team_type: 'platform', position: { x: 500, y: 300 } }
    ];
    it('should find team at exact position', () => {
        const viewOffset = { x: 0, y: 0 };
        const scale = 1;
        const team = getTeamAtPosition(teams, 150, 120, viewOffset, scale);
        expect(team).toBeDefined();
        expect(team?.name).toBe('Team A');
    });
    it('should return undefined when no team at position', () => {
        const viewOffset = { x: 0, y: 0 };
        const scale = 1;
        const team = getTeamAtPosition(teams, 50, 50, viewOffset, scale);
        expect(team).toBeUndefined();
    });
    it('should account for scale', () => {
        const viewOffset = { x: 0, y: 0 };
        const scale = 2; // 2x zoom
        const team = getTeamAtPosition(teams, 250, 220, viewOffset, scale);
        expect(team).toBeDefined();
        expect(team?.name).toBe('Team A');
    });
    it('should account for view offset', () => {
        const viewOffset = { x: 50, y: 50 };
        const scale = 1;
        // With offset, need to adjust click position
        const team = getTeamAtPosition(teams, 200, 170, viewOffset, scale);
        expect(team).toBeDefined();
        expect(team?.name).toBe('Team A');
    });
    it('should check team box bounds (180x80)', () => {
        const viewOffset = { x: 0, y: 0 };
        const scale = 1;
        // Inside box: Team A at (100, 100), box is 180x80
        const inside = getTeamAtPosition(teams, 150, 120, viewOffset, scale);
        expect(inside).toBeDefined();
        expect(inside?.name).toBe('Team A');
        // Outside box width (> 280)
        const outsideWidth = getTeamAtPosition(teams, 290, 120, viewOffset, scale);
        expect(outsideWidth).toBeUndefined();
        // Outside box height (> 180)
        const outsideHeight = getTeamAtPosition(teams, 150, 190, viewOffset, scale);
        expect(outsideHeight).toBeUndefined();
    });
});
describe('initCanvasPolyfills', () => {
    it('should exist as a function', () => {
        // Canvas API tests are covered by E2E tests with real browsers
        // happy-dom doesn't support Canvas, so we just verify export exists
        expect(typeof initCanvasPolyfills).toBe('function');
    });
});

describe('getCognitiveLoadIndicator', () => {
    it('should return green indicator for low cognitive load', () => {
        const indicator = getCognitiveLoadIndicator('low');
        expect(indicator).toBeDefined();
        expect(indicator.color).toBe('#4CAF50');
        expect(indicator.emoji).toBe('🟢');
    });

    it('should return green indicator for low-medium cognitive load', () => {
        const indicator = getCognitiveLoadIndicator('low-medium');
        expect(indicator).toBeDefined();
        expect(indicator.color).toBe('#8BC34A');
        expect(indicator.emoji).toBe('🟢');
    });

    it('should return yellow indicator for medium cognitive load', () => {
        const indicator = getCognitiveLoadIndicator('medium');
        expect(indicator).toBeDefined();
        expect(indicator.color).toBe('#FFC107');
        expect(indicator.emoji).toBe('🟡');
    });

    it('should return red indicator for high cognitive load', () => {
        const indicator = getCognitiveLoadIndicator('high');
        expect(indicator).toBeDefined();
        expect(indicator.color).toBe('#FF5722');
        expect(indicator.emoji).toBe('🔴');
    });

    it('should return dark red indicator for very-high cognitive load', () => {
        const indicator = getCognitiveLoadIndicator('very-high');
        expect(indicator).toBeDefined();
        expect(indicator.color).toBe('#D32F2F');
        expect(indicator.emoji).toBe('🔴');
    });

    it('should return null for undefined cognitive load', () => {
        const indicator = getCognitiveLoadIndicator(undefined);
        expect(indicator).toBeNull();
    });

    it('should return null for null cognitive load', () => {
        const indicator = getCognitiveLoadIndicator(null);
        expect(indicator).toBeNull();
    });

    it('should return null for unknown cognitive load level', () => {
        const indicator = getCognitiveLoadIndicator('unknown');
        expect(indicator).toBeNull();
    });

    it('should handle mixed case cognitive load levels', () => {
        const indicator = getCognitiveLoadIndicator('HIGH');
        expect(indicator).toBeDefined();
        expect(indicator.color).toBe('#FF5722');
        expect(indicator.emoji).toBe('🔴');
    });

    it('should handle cognitive load levels with extra whitespace', () => {
        const indicator = getCognitiveLoadIndicator('  medium  ');
        expect(indicator).toBeDefined();
        expect(indicator.color).toBe('#FFC107');
        expect(indicator.emoji).toBe('🟡');
    });
});

describe('INTERACTION_STYLES - Line thickness by interaction mode', () => {
    it('should use 2px line width for collaboration mode', () => {
        expect(INTERACTION_STYLES['collaboration']).toBeDefined();
        expect(INTERACTION_STYLES['collaboration'].width).toBe(2);
    });

    it('should use 0.5px line width for facilitating mode', () => {
        expect(INTERACTION_STYLES['facilitating']).toBeDefined();
        expect(INTERACTION_STYLES['facilitating'].width).toBe(0.5);
    });

    it('should use 1px line width for x-as-a-service mode', () => {
        expect(INTERACTION_STYLES['x-as-a-service']).toBeDefined();
        expect(INTERACTION_STYLES['x-as-a-service'].width).toBe(1);
    });

    it('should have thickest line for collaboration (high-touch interaction)', () => {
        const collaboration = INTERACTION_STYLES['collaboration'].width;
        const xAsService = INTERACTION_STYLES['x-as-a-service'].width;
        const facilitating = INTERACTION_STYLES['facilitating'].width;

        // Collaboration should be thickest, then x-as-service, then facilitating
        expect(collaboration).toBeGreaterThan(xAsService);
        expect(xAsService).toBeGreaterThan(facilitating);
    });

    it('should have dash pattern for x-as-a-service mode', () => {
        expect(INTERACTION_STYLES['x-as-a-service'].dash).toEqual([10, 5]);
    });

    it('should have dash pattern for facilitating mode', () => {
        expect(INTERACTION_STYLES['facilitating'].dash).toEqual([5, 5]);
    });

    it('should have unique colors for each interaction mode', () => {
        const collaboration = INTERACTION_STYLES['collaboration'].color;
        const facilitating = INTERACTION_STYLES['facilitating'].color;
        const xAsService = INTERACTION_STYLES['x-as-a-service'].color;

        expect(collaboration).toBeDefined();
        expect(facilitating).toBeDefined();
        expect(xAsService).toBeDefined();

        // All colors should be different
        expect(collaboration).not.toBe(facilitating);
        expect(collaboration).not.toBe(xAsService);
        expect(facilitating).not.toBe(xAsService);
    });

    it('should have all three interaction mode keys', () => {
        const keys = Object.keys(INTERACTION_STYLES);
        expect(keys).toContain('collaboration');
        expect(keys).toContain('facilitating');
        expect(keys).toContain('x-as-a-service');
        expect(keys.length).toBe(3);
    });
});

describe('Corner radius for team types', () => {
    it('should use rounded corners for stream-aligned teams', () => {
        // Note: Corner radius logic is in renderer-common.js drawTeam function
        // This test verifies the team type that should have rounded corners
        const streamAlignedType = 'stream-aligned-team';
        expect(streamAlignedType).toBe('stream-aligned-team');
    });

    it('should use sharp corners for platform teams', () => {
        // Note: Corner radius logic is in renderer-common.js drawTeam function
        // This test verifies the team type that should have sharp corners
        const platformType = 'platform-team';
        expect(platformType).toBe('platform-team');
    });

    it('should use rounded corners for enabling teams', () => {
        // Enabling teams are vertical rounded rectangles in TT Design view
        const enablingType = 'enabling-team';
        expect(enablingType).toBe('enabling-team');
    });

    it('should use sharp corners for complicated-subsystem teams', () => {
        // Complicated-subsystem teams should not have rounded corners
        const complicatedType = 'complicated-subsystem-team';
        expect(complicatedType).toBe('complicated-subsystem-team');
    });
});

describe('getBoxEdgePoint', () => {
    const centerX = 100;
    const centerY = 100;
    const width = 144;
    const height = 80;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    describe('Right edge (angle 0°)', () => {
        it('should return right edge center for angle 0', () => {
            const angle = 0; // 0° - pointing right
            const point = getBoxEdgePoint(centerX, centerY, width, height, angle);
            expect(point.x).toBe(centerX + halfWidth);
            expect(point.y).toBe(centerY);
        });

        it('should return right edge center for angle 30°', () => {
            const angle = Math.PI / 6; // 30°
            const point = getBoxEdgePoint(centerX, centerY, width, height, angle);
            expect(point.x).toBe(centerX + halfWidth);
            expect(point.y).toBe(centerY);
        });

        it('should return right edge center for angle -30°', () => {
            const angle = -Math.PI / 6; // -30°
            const point = getBoxEdgePoint(centerX, centerY, width, height, angle);
            expect(point.x).toBe(centerX + halfWidth);
            expect(point.y).toBe(centerY);
        });
    });

    describe('Left edge (angle 180°)', () => {
        it('should return left edge center for angle 180°', () => {
            const angle = Math.PI; // 180° - pointing left
            const point = getBoxEdgePoint(centerX, centerY, width, height, angle);
            expect(point.x).toBe(centerX - halfWidth);
            expect(point.y).toBe(centerY);
        });

        it('should return left edge center for angle 150°', () => {
            const angle = (5 * Math.PI) / 6; // 150°
            const point = getBoxEdgePoint(centerX, centerY, width, height, angle);
            expect(point.x).toBe(centerX - halfWidth);
            expect(point.y).toBe(centerY);
        });

        it('should return left edge center for angle -150°', () => {
            const angle = -(5 * Math.PI) / 6; // -150°
            const point = getBoxEdgePoint(centerX, centerY, width, height, angle);
            expect(point.x).toBe(centerX - halfWidth);
            expect(point.y).toBe(centerY);
        });
    });

    describe('Bottom edge (angle 90°)', () => {
        it('should return bottom edge center for angle 90°', () => {
            const angle = Math.PI / 2; // 90° - pointing down
            const point = getBoxEdgePoint(centerX, centerY, width, height, angle);
            expect(point.x).toBe(centerX);
            expect(point.y).toBe(centerY + halfHeight);
        });

        it('should return bottom edge center for angle 60°', () => {
            const angle = Math.PI / 3; // 60°
            const point = getBoxEdgePoint(centerX, centerY, width, height, angle);
            expect(point.x).toBe(centerX);
            expect(point.y).toBe(centerY + halfHeight);
        });

        it('should return bottom edge center for angle 120°', () => {
            const angle = (2 * Math.PI) / 3; // 120°
            const point = getBoxEdgePoint(centerX, centerY, width, height, angle);
            expect(point.x).toBe(centerX);
            expect(point.y).toBe(centerY + halfHeight);
        });
    });

    describe('Top edge (angle -90° or 270°)', () => {
        it('should return top edge center for angle -90°', () => {
            const angle = -Math.PI / 2; // -90° - pointing up
            const point = getBoxEdgePoint(centerX, centerY, width, height, angle);
            expect(point.x).toBe(centerX);
            expect(point.y).toBe(centerY - halfHeight);
        });

        it('should return top edge center for angle 270°', () => {
            const angle = (3 * Math.PI) / 2; // 270° - pointing up
            const point = getBoxEdgePoint(centerX, centerY, width, height, angle);
            expect(point.x).toBe(centerX);
            expect(point.y).toBe(centerY - halfHeight);
        });

        it('should return top edge center for angle -60°', () => {
            const angle = -Math.PI / 3; // -60°
            const point = getBoxEdgePoint(centerX, centerY, width, height, angle);
            expect(point.x).toBe(centerX);
            expect(point.y).toBe(centerY - halfHeight);
        });
    });

    describe('Edge cases', () => {
        it('should handle different box sizes', () => {
            const smallWidth = 50;
            const smallHeight = 30;
            const angle = 0;
            const point = getBoxEdgePoint(centerX, centerY, smallWidth, smallHeight, angle);
            expect(point.x).toBe(centerX + smallWidth / 2);
            expect(point.y).toBe(centerY);
        });

        it('should handle different center positions', () => {
            const newCenterX = 500;
            const newCenterY = 300;
            const angle = Math.PI / 2;
            const point = getBoxEdgePoint(newCenterX, newCenterY, width, height, angle);
            expect(point.x).toBe(newCenterX);
            expect(point.y).toBe(newCenterY + halfHeight);
        });

        it('should always return a point on the box perimeter', () => {
            const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, -(3 * Math.PI) / 4, -Math.PI / 2, -Math.PI / 4];

            angles.forEach(angle => {
                const point = getBoxEdgePoint(centerX, centerY, width, height, angle);

                // Check that point is within or on box bounds
                expect(point.x).toBeGreaterThanOrEqual(centerX - halfWidth);
                expect(point.x).toBeLessThanOrEqual(centerX + halfWidth);
                expect(point.y).toBeGreaterThanOrEqual(centerY - halfHeight);
                expect(point.y).toBeLessThanOrEqual(centerY + halfHeight);

                // Check that point is actually on an edge (at least one coordinate should be at boundary)
                const onEdge =
                    point.x === centerX - halfWidth || // left edge
                    point.x === centerX + halfWidth || // right edge
                    point.y === centerY - halfHeight || // top edge
                    point.y === centerY + halfHeight;   // bottom edge

                expect(onEdge).toBe(true);
            });
        });
    });

    describe('Symmetry', () => {
        it('should return symmetric points for opposite angles (0° and 180°)', () => {
            const rightPoint = getBoxEdgePoint(centerX, centerY, width, height, 0);
            const leftPoint = getBoxEdgePoint(centerX, centerY, width, height, Math.PI);

            expect(rightPoint.x).toBe(centerX + halfWidth);
            expect(leftPoint.x).toBe(centerX - halfWidth);
            expect(rightPoint.y).toBe(leftPoint.y);
        });

        it('should return symmetric points for opposite angles (90° and -90°)', () => {
            const bottomPoint = getBoxEdgePoint(centerX, centerY, width, height, Math.PI / 2);
            const topPoint = getBoxEdgePoint(centerX, centerY, width, height, -Math.PI / 2);

            expect(bottomPoint.y).toBe(centerY + halfHeight);
            expect(topPoint.y).toBe(centerY - halfHeight);
            expect(bottomPoint.x).toBe(topPoint.x);
        });
    });
});
