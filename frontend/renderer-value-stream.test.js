// Tests for value stream grouping rendering
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { drawValueStreamGroupings } from './renderer-common.js';

describe('drawValueStreamGroupings', () => {
    let mockCtx;

    beforeEach(() => {
        mockCtx = {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            font: '',
            textAlign: '',
            textBaseline: '',
            beginPath: vi.fn(),
            roundRect: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            fillText: vi.fn()
        };
    });

    it('should draw nothing for empty groupings', () => {
        drawValueStreamGroupings(mockCtx, []);

        expect(mockCtx.beginPath).not.toHaveBeenCalled();
    });

    it('should draw nothing for null groupings', () => {
        drawValueStreamGroupings(mockCtx, null);

        expect(mockCtx.beginPath).not.toHaveBeenCalled();
    });

    it('should skip ungrouped teams', () => {
        const groupings = [
            {
                name: '(Ungrouped)',
                teams: [],
                bounds: { x: 100, y: 100, width: 200, height: 150 }
            }
        ];

        drawValueStreamGroupings(mockCtx, groupings);

        expect(mockCtx.beginPath).not.toHaveBeenCalled();
    });

    it('should draw rectangle and label for value stream grouping', () => {
        const groupings = [
            {
                name: 'E-commerce Experience',
                teams: [],
                bounds: { x: 100, y: 100, width: 400, height: 300 }
            }
        ];

        drawValueStreamGroupings(mockCtx, groupings);

        // Should draw rectangle
        expect(mockCtx.beginPath).toHaveBeenCalled();
        expect(mockCtx.roundRect).toHaveBeenCalledWith(100, 100, 400, 300, 10);
        expect(mockCtx.fill).toHaveBeenCalled();
        expect(mockCtx.stroke).toHaveBeenCalled();

        // Should draw label
        expect(mockCtx.fillText).toHaveBeenCalledWith('E-commerce Experience', 300, 110);
        expect(mockCtx.textAlign).toBe('center');
        expect(mockCtx.textBaseline).toBe('top');
    });

    it('should draw multiple groupings', () => {
        const groupings = [
            {
                name: 'E-commerce Experience',
                teams: [],
                bounds: { x: 100, y: 100, width: 400, height: 300 }
            },
            {
                name: 'Mobile Experience',
                teams: [],
                bounds: { x: 600, y: 100, width: 400, height: 300 }
            }
        ];

        drawValueStreamGroupings(mockCtx, groupings);

        // Should draw 2 rectangles
        expect(mockCtx.beginPath).toHaveBeenCalledTimes(2);
        expect(mockCtx.roundRect).toHaveBeenCalledTimes(2);
        expect(mockCtx.fill).toHaveBeenCalledTimes(2);
        expect(mockCtx.stroke).toHaveBeenCalledTimes(2);

        // Should draw 2 labels
        expect(mockCtx.fillText).toHaveBeenCalledTimes(2);
        expect(mockCtx.fillText).toHaveBeenNthCalledWith(1, 'E-commerce Experience', 300, 110);
        expect(mockCtx.fillText).toHaveBeenNthCalledWith(2, 'Mobile Experience', 800, 110);
    });

    it('should use correct styling', () => {
        const groupings = [
            {
                name: 'E-commerce Experience',
                teams: [],
                bounds: { x: 100, y: 100, width: 400, height: 300 }
            }
        ];

        drawValueStreamGroupings(mockCtx, groupings);

        // The function sets styles multiple times, so we check specific calls
        // Verify border width was set
        expect(mockCtx.lineWidth).toBe(2);

        // Verify label font
        expect(mockCtx.font).toBe('bold 16px sans-serif');

        // Verify text alignment for labels
        expect(mockCtx.textAlign).toBe('center');
        expect(mockCtx.textBaseline).toBe('top');
    });
});
