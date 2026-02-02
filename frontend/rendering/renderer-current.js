import { LAYOUT } from '../core/constants.js';
import { darkenColor } from './color-utils.js';

export function drawCurrentStateView(ctx, organizationHierarchy, teams, wrapText) {
    if (!organizationHierarchy)
        return;
    const startX = 150; // Minimal left margin to maximize canvas usage
    const startY = LAYOUT.COMPANY_Y;
    const levelHeight = LAYOUT.LEVEL_HEIGHT;
    const boxWidth = LAYOUT.DEPT_BOX_WIDTH;
    const boxHeight = LAYOUT.DEPT_BOX_HEIGHT;

    // Draw title
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Hierarchy View', startX + 50, startY - 40);

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
        
        // Generic sub-level handling: line_managers, regions, divisions, etc.
        // Find any sub-level property that exists on this department
        const subLevels = dept.line_managers || dept.regions || [];
        
        if (subLevels.length > 0) {
            // Draw sub-levels (line managers, regions, etc.) directly under department
            const subLevelCount = subLevels.length;
            const subLevelSpacing = LAYOUT.LINE_MANAGER_SPACING;
            const subLevelStartX = deptX - ((subLevelCount - 1) * subLevelSpacing) / 2;
            const subLevelY = deptY + levelHeight;
            
            subLevels.forEach((subLevel, subLevelIndex) => {
                const subLevelX = subLevelStartX + subLevelIndex * subLevelSpacing;
                
                // Draw line from department to sub-level
                drawHierarchyLine(ctx, deptX + boxWidth / 2, deptY + boxHeight, subLevelX + boxWidth / 2, subLevelY);
                
                // Draw sub-level box
                drawHierarchyBox(ctx, subLevel.name, subLevelX, subLevelY, boxWidth, boxHeight - 10, '#A0A0A0', 'white', false, wrapText);
                
                // Draw teams under sub-level with org-chart style
                const teamsUnderSubLevel = (subLevel.teams || [])
                    .map(teamName => teams.find(t => t.name === teamName))
                    .filter(t => t !== undefined);

                if (teamsUnderSubLevel.length > 0) {
                    // Vertical line position at 1/5 from left of sub-level box
                    const verticalLineX = subLevelX + (boxWidth * LAYOUT.ORG_CHART_VERTICAL_LINE_OFFSET);
                    const verticalLineStartY = subLevelY + boxHeight - 10;

                    // Find the lowest team position for vertical line
                    const lowestTeamY = Math.max(...teamsUnderSubLevel.map(t => t.position.y + 40));

                    // Draw main vertical line
                    drawHierarchyLine(ctx, verticalLineX, verticalLineStartY, verticalLineX, lowestTeamY);

                    // Draw horizontal connectors to each team
                    teamsUnderSubLevel.forEach(team => {
                        const teamMidLeftY = team.position.y + 40;
                        drawHierarchyLine(ctx, verticalLineX, teamMidLeftY, team.position.x, teamMidLeftY);
                    });
                }
            });
        }
    });
    
    // Draw teams without organizational context (not under any line_manager/region)
    // These teams will be drawn at their canvas positions without connecting lines
    if (organizationHierarchy && organizationHierarchy.company && organizationHierarchy.company.children) {
        const teamsWithOrgContext = new Set();
        organizationHierarchy.company.children.forEach(dept => {
            const subLevels = dept.line_managers || dept.regions || [];
            subLevels.forEach(subLevel => {
                (subLevel.teams || []).forEach(teamName => teamsWithOrgContext.add(teamName));
            });
        });
        
        // Note: Teams without org context are drawn by the normal team rendering
        // in the main canvas rendering loop, not here in the hierarchy view
    }
}
function drawHierarchyBox(ctx, text, x, y, width, height, bgColor, textColor, isLeadership, wrapText) {
    // Draw box with sharp corners (non-rounded)
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = darkenColor(bgColor, LAYOUT.BORDER_COLOR_DARKEN_FACTOR);
    ctx.lineWidth = 2; // Thin border
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

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
