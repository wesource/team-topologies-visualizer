/**
 * Application State Management
 * Centralized state for the Team Topologies Visualizer
 */

// Application state object
export const state = {
    canvas: null,
    ctx: null,
    teams: [],
    organizationHierarchy: null,
    selectedTeam: null,
    viewOffset: { x: 0, y: 0 },
    scale: 1,
    currentView: 'current',
    teamTypeConfig: { team_types: [] },
    teamColorMap: {},
    onTeamDoubleClick: null,
    showConnections: false,
    showInteractionModes: true, // Interaction mode lines enabled by default
    showCognitiveLoad: false, // Cognitive load indicators disabled by default
    selectedGrouping: 'all' // Format: 'all', 'vs:ValueStreamName', 'pg:PlatformGroupingName'
};

// Interaction handler (initialized in app.js)
export let interactionHandler = null;

export function setInteractionHandler(handler) {
    exports.interactionHandler = handler;
}

// Helper to get filtered teams based on current grouping
export function getFilteredTeams() {
    if (state.selectedGrouping === 'all') {
        return state.teams;
    }
    
    // Value stream filter
    if (state.selectedGrouping.startsWith('vs:')) {
        const valueStreamName = state.selectedGrouping.substring(3);
        const { filterTeamsByValueStream } = require('./value-stream-grouping.js');
        return filterTeamsByValueStream(state.teams, valueStreamName);
    }
    
    // Platform grouping filter
    if (state.selectedGrouping.startsWith('pg:')) {
        const platformGroupingName = state.selectedGrouping.substring(3);
        const { filterTeamsByPlatformGrouping } = require('./platform-grouping.js');
        return filterTeamsByPlatformGrouping(state.teams, platformGroupingName);
    }
    
    return state.teams;
}
