import { LAYOUT } from './constants.js';

// Interaction mode styles (colors match Team Topologies book symbols)
export const INTERACTION_STYLES = {
    'collaboration': { dash: [], width: 3, color: '#7a5fa6' },        // Purple (matches cross-hatch symbol)
    'x-as-a-service': { dash: [10, 5], width: 3, color: '#222222' },  // Near-black (matches bracket symbol)
    'facilitating': { dash: [5, 5], width: 2, color: '#6fa98c' }      // Green (matches dotted circle symbol)
};

// Value stream grouping style
const VALUE_STREAM_STYLE = {
    fillColor: 'rgba(255, 245, 215, 0.4)', // Very light yellow/orange background
    strokeColor: 'rgba(255, 200, 130, 0.5)', // Light orange border
    strokeWidth: 2,
    borderRadius: 10,
    labelFont: 'bold 16px sans-serif',
    labelColor: '#666',
    labelPadding: 10
};

// Platform grouping style (from TT 2nd edition - fractal pattern)
const PLATFORM_GROUPING_STYLE = {
    fillColor: 'rgba(126, 200, 227, 0.15)', // Very light blue background (lighter than platform teams)
    strokeColor: 'rgba(74, 159, 216, 0.4)', // Light blue border
    strokeWidth: 2,
    borderRadius: 10,
    labelFont: 'bold 16px sans-serif',
    labelColor: '#666',
    labelPadding: 10
};
// Utility to darken a hex color
export function darkenColor(hex, factor = 0.7) {
    const rgb = parseInt(hex.slice(1), 16);
    const r = Math.floor(((rgb >> 16) & 255) * factor);
    const g = Math.floor(((rgb >> 8) & 255) * factor);
    const b = Math.floor((rgb & 255) * factor);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Get cognitive load indicator color and emoji
 * @param {string} level - Cognitive load level (low, low-medium, medium, high, very-high)
 * @returns {Object} { color, emoji } for the cognitive load level
 */
export function getCognitiveLoadIndicator(level) {
    if (!level) return null;
    
    const normalized = level.toLowerCase().trim();
    
    // Traffic light colors: green (low), yellow (medium), red (high)
    const indicators = {
        'low': { color: '#4CAF50', emoji: '🟢' },
        'low-medium': { color: '#8BC34A', emoji: '🟢' },
        'medium': { color: '#FFC107', emoji: '🟡' },
        'high': { color: '#FF5722', emoji: '🔴' },
        'very-high': { color: '#D32F2F', emoji: '🔴' }
    };
    
    return indicators[normalized] || null;
}
/**
 * Calculate team box width based on team type
 * In TT Design view, stream-aligned and platform teams are wide (spanning flow of change)
 * @param {Object} team - Team object
 * @param {string} currentView - Current view ('current' or 'tt')
 * @returns {number} Width in pixels
 */
export function getTeamBoxWidth(team, currentView = 'current') {
    // In TT Design view, stream-aligned and platform teams are wide
    if (currentView === 'tt' && (team.team_type === 'stream-aligned' || team.team_type === 'platform')) {
        // Check if team is in a grouping - if so, make it wide
        const hasGrouping = team.metadata?.value_stream || team.metadata?.platform_grouping;
        if (hasGrouping) {
            // ~80% of grouping width (700px), with 10% margins = ~560px
            return 560;
        }
    }
    // Default width for all other cases
    return LAYOUT.TEAM_BOX_WIDTH;
}

export function drawTeam(ctx, team, selectedTeam, teamColorMap, wrapText, currentView = 'current', showCognitiveLoad = false) {
    const x = team.position.x;
    const y = team.position.y;
    const width = getTeamBoxWidth(team, currentView);
    const height = LAYOUT.TEAM_BOX_HEIGHT;
    const radius = 8;
    const fillColor = getTeamColor(team, teamColorMap);
    const borderColor = darkenColor(fillColor, LAYOUT.BORDER_COLOR_DARKEN_FACTOR);
    // Shadow
    if (selectedTeam === team) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
    }
    // Background
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    // Border (darker than fill)
    ctx.strokeStyle = selectedTeam === team ? '#333' : borderColor;
    ctx.lineWidth = selectedTeam === team ? LAYOUT.BORDER_WIDTH_SELECTED : LAYOUT.BORDER_WIDTH_NORMAL;
    ctx.stroke();
    
    // Cognitive load indicator (traffic light in top-right corner)
    const cognitiveLoad = team.metadata?.cognitive_load;
    if (showCognitiveLoad && cognitiveLoad) {
        const indicator = getCognitiveLoadIndicator(cognitiveLoad);
        if (indicator) {
            // Draw circular indicator with traffic light color
            const indicatorSize = 12;
            const indicatorX = x + width - indicatorSize - 8;
            const indicatorY = y + indicatorSize + 8;
            
            ctx.fillStyle = indicator.color;
            ctx.beginPath();
            ctx.arc(indicatorX, indicatorY, indicatorSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Optional: Add white border for contrast
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }
    
    // Team name
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = wrapText(team.name, width - 20);
    
    // Draw team name lines (centered vertically)
    lines.forEach((line, i) => {
        ctx.fillText(line, x + width / 2, y + height / 2 - (lines.length - 1) * 8 + i * 16);
    });
}
export function drawConnections(ctx, teams, currentView = 'current', showInteractionModes = true) {
    if (currentView === 'current') {
        // Current State view: show simple "Actual Comms" from dependencies
        teams.forEach(team => {
            if (team.dependencies && Array.isArray(team.dependencies)) {
                team.dependencies.forEach(targetName => {
                    const target = teams.find(t => t.name === targetName);
                    if (target) {
                        drawActualCommsConnection(ctx, team, target, currentView);
                    }
                });
            }
        });
    } else if (showInteractionModes) {
        // TT Design view: show interaction modes (only if checkbox is enabled)
        teams.forEach(team => {
            if (team.interaction_modes) {
                Object.entries(team.interaction_modes).forEach(([targetName, mode]) => {
                    const target = teams.find(t => t.name === targetName);
                    if (target) {
                        drawConnection(ctx, team, target, mode, currentView);
                    }
                });
            }
        });
    }
}
function drawConnection(ctx, from, to, mode, currentView = 'current') {
    const style = INTERACTION_STYLES[mode] || INTERACTION_STYLES['collaboration'];
    
    // Calculate center points dynamically based on team box width
    const fromWidth = getTeamBoxWidth(from, currentView);
    const toWidth = getTeamBoxWidth(to, currentView);
    const fromX = from.position.x + fromWidth / 2;
    const fromY = from.position.y + LAYOUT.TEAM_BOX_HEIGHT / 2;
    const toX = to.position.x + toWidth / 2;
    const toY = to.position.y + LAYOUT.TEAM_BOX_HEIGHT / 2;
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.setLineDash(style.dash);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    // Arrow
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 10;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - arrowLength * Math.cos(angle - Math.PI / 6), toY - arrowLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - arrowLength * Math.cos(angle + Math.PI / 6), toY - arrowLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawActualCommsConnection(ctx, from, to, currentView = 'current') {
    // Current State view: simple bidirectional fat arrow called "Actual Comms"
    const fromWidth = getTeamBoxWidth(from, currentView);
    const toWidth = getTeamBoxWidth(to, currentView);
    const fromX = from.position.x + fromWidth / 2;
    const fromY = from.position.y + LAYOUT.TEAM_BOX_HEIGHT / 2;
    const toX = to.position.x + toWidth / 2;
    const toY = to.position.y + LAYOUT.TEAM_BOX_HEIGHT / 2;
    
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 20;
    
    // Shorten the line so it doesn't overlap with arrows
    const shortenBy = arrowLength + 2;
    const lineFromX = fromX + shortenBy * Math.cos(angle);
    const lineFromY = fromY + shortenBy * Math.sin(angle);
    const lineToX = toX - shortenBy * Math.cos(angle);
    const lineToY = toY - shortenBy * Math.sin(angle);
    
    ctx.save(); // Save context state
    
    // Fat gray line (realistic, not TT-designed)
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(lineFromX, lineFromY);
    ctx.lineTo(lineToX, lineToY);
    ctx.stroke();
    
    // Draw arrows ON TOP of line for visibility
    ctx.fillStyle = '#666666';
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    
    // Filled arrow triangle at 'to' end
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - arrowLength * Math.cos(angle - Math.PI / 6), toY - arrowLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - arrowLength * Math.cos(angle + Math.PI / 6), toY - arrowLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Filled arrow triangle at 'from' end (opposite direction)
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(fromX + arrowLength * Math.cos(angle - Math.PI / 6), fromY + arrowLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(fromX + arrowLength * Math.cos(angle + Math.PI / 6), fromY + arrowLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore(); // Restore context state
}
function getTeamColor(team, teamColorMap) {
    // Try to get color from team type config
    if (team.team_type && teamColorMap[team.team_type]) {
        return teamColorMap[team.team_type];
    }
    // Final fallback
    return '#95a5a6';
}
export function wrapText(ctx, text, maxWidth) {
    // Handle non-string text
    if (!text || typeof text !== 'string') {
        console.warn('wrapText called with non-string text:', text);
        return [''];
    }
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
        }
        else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    return lines;
}
export function getTeamAtPosition(teams, x, y, viewOffset, scale, currentView = 'current') {
    const worldX = (x - viewOffset.x) / scale;
    const worldY = (y - viewOffset.y) / scale;
    return teams.find(team => {
        const teamWidth = getTeamBoxWidth(team, currentView);
        return worldX >= team.position.x &&
            worldX <= team.position.x + teamWidth &&
            worldY >= team.position.y &&
            worldY <= team.position.y + LAYOUT.TEAM_BOX_HEIGHT;
    });
}
// Polyfill for roundRect (older browsers)
export function initCanvasPolyfills() {
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            const radius = typeof r === 'number' ? r : r[0];
            let effectiveRadius = radius;
            if (w < 2 * effectiveRadius)
                effectiveRadius = w / 2;
            if (h < 2 * effectiveRadius)
                effectiveRadius = h / 2;
            this.moveTo(x + effectiveRadius, y);
            this.arcTo(x + w, y, x + w, y + h, effectiveRadius);
            this.arcTo(x + w, y + h, x, y + h, effectiveRadius);
            this.arcTo(x, y + h, x, y, effectiveRadius);
            this.arcTo(x, y, x + w, y, effectiveRadius);
            this.closePath();
            return this;
        };
    }
}

/**
 * Draws value stream grouping rectangles behind teams
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} groupings - Array of grouping objects from getValueStreamGroupings
 */
export function drawValueStreamGroupings(ctx, groupings) {
    if (!groupings || groupings.length === 0) {
        return;
    }

    groupings.forEach(grouping => {
        // Skip ungrouped teams (they don't get a visual grouping)
        if (grouping.name === '(Ungrouped)') {
            return;
        }

        const { x, y, width, height } = grouping.bounds;

        // Draw background rectangle
        ctx.fillStyle = VALUE_STREAM_STYLE.fillColor;
        ctx.strokeStyle = VALUE_STREAM_STYLE.strokeColor;
        ctx.lineWidth = VALUE_STREAM_STYLE.strokeWidth;
        
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, VALUE_STREAM_STYLE.borderRadius);
        ctx.fill();
        ctx.stroke();

        // Draw label at top-center (banner style)
        ctx.fillStyle = VALUE_STREAM_STYLE.labelColor;
        ctx.font = VALUE_STREAM_STYLE.labelFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        const labelX = x + width / 2;
        const labelY = y + VALUE_STREAM_STYLE.labelPadding;
        
        ctx.fillText(grouping.name, labelX, labelY);
    });
}

/**
 * Draws platform grouping rectangles behind teams
 * Platform Grouping is a fractal pattern from TT 2nd edition representing a team-of-teams
 * structure where multiple platform teams work together to provide capabilities.
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} groupings - Array of grouping objects (similar structure to value stream groupings)
 */
export function drawPlatformGroupings(ctx, groupings) {
    if (!groupings || groupings.length === 0) {
        return;
    }

    groupings.forEach(grouping => {
        // Skip ungrouped teams
        if (grouping.name === '(Ungrouped)') {
            return;
        }

        const { x, y, width, height } = grouping.bounds;

        // Draw background rectangle with platform grouping style
        ctx.fillStyle = PLATFORM_GROUPING_STYLE.fillColor;
        ctx.strokeStyle = PLATFORM_GROUPING_STYLE.strokeColor;
        ctx.lineWidth = PLATFORM_GROUPING_STYLE.strokeWidth;
        
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, PLATFORM_GROUPING_STYLE.borderRadius);
        ctx.fill();
        ctx.stroke();

        // Draw label at top-center (banner style)
        ctx.fillStyle = PLATFORM_GROUPING_STYLE.labelColor;
        ctx.font = PLATFORM_GROUPING_STYLE.labelFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        const labelX = x + width / 2;
        const labelY = y + PLATFORM_GROUPING_STYLE.labelPadding;
        
        ctx.fillText(grouping.name, labelX, labelY);
    });
}
