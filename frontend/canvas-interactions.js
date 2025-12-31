// Canvas mouse and interaction handling
import { getTeamAtPosition } from './renderer-common.js';
import { updateTeamPosition } from './api.js';

export class CanvasInteractionHandler {
    constructor(canvas, state, drawCallback) {
        this.canvas = canvas;
        this.state = state;
        this.drawCallback = drawCallback;

        this.draggedTeam = null;
        this.dragStartPosition = null;
        this.hasDragged = false;
        this.dragOffset = { x: 0, y: 0 };

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const team = getTeamAtPosition(this.state.teams, x, y, this.state.viewOffset, this.state.scale);
        if (team) {
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
        if (this.draggedTeam) {
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

    async handleMouseUp(e) {
        if (this.draggedTeam && this.hasDragged) {
            try {
                await updateTeamPosition(
                    this.draggedTeam.name,
                    this.draggedTeam.position.x,
                    this.draggedTeam.position.y,
                    this.state.currentView
                );
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

        const team = getTeamAtPosition(this.state.teams, x, y, this.state.viewOffset, this.state.scale);
        if (team && this.state.onTeamDoubleClick) {
            this.state.onTeamDoubleClick(team);
        }
    }
}
