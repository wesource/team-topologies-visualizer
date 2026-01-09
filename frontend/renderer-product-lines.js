/**
 * Product Lines View Renderer - Hybrid Layout
 * Vertical product lanes + horizontal shared teams row
 */
import { darkenColor, getCognitiveLoadIndicator } from './renderer-common.js';

const PRODUCT_LANE_WIDTH = 300;
const PRODUCT_LANE_PADDING = 20;
const PRODUCT_HEADER_HEIGHT = 60;
const TEAM_CARD_HEIGHT = 50;
const TEAM_CARD_SPACING = 15;
const SHARED_ROW_HEIGHT = 100;
const SHARED_TEAM_WIDTH = 140;
const SHARED_TEAM_SPACING = 20;

/**
 * Draw Product Lines View with hybrid layout
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} productLinesData - Data from /api/pre-tt/product-lines
 * @param {Array} teams - All teams (for position updates)
 * @param {Object} teamColorMap - Team type colors
 * @param {Function} wrapText - Text wrapping function
 * @param {boolean} showCognitiveLoad - Whether to show cognitive load indicators
 * @param {Map} teamPositions - Map to store team positions for click detection
 * @param {boolean} showTeamTypeBadges - Whether to show team type badges (Feature/Platform/etc)
 * @param {Object} selectedTeam - Currently selected team (for highlighting)
 * @param {Object} focusedTeam - Focused team for focus mode (or null)
 * @param {Set} focusedConnections - Set of team names in focus network
 */
export function drawProductLinesView(ctx, productLinesData, teams, teamColorMap, wrapText, showCognitiveLoad = false, teamPositions = null, showTeamTypeBadges = false, selectedTeam = null, focusedTeam = null, focusedConnections = null) {
    if (!productLinesData || !productLinesData.products) return;

    // Clear team positions map at start of rendering
    if (teamPositions) {
        teamPositions.clear();
    }

    const products = productLinesData.products;
    const sharedTeams = productLinesData.shared_teams || [];

    // Calculate layout
    const startX = 50;
    const startY = 100;
    // Calculate canvas width based on products (minimum width for shared teams)
    const productsWidth = products.length * (PRODUCT_LANE_WIDTH + PRODUCT_LANE_PADDING);
    const minWidthForSharedTeams = sharedTeams.length > 0 ? Math.max(800, sharedTeams.length * (SHARED_TEAM_WIDTH + SHARED_TEAM_SPACING) + 40) : 0;
    const totalWidth = Math.max(productsWidth, minWidthForSharedTeams);

    // Draw title
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Product Lines View', startX, startY - 40);

    // Draw vertical product lanes
    products.forEach((product, index) => {
        const laneX = startX + index * (PRODUCT_LANE_WIDTH + PRODUCT_LANE_PADDING);
        drawProductLane(ctx, product, laneX, startY, teamColorMap, wrapText, showCognitiveLoad, teamPositions, showTeamTypeBadges, selectedTeam, focusedTeam, focusedConnections);
    });

    // Calculate shared row position (below longest product lane)
    const maxProductHeight = Math.max(
        ...products.map(p => PRODUCT_HEADER_HEIGHT + (p.teams.length * (TEAM_CARD_HEIGHT + TEAM_CARD_SPACING)) + 40),
        200
    );
    const sharedRowY = startY + maxProductHeight + 60;

    // Draw horizontal shared teams row
    drawSharedTeamsRow(ctx, sharedTeams, startX, sharedRowY, totalWidth, teamColorMap, wrapText, showCognitiveLoad, teamPositions, showTeamTypeBadges, selectedTeam, focusedTeam, focusedConnections);
}

/**
 * Draw a single product lane (vertical)
 */
function drawProductLane(ctx, product, x, y, teamColorMap, wrapText, showCognitiveLoad, teamPositions, showTeamTypeBadges, selectedTeam, focusedTeam, focusedConnections) {
    // Draw product header with color
    ctx.fillStyle = product.color || '#3498db';
    ctx.fillRect(x, y, PRODUCT_LANE_WIDTH, PRODUCT_HEADER_HEIGHT);

    // Product name (white text on colored background)
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(product.name, x + PRODUCT_LANE_WIDTH / 2, y + 25);

    // Team count
    ctx.font = '12px Arial';
    ctx.fillText(`${product.teams.length} team${product.teams.length !== 1 ? 's' : ''}`,
        x + PRODUCT_LANE_WIDTH / 2, y + 45);

    // Draw lane background (light gray, not product colored)
    const laneHeight = (product.teams.length * (TEAM_CARD_HEIGHT + TEAM_CARD_SPACING)) + 40;
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(x, y + PRODUCT_HEADER_HEIGHT, PRODUCT_LANE_WIDTH, laneHeight);

    // Draw border
    ctx.strokeStyle = darkenColor(product.color, 0.2);
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, PRODUCT_LANE_WIDTH, PRODUCT_HEADER_HEIGHT + laneHeight);

    // Draw teams in vertical stack
    product.teams.forEach((team, index) => {
        const teamY = y + PRODUCT_HEADER_HEIGHT + 20 + index * (TEAM_CARD_HEIGHT + TEAM_CARD_SPACING);
        drawProductTeamCard(ctx, team, x + 10, teamY, PRODUCT_LANE_WIDTH - 20, teamColorMap, wrapText, showCognitiveLoad, teamPositions, showTeamTypeBadges, selectedTeam, focusedTeam, focusedConnections);
    });

    ctx.textAlign = 'left'; // Reset
}

/**
 * Draw a team card in a product lane
 */
function drawProductTeamCard(ctx, team, x, y, width, teamColorMap, wrapText, showCognitiveLoad, teamPositions, showTeamTypeBadges, selectedTeam, focusedTeam, focusedConnections) {
    // Record team position for click detection (store in world coordinates)
    if (teamPositions && team.name) {
        teamPositions.set(team.name, { x, y, width, height: TEAM_CARD_HEIGHT });

        // Debug logging for specific teams
        if (team.name === 'Web Frontend Team' || team.name === 'Database Team') {
            console.log(`📦 Product team "${team.name}" positioned at:`, {
                x, y, width, height: TEAM_CARD_HEIGHT,
                center: { x: x + width / 2, y: y + TEAM_CARD_HEIGHT / 2 }
            });
        }
    }

    // Apply focus mode opacity if active
    if (focusedTeam && focusedConnections) {
        const isInFocus = focusedConnections.has(team.name);
        ctx.globalAlpha = isInFocus ? 1.0 : 0.2;
    }

    // Get team type color (same as used in hierarchy view)
    const teamColor = teamColorMap[team.team_type] || '#666';

    // Card background with team-type color
    ctx.fillStyle = teamColor;
    ctx.fillRect(x, y, width, TEAM_CARD_HEIGHT);

    // Card border (darker for selected team, standard otherwise)
    const isSelected = selectedTeam && selectedTeam.name === team.name;
    ctx.strokeStyle = isSelected ? '#333' : darkenColor(teamColor, 0.7);
    ctx.lineWidth = isSelected ? 4 : 2;
    ctx.strokeRect(x, y, width, TEAM_CARD_HEIGHT);

    // Team name (black text on colored background)
    ctx.fillStyle = '#000';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'left';

    // Truncate name if too long
    const maxWidth = width - 20;
    let teamName = team.name;
    let textWidth = ctx.measureText(teamName).width;

    if (textWidth > maxWidth) {
        while (textWidth > maxWidth && teamName.length > 0) {
            teamName = teamName.slice(0, -1);
            textWidth = ctx.measureText(teamName + '...').width;
        }
        teamName += '...';
    }

    ctx.fillText(teamName, x + 10, y + 20);

    // Team type badge (only if enabled)
    if (showTeamTypeBadges) {
        ctx.font = '10px Arial';
        ctx.fillStyle = '#333';
        const typeText = getTeamTypeBadge(team.team_type);
        ctx.fillText(typeText, x + 10, y + 38);
    }

    // Cognitive load indicator (if enabled and present)
    if (showCognitiveLoad && team.cognitive_load) {
        const indicator = getCognitiveLoadIndicator(team.cognitive_load);
        if (indicator && indicator.emoji) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'right';
            ctx.fillText(indicator.emoji, x + width - 10, y + 25);
            ctx.textAlign = 'left'; // Reset
        }
    }

    // Reset global alpha
    ctx.globalAlpha = 1.0;
}

/**
 * Draw shared teams row (horizontal)
 */
function drawSharedTeamsRow(ctx, sharedTeams, x, y, totalWidth, teamColorMap, wrapText, showCognitiveLoad, teamPositions, showTeamTypeBadges, selectedTeam, focusedTeam, focusedConnections) {
    // Draw section header
    ctx.fillStyle = '#95a5a6';
    const headerHeight = 50;
    ctx.fillRect(x, y, totalWidth, headerHeight);

    // Section title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Shared / Platform Teams', x + totalWidth / 2, y + 25);
    ctx.font = '12px Arial';
    ctx.fillText(`${sharedTeams.length} team${sharedTeams.length !== 1 ? 's' : ''}`,
        x + totalWidth / 2, y + 40);

    // Draw row background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(x, y + headerHeight, totalWidth, SHARED_ROW_HEIGHT);

    // Draw border
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, totalWidth, headerHeight + SHARED_ROW_HEIGHT);

    // Draw teams horizontally
    const teamStartX = x + 20;
    const teamY = y + headerHeight + 20;

    sharedTeams.forEach((team, index) => {
        const teamX = teamStartX + index * (SHARED_TEAM_WIDTH + SHARED_TEAM_SPACING);

        // Check if we need to wrap to next row (simple layout for now)
        if (teamX + SHARED_TEAM_WIDTH > x + totalWidth - 20) {
            return; // Skip if it doesn't fit (we'll improve this later)
        }

        drawSharedTeamCard(ctx, team, teamX, teamY, teamColorMap, wrapText, showCognitiveLoad, teamPositions, showTeamTypeBadges, selectedTeam, focusedTeam, focusedConnections);
    });

    ctx.textAlign = 'left'; // Reset
}

/**
 * Draw a shared team card
 */
function drawSharedTeamCard(ctx, team, x, y, teamColorMap, wrapText, showCognitiveLoad, teamPositions, showTeamTypeBadges, selectedTeam) {
    const cardWidth = SHARED_TEAM_WIDTH;
    const cardHeight = 60;

    // Record team position for click detection
    if (teamPositions && team.name) {
        teamPositions.set(team.name, { x, y, width: cardWidth, height: cardHeight });

        // Debug logging for specific teams
        if (team.name === 'Web Frontend Team' || team.name === 'Database Team') {
            console.log(`🔧 Shared team "${team.name}" positioned at:`, {
                x, y, width: cardWidth, height: cardHeight,
                center: { x: x + cardWidth / 2, y: y + cardHeight / 2 }
            });
        }
    }

    // Get team type color (same as used in hierarchy view)
    const teamColor = teamColorMap[team.team_type] || '#666';

    // Card background with team-type color
    ctx.fillStyle = teamColor;
    ctx.fillRect(x, y, cardWidth, cardHeight);

    // Card border (darker for selected team, standard otherwise)
    const isSelected = selectedTeam && selectedTeam.name === team.name;
    ctx.strokeStyle = isSelected ? '#333' : darkenColor(teamColor, 0.7);
    ctx.lineWidth = isSelected ? 4 : 2;
    ctx.strokeRect(x, y, cardWidth, cardHeight);

    // Team name (black text on colored background)
    ctx.fillStyle = '#000';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';

    // Truncate name if too long
    const maxWidth = cardWidth - 10;
    let teamName = team.name;
    let textWidth = ctx.measureText(teamName).width;

    if (textWidth > maxWidth) {
        while (textWidth > maxWidth && teamName.length > 0) {
            teamName = teamName.slice(0, -1);
            textWidth = ctx.measureText(teamName + '...').width;
        }
        teamName += '...';
    }

    ctx.fillText(teamName, x + cardWidth / 2, y + 25);

    // Team type badge (only if enabled)
    if (showTeamTypeBadges) {
        ctx.font = '9px Arial';
        ctx.fillStyle = '#333';
        const typeText = getTeamTypeBadge(team.team_type);
        ctx.fillText(typeText, x + cardWidth / 2, y + 45);
    }

    // Cognitive load indicator (if enabled and present) - top-right position with white outline
    if (showCognitiveLoad && team.cognitive_load) {
        const indicator = getCognitiveLoadIndicator(team.cognitive_load);
        if (indicator) {
            const indicatorSize = 12;
            const indicatorX = x + cardWidth - indicatorSize - 8;
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

    ctx.textAlign = 'left'; // Reset

    // Reset global alpha
    ctx.globalAlpha = 1.0;
}

/**
 * Get human-readable team type badge
 */
function getTeamTypeBadge(teamType) {
    const badges = {
        'dev-team': 'Dev',
        'ops-team': 'Ops',
        'platform-team': 'Platform',
        'support-team': 'Support',
        'feature-team': 'Feature'
    };
    return badges[teamType] || teamType;
}
