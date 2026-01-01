export function drawCurrentStateView(ctx, organizationHierarchy, teams, wrapText) {
    if (!organizationHierarchy)
        return;
    const startX = 500;
    const startY = 50;
    const levelHeight = 120;
    const boxWidth = 200;
    const boxHeight = 60;
    // Draw company leadership
    const company = organizationHierarchy.company;
    drawHierarchyBox(ctx, company.name, startX + 400, startY, boxWidth + 100, boxHeight, '#34495e', 'white', true, wrapText);
    // Draw departments
    const deptSpacing = 250;
    const deptStartX = startX + 50;
    company.children.forEach((dept, index) => {
        const deptX = deptStartX + index * deptSpacing;
        const deptY = startY + levelHeight;
        // Draw line from company to department
        drawHierarchyLine(ctx, startX + 400 + (boxWidth + 100) / 2, startY + boxHeight, deptX + boxWidth / 2, deptY);
        // Draw department box
        drawHierarchyBox(ctx, dept.name, deptX, deptY, boxWidth, boxHeight, '#2c3e50', 'white', false, wrapText);
        // If it's engineering, draw line managers directly under department (no VP box)
        if (dept.id === 'engineering-dept' && dept.line_managers) {
            // Draw line managers directly under department
            const lmCount = dept.line_managers.length;
            const lmSpacing = 220;
            const lmStartX = deptX - ((lmCount - 1) * lmSpacing) / 2;
            const lmY = deptY + levelHeight;
            dept.line_managers.forEach((lm, lmIndex) => {
                const lmX = lmStartX + lmIndex * lmSpacing;
                // Draw line from department to line manager
                drawHierarchyLine(ctx, deptX + boxWidth / 2, deptY + boxHeight, lmX + boxWidth / 2, lmY);
                // Draw line manager box
                drawHierarchyBox(ctx, lm.name, lmX, lmY, boxWidth, boxHeight - 10, '#27ae60', 'white', false, wrapText);
                // Draw teams under line manager
                lm.teams.forEach((teamName, teamIndex) => {
                    const team = teams.find(t => t.name === teamName);
                    if (team) {
                        const teamY = lmY + levelHeight;
                        // Update team position to align under line manager
                        // Only update if team hasn't been manually positioned (very far from default)
                        const defaultY = 100 + Math.floor(teams.indexOf(team) / 3) * 150;
                        if (Math.abs(team.position.y - defaultY) < 200) {
                            team.position.x = lmX + (teamIndex * 20);
                            team.position.y = teamY;
                        }
                        // Draw line from line manager to team
                        drawHierarchyLine(ctx, lmX + boxWidth / 2, lmY + boxHeight - 10, team.position.x + 90, team.position.y);
                    }
                });
            });
        }
        // If it's customer solutions, draw regions directly under department as sub-levels
        if (dept.id === 'customer-solutions-dept' && dept.regions) {
            // Draw regions directly under department as sub-levels
            const regionCount = dept.regions.length;
            const regionSpacing = 220;
            const regionStartX = deptX - ((regionCount - 1) * regionSpacing) / 2;
            const regionY = deptY + levelHeight;
            dept.regions.forEach((region, regionIndex) => {
                const regionX = regionStartX + regionIndex * regionSpacing;
                // Draw line from department to region
                drawHierarchyLine(ctx, deptX + boxWidth / 2, deptY + boxHeight, regionX + boxWidth / 2, regionY);
                // Draw region box as sub-level
                drawHierarchyBox(ctx, region.name, regionX, regionY, boxWidth, boxHeight - 10, '#3498db', 'white', false, wrapText);
                // Draw teams under region
                if (region.teams && region.teams.length > 0) {
                    region.teams.forEach((teamName, teamIndex) => {
                        const team = teams.find(t => t.name === teamName);
                        if (team) {
                            const teamY = regionY + levelHeight;
                            // Update team position to align under region
                            const defaultY = 100 + Math.floor(teams.indexOf(team) / 3) * 150;
                            if (Math.abs(team.position.y - defaultY) < 200) {
                                team.position.x = regionX + (teamIndex * 20);
                                team.position.y = teamY;
                            }
                            // Draw line from region to team
                            drawHierarchyLine(ctx, regionX + boxWidth / 2, regionY + boxHeight - 10, team.position.x + 90, team.position.y);
                        }
                    });
                }
            });
        }
    });
}
function drawHierarchyBox(ctx, text, x, y, width, height, bgColor, textColor, isLeadership, wrapText) {
    const radius = 5;
    // Draw box
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
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
