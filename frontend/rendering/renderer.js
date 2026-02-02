// Canvas rendering coordination
import { drawCurrentStateView } from './renderer-current.js';
import { drawProductLinesView } from './renderer-product-lines.js';
import { renderBusinessStreamsView } from './renderer-business-streams.js';
import { drawTeam, drawConnections, wrapText, drawValueStreamGroupings, drawPlatformGroupings, drawValueStreamInnerGroupings, drawPlatformInnerGroupings, drawFlowOfChangeBanner } from './renderer-common.js';
import { getValueStreamGroupings, getValueStreamInnerGroupings } from '../tt-concepts/tt-value-stream-grouping.js';
import { getPlatformGroupings, getPlatformInnerGroupings } from '../tt-concepts/tt-platform-grouping.js';
import { getFilteredTeams } from '../core/state-management.js';
import { calculatePlatformConsumers } from '../tt-concepts/platform-metrics.js';

// Organizational structure team types that should only appear in hierarchy, not as separate boxes
const ORGANIZATION_STRUCTURE_TYPES = ['executive', 'leadership', 'department', 'region', 'division'];

/**
 * Main draw function - renders entire canvas
 * @param {Object} state - Application state
 */
export function draw(state) {
    if (!state.ctx || !state.canvas)
        return;

    // Use CSS dimensions for clearRect since canvas is scaled by DPR
    state.ctx.clearRect(0, 0, state.canvas.clientWidth, state.canvas.clientHeight);
    state.ctx.save();
    state.ctx.translate(state.viewOffset.x, state.viewOffset.y);
    state.ctx.scale(state.scale, state.scale);

    // Filter teams using new multi-select filter system
    const teamsToRender = getFilteredTeams();

    // Draw Baseline views (hierarchy, product-lines, or business-streams)
    if (state.currentView === 'current') {
        if (state.currentPerspective === 'business-streams' && state.businessStreamsData) {
            // Business Streams View (nested layout)
            renderBusinessStreamsView(state.ctx, state.businessStreamsData);
        } else if (state.currentPerspective === 'product-lines' && state.productLinesData) {
            // Product Lines View (hybrid layout)
            drawProductLinesView(
                state.ctx,
                state.productLinesData,
                teamsToRender,
                state.teamColorMap,
                (text, maxWidth) => wrapText(state.ctx, text, maxWidth),
                state.showCognitiveLoad,
                state.productLinesTeamPositions,
                state.showTeamTypeBadges,
                state.selectedTeam,
                state.focusedTeam,
                state.focusedConnections
            );
        } else if (state.organizationHierarchy) {
            // Hierarchy View (org chart)
            drawCurrentStateView(state.ctx, state.organizationHierarchy, teamsToRender, (text, maxWidth) => wrapText(state.ctx, text, maxWidth));
        }
    }

    // Draw value stream groupings (only in TT Design view)
    if (state.currentView === 'tt') {
        const valueStreamGroupings = getValueStreamGroupings(teamsToRender);
        drawValueStreamGroupings(state.ctx, valueStreamGroupings);

        // Draw platform groupings
        const platformGroupings = getPlatformGroupings(teamsToRender);
        drawPlatformGroupings(state.ctx, platformGroupings);

        // Draw inner groupings (nested boxes) after outer groupings but before teams
        const valueStreamInnerGroupings = getValueStreamInnerGroupings(teamsToRender);
        drawValueStreamInnerGroupings(state.ctx, valueStreamInnerGroupings);

        const platformInnerGroupings = getPlatformInnerGroupings(teamsToRender);
        drawPlatformInnerGroupings(state.ctx, platformInnerGroupings);
    }

    // Skip standard team drawing in product-lines and business-streams perspectives
    // (teams are already rendered inside their respective containers)
    if (state.currentView === 'current' && (state.currentPerspective === 'product-lines' || state.currentPerspective === 'business-streams')) {
        // Draw connections if enabled (use appropriate position map)
        if (state.showConnections) {
            const positionMap = state.currentPerspective === 'business-streams'
                ? state.businessStreamsTeamPositions
                : state.productLinesTeamPositions;
            drawConnections(state.ctx, teamsToRender, {
                currentView: state.currentView,
                showInteractionModes: true,
                currentPerspective: state.currentPerspective,
                customTeamPositions: positionMap,
                focusedTeam: state.focusedTeam,
                focusedConnections: state.focusedConnections,
                interactionModeFilters: state.interactionModeFilters
            });
        }
        // Product lines and business streams views handle team rendering - skip standard team drawing
    } else {
        // Draw connections first (only if enabled in current view)
        if (!(state.currentView === 'current' && !state.showConnections)) {
            // Use null for hierarchy view (teams use standard positions)
            const customPositions = state.currentPerspective === 'hierarchy' ? null : state.productLinesTeamPositions;
            drawConnections(state.ctx, teamsToRender, {
                currentView: state.currentView,
                showInteractionModes: true,
                currentPerspective: state.currentPerspective,
                customTeamPositions: customPositions,
                focusedTeam: state.focusedTeam,
                focusedConnections: state.focusedConnections,
                interactionModeFilters: state.interactionModeFilters
            });
        }

        // Draw teams (exclude organizational structure teams in hierarchy view)
        const teamsToDrawAsBoxes = (state.currentView === 'current' && state.currentPerspective === 'hierarchy')
            ? teamsToRender.filter(team => !ORGANIZATION_STRUCTURE_TYPES.includes(team.team_type))
            : teamsToRender;

        teamsToDrawAsBoxes.forEach(team => {
            // Calculate platform metrics ONLY when:
            // 1. In TT Design view
            // 2. Checkbox is enabled
            // 3. Team is a Platform team
            const platformMetrics = (state.currentView === 'tt' &&
                                    state.showPlatformConsumers &&
                                    team.team_type === 'platform')
                ? calculatePlatformConsumers(team.name, state.teams)
                : null;

            drawTeam(
                state.ctx,
                team,
                {
                    selectedTeam: state.selectedTeam,
                    teamColorMap: state.teamColorMap,
                    wrapText: (text, maxWidth) => wrapText(state.ctx, text, maxWidth),
                    currentView: state.currentView,
                    showCognitiveLoad: state.showCognitiveLoad,
                    comparisonData: state.comparisonData, // Pass comparison data for highlighting
                    showTeamTypeBadges: state.showTeamTypeBadges, // Pass team type badges flag
                    platformMetrics, // Pass platform consumer metrics
                    showFlowMetrics: state.showFlowMetrics, // Pass flow metrics flag
                    focusedTeam: state.focusedTeam, // Pass focused team
                    focusedConnections: state.focusedConnections // Pass focused connections set
                }
            );
        });
    }

    // Draw Flow of Change banner arrow (only in TT Design view when enabled)
    if (state.currentView === 'tt' && state.showFlowOfChangeBanner) {
        // Get canvas dimensions in world coordinates (accounting for DPR)
        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = state.canvas.width / dpr;
        const canvasHeight = state.canvas.height / dpr;
        drawFlowOfChangeBanner(state.ctx, canvasWidth, canvasHeight, teamsToRender);
    }

    state.ctx.restore();

    // Update hidden test state for E2E testing
    updateTestState(state, teamsToRender);
}

/**
 * Update hidden DOM element with current canvas state for E2E testing
 * @param {Object} state - Application state
 * @param {Array} teamsToRender - Filtered teams being rendered
 */
function updateTestState(state, teamsToRender) {
    const testState = document.getElementById('canvasTestState');
    if (testState) {
        testState.setAttribute('data-total-teams', state.teams.length);
        testState.setAttribute('data-filtered-teams', teamsToRender.length);
        testState.setAttribute('data-active-filters',
            JSON.stringify({
                valueStreams: state.selectedFilters?.valueStreams || [],
                platformGroupings: state.selectedFilters?.platformGroupings || []
            })
        );
        testState.setAttribute('data-search-term', state.searchTerm || '');
        testState.setAttribute('data-current-view', state.currentView);

        // Focus mode state for E2E testing
        testState.setAttribute('data-focused-team', state.focusedTeam ? state.focusedTeam.name : '');
        testState.setAttribute('data-focused-connections',
            state.focusedConnections && state.focusedConnections.size > 0
                ? JSON.stringify(Array.from(state.focusedConnections))
                : ''
        );
    }
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
