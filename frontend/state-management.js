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
    productLinesData: null, // Product lines view data
    businessStreamsData: null, // Business streams view data (Baseline only)
    productLinesTeamPositions: new Map(), // Track team positions in product lines view for click detection
    businessStreamsTeamPositions: new Map(), // Track team positions in business streams view for click detection
    currentPerspective: 'hierarchy', // 'hierarchy', 'product-lines', or 'business-streams' (Baseline only)
    selectedTeam: null,
    viewOffset: { x: 0, y: 0 },
    scale: 1,
    currentView: 'tt',
    teamTypeConfig: { team_types: [] },
    teamColorMap: {},
    onTeamDoubleClick: null,
    showConnections: false,
    showInteractionModes: true, // Interaction mode lines enabled by default
    showCognitiveLoad: false, // Cognitive load indicators disabled by default
    showPlatformConsumers: false, // Platform consumer dashboard disabled by default (TT Design view only)
    showFlowMetrics: false, // Flow metrics overlay disabled by default (optional canvas visualization)
    showTeamTypeBadges: false, // Team type badges (Feature/Platform/etc) in product lines view, disabled by default
    selectedGrouping: 'all', // Legacy format: 'all', 'vs:ValueStreamName', 'pg:PlatformGroupingName'
    selectedFilters: {
        valueStreams: [], // Array of selected value stream names
        platformGroupings: [], // Array of selected platform grouping names
        showUngrouped: false // Show only ungrouped teams (teams without value_stream or platform_grouping)
    },
    // Interaction mode filters (TT Design view only)
    interactionModeFilters: {
        showXasService: true, // Show X-as-a-Service interactions
        showCollaboration: true, // Show Collaboration interactions
        showFacilitating: true // Show Facilitating interactions
    },
    // Snapshot state
    isViewingSnapshot: false,
    currentSnapshot: null,
    snapshotMetadata: null,
    // Comparison state
    isComparingSnapshots: false,
    comparisonData: null,
    // Position history for undo functionality
    positionHistory: [],
    maxHistorySize: 10, // Keep last 10 position changes
    // Focus mode state
    focusedTeam: null, // Team object or null
    focusedConnections: new Set() // Set of team names in focus network
};

// Interaction handler (initialized in app.js)
export let interactionHandler = null;

/**
 * Set the canvas interaction handler instance
 * @param {CanvasInteractionHandler} handler - The interaction handler to use for canvas events
 */
export function setInteractionHandler(handler) {
    state.interactionHandler = handler;
}

/**
 * Get filtered teams based on current active filters (value streams, platform groupings, ungrouped)
 * @returns {Array<Object>} Filtered array of team objects matching the current filter criteria
 * @description Uses OR logic: teams match if they satisfy ANY selected filter.
 * If no filters are active, returns all teams.
 */
export function getFilteredTeams() {
    // If no filters selected, return all teams
    if (state.selectedFilters.valueStreams.length === 0 &&
        state.selectedFilters.platformGroupings.length === 0 &&
        !state.selectedFilters.showUngrouped) {
        return state.teams;
    }

    return state.teams.filter(team => {
        // OR logic: team matches if it matches ANY selected filter
        let matches = false;

        // Check value stream match (note: it's at top level, not in metadata)
        if (state.selectedFilters.valueStreams.length > 0) {
            const teamValueStream = team.value_stream;
            if (teamValueStream && state.selectedFilters.valueStreams.includes(teamValueStream)) {
                matches = true;
            }
        }

        // Check platform grouping match (note: it's at top level, not in metadata)
        if (state.selectedFilters.platformGroupings.length > 0) {
            const teamPlatformGrouping = team.platform_grouping;
            if (teamPlatformGrouping && state.selectedFilters.platformGroupings.includes(teamPlatformGrouping)) {
                matches = true;
            }
        }

        // Check ungrouped teams (teams without value_stream AND platform_grouping)
        if (state.selectedFilters.showUngrouped) {
            if (!team.value_stream && !team.platform_grouping) {
                matches = true;
            }
        }

        return matches;
    });
}

/**
 * Zoom in the canvas view by 20%
 * @param {Function} [drawCallback] - Optional callback to redraw canvas after zooming
 */
export function zoomIn(drawCallback) {
    state.scale = Math.min(3, state.scale * 1.2);
    updateZoomDisplay();
    if (drawCallback) drawCallback();
}

/**
 * Zoom out the canvas view by 20%
 * @param {Function} [drawCallback] - Optional callback to redraw canvas after zooming
 */
export function zoomOut(drawCallback) {
    state.scale = Math.max(0.1, state.scale / 1.2);
    updateZoomDisplay();
    if (drawCallback) drawCallback();
}

/**
 * Auto-fit all teams into the visible canvas area
 * @param {HTMLCanvasElement} canvas - The canvas element to fit content within
 * @param {Array<Object>} teams - Array of team objects with position data
 * @param {Function} [drawCallback] - Optional callback to redraw canvas after fitting
 * @description Calculates bounding box of all teams and adjusts zoom/pan to fit them in view with padding
 */
export function fitToView(canvas, teams, drawCallback) {
    if (!teams || teams.length === 0) return;

    // Calculate bounding box of all teams
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    teams.forEach(team => {
        const x = team.position?.x || 0;
        const y = team.position?.y || 0;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + 200); // Team width
        maxY = Math.max(maxY, y + 80);  // Team height
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const padding = 50;

    // Get sidebar width to adjust canvas visible area
    const sidebar = document.querySelector('.sidebar');
    const sidebarWidth = sidebar ? sidebar.offsetWidth : 250;
    // Use CSS dimensions instead of scaled canvas dimensions
    const visibleCanvasWidth = canvas.clientWidth - sidebarWidth;

    // Calculate scale to fit content in visible canvas area
    const scaleX = (visibleCanvasWidth - padding * 2) / contentWidth;
    const scaleY = (canvas.clientHeight - padding * 2) / contentHeight;
    state.scale = Math.min(scaleX, scaleY, 1.5); // Cap at 150% zoom

    // Center the content in visible canvas area
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    state.viewOffset.x = sidebarWidth + visibleCanvasWidth / 2 - centerX * state.scale;
    state.viewOffset.y = canvas.clientHeight / 2 - centerY * state.scale;

    updateZoomDisplay();
    if (drawCallback) drawCallback();
}

export function updateZoomDisplay() {
    const zoomLevel = document.getElementById('zoomLevel');
    if (zoomLevel) {
        zoomLevel.textContent = `${Math.round(state.scale * 100)}%`;
    }
}

/**
 * Capture current team positions for undo functionality
 * Stores a snapshot of all team positions before making changes
 * @description Called before drag operations and auto-align to enable undo
 */
export function pushPositionSnapshot() {
    const snapshot = {
        timestamp: Date.now(),
        view: state.currentView,
        teams: state.teams.map(team => ({
            name: team.name,
            x: team.position?.x || 0,
            y: team.position?.y || 0
        }))
    };

    state.positionHistory.push(snapshot);

    // Keep only last N snapshots
    if (state.positionHistory.length > state.maxHistorySize) {
        state.positionHistory.shift();
    }
}

/**
 * Get the most recent position snapshot
 * @returns {Object|null} Last position snapshot or null if history is empty
 */
export function popPositionSnapshot() {
    return state.positionHistory.pop();
}

/**
 * Check if undo is available
 * @returns {boolean} True if there are position snapshots to undo
 */
export function canUndo() {
    return state.positionHistory.length > 0;
}

/**
 * Clear position history (called on view switch or data refresh)
 */
export function clearPositionHistory() {
    state.positionHistory = [];
}

export default state;
