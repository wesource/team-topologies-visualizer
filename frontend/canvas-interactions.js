// Canvas mouse and interaction handling
import { getTeamAtPosition } from './renderer-common.js';
import { updateTeamPosition } from './api.js';
import { showInfo } from './notifications.js';

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
        const team = getTeamAtPosition(
            this.state.teams,
            x,
            y,
            this.state.viewOffset,
            this.state.scale,
            this.state.currentView,
            this.state.currentPerspective,
            this.state.productLinesTeamPositions
        );
        if (team) {
            // Disable dragging in Product Lines view (teams are positioned by product lane)
            if (this.state.currentView === 'current' && this.state.currentPerspective === 'product-lines') {
                // Show info message on first drag attempt
                if (!this._productLinesDragWarningShown) {
                    showInfo('Teams cannot be repositioned in Product Lines view. Switch to Hierarchy view to move teams.');
                    this._productLinesDragWarningShown = true;
                    // Reset flag after 5 seconds to allow message to show again if needed
                    setTimeout(() => {
                        this._productLinesDragWarningShown = false;
                    }, 5000);
                }
                // Still select the team for viewing details
                this.state.selectedTeam = team;
                this.drawCallback();
                return;
            }

            this.draggedTeam = team;
            this.dragStartPosition = { x: team.position.x, y: team.position.y };
            this.hasDragged = false;
            this.dragOffset = {
                x: (x - this.state.viewOffset.x) / this.state.scale - team.position.x,
                y: (y - this.state.viewOffset.y) / this.state.scale - team.position.y
            };
            this.state.selectedTeam = team;
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
        this.draggedTeam = null;
        this.dragStartPosition = null;
        this.hasDragged = false;
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
        const team = getTeamAtPosition(
            this.state.teams,
            x,
            y,
            this.state.viewOffset,
            this.state.scale,
            this.state.currentView,
            this.state.currentPerspective,
            this.state.productLinesTeamPositions
        );
        if (team && this.state.onTeamDoubleClick) {
            this.state.onTeamDoubleClick(team);
        }
    }
}
