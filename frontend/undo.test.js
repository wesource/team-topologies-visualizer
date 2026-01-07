import { describe, it, expect, beforeEach } from 'vitest';
import { state, pushPositionSnapshot, popPositionSnapshot, canUndo, clearPositionHistory } from './state-management.js';

describe('undo.js - Position History Management', () => {
    beforeEach(() => {
        // Reset state before each test
        state.positionHistory = [];
        state.currentView = 'tt';
        state.teams = [
            { name: 'Team A', position: { x: 100, y: 200 } },
            { name: 'Team B', position: { x: 300, y: 400 } },
            { name: 'Team C', position: { x: 500, y: 600 } }
        ];
    });

    describe('pushPositionSnapshot', () => {
        it('should capture current team positions', () => {
            pushPositionSnapshot();

            expect(state.positionHistory).toHaveLength(1);
            const snapshot = state.positionHistory[0];
            expect(snapshot.view).toBe('tt');
            expect(snapshot.teams).toHaveLength(3);
            expect(snapshot.teams[0]).toEqual({ name: 'Team A', x: 100, y: 200 });
            expect(snapshot.teams[1]).toEqual({ name: 'Team B', x: 300, y: 400 });
            expect(snapshot.teams[2]).toEqual({ name: 'Team C', x: 500, y: 600 });
        });

        it('should include timestamp in snapshot', () => {
            const before = Date.now();
            pushPositionSnapshot();
            const after = Date.now();

            const snapshot = state.positionHistory[0];
            expect(snapshot.timestamp).toBeGreaterThanOrEqual(before);
            expect(snapshot.timestamp).toBeLessThanOrEqual(after);
        });

        it('should capture current view in snapshot', () => {
            state.currentView = 'current';
            pushPositionSnapshot();

            const snapshot = state.positionHistory[0];
            expect(snapshot.view).toBe('current');
        });

        it('should allow multiple snapshots', () => {
            pushPositionSnapshot();
            state.teams[0].position.x = 150;
            pushPositionSnapshot();
            state.teams[0].position.x = 200;
            pushPositionSnapshot();

            expect(state.positionHistory).toHaveLength(3);
            expect(state.positionHistory[0].teams[0].x).toBe(100);
            expect(state.positionHistory[1].teams[0].x).toBe(150);
            expect(state.positionHistory[2].teams[0].x).toBe(200);
        });

        it('should limit history to maxHistorySize (10)', () => {
            // Push 15 snapshots
            for (let i = 0; i < 15; i++) {
                state.teams[0].position.x = 100 + i * 10;
                pushPositionSnapshot();
            }

            // Should only keep last 10
            expect(state.positionHistory).toHaveLength(10);
            // First snapshot should have x=150 (6th snapshot, since first 5 were removed)
            expect(state.positionHistory[0].teams[0].x).toBe(150);
            // Last snapshot should have x=240 (15th snapshot)
            expect(state.positionHistory[9].teams[0].x).toBe(240);
        });

        it('should handle teams with missing positions', () => {
            state.teams.push({ name: 'Team D', position: undefined });
            pushPositionSnapshot();

            const snapshot = state.positionHistory[0];
            expect(snapshot.teams).toHaveLength(4);
            expect(snapshot.teams[3]).toEqual({ name: 'Team D', x: 0, y: 0 });
        });

        it('should handle empty teams array', () => {
            state.teams = [];
            pushPositionSnapshot();

            const snapshot = state.positionHistory[0];
            expect(snapshot.teams).toHaveLength(0);
        });
    });

    describe('popPositionSnapshot', () => {
        it('should return most recent snapshot', () => {
            pushPositionSnapshot();
            state.teams[0].position.x = 150;
            pushPositionSnapshot();

            const snapshot = popPositionSnapshot();
            expect(snapshot.teams[0].x).toBe(150);
        });

        it('should remove snapshot from history', () => {
            pushPositionSnapshot();
            pushPositionSnapshot();
            expect(state.positionHistory).toHaveLength(2);

            popPositionSnapshot();
            expect(state.positionHistory).toHaveLength(1);
        });

        it('should return undefined when history is empty', () => {
            const snapshot = popPositionSnapshot();
            expect(snapshot).toBeUndefined();
        });

        it('should work like a stack (LIFO)', () => {
            state.teams[0].position.x = 100;
            pushPositionSnapshot();
            state.teams[0].position.x = 200;
            pushPositionSnapshot();
            state.teams[0].position.x = 300;
            pushPositionSnapshot();

            expect(popPositionSnapshot().teams[0].x).toBe(300);
            expect(popPositionSnapshot().teams[0].x).toBe(200);
            expect(popPositionSnapshot().teams[0].x).toBe(100);
            expect(popPositionSnapshot()).toBeUndefined();
        });
    });

    describe('canUndo', () => {
        it('should return false when history is empty', () => {
            expect(canUndo()).toBe(false);
        });

        it('should return true when history has snapshots', () => {
            pushPositionSnapshot();
            expect(canUndo()).toBe(true);
        });

        it('should return false after popping all snapshots', () => {
            pushPositionSnapshot();
            pushPositionSnapshot();
            popPositionSnapshot();
            popPositionSnapshot();
            expect(canUndo()).toBe(false);
        });

        it('should return true with multiple snapshots', () => {
            pushPositionSnapshot();
            pushPositionSnapshot();
            pushPositionSnapshot();
            expect(canUndo()).toBe(true);
        });
    });

    describe('clearPositionHistory', () => {
        it('should empty the history array', () => {
            pushPositionSnapshot();
            pushPositionSnapshot();
            pushPositionSnapshot();
            expect(state.positionHistory).toHaveLength(3);

            clearPositionHistory();
            expect(state.positionHistory).toHaveLength(0);
        });

        it('should make canUndo return false', () => {
            pushPositionSnapshot();
            expect(canUndo()).toBe(true);

            clearPositionHistory();
            expect(canUndo()).toBe(false);
        });

        it('should handle empty history gracefully', () => {
            clearPositionHistory();
            expect(state.positionHistory).toHaveLength(0);
            expect(canUndo()).toBe(false);
        });
    });

    describe('Integration scenarios', () => {
        it('should handle typical drag operation flow', () => {
            // Initial positions
            expect(canUndo()).toBe(false);

            // User starts drag - snapshot captured
            pushPositionSnapshot();
            expect(canUndo()).toBe(true);

            // User drags team
            state.teams[0].position.x = 250;
            state.teams[0].position.y = 350;

            // User wants to undo
            const snapshot = popPositionSnapshot();
            expect(snapshot.teams[0].x).toBe(100);
            expect(snapshot.teams[0].y).toBe(200);
        });

        it('should handle auto-align operation flow', () => {
            // Capture before auto-align
            pushPositionSnapshot();

            // Auto-align changes many teams
            state.teams[0].position.x = 50;
            state.teams[1].position.x = 50;
            state.teams[2].position.x = 50;

            // Undo restores all positions
            const snapshot = popPositionSnapshot();
            expect(snapshot.teams[0].x).toBe(100);
            expect(snapshot.teams[1].x).toBe(300);
            expect(snapshot.teams[2].x).toBe(500);
        });

        it('should handle view switching by clearing history', () => {
            // User drags in TT view
            state.currentView = 'tt';
            pushPositionSnapshot();
            pushPositionSnapshot();
            expect(canUndo()).toBe(true);

            // User switches to Pre-TT view - history should be cleared
            state.currentView = 'current';
            clearPositionHistory();
            expect(canUndo()).toBe(false);
        });

        it('should handle refresh by clearing history', () => {
            pushPositionSnapshot();
            pushPositionSnapshot();
            expect(canUndo()).toBe(true);

            // User clicks refresh
            clearPositionHistory();
            expect(canUndo()).toBe(false);
        });

        it('should support multiple undo operations', () => {
            // Initial state
            state.teams[0].position.x = 100;

            // Make 3 changes with snapshots before each
            pushPositionSnapshot(); // Captures x=100
            state.teams[0].position.x = 150;

            pushPositionSnapshot(); // Captures x=150
            state.teams[0].position.x = 200;

            pushPositionSnapshot(); // Captures x=200
            state.teams[0].position.x = 250;

            // Now current state is x=250, and we have 3 snapshots (100, 150, 200)

            // Undo 3 times - each undo restores the snapshot value
            expect(popPositionSnapshot().teams[0].x).toBe(200); // Restore to 200
            expect(canUndo()).toBe(true);
            expect(popPositionSnapshot().teams[0].x).toBe(150); // Restore to 150
            expect(canUndo()).toBe(true);
            expect(popPositionSnapshot().teams[0].x).toBe(100); // Restore to 100
            expect(canUndo()).toBe(false);
        });
    });
});
