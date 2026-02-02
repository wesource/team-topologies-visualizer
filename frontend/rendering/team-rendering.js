/**
 * Team rendering utilities for Team Topologies visualizations
 * Handles drawing individual team boxes with different shapes and styles
 */

import { LAYOUT } from '../core/constants.js';
import { darkenColor, getCognitiveLoadIndicator } from './color-utils.js';
import { wrapText as wrapTextUtil } from './text-rendering.js';

/**
 * Apply focus mode opacity to team if not in focus
 */
function _applyFocusModeOpacity(ctx, team, focusedTeam, focusedConnections) {
    if (focusedTeam && focusedConnections) {
        // Dim teams that are not in focus
        if (team.name !== focusedTeam.name && !focusedConnections.has(team.name)) {
            ctx.globalAlpha = 0.2; // Dim non-focused teams
        }
    }
}

/**
 * Try to draw team with type-specific shape (TT Design view only)
 * @returns {boolean} True if drawn with specific shape, false to fall back to default
 */
function _drawTeamTypeSpecificShape(ctx, team, x, y, width, height, options) {
    switch (team.team_type) {
        case 'enabling':
            drawEnablingTeam(ctx, team, x, y, width, height, options);
            return true;
        case 'complicated-subsystem':
            drawComplicatedSubsystemTeam(ctx, team, x, y, width, height, options);
            return true;
        case 'undefined':
            drawUndefinedTeam(ctx, team, x, y, width, height, options);
            return true;
        default:
            return false; // Let drawTeam fall back to default box
    }
}

/**
 * Get team color from team type config or fallback
 */
function getTeamColor(team, teamColorMap) {
    // Try to get color from team type config
    if (team.team_type && teamColorMap[team.team_type]) {
        return teamColorMap[team.team_type];
    }
    // Final fallback
    return '#95a5a6';
}

/**
 * Helper: Draw team name with text wrapping
 */
function drawTeamName(ctx, team, x, y, width, height) {
    ctx.fillStyle = '#222222'; // Dark gray text for better readability
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = wrapTextUtil(ctx, team.name, width - 20);

    // Draw team name lines (centered vertically)
    lines.forEach((line, i) => {
        ctx.fillText(line, x + width / 2, y + height / 2 - (lines.length - 1) * 8 + i * 16);
    });
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

    // Badge dimensions (similar to platform consumer badge)
    const badgePadding = 8;
    const badgeHeight = 36;
    const emoji = '📊';
    
    // Format lead time
    const leadTime = team.flow_metrics.lead_time_days !== undefined ?
        `${Math.round(team.flow_metrics.lead_time_days)}d` : '?';
    const text = `${leadTime} ${health.emoji}`;

    // Measure text to calculate badge width
    ctx.font = 'bold 22px sans-serif';
    const textWidth = ctx.measureText(text).width;
    const emojiWidth = 24;
    const badgeWidth = emojiWidth + textWidth + badgePadding * 3;

    // Position in bottom-right corner
    const badgeX = x + width - badgeWidth - 6;
    const badgeY = y + height - badgeHeight - 6;

    // Draw badge background with health color
    ctx.fillStyle = health.color;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8);
    ctx.fill();

    // Draw emoji
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(emoji, badgeX + badgePadding, badgeY + badgeHeight / 2);

    // Draw text (lead time + health emoji)
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText(text, badgeX + emojiWidth + badgePadding * 1.5, badgeY + badgeHeight / 2);
}

/**
 * Draw team box - main entry point for rendering a team
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} team - Team object
 * @param {Function} getTeamBoxWidth - Function to calculate team box width
 * @param {Function} getTeamBoxHeight - Function to calculate team box height
 * @param {Object} options - Drawing options
 */
export function drawTeam(ctx, team, getTeamBoxWidth, getTeamBoxHeight, options = {}) {
    const {
        selectedTeam = null,
        teamColorMap,
        currentView = 'baseline',
        showCognitiveLoad = false,
        comparisonData = null,
        showTeamTypeBadges = false,
        platformMetrics = null,
        showFlowMetrics = false,
        focusedTeam = null,
        focusedConnections = null
    } = options;

    _applyFocusModeOpacity(ctx, team, focusedTeam, focusedConnections);

    const x = team.position.x;
    const y = team.position.y;
    const width = getTeamBoxWidth(team, currentView);
    const height = getTeamBoxHeight(team, currentView);

    // Use shape-specific drawing in TT Design view
    if (currentView === 'tt') {
        const drawnWithSpecificShape = _drawTeamTypeSpecificShape(ctx, team, x, y, width, height, {
            selectedTeam,
            teamColorMap,
            showCognitiveLoad,
            comparisonData,
            showTeamTypeBadges
        });

        if (drawnWithSpecificShape) {
            ctx.globalAlpha = 1.0; // Reset opacity
            return;
        }
    }

    // Default: draw as rounded rectangle
    drawDefaultTeamBox(ctx, team, x, y, width, height, {
        selectedTeam,
        teamColorMap,
        showCognitiveLoad,
        showTeamTypeBadges,
        platformMetrics,
        currentView,
        showFlowMetrics
    });
    ctx.globalAlpha = 1.0; // Reset opacity
}

/**
 * Draw team as default box (rounded corners in TT Design, sharp corners in Baseline view)
 */
function drawDefaultTeamBox(ctx, team, x, y, width, height, options = {}) {
    const {
        selectedTeam,
        teamColorMap,
        showCognitiveLoad,
        showTeamTypeBadges = false,
        platformMetrics = null,
        currentView = 'baseline',
        showFlowMetrics = false
    } = options;

    // TT shapes: stream-aligned is rounded; platform is sharp (per Team Shape Templates)
    // Baseline view (hierarchy, product lines, value streams): sharp corners
    const radius = currentView === 'tt' && team.team_type === 'stream-aligned' ? 15 : 0;
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
    drawTeamName(ctx, team, x, y, width, height);

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
 */
function drawEnablingTeam(ctx, team, x, y, width, height, options = {}) {
    const {
        selectedTeam,
        teamColorMap,
        showCognitiveLoad,
        comparisonData,
        showTeamTypeBadges = false
    } = options;

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

    const radius = 14; // Rounded corners for enabling teams
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
    const lines = wrapTextUtil(ctx, team.name, height - 20);

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
 */
function drawComplicatedSubsystemTeam(ctx, team, x, y, width, height, options = {}) {
    const {
        selectedTeam,
        teamColorMap,
        showCognitiveLoad,
        comparisonData
    } = options;

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
    drawTeamName(ctx, team, x, y, width, height);

    // Draw comparison badge if in comparison mode
    if (comparisonBadge) {
        drawComparisonBadge(ctx, comparisonBadge, x, y, width, height);
    }
}

/**
 * Draw undefined team with dotted border (TT Design view only)
 */
function drawUndefinedTeam(ctx, team, x, y, width, height, options = {}) {
    const {
        selectedTeam,
        teamColorMap,
        showCognitiveLoad,
        comparisonData
    } = options;

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

    // Dotted border for undefined teams (always gray to indicate neutral/uncertain state)
    ctx.save();
    ctx.setLineDash([1, 4]);
    ctx.lineCap = 'round';
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
    drawTeamName(ctx, team, x, y, width, height);

    // Draw comparison badge if in comparison mode
    if (comparisonBadge) {
        drawComparisonBadge(ctx, comparisonBadge, x, y, width, height);
    }
}
