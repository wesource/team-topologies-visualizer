/**
 * Connection rendering utilities for Team Topologies visualizations
 * Handles drawing connections between teams in both baseline and TT design views
 */

import { debugLog } from '../core/config.js';
import { LAYOUT } from '../core/constants.js';

// Track warnings to avoid console spam (only show each unique warning once)
const shownWarnings = new Set();

// Interaction mode styles (official Team Topologies palette)
// Using official shapes with 50% transparency as per Team-Shape-Templates repo
export const INTERACTION_STYLES = {
    'collaboration': { 
        shape: 'parallelogram',  // Solid line
        color: '#967EE2',        // Official purple (Team-Shape-Templates)
        opacity: 1.0,            // Solid
        width: 2,                // Line width
        dash: []                 // Solid stroke (not dashed)
    },
    'x-as-a-service': { 
        shape: 'line',           // Simple line with triangle marker
        color: '#222222',        // Black
        opacity: 1.0,            // Solid
        width: 2,                // Line width
        dash: [2, 4]             // Dotted stroke
    },
    'facilitating': { 
        shape: 'circle',         // Dashed circle
        color: '#6fa98c',        // Official green (Team-Shape-Templates)
        opacity: 1.0,            // Solid
        width: 2,                // Line width
        dash: [5, 5]             // Dotted stroke
    }
};

/**
 * Calculate intersection point where a line at given angle intersects a rectangular box edge
 * @param {number} centerX - Box center X coordinate
 * @param {number} centerY - Box center Y coordinate
 * @param {number} width - Box width
 * @param {number} height - Box height
 * @param {number} angle - Angle in radians from box center
 * @returns {{x: number, y: number}} - Intersection point coordinates
 */
export function getBoxEdgePoint(centerX, centerY, width, height, angle) {
    // Return the center point of the appropriate edge for cleaner, more symmetrical connections
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Determine which edge to use based on angle direction
    if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
        // More horizontal: use left or right edge center
        if (Math.cos(angle) > 0) {
            // Right edge center
            return {
                x: centerX + halfWidth,
                y: centerY
            };
        } else {
            // Left edge center
            return {
                x: centerX - halfWidth,
                y: centerY
            };
        }
    } else {
        // More vertical: use top or bottom edge center
        if (Math.sin(angle) > 0) {
            // Bottom edge center
            return {
                x: centerX,
                y: centerY + halfHeight
            };
        } else {
            // Top edge center
            return {
                x: centerX,
                y: centerY - halfHeight
            };
        }
    }
}

/**
 * Draw connections between teams based on current view
 * - Baseline view: Draws "Actual Communications" from dependencies
 * - TT Design view: Draws "Interaction Modes" (X-as-a-Service, Collaboration, Facilitating)
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} teams - Array of team objects
 * @param {Function} getTeamBoxWidth - Function to calculate team box width
 * @param {Function} getTeamBoxHeight - Function to calculate team box height
 * @param {Object} options - Drawing options
 * @param {string} options.currentView - Current view ('current' for baseline, 'tt' for TT Design)
 * @param {boolean} options.showInteractionModes - Show interaction modes (TT view only)
 * @param {string} options.currentPerspective - Current perspective ('hierarchy', 'product-lines', etc.)
 * @param {Map} options.customTeamPositions - Custom positions for product-lines/business-streams
 * @param {Object} options.focusedTeam - Team in focus mode
 * @param {Set} options.focusedConnections - Set of team names in focus
 * @param {Object} options.interactionModeFilters - Filters for interaction modes
 */
export function drawConnections(ctx, teams, getTeamBoxWidth, getTeamBoxHeight, options = {}) {
    const {
        currentView = 'current',
        showInteractionModes = true,
        currentPerspective = 'hierarchy',
        customTeamPositions = null,
        focusedTeam = null,
        focusedConnections = null,
        interactionModeFilters = null
    } = options;

    // Debug: drawConnections called

    if (currentView === 'current') {
        // Current State view: show simple "Actual Comms" from dependencies
        // Track drawn connections to avoid duplicates (bidirectional)
        const drawnConnections = new Set();
        
        teams.forEach(team => {
            if (team.dependencies && Array.isArray(team.dependencies)) {
                // Debug logging for specific team
                if (team.name === 'Web Frontend Team') {
                    // Debug: ${team.name} has dependencies
                }
                team.dependencies.forEach(targetName => {
                    const target = teams.find(t => t.name === targetName);
                    if (target) {
                        // Create normalized connection key (alphabetically sorted to avoid duplicates)
                        const connectionKey = [team.name, target.name].sort().join('<=>');
                        
                        // Only draw if we haven't drawn this connection yet
                        if (!drawnConnections.has(connectionKey)) {
                            drawnConnections.add(connectionKey);
                            drawActualCommsConnection(ctx, team, target, getTeamBoxWidth, getTeamBoxHeight, {
                                currentView,
                                currentPerspective,
                                customTeamPositions,
                                focusedTeam,
                                focusedConnections
                            });
                        }
                    } else {
                        // Only show each unique warning once to avoid console spam
                        const warningKey = `${team.name}:${targetName}`;
                        if (!shownWarnings.has(warningKey)) {
                            shownWarnings.add(warningKey);
                            debugLog(`⚠️ Dependency target "${targetName}" not found for team "${team.name}"`);
                        }
                    }
                });
            }
        });
    } else if (showInteractionModes) {
        // TT Design view: show interaction modes (only if checkbox is enabled)
        teams.forEach(team => {
            if (team.interaction_modes) {
                // Note: interaction_modes keys can be either team_id (kebab-case) or team name (title case)
                // - YAML interactions array uses team_id: "payment-processing-team" (user-friendly)
                // - Markdown tables use Team Name: "Payment Processing Team" (legacy)
                // Frontend supports both formats for ease of use
                Object.entries(team.interaction_modes).forEach(([targetName, mode]) => {
                    // Filter based on interaction mode filters (if provided)
                    if (interactionModeFilters) {
                        if (mode === 'x-as-a-service' && !interactionModeFilters.showXasService) return;
                        if (mode === 'collaboration' && !interactionModeFilters.showCollaboration) return;
                        if (mode === 'facilitating' && !interactionModeFilters.showFacilitating) return;
                    }

                    // Support both team_id (kebab-case) and name (title case) for user convenience
                    const target = teams.find(t => t.team_id === targetName || t.name === targetName);
                    if (target) {
                        drawInteractionMode(ctx, team, target, mode, getTeamBoxWidth, getTeamBoxHeight, {
                            currentView,
                            currentPerspective,
                            customTeamPositions,
                            focusedTeam,
                            focusedConnections
                        });
                    }
                });
            }
        });
    }
}

/**
 * Draw an interaction mode connection between two teams (TT Design view)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} from - Source team
 * @param {Object} to - Target team  
 * @param {string} mode - Interaction mode ('x-as-a-service', 'collaboration', 'facilitating')
 * @param {Function} getTeamBoxWidth - Function to calculate team box width
 * @param {Function} getTeamBoxHeight - Function to calculate team box height
 * @param {Object} options - Drawing options
 * @param {string} options.currentView - Current view ('current' or 'tt')
 * @param {string} options.currentPerspective - Current perspective ('hierarchy', 'product-lines', etc.)
 * @param {Map} options.customTeamPositions - Custom team positions for product-lines/business-streams views
 * @param {Object} options.focusedTeam - Team in focus mode (if any)
 * @param {Set} options.focusedConnections - Set of focused team names (if in focus mode)
 */
function drawInteractionMode(ctx, from, to, mode, getTeamBoxWidth, getTeamBoxHeight, options = {}) {
    const {
        currentView = 'current',
        currentPerspective = 'hierarchy',
        customTeamPositions = null,
        focusedTeam = null,
        focusedConnections = null
    } = options;

    const style = INTERACTION_STYLES[mode] || INTERACTION_STYLES['collaboration'];

    // Debug: drawConnection (TT interaction)

    // Apply opacity and line width based on focus mode
    let opacity = 1.0;
    let lineWidthBoost = 0;
    if (focusedTeam && focusedConnections) {
        // Only highlight connections where the focused team is one of the endpoints
        if (from.name === focusedTeam.name || to.name === focusedTeam.name) {
            opacity = 1.0; // Full opacity for focused connections
            lineWidthBoost = 2; // Make focused lines thicker (+2px)
        } else {
            opacity = 0.1; // Nearly invisible for unrelated connections
        }
    }
    ctx.globalAlpha = opacity;

    let fromCenterX, fromCenterY, toCenterX, toCenterY;
    let fromWidth, fromHeight, toWidth, toHeight;

    // Use custom positions if in product-lines or business-streams perspective
    if (currentView === 'current' && (currentPerspective === 'product-lines' || currentPerspective === 'business-streams') && customTeamPositions) {
        const fromBounds = customTeamPositions.get(from.name);
        const toBounds = customTeamPositions.get(to.name);

        // Debug: checking connection positions

        if (fromBounds && toBounds) {
            fromWidth = fromBounds.width || 120;
            fromHeight = fromBounds.height || 50;
            toWidth = toBounds.width || 120;
            toHeight = toBounds.height || 50;
            fromCenterX = fromBounds.x + fromWidth / 2;
            fromCenterY = fromBounds.y + fromHeight / 2;
            toCenterX = toBounds.x + toWidth / 2;
            toCenterY = toBounds.y + toHeight / 2;

            // Debug: connection details
        } else {
            // One or both teams not visible in this perspective - skip drawing
            ctx.globalAlpha = 1.0;
            return;
        }
    } else {
        // Calculate center points dynamically based on team box width and height
        fromWidth = getTeamBoxWidth(from, currentView);
        toWidth = getTeamBoxWidth(to, currentView);
        fromHeight = getTeamBoxHeight(from, currentView);
        toHeight = getTeamBoxHeight(to, currentView);
        fromCenterX = from.position.x + fromWidth / 2;
        fromCenterY = from.position.y + fromHeight / 2;
        toCenterX = to.position.x + toWidth / 2;
        toCenterY = to.position.y + toHeight / 2;

        debugLog(`  📦 ${from.name} box:`, { x: from.position.x, y: from.position.y, width: fromWidth, height: fromHeight });
        debugLog(`  📦 ${to.name} box:`, { x: to.position.x, y: to.position.y, width: toWidth, height: toHeight });
    }

    // Calculate angle between centers
    const angle = Math.atan2(toCenterY - fromCenterY, toCenterX - fromCenterX);

    // For TT view: prefer top/bottom edges for wide teams (platform, stream-aligned)
    // Wide teams: lines START from top/bottom center, but END at side edges for better arrow placement
    let fromEdge, toEdge;
    if (currentView === 'tt') {
        const isFromWide = from.team_type === 'platform' || from.team_type === 'stream-aligned';

        if (isFromWide) {
            // Wide teams: use top/bottom edge for cleaner horizontal flow
            if (toCenterY > fromCenterY) {
                // Target below: use bottom edge
                fromEdge = { x: fromCenterX, y: fromCenterY + fromHeight / 2 };
            } else {
                // Target above or level: use top edge
                fromEdge = { x: fromCenterX, y: fromCenterY - fromHeight / 2 };
            }
        } else {
            // Narrow teams: use normal edge calculation
            fromEdge = getBoxEdgePoint(fromCenterX, fromCenterY, fromWidth, fromHeight, angle);
        }

        // Target edge: always use normal calculation for better arrow placement
        toEdge = getBoxEdgePoint(toCenterX, toCenterY, toWidth, toHeight, angle + Math.PI);
    } else {
        // Non-TT views: use standard edge calculation
        fromEdge = getBoxEdgePoint(fromCenterX, fromCenterY, fromWidth, fromHeight, angle);
        toEdge = getBoxEdgePoint(toCenterX, toCenterY, toWidth, toHeight, angle + Math.PI);
    }

    // Debug: line centers, edges, and style

    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width + lineWidthBoost;
    ctx.setLineDash(style.dash);
    ctx.beginPath();
    ctx.moveTo(fromEdge.x, fromEdge.y);
    ctx.lineTo(toEdge.x, toEdge.y);
    ctx.stroke();
    
    // Arrow at edge point for all interaction modes (V-shaped, larger size)
    const arrowLength = 20;
    ctx.setLineDash([]); // Solid arrow (no dash)
    ctx.beginPath();
    ctx.moveTo(toEdge.x - arrowLength * Math.cos(angle - Math.PI / 6), toEdge.y - arrowLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toEdge.x, toEdge.y);
    ctx.lineTo(toEdge.x - arrowLength * Math.cos(angle + Math.PI / 6), toEdge.y - arrowLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
    
    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0; // Reset opacity
}

/**
 * Draw "Actual Communications" connection in baseline view (from dependencies)
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} from - Source team object
 * @param {Object} to - Target team object
 * @param {Function} getTeamBoxWidth - Function to calculate team box width
 * @param {Function} getTeamBoxHeight - Function to calculate team box height
 * @param {Object} options - Drawing options
 * @param {string} options.currentView - Current view ('current' for baseline)
 * @param {string} options.currentPerspective - Current perspective ('hierarchy', 'product-lines', etc.)
 * @param {Map} options.customTeamPositions - Custom positions for product-lines/business-streams
 * @param {Object} options.focusedTeam - Team in focus mode
 * @param {Set} options.focusedConnections - Set of team names in focus
 */
function drawActualCommsConnection(ctx, from, to, getTeamBoxWidth, getTeamBoxHeight, options = {}) {
    const {
        currentView = 'current',
        currentPerspective = 'hierarchy',
        customTeamPositions = null,
        focusedTeam = null,
        focusedConnections = null
    } = options;

    // Debug: drawActualCommsConnection

    // Apply opacity and line width based on focus mode
    let opacity = 1.0;
    let lineWidthBoost = 0;
    if (focusedTeam && focusedConnections) {
        // Only highlight connections where the focused team is one of the endpoints
        if (from.name === focusedTeam.name || to.name === focusedTeam.name) {
            opacity = 1.0; // Full opacity for focused connections
            lineWidthBoost = 2; // Make focused lines thicker (+2px)
        } else {
            opacity = 0.1; // Nearly invisible for unrelated connections
        }
    }
    ctx.globalAlpha = opacity;
    // Current State view: simple bidirectional fat arrow called "Actual Comms"
    let fromCenterX, fromCenterY, toCenterX, toCenterY;
    let fromWidth, fromHeight, toWidth, toHeight;

    // Use custom positions if in product-lines or business-streams perspective
    if (currentView === 'current' && (currentPerspective === 'product-lines' || currentPerspective === 'business-streams') && customTeamPositions) {
        const fromPos = customTeamPositions.get(from.name);
        const toPos = customTeamPositions.get(to.name);

        // Debug logging to diagnose missing positions
        if ((from.name === 'Web Frontend Team' && to.name === 'Database Team') || (from.name === 'Database Team' && to.name === 'Web Frontend Team')) {
            debugLog(`🔍 ActualComms checking ${from.name} -> ${to.name}:`, {
                fromPos: fromPos ? 'found' : 'MISSING',
                toPos: toPos ? 'found' : 'MISSING',
                perspective: currentPerspective,
                mapSize: customTeamPositions.size
            });
        }

        if (fromPos && toPos) {
            fromWidth = fromPos.width || 120;
            fromHeight = fromPos.height || 50;
            toWidth = toPos.width || 120;
            toHeight = toPos.height || 50;
            fromCenterX = fromPos.x + fromWidth / 2;
            fromCenterY = fromPos.y + fromHeight / 2;
            toCenterX = toPos.x + toWidth / 2;
            toCenterY = toPos.y + toHeight / 2;

            // Debug logging for actual coordinates
            if ((from.name === 'Web Frontend Team' && to.name === 'Database Team') || (from.name === 'Database Team' && to.name === 'Web Frontend Team')) {
                debugLog(`✅ ActualComms drawing ${from.name} -> ${to.name}:`, {
                    fromPos,
                    toPos,
                    fromCenter: { x: fromCenterX, y: fromCenterY },
                    toCenter: { x: toCenterX, y: toCenterY }
                });
            }
        } else {
            // One or both teams not visible in this perspective - skip drawing
            ctx.globalAlpha = 1.0;
            return;
        }
    } else {
        fromWidth = getTeamBoxWidth(from, currentView);
        toWidth = getTeamBoxWidth(to, currentView);
        fromHeight = LAYOUT.TEAM_BOX_HEIGHT;
        toHeight = LAYOUT.TEAM_BOX_HEIGHT;
        fromCenterX = from.position.x + fromWidth / 2;
        fromCenterY = from.position.y + fromHeight / 2;
        toCenterX = to.position.x + toWidth / 2;
        toCenterY = to.position.y + toHeight / 2;

        debugLog(`  📦 ${from.name} box:`, { x: from.position.x, y: from.position.y, width: fromWidth, height: fromHeight });
        debugLog(`  📦 ${to.name} box:`, { x: to.position.x, y: to.position.y, width: toWidth, height: toHeight });
    }

    // Calculate angle between centers
    const angle = Math.atan2(toCenterY - fromCenterY, toCenterX - fromCenterX);

    // Calculate edge intersection points instead of centers
    const fromEdge = getBoxEdgePoint(fromCenterX, fromCenterY, fromWidth, fromHeight, angle);
    const toEdge = getBoxEdgePoint(toCenterX, toCenterY, toWidth, toHeight, angle + Math.PI); // Opposite direction

    const arrowLength = 20;

    // Shorten the line only at the 'to' end so it doesn't overlap with arrow (unidirectional arrow only)
    const shortenBy = arrowLength + 2;
    const lineFromX = fromEdge.x; // No shortening at 'from' end (no arrow there)
    const lineFromY = fromEdge.y;
    const lineToX = toEdge.x - shortenBy * Math.cos(angle); // Shorten at 'to' end for arrow
    const lineToY = toEdge.y - shortenBy * Math.sin(angle);

    debugLog(`  🎯 Centers: from (${fromCenterX.toFixed(1)}, ${fromCenterY.toFixed(1)}) -> to (${toCenterX.toFixed(1)}, ${toCenterY.toFixed(1)})`);
    debugLog(`  📍 Line edges: from (${fromEdge.x.toFixed(1)}, ${fromEdge.y.toFixed(1)}) -> to (${toEdge.x.toFixed(1)}, ${toEdge.y.toFixed(1)})`);
    debugLog(`  📍 Final line: (${lineFromX.toFixed(1)}, ${lineFromY.toFixed(1)}) -> (${lineToX.toFixed(1)}, ${lineToY.toFixed(1)})`);
    debugLog(`  🎨 Style: #000000, width: ${2 + lineWidthBoost}px, opacity: ${opacity}`);

    ctx.save(); // Save context state

    // Black line for baseline communication (actual dependencies) - distinct from org hierarchy
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2 + lineWidthBoost;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(lineFromX, lineFromY);
    ctx.lineTo(lineToX, lineToY);
    ctx.stroke();

    // Draw arrows ON TOP of line for visibility (bidirectional - arrows at both ends)
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    // Filled arrow triangle at 'to' end
    ctx.beginPath();
    ctx.moveTo(toEdge.x, toEdge.y);
    ctx.lineTo(toEdge.x - arrowLength * Math.cos(angle - Math.PI / 6), toEdge.y - arrowLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toEdge.x - arrowLength * Math.cos(angle + Math.PI / 6), toEdge.y - arrowLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Filled arrow triangle at 'from' end (bidirectional)
    ctx.beginPath();
    ctx.moveTo(fromEdge.x, fromEdge.y);
    ctx.lineTo(fromEdge.x + arrowLength * Math.cos(angle - Math.PI / 6), fromEdge.y + arrowLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(fromEdge.x + arrowLength * Math.cos(angle + Math.PI / 6), fromEdge.y + arrowLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore(); // Restore context state
    ctx.globalAlpha = 1.0; // Reset opacity
}
