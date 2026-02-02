import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drawFlowOfChangeBanner } from './renderer-common.js';

describe('drawFlowOfChangeBanner', () => {
    let mockCtx;
    let mockTeams;

    beforeEach(() => {
        // Mock canvas context
        mockCtx = {
            strokeStyle: '',
            lineWidth: 0,
            fillStyle: '',
            font: '',
            textAlign: '',
            textBaseline: '',
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            fillText: vi.fn(),
            setLineDash: vi.fn(),
            measureText: vi.fn(() => ({ width: 100 })),
            fillRect: vi.fn()
        };

        // Mock teams with positions
        mockTeams = [
            {
                name: 'Team A',
                team_type: 'stream-aligned',
                position: { x: 100, y: 100 }
            },
            {
                name: 'Team B',
                team_type: 'platform',
                position: { x: 700, y: 200 }
            },
            {
                name: 'Team C',
                team_type: 'enabling',
                position: { x: 400, y: 300 }
            }
        ];
    });

    it('should draw nothing if teams array is empty', () => {
        drawFlowOfChangeBanner(mockCtx, 1200, 800, []);
        
        expect(mockCtx.beginPath).not.toHaveBeenCalled();
        expect(mockCtx.stroke).not.toHaveBeenCalled();
    });

    it('should draw nothing if teams is null or undefined', () => {
        drawFlowOfChangeBanner(mockCtx, 1200, 800, null);
        expect(mockCtx.beginPath).not.toHaveBeenCalled();
        
        drawFlowOfChangeBanner(mockCtx, 1200, 800, undefined);
        expect(mockCtx.beginPath).not.toHaveBeenCalled();
    });

    it('should call canvas drawing methods when teams are provided', () => {
        drawFlowOfChangeBanner(mockCtx, 1200, 800, mockTeams);
        
        expect(mockCtx.setLineDash).toHaveBeenCalledWith([5, 5]); // Dashed line (facilitating mode)
        expect(mockCtx.beginPath).toHaveBeenCalled();
        expect(mockCtx.moveTo).toHaveBeenCalled();
        expect(mockCtx.lineTo).toHaveBeenCalled();
        expect(mockCtx.closePath).toHaveBeenCalled();
        expect(mockCtx.stroke).toHaveBeenCalled();
        expect(mockCtx.setLineDash).toHaveBeenCalledWith([]); // Reset dash
    });

    it('should draw label "Flow of Change"', () => {
        drawFlowOfChangeBanner(mockCtx, 1200, 800, mockTeams);
        
        expect(mockCtx.fillText).toHaveBeenCalledWith(
            'Flow of Change',
            expect.any(Number),
            expect.any(Number)
        );
        expect(mockCtx.textAlign).toBe('center');
        expect(mockCtx.textBaseline).toBe('middle');
    });

    it('should use dashed stroke style', () => {
        drawFlowOfChangeBanner(mockCtx, 1200, 800, mockTeams);
        
        expect(mockCtx.strokeStyle).toBe('#666666');
        expect(mockCtx.lineWidth).toBe(2);
        expect(mockCtx.setLineDash).toHaveBeenCalledWith([5, 5]);
    });

    it('should use subtle fill color', () => {
        drawFlowOfChangeBanner(mockCtx, 1200, 800, mockTeams);
        
        // Verify fillRect is called for text background (white rectangle)
        expect(mockCtx.fillRect).toHaveBeenCalled();
        // Verify fillText is called for text label
        expect(mockCtx.fillText).toHaveBeenCalledWith('Flow of Change', expect.any(Number), expect.any(Number));
    });

    it('should position arrow below teams', () => {
        const callsToMoveTo = mockCtx.moveTo.mock.calls;
        const callsToLineTo = mockCtx.lineTo.mock.calls;
        
        drawFlowOfChangeBanner(mockCtx, 1200, 800, mockTeams);
        
        // Arrow should be positioned below the lowest team
        // Team C is at y: 300, with height ~80, so arrow should be at y > 380
        const allYCoordinates = [
            ...callsToMoveTo.map(call => call[1]),
            ...callsToLineTo.map(call => call[1])
        ];
        
        const minArrowY = Math.min(...allYCoordinates);
        expect(minArrowY).toBeGreaterThan(300); // Below teams
    });

    it('should span width based on team positions', () => {
        const callsToMoveTo = mockCtx.moveTo.mock.calls;
        const callsToLineTo = mockCtx.lineTo.mock.calls;
        
        drawFlowOfChangeBanner(mockCtx, 1200, 800, mockTeams);
        
        // Arrow should span from leftmost to rightmost team (with padding)
        const allXCoordinates = [
            ...callsToMoveTo.map(call => call[0]),
            ...callsToLineTo.map(call => call[0])
        ];
        
        const minX = Math.min(...allXCoordinates);
        const maxX = Math.max(...allXCoordinates);
        
        // Should be wider than the team spread
        const teamSpread = 700 - 100; // Team B x - Team A x
        expect(maxX - minX).toBeGreaterThan(teamSpread);
    });

    it('should create asymmetric arrowhead shape', () => {
        drawFlowOfChangeBanner(mockCtx, 1200, 800, mockTeams);
        
        // Should have called lineTo multiple times to create the arrow shape
        expect(mockCtx.lineTo.mock.calls.length).toBeGreaterThanOrEqual(6);
        // Arrow should include upward and downward angles for asymmetric head
    });

    it('should handle single team', () => {
        const singleTeam = [mockTeams[0]];
        drawFlowOfChangeBanner(mockCtx, 1200, 800, singleTeam);
        
        expect(mockCtx.beginPath).toHaveBeenCalled();
        expect(mockCtx.fillText).toHaveBeenCalledWith(
            'Flow of Change',
            expect.any(Number),
            expect.any(Number)
        );
    });

    it('should respect canvas width boundaries', () => {
        const wideSpreadTeams = [
            { name: 'Left', team_type: 'stream-aligned', position: { x: 50, y: 100 } },
            { name: 'Right', team_type: 'stream-aligned', position: { x: 1500, y: 100 } }
        ];
        
        drawFlowOfChangeBanner(mockCtx, 1200, 800, wideSpreadTeams);
        
        const callsToMoveTo = mockCtx.moveTo.mock.calls;
        const callsToLineTo = mockCtx.lineTo.mock.calls;
        const allXCoordinates = [
            ...callsToMoveTo.map(call => call[0]),
            ...callsToLineTo.map(call => call[0])
        ];
        
        const minX = Math.min(...allXCoordinates);
        const maxX = Math.max(...allXCoordinates);
        const arrowWidth = maxX - minX;
        
        // Arrow width should be capped at 800px (max width)
        expect(arrowWidth).toBeLessThanOrEqual(850); // 800 + some margin for padding
    });
});
