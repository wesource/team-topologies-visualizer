/**
 * Application State Management
 * Centralized state for the Team Topologies Visualizer
 */
import { getTeamBoxWidth, getTeamBoxHeight } from '../rendering/renderer-common.js';
import { LAYOUT } from './constants.js';

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

    // Get filtered teams (respect current filters)
    const visibleTeams = getFilteredTeams(teams);
    if (visibleTeams.length === 0) return;

    // Calculate bounding box using actual team dimensions
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    // For hierarchy view in baseline, account for organizational structure (company, depts, line managers)
    if (state.currentView === 'current' && state.currentPerspective === 'hierarchy' && state.organizationHierarchy) {
        // Include header: title at y=10 (startY=50, title at startY-40)
        const headerY = 10;
        const headerX = 150 + 50; // startX + 50
        minX = Math.min(minX, headerX);
        minY = Math.min(minY, headerY - 10); // Include title with small margin above (y=0)

        // Company box: starts at x=150+400=550, y=50 (COMPANY_Y), width=300, height=80
        minX = Math.min(minX, 150); // Account for left margin (startX in renderer-current.js)
        minY = Math.min(minY, 50); // COMPANY_Y
        maxX = Math.max(maxX, 550 + 300); // Company box right edge (150+400+300)
        maxY = Math.max(maxY, 50 + 80); // Company box bottom

        // Departments and line managers will extend the bounds
        const deptCount = state.organizationHierarchy.company?.children?.length || 0;
        if (deptCount > 0) {
            const deptStartX = LAYOUT.DEPT_START_X; // Use constant
            const deptSpacing = LAYOUT.DEPT_SPACING; // Use constant
            const rightmostDeptX = deptStartX + (deptCount - 1) * deptSpacing + LAYOUT.DEPT_BOX_WIDTH;
            maxX = Math.max(maxX, rightmostDeptX);

            // Calculate leftmost line manager/region position
            // Line managers and regions are centered under their department
            let leftmostLMX = Infinity;
            state.organizationHierarchy.company.children.forEach(dept => {
                if (dept.line_managers && dept.line_managers.length > 0) {
                    const deptIndex = state.organizationHierarchy.company.children.indexOf(dept);
                    const deptX = deptStartX + deptIndex * deptSpacing;
                    const lmCount = dept.line_managers.length;
                    const lmStartX = deptX - ((lmCount - 1) * LAYOUT.LINE_MANAGER_SPACING) / 2;
                    leftmostLMX = Math.min(leftmostLMX, lmStartX);
                }
                if (dept.regions && dept.regions.length > 0) {
                    const deptIndex = state.organizationHierarchy.company.children.indexOf(dept);
                    const deptX = deptStartX + deptIndex * deptSpacing;
                    const regionCount = dept.regions.length;
                    const regionStartX = deptX - ((regionCount - 1) * LAYOUT.LINE_MANAGER_SPACING) / 2;
                    leftmostLMX = Math.min(leftmostLMX, regionStartX);
                }
            });
            if (leftmostLMX !== Infinity) {
                minX = Math.min(minX, leftmostLMX);
            }
        }
    }

    visibleTeams.forEach(team => {
        const x = team.position?.x || 0;
        const y = team.position?.y || 0;

        // Use actual team dimensions based on current view
        const width = getTeamBoxWidth(team, state.currentView);
        const height = getTeamBoxHeight(team, state.currentView);

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
    });

    console.log('[FitToView] Bounds from team positions:', { minX, minY, maxX, maxY });

    // Handle custom team positions for product-lines and business-streams views
    if (state.currentView === 'current' && state.currentPerspective === 'product-lines' && state.productLinesTeamPositions) {
        // Include header: title at y=60 (startY=100, title at startY-40)
        const headerY = 60;
        const headerX = 50;
        minX = Math.min(minX, headerX);
        minY = Math.min(minY, headerY - 10); // Include title with small margin above

        state.productLinesTeamPositions.forEach((bounds, _teamName) => {
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });
    } else if (state.currentView === 'current' && state.currentPerspective === 'business-streams' && state.businessStreamsTeamPositions) {

        // Include header: title at y=20 (LAYOUT.startY=40, title at startY-20)
        const headerY = 20;
        const headerX = 40; // LAYOUT.startX
        minX = Math.min(minX, headerX);
        minY = Math.min(minY, headerY - 10); // Include title with small margin above (y=10)

        state.businessStreamsTeamPositions.forEach((bounds, _teamName) => {
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });
    }

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // Calculate scale to fill FULL canvas width (sidebar overlays canvas, doesn't reduce available width)
    const fullCanvasWidth = canvas.clientWidth;
    const targetFillWidth = fullCanvasWidth - 40; // 10px left margin + 30px right margin (ensure right borders visible)
    const targetFillHeight = canvas.clientHeight - 20; // 10px margin top/bottom

    const scaleX = targetFillWidth / contentWidth;
    const scaleY = targetFillHeight / contentHeight;
    state.scale = Math.min(scaleX, scaleY, 1.5); // Cap at 150% zoom

    // Position content: Start at canvas x=0 (sidebar will overlay but won't hide teams due to left empty space)
    const leftMargin = 10;
    const topMargin = 10;

    // DON'T add sidebarWidth - content starts at canvas x=0, sidebar overlays it
    state.viewOffset.x = leftMargin - minX * state.scale;
    state.viewOffset.y = topMargin - minY * state.scale;

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
