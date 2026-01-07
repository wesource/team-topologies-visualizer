// Canvas rendering coordination
import { drawCurrentStateView } from './renderer-current.js';
import { drawProductLinesView } from './renderer-product-lines.js';
import { renderValueStreamsView } from './renderer-value-streams.js';
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

    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    state.ctx.save();
    state.ctx.translate(state.viewOffset.x, state.viewOffset.y);
    state.ctx.scale(state.scale, state.scale);

    // Filter teams using new multi-select filter system
    const teamsToRender = getFilteredTeams();

    // Draw Pre-TT views (hierarchy, product-lines, or value-streams)
    if (state.currentView === 'current') {
        if (state.currentPerspective === 'value-streams' && state.valueStreamsData) {
            // Value Streams View (nested layout)
            renderValueStreamsView(state.ctx, state.valueStreamsData);
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
                state.selectedTeam
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

    // Skip standard team drawing in product-lines and value-streams perspectives
    // (teams are already rendered inside their respective containers)
    if (state.currentView === 'current' && (state.currentPerspective === 'product-lines' || state.currentPerspective === 'value-streams')) {
        // Draw connections if enabled (use appropriate position map)
        if (state.showConnections) {
            const positionMap = state.currentPerspective === 'value-streams'
                ? state.valueStreamsTeamPositions
                : state.productLinesTeamPositions;
            drawConnections(state.ctx, teamsToRender, state.currentView, state.showInteractionModes, state.currentPerspective, positionMap, state.focusedTeam, state.focusedConnections);
        }
        // Product lines and value streams views handle team rendering - skip standard team drawing
    } else {
        // Draw connections first (only if enabled in current view)
        if (!(state.currentView === 'current' && !state.showConnections)) {
            drawConnections(state.ctx, teamsToRender, state.currentView, state.showInteractionModes, state.currentPerspective, state.productLinesTeamPositions, state.focusedTeam, state.focusedConnections);
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
