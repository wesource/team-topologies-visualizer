import { LAYOUT } from '../core/constants.js';
import { debugLog } from '../core/config.js';
import { darkenColor, getCognitiveLoadIndicator } from './color-utils.js';
import { initCanvasPolyfills, getTeamAtPosition as getTeamAtPositionUtil } from './canvas-utils.js';
import { wrapText } from './text-rendering.js';
import { drawConnections as drawConnectionsUtil } from './connection-rendering.js';
import {
    drawValueStreamGroupings as drawValueStreamGroupingsUtil,
    drawPlatformGroupings as drawPlatformGroupingsUtil,
    drawValueStreamInnerGroupings as drawValueStreamInnerGroupingsUtil,
    drawPlatformInnerGroupings as drawPlatformInnerGroupingsUtil
} from './grouping-rendering.js';
import {
    drawTeam as drawTeamUtil,
    calculateFlowMetricsHealth as calculateFlowMetricsHealthUtil,
    drawFlowMetricsBox as drawFlowMetricsBoxUtil
} from './team-rendering.js';

// Re-export color utilities (for backward compatibility)
export { darkenColor, getCognitiveLoadIndicator } from './color-utils.js';
// Re-export canvas utilities (for backward compatibility)
export { initCanvasPolyfills } from './canvas-utils.js';
// Re-export text rendering utilities (for backward compatibility)
export { wrapText } from './text-rendering.js';
// Re-export connection rendering utilities (for backward compatibility)
export { INTERACTION_STYLES, getBoxEdgePoint } from './connection-rendering.js';
// Re-export grouping rendering utilities (for backward compatibility)
export {
    drawValueStreamGroupings,
    drawPlatformGroupings,
    drawValueStreamInnerGroupings,
    drawPlatformInnerGroupings
} from './grouping-rendering.js';
// Re-export team rendering utilities (for backward compatibility)
export { calculateFlowMetricsHealth, drawFlowMetricsBox } from './team-rendering.js';

// Track warnings to avoid console spam (only show each unique warning once)
const shownWarnings = new Set();

/**
 * Calculate team box width based on team type
 * In TT Design view, stream-aligned and platform teams are wide (spanning flow of change)
 * Enabling teams are vertical (narrow), complicated-subsystem teams are octagonal
 * @param {Object} team - Team object
 * @param {string} currentView - Current view ('current' or 'tt')
 * @returns {number} Width in pixels
 */
export function getTeamBoxWidth(team, currentView = 'current') {
    // In TT Design view, use team-type-specific shapes
    if (currentView === 'tt') {
        // Enabling teams: vertical (narrow, width ~ 2× stream-aligned height)
        if (team.team_type === 'enabling') {
            return 60;
        }
        // Complicated-Subsystem teams: octagon (compact)
        if (team.team_type === 'complicated-subsystem') {
            return 100;
        }
        // Stream-aligned and platform teams: always wide horizontal (regardless of grouping)
        if (team.team_type === 'stream-aligned' || team.team_type === 'platform') {
            // Wide box spanning the flow of change
            return 560;
        }
    }
    // Default width for all other cases
    return LAYOUT.TEAM_BOX_WIDTH;
}

/**
 * Calculate team box height based on team type
 * @param {Object} team - Team object
 * @param {string} currentView - Current view ('current' or 'tt')
 * @returns {number} Height in pixels
 */
export function getTeamBoxHeight(team, currentView = 'current') {
    // In TT Design view, enabling teams are tall (vertical orientation)
    if (currentView === 'tt' && team.team_type === 'enabling') {
        return 140;
    }
    // Complicated-subsystem teams: compact square for octagon
    if (currentView === 'tt' && team.team_type === 'complicated-subsystem') {
        return 100;
    }
    // Stream-aligned teams: shorter to distinguish from platform teams
    if (currentView === 'tt' && team.team_type === 'stream-aligned') {
        return 64; // 20% reduction from default 80px
    }
    // Default height (platform teams and all baseline view teams)
    return LAYOUT.TEAM_BOX_HEIGHT;
}

/**
 * Draw a team box on the canvas with appropriate styling and shape
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {Object} team - Team object with position, name, type, etc.
 * @param {Object|null} selectedTeam - Currently selected team (for highlight styling)
 * @param {Object} teamColorMap - Map of team types to color hex codes
 * @param {Function} wrapText - Function to wrap text within a given width
 * @param {string} [currentView='current'] - Current view mode ('current' or 'tt')
 * @param {boolean} [showCognitiveLoad=false] - Whether to display cognitive load indicator
 * @param {Object|null} [comparisonData=null] - Snapshot comparison data for highlighting changes
 * @description Renders team with type-specific shapes: rounded rectangles for stream-aligned/platform,
 * vertical boxes for enabling teams, octagons for complicated-subsystem teams
 */
/**
 * Draw a team box on the canvas - wrapper that provides dependencies
 */
export function drawTeam(ctx, team, options = {}) {
    return drawTeamUtil(ctx, team, getTeamBoxWidth, getTeamBoxHeight, options);
}

/**
 * Draw connections - wrapper that provides dependencies
 */
export function drawConnections(ctx, teams, options = {}) {
    return drawConnectionsUtil(ctx, teams, getTeamBoxWidth, getTeamBoxHeight, options);
}

function getTeamColor(team, teamColorMap) {
    // Try to get color from team type config
    if (team.team_type && teamColorMap[team.team_type]) {
        return teamColorMap[team.team_type];
    }
    // Final fallback
    return '#95a5a6';
}

/**
 * Get team at given canvas position - wrapper that provides dependencies
 */
export function getTeamAtPosition(teams, x, y, viewOffset, scale, currentView = 'current', currentPerspective = 'hierarchy', customTeamPositions = null) {
    return getTeamAtPositionUtil(teams, x, y, viewOffset, scale, currentView, currentPerspective, customTeamPositions, getTeamBoxWidth, getTeamBoxHeight);
}

/**
 * Draw Flow of Change banner arrow (TT Design view only)
 * Shows horizontal left-to-right flow direction as described in Team Topologies
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width for spanning calculation
 * @param {number} canvasHeight - Canvas height for vertical positioning
 * @param {Array<Object>} teams - Array of team objects (to calculate bounding box)
 * @description Draws a large horizontal banner arrow with dashed outline at bottom of canvas.
 * Arrow features asymmetric arrowhead (top edge angled up, bottom edge angled down) and
 * "Flow of Change" label as per Team Topologies Team Shape Templates PDF.
 */
export function drawFlowOfChangeBanner(ctx, canvasWidth, canvasHeight, teams) {
    if (!teams || teams.length === 0) return;

    // Calculate bounding box of all teams to determine arrow positioning
    const teamBounds = teams.reduce((bounds, team) => {
        const width = getTeamBoxWidth(team, 'tt');
        const height = getTeamBoxHeight(team, 'tt');
        const right = team.position.x + width;
        const bottom = team.position.y + height;
        
        return {
            minX: Math.min(bounds.minX, team.position.x),
            maxX: Math.max(bounds.maxX, right),
            minY: Math.min(bounds.minY, team.position.y),
            maxY: Math.max(bounds.maxY, bottom)
        };
    }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });

    // Arrow dimensions and positioning
    const arrowPadding = 40; // Padding from sides
    const arrowY = teamBounds.maxY + 80; // Position below all teams
    
    // Center arrow based on team positions with reasonable width
    const teamCenterX = (teamBounds.minX + teamBounds.maxX) / 2;
    const arrowWidth = Math.min(800, teamBounds.maxX - teamBounds.minX + arrowPadding * 2);
    const arrowStartX = teamCenterX - arrowWidth / 2;
    const arrowEndX = teamCenterX + arrowWidth / 2;
    
    // FlexArrow dimensions (shaft height 3x larger for text)
    const shaftHeight = 81; // Uniform shaft height (3x original 27px)
    const headWidth = 75; // Width of triangular head base (45-degree angle)
    const headHeight = 150; // Full height of arrowhead (large, prominent)

    // Arrow style (dashed, matching facilitating interaction mode [5, 5])
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // Match facilitating interaction mode dash pattern
    ctx.fillStyle = 'none'; // No fill, just dashed outline

    // Draw flexArrow path (uniform-width shaft with simple triangular head)
    ctx.beginPath();
    
    // Calculate shaft top edge Y position (vertically center the shaft within headHeight)
    const shaftTopY = arrowY + (headHeight - shaftHeight) / 2;
    const shaftEndX = arrowEndX - headWidth;
    
    // Start at bottom-left of shaft
    ctx.moveTo(arrowStartX, shaftTopY + shaftHeight);
    // Top-left of shaft
    ctx.lineTo(arrowStartX, shaftTopY);
    // Top edge of shaft to arrowhead connection
    ctx.lineTo(shaftEndX, shaftTopY);
    // Top edge of arrowhead
    ctx.lineTo(shaftEndX, arrowY);
    // Arrow point (center)
    ctx.lineTo(arrowEndX, arrowY + headHeight / 2);
    // Bottom edge of arrowhead
    ctx.lineTo(shaftEndX, arrowY + headHeight);
    // Bottom edge of shaft at arrowhead
    ctx.lineTo(shaftEndX, shaftTopY + shaftHeight);
    // Close path back to start
    ctx.closePath();
    ctx.stroke();

    // Draw "Flow of Change" label centered in arrow
    ctx.setLineDash([]); // Reset dash for text
    ctx.font = '18px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const labelX = arrowStartX + (arrowEndX - arrowStartX) / 2;
    const labelY = arrowY + headHeight / 2;
    
    // Add text background for better readability
    const textMetrics = ctx.measureText('Flow of Change');
    const textPadding = 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(
        labelX - textMetrics.width / 2 - textPadding,
        labelY - 12,
        textMetrics.width + textPadding * 2,
        24
    );
    
    // Draw text
    ctx.fillStyle = '#333333';
    ctx.fillText('Flow of Change', labelX, labelY);
}
