// Canvas rendering coordination
import { drawCurrentStateView } from './renderer-current.js';
import { drawTeam, drawConnections, wrapText, drawValueStreamGroupings, drawPlatformGroupings } from './renderer-common.js';
import { getValueStreamGroupings } from './tt-value-stream-grouping.js';
import { getPlatformGroupings } from './tt-platform-grouping.js';
import { getFilteredTeams } from './state-management.js';

/**
 * Main draw function - renders entire canvas
 * @param {Object} state - Application state
 */
export function draw(state) {
    if (!state.ctx || !state.canvas)
        return;
    
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    state.ctx.save();
    state.ctx.translate(state.viewOffset.x, state.viewOffset.y);
    state.ctx.scale(state.scale, state.scale);
    
    // Filter teams using new multi-select filter system
    const teamsToRender = getFilteredTeams();
    
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

/**
 * Select a team and redraw
 * @param {Object} team - Team to select
 * @param {Object} state - Application state
 * @param {Function} drawFn - Draw function
 */
export function selectTeam(team, state, drawFn) {
    state.selectedTeam = team;
    drawFn(state);
}
