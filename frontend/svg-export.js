import { LAYOUT } from './constants.js';
import { darkenColor, getTeamBoxWidth, getTeamBoxHeight } from './renderer-common.js';
import { getValueStreamGroupings } from './tt-value-stream-grouping.js';
import { getPlatformGroupings } from './tt-platform-grouping.js';

// SVG Export Module - Separated from runtime rendering
// Converts current visualization state to downloadable SVG
export function exportToSVG(state, organizationHierarchy, teams, teamColorMap, currentView, showInteractionModes = true) {
    // Handle product-lines and business-streams perspectives
    const isBaselineView = currentView === 'current';
    const isProductLines = isBaselineView && state.currentPerspective === 'product-lines';
    const isBusinessStreams = isBaselineView && state.currentPerspective === 'business-streams';
    const isHierarchy = isBaselineView && state.currentPerspective === 'hierarchy';

    let width = 2000;
    let height = 1500;
    let viewBox = `0 0 ${width} ${height}`;
    // For TT vision or hierarchy view, calculate bounding box to fit all teams
    if ((currentView === 'tt' || isHierarchy) && teams.length > 0) {
        const padding = 100;
        const minX = Math.min(...teams.map(t => t.position.x)) - padding;
        const minY = Math.min(...teams.map(t => t.position.y)) - padding;
        const maxX = Math.max(...teams.map(t => t.position.x + LAYOUT.TEAM_BOX_WIDTH)) + padding;
        const maxY = Math.max(...teams.map(t => t.position.y + LAYOUT.TEAM_BOX_HEIGHT)) + padding;
        width = maxX - minX;
        height = maxY - minY;
        viewBox = `${minX} ${minY} ${width} ${height}`;
    }
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}">
  <defs>
    <style>
      .team-box { stroke-width: 3; }
      .team-text { font-family: sans-serif; fill: #000; text-anchor: middle; }
      .team-text-bold { font-family: sans-serif; font-size: 18px; font-weight: bold; text-anchor: middle; }
      .hierarchy-line { stroke: #7f8c8d; stroke-width: 1.5; fill: none; }
      .connection-line { stroke-width: 2; fill: none; }
    </style>
  </defs>
  <rect x="${currentView === 'tt' && teams.length > 0 ? Math.min(...teams.map(t => t.position.x)) - 100 : 0}" y="${currentView === 'tt' && teams.length > 0 ? Math.min(...teams.map(t => t.position.y)) - 100 : 0}" width="${width}" height="${height}" fill="white"/>
`;
    if (currentView === 'current' && isProductLines && state.productLinesData) {
        svg += generateProductLinesSVG(state.productLinesData, teamColorMap);
    } else if (currentView === 'current' && isBusinessStreams && state.businessStreamsData) {
        svg += generateBusinessStreamsSVG(state.businessStreamsData, teamColorMap);
    } else if (currentView === 'current' && organizationHierarchy) {
        svg += generateCurrentStateSVG(organizationHierarchy, teams, teamColorMap);
    } else {
        svg += generateTTVisionSVG(teams, teamColorMap, showInteractionModes);
    }
    svg += '</svg>';

    // Generate filename with European date format: yyyy-mm-dd-HHMM
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}-${hours}${minutes}`;

    downloadSVG(svg, `team-topology-${currentView}-${timestamp}.svg`);
}
function generateCurrentStateSVG(organizationHierarchy, teams, teamColorMap) {
    let elements = '';
    const startX = 500;
    const startY = LAYOUT.COMPANY_Y;
    const levelHeight = LAYOUT.LEVEL_HEIGHT;
    const boxWidth = LAYOUT.DEPT_BOX_WIDTH;
    const boxHeight = LAYOUT.DEPT_BOX_HEIGHT;

    // Title
    elements += '<text x="50" y="60" style="font-family: sans-serif; font-size: 24px; font-weight: bold; fill: #333;" text-anchor="start">Hierarchy View</text>\n';

    // Draw company leadership
    const company = organizationHierarchy.company;
    elements += drawSVGBox(company.name, startX + 400, startY, boxWidth + 100, boxHeight, '#5D6D7E', 'white', true);
    // Draw departments
    const deptSpacing = LAYOUT.DEPT_SPACING;
    const deptStartX = startX + 50;
    if (!company.children)
        return elements;
    company.children.forEach((dept, index) => {
        const deptX = deptStartX + index * deptSpacing;
        const deptY = startY + levelHeight;
        // Line from company to department
        elements += drawSVGLine(startX + 400 + (boxWidth + 100) / 2, startY + boxHeight, deptX + boxWidth / 2, deptY);
        // Department box
        elements += drawSVGBox(dept.name, deptX, deptY, boxWidth, boxHeight, '#566573', 'white', false);
        // Engineering department with line managers
        if (dept.id === 'engineering-dept' && dept.line_managers) {
            const lmCount = dept.line_managers.length;
            const lmSpacing = LAYOUT.LINE_MANAGER_SPACING;
            const lmStartX = deptX - ((lmCount - 1) * lmSpacing) / 2;
            const lmY = deptY + levelHeight;
            dept.line_managers.forEach((lm, lmIndex) => {
                const lmX = lmStartX + lmIndex * lmSpacing;
                // Line to line manager
                elements += drawSVGLine(deptX + boxWidth / 2, deptY + boxHeight, lmX + boxWidth / 2, lmY);
                // Line manager box
                elements += drawSVGBox(lm.name, lmX, lmY, boxWidth, boxHeight - 10, '#27ae60', 'white', false);
                // Teams under line manager with org-chart style
                const teamsUnderManager = lm.teams
                    .map(teamName => teams.find(t => t.name === teamName))
                    .filter(t => t !== undefined);

                if (teamsUnderManager.length > 0) {
                    // Vertical line position at 1/5 from left of line manager box
                    const verticalLineX = lmX + (boxWidth * LAYOUT.ORG_CHART_VERTICAL_LINE_OFFSET);
                    const verticalLineStartY = lmY + boxHeight - 10;

                    // Find the lowest team position for vertical line
                    const lowestTeamY = Math.max(...teamsUnderManager.map(t => t.position.y + 40));

                    // Draw main vertical line
                    elements += drawSVGLine(verticalLineX, verticalLineStartY, verticalLineX, lowestTeamY);

                    // Draw horizontal connectors and team boxes
                    teamsUnderManager.forEach(team => {
                        const teamMidLeftY = team.position.y + 40;
                        elements += drawSVGLine(verticalLineX, teamMidLeftY, team.position.x, teamMidLeftY);
                        const color = teamColorMap[team.team_type] || '#95a5a6';
                        elements += drawSVGBox(team.name, team.position.x, team.position.y, LAYOUT.TEAM_BOX_WIDTH, LAYOUT.TEAM_BOX_HEIGHT, color, 'white', false);
                    });
                }
            });
        }
        // Other departments
        if (dept.regions) {
            const regionCount = dept.regions.length;
            const regionSpacing = 200;
            const regionStartX = deptX - ((regionCount - 1) * regionSpacing) / 2;
            const regionY = deptY + levelHeight;
            dept.regions.forEach((region, regionIndex) => {
                const regionX = regionStartX + regionIndex * regionSpacing;
                elements += drawSVGLine(deptX + boxWidth / 2, deptY + boxHeight, regionX + boxWidth / 2, regionY);
                elements += drawSVGBox(region.name, regionX, regionY, boxWidth, boxHeight - 10, '#3498db', 'white', false);
                // Teams under region with org-chart style
                if (region.teams && region.teams.length > 0) {
                    const teamsUnderRegion = region.teams
                        .map(teamName => teams.find(t => t.name === teamName))
                        .filter(t => t !== undefined);

                    if (teamsUnderRegion.length > 0) {
                        // Vertical line position at 1/5 from left of region box
                        const verticalLineX = regionX + (boxWidth * LAYOUT.ORG_CHART_VERTICAL_LINE_OFFSET);
                        const verticalLineStartY = regionY + boxHeight - 10;

                        // Find the lowest team position for vertical line
                        const lowestTeamY = Math.max(...teamsUnderRegion.map(t => t.position.y + 40));

                        // Draw main vertical line
                        elements += drawSVGLine(verticalLineX, verticalLineStartY, verticalLineX, lowestTeamY);

                        // Draw horizontal connectors and team boxes
                        teamsUnderRegion.forEach(team => {
                            const teamMidLeftY = team.position.y + 40;
                            elements += drawSVGLine(verticalLineX, teamMidLeftY, team.position.x, teamMidLeftY);
                            const color = teamColorMap[team.team_type] || '#95a5a6';
                            elements += drawSVGBox(team.name, team.position.x, team.position.y, LAYOUT.TEAM_BOX_WIDTH, LAYOUT.TEAM_BOX_HEIGHT, color, 'white', false);
                        });
                    }
                }
            });
        }
    });
    return elements;
}

function generateProductLinesSVG(productLinesData, teamColorMap) {
    let elements = '';
    if (!productLinesData || !productLinesData.products) return elements;

    const PRODUCT_LANE_WIDTH = 300;
    const PRODUCT_LANE_PADDING = 20;
    const PRODUCT_HEADER_HEIGHT = 60;
    const TEAM_CARD_HEIGHT = 50;
    const TEAM_CARD_SPACING = 15;
    const SHARED_ROW_HEIGHT = 100;
    const SHARED_TEAM_WIDTH = 140;
    const SHARED_TEAM_SPACING = 20;

    const products = productLinesData.products;
    const sharedTeams = productLinesData.shared_teams || [];
    const startX = 50;
    const startY = 100;
    const totalWidth = products.length * (PRODUCT_LANE_WIDTH + PRODUCT_LANE_PADDING);

    // Build team positions map for communication lines
    const teamPositions = new Map();

    // Calculate positions for product teams
    products.forEach((product, index) => {
        const laneX = startX + index * (PRODUCT_LANE_WIDTH + PRODUCT_LANE_PADDING);
        product.teams.forEach((team, teamIndex) => {
            const teamX = laneX + 20;
            const teamY = startY + PRODUCT_HEADER_HEIGHT + 20 + teamIndex * (TEAM_CARD_HEIGHT + TEAM_CARD_SPACING);
            teamPositions.set(team.name, {
                x: teamX + (PRODUCT_LANE_WIDTH - 40) / 2,
                y: teamY + TEAM_CARD_HEIGHT / 2
            });
        });
    });

    // Calculate positions for shared teams
    const maxProductHeight = Math.max(
        ...products.map(p => PRODUCT_HEADER_HEIGHT + (p.teams.length * (TEAM_CARD_HEIGHT + TEAM_CARD_SPACING)) + 40),
        200
    );
    const sharedRowY = startY + maxProductHeight + 60;
    const headerHeight = 50;
    const teamStartX = startX + 20;
    const teamY = sharedRowY + headerHeight + 20;
    sharedTeams.forEach((team, index) => {
        const teamX = teamStartX + index * (SHARED_TEAM_WIDTH + SHARED_TEAM_SPACING);
        teamPositions.set(team.name, {
            x: teamX + SHARED_TEAM_WIDTH / 2,
            y: teamY + 30
        });
    });

    // Title
    elements += `<text x="${startX}" y="${startY - 40}" style="font-family: sans-serif; font-size: 24px; font-weight: bold; fill: #333;" text-anchor="start">Product Lines View</text>\n`;

    // Draw each product lane
    products.forEach((product, index) => {
        const laneX = startX + index * (PRODUCT_LANE_WIDTH + PRODUCT_LANE_PADDING);

        // Product header
        elements += `<rect x="${laneX}" y="${startY}" width="${PRODUCT_LANE_WIDTH}" height="${PRODUCT_HEADER_HEIGHT}" fill="${product.color || '#3498db'}" rx="0" ry="0"/>\n`;
        elements += `<text x="${laneX + PRODUCT_LANE_WIDTH / 2}" y="${startY + 25}" class="team-text-bold" font-size="18" fill="white">${escapeXml(product.name)}</text>\n`;
        elements += `<text x="${laneX + PRODUCT_LANE_WIDTH / 2}" y="${startY + 45}" class="team-text" font-size="12" fill="white">${product.teams.length} team${product.teams.length !== 1 ? 's' : ''}</text>\n`;

        // Product lane background
        const laneHeight = PRODUCT_HEADER_HEIGHT + (product.teams.length * (TEAM_CARD_HEIGHT + TEAM_CARD_SPACING)) + 40;
        elements += `<rect x="${laneX}" y="${startY + PRODUCT_HEADER_HEIGHT}" width="${PRODUCT_LANE_WIDTH}" height="${laneHeight - PRODUCT_HEADER_HEIGHT}" fill="#f8f9fa" rx="0" ry="0"/>\n`;

        // Border
        elements += `<rect x="${laneX}" y="${startY}" width="${PRODUCT_LANE_WIDTH}" height="${laneHeight}" fill="none" stroke="${darkenColor(product.color || '#3498db', 0.7)}" stroke-width="2" rx="0" ry="0"/>\n`;
    });

    // Shared row header (reuse already calculated teamStartX, teamY, sharedRowY, headerHeight)
    elements += `<rect x="${startX}" y="${sharedRowY}" width="${totalWidth}" height="${headerHeight}" fill="#95a5a6" rx="0" ry="0"/>`;
    elements += `<text x="${startX + totalWidth / 2}" y="${sharedRowY + 25}" class="team-text-bold" font-size="18" fill="white">Shared / Platform Teams</text>`;
    elements += `<text x="${startX + totalWidth / 2}" y="${sharedRowY + 40}" class="team-text" font-size="12" fill="white">${sharedTeams.length} team${sharedTeams.length !== 1 ? 's' : ''}</text>`;

    // Shared row background
    elements += `<rect x="${startX}" y="${sharedRowY + headerHeight}" width="${totalWidth}" height="${SHARED_ROW_HEIGHT}" fill="#f8f9fa" rx="0" ry="0"/>`;
    elements += `<rect x="${startX}" y="${sharedRowY}" width="${totalWidth}" height="${headerHeight + SHARED_ROW_HEIGHT}" fill="none" stroke="#7f8c8d" stroke-width="2" rx="0" ry="0"/>`;

    // Draw communication lines (above product/shared boxes, below teams)
    const allTeams = [...products.flatMap(p => p.teams), ...sharedTeams];
    allTeams.forEach(team => {
        if (team.dependencies && team.dependencies.length > 0) {
            const fromPos = teamPositions.get(team.name);
            if (!fromPos) return;

            team.dependencies.forEach(targetName => {
                const toPos = teamPositions.get(targetName);
                if (!toPos) return;

                // Draw line
                elements += `<line x1="${fromPos.x}" y1="${fromPos.y}" x2="${toPos.x}" y2="${toPos.y}" stroke="#95a5a6" stroke-width="2" opacity="0.6"/>`;
            });
        }
    });

    // Now draw teams on top of everything
    products.forEach((product, index) => {
        const laneX = startX + index * (PRODUCT_LANE_WIDTH + PRODUCT_LANE_PADDING);

        // Teams in lane
        product.teams.forEach((team, teamIndex) => {
            const teamX = laneX + 20;
            const teamY = startY + PRODUCT_HEADER_HEIGHT + 20 + teamIndex * (TEAM_CARD_HEIGHT + TEAM_CARD_SPACING);
            const teamColor = teamColorMap[team.team_type] || '#666';

            // Team card
            elements += `<rect x="${teamX}" y="${teamY}" width="${PRODUCT_LANE_WIDTH - 40}" height="${TEAM_CARD_HEIGHT}" fill="${teamColor}" rx="0" ry="0"/>\n`;
            elements += `<rect x="${teamX}" y="${teamY}" width="${PRODUCT_LANE_WIDTH - 40}" height="${TEAM_CARD_HEIGHT}" fill="none" stroke="${darkenColor(teamColor, 0.7)}" stroke-width="2" rx="0" ry="0"/>\n`;
            elements += `<text x="${teamX + (PRODUCT_LANE_WIDTH - 40) / 2}" y="${teamY + TEAM_CARD_HEIGHT / 2 + 5}" class="team-text" font-size="11" fill="#000">${escapeXml(team.name)}</text>\n`;
        });
    });

    // Shared teams (reuse already calculated teamStartX and teamY)
    sharedTeams.forEach((team, index) => {
        const teamX = teamStartX + index * (SHARED_TEAM_WIDTH + SHARED_TEAM_SPACING);
        const teamColor = teamColorMap[team.team_type] || '#666';

        elements += `<rect x="${teamX}" y="${teamY}" width="${SHARED_TEAM_WIDTH}" height="60" fill="${teamColor}" rx="0" ry="0"/>\n`;
        elements += `<rect x="${teamX}" y="${teamY}" width="${SHARED_TEAM_WIDTH}" height="60" fill="none" stroke="${darkenColor(teamColor, 0.7)}" stroke-width="2" rx="0" ry="0"/>\n`;
        elements += `<text x="${teamX + SHARED_TEAM_WIDTH / 2}" y="${teamY + 35}" class="team-text" font-size="11" fill="#000">${escapeXml(team.name)}</text>\n`;
    });

    return elements;
}

function generateTTVisionSVG(teams, teamColorMap, showInteractionModes) {
    let elements = '';

    // Draw value stream groupings first (as background)
    const valueStreamGroupings = getValueStreamGroupings(teams);
    valueStreamGroupings.forEach(grouping => {
        if (grouping.name !== '(Ungrouped)') {
            const bounds = grouping.bounds;
            elements += drawSVGGrouping(
                grouping.name,
                bounds.x,
                bounds.y,
                bounds.width,
                bounds.height,
                'rgba(255, 245, 215, 0.4)', // Light yellow/orange
                '#FFD966' // Border color
            );
        }
    });

    // Draw platform groupings
    const platformGroupings = getPlatformGroupings(teams);
    platformGroupings.forEach(grouping => {
        const bounds = grouping.bounds;
        elements += drawSVGGrouping(
            grouping.name,
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height,
            'rgba(126, 200, 227, 0.15)', // Very light blue
            '#7EC8E3' // Border color
        );
    });

    // Draw interaction modes (if enabled)
    if (showInteractionModes) {
        teams.forEach(team => {
            if (team.interaction_modes) {
                Object.entries(team.interaction_modes).forEach(([targetName, mode]) => {
                    const targetTeam = teams.find(t => t.name === targetName);
                    if (targetTeam) {
                        const color = getInteractionColorForSVG(mode);
                        const dashArray = getInteractionDashForSVG(mode);
                        const strokeWidth = getInteractionWidthForSVG(mode);
                        // Use dynamic team width and height for center calculation
                        const fromWidth = getTeamBoxWidth(team, 'tt');
                        const fromHeight = getTeamBoxHeight(team, 'tt');
                        const toWidth = getTeamBoxWidth(targetTeam, 'tt');
                        const toHeight = getTeamBoxHeight(targetTeam, 'tt');
                        const fromX = team.position.x + fromWidth / 2;
                        const fromY = team.position.y + fromHeight / 2;
                        const toX = targetTeam.position.x + toWidth / 2;
                        const toY = targetTeam.position.y + toHeight / 2;
                        elements += `<line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" class="connection-line" stroke="${color}" stroke-dasharray="${dashArray}" stroke-width="${strokeWidth}"/>`;
                    }
                });
            }
        });
    }
    // Draw teams
    teams.forEach(team => {
        const color = teamColorMap[team.team_type] || '#95a5a6';
        const teamWidth = getTeamBoxWidth(team, 'tt');
        const teamHeight = getTeamBoxHeight(team, 'tt');
        const textColor = '#222222'; // Dark gray for readability
        elements += drawSVGBox(team.name, team.position.x, team.position.y, teamWidth, teamHeight, color, textColor, false, team.team_type, 'tt');
    });
    return elements;
}

function drawSVGGrouping(label, x, y, width, height, fillColor, borderColor) {
    const rx = 15; // Rounded corners
    const labelHeight = 30;
    const labelY = y + labelHeight / 2;

    return `
  <rect x="${x}" y="${y}" width="${width}" height="${height}" 
        fill="${fillColor}" stroke="${borderColor}" stroke-width="2" rx="${rx}" ry="${rx}"/>
  <text x="${x + width / 2}" y="${labelY}" 
        font-family="sans-serif" font-size="16" font-weight="bold" 
        fill="${borderColor}" text-anchor="middle" dominant-baseline="middle">${label}</text>
`;
}
function drawSVGBox(text, x, y, width, height, bgColor, textColor, isBold, teamType = null, currentView = 'current') {
    const fontSize = isBold ? 18 : 16; // Font sizes to match grouping label proportions (16px grouping labels)
    const fontWeight = isBold ? 'bold' : 'normal';
    const borderColor = darkenColor(bgColor, LAYOUT.BORDER_COLOR_DARKEN_FACTOR);

    // Use shape-specific drawing in TT Design view
    if (currentView === 'tt') {
        if (teamType === 'enabling') {
            return drawSVGEnablingTeam(text, x, y, width, height, bgColor, textColor, fontSize, fontWeight, borderColor);
        }
        if (teamType === 'complicated-subsystem') {
            return drawSVGComplicatedSubsystem(text, x, y, width, height, bgColor, textColor, fontSize, fontWeight, borderColor);
        }
        if (teamType === 'undefined') {
            return drawSVGUndefinedTeam(text, x, y, width, height, bgColor, textColor, fontSize, fontWeight);
        }
    }

    // Default: rounded rectangle
    return drawSVGDefaultBox(text, x, y, width, height, bgColor, textColor, fontSize, fontWeight, borderColor, currentView);
}

/**
 * Draw default team box (rounded corners in TT Design, sharp corners in Pre-TT view)
 */
function drawSVGDefaultBox(text, x, y, width, height, bgColor, textColor, fontSize, fontWeight, borderColor, currentView = 'current') {
    // Wrap text
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    const maxChars = Math.floor(width / (fontSize * 0.6));
    words.forEach(word => {
        if ((currentLine + word).length <= maxChars) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            if (currentLine)
                lines.push(currentLine);
            currentLine = word;
        }
    });
    if (currentLine)
        lines.push(currentLine);

    // Rounded corners for TT Design view (stream-aligned, platform teams)
    // Sharp corners for Pre-TT view
    const rx = currentView === 'tt' ? '8' : '0';

    let box = `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${bgColor}" stroke="${borderColor}" stroke-width="2" class="team-box"/>`;
    // Add text lines
    const lineHeight = 14;
    const startY = y + height / 2 - (lines.length - 1) * lineHeight / 2;
    lines.forEach((line, i) => {
        box += `
    <text x="${x + width / 2}" y="${startY + i * lineHeight}" fill="${textColor}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="middle" dominant-baseline="middle">${escapeXml(line)}</text>`;
    });
    box += '\n  </g>';
    return box;
}

/**
 * Draw undefined team with dashed border
 */
function drawSVGUndefinedTeam(text, x, y, width, height, bgColor, textColor, fontSize, fontWeight) {
    // Wrap text
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    const maxChars = Math.floor(width / (fontSize * 0.5));
    words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        if (testLine.length > maxChars && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });
    if (currentLine) lines.push(currentLine);

    let box = `
  <g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="${bgColor}" stroke="#666666" stroke-width="2" stroke-dasharray="8,4" />`;

    // Render text lines
    const lineHeight = 14;
    const startY = y + height / 2 - (lines.length - 1) * lineHeight / 2;
    lines.forEach((line, i) => {
        box += `
    <text x="${x + width / 2}" y="${startY + i * lineHeight}" fill="${textColor}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="middle" dominant-baseline="middle">${escapeXml(line)}</text>`;
    });
    box += '\n  </g>';
    return box;
}

/**
 * Draw enabling team as vertical rounded rectangle
 */
function drawSVGEnablingTeam(text, x, y, width, height, bgColor, textColor, fontSize, fontWeight, borderColor) {
    const rx = 14; // Larger radius for enabling teams

    // Wrap text to fit within height (which becomes width when rotated)
    // Leave some padding (20px total = 10px on each side)
    const effectiveWidth = height - 20;
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    const maxChars = Math.floor(effectiveWidth / (fontSize * 0.5));

    words.forEach(word => {
        if ((currentLine + word).length <= maxChars) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    });
    if (currentLine) lines.push(currentLine);

    let box = `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${bgColor}" stroke="${borderColor}" stroke-width="2" class="team-box"/>`;

    // Add rotated text lines (vertical orientation)
    // Center of rotation: x + width/2, y + height/2
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const lineHeight = 16;

    lines.forEach((line, i) => {
        const yOffset = (lines.length - 1) * 8 - i * lineHeight;
        box += `
    <text x="${centerX}" y="${centerY + yOffset}" fill="${textColor}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90 ${centerX} ${centerY})">${escapeXml(line)}</text>`;
    });

    box += '\n  </g>';
    return box;
}

/**
 * Draw complicated-subsystem team as octagon
 */
function drawSVGComplicatedSubsystem(text, x, y, width, height, bgColor, textColor, fontSize, fontWeight, borderColor) {
    const cornerSize = width * 0.167;

    // Create octagon path
    const path = `M ${x + cornerSize} ${y} ` +
                 `L ${x + width - cornerSize} ${y} ` +
                 `L ${x + width} ${y + cornerSize} ` +
                 `L ${x + width} ${y + height - cornerSize} ` +
                 `L ${x + width - cornerSize} ${y + height} ` +
                 `L ${x + cornerSize} ${y + height} ` +
                 `L ${x} ${y + height - cornerSize} ` +
                 `L ${x} ${y + cornerSize} Z`;

    // Wrap text
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    const maxChars = Math.floor(width / (fontSize * 0.6));
    words.forEach(word => {
        if ((currentLine + word).length <= maxChars) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            if (currentLine)
                lines.push(currentLine);
            currentLine = word;
        }
    });
    if (currentLine)
        lines.push(currentLine);

    let box = `<g>
    <path d="${path}" fill="${bgColor}" stroke="${borderColor}" stroke-width="2" class="team-box"/>`;
    // Add text lines
    const lineHeight = 14;
    const startY = y + height / 2 - (lines.length - 1) * lineHeight / 2;
    lines.forEach((line, i) => {
        box += `
    <text x="${x + width / 2}" y="${startY + i * lineHeight}" fill="${textColor}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="middle" dominant-baseline="middle">${escapeXml(line)}</text>`;
    });
    box += '\n  </g>';
    return box;
}
function drawSVGLine(x1, y1, x2, y2) {
    const midY = (y1 + y2) / 2;
    return `  <path d="M ${x1},${y1} L ${x1},${midY} L ${x2},${midY} L ${x2},${y2}" class="hierarchy-line"/>\n`;
}
// Helper functions for interaction mode styling in SVG
function getInteractionColorForSVG(mode) {
    const colors = {
        'collaboration': '#7a5fa6',      // Purple
        'x-as-a-service': '#222222',     // Near-black
        'facilitating': '#6fa98c'        // Green
    };
    return colors[mode] || '#95a5a6';
}

function getInteractionDashForSVG(mode) {
    const dashArrays = {
        'collaboration': 'none',
        'x-as-a-service': '10,5',
        'facilitating': '5,5'
    };
    return dashArrays[mode] || 'none';
}

function getInteractionWidthForSVG(mode) {
    const widths = {
        'collaboration': '2',         // Thick line for high-touch interaction
        'x-as-a-service': '1',        // Medium line for standard operational
        'facilitating': '0.5'         // Thin line for lightweight coaching
    };
    return widths[mode] || '1';
}
function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
function downloadSVG(svgContent, filename) {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Helper function to wrap text into multiple lines for SVG
function wrapTextForSVG(text, maxWidth, fontSize = 11) {
    // Approximate character width (adjust based on font)
    const charWidth = fontSize * 0.6;
    const maxChars = Math.floor(maxWidth / charWidth);

    if (text.length <= maxChars) {
        return [text];
    }

    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxChars) {
            currentLine = testLine;
        } else {
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

function generateBusinessStreamsSVG(businessStreamsData, teamColorMap) {
    let elements = [];
    if (!businessStreamsData || !businessStreamsData.business_streams) return elements;

    const VS_WIDTH = 600;
    const VS_PADDING = 20;
    const VS_HEADER_HEIGHT = 50;
    const PRODUCT_SECTION_HEIGHT = 150;
    const PRODUCT_PADDING = 10;
    const TEAM_WIDTH = 120;
    const TEAM_HEIGHT = 50;
    const TEAM_SPACING = 10;
    const VS_SPACING = 30;

    const business_streams = Object.values(businessStreamsData.business_streams);
    const startX = 50;
    let currentY = 100;

    // Track team positions for drawing connections later
    const teamPositions = new Map();

    // Title
    elements += `<text x="${startX}" y="${currentY - 40}" style="font-family: sans-serif; font-size: 24px; font-weight: bold; fill: #333;" text-anchor="start">Business Streams View</text>\n`;

    // Calculate right column X position
    const rightColumnX = startX + VS_WIDTH + VS_SPACING;
    let rightColumnY = currentY;

    // Draw each business stream (left column)
    business_streams.forEach(bsData => {
        const products = Object.entries(bsData.products);
        const vsHeight = VS_HEADER_HEIGHT + (products.length * (PRODUCT_SECTION_HEIGHT + PRODUCT_PADDING)) + VS_PADDING;

        // Business stream container
        const vsColor = bsData.color || '#3498db';
        elements += `<rect x="${startX}" y="${currentY}" width="${VS_WIDTH}" height="${vsHeight}" fill="${vsColor}20" stroke="${vsColor}" stroke-width="3" rx="0" ry="0"/>\n`;

        // Header
        elements += `<rect x="${startX}" y="${currentY}" width="${VS_WIDTH}" height="${VS_HEADER_HEIGHT}" fill="${vsColor}40" rx="0" ry="0"/>\n`;
        const teamCount = Object.values(bsData.products).reduce((sum, teams) => sum + teams.length, 0);
        elements += `<text x="${startX + 20}" y="${currentY + 30}" style="font-family: sans-serif; font-size: 18px; font-weight: bold; fill: #1a1a1a;" text-anchor="start">${escapeXml(bsData.name)}</text>\n`;
        elements += `<text x="${startX + VS_WIDTH - 100}" y="${currentY + 30}" style="font-family: sans-serif; font-size: 13px; fill: #666;" text-anchor="start">${teamCount} team${teamCount !== 1 ? 's' : ''}</text>\n`;

        // Draw product sections
        let productY = currentY + VS_HEADER_HEIGHT + VS_PADDING;
        products.forEach(([productName, teams]) => {
            if (productName === '_no_product') return;

            // Product section background
            elements += `<rect x="${startX + VS_PADDING}" y="${productY}" width="${VS_WIDTH - (VS_PADDING * 2)}" height="${PRODUCT_SECTION_HEIGHT}" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1" rx="0" ry="0"/>\n`;

            // Product header
            elements += `<text x="${startX + VS_PADDING + 10}" y="${productY + 22}" style="font-family: sans-serif; font-size: 14px; font-weight: bold; fill: #495057;" text-anchor="start">${escapeXml(productName)}</text>\n`;

            // Teams in product
            let teamX = startX + VS_PADDING + 10;
            let teamY = productY + 40;
            teams.forEach((team, _index) => {
                // Wrap check BEFORE positioning
                if (teamX + TEAM_WIDTH > startX + VS_WIDTH - VS_PADDING - 10 && teamX > startX + VS_PADDING + 10) {
                    teamX = startX + VS_PADDING + 10;
                    teamY += TEAM_HEIGHT + TEAM_SPACING;
                }

                const teamColor = teamColorMap[team.team_type] || '#666';
                elements += `<rect x="${teamX}" y="${teamY}" width="${TEAM_WIDTH}" height="${TEAM_HEIGHT}" fill="${teamColor}" stroke="${darkenColor(teamColor, 0.7)}" stroke-width="2" rx="0" ry="0"/>\n`;

                // Wrap text if too long
                const lines = wrapTextForSVG(team.name, TEAM_WIDTH - 10, 11);
                const lineHeight = 12;
                const totalHeight = lines.length * lineHeight;
                const startY = teamY + (TEAM_HEIGHT / 2) - (totalHeight / 2) + lineHeight * 0.8;

                elements += `<text x="${teamX + TEAM_WIDTH / 2}" y="${startY}" class="team-text" text-anchor="middle" font-size="11" fill="#000">`;
                lines.forEach((line, i) => {
                    if (i === 0) {
                        elements += `${escapeXml(line)}`;
                    } else {
                        elements += `<tspan x="${teamX + TEAM_WIDTH / 2}" dy="${lineHeight}">${escapeXml(line)}</tspan>`;
                    }
                });
                elements += '</text>\n';

                // Store team position and object for connection drawing
                teamPositions.set(team.name, { x: teamX, y: teamY, width: TEAM_WIDTH, height: TEAM_HEIGHT, team });

                teamX += TEAM_WIDTH + TEAM_SPACING;
            });

            productY += PRODUCT_SECTION_HEIGHT + PRODUCT_PADDING;
        });

        currentY += vsHeight + VS_SPACING;
    });

    // Draw products without business stream (right column)
    if (businessStreamsData.products_without_business_stream && Object.keys(businessStreamsData.products_without_business_stream).length > 0) {
        const ungroupedProductsHeight = Object.keys(businessStreamsData.products_without_business_stream).length * (PRODUCT_SECTION_HEIGHT + PRODUCT_PADDING) + 70;

        // Container
        elements += `<rect x="${rightColumnX}" y="${rightColumnY}" width="${VS_WIDTH}" height="${ungroupedProductsHeight}" fill="#fff3cd20" stroke="#ffc107" stroke-width="2" stroke-dasharray="5,5" rx="0" ry="0"/>\n`;

        // Header
        elements += `<text x="${rightColumnX + 20}" y="${rightColumnY + 30}" style="font-family: sans-serif; font-size: 16px; font-weight: bold; fill: #856404;" text-anchor="start">⚠ Products not assigned to a business stream</text>\n`;

        let productY = rightColumnY + 70;
        Object.entries(businessStreamsData.products_without_business_stream).forEach(([productName, teams]) => {
            const productHeight = PRODUCT_SECTION_HEIGHT;

            // Product section
            elements += `<rect x="${rightColumnX + VS_PADDING}" y="${productY}" width="${VS_WIDTH - (VS_PADDING * 2)}" height="${productHeight}" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1" rx="0" ry="0"/>\n`;
            elements += `<text x="${rightColumnX + VS_PADDING + 10}" y="${productY + 22}" style="font-family: sans-serif; font-size: 14px; font-weight: bold; fill: #495057;" text-anchor="start">${escapeXml(productName)}</text>\n`;

            // Teams
            let teamX = rightColumnX + VS_PADDING + 10;
            let teamY = productY + 40;
            teams.forEach((team) => {
                // Wrap check BEFORE positioning
                if (teamX + TEAM_WIDTH > rightColumnX + VS_WIDTH - VS_PADDING - 10 && teamX > rightColumnX + VS_PADDING + 10) {
                    teamX = rightColumnX + VS_PADDING + 10;
                    teamY += TEAM_HEIGHT + TEAM_SPACING;
                }

                const teamColor = teamColorMap[team.team_type] || '#666';
                elements += `<rect x="${teamX}" y="${teamY}" width="${TEAM_WIDTH}" height="${TEAM_HEIGHT}" fill="${teamColor}" stroke="${darkenColor(teamColor, 0.7)}" stroke-width="2" rx="0" ry="0"/>\n`;

                // Wrap text if too long
                const lines = wrapTextForSVG(team.name, TEAM_WIDTH - 10, 11);
                const lineHeight = 12;
                const totalHeight = lines.length * lineHeight;
                const startY = teamY + (TEAM_HEIGHT / 2) - (totalHeight / 2) + lineHeight * 0.8;

                elements += `<text x="${teamX + TEAM_WIDTH / 2}" y="${startY}" class="team-text" text-anchor="middle" font-size="11" fill="#000">`;
                lines.forEach((line, i) => {
                    if (i === 0) {
                        elements += `${escapeXml(line)}`;
                    } else {
                        elements += `<tspan x="${teamX + TEAM_WIDTH / 2}" dy="${lineHeight}">${escapeXml(line)}</tspan>`;
                    }
                });
                elements += '</text>\n';

                // Store team position and object for connection drawing
                teamPositions.set(team.name, { x: teamX, y: teamY, width: TEAM_WIDTH, height: TEAM_HEIGHT, team });

                teamX += TEAM_WIDTH + TEAM_SPACING;
            });

            productY += productHeight + PRODUCT_PADDING;
        });

        rightColumnY += ungroupedProductsHeight + VS_SPACING;
    }

    // Draw ungrouped teams (right column, below ungrouped products)
    if (businessStreamsData.ungrouped_teams && businessStreamsData.ungrouped_teams.length > 0) {
        elements += `<text x="${rightColumnX}" y="${rightColumnY + 20}" style="font-family: sans-serif; font-size: 14px; font-weight: bold; fill: #6c757d;" text-anchor="start">⚠ Teams Without Product or Business Stream</text>\n`;

        let teamX = rightColumnX;
        let teamY = rightColumnY + 40;
        businessStreamsData.ungrouped_teams.forEach((team) => {
            // Wrap check BEFORE positioning
            if (teamX + TEAM_WIDTH > rightColumnX + VS_WIDTH && teamX > rightColumnX) {
                teamX = rightColumnX;
                teamY += TEAM_HEIGHT + TEAM_SPACING;
            }

            const teamColor = teamColorMap[team.team_type] || '#666';
            elements += `<rect x="${teamX}" y="${teamY}" width="${TEAM_WIDTH}" height="${TEAM_HEIGHT}" fill="${teamColor}" stroke="${darkenColor(teamColor, 0.7)}" stroke-width="2" rx="0" ry="0"/>\n`;

            // Wrap text if too long
            const lines = wrapTextForSVG(team.name, TEAM_WIDTH - 10, 11);
            const lineHeight = 12;
            const totalHeight = lines.length * lineHeight;
            const startY = teamY + (TEAM_HEIGHT / 2) - (totalHeight / 2) + lineHeight * 0.8;

            elements += `<text x="${teamX + TEAM_WIDTH / 2}" y="${startY}" class="team-text" text-anchor="middle" font-size="11" fill="#000">`;
            lines.forEach((line, i) => {
                if (i === 0) {
                    elements += `${escapeXml(line)}`;
                } else {
                    elements += `<tspan x="${teamX + TEAM_WIDTH / 2}" dy="${lineHeight}">${escapeXml(line)}</tspan>`;
                }
            });
            elements += '</text>\n';

            // Store team position and object for connection drawing
            teamPositions.set(team.name, { x: teamX, y: teamY, width: TEAM_WIDTH, height: TEAM_HEIGHT, team });

            teamX += TEAM_WIDTH + TEAM_SPACING;
        });
    }

    // Draw connection lines between teams (based on dependencies)
    const connectionLines = [];
    teamPositions.forEach(({ team, x: fromX, y: fromY, width, height }) => {
        if (team.dependencies && Array.isArray(team.dependencies)) {
            team.dependencies.forEach(depName => {
                const toPos = teamPositions.get(depName);
                if (toPos) {
                    // Calculate center points
                    const fromCenterX = fromX + width / 2;
                    const fromCenterY = fromY + height / 2;
                    const toCenterX = toPos.x + toPos.width / 2;
                    const toCenterY = toPos.y + toPos.height / 2;

                    // Draw line with arrow
                    connectionLines.push(`<line x1="${fromCenterX}" y1="${fromCenterY}" x2="${toCenterX}" y2="${toCenterY}" stroke="#666666" stroke-width="2" opacity="0.5" marker-end="url(#arrowhead)"/>\n`);
                }
            });
        }
    });

    // Add arrow marker definition if we have connections
    if (connectionLines.length > 0) {
        elements = '<defs><marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="#666666" /></marker></defs>\n' + elements;
        elements += connectionLines.join('');
    }

    return elements;
}

