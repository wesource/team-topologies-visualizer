import { LAYOUT } from './constants.js';

// Interaction mode styles (colors match Team Topologies book symbols)
// Line thickness reflects interaction intensity: Collaboration (high-touch) > X-as-a-Service (standard) > Facilitating (lightweight)
export const INTERACTION_STYLES = {
    'collaboration': { dash: [], width: 2, color: '#7a5fa6' },        // Purple, thick line (high-touch, temporary)
    'x-as-a-service': { dash: [10, 5], width: 1, color: '#222222' },  // Near-black, medium line (standard operational)
    'facilitating': { dash: [5, 5], width: 0.5, color: '#6fa98c' }    // Green, thin line (lightweight coaching)
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
        // Stream-aligned and platform teams: wide horizontal
        if (team.team_type === 'stream-aligned' || team.team_type === 'platform') {
            // Check if team is in a grouping - if so, make it wide
            // Check top-level first (from YAML root), then metadata (for backwards compatibility)
            const hasGrouping = team.value_stream || team.platform_grouping ||
                                team.metadata?.value_stream || team.metadata?.platform_grouping;
            if (hasGrouping) {
                // ~80% of grouping width (700px), with 10% margins = ~560px
                return 560;
            }
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
    // Default height
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
 * @param {boolean} [showTeamTypeBadges=false] - Whether to show team type badges
 * @param {Object|null} [platformMetrics=null] - Platform consumer metrics (TT Design view only)
 * @param {boolean} [showFlowMetrics=false] - Whether to show flow metrics overlay (TT Design view only)
 * @description Renders team with type-specific shapes: rounded rectangles for stream-aligned/platform,
 * vertical boxes for enabling teams, octagons for complicated-subsystem teams
 */
export function drawTeam(ctx, team, selectedTeam, teamColorMap, wrapText, currentView = 'current', showCognitiveLoad = false, comparisonData = null, showTeamTypeBadges = false, platformMetrics = null, showFlowMetrics = false, focusedTeam = null, focusedConnections = null) {
    const x = team.position.x;
    const y = team.position.y;
    const width = getTeamBoxWidth(team, currentView);
    const height = getTeamBoxHeight(team, currentView);

    // Apply opacity based on focus mode
    let opacity = 1.0;
    if (focusedTeam && focusedConnections) {
        if (focusedConnections.has(team.name)) {
            opacity = 1.0; // Full opacity for focused network
        } else {
            opacity = 0.2; // Dimmed for unrelated teams
        }
    }
    ctx.globalAlpha = opacity;

    // Use shape-specific drawing in TT Design view
    if (currentView === 'tt') {
        if (team.team_type === 'enabling') {
            drawEnablingTeam(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, comparisonData, showTeamTypeBadges, platformMetrics, showFlowMetrics);
            ctx.globalAlpha = 1.0; // Reset
            return;
        }
        if (team.team_type === 'complicated-subsystem') {
            drawComplicatedSubsystemTeam(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, comparisonData, platformMetrics, showFlowMetrics);
            ctx.globalAlpha = 1.0; // Reset
            return;
        }
        if (team.team_type === 'undefined') {
            drawUndefinedTeam(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, comparisonData, platformMetrics, showFlowMetrics);
            ctx.globalAlpha = 1.0; // Reset
            return;
        }
    }

    // Default: draw as rounded rectangle
    drawDefaultTeamBox(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, showTeamTypeBadges, platformMetrics, currentView, showFlowMetrics);
    ctx.globalAlpha = 1.0; // Reset
}

/**
 * Draw team as default box (rounded corners in TT Design, sharp corners in Pre-TT view)
 */
function drawDefaultTeamBox(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, showTeamTypeBadges = false, platformMetrics = null, currentView = 'current', showFlowMetrics = false) {

    // Rounded corners for stream-aligned and platform teams in TT Design view
    // Sharp corners in Pre-TT view (hierarchy, product lines, value streams)
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
    if (platformMetrics) {
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
function drawEnablingTeam(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, comparisonData, showTeamTypeBadges = false, _platformMetrics = null) {
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
function drawComplicatedSubsystemTeam(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, comparisonData, _platformMetrics = null) {
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
function drawUndefinedTeam(ctx, team, x, y, width, height, selectedTeam, teamColorMap, wrapText, showCognitiveLoad, comparisonData, _platformMetrics = null) {
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
 * Helper: Draw platform consumer count badge (TT Design view only)
 * Shows number of teams consuming this platform with warning if overloaded
 */
function drawPlatformConsumerBadge(ctx, team, platformMetrics, x, y, height) {
    if (!platformMetrics || platformMetrics.totalCount === 0) return;

    const { totalCount, isOverloaded } = platformMetrics;

    // Position badge in bottom-left corner
    const badgeHeight = 22;
    const badgePadding = 8;
    const badgeY = y + height - badgeHeight - badgePadding;
    const badgeX = x + badgePadding;

    // Calculate badge width based on text
    ctx.font = 'bold 12px sans-serif';
    const text = `👥 ${totalCount}${isOverloaded ? ' ⚠️' : ''}`;
    const textWidth = ctx.measureText(text).width;
    const badgeWidth = textWidth + 16;

    // Background (semi-transparent white)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);

    // Border
    ctx.strokeStyle = isOverloaded ? '#ff9800' : '#666';
    ctx.lineWidth = isOverloaded ? 2 : 1;
    ctx.strokeRect(badgeX, badgeY, badgeWidth, badgeHeight);

    // Text
    ctx.fillStyle = isOverloaded ? '#ff6600' : '#333';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, badgeX + 8, badgeY + badgeHeight / 2);
}

/**
 * Helper: Calculate flow metrics health status
 * Returns color code based on metric values: green (good), yellow (medium), red (poor)
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
 * Helper: Draw flow metrics box (TT Design view only, when checkbox enabled)
 * Shows compact metrics with health indicator
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
 * Draw connection lines between teams (dependencies or interaction modes)
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {Array<Object>} teams - Array of all team objects
 * @param {string} [currentView='current'] - Current view mode ('current' or 'tt')
 * @param {boolean} [showInteractionModes=true] - Whether to show interaction mode styling in TT view
 * @description In 'current' view, shows simple dependency connections.
 * In 'tt' view, shows styled lines representing interaction modes (collaboration, x-as-a-service, facilitating)
 */
export function drawConnections(ctx, teams, currentView = 'current', showInteractionModes = true, currentPerspective = 'hierarchy', customTeamPositions = null, focusedTeam = null, focusedConnections = null) {
    if (currentView === 'current') {
        // Current State view: show simple "Actual Comms" from dependencies
        teams.forEach(team => {
            if (team.dependencies && Array.isArray(team.dependencies)) {
                team.dependencies.forEach(targetName => {
                    const target = teams.find(t => t.name === targetName);
                    if (target) {
                        drawActualCommsConnection(ctx, team, target, currentView, currentPerspective, customTeamPositions, focusedTeam, focusedConnections);
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
                        drawConnection(ctx, team, target, mode, currentView, currentPerspective, customTeamPositions, focusedTeam, focusedConnections);
                    }
                });
            }
        });
    }
}
function drawConnection(ctx, from, to, mode, currentView = 'current', currentPerspective = 'hierarchy', customTeamPositions = null, focusedTeam = null, focusedConnections = null) {
    const style = INTERACTION_STYLES[mode] || INTERACTION_STYLES['collaboration'];

    // Apply opacity and line width based on focus mode
    let opacity = 1.0;
    let lineWidthBoost = 0;
    if (focusedTeam && focusedConnections) {
        // Check if both endpoints are in focused network
        if (focusedConnections.has(from.name) && focusedConnections.has(to.name)) {
            opacity = 1.0; // Full opacity for focused connections
            lineWidthBoost = 2; // Make focused lines thicker (+2px)
        } else {
            opacity = 0.1; // Nearly invisible for unrelated connections
        }
    }
    ctx.globalAlpha = opacity;

    let fromX, fromY, toX, toY;

    // Use custom positions if in product-lines or value-streams perspective
    if (currentView === 'current' && (currentPerspective === 'product-lines' || currentPerspective === 'value-streams') && customTeamPositions) {
        const fromBounds = customTeamPositions.get(from.name);
        const toBounds = customTeamPositions.get(to.name);

        if (fromBounds && toBounds) {
            fromX = fromBounds.x + fromBounds.width / 2;
            fromY = fromBounds.y + fromBounds.height / 2;
            toX = toBounds.x + toBounds.width / 2;
            toY = toBounds.y + toBounds.height / 2;
        } else {
            // Fall back to standard positions if not found
            const fromWidth = getTeamBoxWidth(from, currentView);
            const toWidth = getTeamBoxWidth(to, currentView);
            fromX = from.position.x + fromWidth / 2;
            fromY = from.position.y + LAYOUT.TEAM_BOX_HEIGHT / 2;
            toX = to.position.x + toWidth / 2;
            toY = to.position.y + LAYOUT.TEAM_BOX_HEIGHT / 2;
        }
    } else {
        // Calculate center points dynamically based on team box width
        const fromWidth = getTeamBoxWidth(from, currentView);
        const toWidth = getTeamBoxWidth(to, currentView);
        fromX = from.position.x + fromWidth / 2;
        fromY = from.position.y + LAYOUT.TEAM_BOX_HEIGHT / 2;
        toX = to.position.x + toWidth / 2;
        toY = to.position.y + LAYOUT.TEAM_BOX_HEIGHT / 2;
    }

    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width + lineWidthBoost;
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
    ctx.globalAlpha = 1.0; // Reset
}

function drawActualCommsConnection(ctx, from, to, currentView = 'current', currentPerspective = 'hierarchy', customTeamPositions = null, focusedTeam = null, focusedConnections = null) {
    // Apply opacity and line width based on focus mode
    let opacity = 1.0;
    let lineWidthBoost = 0;
    if (focusedTeam && focusedConnections) {
        if (focusedConnections.has(from.name) && focusedConnections.has(to.name)) {
            opacity = 1.0; // Full opacity for focused connections
            lineWidthBoost = 2; // Make focused lines thicker (+2px)
        } else {
            opacity = 0.1; // Nearly invisible for unrelated connections
        }
    }
    ctx.globalAlpha = opacity;
    // Current State view: simple bidirectional fat arrow called "Actual Comms"
    let fromX, fromY, toX, toY;

    // Use custom positions if in product-lines or value-streams perspective
    if (currentView === 'current' && (currentPerspective === 'product-lines' || currentPerspective === 'value-streams') && customTeamPositions) {
        const fromPos = customTeamPositions.get(from.name);
        const toPos = customTeamPositions.get(to.name);

        if (fromPos && toPos) {
            fromX = fromPos.x + (fromPos.width || 120) / 2;
            fromY = fromPos.y + (fromPos.height || 50) / 2;
            toX = toPos.x + (toPos.width || 120) / 2;
            toY = toPos.y + (toPos.height || 50) / 2;
        } else {
            // Fall back to standard positions
            const fromWidth = getTeamBoxWidth(from, currentView);
            const toWidth = getTeamBoxWidth(to, currentView);
            fromX = from.position.x + fromWidth / 2;
            fromY = from.position.y + LAYOUT.TEAM_BOX_HEIGHT / 2;
            toX = to.position.x + toWidth / 2;
            toY = to.position.y + LAYOUT.TEAM_BOX_HEIGHT / 2;
        }
    } else {
        const fromWidth = getTeamBoxWidth(from, currentView);
        const toWidth = getTeamBoxWidth(to, currentView);
        fromX = from.position.x + fromWidth / 2;
        fromY = from.position.y + LAYOUT.TEAM_BOX_HEIGHT / 2;
        toX = to.position.x + toWidth / 2;
        toY = to.position.y + LAYOUT.TEAM_BOX_HEIGHT / 2;
    }

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
    ctx.globalAlpha = 1.0; // Reset
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

    // Special handling for product-lines and value-streams perspectives: check tracked positions
    if (currentView === 'current' && (currentPerspective === 'product-lines' || currentPerspective === 'value-streams') && customTeamPositions) {
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
