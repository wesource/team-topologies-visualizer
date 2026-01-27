/**
 * Business Streams View Renderer (Baseline only)
 * Displays teams grouped hierarchically: Business Stream → Products → Teams
 * Nested vertical layout with large business stream containers
 */

import { drawTeam, wrapText, getTeamBoxWidth, getTeamBoxHeight } from './renderer-common.js';
import { state } from '../core/state-management.js';
import { debugLog } from '../core/config.js';

const LAYOUT = {
    businessStreamWidth: 600,
    businessStreamPadding: 30,
    productSectionHeight: 200,
    productPadding: 15,
    teamWidth: 250,
    teamHeight: 100,
    teamSpacing: 15,
    businessStreamSpacing: 40,
    headerHeight: 50,
    sectionHeaderHeight: 35,
    startX: 40,
    startY: 40
};

/**
 * Render Business Streams view with nested Product sections
 */
export function renderBusinessStreamsView(ctx, data) {
    debugLog('🌊 renderBusinessStreamsView called with data:', data);
    const { business_streams, products_without_business_stream, ungrouped_teams, teams } = data;

    // Clear position tracking map
    state.businessStreamsTeamPositions.clear();

    let currentY = LAYOUT.startY;

    // Draw title
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Business Streams View', LAYOUT.startX, currentY - 20);

    // Calculate right column X position (left column width + spacing)
    const rightColumnX = LAYOUT.startX + LAYOUT.businessStreamWidth + LAYOUT.businessStreamSpacing;
    let rightColumnY = LAYOUT.startY;

    // Render each Business Stream as a large container (left column)
    for (const [_bsName, bsData] of Object.entries(business_streams)) {
        const bsHeight = calculateBusinessStreamHeight(bsData.products);

        // Draw business stream container
        drawBusinessStreamContainer(ctx, LAYOUT.startX, currentY, LAYOUT.businessStreamWidth, bsHeight, bsData);

        // Draw products within business stream
        let productY = currentY + LAYOUT.headerHeight + LAYOUT.businessStreamPadding;

        for (const [productName, productTeams] of Object.entries(bsData.products)) {
            if (productName === '_no_product') continue; // Skip teams without products

            const productHeight = calculateProductSectionHeight(productTeams);

            // Draw product section
            drawProductSection(ctx, LAYOUT.startX + LAYOUT.businessStreamPadding, productY,
                LAYOUT.businessStreamWidth - (LAYOUT.businessStreamPadding * 2),
                productHeight, productName, productTeams, state.teams);

            productY += productHeight + LAYOUT.productPadding;
        }

        currentY += bsHeight + LAYOUT.businessStreamSpacing;
    }

    // Render "Ungrouped Products" section in right column if there are products without value streams
    if (Object.keys(products_without_business_stream).length > 0) {
        const ungroupedHeight = calculateUngroupedProductsHeight(products_without_business_stream);
        drawUngroupedProductsSection(ctx, rightColumnX, rightColumnY, LAYOUT.businessStreamWidth,
            ungroupedHeight, products_without_business_stream, teams);
        rightColumnY += ungroupedHeight + LAYOUT.businessStreamSpacing;
    }

    // Render completely ungrouped teams in right column below ungrouped products
    if (ungrouped_teams && ungrouped_teams.length > 0) {
        drawUngroupedTeams(ctx, rightColumnX, rightColumnY, ungrouped_teams, teams);
    }

    return teams;
}

/**
 * Draw value stream container with header
 */
function drawBusinessStreamContainer(ctx, x, y, width, height, bsData) {
    // Container background
    ctx.fillStyle = bsData.color + '20'; // 20 = 12% opacity
    ctx.strokeStyle = bsData.color;
    ctx.lineWidth = 3;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    // Header background
    ctx.fillStyle = bsData.color + '40'; // 40 = 25% opacity
    ctx.fillRect(x, y, width, LAYOUT.headerHeight);

    // Header text
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 18px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    const vsNameX = x + 20;
    debugLog(`Value Stream "${bsData.name}" x-position: ${vsNameX} (container x: ${x})`);
    ctx.fillText(bsData.name, vsNameX, y + 30);

    // Team count badge - calculate from products
    const teamCount = Object.values(bsData.products).reduce((sum, teams) => sum + teams.length, 0);
    ctx.font = '13px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(`${teamCount} team${teamCount !== 1 ? 's' : ''}`, x + width - 100, y + 30);
}

/**
 * Draw product section within value stream
 */
function drawProductSection(ctx, x, y, width, height, productName, teams, allTeams) {
    // Product section background
    ctx.fillStyle = '#f8f9fa';
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    // Product header
    ctx.fillStyle = '#495057';
    ctx.font = 'bold 14px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    const productNameX = x + LAYOUT.productPadding;
    debugLog(`Product "${productName}" x-position: ${productNameX} (section x: ${x}, padding: ${LAYOUT.productPadding})`);
    ctx.fillText(productName, productNameX, y + 22);

    // Render teams as cards
    let teamX = x + LAYOUT.productPadding;
    let teamY = y + LAYOUT.sectionHeaderHeight + LAYOUT.productPadding;

    for (const teamData of teams) {
        // Wrap to next row if needed (check before positioning)
        if (teamX + LAYOUT.teamWidth > x + width - LAYOUT.productPadding && teamX > x + LAYOUT.productPadding) {
            teamX = x + LAYOUT.productPadding;
            teamY += LAYOUT.teamHeight + LAYOUT.teamSpacing;
        }

        // Look up the actual team object from state.teams for selection to work
        const team = allTeams.find(t => t.name === teamData.name) || teamData;

        // Temporarily set position for rendering
        const originalX = team.position?.x;
        const originalY = team.position?.y;
        team.position = { x: teamX, y: teamY };

        // Get actual rendered dimensions (not layout dimensions)
        const actualWidth = getTeamBoxWidth(team, 'current');
        const actualHeight = getTeamBoxHeight(team, 'current');

        // Track position for click detection and selection using actual dimensions
        state.businessStreamsTeamPositions.set(team.name, { x: teamX, y: teamY, width: actualWidth, height: actualHeight });

        // Debug logging for specific teams
        if (team.name === 'Web Frontend Team' || team.name === 'Database Team') {
            debugLog(`📍 Team "${team.name}" positioned at:`, {
                x: teamX,
                y: teamY,
                width: actualWidth,
                height: actualHeight,
                center: { x: teamX + actualWidth / 2, y: teamY + actualHeight / 2 }
            });
        }

        drawTeam(ctx, team, state.selectedTeam, state.teamColorMap,
            (text, maxWidth) => wrapText(ctx, text, maxWidth),
            'current', state.showCognitiveLoad, null, state.showTeamTypeBadges,
            null, null, state.focusedTeam, state.focusedConnections);

        // Restore original position
        if (originalX !== undefined && originalY !== undefined) {
            team.position = { x: originalX, y: originalY };
        }

        teamX += LAYOUT.teamWidth + LAYOUT.teamSpacing;
    }
}

/**
 * Draw ungrouped products section
 */
function drawUngroupedProductsSection(ctx, x, y, width, height, products, allTeams) {
    // Container
    ctx.fillStyle = '#fff3cd20'; // Light yellow tint
    ctx.strokeStyle = '#ffc107';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);

    // Header
    ctx.fillStyle = '#856404';
    ctx.font = 'bold 16px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚠ Products not assigned to a business stream', x + 20, y + 30);

    let productY = y + 70;

    for (const [productName, productTeams] of Object.entries(products)) {
        const productHeight = calculateProductSectionHeight(productTeams);

        drawProductSection(ctx, x + LAYOUT.businessStreamPadding, productY,
            width - (LAYOUT.businessStreamPadding * 2),
            productHeight, productName, productTeams, allTeams);

        productY += productHeight + LAYOUT.productPadding;
    }
}

/**
 * Draw completely ungrouped teams
 */
function drawUngroupedTeams(ctx, x, y, teams, allTeams) {
    ctx.fillStyle = '#6c757d';
    ctx.font = 'bold 14px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚠ Teams Without Product or Business Stream', x, y + 20);

    let teamX = x;
    let teamY = y + 40;

    for (const teamData of teams) {
        // Look up the actual team object from state.teams for selection to work
        const team = allTeams.find(t => t.name === teamData.name) || teamData;
        // Temporarily set position for rendering
        const originalX = team.position?.x;
        const originalY = team.position?.y;
        team.position = { x: teamX, y: teamY };

        // Get actual rendered dimensions
        const actualWidth = getTeamBoxWidth(team, 'current');
        const actualHeight = getTeamBoxHeight(team, 'current');

        // Track position for click detection using actual dimensions
        state.businessStreamsTeamPositions.set(team.name, { x: teamX, y: teamY, width: actualWidth, height: actualHeight });

        // Debug logging for specific teams
        if (team.name === 'Web Frontend Team' || team.name === 'Database Team') {
            debugLog(`📍 Ungrouped team "${team.name}" positioned at:`, {
                x: teamX,
                y: teamY,
                width: actualWidth,
                height: actualHeight,
                center: { x: teamX + actualWidth / 2, y: teamY + actualHeight / 2 }
            });
        }

        drawTeam(ctx, team, state.selectedTeam, state.teamColorMap,
            (text, maxWidth) => wrapText(ctx, text, maxWidth),
            'current', state.showCognitiveLoad, null, state.showTeamTypeBadges,
            null, null, state.focusedTeam, state.focusedConnections);

        // Restore original position
        if (originalX !== undefined && originalY !== undefined) {
            team.position = { x: originalX, y: originalY };
        }

        teamX += LAYOUT.teamWidth + LAYOUT.teamSpacing;

        if (teamX + LAYOUT.teamWidth > x + LAYOUT.businessStreamWidth) {
            teamX = x;
            teamY += LAYOUT.teamHeight + LAYOUT.teamSpacing;
        }
    }
}

/**
 * Calculate value stream container height
 */
function calculateBusinessStreamHeight(products) {
    let totalHeight = LAYOUT.headerHeight + LAYOUT.businessStreamPadding;

    for (const [productName, teams] of Object.entries(products)) {
        if (productName === '_no_product') continue;
        totalHeight += calculateProductSectionHeight(teams) + LAYOUT.productPadding;
    }

    return totalHeight + LAYOUT.businessStreamPadding;
}

/**
 * Calculate product section height based on number of teams
 */
function calculateProductSectionHeight(teams) {
    const teamsPerRow = Math.floor((LAYOUT.businessStreamWidth - (LAYOUT.businessStreamPadding * 2) - (LAYOUT.productPadding * 2)) /
                                   (LAYOUT.teamWidth + LAYOUT.teamSpacing));
    const rows = Math.ceil(teams.length / teamsPerRow);

    return LAYOUT.sectionHeaderHeight + (LAYOUT.productPadding * 2) +
           (rows * LAYOUT.teamHeight) + ((rows - 1) * LAYOUT.teamSpacing);
}

/**
 * Calculate ungrouped products section height
 */
function calculateUngroupedProductsHeight(products) {
    let totalHeight = 70; // Header area

    for (const teams of Object.values(products)) {
        totalHeight += calculateProductSectionHeight(teams) + LAYOUT.productPadding;
    }

    return totalHeight + LAYOUT.businessStreamPadding;
}

