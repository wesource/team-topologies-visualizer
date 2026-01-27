import { LAYOUT } from '../core/constants.js';
import { debugLog } from '../core/config.js';

// Track warnings to avoid console spam (only show each unique warning once)
const shownWarnings = new Set();

// Interaction mode styles (colors match Team Topologies book symbols)
// Line thickness communicates interaction intensity: thick=high-touch, thin=lightweight
export const INTERACTION_STYLES = {
    'collaboration': { dash: [], width: 2, color: '#7a5fa6' },        // Thick (2px) - High touch, temporary
    'x-as-a-service': { dash: [10, 5], width: 1, color: '#222222' },  // Medium (1px) - Standard operational relationship
    'facilitating': { dash: [5, 5], width: 0.5, color: '#6fa98c' }    // Thin (0.5px) - Lightweight coaching
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
    if (!hex || typeof hex !== 'string') return '#333'; // Default dark color
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
export function drawTeam(ctx, team, selectedTeam, teamColorMap, wrapText, currentView = 'current', showCognitiveLoad = false, comparisonData = null, showTeamTypeBadges = false, platformMetrics = null, showFlowMetrics = false, focusedTeam = null, focusedConnections = null) {
    // Apply focus mode opacity if active
    if (focusedTeam && focusedConnections) {
        const isInFocus = focusedConnections.has(team.name);
        ctx.globalAlpha = isInFocus ? 1.0 : 0.2;
    }

    const x = team.position.x;
    const y = team.position.y;
    const width = getTeamBoxWidth(team, currentView);
    const height = getTeamBoxHeight(team, currentView);

    // Use shape-specific drawing in TT Design view
    if (currentView === 'tt') {
        if (team.team_type === 'enabling') {
            drawEnablingTeam(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, comparisonData, showTeamTypeBadges, platformMetrics, showFlowMetrics);
            ctx.globalAlpha = 1.0; // Reset opacity
            return;
        }
        if (team.team_type === 'complicated-subsystem') {
            drawComplicatedSubsystemTeam(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, comparisonData, platformMetrics, showFlowMetrics);
            ctx.globalAlpha = 1.0; // Reset opacity
            return;
        }
        if (team.team_type === 'undefined') {
            drawUndefinedTeam(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, comparisonData, platformMetrics, showFlowMetrics);
            ctx.globalAlpha = 1.0; // Reset opacity
            return;
        }
    }

    // Default: draw as rounded rectangle
    drawDefaultTeamBox(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, showTeamTypeBadges, platformMetrics, currentView, showFlowMetrics);
    ctx.globalAlpha = 1.0; // Reset opacity
}

/**
 * Draw team as default box (rounded corners in TT Design, sharp corners in Baseline view)
 */
function drawDefaultTeamBox(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, showTeamTypeBadges = false, platformMetrics = null, currentView = 'current', showFlowMetrics = false) {

    // Rounded corners for stream-aligned and platform teams in TT Design view
    // Sharp corners in Baseline view (hierarchy, product lines, value streams)
    const radius = currentView === 'tt' ? 15 : 0;
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

    // Cognitive load indicator
    drawCognitiveLoadIndicator(ctx, team, x, y, width, showCognitiveLoad);

    // Platform consumer badge (TT Design view only)
    if (platformMetrics && platformMetrics.totalCount > 0) {
        drawPlatformConsumerBadge(ctx, team, platformMetrics, x, y, height);
    }

    // Flow metrics box (TT Design view only, when checkbox enabled)
    if (showFlowMetrics && currentView === 'tt') {
        drawFlowMetricsBox(ctx, team, x, y, width, height);
    }

    // Team name
    drawTeamName(ctx, team, x, y, width, height, wrapText);

    // Team type badge (if enabled)
    if (showTeamTypeBadges && team.team_type) {
        const badges = {
            'dev-team': 'Dev',
            'ops-team': 'Ops',
            'platform-team': 'Platform',
            'support-team': 'Support',
            'feature-team': 'Feature'
        };
        const badgeText = badges[team.team_type] || team.team_type;
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(badgeText, x + width / 2, y + height - 8);
    }
}

/**
 * Draw enabling team as vertical rounded rectangle
 * Shape: 80×120 vertical orientation (tall and narrow)
 */
function drawEnablingTeam(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, comparisonData, showTeamTypeBadges = false, _platformMetrics = null, _showFlowMetrics = false) {
    // Check if this team has a comparison badge
    let comparisonBadge = null;
    if (comparisonData) {
        if (comparisonData.added_teams?.some(t => t.name === team.name)) {
            comparisonBadge = { type: 'added', color: '#28a745', emoji: '🟢', label: 'NEW' };
        } else if (comparisonData.moved_teams?.some(t => t.name === team.name)) {
            comparisonBadge = { type: 'moved', color: '#ffc107', emoji: '🟡', label: 'MOVED' };
        } else if (comparisonData.type_changed_teams?.some(t => t.name === team.name)) {
            comparisonBadge = { type: 'changed', color: '#17a2b8', emoji: '🔵', label: 'CHANGED' };
        }
    }

    const radius = 0; // Sharp corners for enabling teams
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
    ctx.roundRect(x, y, width, height, radius); // Sharp corners
    ctx.fill();
    ctx.shadowColor = 'transparent';
    // Border
    ctx.strokeStyle = selectedTeam === team ? '#333' : borderColor;
    ctx.lineWidth = selectedTeam === team ? LAYOUT.BORDER_WIDTH_SELECTED : LAYOUT.BORDER_WIDTH_NORMAL;
    ctx.stroke();

    // Cognitive load indicator
    drawCognitiveLoadIndicator(ctx, team, x, y, width, showCognitiveLoad);

    // Team name (vertical text - rotated 90° counterclockwise for narrow box)
    ctx.save();
    ctx.fillStyle = '#222222';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Wrap text to fit within height (which becomes width when rotated)
    // Leave some padding (20px total = 10px on each side)
    const lines = wrapText(team.name, height - 20);

    // Translate to center of box and rotate
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(-Math.PI / 2); // -90 degrees (counterclockwise)

    // Draw each line, vertically centered
    lines.forEach((line, i) => {
        const yOffset = (lines.length - 1) * 8 - i * 16;
        ctx.fillText(line, 0, yOffset);
    });

    ctx.restore();

    // Team type badge (if enabled) - drawn at bottom, not rotated
    if (showTeamTypeBadges && team.team_type) {
        const badges = {
            'enabling-team': 'Enabling'
        };
        const badgeText = badges[team.team_type] || team.team_type;
        ctx.fillStyle = '#666';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(badgeText, x + width / 2, y + height - 5);
    }

    // Draw comparison badge if in comparison mode
    if (comparisonBadge) {
        drawComparisonBadge(ctx, comparisonBadge, x, y, width, height);
    }
}

/**
 * Draw complicated-subsystem team as octagon
 * Shape: 8-sided polygon representing internal complexity
 */
function drawComplicatedSubsystemTeam(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, comparisonData, _platformMetrics = null, _showFlowMetrics = false) {
    // Check if this team has a comparison badge
    let comparisonBadge = null;
    if (comparisonData) {
        if (comparisonData.added_teams?.some(t => t.name === team.name)) {
            comparisonBadge = { type: 'added', color: '#28a745', emoji: '🟢', label: 'NEW' };
        } else if (comparisonData.moved_teams?.some(t => t.name === team.name)) {
            comparisonBadge = { type: 'moved', color: '#ffc107', emoji: '🟡', label: 'MOVED' };
        } else if (comparisonData.type_changed_teams?.some(t => t.name === team.name)) {
            comparisonBadge = { type: 'changed', color: '#17a2b8', emoji: '🔵', label: 'CHANGED' };
        }
    }

    const fillColor = getTeamColor(team, teamColorMap);
    const borderColor = darkenColor(fillColor, LAYOUT.BORDER_COLOR_DARKEN_FACTOR);

    // Octagon dimensions (based on SVG: M40 20, H100, L120 40, V100, L100 120, H40, L20 100, V40, Z)
    // Scaled to fit width×height box
    const cornerSize = width * 0.167; // ~20px for 120px width

    // Shadow
    if (selectedTeam === team) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
    }

    // Draw octagon path
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(x + cornerSize, y); // Top-left corner
    ctx.lineTo(x + width - cornerSize, y); // Top edge
    ctx.lineTo(x + width, y + cornerSize); // Top-right corner
    ctx.lineTo(x + width, y + height - cornerSize); // Right edge
    ctx.lineTo(x + width - cornerSize, y + height); // Bottom-right corner
    ctx.lineTo(x + cornerSize, y + height); // Bottom edge
    ctx.lineTo(x, y + height - cornerSize); // Bottom-left corner
    ctx.lineTo(x, y + cornerSize); // Left edge
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Border
    ctx.strokeStyle = selectedTeam === team ? '#333' : borderColor;
    ctx.lineWidth = selectedTeam === team ? LAYOUT.BORDER_WIDTH_SELECTED : LAYOUT.BORDER_WIDTH_NORMAL;
    ctx.stroke();

    // Cognitive load indicator
    drawCognitiveLoadIndicator(ctx, team, x, y, width, showCognitiveLoad);

    // Team name
    drawTeamName(ctx, team, x, y, width, height, wrapText);

    // Draw comparison badge if in comparison mode
    if (comparisonBadge) {
        drawComparisonBadge(ctx, comparisonBadge, x, y, width, height);
    }
}

/**
 * Draw undefined team with dashed border (TT Design view only)
 */
function drawUndefinedTeam(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, comparisonData, _platformMetrics = null, _showFlowMetrics = false) {
    // Check if this team has a comparison badge
    let comparisonBadge = null;
    if (comparisonData) {
        if (comparisonData.added_teams?.some(t => t.name === team.name)) {
            comparisonBadge = { type: 'added', color: '#28a745', emoji: '🟢', label: 'NEW' };
        } else if (comparisonData.moved_teams?.some(t => t.name === team.name)) {
            comparisonBadge = { type: 'moved', color: '#ffc107', emoji: '🟡', label: 'MOVED' };
        } else if (comparisonData.type_changed_teams?.some(t => t.name === team.name)) {
            comparisonBadge = { type: 'changed', color: '#17a2b8', emoji: '🔵', label: 'CHANGED' };
        }
    }

    const fillColor = getTeamColor(team, teamColorMap);
    const radius = 8;

    // Fill with team color (rounded rectangle)
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();

    // Dashed border for undefined teams (always gray to indicate neutral/uncertain state)
    ctx.save();
    ctx.setLineDash([8, 4]); // 8px dash, 4px gap
    ctx.strokeStyle = selectedTeam === team ? '#333333' : '#666666'; // Darker gray when selected
    ctx.lineWidth = selectedTeam === team ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore(); // Reset dash pattern

    // Draw cognitive load indicator if enabled
    if (showCognitiveLoad) {
        drawCognitiveLoadIndicator(ctx, team, x, y, width, showCognitiveLoad);
    }

    // Draw new team badge if team is less than 3 months old
    drawNewTeamBadge(ctx, team, x, y, width);

    // Draw team name
    drawTeamName(ctx, team, x, y, width, height, wrapText);

    // Draw comparison badge if in comparison mode
    if (comparisonBadge) {
        drawComparisonBadge(ctx, comparisonBadge, x, y, width, height);
    }
}

/**
 * Helper: Draw platform consumer badge showing number of consuming teams
 * Positioned in bottom-left corner of platform teams
 */
function drawPlatformConsumerBadge(ctx, _team, platformMetrics, x, y, height) {
    if (!platformMetrics || platformMetrics.totalCount === 0) return;

    const count = platformMetrics.totalCount;
    const isOverloaded = platformMetrics.isOverloaded;

    // Badge dimensions (doubled from original 18px to 36px)
    const badgePadding = 8; // Doubled from 4
    const badgeHeight = 36; // Doubled from 18
    const emoji = '👥';
    const text = `${count}`;

    // Measure text to calculate badge width
    ctx.font = 'bold 22px sans-serif'; // Doubled from 11px
    const textWidth = ctx.measureText(text).width;
    const emojiWidth = 24; // Doubled from 12
    const badgeWidth = emojiWidth + textWidth + badgePadding * 3;

    // Position in bottom-left corner
    const badgeX = x + 6;
    const badgeY = y + height - badgeHeight - 6;

    // Draw badge background
    ctx.fillStyle = isOverloaded ? '#ff9800' : '#1976d2'; // Orange if overloaded, blue otherwise
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8); // Doubled corner radius from 4 to 8
    ctx.fill();

    // Draw emoji
    ctx.font = '22px sans-serif'; // Doubled from 11px
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(emoji, badgeX + badgePadding, badgeY + badgeHeight / 2);

    // Draw count
    ctx.font = 'bold 22px sans-serif'; // Doubled from 11px
    ctx.fillText(text, badgeX + emojiWidth + badgePadding * 2, badgeY + badgeHeight / 2);

    // Draw warning indicator if overloaded
    if (isOverloaded) {
        ctx.font = '10px sans-serif';
        ctx.fillText('⚠️', badgeX + badgeWidth + 2, badgeY + badgeHeight / 2);
    }
}

/**
 * Helper: Draw cognitive load indicator in top-right corner
 */
function drawCognitiveLoadIndicator(ctx, team, x, y, width, showCognitiveLoad) {
    const cognitiveLoad = team.metadata?.cognitive_load;
    if (showCognitiveLoad && cognitiveLoad) {
        const indicator = getCognitiveLoadIndicator(cognitiveLoad);
        if (indicator) {
            const indicatorSize = 12;
            const indicatorX = x + width - indicatorSize - 8;
            const indicatorY = y + indicatorSize + 8;

            ctx.fillStyle = indicator.color;
            ctx.beginPath();
            ctx.arc(indicatorX, indicatorY, indicatorSize / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }
}

/**
 * Helper: Draw "New Team" badge for teams less than 3 months old
 */
function drawNewTeamBadge(ctx, team, x, y, _width) {
    const established = team.metadata?.established;
    if (!established) return;

    // Calculate team age
    const [year, month] = established.split('-').map(Number);
    const establishedDate = new Date(year, month - 1, 1);
    const today = new Date();

    const totalMonths = (today.getFullYear() - establishedDate.getFullYear()) * 12 +
                        (today.getMonth() - establishedDate.getMonth());

    // Only show badge if team is less than 3 months old
    if (totalMonths >= 3) return;

    // Position badge in top-left corner
    const badgeSize = 24;
    const badgeX = x + 8;
    const badgeY = y + 8;

    // Draw emoji badge
    ctx.font = `${badgeSize}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('🆕', badgeX, badgeY);
}

/**
 * Calculate overall health status from flow metrics
 * @param {Object} flowMetrics - Flow metrics object with lead_time_days, deployment_frequency, change_fail_rate, mttr_hours
 * @returns {Object|null} Health status object with status, color, emoji or null if no metrics
 */
export function calculateFlowMetricsHealth(flowMetrics) {
    if (!flowMetrics) return null;

    let redCount = 0;
    let yellowCount = 0;

    // Lead time thresholds
    if (flowMetrics.lead_time_days !== undefined && flowMetrics.lead_time_days !== null) {
        if (flowMetrics.lead_time_days > 30) redCount++;
        else if (flowMetrics.lead_time_days > 14) yellowCount++;
    }

    // Deployment frequency thresholds
    if (flowMetrics.deployment_frequency) {
        const freq = flowMetrics.deployment_frequency.toLowerCase();
        if (freq === 'monthly' || freq === 'quarterly') redCount++;
        else if (freq === 'weekly') yellowCount++;
    }

    // Change fail rate thresholds
    if (flowMetrics.change_fail_rate !== undefined && flowMetrics.change_fail_rate !== null) {
        if (flowMetrics.change_fail_rate > 0.15) redCount++;
        else if (flowMetrics.change_fail_rate > 0.10) yellowCount++;
    }

    // MTTR thresholds
    if (flowMetrics.mttr_hours !== undefined && flowMetrics.mttr_hours !== null) {
        if (flowMetrics.mttr_hours > 4) redCount++;
        else if (flowMetrics.mttr_hours > 2) yellowCount++;
    }

    // Determine overall health
    if (redCount > 0) return { status: 'red', color: '#ff6b6b', emoji: '🔴' };
    if (yellowCount > 0) return { status: 'yellow', color: '#ffd43b', emoji: '🟡' };
    return { status: 'green', color: '#51cf66', emoji: '🟢' };
}

/**
 * Draw flow metrics box (TT Design view only, when checkbox enabled)
 * Shows compact metrics with health indicator
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} team - Team object with flow_metrics
 * @param {number} x - Team box X position
 * @param {number} y - Team box Y position
 * @param {number} width - Team box width
 * @param {number} height - Team box height
 */
export function drawFlowMetricsBox(ctx, team, x, y, width, height) {
    if (!team.flow_metrics) return;

    const health = calculateFlowMetricsHealth(team.flow_metrics);
    if (!health) return;

    // Position metrics box below team name
    const boxHeight = 24;
    const boxPadding = 8;
    const boxY = y + height - boxHeight - boxPadding;
    const boxX = x + boxPadding;
    const boxWidth = width - (boxPadding * 2);

    // Background with health color
    ctx.fillStyle = health.color;
    ctx.globalAlpha = 0.15; // Subtle background
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.globalAlpha = 1.0;

    // Border
    ctx.strokeStyle = health.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Compact text: "📊 14d 🟢" (lead time + health indicator)
    const leadTime = team.flow_metrics.lead_time_days !== undefined ?
        `${Math.round(team.flow_metrics.lead_time_days)}d` : '?';
    const text = `📊 ${leadTime} ${health.emoji}`;

    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, boxX + boxWidth / 2, boxY + boxHeight / 2);
}

/**
 * Helper: Draw comparison badge for changed teams
 */
function drawComparisonBadge(ctx, badge, x, y, width, _height) {
    const badgeHeight = 20;
    const badgeY = y - badgeHeight - 5; // Above the team box

    // Background
    ctx.fillStyle = badge.color;
    ctx.fillRect(x, badgeY, width, badgeHeight);

    // Text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${badge.emoji} ${badge.label}`, x + width / 2, badgeY + badgeHeight / 2);
}

/**
 * Helper: Draw team name with text wrapping
 */
function drawTeamName(ctx, team, x, y, width, height, wrapText) {
    ctx.fillStyle = '#222222'; // Dark gray text for better readability
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = wrapText(team.name, width - 20);

    // Draw team name lines (centered vertically)
    lines.forEach((line, i) => {
        ctx.fillText(line, x + width / 2, y + height / 2 - (lines.length - 1) * 8 + i * 16);
    });
}

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
 * Draw connection lines between teams (dependencies or interaction modes)
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {Array<Object>} teams - Array of all team objects
 * @param {string} [currentView='current'] - Current view mode ('current' or 'tt')
 * @param {boolean} [showInteractionModes=true] - Whether to show interaction mode styling in TT view
 * @description In 'current' view, shows simple dependency connections.
 * In 'tt' view, shows styled lines representing interaction modes (collaboration, x-as-a-service, facilitating)
 */
export function drawConnections(ctx, teams, currentView = 'current', showInteractionModes = true, currentPerspective = 'hierarchy', customTeamPositions = null, focusedTeam = null, focusedConnections = null, interactionModeFilters = null) {
    // Debug: drawConnections called

    if (currentView === 'current') {
        // Current State view: show simple "Actual Comms" from dependencies
        teams.forEach(team => {
            if (team.dependencies && Array.isArray(team.dependencies)) {
                // Debug logging for specific team
                if (team.name === 'Web Frontend Team') {
                    // Debug: ${team.name} has dependencies
                }
                team.dependencies.forEach(targetName => {
                    const target = teams.find(t => t.name === targetName);
                    if (target) {
                        drawActualCommsConnection(ctx, team, target, currentView, currentPerspective, customTeamPositions, focusedTeam, focusedConnections);
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
                Object.entries(team.interaction_modes).forEach(([targetName, mode]) => {
                    // Filter based on interaction mode filters (if provided)
                    if (interactionModeFilters) {
                        if (mode === 'x-as-a-service' && !interactionModeFilters.showXasService) return;
                        if (mode === 'collaboration' && !interactionModeFilters.showCollaboration) return;
                        if (mode === 'facilitating' && !interactionModeFilters.showFacilitating) return;
                    }

                    const target = teams.find(t => t.name === targetName);
                    if (target) {
                        drawInteractionMode(ctx, team, target, mode, {
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
 * @param {Object} options - Drawing options
 * @param {string} options.currentView - Current view ('current' or 'tt')
 * @param {string} options.currentPerspective - Current perspective ('hierarchy', 'product-lines', etc.)
 * @param {Map} options.customTeamPositions - Custom team positions for product-lines/business-streams views
 * @param {Object} options.focusedTeam - Team in focus mode (if any)
 * @param {Set} options.focusedConnections - Set of focused team names (if in focus mode)
 */
function drawInteractionMode(ctx, from, to, mode, options = {}) {
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
    // Arrow at edge point
    const arrowLength = 10;
    ctx.beginPath();
    ctx.moveTo(toEdge.x, toEdge.y);
    ctx.lineTo(toEdge.x - arrowLength * Math.cos(angle - Math.PI / 6), toEdge.y - arrowLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toEdge.x, toEdge.y);
    ctx.lineTo(toEdge.x - arrowLength * Math.cos(angle + Math.PI / 6), toEdge.y - arrowLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0; // Reset opacity
}

function drawActualCommsConnection(ctx, from, to, currentView = 'current', currentPerspective = 'hierarchy', customTeamPositions = null, focusedTeam = null, focusedConnections = null) {
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
    debugLog(`  🎨 Style: #666666, width: ${4 + lineWidthBoost}px, opacity: ${opacity}`);

    ctx.save(); // Save context state

    // Fat gray line (realistic, not TT-designed)
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 4 + lineWidthBoost;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(lineFromX, lineFromY);
    ctx.lineTo(lineToX, lineToY);
    ctx.stroke();

    // Draw arrows ON TOP of line for visibility
    ctx.fillStyle = '#666666';
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;

    // Filled arrow triangle at 'to' end (unidirectional - only arrow at dependency target)
    ctx.beginPath();
    ctx.moveTo(toEdge.x, toEdge.y);
    ctx.lineTo(toEdge.x - arrowLength * Math.cos(angle - Math.PI / 6), toEdge.y - arrowLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toEdge.x - arrowLength * Math.cos(angle + Math.PI / 6), toEdge.y - arrowLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore(); // Restore context state
    ctx.globalAlpha = 1.0; // Reset opacity
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
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    return lines;
}
export function getTeamAtPosition(teams, x, y, viewOffset, scale, currentView = 'current', currentPerspective = 'hierarchy', customTeamPositions = null) {
    const worldX = (x - viewOffset.x) / scale;
    const worldY = (y - viewOffset.y) / scale;

    // Special handling for product-lines, value-streams, and business-streams perspectives: check tracked positions
    if (currentView === 'current' && (currentPerspective === 'product-lines' || currentPerspective === 'value-streams' || currentPerspective === 'business-streams') && customTeamPositions) {
        // Check each team in the positions map
        for (const [teamName, bounds] of customTeamPositions.entries()) {
            if (worldX >= bounds.x && worldX <= bounds.x + bounds.width &&
                worldY >= bounds.y && worldY <= bounds.y + bounds.height) {
                // Find the full team object by name
                const team = teams.find(t => t.name === teamName);
                if (team) return team;
            }
        }
        return null;
    }

    // Standard hit detection using team.position
    return teams.find(team => {
        const teamWidth = getTeamBoxWidth(team, currentView);
        const teamHeight = getTeamBoxHeight(team, currentView);

        // Special hit detection for complicated-subsystem (octagon) in TT Design view
        if (currentView === 'tt' && team.team_type === 'complicated-subsystem') {
            return isPointInOctagon(worldX, worldY, team.position.x, team.position.y, teamWidth, teamHeight);
        }

        // Default: rectangular hit detection
        return worldX >= team.position.x &&
            worldX <= team.position.x + teamWidth &&
            worldY >= team.position.y &&
            worldY <= team.position.y + teamHeight;
    });
}

/**
 * Check if point is inside an octagon
 * Uses simplified approach: check if point is in bounding box minus corner triangles
 */
function isPointInOctagon(px, py, x, y, width, height) {
    const cornerSize = width * 0.167;

    // First check: must be in bounding box
    if (px < x || px > x + width || py < y || py > y + height) {
        return false;
    }

    // Check if point is in one of the cut-off corners
    // Top-left corner
    if (px < x + cornerSize && py < y + cornerSize) {
        // Check if below the diagonal line from (x, y+cornerSize) to (x+cornerSize, y)
        const relX = px - x;
        const relY = py - y;
        if (relX + relY < cornerSize) {
            return false;
        }
    }
    // Top-right corner
    if (px > x + width - cornerSize && py < y + cornerSize) {
        const relX = (x + width) - px;
        const relY = py - y;
        if (relX + relY < cornerSize) {
            return false;
        }
    }
    // Bottom-right corner
    if (px > x + width - cornerSize && py > y + height - cornerSize) {
        const relX = (x + width) - px;
        const relY = (y + height) - py;
        if (relX + relY < cornerSize) {
            return false;
        }
    }
    // Bottom-left corner
    if (px < x + cornerSize && py > y + height - cornerSize) {
        const relX = px - x;
        const relY = (y + height) - py;
        if (relX + relY < cornerSize) {
            return false;
        }
    }

    return true;
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

        // Skip groupings with stale positions (teams too spread out)
        if (grouping.bounds.stale || grouping.bounds.width === 0 || grouping.bounds.height === 0) {
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
