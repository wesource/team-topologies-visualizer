// SVG Export Module - Separated from runtime rendering
// Converts current visualization state to downloadable SVG
export function exportToSVG(state, organizationHierarchy, teams, teamColorMap, currentView) {
    let width = 2000;
    let height = 1500;
    let viewBox = `0 0 ${width} ${height}`;
    // For TT vision, calculate bounding box to fit all teams
    if (currentView === 'tt' && teams.length > 0) {
        const padding = 100;
        const minX = Math.min(...teams.map(t => t.position.x)) - padding;
        const minY = Math.min(...teams.map(t => t.position.y)) - padding;
        const maxX = Math.max(...teams.map(t => t.position.x + 180)) + padding;
        const maxY = Math.max(...teams.map(t => t.position.y + 80)) + padding;
        width = maxX - minX;
        height = maxY - minY;
        viewBox = `${minX} ${minY} ${width} ${height}`;
    }
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}">
  <defs>
    <style>
      .team-box { stroke: #333; stroke-width: 2; }
      .team-text { font-family: sans-serif; font-size: 12px; fill: #000; text-anchor: middle; }
      .team-text-bold { font-family: sans-serif; font-size: 14px; font-weight: bold; fill: #fff; text-anchor: middle; }
      .hierarchy-line { stroke: #7f8c8d; stroke-width: 1.5; fill: none; }
      .connection-line { stroke-width: 2; fill: none; }
    </style>
  </defs>
  <rect x="${currentView === 'tt' && teams.length > 0 ? Math.min(...teams.map(t => t.position.x)) - 100 : 0}" y="${currentView === 'tt' && teams.length > 0 ? Math.min(...teams.map(t => t.position.y)) - 100 : 0}" width="${width}" height="${height}" fill="white"/>
`;
    if (currentView === 'current' && organizationHierarchy) {
        svg += generateCurrentStateSVG(organizationHierarchy, teams, teamColorMap);
    }
    else {
        svg += generateTTVisionSVG(teams, teamColorMap, state.hideConnections);
    }
    svg += '</svg>';
    downloadSVG(svg, `team-topology-${currentView}-${Date.now()}.svg`);
}
function generateCurrentStateSVG(organizationHierarchy, teams, teamColorMap) {
    let elements = '';
    const startX = 500;
    const startY = 50;
    const levelHeight = 120;
    const boxWidth = 200;
    const boxHeight = 60;
    // Draw company leadership
    const company = organizationHierarchy.company;
    elements += drawSVGBox(company.name, startX + 400, startY, boxWidth + 100, boxHeight, '#34495e', 'white', true);
    // Draw departments
    const deptSpacing = 250;
    const deptStartX = startX + 50;
    if (!company.children)
        return elements;
    company.children.forEach((dept, index) => {
        const deptX = deptStartX + index * deptSpacing;
        const deptY = startY + levelHeight;
        // Line from company to department
        elements += drawSVGLine(startX + 400 + (boxWidth + 100) / 2, startY + boxHeight, deptX + boxWidth / 2, deptY);
        // Department box
        elements += drawSVGBox(dept.name, deptX, deptY, boxWidth, boxHeight, '#2c3e50', 'white', false);
        // Engineering department with line managers
        if (dept.id === 'engineering-dept' && dept.line_managers) {
            const lmCount = dept.line_managers.length;
            const lmSpacing = 220;
            const lmStartX = deptX - ((lmCount - 1) * lmSpacing) / 2;
            const lmY = deptY + levelHeight;
            dept.line_managers.forEach((lm, lmIndex) => {
                const lmX = lmStartX + lmIndex * lmSpacing;
                // Line to line manager
                elements += drawSVGLine(deptX + boxWidth / 2, deptY + boxHeight, lmX + boxWidth / 2, lmY);
                // Line manager box
                elements += drawSVGBox(lm.name, lmX, lmY, boxWidth, boxHeight - 10, '#27ae60', 'white', false);
                // Teams under line manager
                lm.teams.forEach((teamName, teamIndex) => {
                    const team = teams.find(t => t.name === teamName);
                    if (team) {
                        const teamX = lmX - 50 + teamIndex * 100;
                        const teamY = lmY + levelHeight - 20;
                        elements += drawSVGLine(lmX + boxWidth / 2, lmY + boxHeight - 10, teamX + 40, teamY);
                        const color = teamColorMap[team.team_type] || '#95a5a6';
                        elements += drawSVGBox(team.name, teamX, teamY, 80, 40, color, 'white', false);
                    }
                });
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
                region.teams.forEach((teamName, teamIndex) => {
                    const team = teams.find(t => t.name === teamName);
                    if (team) {
                        const teamX = regionX - 30 + teamIndex * 80;
                        const teamY = regionY + levelHeight - 30;
                        elements += drawSVGLine(regionX + boxWidth / 2, regionY + boxHeight - 10, teamX + 40, teamY);
                        const color = teamColorMap[team.team_type] || '#95a5a6';
                        elements += drawSVGBox(team.name, teamX, teamY, 80, 40, color, 'white', false);
                    }
                });
            });
        }
    });
    return elements;
}
function generateTTVisionSVG(teams, teamColorMap, hideConnections) {
    let elements = '';
    // Draw connections first (if not hidden)
    if (!hideConnections) {
        teams.forEach(team => {
            if (team.dependencies) {
                team.dependencies.forEach((dep) => {
                    const targetTeam = teams.find(t => t.name === dep.team);
                    if (targetTeam) {
                        const color = getInteractionColor(dep.interaction);
                        // Center points: team width is 180, height is 80
                        const fromX = team.position.x + 90;
                        const fromY = team.position.y + 40;
                        const toX = targetTeam.position.x + 90;
                        const toY = targetTeam.position.y + 40;
                        elements += `<line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" class="connection-line" stroke="${color}" stroke-dasharray="${dep.interaction === 'facilitating' ? '5,5' : 'none'}"/>`;
                    }
                });
            }
        });
    }
    // Draw teams (180x80 to match canvas)
    teams.forEach(team => {
        const color = teamColorMap[team.team_type] || '#95a5a6';
        elements += drawSVGBox(team.name, team.position.x, team.position.y, 180, 80, color, 'white', false);
    });
    return elements;
}
function drawSVGBox(text, x, y, width, height, bgColor, textColor, isBold) {
    const fontSize = isBold ? 14 : 12;
    const fontWeight = isBold ? 'bold' : 'normal';
    // Wrap text
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    const maxChars = Math.floor(width / (fontSize * 0.6));
    words.forEach(word => {
        if ((currentLine + word).length <= maxChars) {
            currentLine += (currentLine ? ' ' : '') + word;
        }
        else {
            if (currentLine)
                lines.push(currentLine);
            currentLine = word;
        }
    });
    if (currentLine)
        lines.push(currentLine);
    let box = `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="5" fill="${bgColor}" class="team-box"/>`;
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
function getInteractionColor(interaction) {
    const colors = {
        'collaboration': '#E74C3C',
        'x-as-a-service': '#3498DB',
        'facilitating': '#F39C12'
    };
    return colors[interaction] || '#95a5a6';
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
