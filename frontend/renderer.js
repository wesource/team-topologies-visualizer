// Canvas rendering coordination
import { drawCurrentStateView } from './renderer-current.js';
import { drawProductLinesView } from './renderer-product-lines.js';
import { renderBusinessStreamsView } from './renderer-business-streams.js';
import { drawTeam, drawConnections, wrapText, drawValueStreamGroupings, drawPlatformGroupings } from './renderer-common.js';
import { getValueStreamGroupings } from './tt-value-stream-grouping.js';
import { getPlatformGroupings } from './tt-platform-grouping.js';
import { getFilteredTeams } from './state-management.js';
import { calculatePlatformConsumers } from './platform-metrics.js';

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

    // Draw Pre-TT views (hierarchy, product-lines, or business-streams)
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
    }

    // Skip standard team drawing in product-lines and business-streams perspectives
    // (teams are already rendered inside their respective containers)
    if (state.currentView === 'current' && (state.currentPerspective === 'product-lines' || state.currentPerspective === 'business-streams')) {
        // Draw connections if enabled (use appropriate position map)
        if (state.showConnections) {
            const positionMap = state.currentPerspective === 'business-streams'
                ? state.businessStreamsTeamPositions
                : state.productLinesTeamPositions;
            drawConnections(state.ctx, teamsToRender, state.currentView, state.showInteractionModes, state.currentPerspective, positionMap, state.focusedTeam, state.focusedConnections);
        }
        // Product lines and business streams views handle team rendering - skip standard team drawing
    } else {
        // Draw connections first (only if enabled in current view)
        if (!(state.currentView === 'current' && !state.showConnections)) {
            // Use null for hierarchy view (teams use standard positions)
            const customPositions = state.currentPerspective === 'hierarchy' ? null : state.productLinesTeamPositions;
            drawConnections(state.ctx, teamsToRender, state.currentView, state.showInteractionModes, state.currentPerspective, customPositions, state.focusedTeam, state.focusedConnections);
        }

        // Draw teams
        teamsToRender.forEach(team => {
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
                state.selectedTeam,
                state.teamColorMap,
                (text, maxWidth) => wrapText(state.ctx, text, maxWidth),
                state.currentView,
                state.showCognitiveLoad,
                state.comparisonData, // Pass comparison data for highlighting
                state.showTeamTypeBadges, // Pass team type badges flag
                platformMetrics, // Pass platform consumer metrics
                state.showFlowMetrics, // Pass flow metrics flag
                state.focusedTeam, // Pass focused team
                state.focusedConnections // Pass focused connections set
            );
        });
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
