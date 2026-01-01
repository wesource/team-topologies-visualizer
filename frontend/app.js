// Main application - refactored with modular structure
import { loadTeamTypes, loadOrganizationHierarchy, loadTeams, loadTeamDetails, updateTeamPosition } from './api.js';
import { drawCurrentStateView } from './renderer-current.js';
import { drawTeam, drawConnections, wrapText, initCanvasPolyfills, drawValueStreamGroupings, drawPlatformGroupings, darkenColor } from './renderer-common.js';
import { CanvasInteractionHandler } from './canvas-interactions.js';
import { exportToSVG } from './svg-export.js';
import { autoAlignTeamsByManager } from './current-state-alignment.js';
import { autoAlignTTDesign } from './tt-design-alignment.js';
import { showError, showSuccess, showInfo, showWarning } from './notifications.js';
import { getValueStreamGroupings, getValueStreamNames, filterTeamsByValueStream } from './value-stream-grouping.js';
import { getPlatformGroupings, getPlatformGroupingNames, filterTeamsByPlatformGrouping } from './platform-grouping.js';
import { state } from './state-management.js';
import { openAddTeamModal, closeModal, closeDetailModal, closeInteractionModeModal, showInfoModal, showTeamDetails, handleTeamSubmit } from './modals.js';
import { updateLegend, updateGroupingFilter } from './legend.js';
import { setupUIEventListeners } from './ui-handlers.js';

let interactionHandler = null;
// Initialize
document.addEventListener('DOMContentLoaded', init);
function init() {
    state.canvas = document.getElementById('teamCanvas');
    state.ctx = state.canvas.getContext('2d');
    initCanvasPolyfills();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    // Setup interaction handler
    if (state.canvas && state.ctx) {
        interactionHandler = new CanvasInteractionHandler(state.canvas, state, draw);
        state.onTeamDoubleClick = (team) => showTeamDetails(team, state.currentView);
    }
    // Setup UI event listeners
    setupUIEventListeners(loadAllTeams, draw, openAddTeamModal, closeModal, closeDetailModal, closeInteractionModeModal, handleTeamSubmit, selectTeam);
    // Load initial data
    loadAllTeams();
}
function resizeCanvas() {
    if (!state.canvas)
        return;
    state.canvas.width = state.canvas.offsetWidth;
    state.canvas.height = state.canvas.offsetHeight;
    draw();
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
            }
            catch (error) {
                console.warn('Failed to load organization hierarchy:', error);
                state.organizationHierarchy = null;
            }
        }
        else {
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
        draw();
    }
    catch (error) {
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
        item.addEventListener('click', () => selectTeam(team));
        teamList.appendChild(item);
    });
}
function draw() {
    if (!state.ctx || !state.canvas)
        return;
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    state.ctx.save();
    state.ctx.translate(state.viewOffset.x, state.viewOffset.y);
    state.ctx.scale(state.scale, state.scale);
    
    // Filter teams by selected grouping (only in TT Design view)
    let teamsToRender = state.teams;
    if (state.currentView === 'tt' && state.selectedGrouping !== 'all') {
        if (state.selectedGrouping.startsWith('vs:')) {
            // Filter by value stream
            const valueStream = state.selectedGrouping.substring(3);
            teamsToRender = filterTeamsByValueStream(state.teams, valueStream);
        } else if (state.selectedGrouping.startsWith('pg:')) {
            // Filter by platform grouping
            const platformGrouping = state.selectedGrouping.substring(3);
            teamsToRender = filterTeamsByPlatformGrouping(state.teams, platformGrouping);
        }
    }
    
    // Draw organization hierarchy if in current view
    if (state.currentView === 'current' && state.organizationHierarchy) {
        drawCurrentStateView(state.ctx, state.organizationHierarchy, teamsToRender, (text, maxWidth) => wrapText(state.ctx, text, maxWidth));
    }
    // Draw value stream groupings (only in TT Design view)
    if (state.currentView === 'tt') {
        const valueStreamGroupings = getValueStreamGroupings(teamsToRender);
        drawValueStreamGroupings(state.ctx, valueStreamGroupings);
        
        // Draw platform groupings
        const platformGroupings = getPlatformGroupings(teamsToRender);
        drawPlatformGroupings(state.ctx, platformGroupings);
    }
    // Draw connections first (only if enabled in current view)
    if (!(state.currentView === 'current' && !state.showConnections)) {
        drawConnections(state.ctx, teamsToRender, state.currentView, state.showInteractionModes);
    }
    // Draw teams
    teamsToRender.forEach(team => drawTeam(state.ctx, team, state.selectedTeam, state.teamColorMap, (text, maxWidth) => wrapText(state.ctx, text, maxWidth), state.currentView, state.showCognitiveLoad));
    state.ctx.restore();
}
function selectTeam(team) {
    state.selectedTeam = team;
    draw();
}
