/**
 * Application State Management
 * Centralized state for the Team Topologies Visualizer
 * 
 * State is organized into logical groups:
 * - CANVAS: Rendering context shared across all views
 * - VIEW SELECTION: Which view/perspective is active
 * - TEAM DATA: Teams and type configuration (shared, content differs per view)
 * - BASELINE-SPECIFIC: Organization hierarchy, product lines, business streams
 * - TT DESIGN-SPECIFIC: Filters, interaction modes, snapshots, comparison
 * - UI STATE: Display toggles and overlays
 * - INTERACTION: Focus mode, undo history
 * 
 * Design decision: Single state object with logical groupings rather than
 * split modules. This avoids synchronization complexity in vanilla JS while
 * maintaining readability through JSDoc types and visual organization.
 * See docs/architecture.md for rationale.
 */
import { getTeamBoxWidth, getTeamBoxHeight } from '../rendering/renderer-common.js';
import { LAYOUT } from './constants.js';

/**
 * @typedef {Object} Position
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * @typedef {Object} Team
 * @property {string} team_id - Unique identifier
 * @property {string} name - Display name
 * @property {string} team_type - Team type ID
 * @property {Position} [position] - Canvas position
 * @property {string} [value_stream] - Value stream grouping (TT Design)
 * @property {string} [platform_grouping] - Platform grouping (TT Design)
 * @property {string} [product_line] - Product line (Baseline)
 * @property {string} [business_stream] - Business stream (Baseline)
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} TeamTypeConfig
 * @property {Array<{id: string, name: string, color: string, description: string}>} team_types
 */

/**
 * @typedef {Object} SelectedFilters
 * @property {string[]} valueStreams - Selected value stream names
 * @property {string[]} platformGroupings - Selected platform grouping names
 * @property {boolean} showUngrouped - Show only ungrouped teams
 */

/**
 * @typedef {Object} InteractionModeFilters
 * @property {boolean} showXasService - Show X-as-a-Service interactions
 * @property {boolean} showCollaboration - Show Collaboration interactions
 * @property {boolean} showFacilitating - Show Facilitating interactions
 */

/**
 * @typedef {Object} PositionSnapshot
 * @property {number} timestamp - When snapshot was taken
 * @property {string} view - Which view ('tt' or 'baseline')
 * @property {Array<{name: string, x: number, y: number}>} teams - Team positions
 */

// Application state object
export const state = {
    // ═══════════════════════════════════════════════════════════════════════
    // CANVAS - Rendering context (shared across all views)
    // ═══════════════════════════════════════════════════════════════════════
    /** @type {HTMLCanvasElement|null} */
    canvas: null,
    /** @type {CanvasRenderingContext2D|null} */
    ctx: null,
    /** @type {number} Zoom level (1 = 100%) */
    scale: 1,
    /** @type {Position} Pan offset for canvas viewport */
    viewOffset: { x: 0, y: 0 },

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW SELECTION - Which view/perspective is currently active
    // ═══════════════════════════════════════════════════════════════════════
    /** @type {'tt'|'baseline'} Main view: 'tt' = TT Design, 'baseline' = Baseline */
    currentView: 'tt',
    /** @type {'hierarchy'|'product-lines'|'business-streams'} Baseline perspective */
    currentPerspective: 'hierarchy',

    // ═══════════════════════════════════════════════════════════════════════
    // TEAM DATA - Shared structure, content differs per view
    // ═══════════════════════════════════════════════════════════════════════
    /** @type {Team[]} Currently loaded teams */
    teams: [],
    /** @type {Team|null} Currently selected team (for details panel) */
    selectedTeam: null,
    /** @type {TeamTypeConfig} Team type definitions with colors */
    teamTypeConfig: { team_types: [] },
    /** @type {Object<string, string>} Map of team type ID to color */
    teamColorMap: {},
    /** @type {Function|null} Callback for team double-click */
    onTeamDoubleClick: null,

    // ═══════════════════════════════════════════════════════════════════════
    // BASELINE-SPECIFIC - Organization hierarchy, product lines, business streams
    // ═══════════════════════════════════════════════════════════════════════
    /** @type {Object|null} Organization hierarchy data (company → depts → managers) */
    organizationHierarchy: null,
    /** @type {Object|null} Product lines perspective data */
    productLinesData: null,
    /** @type {Object|null} Business streams perspective data */
    businessStreamsData: null,
    /** @type {Map<string, {x: number, y: number, width: number, height: number}>} Team positions in product lines view */
    productLinesTeamPositions: new Map(),
    /** @type {Map<string, {x: number, y: number, width: number, height: number}>} Team positions in business streams view */
    businessStreamsTeamPositions: new Map(),

    // ═══════════════════════════════════════════════════════════════════════
    // TT DESIGN-SPECIFIC - Filters, snapshots, comparison
    // ═══════════════════════════════════════════════════════════════════════
    /** @type {string} Legacy grouping format: 'all', 'vs:Name', 'pg:Name' */
    selectedGrouping: 'all',
    /** @type {SelectedFilters} Active value stream and platform grouping filters */
    selectedFilters: {
        valueStreams: [],
        platformGroupings: [],
        showUngrouped: false
    },
    /** @type {InteractionModeFilters} Which interaction types to show */
    interactionModeFilters: {
        showXasService: true,
        showCollaboration: true,
        showFacilitating: true
    },
    /** @type {boolean} Whether viewing a historical snapshot */
    isViewingSnapshot: false,
    /** @type {Object|null} Currently loaded snapshot data */
    currentSnapshot: null,
    /** @type {Object|null} Metadata for current snapshot */
    snapshotMetadata: null,
    /** @type {boolean} Whether comparing two snapshots */
    isComparingSnapshots: false,
    /** @type {Object|null} Comparison data (before/after snapshots + diff) */
    comparisonData: null,

    // ═══════════════════════════════════════════════════════════════════════
    // UI STATE - Display toggles and overlays
    // ═══════════════════════════════════════════════════════════════════════
    /** @type {boolean} Show dependency/interaction lines */
    showConnections: false,
    /** @type {boolean} Show cognitive load indicators */
    showCognitiveLoad: false,
    /** @type {boolean} Show platform consumer dashboard (TT Design only) */
    showPlatformConsumers: false,
    /** @type {boolean} Show flow metrics overlay */
    showFlowMetrics: false,
    /** @type {boolean} Show team type badges in product lines view (Baseline) */
    showTeamTypeBadges: false,
    /** @type {boolean} Show Flow of Change banner arrow (TT Design only) */
    showFlowOfChangeBanner: false,

    // ═══════════════════════════════════════════════════════════════════════
    // INTERACTION STATE - Focus mode, undo history
    // ═══════════════════════════════════════════════════════════════════════
    /** @type {Team|null} Team in focus mode (dims other teams) */
    focusedTeam: null,
    /** @type {Set<string>} Team names connected to focused team */
    focusedConnections: new Set(),
    /** @type {PositionSnapshot[]} Position history for undo */
    positionHistory: [],
    /** @type {number} Maximum undo history size */
    maxHistorySize: 10
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
    if (state.currentView === 'baseline' && state.currentPerspective === 'hierarchy' && state.organizationHierarchy) {
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
    if (state.currentView === 'baseline' && state.currentPerspective === 'product-lines' && state.productLinesTeamPositions) {
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
    } else if (state.currentView === 'baseline' && state.currentPerspective === 'business-streams' && state.businessStreamsTeamPositions) {

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
