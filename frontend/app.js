// Main application - refactored with modular structure
import { loadTeamTypes, loadOrganizationHierarchy, loadTeams } from './api.js';
import { initCanvasPolyfills } from './renderer-common.js';
import { CanvasInteractionHandler } from './canvas-interactions.js';
import { state } from './state-management.js';
import { openAddTeamModal, closeModal, closeDetailModal, closeInteractionModeModal, showTeamDetails, handleTeamSubmit } from './modals.js';
import { updateLegend, updateGroupingFilter } from './legend.js';
import { setupUIEventListeners } from './ui-handlers.js';
import { draw, selectTeam } from './renderer.js';
import { initSnapshotHandlers } from './snapshot-handlers.js';
import { comparisonView } from './tt-comparison-view.js';

let _interactionHandler = null;
// Initialize
document.addEventListener('DOMContentLoaded', init);

// Add Escape key handler for focus mode
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.focusedTeam) {
        // Check if any modal is open - let modal handler take priority
        const modalsOpen = document.getElementById('detailModal')?.style.display === 'block' ||
                          document.getElementById('teamModal')?.style.display === 'block' ||
                          document.getElementById('interactionModeModal')?.style.display === 'block' ||
                          document.getElementById('keyboardShortcutsModal')?.style.display === 'block';

        if (modalsOpen) {
            return; // Let the modal close handler in modals.js handle it
        }

        // Exit focus mode
        state.focusedTeam = null;
        state.focusedConnections.clear();

        // Update UI indicator
        if (_interactionHandler && _interactionHandler.updateFocusModeIndicator) {
            _interactionHandler.updateFocusModeIndicator();
        }

        // Redraw canvas
        draw(state);
    }
});

function init() {
    state.canvas = document.getElementById('teamCanvas');
    state.ctx = state.canvas.getContext('2d');
    initCanvasPolyfills();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    // Setup interaction handler
    if (state.canvas && state.ctx) {
        _interactionHandler = new CanvasInteractionHandler(state.canvas, state, () => draw(state));
        state.onTeamDoubleClick = (team) => showTeamDetails(team, state.currentView, state.teams);
    }
    // Setup UI event listeners
    setupUIEventListeners(loadAllTeams, () => draw(state), openAddTeamModal, closeModal, closeDetailModal, closeInteractionModeModal, handleTeamSubmit, (team) => selectTeam(team, state, draw));
    // Initialize snapshot handlers
    initSnapshotHandlers();
    // Initialize comparison view
    comparisonView.init();
    // Expose for E2E testing
    window._testHelpers = {
        showTeamDetails
    };
    // Check if in demo mode and show banner
    checkDemoMode();
    // Load initial data
    loadAllTeams();
}
function resizeCanvas() {
    if (!state.canvas)
        return;
    state.canvas.width = state.canvas.offsetWidth;
    state.canvas.height = state.canvas.offsetHeight;
    draw(state);
}
async function loadAllTeams() {
    try {
        // Load team type configuration first
        state.teamTypeConfig = await loadTeamTypes(state.currentView);
        // Build color map from config
        state.teamColorMap = {};
        state.teamTypeConfig.team_types.forEach((type) => {
            if (type.id) {
                state.teamColorMap[type.id] = type.color;
            }
        });
        // Load organization hierarchy if in current view
        if (state.currentView === 'current') {
            try {
                state.organizationHierarchy = await loadOrganizationHierarchy();
            } catch (error) {
                console.warn('Failed to load organization hierarchy:', error);
                state.organizationHierarchy = null;
            }
        } else {
            state.organizationHierarchy = null;
        }
        // Load teams
        state.teams = await loadTeams(state.currentView);

        // Assign random positions if not set
        state.teams.forEach((team, index) => {
            if (!team.position || (team.position.x === 0 && team.position.y === 0)) {
                team.position = {
                    x: 100 + (index % 3) * 250,
                    y: 100 + Math.floor(index / 3) * 150
                };
            }
        });
        updateTeamList();
        updateLegend();
        updateGroupingFilter();
        draw(state);
    } catch (error) {
        console.error('Failed to load teams:', error);
    }
}
function updateTeamList() {
    const teamList = document.getElementById('teamList');
    if (!teamList)
        return;
    teamList.innerHTML = '';
    state.teams.forEach(team => {
        const item = document.createElement('div');
        item.className = `team-item ${team.team_type}`;
        item.textContent = team.name;

        // Apply color from JSON config dynamically
        if (team.team_type && state.teamColorMap && state.teamColorMap[team.team_type]) {
            item.style.borderLeftColor = state.teamColorMap[team.team_type];
        }

        item.addEventListener('click', () => selectTeam(team, state, draw));
        item.addEventListener('dblclick', () => showTeamDetails(team, state.currentView, state.teams));
        teamList.appendChild(item);
    });
}

async function checkDemoMode() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        if (config.readOnlyMode) {
            showDemoBanner();
        }
    } catch (error) {
        console.warn('Failed to check demo mode:', error);
    }
}

function showDemoBanner() {
    const banner = document.createElement('div');
    banner.className = 'demo-banner';
    banner.innerHTML = `
        <span class="demo-banner-icon">🎮</span>
        <strong>Demo Mode:</strong> Feel free to explore and interact with the visualization. 
        Changes won't be saved.
    `;
    document.body.insertBefore(banner, document.body.firstChild);
}

