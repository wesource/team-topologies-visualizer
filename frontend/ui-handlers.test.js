/**
 * Unit tests for ui-handlers.js
 * 
 * Note: Most ui-handlers.js functions are tightly coupled to DOM and API calls,
 * making them better suited for E2E tests. These tests focus on testable utility functions.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateUndoButtonState } from './ui-handlers.js';
import { state } from './state-management.js';

describe('updateUndoButtonState', () => {
    let mockUndoButton;

    beforeEach(() => {
        // Reset position snapshots
        state.positionSnapshots = [];
        
        // Mock undo button
        mockUndoButton = {
            disabled: false
        };
        
        // Mock document.getElementById
        global.document = {
            getElementById: vi.fn((id) => {
                if (id === 'undo-btn') {
                    return mockUndoButton;
                }
                return null;
            })
        };
    });

    it('should disable undo button when no snapshots exist', () => {
        updateUndoButtonState();
        
        expect(mockUndoButton.disabled).toBe(true);
    });

    it('should enable undo button when snapshots exist', () => {
        // Add a snapshot
        state.positionSnapshots.push({ team1: { x: 100, y: 100 } });
        
        updateUndoButtonState();
        
        expect(mockUndoButton.disabled).toBe(false);
    });

    it('should disable undo button when last snapshot is removed', () => {
        // Add and remove snapshot
        state.positionSnapshots.push({ team1: { x: 100, y: 100 } });
        state.positionSnapshots.pop();
        
        updateUndoButtonState();
        
        expect(mockUndoButton.disabled).toBe(true);
    });

    it('should enable undo button when multiple snapshots exist', () => {
        state.positionSnapshots.push({ team1: { x: 100, y: 100 } });
        state.positionSnapshots.push({ team1: { x: 200, y: 200 } });
        state.positionSnapshots.push({ team1: { x: 300, y: 300 } });
        
        updateUndoButtonState();
        
        expect(mockUndoButton.disabled).toBe(false);
    });
});
