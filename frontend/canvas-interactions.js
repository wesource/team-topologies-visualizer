// Canvas mouse and interaction handling
import { getTeamAtPosition } from './renderer-common.js';
import { updateTeamPosition } from './api.js';
import { pushPositionSnapshot } from './state-management.js';
import { updateUndoButtonState } from './ui-handlers.js';

/**
 * Get direct relationships for a team (dependencies and consumers)
 * @param {Object} team - Team object
 * @param {Array} allTeams - All teams in current view
 * @returns {Set} Set of team names in focus network (team + direct dependencies + direct consumers)
 */
export function getDirectRelationships(team, allTeams) {
    const connected = new Set([team.name]);

    // Add teams this team depends on
    if (team.dependencies && Array.isArray(team.dependencies)) {
        team.dependencies.forEach(dep => connected.add(dep));
    }

    // Add teams that depend on this team
    allTeams.forEach(t => {
        if (t.dependencies && Array.isArray(t.dependencies) && t.dependencies.includes(team.name)) {
            connected.add(t.name);
        }
    });

    // Add teams with interaction modes (TT Design view)
    if (team.interaction_modes && typeof team.interaction_modes === 'object') {
        Object.keys(team.interaction_modes).forEach(teamName => {
            connected.add(teamName);
        });
    }

    // Add teams that have interaction modes with this team
    allTeams.forEach(t => {
        if (t.interaction_modes && typeof t.interaction_modes === 'object') {
            if (t.interaction_modes[team.name]) {
                connected.add(t.name);
            }
        }
    });

    return connected;
}

export class CanvasInteractionHandler {
    constructor(canvas, state, drawCallback) {
        this.draggedTeam = null;
        this.dragStartPosition = null;
        this.hasDragged = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
        this.canvas = canvas;
        this.state = state;
        this.drawCallback = drawCallback;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        // Use passive: false because we call preventDefault() in handleWheel for zoom control
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Right-click or middle button for panning
        if (e.button === 2 || e.button === 1) {
            e.preventDefault();
            this.isPanning = true;
            this.panStart = { x: e.clientX, y: e.clientY };
            this.canvas.style.cursor = 'grabbing';
            return;
        }

        // Disable dragging when viewing snapshot (read-only mode)
        if (this.state.isViewingSnapshot) {
            return;
        }

        // Left-click for team dragging
        let customPositions = null;
        if (this.state.currentPerspective === 'value-streams') {
            customPositions = this.state.valueStreamsTeamPositions;
        } else if (this.state.currentPerspective === 'product-lines') {
            customPositions = this.state.productLinesTeamPositions;
        } else if (this.state.currentPerspective === 'business-streams') {
            customPositions = this.state.businessStreamsTeamPositions;
        }

        const team = getTeamAtPosition(
            this.state.teams,
            x,
            y,
            this.state.viewOffset,
            this.state.scale,
            this.state.currentView,
            this.state.currentPerspective,
            customPositions
        );
        if (team) {
            // Set draggedTeam for click detection (focus mode)
            this.draggedTeam = team;
            this.hasDragged = false;
            this.state.selectedTeam = team;

            // Disable dragging in Product Lines, Value Streams, and Business Streams views
            if (this.state.currentView === 'current' && (this.state.currentPerspective === 'product-lines' || this.state.currentPerspective === 'value-streams' || this.state.currentPerspective === 'business-streams')) {
                // Focus mode still works, but no dragging
                this.dragStartPosition = null; // Prevent dragging
                this.drawCallback();
                return;
            }

            // Enable dragging in other views (Hierarchy, TT Design)
            this.dragStartPosition = { x: team.position.x, y: team.position.y };
            // Capture position snapshot before drag starts (for undo)
            pushPositionSnapshot();
            updateUndoButtonState();
            this.dragOffset = {
                x: (x - this.state.viewOffset.x) / this.state.scale - team.position.x,
                y: (y - this.state.viewOffset.y) / this.state.scale - team.position.y
            };
            this.drawCallback();
        }
    }

    handleMouseMove(e) {
        // Handle panning
        if (this.isPanning) {
            const dx = e.clientX - this.panStart.x;
            const dy = e.clientY - this.panStart.y;
            this.state.viewOffset.x += dx;
            this.state.viewOffset.y += dy;
            this.panStart = { x: e.clientX, y: e.clientY };
            this.drawCallback();
            return;
        }

        // Handle team dragging
        if (this.draggedTeam && this.dragStartPosition) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const newX = (x - this.state.viewOffset.x) / this.state.scale - this.dragOffset.x;
            const newY = (y - this.state.viewOffset.y) / this.state.scale - this.dragOffset.y;
            const deltaX = Math.abs(newX - this.dragStartPosition.x);
            const deltaY = Math.abs(newY - this.dragStartPosition.y);

            // Check if actually moved (threshold of 2 pixels)
            if (deltaX > 2 || deltaY > 2) {
                this.hasDragged = true;
                this.draggedTeam.position.x = newX;
                this.draggedTeam.position.y = newY;
                this.drawCallback();
            }
        }
    }

    async handleMouseUp(_e) {
        // End panning
        if (this.isPanning) {
            this.isPanning = false;
            this.canvas.style.cursor = 'move';
            return;
        }

        // Handle team drag end
        if (this.draggedTeam && this.hasDragged) {
            try {
                await updateTeamPosition(this.draggedTeam.name, this.draggedTeam.position.x, this.draggedTeam.position.y, this.state.currentView);
            } catch (error) {
                console.error('Failed to update team position:', error);
            }
        }

        // Handle focus mode toggle (single-click without drag)
        if (this.draggedTeam && !this.hasDragged) {
            const clickedTeam = this.draggedTeam;

            // Toggle focus mode
            if (this.state.focusedTeam === clickedTeam) {
                // Exit focus mode (clicked same team)
                this.state.focusedTeam = null;
                this.state.focusedConnections.clear();
            } else {
                // Enter focus mode (new team)
                this.state.focusedTeam = clickedTeam;
                this.state.focusedConnections = getDirectRelationships(clickedTeam, this.state.teams);
            }

            // Update UI indicator
            this.updateFocusModeIndicator();

            this.drawCallback();
        } else if (!this.draggedTeam && !this.hasDragged) {
            // Clicked empty canvas - exit focus mode if active
            if (this.state.focusedTeam) {
                this.state.focusedTeam = null;
                this.state.focusedConnections.clear();
                this.updateFocusModeIndicator();
                this.drawCallback();
            }
        }

        this.draggedTeam = null;
        this.dragStartPosition = null;
        this.hasDragged = false;
    }

    /**
     * Update focus mode indicator in UI
     */
    updateFocusModeIndicator() {
        let indicator = document.getElementById('focusModeIndicator');

        if (this.state.focusedTeam) {
            // Show indicator
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'focusModeIndicator';
                indicator.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: rgba(74, 159, 216, 0.95);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    z-index: 1000;
                    cursor: pointer;
                `;
                indicator.title = 'Click to exit focus mode';
                indicator.addEventListener('click', () => {
                    this.state.focusedTeam = null;
                    this.state.focusedConnections.clear();
                    this.updateFocusModeIndicator();
                    this.drawCallback();
                });
                document.body.appendChild(indicator);
            }
            indicator.innerHTML = `👁️ Focus: <strong>${this.state.focusedTeam.name}</strong> (click to exit)`;
        } else {
            // Hide indicator
            if (indicator) {
                indicator.remove();
            }
        }
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.state.scale *= delta;
        this.state.scale = Math.max(0.1, Math.min(3, this.state.scale));
        this.drawCallback();
    }

    handleDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const customPositions = this.state.currentPerspective === 'value-streams'
            ? this.state.valueStreamsTeamPositions
            : this.state.productLinesTeamPositions;

        const team = getTeamAtPosition(
            this.state.teams,
            x,
            y,
            this.state.viewOffset,
            this.state.scale,
            this.state.currentView,
            this.state.currentPerspective,
            customPositions
        );
        if (team && this.state.onTeamDoubleClick) {
            this.state.onTeamDoubleClick(team);
        }
    }
}
