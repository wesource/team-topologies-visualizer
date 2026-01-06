import { LAYOUT } from './constants.js';
import { darkenColor } from './renderer-common.js';

export function drawCurrentStateView(ctx, organizationHierarchy, teams, wrapText) {
    if (!organizationHierarchy)
        return;
    const startX = 500;
    const startY = LAYOUT.COMPANY_Y;
    const levelHeight = LAYOUT.LEVEL_HEIGHT;
    const boxWidth = LAYOUT.DEPT_BOX_WIDTH;
    const boxHeight = LAYOUT.DEPT_BOX_HEIGHT;
    // Draw company leadership
    const company = organizationHierarchy.company;
    drawHierarchyBox(ctx, company.name, startX + 400, startY, boxWidth + 100, boxHeight, '#E8E8E8', 'black', true, wrapText);
    // Draw departments
    const deptSpacing = LAYOUT.DEPT_SPACING;
    const deptStartX = startX + 50;
    company.children.forEach((dept, index) => {
        const deptX = deptStartX + index * deptSpacing;
        const deptY = startY + levelHeight;
        // Draw line from company to department
        drawHierarchyLine(ctx, startX + 400 + (boxWidth + 100) / 2, startY + boxHeight, deptX + boxWidth / 2, deptY);
        // Draw department box
        drawHierarchyBox(ctx, dept.name, deptX, deptY, boxWidth, boxHeight, '#E8E8E8', 'black', false, wrapText);
        // If it's engineering, draw line managers directly under department (no VP box)
        if (dept.id === 'engineering-dept' && dept.line_managers) {
            // Draw line managers directly under department
            const lmCount = dept.line_managers.length;
            const lmSpacing = LAYOUT.LINE_MANAGER_SPACING;
            const lmStartX = deptX - ((lmCount - 1) * lmSpacing) / 2;
            const lmY = deptY + levelHeight;
            dept.line_managers.forEach((lm, lmIndex) => {
                const lmX = lmStartX + lmIndex * lmSpacing;
                // Draw line from department to line manager
                drawHierarchyLine(ctx, deptX + boxWidth / 2, deptY + boxHeight, lmX + boxWidth / 2, lmY);
                // Draw line manager box
                drawHierarchyBox(ctx, lm.name, lmX, lmY, boxWidth, boxHeight - 10, '#A0A0A0', 'white', false, wrapText);
                // Draw teams under line manager with org-chart style
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
                    drawHierarchyLine(ctx, verticalLineX, verticalLineStartY, verticalLineX, lowestTeamY);

                    // Draw horizontal connectors to each team
                    teamsUnderManager.forEach(team => {
                        const teamMidLeftY = team.position.y + 40;
                        drawHierarchyLine(ctx, verticalLineX, teamMidLeftY, team.position.x, teamMidLeftY);
                    });
                }
            });
        }
        // If it's customer solutions, draw regions directly under department as sub-levels
        if (dept.id === 'customer-solutions-dept' && dept.regions) {
            // Draw regions directly under department as sub-levels
            const regionCount = dept.regions.length;
            const regionSpacing = LAYOUT.LINE_MANAGER_SPACING;
            const regionStartX = deptX - ((regionCount - 1) * regionSpacing) / 2;
            const regionY = deptY + levelHeight;
            dept.regions.forEach((region, regionIndex) => {
                const regionX = regionStartX + regionIndex * regionSpacing;
                // Draw line from department to region
                drawHierarchyLine(ctx, deptX + boxWidth / 2, deptY + boxHeight, regionX + boxWidth / 2, regionY);
                // Draw region box as sub-level
                drawHierarchyBox(ctx, region.name, regionX, regionY, boxWidth, boxHeight - 10, '#A0A0A0', 'white', false, wrapText);
                // Draw teams under region with org-chart style
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
                        drawHierarchyLine(ctx, verticalLineX, verticalLineStartY, verticalLineX, lowestTeamY);

                        // Draw horizontal connectors to each team
                        teamsUnderRegion.forEach(team => {
                            const teamMidLeftY = team.position.y + 40;
                            drawHierarchyLine(ctx, verticalLineX, teamMidLeftY, team.position.x, teamMidLeftY);
                        });
                    }
                }
            });
        }
    });
}
function drawHierarchyBox(ctx, text, x, y, width, height, bgColor, textColor, isLeadership, wrapText) {
    const radius = 5;
    // Draw box
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = darkenColor(bgColor, LAYOUT.BORDER_COLOR_DARKEN_FACTOR);
    ctx.lineWidth = LAYOUT.BORDER_WIDTH_NORMAL;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
    ctx.stroke();
    // Draw text (handle undefined or non-string text)
    if (!text || typeof text !== 'string') {
        console.warn('drawHierarchyBox: skipping text render - invalid text:', text, 'type:', typeof text);
        return;
    }
    ctx.fillStyle = textColor;
    ctx.font = isLeadership ? 'bold 14px sans-serif' : '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = wrapText(text, width - 20);
    lines.forEach((line, i) => {
        ctx.fillText(line, x + width / 2, y + height / 2 - (lines.length - 1) * 7 + i * 14);
    });
}
function drawHierarchyLine(ctx, x1, y1, x2, y2) {
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    // Draw a vertical then horizontal line for cleaner org chart look
    const midY = (y1 + y2) / 2;
    ctx.lineTo(x1, midY);
    ctx.lineTo(x2, midY);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
